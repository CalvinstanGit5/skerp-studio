import { useEffect, useRef, useState, type CSSProperties } from "react";
import { HERO_IMAGE, HERO_IMAGE_ALT, LEAKS, TAGLINE } from "@/data/site";
import { Arrow, SplitWords } from "@/components/ui";
import { whatsappHref } from "@/lib/contact";
import { gsap, useGSAP } from "@/lib/smooth";

/**
 * Hero — eagle sits on the right (reference layout), a reticle locks onto its eye,
 * then the pinned scroll pushes the camera INTO the eye, blacks out, and resolves
 * the bridge line "Sharp eyes, find the leak."
 *
 * All positions are in the eagle photo's own coordinate space (1280 × 720),
 * so the reticle and the zoom origin stay locked to the eye at every size.
 */
const EYE = { x: 53.36, y: 25.28 };
const LEADER = "627,168 500,136 468,136";

const EMBERS = [
  { x: 78.5, y: 8, dx: -34, dy: -170, s: 2.5, t: 7.5, dl: 0.2 },
  { x: 82.5, y: 20, dx: -18, dy: -230, s: 2, t: 9, dl: 2.1 },
  { x: 84.5, y: 33, dx: -46, dy: -270, s: 3, t: 8.2, dl: 4 },
  { x: 85.5, y: 46, dx: 14, dy: -300, s: 2, t: 10, dl: 1.2 },
  { x: 84, y: 56, dx: -28, dy: -250, s: 2.5, t: 8.8, dl: 5.6 },
  { x: 80.5, y: 14, dx: 22, dy: -200, s: 1.5, t: 9.5, dl: 6.4 },
  { x: 85, y: 40, dx: -52, dy: -220, s: 1.5, t: 7.8, dl: 7.3 },
  { x: 83, y: 27, dx: 8, dy: -260, s: 2, t: 10.5, dl: 3.2 },
];

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/·";

