import React from 'react';
import { Github, Linkedin, Mail, FileText, ChevronDown, GraduationCap, MapPin, User, Code } from 'lucide-react';

// --- CUSTOM ANIMATIONS & RESPONSIVE GRADIENTS ---
const customStyles = `
  /* DISABLE RUBBER BAND SCROLL (Overscroll) */
  html, body {
    overscroll-behavior-y: none;
  }

  @keyframes drawRect {
    0% { stroke-dashoffset: 10000; }
    100% { stroke-dashoffset: 0; }
  }
  @keyframes drawRect {
    0% { stroke-dashoffset: 10000; }
    100% { stroke-dashoffset: 0; }
  }
  @keyframes fadeIn {
    0% { opacity: 0; transform: translateY(10px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeOut {
    0% { opacity: 1; }
    100% { opacity: 0; }
  }
  
  .animate-draw-rect {
    stroke-dasharray: 10000;
    stroke-dashoffset: 10000;
    animation: drawRect 6s cubic-bezier(0.25, 1, 0.5, 1) forwards;
  }
  
  .animate-trace-fade-out {
    animation: fadeOut 3s ease-out forwards;
    animation-delay: 1s;
  }
  
  .animate-fade-in-delayed {
    opacity: 0;
    animation: fadeIn 4s ease-out forwards;
    animation-delay: 1s;
  }

  /* --- RESPONSIVE GLASS MASKS --- */
  /* This class handles the "Smart Masking" for both Mobile and Desktop */
  .smart-glass-panel {
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    
    /* MOBILE DEFAULT: Vertical Gradient 
       Top 45% is transparent (Shows Video)
       Bottom 65% is Solid (Hides Text) 
    */
    background: linear-gradient(to bottom, 
      rgba(250, 250, 249, 0.4) 0%, 
      rgba(250, 250, 249, 0.4) 45%, 
      #fafaf9 35.1%, 
      #fafaf9 100%
    );
  }

  /* DESKTOP OVERRIDE (md screens and up) */
  @media (min-width: 768px) {
    .smart-glass-panel {
      /* Horizontal Gradient 
         Left 50% is Solid (Hides Text)
         Right 50% is transparent (Shows Video)
      */
      background: linear-gradient(to right, 
        #fafaf9 0%, 
        #fafaf9 50%, 
        rgba(250, 250, 249, 0.4) 50.1%, 
        rgba(250, 250, 249, 0.4) 100%
      );
    }
  }
`;

// --- COMPONENTS ---

function SocialLink({ icon: Icon, label, href }: { icon: React.ElementType, label: string, href: string }) {
  return (
    <a
      href={href}
      className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors group"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
      <span className="font-medium">{label}</span>
    </a>
  );
}

function ResumeItem({ title, subtitle, date, location, children }: { title: string, subtitle?: string, date: string, location?: string, children?: React.ReactNode }) {
  return (
    <div className="mb-8 last:mb-0">
      <div className="flex flex-col md:flex-row md:justify-between md:items-baseline mb-2">
        <h4 className="text-lg font-bold text-stone-800">{title}</h4>
        <span className="text-sm font-mono text-stone-500 shrink-0">{date}</span>
      </div>
      {(subtitle || location) && (
        <div className="flex flex-col md:flex-row md:justify-between md:items-baseline mb-3 text-stone-600">
           {subtitle && <span className="font-medium italic">{subtitle}</span>}
           {location && <span className="text-sm flex items-center gap-1"><MapPin className="w-3 h-3"/> {location}</span>}
        </div>
      )}
      <div className="text-stone-600 text-sm leading-relaxed space-y-1">
        {children}
      </div>
    </div>
  );
}

