import { openModal } from "@/components/ModalHost";
import { useRef, type ReactNode } from "react";
import { IMPACT_DEFAULTS as D } from "@/data/site";
import { Arrow, ChapterLabel, SplitWords } from "@/components/ui";
import { IMPACT_DISCLAIMER } from "@/components/calculators/ImpactCalculators";
import { gsap, useGSAP } from "@/lib/smooth";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/utils/cn";

const fmt = (n: number, d = 0) => new Intl.NumberFormat("en-ZA", { maximumFractionDigits: d }).format(n);
const rand = (n: number) => `R${fmt(n)}`;

/* Narrative numbers come from the same defaults as the real calculators. */
const VISITS = D.costPerClick > 0 ? D.adBudget / D.costPerClick : 0;
const ENQUIRIES = (VISITS * D.enquiryRate) / 100;
const MONTH_HOURS = D.adminHoursPerWeek * (52 / 12);
const TIME_VALUE = MONTH_HOURS * D.staffCostPerHour;
const RECOVERED = (D.missedEnquiries * D.recoveryRate) / 100;

interface Step {
  formula: string;
  title: string;
  text: string;
  value: number;
  format: (v: number) => string;
  unit: string;
}

type Q = (sel: string) => Element[];

/* ------------------------------------------------------------------
 * Generic pinned impact sequence. Left: the logic builds step by step.
 * Right: big counter + a custom visual animated by `animateVisual`.
 * ------------------------------------------------------------------ */
