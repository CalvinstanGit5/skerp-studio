import { useEffect, useRef, type ReactNode } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { gsap, useGSAP } from "@/lib/smooth";

/** Shell for secondary pages: brand header, gentle scroll reveals (.reveal-up), footer. */
export function PageShell({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prevTitle = document.title;
    const meta = document.head.querySelector<HTMLMetaElement>('meta[name="description"]');
    const prevDesc = meta?.content;
    document.title = title;
    if (meta && description) meta.content = description;
    window.scrollTo(0, 0);
    return () => {
      document.title = prevTitle;
      if (meta && prevDesc) meta.content = prevDesc;
    };
  }, [title, description]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".page-title .sw > span", { yPercent: 115, duration: 1.3, stagger: 0.07, ease: "expo.out", delay: 0.1 });
        // ScrollTrigger: each .reveal-up block fades/lifts in once.
        gsap.utils.toArray<HTMLElement>(".reveal-up").forEach((el) =>
          gsap.from(el, { opacity: 0, y: 40, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 90%" } }),
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="min-h-screen bg-ink">
      <div className="grain" aria-hidden="true" />
      <Header onLanding={false} />
      <main className="pt-[76px]">{children}</main>
      <Footer onLanding={false} />
    </div>
  );
}