export default function Portfolio() {
  return (
    <div className="bg-stone-50 text-stone-900 font-sans selection:bg-stone-200 min-h-screen m-0 p-0 overflow-x-hidden">
      <style>{customStyles}</style>

      {/* --- 1. THE OUTER RECTANGLE FRAME (FIXED) --- */}
      <div className="fixed inset-4 z-50 pointer-events-none animate-trace-fade-out">
        <svg className="w-full h-full">
          <rect 
            x="1" y="1" width="99.8%" height="99.8%" 
            fill="none" 
            stroke="#57534e"
            strokeWidth="2" 
            className="animate-draw-rect"
          />
        </svg>
      </div>

      {/* --- 2. HERO SECTION (FIXED BACKGROUND) --- */}
      <section className="fixed inset-0 w-full h-screen z-0 flex flex-col md:justify-center">
        
        {/* HERO LAYOUT 
            - Mobile: Flex Column (Video Top, Text Bottom)
            - Desktop: Grid (Text Left, Video Right)
        */}
        <div className="h-full w-full flex flex-col md:grid md:grid-cols-2 animate-fade-in-delayed">
          
          {/* A. MOBILE VIDEO (Top 35% height - Matches CSS Mask) */}
          <div className="block md:hidden w-full h-[35vh] relative overflow-hidden bg-stone-100">
             <video 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="w-full h-full object-cover"
              >
                <source src="/simulation_mobile_4000kbps.mp4" type="video/mp4" />
              </video>
          </div>

          {/* B. LEFT CONTENT (Text) 
              - Mobile: Bottom 65% height
              - Desktop: Full height, Left column
          */}
          <div className="h-[65vh] md:h-full flex flex-col justify-center pb-[20vh] md:pb-0 z-10 px-8 md:pl-32 md:pr-12 bg-stone-50 md:bg-transparent">
            <div className="space-y-6 md:space-y-8 max-w-xl">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-stone-900">
                Hi, I'm Daniel.
              </h1>
              <p className="text-lg md:text-2xl text-stone-600 leading-relaxed font-light">
                Researcher specializing in <span className="font-semibold text-stone-800">Tokamak Plasma Physics</span> and scientific computing. 
                <br/><br className="hidden md:block"/>
                My work focuses on magnetohydrodynamics (MHD), transport phenomena, and building tools for complex simulation data.
              </p>
              
              <div className="flex flex-wrap gap-x-6 gap-y-3 pt-4 text-sm md:text-base">
                <SocialLink href="https://scholar.google.com/citations?user=wvKZqjYAAAAJ&hl=en" icon={GraduationCap} label="Google Scholar" />
                <SocialLink href="https://github.com/d-burg" icon={Github} label="GitHub" />
                <SocialLink href="https://www.linkedin.com/in/daniel-a-burgess/" icon={Linkedin} label="LinkedIn" />
                <SocialLink href="mailto:dab2245@columbia.edu" icon={Mail} label="Email" />
              </div>
            </div>
          </div>

          {/* C. DESKTOP VIDEO (Right Column) */}
          <div className="hidden md:flex items-center justify-center w-full h-full relative overflow-hidden">
             <video 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="w-[100vh] h-auto max-w-none rotate-90 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <source src="/simulation2_4000kbps.mp4" type="video/mp4" />
              </video>
          </div>
          
        </div>

        {/* Scroll Hint */}
        <div className="absolute bottom-8 left-8 md:bottom-12 md:left-32 animate-bounce text-stone-400 animate-fade-in-delayed z-20">
          <ChevronDown className="w-6 h-6 md:w-8 md:h-8" />
        </div>
      </section>


      {/* --- 3. SCROLLING CONTENT (SLIDING PANEL) --- */}
      <div className="relative z-10 mt-[100vh] smart-glass-panel">
        
        {/* STATIC DIVIDER LINE */}
        <div className="w-full h-px bg-stone-300 mb-12 md:mb-24" />

        {/* PUBLICATIONS */}
        <section className="max-w-4xl mx-auto px-6 pb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12 flex items-center gap-3">
            <FileText className="w-6 h-6" /> Select Publications
          </h2>

          <div className="space-y-8">
            <article className="group">
               <div className="text-sm text-stone-400 font-mono mb-1">2024</div>
               <h3 className="text-lg md:text-xl font-semibold text-stone-900 group-hover:text-blue-600 transition-colors">
                 <a href="https://www.sciencedirect.com/science/article/abs/pii/S0010465524000341" target="_blank" rel="noopener noreferrer">
                   TokaMaker: An open-source time-dependent Grad-Shafranov tool for the design and modeling of axisymmetric fusion devices
                 </a>
               </h3>
               <p className="text-stone-600 mt-2 text-sm md:text-base">
                 C. Hansen, I.G. Stewart, <span className="font-bold text-stone-800">D.A. Burgess</span>, et al.
               </p>
               <p className="text-stone-500 text-xs md:text-sm italic mt-1">Computer Physics Communications</p>
            </article>

            <article className="group">
               <div className="text-sm text-stone-400 font-mono mb-1">2022</div>
               <h3 className="text-lg md:text-xl font-semibold text-stone-900 group-hover:text-blue-600 transition-colors">
                 <a href="https://iopscience.iop.org/article/10.3847/1538-4357/ac650a/meta" target="_blank" rel="noopener noreferrer">
                   The Eel Pulsar Wind Nebula: a PeVatron-Candidate Origin for HAWC J1826-128 and HESS J1826-130
                 </a>
               </h3>
               <p className="text-stone-600 mt-2 text-sm md:text-base">
                 <span className="font-bold text-stone-800">D.A. Burgess</span>, K. Mori, C.J. Hailey, et al.
               </p>
               <p className="text-stone-500 text-xs md:text-sm italic mt-1">The Astrophysical Journal</p>
            </article>
          </div>
        </section>

        {/* PROJECTS */}
        <section className="max-w-4xl mx-auto px-6 pb-24 pt-12">
           <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12 flex items-center gap-3">
             <Code className="w-6 h-6" /> Software Projects
           </h2>
           
           <div className="p-6 md:p-8 bg-white/60 rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-4">
                 <h3 className="text-lg md:text-xl font-semibold text-stone-900 group-hover:text-blue-600 transition-colors">
                    <a href="https://github.com/PrincetonUniversity/GPEC" target="_blank" rel="noopener noreferrer">
                      GPEC (General Plasma Equilibrium Code)
                    </a>
                 </h3>
                 <span className="px-2 py-1 bg-stone-100 text-stone-600 text-xs rounded border border-stone-200 font-mono w-fit">
                   Fortran
                 </span>
              </div>
              <p className="text-stone-600 leading-relaxed text-sm md:text-base">
                 Redeveloped and expanded SLAYER to include updated physics and quadtree adaptive mesh refinement (AMR) for robust calculation of both uncoupled and coupled classical tearing mode growth rates. AMR approach achieved over 20x speedup in root finding procedure.
              </p>
           </div>
        </section>

        {/* RESUME */}
        <section className="bg-white/60 border-y border-stone-200 py-24">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-12">Resume</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
              <div className="md:col-span-4 space-y-12">
                 <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400 mb-6">Education</h3>
                    <div className="mb-6">
                      <div className="font-bold text-stone-800">Columbia University</div>
                      <div className="text-sm text-stone-600">Ph.D. Candidate, Plasma Physics</div>
                      <div className="text-xs text-stone-400 font-mono mt-1">2022 — Present</div>
                    </div>
                    <div>
                      <div className="font-bold text-stone-800">Columbia University</div>
                      <div className="text-sm text-stone-600">B.A. Astrophysics</div>
                      <div className="text-xs text-stone-400 font-mono mt-1">2018 — 2022</div>
                    </div>
                 </div>

                 <div>
                   <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400 mb-6">Technical Skills</h3>
                   <div className="flex flex-wrap gap-2">
                     {["Python", "Fortran", "Bash/Unix", "LaTeX", "EFIT", "GPEC", "TokaMaker", "FreeGS", "PyTorch", "Git"].map(skill => (
                       <span key={skill} className="px-2 py-1 bg-stone-100 text-stone-600 text-xs rounded border border-stone-200">
                         {skill}
                       </span>
                     ))}
                   </div>
                 </div>

                 <div>
                   <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400 mb-6">Press</h3>
                   <a href="https://skyandtelescope.org/astronomy-news/seeing-inside-a-cosmic-superaccelerator/" target="_blank" rel="noreferrer" className="block group">
                     <div className="font-medium text-stone-800 group-hover:underline">"Seeing Inside a Cosmic Superaccelerator"</div>
                     <div className="text-sm text-stone-500 italic mt-1">Sky & Telescope Magazine</div>
                   </a>
                 </div>

                 <div>
                   <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400 mb-6">Select Talks & Posters</h3>
                   <div className="space-y-4">
                     <div>
                       <div className="font-bold text-stone-800">APS-DPP</div>
                       <div className="text-sm text-stone-500 font-mono mt-1 space-x-2">
                         <a href="#" className="hover:text-blue-600 underline decoration-stone-300">2025</a>
                         <a href="#" className="hover:text-blue-600 underline decoration-stone-300">2024</a>
                         <a href="#" className="hover:text-blue-600 underline decoration-stone-300">2023</a>
                         <a href="#" className="hover:text-blue-600 underline decoration-stone-300">2022</a>
                       </div>
                     </div>
                     <div>
                       <div className="font-bold text-stone-800">Intl. Cosmic Ray Conf.</div>
                       <div className="text-sm text-stone-500 font-mono mt-1">
                         <a href="#" className="hover:text-blue-600 underline decoration-stone-300">2021</a>
                       </div>
                     </div>
                   </div>
                 </div>
              </div>

              <div className="md:col-span-8">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400 mb-8">Research Experience</h3>
                
                <ResumeItem 
                  title="Columbia Plasma Physics Laboratory" 
                  subtitle="PhD Student"
                  date="Sep 2022 — Present"
                  location="New York, NY"
                >
                  <ul className="list-disc list-outside ml-4 space-y-2">
                    <li>Redeveloped and benchmarked SLAYER code using Fortran for inclusion in the GPEC suite and analysis of experimental tearing mode discharges.</li>
                    <li>Designed and assessed operational and contingency scenarios for the SPARC tokamak utilizing kinetic equilibria generated in EFIT and FreeGS.</li>
                  </ul>
                </ResumeItem>

                <ResumeItem 
                  title="DIII-D National Fusion Facility" 
                  subtitle="SULI Intern"
                  date="Jun 2022 — Aug 2022"
                  location="San Diego, CA"
                >
                  <ul className="list-disc list-outside ml-4 space-y-2">
                    <li>Analyzed novel multi-machine, ELM-free regime database to assess regime suitability for future reactors.</li>
                    <li>Generated and analyzed kinetic equilibria and peeling-ballooning boundary calculations to analyze stability effects on ELM onset.</li>
                  </ul>
                </ResumeItem>

                <ResumeItem 
                  title="Lamont Doherty Earth Observatory" 
                  subtitle="Research Assistant"
                  date="May 2021 — May 2022"
                  location="New York, NY"
                >
                  <ul className="list-disc list-outside ml-4 space-y-2">
                    <li>Developed a modular, fault-tolerant software package to simulate atmospheric radiative transfer.</li>
                    <li>Vectorized and parallelized functions using Xarray to reduce calculation time from hours to seconds with minimal accuracy loss.</li>
                  </ul>
                </ResumeItem>

                <ResumeItem 
                  title="NuSTAR Team, Columbia Astrophysics Lab" 
                  subtitle="Research Assistant"
                  date="Sep 2019 — May 2022"
                  location="New York, NY"
                >
                  <ul className="list-disc list-outside ml-4 space-y-2">
                    <li>Led collaboration between research professors and observatory teams to model a neutron star's high-energy gamma-ray emission.</li>
                    <li>Analyzed 100+ X-ray telescope datasets (NuSTAR, XMM-Newton) using Python and Unix-based tools.</li>
                  </ul>
                </ResumeItem>

                <div className="w-full h-px bg-stone-100 my-12" />

                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400 mb-8">Teaching & Mentorship</h3>
                
                <ResumeItem 
                  title="Research Mentor" 
                  date="2025 — Present"
                >
                  <p>Mentored Kevin Clavijo in development of tokamak pedestal scaling routines for edge-localized mode stability analysis.</p>
                </ResumeItem>

                <ResumeItem 
                  title="Teaching Assistant" 
                  date="2020 — 2023"
                  subtitle="Columbia University"
                >
                  <p>TA for APPH E4101 (Dynamical Systems), APPH E4100 (Quantum Physics), and Intro to Astrophysics. Graded coursework and led student review sessions.</p>
                </ResumeItem>

                <div className="w-full h-px bg-stone-100 my-12" />

                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400 mb-8">Writing</h3>
                <ResumeItem 
                  title="GlacierHub" 
                  subtitle="Staff Writer"
                  date="2021"
                >
                   <p>Authored science communication pieces on climate science, including "Glacial Ice Cores Reveal 15,000 Year Old Microbes" and "An Artificial Neural Network Joins the Fight Against Receding Glaciers."</p>
                </ResumeItem>

              </div>
            </div>
          </div>
        </section>

        {/* ABOUT ME */}
        <section className="max-w-4xl mx-auto px-6 py-24">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            {/* Changes made:
              1. w-40 h-40 (mobile) -> slightly larger than w-32
              2. md:w-64 md:h-64 (desktop) -> larger than w-48
              3. rounded-xl -> makes it a square with slightly soft corners (remove -xl for sharp corners)
            */}
            <div className="w-40 h-40 md:w-64 md:h-64 rounded flex-shrink-0 overflow-hidden border-2 border-stone-100 shadow-sm">
              <img 
                src="/0207_shifted_portrait_crop-1.jpg" 
                alt="Daniel Burgess" 
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl md:text-2xl font-bold text-stone-900">About Me</h2>
              <p className="text-stone-600 leading-relaxed">
                I am currently a Ph.D. candidate at Columbia University, where I explore the intersection of plasma physics and high-performance computing. My academic journey began in Astrophysics, but I found myself drawn to the immediate and complex challenges of fusion energy.
              </p>
              <p className="text-stone-600 leading-relaxed">
                When I am not debugging Fortran code or running equilibrium solvers, I enjoy producing music and exploring the intersection of art and science. I believe that the same creativity required to mix a track is applicable to solving non-linear physics problems.
              </p>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-stone-900 text-stone-400 py-12 text-sm">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-end gap-6">
            
            {/* Left Side: Copyright */}
            <div className="w-full md:w-auto text-center md:text-left mb-6 md:mb-0">
              <p>&copy; {new Date().getFullYear()} Daniel Burgess.</p>
              <p>All rights reserved.</p>
            </div>

            {/* Right Side: Simulation Description */}
            <div className="max-w-lg text-left md:text-right text-stone-500 text-xs leading-relaxed font-mono opacity-80">
              <p>
                This simulation models the electrostatic two-stream instability in a collisionless, unmagnetized plasma using a 1D Particle-in-Cell (PIC) that follows the method of Philip Mocz. 
                The system is initialized with two counter-streaming beams totaling 4 × 10⁶ electrons over a neutralizing ion background with drift velocities of v_b = ± 3.0 ω_p⁻¹ 
                and a thermal spread of v_th = 1.0, resulting in a system Debye length of λ_D = 1.0 and a grid resolution of Δx = 0.1 λ_D.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}