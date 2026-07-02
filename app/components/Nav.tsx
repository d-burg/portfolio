"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Eye, EyeOff } from "lucide-react";

const LINKS = [
  { id: "publications", label: "Publications" },
  { id: "projects", label: "Projects" },
  { id: "resume", label: "Resume" },
  { id: "about", label: "About" },
];

// The <html> class is the source of truth (set pre-paint from localStorage in
// the layout script); this hook just mirrors it into React.
const BG_EVENT = "bg-style-change";

function useSolidBg() {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener(BG_EVENT, onChange);
      return () => window.removeEventListener(BG_EVENT, onChange);
    },
    () => document.documentElement.classList.contains("bg-solid"),
    () => false
  );
}

function toggleSolidBg() {
  const solid = document.documentElement.classList.toggle("bg-solid");
  try {
    localStorage.setItem("bg-style", solid ? "solid" : "glass");
  } catch {}
  window.dispatchEvent(new Event(BG_EVENT));
}

function BgToggle() {
  const solid = useSolidBg();
  const label = solid
    ? "Show the background simulation through the page"
    : "Hide the background simulation behind the page";
  return (
    <button
      type="button"
      onClick={toggleSolidBg}
      aria-pressed={!solid}
      title={label}
      className="text-stone-400 transition-colors hover:text-stone-700"
    >
      {solid ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      <span className="sr-only">{label}</span>
    </button>
  );
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.55);
      const probe = window.innerHeight * 0.35;
      let current: string | null = null;
      for (const link of LINKS) {
        const el = document.getElementById(link.id);
        if (el && el.getBoundingClientRect().top <= probe) current = link.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <header
      className={`intro-rise intro-rise-4 fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        scrolled
          ? "border-b border-stone-200/80 bg-stone-50/85 backdrop-blur-md"
          : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6">
        <a
          href="#top"
          className="font-semibold tracking-tight text-stone-900"
          aria-label="Back to top"
        >
          <span className="sm:hidden">DB</span>
          <span className="hidden sm:inline">Daniel Burgess</span>
        </a>
        <div className="flex items-center gap-4 text-[11px] sm:gap-6 sm:text-sm md:gap-8">
          {LINKS.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={`relative py-1 transition-colors ${
                active === id
                  ? "text-stone-900"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              {label}
              <span
                className={`absolute inset-x-0 -bottom-0.5 h-px origin-left bg-accent transition-transform duration-300 ${
                  active === id ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </a>
          ))}
          <span className="h-4 w-px bg-stone-300" aria-hidden />
          <BgToggle />
        </div>
      </nav>
    </header>
  );
}
