// Expandable description of the background simulation, shared between the
// hero interaction card (light) and the footer (dark).
export default function SimulationAbout({
  tone,
  className = "",
}: {
  tone: "light" | "dark";
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <details className={className}>
      <summary
        className={`cursor-pointer text-sm transition-colors ${
          dark
            ? "text-stone-300 hover:text-white"
            : "text-stone-600 hover:text-stone-900"
        }`}
      >
        About this simulation
      </summary>
      <p
        className={`mt-2 text-xs leading-relaxed ${
          dark ? "text-stone-400" : "text-stone-500"
        }`}
      >
        The background models the electrostatic two-stream instability in a
        collisionless, unmagnetized plasma using a 1D particle-in-cell (PIC)
        method that follows the approach of Philip Mocz: two counter-streaming
        electron beams (drift velocities ± 3.0 ω_p⁻¹, thermal spread 1.0) over
        a neutralizing ion background, with the electric field computed from
        Gauss&apos;s law each timestep. It runs live in your browser — 4 × 10⁵
        macro-particles on desktop, 1.2 × 10⁵ on mobile — degrading gracefully
        (fewer particles, then a pre-rendered run) if your device can&apos;t
        keep up. Clicking or dragging applies a brief, spatially-localized
        electric-field impulse that kicks the local electrons toward the
        velocity under your cursor and lets the beams respond.
      </p>
    </details>
  );
}
