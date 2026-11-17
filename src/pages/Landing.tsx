import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/sections/Hero";
import { Problem } from "@/sections/Problem";
import SelectedWork from "@/sections/SelectedWork";
import { Automation } from "@/sections/Automation";
import { Impact } from "@/sections/Impact";
import MarketingImpactSequence from "@/sections/MarketingImpactSequence";
import { PackagesShowcase } from "@/sections/PackagesShowcase";
import { FinalCta } from "@/sections/FinalCta";
import { CHAPTERS } from "@/data/site";
import { gsap, navigateHash, ScrollTrigger, useGSAP } from "@/lib/smooth";
import { cn } from "@/utils/cn";

export function Landing() {
  const bgRef = useRef<HTMLDivElement>(null);
  const shell = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  /* Parent effects run after all section effects, so every pin already exists
     here. refreshPriority:-1 makes these refresh after the pins as well. */
  useGSAP(
    () => {
      // ScrollTrigger: fluid background morph — each [data-bg] block tweens the fixed backdrop colour.
      gsap.utils.toArray<HTMLElement>("[data-bg]").forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 55%",
          end: "bottom 55%",
          refreshPriority: -1,
          onToggle: (self) => {
            if (self.isActive) gsap.to(bgRef.current, { backgroundColor: el.dataset.bg, duration: 0.9, ease: "power2.out", overwrite: "auto" });
          },
        });
      });
      // ScrollTrigger: chapter rail active state.
      CHAPTERS.forEach((c, i) => {
        const el = document.getElementById(c.id);
        if (!el) return;
        ScrollTrigger.create({
          trigger: el,
          start: "top 50%",
          end: "bottom 50%",
          refreshPriority: -1,
          onToggle: (self) => self.isActive && setActive(i),
        });
      });
    },
    { scope: shell },
  );

  // Refresh once fonts/images have settled, then honour any incoming #hash (e.g. "/#pricing" from a package page).
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    let cancelled = false;
    const settle = async () => {
      try {
        await document.fonts?.ready;
      } catch {
        /* ignore */
      }
      if (cancelled) return;
      ScrollTrigger.refresh();
      const hash = window.location.hash;
      if (hash) window.setTimeout(() => navigateHash(hash, true), 120);
    };
    settle();
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    return () => {
      cancelled = true;
      window.removeEventListener("load", onLoad);
    };
  }, []);

  return (
    <>
      <div ref={shell} className="relative">
        <div ref={bgRef} aria-hidden="true" className="fixed inset-0 -z-10" style={{ backgroundColor: "#0b0b0a" }} />
        <div className="grain" aria-hidden="true" />
        <a href="#main-content" className="micro fixed left-4 top-4 z-[90] -translate-y-24 bg-cream px-4 py-3 text-ink focus:translate-y-0">
          SKIP TO CONTENT
        </a>
        <Header />

        {/* Chapter rail (desktop) */}
        <nav aria-label="Chapters" className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-3 xl:flex">
          {CHAPTERS.map((c, i) => (
            <a key={c.id} href={`#${c.id}`} className="group flex items-center gap-3" aria-current={active === i ? "true" : undefined}>
              <span
                className={cn(
                  "micro text-[10px] transition-all duration-500",
                  "translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100", active === i ? "text-cream" : "text-muted",
                )}
              >
                {c.label}
              </span>
              <span className={cn("block h-px transition-all duration-500", active === i ? "w-8 bg-copper" : "w-4 bg-cream/30 group-hover:bg-cream/70")} />
            </a>
          ))}
        </nav>

        <main id="main-content">
          <Hero />
          <Problem />
          <SelectedWork />
          <Automation />
          <Impact />
          <MarketingImpactSequence />
          <PackagesShowcase />
          <FinalCta />
        </main>
        <Footer />
      </div>
    </>
  );
}
