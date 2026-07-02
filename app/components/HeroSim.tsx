"use client";

import { useEffect, useRef } from "react";
import { DEFAULT_CONFIG, TwoStreamSim } from "../lib/twoStream";

// Phase-space rendering of the live two-stream simulation, matching the look
// of the pre-rendered videos: (x, v) density histogram, RdBu_r diverging
// colormap over the page background, Gaussian-ish smoothing. Velocity runs
// horizontally (blue beam right), position vertically — the same orientation
// as the pre-rotated desktop video.

const YLIM = 12; // velocity axis limits, matches the reference render
const GV = 280; // histogram bins along v (canvas width)
const GX = 420; // histogram bins along x (canvas height)
const RESTART_T = 110; // sim time at which to crossfade into a fresh run
const DPR_CAP = 1.25;

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

export default function HeroSim({ onFallback }: { onFallback?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      onFallback?.();
      return;
    }

    const off = document.createElement("canvas");
    off.width = GV;
    off.height = GX;
    const octx = off.getContext("2d")!;
    const img = octx.createImageData(GV, GX);
    img.data.fill(255);

    const sim = new TwoStreamSim(DEFAULT_CONFIG);
    const bins = GV * GX;
    const hist = new Float32Array(bins);
    const tmp = new Float32Array(bins);
    const ema = new Float32Array(bins);
    const lut = buildLut();
    // tone-mapping cap: scales with particle count; tuned against the video
    // (higher cap → beam cores sit mid-palette rather than at the dark ends)
    const cap = sim.cfg.n * 7.2e-5;

    const half = sim.cfg.n >> 1;
    const l = sim.cfg.l;

    let raf = 0;
    let seed = sim.cfg.seed;
    let fade = 1;
    let phase: "run" | "fadeout" | "fadein" = "run";
    let slowFrames = 0;
    let frames = 0;
    let stopped = false;

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

    let primed = false;
    const drawFrame = (stepPhysics: boolean): number => {
      const t0 = performance.now();
      if (stepPhysics) sim.step();

      // signed phase-space histogram: +1 for the +vb beam (blue), −1 red
      hist.fill(0);
      const { pos, vel } = sim;
      const sx = GV / (2 * YLIM);
      const sy = GX / l;
      for (let i = 0; i < sim.cfg.n; i++) {
        const bx = ((vel[i] + YLIM) * sx) | 0;
        if (bx < 0 || bx >= GV) continue;
        const by = (pos[i] * sy) | 0;
        hist[(by >= GX ? GX - 1 : by) * GV + bx] += i < half ? 1 : -1;
      }
      boxBlur(hist, tmp, GV, GX, 2);
      if (primed) {
        for (let k = 0; k < bins; k++) ema[k] += (hist[k] - ema[k]) * 0.35;
      } else {
        ema.set(hist);
        primed = true;
      }

      // restart choreography: fade to background, reseed, fade back in
      if (phase === "run" && sim.t > RESTART_T) phase = "fadeout";
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
      octx.putImageData(img, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "medium";
      ctx.drawImage(off, 0, 0, canvas.width, canvas.height);
      return performance.now() - t0;
    };

    const frame = () => {
      if (stopped) return;
      raf = requestAnimationFrame(frame);
      // skip work when the tab is hidden or the panel fully covers the hero
      if (document.hidden || window.scrollY > window.innerHeight) return;

      const elapsed = drawFrame(true);

      // watchdog: if compute is consistently too slow, hand back to the video
      frames++;
      if (elapsed > 24) slowFrames++;
      if (frames >= 120) {
        if (slowFrames > 90) {
          stopped = true;
          cancelAnimationFrame(raf);
          onFallback?.();
          return;
        }
        frames = 0;
        slowFrames = 0;
      }
    };
    // paint the initial beams immediately, even if rAF is throttled
    drawFrame(false);
    raf = requestAnimationFrame(frame);

    // pointer interaction: nudge the local distribution toward the velocity
    // under the cursor — seeds ripples and vortices
    let pointerDown = false;
    const applyPointer = (e: PointerEvent, strength: number) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const vTarget = (((e.clientX - rect.left) / rect.width) * 2 - 1) * YLIM;
      const x0 = ((e.clientY - rect.top) / rect.height) * l;
      sim.perturb(x0, vTarget, 2, strength);
    };
    const onDown = (e: PointerEvent) => {
      pointerDown = true;
      applyPointer(e, 0.5);
    };
    const onMove = (e: PointerEvent) => {
      if (pointerDown) applyPointer(e, 0.2);
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
  }, [onFallback]);

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full cursor-crosshair"
      aria-label="Live particle-in-cell simulation of the two-stream plasma instability. Click to perturb it."
    />
  );
}
