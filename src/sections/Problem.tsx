import { useRef } from "react";
import { LEAKS } from "@/data/site";
import eagleFlight from "@/assets/eagle-flight-wide.jpg";
import { ChapterLabel, SplitWords } from "@/components/ui";
import { gsap, useGSAP } from "@/lib/smooth";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const pad = (n: number) => String(n).padStart(2, "0");

export function Problem() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const n = LEAKS.length;

  useGSAP(
    () => {
      if (reduced) return;
      const q = gsap.utils.selector(root);
      const statements = q(".leak");

      // Hidden start state (set by JS so no-JS / reduced-motion users see everything).
      gsap.set(q(".leak .sw > span"), { yPercent: 115 });
      gsap.set(q(".leak-meta, .leak-ghost"), { opacity: 0 });
      gsap.set(q(".final-line .sw > span"), { yPercent: 115 });
      gsap.set(q(".final-sub"), { opacity: 0, y: 20 });
      gsap.set(q(".leaks-hud"), { opacity: 0 });
      gsap.set(q(".leak-handoff"), { autoAlpha: 0 });
      gsap.set(q(".leak-eagle"), { opacity: 0, scale: 1.18, filter: "blur(10px)" });

      /* Timeline units. One unit = 65% of the viewport of scroll.
       *  0 → 1      the hero's last frame ("Sharp eyes find the leak") is repeated here,
       *             so the hand-off is invisible; it lifts away while the eagle glides in.
       *  1 → 1 + n  one leak per unit.
       *  then       "Find the leak. Fix the flow."
       *  last 100vh the copy fades in place while the eagle holds still and
       *             "Built to work" slides up over it (that section overlaps by 100svh). */
      const UNIT = 0.65;
      const START = 0.55;
      const FINAL = START + n + 0.1;
      const HOLD = FINAL + 1.0;
      const OVER = 1 / UNIT; // exactly one viewport of scroll, in units
      const TOTAL = HOLD + OVER;

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: q(".leaks-pin")[0],
          start: "top top",
          end: () => `+=${TOTAL * window.innerHeight * UNIT}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          // Invisible hand-off: switch this stage on exactly when the hero lets go.
          onEnter: () => gsap.set(q(".leak-handoff"), { autoAlpha: 1 }),
          onLeaveBack: () => gsap.set(q(".leak-handoff"), { autoAlpha: 0 }),
        },
      });

      // Intro: bridge line lifts away, eagle glides in from depth (never a hard box).
      tl.to(q(".leak-bridge"), { y: -60, opacity: 0, filter: "blur(10px)", duration: 0.45, ease: "power2.in" }, 0.05)
        .to(q(".leak-eagle"), { opacity: 0.55, scale: 1, filter: "blur(0px)", duration: 0.9, ease: "power2.out" }, 0.1)
        .to(q(".leaks-hud"), { opacity: 1, duration: 0.3 }, 0.35);

      statements.forEach((el, i) => {
        const at = START + i;
        const words = el.querySelectorAll(".sw > span");
        const meta = el.querySelectorAll(".leak-meta");
        tl.to(words, { yPercent: 0, duration: 0.32, stagger: 0.022, ease: "power3.out" }, at)
          .to(meta, { opacity: 1, duration: 0.2 }, at + 0.12)
          .to(q(`.leak-ghost-${i}`), { opacity: 1, duration: 0.25 }, at)
          .fromTo(q(`.seg-${i}`), { scaleX: 0 }, { scaleX: 1, duration: 0.9 }, at)
          .to(el, { opacity: 0, y: -50, filter: "blur(10px)", scale: 0.97, duration: 0.24, ease: "power2.in" }, at + 0.8)
          .to(q(`.leak-ghost-${i}`), { opacity: 0, duration: 0.2 }, at + 0.82);
      });

      // Payoff line, eagle brightens slightly behind it.
      tl.to(q(".final-line .sw > span"), { yPercent: 0, duration: 0.45, stagger: 0.05, ease: "power3.out" }, FINAL)
        .to(q(".final-sub"), { opacity: 1, y: 0, duration: 0.3 }, FINAL + 0.3)
        .to(q(".leak-eagle"), { opacity: 0.75, duration: 0.6 }, FINAL)
        .to(q(".leaks-hud"), { opacity: 0, duration: 0.4 }, FINAL + 0.2);

      // Slide-over: copy fades where it stands, eagle holds; next section covers it.
      tl.to(q(".final-line, .final-sub"), { opacity: 0, duration: OVER * 0.45 }, HOLD)
        .to({}, { duration: OVER }, HOLD);
    },
    { scope: root, dependencies: [reduced], revertOnUpdate: true },
  );

  if (reduced) {
    return (
      <section id="leaks" data-bg="#0d0b0a" aria-labelledby="leaks-title" className="pad-x py-28">
        <ChapterLabel index="02" label="THE LEAK" />
        <h2 id="leaks-title" className="display mt-10 text-[clamp(48px,7vw,110px)]">
          Every business <em>leaks.</em>
        </h2>
        <ol className="mt-14 divide-y divide-line border-y border-line">
          {LEAKS.map((l, i) => (
            <li key={l.tag} className="grid gap-2 py-7 md:grid-cols-[200px_1fr]">
              <span className="micro text-copper">
                LEAK {pad(i + 1)} · {l.tag}
              </span>
              <div>
                <p className="display text-3xl normal-case md:text-5xl">{l.line}</p>
                <p className="mt-2 text-muted">{l.note}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="display mt-16 text-5xl md:text-7xl">
          Find the leak. <em>Fix the flow.</em>
        </p>
      </section>
    );
  }

  return (
    <section id="leaks" ref={root} data-bg="#0d0b0a" aria-labelledby="leaks-title" className="overlap-prev relative z-[1]">
      <div className="leaks-pin relative h-svh w-full overflow-hidden">
        {/* Stays see-through while this chapter rises over the pinned hero, then switches on at the hand-off */}
        <div aria-hidden="true" className="leak-handoff leak-bg absolute inset-0 bg-[#0d0b0a]" />
        {/* Eagle in flight — feathered into the page (radial mask + lighten blend), no visible photo edge */}
        {/* Centred by a flex wrapper (not translate %) so GSAP can never bake a wrong offset before the image has loaded */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-[20%] bottom-0 z-0 flex items-center justify-center overflow-visible">
          <img
            src={eagleFlight}
            alt=""
            width={1568}
            height={672}
            className="leak-eagle h-auto w-[150vw] max-w-none shrink-0 opacity-0 mix-blend-lighten md:w-[118vw]"
            style={{
              aspectRatio: "1568 / 672",
              WebkitMaskImage: "radial-gradient(ellipse 50% 46% at 50% 50%, #000 52%, transparent 100%)",
              maskImage: "radial-gradient(ellipse 50% 46% at 50% 50%, #000 52%, transparent 100%)",
            }}
          />
        </div>
        {/* Readability scrim behind the statements */}
        <div aria-hidden="true" className="leak-handoff pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(90deg,#0d0b0ad9_0%,#0d0b0a8c_45%,transparent_80%)]" />

        {/* Hand-off: identical to the hero's final frame */}
        <div aria-hidden="true" className="leak-handoff pointer-events-none absolute inset-0 z-[12]">
          <p className="leak-bridge display absolute inset-0 grid place-items-center px-6 text-center text-[clamp(34px,6vw,92px)]">
            <span>
              Sharp eyes
              <br />
              <em>find the leak.</em>
            </span>
          </p>
        </div>
        {/* soft copper glow */}
        <div className="leak-handoff pointer-events-none absolute -left-1/4 top-1/3 h-[60vh] w-[70vw] rounded-full bg-[radial-gradient(closest-side,#c07a5224,transparent)] blur-2xl" />

        <div className="leaks-hud pad-x absolute inset-x-0 top-24 z-10 flex items-center justify-between">
          <ChapterLabel index="02" label="THE LEAK" />
          <span className="mono hidden items-center gap-2 text-[11px] text-muted sm:flex">
            <span className="dot pulse-dot" /> LEAK SCAN · RUNNING
          </span>
        </div>

        <h2 id="leaks-title" className="visually-hidden">
          Where businesses leak leads and time
        </h2>

        {/* Ghost index numbers */}
        <div aria-hidden="true" className="pointer-events-none absolute bottom-[-4vw] right-[-1vw]">
          {LEAKS.map((_, i) => (
            <span
              key={i}
              className={`leak-ghost leak-ghost-${i} display absolute bottom-0 right-0 text-[34vw] leading-none text-transparent md:text-[26vw]`}
              style={{ WebkitTextStroke: "1px #f2f0e91c" }}
            >
              {pad(i + 1)}
            </span>
          ))}
        </div>

        {/* Statements — stacked, sequenced by the timeline */}
        <div className="pad-x relative z-10 flex h-full items-center">
          <div className="relative w-full max-w-[1250px]">
            {LEAKS.map((l, i) => (
              <article key={l.tag} className="leak absolute inset-0 flex flex-col justify-center" aria-label={`Leak ${i + 1}: ${l.line}`}>
                <div className="leak-meta micro mb-6 flex items-center gap-3 text-copper">
                  LEAK {pad(i + 1)}/{pad(n)} <span className="h-px w-10 bg-copper/60" /> {l.tag}
                </div>
                <p className="display text-[clamp(38px,6.4vw,112px)] normal-case !leading-[0.94]">
                  <SplitWords text={l.line} />
                </p>
                <p className="leak-meta mt-6 max-w-md text-lg text-muted">{l.note}</p>
              </article>
            ))}

            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
              <p className="final-line display text-[clamp(48px,9vw,150px)]">
                <SplitWords text="Find the leak." />
                <br />
                <em>
                  <SplitWords text="Fix the flow." />
                </em>
              </p>
              <p className="final-sub mt-8 max-w-lg text-lg text-muted">
                Every leak costs you. Most are invisible from the inside — so we look from the outside, the way your customers do.
              </p>
            </div>
          </div>
        </div>

        {/* Segmented scan meter */}
        <div className="leaks-hud pad-x absolute inset-x-0 bottom-8 z-10">
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
            {LEAKS.map((l, i) => (
              <div key={l.tag}>
                <div className="h-[2px] overflow-hidden bg-line">
                  <div className={`seg-${i} h-full origin-left scale-x-0 bg-copper`} />
                </div>
                <span className="micro mt-2 hidden text-[10px] text-dim md:block">{l.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
