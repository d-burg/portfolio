import Image from "next/image";
import { ArrowUpRight, MapPin } from "lucide-react";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Reveal from "./components/Reveal";

function SectionHeading({ index, title }: { index: string; title: string }) {
  return (
    <div className="mb-10 md:mb-14">
      <div className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-accent">
        {index}
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-stone-900 md:text-3xl">
        {title}
      </h2>
    </div>
  );
}

function Publication({
  year,
  title,
  href,
  authors,
  venue,
}: {
  year: string;
  title: string;
  href: string;
  authors: React.ReactNode;
  venue: string;
}) {
  return (
    <article className="group grid gap-2 md:grid-cols-[80px_1fr] md:gap-6">
      <div className="pt-1 font-mono text-sm text-stone-400">{year}</div>
      <div>
        <h3 className="text-lg font-semibold leading-snug text-stone-900 md:text-xl">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-accent"
          >
            {title}
            <ArrowUpRight className="ml-1 inline-block h-4 w-4 align-baseline text-stone-300 transition-colors group-hover:text-accent" />
          </a>
        </h3>
        <p className="mt-2 text-sm text-stone-600 md:text-base">{authors}</p>
        <p className="mt-1 text-sm italic text-stone-500">{venue}</p>
      </div>
    </article>
  );
}

function ResumeItem({
  title,
  subtitle,
  date,
  location,
  children,
}: {
  title: string;
  subtitle?: string;
  date: string;
  location?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-8 last:mb-0">
      <div className="mb-2 flex flex-col md:flex-row md:items-baseline md:justify-between">
        <h4 className="text-lg font-bold text-stone-800">{title}</h4>
        <span className="shrink-0 font-mono text-sm text-stone-400">{date}</span>
      </div>
      {(subtitle || location) && (
        <div className="mb-3 flex flex-col text-stone-600 md:flex-row md:items-baseline md:justify-between">
          {subtitle && <span className="font-medium italic">{subtitle}</span>}
          {location && (
            <span className="flex items-center gap-1 text-sm">
              <MapPin className="h-3 w-3" /> {location}
            </span>
          )}
        </div>
      )}
      <div className="space-y-1 text-sm leading-relaxed text-stone-600">{children}</div>
    </div>
  );
}

function SidebarHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-6 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
      {children}
    </h3>
  );
}

