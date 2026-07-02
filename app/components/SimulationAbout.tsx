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
        method that follows the approach of Philip Mocz. Two counter-streaming
        electron beams (drift velocities ± 3.0 ω<sub>p</sub>⁻¹, thermal spread
        1.0) evolve over a neutralizing ion background, with the electric
        field recomputed from Gauss&apos;s law at every timestep. The
        simulation runs live in your browser — 4 × 10⁵ macro-particles on
        desktop, 1.2 × 10⁵ on mobile — rendered as a phase-space density map:
        position along the beams, velocity across them. Clicking or dragging
        applies a gentle, spatially-localized electric-field pulse that nudges
        the local electrons toward the velocity under your cursor — watch the
        beams respond.
      </p>
    </details>
  );
}
