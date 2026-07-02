"use client";

import { useEffect, useImperativeHandle, useRef, type Ref } from "react";
import { DEFAULT_CONFIG, TwoStreamSim } from "../lib/twoStream";

export interface HeroSimHandle {
  /** crossfade into a fresh run with a new seed */
  reset(): void;
  /** freeze/resume the simulation (the last frame stays on screen) */
  setPaused(paused: boolean): void;
}

const YLIM = 12; // velocity axis limits, matches the reference render
const GV = 400; // histogram bins along v
const GX = 600; // histogram bins along x
const DPR_CAP = 2;
const CAP_PER_PARTICLE = 3.2e-5; // tone-mapping cap, scales with count
const MIN_PARTICLES = 60_000; // adaptive floor before other degradations
const KICK_DV = 3.5; // total |Δv| of a click kick
const KICK_SIGMA = 2; // spatial width of the kick window
const KICK_RAMP_FRAMES = 20; // Hann-windowed onset, ~1/3 s at 60fps
const DRAG_DV_PER_FRAME = 0.05; // sustained field strength while dragging

// matplotlib RdBu anchors, red → blue; center replaced with the page
// background so quiet regions blend seamlessly.
const RDBU: [number, number, number][] = [
  [103, 0, 31],
  [178, 24, 43],
  [214, 96, 77],
  [244, 165, 130],
  [253, 219, 199],
  [250, 250, 249],
  [209, 229, 240],
  [146, 197, 222],
  [67, 147, 195],
  [33, 102, 172],
  [5, 48, 97],
];

function buildLut(): Uint8ClampedArray {
  const lut = new Uint8ClampedArray(512 * 3);
  for (let i = 0; i < 512; i++) {
    const u = (i / 511) * (RDBU.length - 1);
    const a = Math.min(u | 0, RDBU.length - 2);
    const f = u - a;
    for (let c = 0; c < 3; c++) {
      lut[i * 3 + c] = RDBU[a][c] * (1 - f) + RDBU[a + 1][c] * f;
    }
  }
  return lut;
}

function boxBlur(src: Float32Array, tmp: Float32Array, w: number, h: number, r: number) {
  const norm = 1 / (2 * r + 1);
  // horizontal pass: src → tmp
  for (let y = 0; y < h; y++) {
    const row = y * w;
    let sum = 0;
    for (let x = -r; x <= r; x++) sum += src[row + Math.min(Math.max(x, 0), w - 1)];
    for (let x = 0; x < w; x++) {
      tmp[row + x] = sum * norm;
      sum += src[row + Math.min(x + r + 1, w - 1)] - src[row + Math.max(x - r, 0)];
    }
  }
  // vertical pass: tmp → src
  for (let x = 0; x < w; x++) {
    let sum = 0;
    for (let y = -r; y <= r; y++) sum += tmp[Math.min(Math.max(y, 0), h - 1) * w + x];
    for (let y = 0; y < h; y++) {
      src[y * w + x] = sum * norm;
      sum += tmp[Math.min(y + r + 1, h - 1) * w + x] - tmp[Math.max(y - r, 0) * w + x];
    }
  }
}