export default function Portfolio() {
  return (
    <div id="top" className="min-h-screen text-stone-900 selection:bg-stone-200">
      <Nav />
      <Hero />

      {/* Content panel that slides over the fixed hero */}
      <main className="relative z-10 mt-[100vh] border-t border-stone-200 bg-stone-50 shadow-[0_-12px_32px_-16px_rgba(28,25,23,0.15)]">
        {/* PUBLICATIONS */}
        <section id="publications" className="mx-auto max-w-4xl scroll-mt-20 px-6 pb-16 pt-20 md:pt-28">
          <Reveal>
            <SectionHeading index="01 — Research" title="Select Publications" />
          </Reveal>

          <div className="space-y-10">
            <Reveal>
              <Publication
                year="2024"
                title="TokaMaker: An open-source time-dependent Grad-Shafranov tool for the design and modeling of axisymmetric fusion devices"
                href="https://www.sciencedirect.com/science/article/abs/pii/S0010465524000341"
                authors={
                  <>
                    C. Hansen, I.G. Stewart,{" "}
                    <span className="font-bold text-stone-800">D.A. Burgess</span>, et al.
                  </>
                }
                venue="Computer Physics Communications"
              />
            </Reveal>
            <Reveal>
              <Publication
                year="2022"
                title="The Eel Pulsar Wind Nebula: a PeVatron-Candidate Origin for HAWC J1826-128 and HESS J1826-130"
                href="https://iopscience.iop.org/article/10.3847/1538-4357/ac650a/meta"
                authors={
                  <>
                    <span className="font-bold text-stone-800">D.A. Burgess</span>, K. Mori,
                    C.J. Hailey, et al.
                  </>
                }
                venue="The Astrophysical Journal"
              />
            </Reveal>
          </div>
        </section>

        {/* PROJECTS */}
        <section id="projects" className="mx-auto max-w-4xl scroll-mt-20 px-6 pb-24 pt-12">
          <Reveal>
            <SectionHeading index="02 — Software" title="Select Projects" />
          </Reveal>

          <Reveal>
            <div className="group rounded-lg border border-stone-200 bg-white p-6 transition-all hover:border-accent/40 hover:shadow-md md:p-8">
              <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <h3 className="text-lg font-semibold text-stone-900 md:text-xl">
                  <a
                    href="https://github.com/PrincetonUniversity/GPEC"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-accent"
                  >
                    GPEC (General Plasma Equilibrium Code)
                    <ArrowUpRight className="ml-1 inline-block h-4 w-4 align-baseline text-stone-300 transition-colors group-hover:text-accent" />
                  </a>
                </h3>
                <span className="w-fit rounded border border-stone-200 bg-stone-100 px-2 py-1 font-mono text-xs text-stone-600">
                  Fortran
                </span>
              </div>
              <p className="text-sm leading-relaxed text-stone-600 md:text-base">
                Redeveloped and expanded SLAYER to include updated physics and quadtree
                adaptive mesh refinement (AMR) for robust calculation of both uncoupled and
                coupled classical tearing mode growth rates. AMR approach achieved over 20x
                speedup in root finding procedure.
              </p>
            </div>
          </Reveal>
        </section>

        {/* RESUME */}
        <section id="resume" className="scroll-mt-14 border-y border-stone-200 bg-white py-20 md:py-24">
          <div className="mx-auto max-w-4xl px-6">
            <Reveal>
              <SectionHeading index="03 — Background" title="Resume" />
            </Reveal>
            <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
              <Reveal className="space-y-12 md:col-span-4">
                <div>
                  <SidebarHeading>Education</SidebarHeading>
                  <div className="mb-6">
                    <div className="font-bold text-stone-800">Columbia University</div>
                    <div className="text-sm text-stone-600">
                      Ph.D. Candidate, Plasma Physics
                    </div>
                    <div className="mt-1 font-mono text-xs text-stone-400">
                      2022 — Present
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-stone-800">Columbia University</div>
                    <div className="text-sm text-stone-600">B.A. Astrophysics</div>
                    <div className="mt-1 font-mono text-xs text-stone-400">2018 — 2022</div>
                  </div>
                </div>

                <div>
                  <SidebarHeading>Technical Skills</SidebarHeading>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Python",
                      "Fortran",
                      "Bash/Unix",
                      "LaTeX",
                      "EFIT",
                      "GPEC",
                      "TokaMaker",
                      "FreeGS",
                      "PyTorch",
                      "Git",
                    ].map((skill) => (
                      <span
                        key={skill}
                        className="rounded border border-stone-200 bg-stone-100 px-2 py-1 text-xs text-stone-600"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <SidebarHeading>Press</SidebarHeading>
                  <a
                    href="https://skyandtelescope.org/astronomy-news/seeing-inside-a-cosmic-superaccelerator/"
                    target="_blank"
                    rel="noreferrer"
                    className="group block"
                  >
                    <div className="font-medium text-stone-800 transition-colors group-hover:text-accent">
                      &quot;Seeing Inside a Cosmic Superaccelerator&quot;
                    </div>
                    <div className="mt-1 text-sm italic text-stone-500">
                      Sky &amp; Telescope Magazine
                    </div>
                  </a>
                </div>

                <div>
                  <SidebarHeading>Select Talks &amp; Posters</SidebarHeading>
                  <div className="space-y-4">
                    <div>
                      <div className="font-bold text-stone-800">APS-DPP</div>
                      <div className="mt-1 space-x-2 font-mono text-sm text-stone-500">
                        <a
                          href="https://archive.aps.org/dpp/2025/go05/8/"
                          className="underline decoration-stone-300 transition-colors hover:text-accent hover:decoration-accent"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          2025
                        </a>
                        <a
                          href="https://meetings.aps.org/Meeting/DPP24/Session/PP12.58"
                          className="underline decoration-stone-300 transition-colors hover:text-accent hover:decoration-accent"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          2024
                        </a>
                        <a
                          href="https://meetings.aps.org/Meeting/DPP23/Session/JP11.146"
                          className="underline decoration-stone-300 transition-colors hover:text-accent hover:decoration-accent"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          2023
                        </a>
                        <a
                          href="https://meetings.aps.org/Meeting/DPP22/Session/JP11.47"
                          className="underline decoration-stone-300 transition-colors hover:text-accent hover:decoration-accent"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          2022
                        </a>
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-stone-800">Intl. Cosmic Ray Conf.</div>
                      <div className="mt-1 font-mono text-sm text-stone-500">
                        <a
                          href="https://arxiv.org/abs/2108.00557"
                          className="underline decoration-stone-300 transition-colors hover:text-accent hover:decoration-accent"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          2021
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>

              <Reveal className="md:col-span-8" delay={100}>
                <SidebarHeading>Research Experience</SidebarHeading>

                <ResumeItem
                  title="Columbia Plasma Physics Laboratory"
                  subtitle="Ph.D. Student"
                  date="Sep 2022 — Present"
                  location="New York, NY"
                >
                  <ul className="ml-4 list-outside list-disc space-y-2">
                    <li>
                      Redeveloped and benchmarked SLAYER code using Fortran for inclusion in
                      the GPEC suite and analysis of experimental tearing mode discharges.
                    </li>
                    <li>
                      Designed and assessed operational and contingency scenarios for the
                      SPARC tokamak utilizing kinetic equilibria generated in EFIT and
                      FreeGS.
                    </li>
                  </ul>
                </ResumeItem>

                <ResumeItem
                  title="DIII-D National Fusion Facility"
                  subtitle="SULI Intern"
                  date="Jun 2022 — Aug 2022"
                  location="San Diego, CA"
                >
                  <ul className="ml-4 list-outside list-disc space-y-2">
                    <li>
                      Analyzed novel multi-machine, ELM-free regime database to assess
                      regime suitability for future reactors.
                    </li>
                    <li>
                      Generated and analyzed kinetic equilibria and peeling-ballooning
                      boundary calculations to analyze stability effects on ELM onset.
                    </li>
                  </ul>
                </ResumeItem>

                <ResumeItem
                  title="Lamont Doherty Earth Observatory"
                  subtitle="Research Assistant"
                  date="May 2021 — May 2022"
                  location="New York, NY"
                >
                  <ul className="ml-4 list-outside list-disc space-y-2">
                    <li>
                      Developed a modular, fault-tolerant software package to simulate
                      atmospheric radiative transfer.
                    </li>
                    <li>
                      Vectorized and parallelized functions using Xarray and Dask to reduce
                      calculation time from hours to seconds with minimal accuracy loss.
                    </li>
                  </ul>
                </ResumeItem>

                <ResumeItem
                  title="NuSTAR Team, Columbia Astrophysics Lab"
                  subtitle="Research Assistant"
                  date="Sep 2019 — May 2022"
                  location="New York, NY"
                >
                  <ul className="ml-4 list-outside list-disc space-y-2">
                    <li>
                      Led collaboration between research professors and observatory teams to
                      model a neutron star&apos;s high-energy gamma-ray emission.
                    </li>
                    <li>
                      Analyzed 100+ X-ray telescope datasets (NuSTAR, XMM-Newton) using
                      Python and Unix-based tools.
                    </li>
                  </ul>
                </ResumeItem>

                <div className="my-12 h-px w-full bg-stone-100" />

                <SidebarHeading>Teaching &amp; Mentorship</SidebarHeading>

                <ResumeItem title="Research Mentor" date="2025 — Present">
                  <p>
                    Mentored Kevin Clavijo in development of tokamak pedestal scaling
                    routines for edge-localized mode stability analysis.
                  </p>
                </ResumeItem>

                <ResumeItem title="Teaching Assistant" date="2020 — 2023" subtitle="Columbia University">
                  <p>
                    TA for APPH E4101 (Dynamical Systems), APPH E4100 (Quantum Physics), and
                    ASTR W2001 (Intro to Astrophysics). Graded coursework and led student
                    review sessions.
                  </p>
                </ResumeItem>

                <div className="my-12 h-px w-full bg-stone-100" />

                <SidebarHeading>Writing</SidebarHeading>
                <ResumeItem title="GlacierHub" subtitle="Staff Writer" date="2021">
                  <p>
                    Authored science communication pieces on climate science:{" "}
                    <a
                      href="https://news.climate.columbia.edu/2021/04/19/glacier-mars-aid-future-astronauts/"
                      className="underline decoration-stone-300 transition-all hover:text-accent hover:decoration-accent"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Apr 19
                    </a>
                    ,{" "}
                    <a
                      href="https://news.climate.columbia.edu/2021/05/05/artificial-neural-network-joins-fight-against-receding-glaciers/"
                      className="underline decoration-stone-300 transition-all hover:text-accent hover:decoration-accent"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      May 5
                    </a>
                    ,{" "}
                    <a
                      href="https://news.climate.columbia.edu/2021/07/09/environmentalists-and-glacier-activists-are-poised-to-rewrite-chiles-constitution/"
                      className="underline decoration-stone-300 transition-all hover:text-accent hover:decoration-accent"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Jul 9
                    </a>
                    ,{" "}
                    <a
                      href="https://news.climate.columbia.edu/2021/08/06/melting-ice-and-a-high-altitude-dig-reveal-viking-secrets-in-norway/"
                      className="underline decoration-stone-300 transition-all hover:text-accent hover:decoration-accent"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Aug 6
                    </a>
                    , and{" "}
                    <a
                      href="https://news.climate.columbia.edu/2021/09/01/glacial-ice-cores-reveal-15000-year-old-microbes/"
                      className="underline decoration-stone-300 transition-all hover:text-accent hover:decoration-accent"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Sep 1
                    </a>
                    .
                  </p>
                </ResumeItem>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="mx-auto max-w-4xl scroll-mt-20 px-6 py-20 md:py-24">
          <Reveal>
            <SectionHeading index="04 — Personal" title="About Me" />
          </Reveal>
          <Reveal>
            <div className="flex flex-col items-start gap-10 md:flex-row md:gap-12">
              <div className="relative h-40 w-40 flex-shrink-0 overflow-hidden rounded-lg border border-stone-200 shadow-sm md:h-64 md:w-64">
                <Image
                  src="/0207_shifted_portrait_crop-1.jpg"
                  alt="Daniel Burgess"
                  fill
                  sizes="(min-width: 768px) 16rem, 10rem"
                  className="object-cover"
                />
              </div>

              <div className="space-y-6">
                <p className="leading-relaxed text-stone-600">
                  I am currently a Ph.D. candidate at Columbia University, where I explore
                  the intersection of plasma physics and high-performance computing. I
                  joined the program in Fall 2022 after receiving my B.A. in astrophysics,
                  also from Columbia. My research focuses on the magnetohydrodynamic (MHD)
                  stability of tokamak plasmas to tearing modes, modeling of scenarios and
                  control for the SPARC and ARC tokamaks, and development of open source
                  tools such as TokaMaker and the GPEC suite.
                </p>
                <p className="leading-relaxed text-stone-600">
                  I&apos;m excited to lead efforts that bridge fusion theory and experiment
                  through rigorous validation and handling of measurement uncertainties, and
                  I&apos;m additionally passionate about mentoring the next generation of
                  high school and undergraduate students. In my free time I enjoy running,
                  skiing, gravel cycling, and playing guitar with friends or strangers.
                </p>
              </div>
            </div>
          </Reveal>
        </section>

        {/* FOOTER */}
        <footer className="bg-stone-900 py-12 text-sm text-stone-400">
          <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 md:flex-row md:items-start md:justify-between">
            <div>
              <p>&copy; {new Date().getFullYear()} Daniel Burgess</p>
              <p>All rights reserved.</p>
            </div>

            <details className="max-w-lg md:text-right">
              <summary className="cursor-pointer text-stone-300 transition-colors hover:text-white md:text-right">
                About the background simulation
              </summary>
              <p className="mt-3 text-xs leading-relaxed text-stone-400">
                This background simulation models the electrostatic two-stream instability
                in a collisionless, unmagnetized plasma using a 1D particle-in-cell (PIC)
                method that follows the approach of Philip Mocz. The system is initialized
                with two counter-streaming beams totaling 4 × 10⁶ electrons over a
                neutralizing ion background. The beam drift velocities are set to ± 3.0
                ω_p⁻¹, the Vlasov equation evolves the electron distribution function, and
                the Poisson equation computes the corresponding E-fields.
              </p>
            </details>
          </div>
        </footer>
      </main>
    </div>
  );
}
