import { useEffect, useRef, useState } from "react";
import { NAV_LINKS } from "@/data/site";
import { Arrow } from "@/components/ui";
import { whatsappHref } from "@/lib/contact";
import { gsap, lockScroll, ScrollTrigger, useGSAP } from "@/lib/smooth";
import { cn } from "@/utils/cn";

/** `onLanding` → hash links stay in-page (smooth via Lenis); otherwise they point back to "/#…". */
export function Header({ onLanding = true }: { onLanding?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const fix = (href: string) => (onLanding || !href.startsWith("#") ? href : `/${href}`);
  const here = typeof window !== "undefined" ? window.location.pathname.replace(/\/+$/, "") : "";

  useGSAP(() => {
    const header = ref.current;
    if (!header) return;
    // ScrollTrigger #1 — whole-page progress bar (scrubbed).
    gsap.fromTo(
      barRef.current,
      { scaleX: 0 },
      { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.4, refreshPriority: -1 } },
    );
    // ScrollTrigger #2 — hide header while scrolling down, reveal on scroll up.
    ScrollTrigger.create({
      start: 0,
      end: "max",
      refreshPriority: -1,
      onUpdate: (self) => {
        const y = self.scroll();
        header.classList.toggle("is-scrolled", y > 40);
        header.classList.toggle("is-hidden", self.direction === 1 && y > 320);
      },
    });
  });

  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const mq = window.matchMedia("(min-width: 1024px)");
    const onMq = () => mq.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      lockScroll(false);
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, [open]);

  return (
    <>
      <header ref={ref} className="site-header pad-x fixed inset-x-0 top-0 z-50 flex h-[76px] items-center justify-between">
        <a href={onLanding ? "#top" : "/"} aria-label="Skerp Studio, back to top" className="relative z-10 flex flex-col leading-none" onClick={() => setOpen(false)}>
          <span className="font-display text-[27px] font-black tracking-[-0.075em]">
            SKERP<span className="text-copper">.</span>
          </span>
          <span className="mt-1 text-[8px] font-bold tracking-[0.42em] text-muted">STUDIO</span>
        </a>

        <nav aria-label="Main navigation" className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={fix(l.href)}
              aria-current={here === l.href ? "page" : undefined}
              className={cn("micro transition-colors hover:text-cream", here === l.href ? "text-copper" : "text-cream/70")}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="relative z-10 flex items-center gap-3">
          <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="btn btn-ghost hidden !min-h-[42px] !px-4 lg:inline-flex">
            WHATSAPP <Arrow diagonal />
          </a>
          <a href="/start" className="btn btn-primary !min-h-[42px] !gap-3 !px-3 sm:!gap-[22px] sm:!px-4">
            FREE<span className="hidden sm:inline"> LEAK</span> SCAN <Arrow diagonal />
          </a>
          <button
            type="button"
            className="grid h-11 w-11 place-items-center border border-line-strong lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="relative block h-3 w-5">
              <span className={cn("absolute left-0 h-px w-5 bg-cream transition-transform duration-300", open ? "top-1.5 rotate-45" : "top-0")} />
              <span className={cn("absolute left-0 h-px w-5 bg-cream transition-transform duration-300", open ? "top-1.5 -rotate-45" : "top-3")} />
            </span>
          </button>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px overflow-hidden bg-line">
          <div ref={barRef} className="h-full origin-left scale-x-0 bg-copper" />
        </div>
      </header>

      {/* Mobile menu */}
      <div
        id="mobile-nav"
        className={cn(
          "pad-x fixed inset-0 z-40 flex flex-col justify-end bg-ink/97 pb-10 pt-28 backdrop-blur-xl transition-[opacity,visibility] duration-500 lg:hidden",
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
        inert={!open}
      >
        <nav aria-label="Mobile navigation" className="flex flex-col">
          {NAV_LINKS.map((l, i) => (
            <a
              key={l.label}
              href={fix(l.href)}
              onClick={() => setOpen(false)}
              className="display border-b border-line py-4 text-[11vw] leading-none transition-all duration-500 sm:text-6xl"
              style={{ transitionDelay: open ? `${80 + i * 50}ms` : "0ms", transform: open ? "none" : "translateY(20px)", opacity: open ? 1 : 0 }}
            >
              {l.label}
            </a>
          ))}
        </nav>
        <a href="/start" onClick={() => setOpen(false)} className="btn btn-copper mt-8 w-full">
          FREE LEAK SCAN <Arrow diagonal />
        </a>
        <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className="btn btn-ghost mt-3 w-full">
          WHATSAPP <Arrow diagonal />
        </a>
      </div>

      <style>{`
        .site-header{transition:transform .6s cubic-bezier(.16,1,.3,1),background-color .4s,backdrop-filter .4s}
        .site-header.is-scrolled{background:#0b0b0acc;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
        .site-header.is-hidden{transform:translateY(-100%)}
      `}</style>
    </>
  );
}
