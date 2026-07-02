// 1D electrostatic particle-in-cell simulation of the two-stream instability,
// following the Philip Mocz reference implementation used to render the
// original background videos (see twostream.ipynb): CIC charge deposit,
// periodic 1D Poisson solve, leapfrog push, normalized units (ω_p = 1,
// λ_D = v_th / ω_p).
//
// This module is pure (no DOM) so it can be tested headlessly.

export interface TwoStreamConfig {
  /** number of macro-particles */
  n: number;
  /** grid cells for the field solve */
  nx: number;
  /** domain length */
  l: number;
  /** beam drift velocity (± for the two beams) */
  vb: number;
  /** beam thermal spread */
  vth: number;
  /** perturbation amplitude */
  a: number;
  /** timestep */
  dt: number;
  /** RNG seed (deterministic runs) */
  seed: number;
}

export const DEFAULT_CONFIG: TwoStreamConfig = {
  n: 250_000,
  nx: 512,
  l: 100,
  vb: 3,
  vth: 1,
  a: 0.1,
  dt: 0.05,
  seed: 42,
};

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class TwoStreamSim {
  readonly cfg: TwoStreamConfig;
  /** particle positions in [0, l) */
  pos: Float32Array;
  /** particle velocities; first half is the +vb beam, second half -vb */
  vel: Float32Array;
  /** simulation time */
  t = 0;

  private dens: Float32Array;
  private efield: Float32Array;

  constructor(cfg: TwoStreamConfig) {
    this.cfg = cfg;
    this.pos = new Float32Array(cfg.n);
    this.vel = new Float32Array(cfg.n);
    this.dens = new Float32Array(cfg.nx);
    this.efield = new Float32Array(cfg.nx);
    this.reset(cfg.seed);
  }

  reset(seed: number) {
    const { n, l, vb, vth, a } = this.cfg;
    const rand = mulberry32(seed);
    // Box–Muller for the thermal spread
    const gauss = () => {
      const u = Math.max(rand(), 1e-12);
      const v = rand();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    };
    const half = n >> 1;
    for (let i = 0; i < n; i++) {
      this.pos[i] = rand() * l;
      const beam = i < half ? vb : -vb;
      // Multiplicative velocity perturbation seeds the instability (Mocz)
      this.vel[i] =
        (beam + vth * gauss()) * (1 + a * Math.sin((2 * Math.PI * this.pos[i]) / l));
    }
    this.t = 0;
  }

  /**
   * Solve for the field on the grid from current particle positions.
   * Gauss's law in 1D: dE/dx = ρ = n0 - n_e (ions are a fixed neutralizing
   * background), integrated with a cumulative sum; the free constant is fixed
   * by requiring the mean field to vanish (periodic BC).
   */
  private solveField() {
    const { n, nx, l } = this.cfg;
    const dx = l / nx;
    const dens = this.dens;
    const e = this.efield;
    dens.fill(0);
    // CIC deposit
    const inv = nx / l;
    for (let i = 0; i < n; i++) {
      const x = this.pos[i] * inv;
      // float32 rounding can land pos exactly on l → wrap the cell index
      let j = x | 0;
      let f = x - j;
      if (j >= nx) {
        j -= nx;
        f = 0;
      }
      dens[j] += 1 - f;
      const j1 = j + 1 === nx ? 0 : j + 1;
      dens[j1] += f;
    }
    // normalize so mean electron density = n0 = 1, then integrate ρ = 1 - n_e
    const norm = nx / n; // dens[j] * norm has mean 1
    let acc = 0;
    let mean = 0;
    for (let j = 0; j < nx; j++) {
      acc += (1 - dens[j] * norm) * dx;
      e[j] = acc;
      mean += acc;
    }
    mean /= nx;
    for (let j = 0; j < nx; j++) e[j] -= mean;
  }

  /** advance one timestep (kick–drift leapfrog) */
  step() {
    const { n, nx, l, dt } = this.cfg;
    this.solveField();
    const e = this.efield;
    const inv = nx / l;
    for (let i = 0; i < n; i++) {
      const x = this.pos[i] * inv;
      let j = x | 0;
      let f = x - j;
      if (j >= nx) {
        j -= nx;
        f = 0;
      }
      const j1 = j + 1 === nx ? 0 : j + 1;
      // electron: q = -1, m = 1 → a = -E
      this.vel[i] -= (e[j] * (1 - f) + e[j1] * f) * dt;
      let p = this.pos[i] + this.vel[i] * dt;
      // periodic wrap (large excursions normalized by the floor form)
      if (p >= l || p < 0) {
        p -= Math.floor(p / l) * l;
        if (p >= l) p = 0; // float edge case after the floor normalization
      }
      this.pos[i] = p;
    }
    this.t += dt;
  }

  /**
   * Gently pull particle velocities toward vTarget in a Gaussian window
   * around x0 (used for pointer interaction). Bounded relaxation, so it
   * cannot blow the simulation up.
   */
  perturb(x0: number, vTarget: number, sigma: number, strength: number) {
    const { n, l } = this.cfg;
    const s = Math.min(Math.max(strength, 0), 1);
    const inv2 = 1 / (2 * sigma * sigma);
    for (let i = 0; i < n; i++) {
      let d = Math.abs(this.pos[i] - x0);
      if (d > l / 2) d = l - d; // periodic distance
      if (d > 4 * sigma) continue;
      const w = Math.exp(-d * d * inv2);
      this.vel[i] += s * w * (vTarget - this.vel[i]);
    }
  }

  /** total field energy ∝ Σ E² dx — used for testing */
  fieldEnergy(): number {
    const { nx, l } = this.cfg;
    this.solveField();
    let sum = 0;
    for (let j = 0; j < nx; j++) sum += this.efield[j] * this.efield[j];
    return sum * (l / nx);
  }
}