function useScramble(text: string, animate: boolean) {
  const [out, setOut] = useState(text);
  useEffect(() => {
    if (!animate) {
      setOut(text);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 650);
      const shown = Math.floor(t * text.length);
      let next = "";
      for (let i = 0; i < text.length; i++) next += i < shown || text[i] === " " ? text[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      setOut(next);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, animate]);
  return out;
}

function FindingTicker({ running }: { running: boolean }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => setI((v) => (v + 1) % LEAKS.length), 3600);
    return () => window.clearInterval(t);
  }, [running]);
  const leak = LEAKS[i];
  const text = useScramble(`${leak.tag} · ${leak.line.replace(/\.$/, "")}`.toUpperCase(), running);
  return (
    <>
      <span className="block text-dim">
        LEAK FOUND {String(i + 1).padStart(2, "0")}/{String(LEAKS.length).padStart(2, "0")}
      </span>
      <span className="mt-1.5 block text-cream">{text}</span>
    </>
  );
}

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);
  const [running, setRunning] = useState(true);
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Wait for the eagle to decode so it never pops in half-loaded.
  useEffect(() => {
    const img = root.current?.querySelector<HTMLImageElement>(".hero-img");
    let done = false;
    const go = () => {
      if (!done) {
        done = true;
        setReady(true);
      }
    };
    const fallback = window.setTimeout(go, 1500);
    if (!img) go();
    else if (img.complete && img.naturalWidth) (img.decode ? img.decode().catch(() => undefined) : Promise.resolve()).then(go);
    else {
      img.addEventListener("load", go, { once: true });
      img.addEventListener("error", go, { once: true });
    }
    return () => window.clearTimeout(fallback);
  }, []);

  // Pointer parallax (desktop only) on the outer media box; GSAP owns the inner zoom.
  useEffect(() => {
    const el = root.current;
    if (!el || reduced || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    const step = () => {
      x += (tx - x) * 0.06;
      y += (ty - y) * 0.06;
      el.style.setProperty("--px", x.toFixed(4));
      el.style.setProperty("--py", y.toFixed(4));
      raf = Math.abs(tx - x) > 0.001 || Math.abs(ty - y) > 0.001 ? requestAnimationFrame(step) : 0;
    };
    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(step);
    };
    el.addEventListener("pointermove", onMove);
    return () => {
      el.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const intro = gsap.timeline({ defaults: { ease: "expo.out" }, delay: 0.15 });
        intro
          .from(".hero-eyebrow", { opacity: 0, y: 14, duration: 1 }, 0.4)
          .from(".hero-title .sw > span", { yPercent: 115, duration: 1.4, stagger: 0.09 }, 0.5)
          .from(".hero-services .sw > span", { yPercent: 115, duration: 1.1, stagger: 0.035 }, 0.85)
          .from(".hero-fade", { opacity: 0, y: 22, duration: 1.1, stagger: 0.1 }, 1.1);

        /* Pinned exit: copy lifts away, the camera dives into the eye, blackout, bridge line. */
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: ".hero-pin",
            start: "top top",
            end: "+=130%",
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            onUpdate: (self) => setRunning(self.progress < 0.05),
          },
        });
        tl.to(".hero-copy", { y: -140, opacity: 0, filter: "blur(10px)", duration: 0.35 }, 0)
          .to(".hero-bottom", { opacity: 0, y: 30, duration: 0.2 }, 0)
          .to(".hero-hud", { opacity: 0, duration: 0.15 }, 0)
          .to(".hero-shade", { opacity: 0, duration: 0.3 }, 0)
          .to(".hero-media-inner", { scale: 9, duration: 1.1, ease: "power2.in" }, 0.02)
          .to(".hero-dark", { opacity: 1, duration: 0.35 }, 0.62)
          .fromTo(".hero-bridge .sw > span", { yPercent: 115 }, { yPercent: 0, duration: 0.3, stagger: 0.04, ease: "power3.out" }, 0.78)
          .to({}, { duration: 0.2 });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="top" ref={root} data-bg="#0b0b0a" aria-labelledby="hero-title" className={`hero relative ${ready ? "is-ready" : ""}`}>
      <div className="hero-pin relative h-svh min-h-[560px] w-full overflow-hidden">
        {/* Eagle (reference layout: right side, bleeding off the edge) */}
        <div className="hero-media" aria-hidden="false">
          <div className="hero-media-inner" style={{ transformOrigin: `${EYE.x}% ${EYE.y}%` }}>
            <img src={HERO_IMAGE} alt={HERO_IMAGE_ALT} width={1280} height={720} fetchPriority="high" className="hero-img" draggable={false} />
            <div className="hero-hud" aria-hidden="true">
              {EMBERS.map((e, i) => (
                <span
                  key={i}
                  className="ember"
                  style={{ left: `${e.x}%`, top: `${e.y}%`, "--dx": `${e.dx}px`, "--dy": `${e.dy}px`, "--s": `${e.s}px`, "--t": `${e.t}s`, "--dl": `${e.dl}s` } as CSSProperties}
                />
              ))}
              <div className="reticle hero-reticle" style={{ left: `${EYE.x}%`, top: `${EYE.y}%` }}>
                <span className="reticle-ping" />
                <span className="reticle-ring" />
                <span className="reticle-dash" />
                <span className="reticle-tick n" />
                <span className="reticle-tick e" />
                <span className="reticle-tick s" />
                <span className="reticle-tick w" />
              </div>
              <svg className="hero-leader" viewBox="0 0 1280 720" preserveAspectRatio="none">
                <polyline points={LEADER} vectorEffect="non-scaling-stroke" />
              </svg>
              <p className="hero-finding mono text-[11px] uppercase tracking-[0.08em]">
                <FindingTicker running={ready && running && !reduced} />
              </p>
            </div>
          </div>
        </div>
        <div className="hero-shade" aria-hidden="true" />
        <div className="hero-dark pointer-events-none absolute inset-0 z-[5] bg-ink opacity-0" aria-hidden="true" />

        {/* Bridge line revealed in the blackout */}
        <p aria-hidden="true" className="hero-bridge display pointer-events-none absolute inset-0 z-[6] grid place-items-center px-6 text-center text-[clamp(34px,6vw,92px)]">
          <span>
            <SplitWords text="Sharp eyes" />
            <br />
            <em>
              <SplitWords text="find the leak." />
            </em>
          </span>
        </p>

        <div className="hero-content pad-x relative z-10 flex h-full flex-col justify-end pb-6 lg:pb-8">
          <div className="hero-copy max-w-[880px]">
            <div className="hero-eyebrow micro flex items-center gap-3 text-cream/80">
              <span className="h-px w-6 bg-cream/70" /> AUDITS · AUTOMATION · DIGITAL BUSINESS · SOUTH AFRICA
            </div>
            <h1 id="hero-title" className="hero-title display mt-4 !leading-[0.8] tracking-[-0.085em] lg:mt-5">
              <SplitWords text="SKERP" />
              <br />
              <span className="text-[0.6em] tracking-[-0.07em]">
                <SplitWords text="STUDIO." />
              </span>
            </h1>
            <div className="hero-services display mt-5 !leading-[1.02] text-cream lg:mt-6">
              <SplitWords text="FIND THE LEAK." />
              <br />
              <SplitWords text="FIX THE FLOW." className="text-peach" />
              <br />
              <SplitWords text="KEEP BUSINESS MOVING." />
            </div>
            <p className="hero-fade hero-sub mt-5 text-[16px] leading-relaxed text-cream/75 md:text-[17px]">
              We audit your business to find lost leads, wasted time, and messy follow-ups. Then we automate the right fixes and build the digital front door your
              business needs. <span className="hidden text-cream/50 sm:inline">South African-based, delivering international-quality work.</span>
            </p>
            <div className="hero-fade mt-6 flex flex-wrap items-center gap-x-8 gap-y-4 lg:mt-7">
              <a href="/start" className="btn btn-primary">
                FREE LEAK SCAN <Arrow diagonal />
              </a>
              <a href="/packages" className="link-u">
                VIEW PACKAGES <Arrow diagonal />
              </a>
              <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="link-u">
                WHATSAPP <Arrow diagonal />
              </a>
            </div>
          </div>

          <div className="hero-bottom hero-fade mt-8 flex items-end justify-between border-t border-line pt-4 lg:mt-10">
            <span className="micro italic text-cream/60">{TAGLINE}</span>
            <a href="#leaks" aria-label="Scroll to discover more" className="micro group hidden items-center gap-4 text-cream/70 hover:text-cream sm:flex">
              SCROLL TO EXPLORE
              <span className="scroll-cue-line" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