export default function HeroSim({
  onFallback,
  orientation = "portrait",
  particles = DEFAULT_CONFIG.n,
  ref,
}: {
  onFallback?: () => void;
  /** portrait: v horizontal / x vertical (desktop column);
      landscape: x horizontal / v vertical, +v up (mobile band) */
  orientation?: "portrait" | "landscape";
  particles?: number;
  ref?: Ref<HeroSimHandle>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resetRequested = useRef(false);
  const pausedRef = useRef(false);

  useImperativeHandle(ref, () => ({
    reset: () => {
      resetRequested.current = true;
    },
    setPaused: (paused: boolean) => {
      pausedRef.current = paused;
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      onFallback?.();
      return;
    }

    const portrait = orientation === "portrait";
    const W = portrait ? GV : GX;
    const H = portrait ? GX : GV;
    const off = document.createElement("canvas");
    off.width = W;
    off.height = H;
    const octx = off.getContext("2d")!;
    const img = octx.createImageData(W, H);
    img.data.fill(255);

    const sim = new TwoStreamSim({ ...DEFAULT_CONFIG, n: particles });
    let cap = sim.n * CAP_PER_PARTICLE;
    const bins = GV * GX;
    const hist = new Float32Array(bins);
    const tmp = new Float32Array(bins);
    const ema = new Float32Array(bins);
    const lut = buildLut();
    const l = sim.cfg.l;

    let raf = 0;
    let seed = sim.cfg.seed;
    // pointer state: queued Hann-ramped click kicks + current drag position
    const kicks: { x0: number; dv: number; age: number; total: number }[] = [];
    let pointerDown = false;
    let pointerU = 0;
    let pointerX0 = 0;
    let fade = 1;
    let phase: "run" | "fadeout" | "fadein" = "run";
    let slowFrames = 0;
    let frames = 0;
    let stopped = false;
    let halfRate = false;
    let parity = 0;
    let primed = false;

    const sizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      if (w > 0 && h > 0 && (canvas.width !== w || canvas.height !== h)) {
        canvas.width = w;
        canvas.height = h;
      }
    };
    const ro = new ResizeObserver(sizeCanvas);
    ro.observe(canvas);
    sizeCanvas();

    const drawFrame = (stepPhysics: boolean): number => {
      const t0 = performance.now();
      if (stepPhysics) {
        sim.step();
        // pointer kicks are spread over a Hann envelope so they swell in
        // rather than jerking the particles; the per-frame weights sum to 1,
        // so the integrated Δv still equals the requested kick
        for (let i = kicks.length - 1; i >= 0; i--) {
          const k = kicks[i];
          const w = Math.sin((Math.PI * k.age) / k.total) ** 2 * (2 / k.total);
          sim.kick(k.x0, k.dv * w, KICK_SIGMA);
          if (++k.age >= k.total) kicks.splice(i, 1);
        }
        // dragging applies a gentle sustained field at the cursor
        if (pointerDown) sim.kick(pointerX0, pointerU * KICK_DV * DRAG_DV_PER_FRAME, KICK_SIGMA);
      }

      // signed phase-space histogram with bilinear (CIC) deposit:
      // +1 for the +vb beam (blue), −1 red. Bilinear splatting removes the
      // nearest-bin aliasing that a plain histogram shows once upscaled.
      hist.fill(0);
      const { pos, vel } = sim;
      const n = sim.n;
      const half = n >> 1;
      const sx = GV / (2 * YLIM);
      const sy = GX / l;
      for (let i = 0; i < n; i++) {
        const fv = (vel[i] + YLIM) * sx - 0.5;
        let v0 = fv | 0;
        if (fv < 0) v0 -= 1;
        const wv = fv - v0;
        if (v0 < -1 || v0 >= GV) continue;
        const fx = pos[i] * sy - 0.5;
        let x0 = fx | 0;
        if (fx < 0) x0 -= 1;
        const wx = fx - x0;
        // x is periodic; v bins outside the window are skipped
        const xa = x0 < 0 ? GX - 1 : x0;
        const xb = x0 + 1 >= GX ? 0 : x0 + 1;
        const s = i < half ? 1 : -1;
        const rowA = xa * GV;
        const rowB = xb * GV;
        if (v0 >= 0) {
          const w0 = s * (1 - wv);
          hist[rowA + v0] += w0 * (1 - wx);
          hist[rowB + v0] += w0 * wx;
        }
        const v1 = v0 + 1;
        if (v1 < GV) {
          const w1 = s * wv;
          hist[rowA + v1] += w1 * (1 - wx);
          hist[rowB + v1] += w1 * wx;
        }
      }
      boxBlur(hist, tmp, GV, GX, 2);
      if (primed) {
        for (let k = 0; k < bins; k++) ema[k] += (hist[k] - ema[k]) * 0.35;
      } else {
        ema.set(hist);
        primed = true;
      }

      // reset choreography (user-triggered): fade to background, reseed,
      // fade back in
      if (resetRequested.current) {
        resetRequested.current = false;
        if (phase === "run") phase = "fadeout";
      }
      if (phase === "fadeout") {
        fade -= 0.03;
        if (fade <= 0) {
          fade = 0;
          sim.reset(++seed);
          ema.fill(0);
          phase = "fadein";
        }
      } else if (phase === "fadein") {
        fade += 0.03;
        if (fade >= 1) {
          fade = 1;
          phase = "run";
        }
      }

      const scale = fade / cap;
      const data = img.data;
      if (portrait) {
        // pixel rows are x bins, columns are v bins — same layout as hist
        for (let k = 0; k < bins; k++) {
          let s = ema[k] * scale;
          if (s > 1) s = 1;
          else if (s < -1) s = -1;
          const idx = (((s + 1) * 255.5) | 0) * 3;
          const p = k * 4;
          data[p] = lut[idx];
          data[p + 1] = lut[idx + 1];
          data[p + 2] = lut[idx + 2];
        }
      } else {
        // landscape: x runs horizontally, v vertically with +v at the top
        for (let py = 0; py < GV; py++) {
          const vBin = GV - 1 - py;
          const rowOut = py * GX;
          for (let px = 0; px < GX; px++) {
            let s = ema[px * GV + vBin] * scale;
            if (s > 1) s = 1;
            else if (s < -1) s = -1;
            const idx = (((s + 1) * 255.5) | 0) * 3;
            const p = (rowOut + px) * 4;
            data[p] = lut[idx];
            data[p + 1] = lut[idx + 1];
            data[p + 2] = lut[idx + 2];
          }
        }
      }
      octx.putImageData(img, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(off, 0, 0, canvas.width, canvas.height);
      return performance.now() - t0;
    };

    const frame = () => {
      if (stopped) return;
      raf = requestAnimationFrame(frame);
      // skip work when the tab is hidden or the panel fully covers the hero
      if (document.hidden || window.scrollY > window.innerHeight) return;
      parity ^= 1;
      if (halfRate && parity) return;
      // paused: freeze on the last frame, but let a requested reset's
      // crossfade still play out (drawFrame without stepping the physics)
      if (pausedRef.current) {
        if (phase !== "run" || resetRequested.current) drawFrame(false);
        return;
      }

      const elapsed = drawFrame(true);

      // adaptive ladder: sustained slow frames step down through particle
      // decimation → half frame rate → pre-rendered video
      frames++;
      if (elapsed > 24) slowFrames++;
      if (frames >= 120) {
        if (slowFrames > 80) {
          if (sim.n > MIN_PARTICLES) {
            sim.decimate();
            cap = sim.n * CAP_PER_PARTICLE;
          } else if (!halfRate) {
            halfRate = true;
          } else {
            stopped = true;
            cancelAnimationFrame(raf);
            onFallback?.();
            return;
          }
        }
        frames = 0;
        slowFrames = 0;
      }
    };
    // paint the initial beams immediately, even if rAF is throttled
    drawFrame(false);
    raf = requestAnimationFrame(frame);

    // pointer interaction: a spatially-localized E-field pulse. The cursor's
    // velocity-axis coordinate sets the direction and strength; its
    // position-axis coordinate centers the Gaussian window. Clicks enqueue a
    // ramped pulse (applied over KICK_RAMP_FRAMES in drawFrame); drags are a
    // sustained gentle field at the cursor.
    const readPointer = (e: PointerEvent): boolean => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return false;
      pointerU = portrait
        ? ((e.clientX - rect.left) / rect.width) * 2 - 1
        : 1 - ((e.clientY - rect.top) / rect.height) * 2;
      pointerX0 = portrait
        ? ((e.clientY - rect.top) / rect.height) * l
        : ((e.clientX - rect.left) / rect.width) * l;
      return true;
    };
    const onDown = (e: PointerEvent) => {
      if (!readPointer(e)) return;
      pointerDown = true;
      kicks.push({ x0: pointerX0, dv: pointerU * KICK_DV, age: 0, total: KICK_RAMP_FRAMES });
      if (kicks.length > 16) kicks.shift();
    };
    const onMove = (e: PointerEvent) => {
      if (pointerDown) readPointer(e);
    };
    const onUp = () => {
      pointerDown = false;
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [onFallback, orientation, particles]);

  return (
    <canvas
      ref={canvasRef}
      // touch-pan-y keeps page scrolling working over the canvas on touch
      // devices; taps still land as pointerdown kicks
      className="h-full w-full cursor-crosshair touch-pan-y"
      aria-label="Live particle-in-cell simulation of the two-stream plasma instability. Click to perturb it."
    />
  );
}
