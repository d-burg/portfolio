"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { ChevronDown, Github, GraduationCap, Linkedin, Mail } from "lucide-react";

// null on the server / during hydration, so no video is rendered (and thus
// downloaded) until the real breakpoint is known.
function useMediaQuery(query: string): boolean | null {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    [query]
  );
  return useSyncExternalStore<boolean | null>(
    subscribe,
    () => window.matchMedia(query).matches,
    () => null
  );
}

function SocialLink({
  icon: Icon,
  label,
  href,
}: {
  icon: React.ElementType;
  label: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="group flex items-center gap-2 text-stone-600 transition-colors hover:text-accent"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
      <span className="font-medium">{label}</span>
    </a>
  );
}

function HeroVideo({
  src,
  poster,
  reducedMotion,
}: {
  src: string;
  poster: string;
  reducedMotion: boolean;
}) {
  if (reducedMotion) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={poster} alt="" className="h-full w-full object-cover" />;
  }
  return (
    <video
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
      poster={poster}
      aria-hidden
      className="h-full w-full object-cover"
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}

export default function Hero() {
  const contentRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLAnchorElement>(null);
  const mobileVideoRef = useRef<HTMLDivElement>(null);
  const desktopVideoRef = useRef<HTMLDivElement>(null);
  // Only the video matching the current breakpoint is mounted, so the other
  // file is never downloaded.
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)") ?? false;

  // Fade the hero out as the content panel slides over it, so the panel edge
  // never slices through legible text.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      const p = Math.min(1, window.scrollY / (window.innerHeight * 0.55));
      if (contentRef.current) {
        contentRef.current.style.opacity = String(1 - p);
        contentRef.current.style.transform = `translateY(${p * -24}px)`;
      }
      if (hintRef.current) {
        hintRef.current.style.opacity = String(1 - p * 2.5);
      }
      // Frost the simulation as the translucent panel slides over it (the
      // panel itself uses no backdrop-filter; see globals.css).
      const frost = Math.min(1, window.scrollY / (window.innerHeight * 0.9));
      for (const ref of [mobileVideoRef, desktopVideoRef]) {
        if (ref.current) {
          ref.current.style.filter = frost === 0 ? "none" : `blur(${(frost * 12).toFixed(1)}px)`;
          ref.current.style.transform = frost === 0 ? "none" : `scale(${1 + frost * 0.06})`;
        }
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      {/* Boot trace: two strokes leave the top-left corner and meet at the
          bottom-right. pathLength=1 keeps the speed uniform on any screen. */}
      <div className="intro-trace pointer-events-none fixed inset-4 z-50" aria-hidden>
        <svg
          className="h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M 0.4 0.4 L 99.6 0.4 L 99.6 99.6"
            pathLength={1}
            stroke="#78716c"
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M 0.4 0.4 L 0.4 99.6 L 99.6 99.6"
            pathLength={1}
            stroke="#78716c"
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      <section className="fixed inset-0 z-0 h-screen" aria-label="Introduction">
        <div className="flex h-full w-full flex-col md:grid md:grid-cols-2">
          {/* Mobile: video band on top */}
          <div className="relative block h-[34vh] w-full overflow-hidden md:hidden">
            <div ref={mobileVideoRef} className="h-full w-full will-change-transform">
              {isDesktop === false && (
                <HeroVideo
                  src="/sim-mobile.mp4"
                  poster="/sim-mobile-poster.jpg"
                  reducedMotion={reducedMotion}
                />
              )}
            </div>
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-stone-50" />
          </div>

          {/* Text */}
          <div
            ref={contentRef}
            className="z-10 flex flex-1 flex-col justify-center px-7 will-change-transform md:h-full md:flex-none md:pl-28 md:pr-12"
          >
            <div className="max-w-xl space-y-5 md:space-y-7">
              <p className="intro-rise intro-rise-1 font-mono text-[11px] uppercase tracking-[0.25em] text-accent md:text-xs">
                Columbia University · Plasma Physics Laboratory
              </p>
              <h1 className="intro-rise intro-rise-1 text-4xl font-bold tracking-tight text-stone-900 md:text-6xl">
                Hi, I&apos;m Daniel!
              </h1>
              <div className="intro-rise intro-rise-2 space-y-4 text-base font-light leading-relaxed text-stone-600 md:text-xl">
                <p>
                  I&apos;m a Ph.D. candidate specializing in nuclear fusion, plasma
                  physics, and scientific computing.
                </p>
                <p>
                  My research is focused on magnetohydrodynamic (MHD) stability of
                  tokamaks, building open source simulation tools, and validating
                  instability theory with experimental data.
                </p>
              </div>
              <div className="intro-rise intro-rise-3 flex flex-wrap gap-x-6 gap-y-3 pt-2 text-sm md:text-base">
                <SocialLink
                  href="https://scholar.google.com/citations?user=wvKZqjYAAAAJ&hl=en"
                  icon={GraduationCap}
                  label="Google Scholar"
                />
                <SocialLink href="https://github.com/d-burg" icon={Github} label="GitHub" />
                <SocialLink
                  href="https://www.linkedin.com/in/daniel-a-burgess/"
                  icon={Linkedin}
                  label="LinkedIn"
                />
                <SocialLink href="mailto:dab2245@columbia.edu" icon={Mail} label="Email" />
              </div>
            </div>
          </div>

          {/* Desktop: video fills the right column (file is pre-rotated) */}
          <div className="relative hidden h-full overflow-hidden md:block">
            <div ref={desktopVideoRef} className="h-full w-full will-change-transform">
              {isDesktop && (
                <HeroVideo
                  src="/sim-desktop.mp4"
                  poster="/sim-desktop-poster.jpg"
                  reducedMotion={reducedMotion}
                />
              )}
            </div>
            <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-stone-50 to-transparent" />
          </div>
        </div>

        {/* Scroll hint */}
        <a
          ref={hintRef}
          href="#publications"
          aria-label="Scroll to publications"
          className="intro-rise intro-rise-4 absolute bottom-7 left-7 z-10 text-stone-400 transition-colors hover:text-stone-600 md:left-28"
        >
          <ChevronDown className="h-6 w-6 animate-bounce md:h-7 md:w-7" />
        </a>
      </section>
    </>
  );
}