function ImpactSequence({
  id,
  index,
  kicker,
  heading,
  steps,
  visual,
  animateVisual,
  ctaLabel,
  onOpen,
  note,
}: {
  id: string;
  index: string;
  kicker: string;
  heading: ReactNode;
  steps: Step[];
  visual: ReactNode;
  animateVisual: (tl: gsap.core.Timeline, q: Q) => void;
  ctaLabel: string;
  onOpen: () => void;
  note: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const S = steps.length;

  useGSAP(
    () => {
      if (reduced) return;
      const q = gsap.utils.selector(root) as Q;
      gsap.set(q(".imp-step"), { opacity: 0, y: 30 });
      gsap.set(q(".imp-num"), { opacity: 0, y: 40 });
      gsap.set(q(".imp-term"), { opacity: 0, y: 10 });
      gsap.set(q(".imp-cta"), { opacity: 0, y: 24 });

      /* ---------- ScrollTrigger: pinned logic sequence ----------
       * Pinned for (steps + 1.6) × 75% of the viewport. Each step
       * owns one timeline unit: its line appears (previous dims),
       * its counter counts up, its formula term joins the equation. */
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: q(".imp-pin")[0],
          start: "top top",
          end: () => `+=${(S + 1.6) * window.innerHeight * 0.75}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      steps.forEach((s, i) => {
        const el = q(`.imp-num-${i} .imp-value`)[0];
        const proxy = { v: 0 };
        tl.to(q(`.imp-step-${i}`), { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, i)
          .to(q(`.imp-term-${i}`), { opacity: 1, y: 0, duration: 0.25 }, i + 0.1)
          .to(q(`.imp-num-${i}`), { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, i + 0.05)
          .to(
            proxy,
            {
              v: s.value,
              duration: 0.6,
              ease: "power2.out",
              onUpdate: () => {
                if (el) el.textContent = s.format(proxy.v);
              },
            },
            i + 0.05,
          );
        if (i < S - 1) {
          tl.to(q(`.imp-step-${i}`), { opacity: 0.28, duration: 0.2 }, i + 0.85).to(q(`.imp-num-${i}`), { opacity: 0, y: -40, duration: 0.2, ease: "power2.in" }, i + 0.85);
        }
      });
      animateVisual(tl, q);
      tl.to(q(".imp-cta"), { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, S - 0.2).to({}, { duration: 0.9 });
    },
    { scope: root, dependencies: [reduced], revertOnUpdate: true },
  );

  return (
    <div id={id} ref={root} className="relative">
      <div className={cn("imp-pin pad-x relative w-full", reduced ? "py-24" : "flex min-h-svh flex-col justify-center py-24 md:h-svh md:py-0")}>
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
          <div>
            <ChapterLabel index={index} label={kicker} />
            <h3 className="display mt-6 text-[clamp(36px,4.6vw,76px)]">{heading}</h3>
            <ol className="mt-8 space-y-3 md:space-y-5">
              {steps.map((s, i) => (
                <li key={s.title} className={`imp-step imp-step-${i} grid grid-cols-[64px_1fr] gap-4 border-t border-line pt-3 md:pt-4`}>
                  <span className="mono pt-1 text-[12px] text-copper">{s.formula}</span>
                  <div>
                    <p className="text-[17px] font-semibold leading-snug md:text-xl">{s.title}</p>
                    <p className="mt-1 hidden text-sm text-muted md:block">{s.text}</p>
                    {reduced ? <p className="mt-1 font-display text-2xl font-bold">{s.format(s.value)} <span className="text-sm font-normal text-muted">{s.unit}</span></p> : null}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="relative">
            {/* Big counters (stacked) */}
            {!reduced && (
              <div className="relative h-[92px] md:h-[150px]">
                {steps.map((s, i) => (
                  <div key={s.title} className={`imp-num imp-num-${i} absolute inset-0`}>
                    <span className="micro text-muted">{s.unit}</span>
                    <strong className="imp-value display mt-1 block text-[clamp(56px,8vw,128px)] normal-case text-peach">{s.format(0)}</strong>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 md:mt-8">{visual}</div>
            {/* Equation */}
            <p className="mono mt-6 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-cream/80">
              {steps.map((s, i) => (
                <span key={s.title} className={`imp-term imp-term-${i}`}>
                  {s.formula}
                </span>
              ))}
            </p>
            <div className="imp-cta mt-8 flex flex-col items-start gap-3">
              <button type="button" onClick={onOpen} className="btn btn-copper">
                {ctaLabel} <Arrow diagonal />
              </button>
              <p className="max-w-md text-xs text-dim">{note}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Ads visual: 200 visit dots → 8 light up ---------------- */
const DOT_COUNT = Math.min(Math.round(VISITS), 400);
const HOT = new Set(Array.from({ length: Math.round(ENQUIRIES) }, (_, k) => Math.floor(((k + 0.5) * DOT_COUNT) / Math.max(1, Math.round(ENQUIRIES)))));

function AdsVisual() {
  return (
    <div className="border border-line bg-ink-2/60 p-4 md:p-6">
      <div className="micro mb-4 flex justify-between text-dim">
        <span>EACH DOT = ONE VISIT</span>
        <span className="text-copper">● ENQUIRY</span>
      </div>
      <div className="grid gap-[5px] md:gap-2" style={{ gridTemplateColumns: "repeat(20, minmax(0, 1fr))" }}>
        {Array.from({ length: DOT_COUNT }, (_, i) => (
          <span
            key={i}
            className={cn(
              "ad-dot aspect-square rounded-full",
              HOT.has(i) ? "ad-hot bg-copper shadow-[0_0_14px_#c07a52]" : "ad-cold bg-cream opacity-20",
            )}
          />
        ))}
      </div>
    </div>
  );
}

function animateAds(tl: gsap.core.Timeline, q: Q) {
  gsap.set(q(".ad-dot"), { opacity: 0, scale: 0 });
  gsap.set(q(".ad-hot"), { backgroundColor: "#f2f0e9", boxShadow: "0 0 0px #c07a5200" });
  tl.to(q(".ad-dot"), { opacity: 0.85, scale: 1, duration: 0.6, stagger: { amount: 0.5, from: "start" } }, 1.05)
    .to(q(".ad-cold"), { opacity: 0.16, duration: 0.3 }, 2.1)
    .to(q(".ad-hot"), { backgroundColor: "#c07a52", scale: 1.5, opacity: 1, boxShadow: "0 0 14px #c07a52", duration: 0.3, stagger: 0.03 }, 2.1)
    .to(q(".ad-hot"), { scale: 1.9, duration: 0.3, stagger: 0.03, ease: "power2.inOut" }, 3.1);
}

/* ---------------- Time visual: week grid → month bar → recovered ---------------- */
const ADMIN_PER_DAY = (() => {
  const total = Math.round(D.adminHoursPerWeek);
  return Array.from({ length: 5 }, (_, d) => Math.floor(total / 5) + (d < total % 5 ? 1 : 0));
})();

function TimeVisual() {
  return (
    <div className="space-y-4">
      <div className="tv-week border border-line bg-ink-2/60 p-4 md:p-5">
        <div className="micro mb-3 flex justify-between text-dim">
          <span>ONE WORKING WEEK · 40 HRS</span>
          <span className="text-copper">■ REPETITIVE ADMIN</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {["MON", "TUE", "WED", "THU", "FRI"].map((day, d) => (
            <div key={day}>
              <div className="grid gap-1">
                {Array.from({ length: 8 }, (_, h) => (
                  <span key={h} className={cn("h-2.5 md:h-3.5", h >= 8 - ADMIN_PER_DAY[d] ? "tv-admin bg-copper" : "bg-cream/10")} />
                ))}
              </div>
              <span className="micro mt-2 block text-center text-[9px] text-dim">{day}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="tv-month border border-line bg-ink-2/60 p-4 md:p-5">
        <div className="micro mb-3 flex justify-between text-dim">
          <span>ADMIN HOURS / MONTH</span>
          <span>40-HR WEEK →|</span>
        </div>
        <div className="relative h-3 bg-cream/10">
          <div className="tv-bar absolute inset-y-0 left-0 origin-left bg-copper" style={{ width: `${Math.min(100, (MONTH_HOURS / 40) * 100)}%` }} />
        </div>
        <p className="mt-3 text-sm text-muted">That's almost a full working week, every month.</p>
      </div>
      <div className="tv-rec border border-line bg-ink-2/60 p-4 md:p-5">
        <div className="micro mb-3 text-dim">MISSED ENQUIRIES / MONTH · RECOVERED BY FOLLOW-UP</div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: Math.min(D.missedEnquiries, 30) }, (_, i) => (
            <span key={i} className={cn("h-4 w-4 rounded-full", i < Math.round(RECOVERED) ? "tv-ok bg-ok shadow-[0_0_12px_#3ddc8466]" : "bg-cream/15")} />
          ))}
        </div>
      </div>
    </div>
  );
}

function animateTime(tl: gsap.core.Timeline, q: Q) {
  gsap.set(q(".tv-month, .tv-rec"), { opacity: 0.18 });
  gsap.set(q(".tv-admin"), { backgroundColor: "rgba(242,240,233,0.1)" });
  gsap.set(q(".tv-bar"), { scaleX: 0 });
  gsap.set(q(".tv-ok"), { backgroundColor: "rgba(242,240,233,0.15)", boxShadow: "0 0 0px #3ddc8400" });
  tl.to(q(".tv-admin"), { backgroundColor: "#c07a52", duration: 0.5, stagger: 0.05 }, 0.1)
    .to(q(".tv-month"), { opacity: 1, duration: 0.25 }, 1)
    .to(q(".tv-week"), { opacity: 0.45, duration: 0.25 }, 1.6)
    .to(q(".tv-bar"), { scaleX: 1, duration: 0.7, ease: "power2.out" }, 1.05)
    .to(q(".tv-rec"), { opacity: 1, duration: 0.25 }, 3)
    .to(q(".tv-month"), { opacity: 0.45, duration: 0.25 }, 3)
    .to(q(".tv-ok"), { backgroundColor: "#3ddc84", boxShadow: "0 0 12px #3ddc8466", duration: 0.2, stagger: 0.08 }, 3.15);
}

/* ------------------------------------------------------------------ */
const TIME_STEPS: Step[] = [
  { formula: `${D.adminHoursPerWeek} hrs`, title: "Hours of repetitive admin each week.", text: "Retyping enquiries, chasing replies, sending invoices by hand.", value: D.adminHoursPerWeek, format: (v) => `${fmt(v)} hrs`, unit: "ADMIN TIME / WEEK" },
  { formula: "× 52 ÷ 12", title: "Turn weeks into months.", text: "52 weeks across 12 months — the real monthly load.", value: MONTH_HOURS, format: (v) => `${fmt(v, 1)} hrs`, unit: "POTENTIAL TIME FREED / MONTH" },
  { formula: `× R${D.staffCostPerHour}`, title: "Price the hour.", text: `At R${D.staffCostPerHour} per staff hour, that time has a cost.`, value: TIME_VALUE, format: rand, unit: "ESTIMATED TIME VALUE / MONTH" },
  { formula: `+ ${D.missedEnquiries}×${D.recoveryRate}%`, title: "Recover the leads that slipped.", text: `${D.missedEnquiries} missed enquiries × ${D.recoveryRate}% recovered by automatic follow-up.`, value: RECOVERED, format: (v) => fmt(v, 1), unit: "RECOVERED ENQUIRIES / MONTH" },
  ];

/** 05.A on its own — used on the Automation page, because time saved is the point of automation. */
export function TimeSaved({ index = "05.A" }: { index?: string }) {
  return (
    <ImpactSequence
      id="impact-time"
      index={index}
      kicker="AUTOMATIONS + FOLLOW-UP"
      heading={
        <>
          Catch more of the leads <em>you already have.</em>
        </>
      }
      steps={TIME_STEPS}
      visual={<TimeVisual />}
      animateVisual={animateTime}
      ctaLabel="OPEN THE TIME-SAVED CALCULATOR"
      onOpen={() => openModal({ kind: "time" })}
      note={IMPACT_DISCLAIMER}
    />
  );
}

export function Impact() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".impact-title .sw > span", {
          yPercent: 115,
          duration: 1.3,
          stagger: 0.07,
          ease: "expo.out",
          scrollTrigger: { trigger: ".impact-title", start: "top 80%" },
        });
        gsap.from(".impact-intro", { opacity: 0, y: 30, duration: 1, ease: "expo.out", scrollTrigger: { trigger: ".impact-intro", start: "top 85%" } });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const adsSteps: Step[] = [
    { formula: rand(D.adBudget), title: "Start with a monthly ad budget.", text: "Paid to Google or Meta directly. Management is separate.", value: D.adBudget, format: rand, unit: "MONTHLY AD BUDGET" },
    { formula: `÷ R${D.costPerClick}`, title: "Divide by the cost per click.", text: `At roughly R${D.costPerClick} a click, that budget buys visits.`, value: VISITS, format: (v) => fmt(v), unit: "ESTIMATED VISITS" },
    { formula: `× ${D.enquiryRate}%`, title: "Multiply by your enquiry rate.", text: "How many visitors actually reach out — your site and offer move this number.", value: D.enquiryRate, format: (v) => `${fmt(v, 1)}%`, unit: "VISIT-TO-ENQUIRY RATE" },
    { formula: `= ${fmt(ENQUIRIES, 1)}`, title: "Potential enquiries every month.", text: "New people who didn't know you yesterday.", value: ENQUIRIES, format: (v) => fmt(v, 1), unit: "POTENTIAL ENQUIRIES / MONTH" },
  ];



  return (
    <section id="services" ref={root} data-bg="#0e0d0b" aria-labelledby="impact-title" className="relative">
      <div className="pad-x pb-10 pt-32 md:pt-44">
        <ChapterLabel index="05" label="BUSINESS IMPACT" />
        <h2 id="impact-title" className="impact-title display mt-10 text-[clamp(56px,10vw,170px)]">
          <SplitWords text="More leads." />
          <br />
          <em>
            <SplitWords text="Less admin." />
          </em>
        </h2>
        <p className="impact-intro lede mt-8 max-w-xl">See two ways to reduce missed opportunities: automate follow-ups and run paid ads. Here's the logic — then try your own numbers.</p>
      </div>

      <ImpactSequence
        id="impact-time"
        index="05.A"
        kicker="AUTOMATIONS + FOLLOW-UP"
        heading={
          <>
            Catch more of the leads <em>you already have.</em>
          </>
        }
        steps={TIME_STEPS}
        visual={<TimeVisual />}
        animateVisual={animateTime}
        ctaLabel="OPEN THE TIME-SAVED CALCULATOR"
        onOpen={() => openModal({ kind: "time" })}
        note={IMPACT_DISCLAIMER}
      />

      <div className="pad-x">
        <div className="h-px bg-line" />
      </div>

      <ImpactSequence
        id="impact-ads"
        index="05.B"
        kicker="GOOGLE + META ADS"
        heading={
          <>
            Bring new people <em>to your business.</em>
          </>
        }
        steps={adsSteps}
        visual={<AdsVisual />}
        animateVisual={animateAds}
        ctaLabel="OPEN THE ADS CALCULATOR"
        onOpen={() => openModal({ kind: "ads" })}
        note="Example only. Google and Meta results vary by audience, offer and campaign."
      />

    </section>
  );
}
