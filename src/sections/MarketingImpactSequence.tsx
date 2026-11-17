/**
 * MarketingImpactSequence · Skerp Studio
 * ─────────────────────────────────────────────────────────────────────────────
 * The paid-ads maths, told as one pinned scroll: spend → clicks → leads →
 * cost per lead → recovered value → the three things Skerp fixes → the payoff.
 *
 * HOW TO ATTACH GSAP SCROLLTRIGGER LATER
 *
 * Everything on screen is drawn by ONE function, render(progress), where
 * progress runs 0 → 1. Nothing in the sequence uses CSS transitions or
 * enter animations, so whatever feeds render() owns the motion completely.
 *
 * Today: a native scroll listener (search "NATIVE DRIVER") feeds render(),
 *        and CSS `position: sticky` does the pinning.
 *
 * To hand over to GSAP:
 *
 *   1. Delete the NATIVE DRIVER effect and put this in its place:
 *
 *        gsap.registerPlugin(ScrollTrigger);
 *        const st = ScrollTrigger.create({
 *          trigger: sectionRef.current,   // [data-mis-trigger], the tall outer <section>
 *          start: "top top",
 *          end: "bottom bottom",          // ≈ 525vh of scroll (SCRUB_VH)
 *          scrub: 0.6,                    // replaces SMOOTH_MS
 *          onUpdate: (self) => renderRef.current(self.progress),
 *        });
 *        return () => st.kill();
 *
 *   2. WHAT TO PIN: [data-mis-pin] (stageRef), the 100svh stage.
 *      Simplest: keep the CSS sticky and pass no `pin`.
 *      To let GSAP pin instead: drop `sticky top-0` from the stage, drop the
 *      inline height from the section, and use
 *        pin: stageRef.current, end: `+=${SCRUB_VH}%`   // ≈ "+=525%"
 *
 *   3. WHAT TO SCRUB: render(progress). If you would rather author a
 *      gsap.timeline, every moving element has a [data-mis-*] hook and the
 *      phase windows live in WINDOWS:
 *        intro 0.00–0.06 · spend 0.06–0.18 · clicks 0.18–0.30 ·
 *        leads 0.30–0.43 · cpl 0.43–0.55 · value 0.55–0.71 ·
 *        services 0.71–0.88 · payoff 0.88–1
 *
 *   4. SCROLL DISTANCE: ≈ 5.25 viewport heights
 *      (30vh intro + 4 × 65vh steps + 85vh value + 85vh fix + 70vh payoff).
 *      Tune `vh` per phase in PHASES.
 *
 * Notes: sticky needs every ancestor to be free of overflow hidden/auto.
 *        With Lenis or ScrollSmoother, set SMOOTH_MS to 0 to avoid double easing.
 */
import { useEffect, useId, useLayoutEffect, useRef } from "react";
import type { CSSProperties, FocusEvent, MouseEvent } from "react";
import eagleHero from "@/assets/eagle-hero.webp";

/* ══════════════════════════════ EDIT HERE ══════════════════════════════ */

/** Skerp Studio palette, lifted from skerpstudio.com. */
const THEME = {
  bg: "#252722", // .audit — dark section background
  ink: "#eeeae0", // cream type on dark
  accent: "#b47755", // copper, as used on dark (.footer-brand span)
  accentSoft: "#efcfb6", // highlight tone on dark (.final-cta em)
  cream: "#e6e2d8", // .button-light
  creamHover: "#cba58a", // .button-light:hover
};

/** Example inputs. They explain the logic; this is not the calculator. */
const MODEL = {
  spend: 15000, // R per month
  cpc: 6, // R per click
  conversion: 0.04, // click → lead
  closeRate: 0.2, // lead → client
  clientValue: 12000, // R per client
};

const CLICKS = MODEL.spend / MODEL.cpc;
const LEADS = CLICKS * MODEL.conversion;
const CPL = MODEL.spend / LEADS;
const RECOVERED = LEADS * MODEL.closeRate * MODEL.clientValue;
const ROAS = RECOVERED / MODEL.spend;

/** South African number style: R15 000. */
const SEP = "\u2009";
const num = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, SEP);
const rand = (n: number) => `R${num(n)}`;
const pct = (n: number) => `${+(n * 100).toFixed(1)}%`;
const oneIn = (rate: number) => Math.round(1 / rate);

type StepId = "spend" | "clicks" | "leads" | "cpl" | "value";
type Step = {
  id: StepId; // the choreography is keyed to these five ids
  label: string;
  from: number; // number shown when the step starts
  to: number; // number it scrubs to
  money?: boolean;
  formula: string;
  title: string;
  body: string;
};

const STEPS: Step[] = [
  {
    id: "spend",
    label: "Ad spend",
    from: 0,
    to: MODEL.spend,
    money: true,
    formula: "Your monthly budget",
    title: "It starts with spend.",
    body: "Budget is the input. On its own it tells you nothing. What it turns into is what counts.",
  },
  {
    id: "clicks",
    label: "Clicks",
    from: 0,
    to: CLICKS,
    formula: `${rand(MODEL.spend)} ÷ ${rand(MODEL.cpc)} per click`,
    title: "Spend buys attention.",
    body: "Budget divided by cost per click. Sharper targeting makes each click cheaper, so the same rand reaches more people.",
  },
  {
    id: "leads",
    label: "Leads",
    from: CLICKS,
    to: LEADS,
    formula: `${num(CLICKS)} clicks × ${pct(MODEL.conversion)} conversion`,
    title: "Attention becomes enquiries.",
    body: `Only 1 click in ${oneIn(MODEL.conversion)} becomes a lead. The page they land on decides that, and it is where most budgets leak.`,
  },
  {
    id: "cpl",
    label: "Cost per lead",
    from: MODEL.spend,
    to: CPL,
    money: true,
    formula: `${rand(MODEL.spend)} ÷ ${num(LEADS)} leads`,
    title: "What a lead really costs.",
    body: "Spend divided by leads. It is the one number that judges the whole funnel, not just the ads.",
  },
  {
    id: "value",
    label: "Recovered value",
    from: 0,
    to: RECOVERED,
    money: true,
    formula: `${num(LEADS)} leads × ${pct(MODEL.closeRate)} close × ${rand(MODEL.clientValue)}`,
    title: "And what comes back.",
    body: `1 lead in ${oneIn(MODEL.closeRate)} signs. Multiply by what a client is worth and you have the revenue your spend brings home.`,
  },
];

/** Skerp's three services, tied to the place each one stops the leaking. */
const FIXES = [
  {
    n: "01",
    name: "Websites",
    line: "Modern websites designed around each business.",
    fix: "The page that decides how many clicks become leads.",
    x: 64,
  },
  {
    n: "02",
    name: "Audits",
    line: "Practical reviews and prioritised improvements.",
    fix: "The exact place your funnel leaks, found before you spend more.",
    x: 39,
  },
  {
    n: "03",
    name: "Automation",
    line: "Workflows that connect your tools and cut repetitive work.",
    fix: "Leads that go cold in follow-up are money you already paid for.",
    x: 77,
  },
];

const COPY = {
  brand: "Skerp Studio",
  eyebrow: "Paid ads, explained",
  headline: ["Every rand you spend", "should come back."],
  lede: "Five numbers decide whether it does.",
  pivot: ["The ads are rarely", "the leak."],
  pivotLede: "Three things we fix, in the order they cost you.",
  payoffKicker: "Return on ad spend",
  payoffNote:
    "That is the logic on example figures. Add your own spend, cost per click and close rate.",
  cta: "See your numbers",
  contact: "or WhatsApp 072 574 2448",
};

/** Horizontal positions on the diagram, in % of its width. */
const X = { start: 2, spend: 14, fan: 26, clicks: 38, leads: 64, value: 90 };

const STATIONS: { step: StepId; x: number; label: string; value: string }[] = [
  { step: "spend", x: X.spend, label: "Spend", value: rand(MODEL.spend) },
  { step: "clicks", x: X.clicks, label: "Clicks", value: num(CLICKS) },
  { step: "leads", x: X.leads, label: "Leads", value: num(LEADS) },
  { step: "value", x: X.value, label: "Value", value: rand(RECOVERED) },
];

const OPERATORS = [
  { x: (X.spend + X.clicks) / 2, text: `÷ ${rand(MODEL.cpc)} per click` },
  { x: (X.clicks + X.leads) / 2, text: `× ${pct(MODEL.conversion)} convert` },
  { x: (X.leads + X.value) / 2, text: `× ${pct(MODEL.closeRate)} close × ${rand(MODEL.clientValue)}` },
];

/** Scroll length per phase, in viewport heights × 100. */
const PHASES: { key: string; vh: number }[] = [
  { key: "intro", vh: 30 },
  ...STEPS.map((s) => ({ key: s.id, vh: s.id === "value" ? 85 : 65 })),
  { key: "fix", vh: 85 },
  { key: "payoff", vh: 70 },
];

/** Smoothing time constant for the native driver (ms). 0 = raw scroll. */
const SMOOTH_MS = 110;

/* ════════════════════════════ END EDIT ZONE ════════════════════════════ */

const SCRUB_VH = PHASES.reduce((n, p) => n + p.vh, 0);

/** Timeline windows as fractions of total progress. */
const WINDOWS = (() => {
  let at = 0;
  return PHASES.map((ph) => {
    const a = at / SCRUB_VH;
    at += ph.vh;
    return [a, at / SCRUB_VH] as const;
  });
})();

const W = {
  intro: WINDOWS[0],
  spend: WINDOWS[1],
  clicks: WINDOWS[2],
  leads: WINDOWS[3],
  cpl: WINDOWS[4],
  value: WINDOWS[5],
  fix: WINDOWS[6],
  payoff: WINDOWS[7],
};

/**
 * The fan: one line per click in the "1 in N" ratio, so with 4% conversion
 * there are 25 lines and exactly one survives. Outer lines die first, which
 * tapers the field towards the lead.
 */
const FAN = (() => {
  const raw = Math.min(41, Math.max(9, oneIn(MODEL.conversion)));
  const count = raw % 2 ? raw : raw + 1;
  const mid = (count - 1) / 2;
  return Array.from({ length: count }, (_, i) => {
    const y = +(8 + (84 * i) / (count - 1)).toFixed(2);
    const edge = Math.abs(i - mid) / mid;
    const jitter = (((Math.sin((i + 1) * 12.9898) * 43758.5453) % 1) + 1) % 1;
    const end = +(
      X.clicks +
      3 +
      (1 - Math.pow(edge, 1.3)) * (X.leads - X.clicks - 8) +
      (jitter - 0.5) * 3
    ).toFixed(2);
    return {
      y,
      end,
      survivor: i === mid,
      d: `M${X.spend} 50C${X.spend + 7} 50 ${X.fan - 7} ${y} ${X.fan} ${y}L${end} ${y}`,
    };
  });
})();

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeIn = (t: number) => t * t * t;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const NS = { vectorEffect: "non-scaling-stroke" } as const;
const ACCENT_TEXT = "text-(--mis-soft)";
const ACCENT_BORDER = "border-(--mis-accent)";
const MICRO = "text-[11px] font-bold uppercase tracking-[0.105em]";
const DISPLAY = "font-['Inter_Tight',sans-serif] font-extrabold";

type Props = {
  calculatorHref?: string;
  onOpenCalculator?: () => void;
  ctaLabel?: string;
  /** Swap in the real studio asset: "/images/skerp-eagle-1024.webp". */
  eagleSrc?: string;
};

export default function MarketingImpactSequence({
  calculatorHref = "#ads-calculator",
  onOpenCalculator,
  ctaLabel = COPY.cta,
  eagleSrc = eagleHero,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const renderRef = useRef<(progress: number) => void>(() => {});
  const progressRef = useRef(0);
  const fadeId = `mis-fade-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  /* ─────────────────────────────────────────────────────────────────────
   * render(progress): the whole sequence as a pure function of 0 → 1.
   * Only transform, opacity and number text are written.
   * ──────────────────────────────────────────────────────────────────── */
  useIsoLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    type El = HTMLElement | SVGElement;
    const one = (name: string) => stage.querySelector(`[data-mis-${name}]`) as El;
    const all = (name: string, root: Element = stage) =>
      Array.from(root.querySelectorAll(`[data-mis-${name}]`)) as El[];

    const grid = one("grid");
    const counter = one("counter");
    const bar = one("bar");
    const hint = one("hint");
    const mask = one("mask");
    const maskInner = one("mask-inner");
    const rail = one("rail");
    const glyph = one("glyph");
    const fan = one("fan");
    const fanLines = all("fan-line");
    const survivor = one("survivor");
    const stLabel = all("station-label");
    const stLine = all("station-line");
    const stValue = all("station-value");
    const node = all("node");
    const nodeRing = all("node-ring");
    const ops = all("op");
    const callouts = all("callout");
    const mLine = one("measure-line");
    const mTicks = all("measure-tick");
    const mLabel = one("measure-label");
    const rings = all("ring");
    const glow = one("glow");
    const eagle = one("eagle");
    const eagleWrap = one("eagle-wrap");
    const introLines = all("intro-line");
    const introLede = one("intro-lede");
    const readouts = all("readout").map((r) => ({
      kids: all("el", r),
      number: r.querySelector("[data-mis-number]") as El,
    }));
    const fixCards = all("fix-card");
    const fixKicker = one("fix-kicker");
    const fixHeadLine = one("fix-head");
    const fixLede = one("fix-lede");
    const payoff = one("payoff");
    const payKicker = one("pay-kicker");
    const payIn = one("pay-in");
    const payBack = one("pay-back");
    const payCta = one("pay-cta");
    const payNote = one("pay-note");
    const payContact = one("pay-contact");
    const roasEl = one("roas");

    const shown: string[] = [];
    let roasShown = "";

    const o = (el: El, v: number) => {
      el.style.opacity = v.toFixed(3);
    };
    const tf = (el: El, v: string) => {
      el.style.transform = v;
    };
    const ty = (px: number) => `translate3d(0,${px.toFixed(2)}px,0)`;

    const lastStation = STATIONS.length - 1;
    const STEP_WINDOWS = [W.spend, W.clicks, W.leads, W.cpl, W.value];

    const render = (raw: number) => {
      const p = clamp01(raw);
      progressRef.current = p;

      /** Phase-local time, 0 → 1, for a given window. */
      const L = (w: readonly [number, number]) => clamp01((p - w[0]) / (w[1] - w[0]));
      /** Sub-window inside a phase, in that phase's local 0 → 1 time. */
      const t = (w: readonly [number, number], a: number, b: number) =>
        clamp01((L(w) - a) / (b - a));

      const intro = L(W.intro);
      const pay = L(W.payoff);

      /**
       * Strict phase visibility: a block fades in, holds, then fades out
       * inside its own window, so two phases are never on screen at once.
       */
      const vis = (w: readonly [number, number], inA = 0.06, inB = 0.26, outA = 0.8, outB = 0.96) =>
        Math.min(easeOut(t(w, inA, inB)), 1 - easeIn(t(w, outA, outB)));

      /* 1 · Wavefront: how far the signal has travelled across the diagram */
      const x =
        lerp(X.start, X.spend, easeInOut(t(W.spend, 0.02, 0.55))) +
        (X.clicks - X.spend) * easeInOut(t(W.clicks, 0.08, 0.72)) +
        (X.leads - X.clicks) * easeInOut(t(W.leads, 0.08, 0.72)) +
        (X.value - X.leads) * easeInOut(t(W.value, 0.08, 0.7));
      const fly = easeIn(seg(pay, 0.02, 0.5));
      /** The diagram steps back while the studio's three fixes take over. */
      const recede = easeInOut(t(W.fix, 0, 0.22));

      tf(mask, `translate3d(${(x - 100).toFixed(3)}%,0,0)`);
      tf(maskInner, `translate3d(${(100 - x).toFixed(3)}%,0,0)`);
      tf(rail, `translate3d(${(x + fly * 16).toFixed(3)}%,0,0)`);
      tf(glyph, `${ty(-fly * 70)} rotate(${(-fly * 24).toFixed(2)}deg)`);
      o(glyph, 1 - seg(pay, 0.36, 0.5));

      /* 2 · Field: lost clicks dim, the surviving line brightens */
      fanLines.forEach((el, i) => {
        const wave = 0.5 + 0.5 * Math.sin(x * 0.85 - i * 0.42 - p * 6);
        o(el, 0.45 + 0.55 * wave);
      });
      o(fan, lerp(1, 0.4, t(W.cpl, 0, 0.35)) * lerp(1, 0.45, recede));
      o(survivor, t(W.leads, 0.3, 0.72));

      /* 3 · Stations lock on as the wavefront arrives */
      STATIONS.forEach((s, k) => {
        const win = STEP_WINDOWS[Math.min(k, STEP_WINDOWS.length - 1)];
        const reach = seg(x, s.x - 2, s.x);
        const lock = t(win, 0.7, 0.92);
        const dock = easeOut(t(win, 0.72, 0.9));
        o(stLabel[k], lerp(0.4, 1, reach) * lerp(1, 0.5, recede));
        tf(stLine[k], `scaleY(${reach.toFixed(3)})`);
        o(node[k], reach);
        tf(
          node[k],
          `scale(${(lerp(0.3, 1, reach) + (k === lastStation ? 0.7 * easeOut(lock) : 0)).toFixed(3)})`
        );
        o(nodeRing[k], Math.sin(Math.PI * lock) * 0.8);
        tf(nodeRing[k], `scale(${lerp(0.5, 2.4, easeOut(lock)).toFixed(3)})`);
        o(stValue[k], dock * lerp(1, 0.45, recede));
        tf(stValue[k], ty((1 - dock) * 8));
      });

      /* 4 · Operators, then they give way to the service callouts */
      OPERATORS.forEach((op, k) => {
        const v = seg(x, op.x - 3, op.x + 1);
        o(ops[k], v * 0.5 * lerp(1, 0.15, recede));
        tf(ops[k], ty((1 - v) * 5));
      });
      callouts.forEach((c, k) => {
        const on = t(W.fix, 0.16 + k * 0.15, 0.4 + k * 0.15);
        const off = easeIn(t(W.fix, 0.86, 1));
        o(c, on * (1 - off));
        tf(c, ty((1 - on) * 14));
      });

      /* 5 · Cost per lead: a measure line drawn from leads back to spend */
      const measure = easeInOut(t(W.cpl, 0.08, 0.6));
      const measureLabel = easeOut(t(W.cpl, 0.56, 0.8));
      tf(mLine, `scaleX(${measure.toFixed(4)})`);
      o(mTicks[0], t(W.cpl, 0.02, 0.1));
      o(mTicks[1], t(W.cpl, 0.54, 0.62));
      o(mLabel, measureLabel * lerp(1, 0.4, recede));
      tf(mLabel, ty((1 - measureLabel) * 6));

      /* 6 · Numbers, each tied to the thing it measures */
      const numberT: Record<StepId, number> = {
        spend: easeOut(t(W.spend, 0.05, 0.6)),
        clicks: seg(x, X.spend, X.clicks),
        leads: seg(x, X.clicks + 1, X.leads - 3),
        cpl: measure,
        value: Math.pow(seg(x, X.leads, X.value), 1.5),
      };

      /* 7 · Readouts: staggered in, lifted out */
      STEPS.forEach((s, i) => {
        const r = readouts[i];
        const win = STEP_WINDOWS[i];
        const phase = vis(win);
        r.kids.forEach((el, k) => {
          const e = easeOut(t(win, 0.08 + k * 0.04, 0.26 + k * 0.04));
          o(el, e * phase);
          tf(el, ty((1 - e) * 32));
        });
        const v = lerp(s.from, s.to, numberT[s.id]);
        const str = s.money ? rand(v) : num(v);
        if (str !== shown[i]) {
          r.number.textContent = str;
          shown[i] = str;
        }
      });

      /* 8 · The fix: three services, one per leak */
      const fixPhase = vis(W.fix);
      const fixHead = easeOut(t(W.fix, 0.04, 0.26));
      o(fixKicker, fixHead * fixPhase);
      tf(fixKicker, ty((1 - fixHead) * 12));
      o(fixHeadLine, fixHead * fixPhase);
      tf(fixHeadLine, ty((1 - fixHead) * 22));
      const fixLedeT = easeOut(t(W.fix, 0.12, 0.34));
      o(fixLede, fixLedeT * fixPhase);
      tf(fixLede, ty((1 - fixLedeT) * 12));
      fixCards.forEach((c, k) => {
        const on = easeOut(t(W.fix, 0.18 + k * 0.15, 0.46 + k * 0.15));
        o(c, on * fixPhase);
        tf(c, ty((1 - on) * 28));
      });

      /* 9 · Intro headline slides out line by line */
      const introVis = 1 - easeIn(seg(intro, 0.5, 0.92));
      introLines.forEach((el, k) => {
        const out = easeIn(seg(intro, k * 0.18, 0.72 + k * 0.18));
        tf(el, `translate3d(0,${(-out * 112).toFixed(2)}%,0)`);
        o(el, introVis);
      });
      o(introLede, introVis * (1 - seg(intro, 0, 0.5)));
      tf(introLede, ty(-seg(intro, 0, 0.5) * 16));
      o(hint, 1 - seg(intro, 0, 0.5));

      /* 10 · Eagle: it waits at the end of the line, and wakes up on arrival */
      const eagleIn = easeOut(seg(p, W.intro[1], W.leads[1]));
      const eagleWake = easeOut(seg(p, W.value[0], W.value[1]));
      o(eagle, lerp(0.06, 0.24, eagleIn) + 0.16 * eagleWake);
      tf(
        eagleWrap,
        `translate3d(${(p * 26).toFixed(2)}px,${(-p * 18).toFixed(2)}px,0) scale(${(1.04 + p * 0.06).toFixed(4)})`
      );

      /* 11 · Bloom: value lands and the return radiates out */
      const b = seg(p, W.value[0] + (W.value[1] - W.value[0]) * 0.66, 1);
      rings.forEach((el, k) => {
        const g = easeOut(seg(b, k * 0.1, 0.5 + k * 0.1));
        o(el, seg(b, k * 0.1, k * 0.1 + 0.06) * lerp(0.75, 0.2, g));
        tf(el, `scale(${(0.15 + 0.85 * g + 0.1 * b).toFixed(4)})`);
      });
      o(glow, 0.16 * easeOut(seg(b, 0, 0.45)));
      tf(glow, `scale(${lerp(0.5, 1, easeOut(seg(b, 0, 0.6))).toFixed(4)})`);

      /* 12 · Payoff */
      const payPhase = easeOut(t(W.payoff, 0.02, 0.22));
      const kicker = easeOut(seg(pay, 0.03, 0.2));
      const lineIn = easeOut(seg(pay, 0.05, 0.32));
      const lineBack = easeOut(seg(pay, 0.18, 0.48));
      const cta = easeOut(seg(pay, 0.46, 0.7));
      const note = easeOut(seg(pay, 0.54, 0.78));
      const contact = easeOut(seg(pay, 0.62, 0.86));
      o(payKicker, kicker * payPhase);
      tf(payKicker, ty((1 - kicker) * 14));
      o(payIn, payPhase);
      tf(payIn, `translate3d(0,${((1 - lineIn) * 112).toFixed(2)}%,0)`);
      o(payBack, payPhase);
      tf(payBack, `translate3d(0,${((1 - lineBack) * 112).toFixed(2)}%,0)`);
      o(payCta, cta * payPhase);
      tf(payCta, ty((1 - cta) * 18));
      o(payNote, note * payPhase);
      tf(payNote, ty((1 - note) * 14));
      o(payContact, contact * payPhase);
      tf(payContact, ty((1 - contact) * 12));
      payoff.style.pointerEvents = pay > 0.6 ? "auto" : "none";

      const roasNow = lerp(1, ROAS, easeOut(seg(pay, 0.22, 0.56)));
      const roasStr = Number.isInteger(ROAS) ? String(Math.round(roasNow)) : roasNow.toFixed(1);
      if (roasStr !== roasShown) {
        roasEl.textContent = roasStr;
        roasShown = roasStr;
      }

      /* 13 · HUD and backdrop keep moving the whole way */
      // Continuous phase position: rolls the odometer from 00 to 08.
      let phasePos = 0;
      WINDOWS.forEach(([a, b]) => {
        phasePos += clamp01((p - a) / (b - a));
      });
      const items = PHASES.length + 1;
      tf(counter, `translate3d(0,${((-phasePos * 100) / items).toFixed(3)}%,0)`);
      tf(bar, `scaleX(${p.toFixed(4)})`);
      tf(grid, `translate3d(${(-p * 80).toFixed(2)}px,0,0)`);
    };

    renderRef.current = render;
    render(progressRef.current);
  }, []);

  /* ─────────────────────────────────────────────────────────────────────
   * NATIVE DRIVER: replace this whole effect with ScrollTrigger (see top).
   * ──────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    const instant =
      SMOOTH_MS <= 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let target = 0;
    let current = 0;
    let raf = 0;
    let last = 0;

    const measure = () => {
      const distance = section.offsetHeight - stage.offsetHeight;
      target = distance > 0 ? clamp01(-section.getBoundingClientRect().top / distance) : 0;
    };
    const tick = (now: number) => {
      const dt = Math.min(64, Math.max(1, now - last));
      last = now;
      current += (target - current) * (instant ? 1 : 1 - Math.exp(-dt / SMOOTH_MS));
      if (Math.abs(target - current) < 0.0002) current = target;
      renderRef.current(current);
      raf = current === target ? 0 : requestAnimationFrame(tick);
    };
    const onScroll = () => {
      measure();
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    measure();
    current = target;
    renderRef.current(current);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const handleCta = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!onOpenCalculator) return;
    e.preventDefault();
    onOpenCalculator();
  };

  /** Keyboard users who tab to the button before scrolling get taken to it. */
  const handleCtaFocus = (e: FocusEvent<HTMLAnchorElement>) => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage || progressRef.current > 0.97) return;
    if (!e.currentTarget.matches(":focus-visible")) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + section.offsetHeight - stage.offsetHeight - 2 });
  };

  return (
    <section
      ref={sectionRef}
      data-mis-trigger
      aria-label="How paid ad spend turns into revenue"
      className="relative bg-(--mis-bg) text-(--mis-ink) antialiased"
      style={
        {
          height: `${SCRUB_VH + 100}vh`,
          "--mis-accent": THEME.accent,
          "--mis-soft": THEME.accentSoft,
          "--mis-bg": THEME.bg,
          "--mis-ink": THEME.ink,
          fontFamily: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
        } as CSSProperties
      }
    >
      <div
        ref={stageRef}
        data-mis-pin
        className="sticky top-0 h-screen overflow-hidden supports-[height:100svh]:h-[100svh]"
      >
        {/* Backdrop */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            data-mis-grid
            className="absolute inset-y-0 -left-20 -right-20 bg-[linear-gradient(to_right,rgba(246,240,231,0.07)_1px,transparent_1px)] [background-size:80px_100%] will-change-transform"
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,transparent_25%,var(--mis-bg)_82%)]" />
        </div>

        <div className="relative flex h-full flex-col">
          {/* HUD */}
          <header
            className={`${MICRO} flex shrink-0 items-center justify-between px-6 pt-6 text-(--mis-ink)/60 md:px-10 md:pt-8 lg:px-16`}
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="inline-block h-[7px] w-[7px] rounded-full bg-[#b3714f]" />
              <span className="text-(--mis-ink)/90">{COPY.brand}</span>
              <span className="hidden text-(--mis-ink)/50 sm:block">— {COPY.eyebrow}</span>
            </div>
            <div
              aria-hidden
              className="flex shrink-0 items-center gap-2 whitespace-nowrap tabular-nums"
            >
              <span className="block h-[1.5em] overflow-hidden text-(--mis-ink)/90">
                <span data-mis-counter className="flex flex-col will-change-transform">
                  {Array.from({ length: PHASES.length + 1 }, (_, n) => (
                    <span key={n} className="block h-[1.5em] leading-[1.5em]">
                      {String(n).padStart(2, "0")}
                    </span>
                  ))}
                </span>
              </span>
              <span className="text-(--mis-ink)/30">/</span>
              <span>{String(PHASES.length).padStart(2, "0")}</span>
            </div>
          </header>

          <div className="flex min-h-0 flex-1 flex-col justify-center gap-[3.5svh] pb-10 pt-4 md:gap-[5svh] md:pb-12">
            {/* ── Diagram (full bleed) ── */}
            <div data-mis-diagram aria-hidden className="relative w-full shrink-0">
              {/* Station labels, operators and service callouts */}
              <div className="relative h-6 text-[10px] md:h-7 md:text-[11px]">
                {STATIONS.map((s) => (
                  <span
                    key={s.step}
                    className="absolute top-0 -translate-x-1/2 whitespace-nowrap font-bold uppercase tracking-[0.105em]"
                    style={{ left: `${s.x}%` }}
                  >
                    <span data-mis-station-label className="block opacity-40">
                      {s.label}
                    </span>
                  </span>
                ))}
                {OPERATORS.map((op) => (
                  <span
                    key={op.text}
                    className="absolute top-0 hidden -translate-x-1/2 whitespace-nowrap lg:block"
                    style={{ left: `${op.x}%` }}
                  >
                    <span data-mis-op className="block opacity-0">
                      {op.text}
                    </span>
                  </span>
                ))}
              </div>

              {/* Service callouts, on their own row under the station labels */}
              <div className="relative hidden h-4 text-[10px] md:h-5 md:text-[11px] lg:block">
                {FIXES.map((f) => (
                  <span
                    key={f.name}
                    className="absolute top-0 -translate-x-1/2 whitespace-nowrap"
                    style={{ left: `${f.x}%` }}
                  >
                    <span data-mis-callout className="block opacity-0">
                      <span className="mr-2 inline-block h-[5px] w-[5px] rounded-full bg-[#b3714f] align-middle" />
                      <span className="font-bold uppercase tracking-[0.105em] text-(--mis-soft)">
                        {f.name}
                      </span>
                    </span>
                  </span>
                ))}
              </div>

              {/* Plot */}
              <div className="relative h-[26svh] max-h-[340px] min-h-[130px] md:h-[30svh]">
                {/* The eagle waits where the value lands */}
                <div
                  data-mis-eagle-wrap
                  className="pointer-events-none absolute -bottom-1/2 -top-1/2 right-[-22%] w-[84%] will-change-transform"
                >
                  <div className="relative h-full w-full">
                    <img
                      data-mis-eagle
                      src={eagleSrc}
                      alt=""
                      aria-hidden
                      className="absolute inset-0 h-full w-full object-cover object-[56%_30%] opacity-0 will-change-[opacity,transform]"
                      style={{
                        filter: "grayscale(0.5) contrast(1.05) brightness(0.72) sepia(0.22)",
                        maskImage:
                          "radial-gradient(70% 62% at 62% 42%, #000 0%, rgba(0,0,0,0.55) 45%, transparent 78%)",
                        WebkitMaskImage:
                          "radial-gradient(70% 62% at 62% 42%, #000 0%, rgba(0,0,0,0.55) 45%, transparent 78%)",
                      }}
                    />
                  </div>
                </div>

                <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-(--mis-ink)/15" />

                {STATIONS.map((s) => (
                  <div
                    key={s.step}
                    className="absolute inset-y-0 w-px bg-(--mis-ink)/[0.07]"
                    style={{ left: `${s.x}%` }}
                  >
                    <div
                      data-mis-station-line
                      className="h-full w-full origin-top bg-(--mis-ink)/20"
                      style={{ transform: "scaleY(0)" }}
                    />
                  </div>
                ))}

                {/* Bloom at the value node */}
                <div className="absolute top-1/2" style={{ left: `${X.value}%` }}>
                  <div
                    data-mis-glow
                    className="absolute -left-[45vmin] -top-[45vmin] h-[90vmin] w-[90vmin] rounded-full bg-[radial-gradient(closest-side,var(--mis-soft),transparent)] opacity-0 will-change-transform"
                  />
                  {[18, 36, 58].map((d) => (
                    <div
                      key={d}
                      data-mis-ring
                      className={`absolute rounded-full border opacity-0 will-change-transform ${ACCENT_BORDER}`}
                      style={{
                        width: `${d}vmin`,
                        height: `${d}vmin`,
                        left: `${-d / 2}vmin`,
                        top: `${-d / 2}vmin`,
                      }}
                    />
                  ))}
                </div>

                {/* Lines, revealed by a transform-only mask that follows the wavefront */}
                <div
                  data-mis-mask
                  className="absolute inset-0 overflow-hidden will-change-transform"
                  style={{ transform: `translate3d(${X.start - 100}%,0,0)` }}
                >
                  <div
                    data-mis-mask-inner
                    className="absolute inset-0 will-change-transform"
                    style={{ transform: `translate3d(${100 - X.start}%,0,0)` }}
                  >
                    <svg
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      fill="none"
                      className="h-full w-full"
                    >
                      <defs>
                        <linearGradient id={fadeId} x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0" stopColor="#eeeae0" stopOpacity="0.5" />
                          <stop offset="0.6" stopColor="#eeeae0" stopOpacity="0.36" />
                          <stop offset="1" stopColor="#eeeae0" stopOpacity="0.08" />
                        </linearGradient>
                      </defs>
                      <g data-mis-fan>
                        {FAN.map((l) =>
                          l.survivor ? (
                            <path
                              key={l.y}
                              d={`M${X.spend} 50L${X.leads} 50`}
                              stroke="#eeeae0"
                              strokeOpacity={0.4}
                              strokeWidth={1}
                              {...NS}
                            />
                          ) : (
                            <g key={l.y}>
                              <path
                                data-mis-fan-line
                                d={l.d}
                                stroke={`url(#${fadeId})`}
                                strokeWidth={1}
                                {...NS}
                              />
                              <path
                                d={`M${l.end} ${l.y}h0.01`}
                                stroke="#eeeae0"
                                strokeOpacity={0.55}
                                strokeWidth={3}
                                strokeLinecap="round"
                                {...NS}
                              />
                            </g>
                          ),
                        )}
                      </g>
                      <path d={`M0 50L${X.spend} 50`} stroke="#eeeae0" strokeWidth={2} {...NS} />
                      <path
                        data-mis-survivor
                        d={`M${X.spend} 50L${X.leads} 50`}
                        stroke="#eeeae0"
                        strokeWidth={1.5}
                        style={{ opacity: 0 }}
                        {...NS}
                      />
                      <path
                        d={`M${X.leads} 50L${X.value} 50`}
                        stroke="var(--mis-soft)"
                        strokeOpacity={0.14}
                        strokeWidth={9}
                        {...NS}
                      />
                      <path
                        d={`M${X.leads} 50L${X.value} 50`}
                        stroke="var(--mis-soft)"
                        strokeWidth={2}
                        {...NS}
                      />
                    </svg>
                  </div>
                </div>

                {/* Nodes */}
                {STATIONS.map((s, k) => {
                  const isValue = k === STATIONS.length - 1;
                  return (
                    <div key={s.step} className="absolute top-1/2" style={{ left: `${s.x}%` }}>
                      <span className="absolute -left-[5px] -top-[5px] h-[10px] w-[10px] rounded-full border border-(--mis-ink)/40 bg-(--mis-bg)" />
                      <span
                        data-mis-node
                        className={`absolute -left-[5px] -top-[5px] h-[10px] w-[10px] rounded-full opacity-0 ${
                          isValue ? "bg-(--mis-soft)" : "bg-(--mis-ink)"
                        }`}
                      />
                      <span
                        data-mis-node-ring
                        className={`absolute -left-4 -top-4 h-8 w-8 rounded-full border opacity-0 ${
                          isValue ? ACCENT_BORDER : "border-(--mis-ink)/70"
                        }`}
                      />
                    </div>
                  );
                })}

                {/* The signal head: a sharp eagle mark that rides the wavefront */}
                <div
                  data-mis-rail
                  className="absolute inset-x-0 top-1/2 h-0 will-change-transform"
                  style={{ transform: `translate3d(${X.start}%,0,0)` }}
                >
                  <div
                    data-mis-glyph
                    className="absolute -left-[15px] -top-[9px] h-[18px] w-[22px] will-change-transform"
                  >
                    <span className="absolute left-1 top-0.5 h-3 w-3 animate-ping rounded-full bg-(--mis-soft) opacity-40 motion-reduce:hidden" />
                    <span className="absolute right-[70%] top-1/2 h-px w-14 bg-[linear-gradient(to_left,var(--mis-soft),transparent)]" />
                    <svg
                      viewBox="0 0 24 18"
                      fill="currentColor"
                      className="relative block h-[18px] w-[24px] text-(--mis-soft)"
                    >
                      <path d="M0 9 11.5 0 8.4 6.4 24 9 8.4 11.6 11.5 18Z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Values dock under each station once it locks */}
              <div className="relative mt-2 h-5 text-[11px] tabular-nums md:mt-3 md:text-xs">
                {STATIONS.map((s, k) => (
                  <span
                    key={s.step}
                    className="absolute top-0 -translate-x-1/2 whitespace-nowrap"
                    style={{ left: `${s.x}%` }}
                  >
                    <span
                      data-mis-station-value
                      className={`block opacity-0 ${
                        k === STATIONS.length - 1 ? ACCENT_TEXT : "text-(--mis-ink)/80"
                      }`}
                    >
                      {s.value}
                    </span>
                  </span>
                ))}
              </div>

              {/* Cost per lead measure, spanning spend → leads */}
              <div className="relative mt-2 h-5 md:mt-3">
                <div
                  className="absolute inset-y-0"
                  style={{ left: `${X.spend}%`, width: `${X.leads - X.spend}%` }}
                >
                  <span
                    data-mis-measure-line
                    className="absolute inset-x-0 top-1/2 h-px origin-right bg-(--mis-ink)/35"
                    style={{ transform: "scaleX(0)" }}
                  />
                  <span
                    data-mis-measure-tick
                    className="absolute right-0 top-1/2 -mt-[5px] h-[10px] w-px bg-(--mis-ink)/60 opacity-0"
                  />
                  <span
                    data-mis-measure-tick
                    className="absolute left-0 top-1/2 -mt-[5px] h-[10px] w-px bg-(--mis-ink)/60 opacity-0"
                  />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap">
                    <span
                      data-mis-measure-label
                      className="block bg-(--mis-bg) px-3 text-[10px] font-bold uppercase tracking-[0.105em] text-(--mis-ink)/85 opacity-0"
                    >
                      {rand(CPL)} per lead
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* ── Readout: every phase shares one grid cell ── */}
            <div className="mx-auto grid w-full max-w-[1440px] shrink-0 px-6 md:px-10 lg:px-16">
              {/* Intro */}
              <div className="col-start-1 row-start-1">
                <h2
                  className={`${DISPLAY} text-[length:clamp(1.9rem,min(9vw,12.5vh),6.25rem)] leading-[0.92] tracking-[-0.068em]`}
                >
                  {COPY.headline.map((line, i) => (
                    <span key={line} className="-mb-[0.1em] block overflow-hidden pb-[0.16em]">
                      <span
                        data-mis-intro-line
                        className={`block will-change-transform ${
                          i ? "font-semibold tracking-[-0.07em] text-(--mis-soft)" : ""
                        }`}
                      >
                        {line}
                      </span>
                    </span>
                  ))}
                </h2>
                <p
                  data-mis-intro-lede
                  className="mt-5 text-sm text-[#c5c4bb] md:mt-6 md:text-base lg:text-lg"
                >
                  {COPY.lede}
                </p>
              </div>

              {/* Maths steps */}
              {STEPS.map((s, i) => (
                <article
                  key={s.id}
                  data-mis-readout={i}
                  className="col-start-1 row-start-1 grid grid-cols-1 content-start gap-x-16 gap-y-4 lg:grid-cols-12 lg:items-end"
                >
                  <div className="lg:col-span-7">
                    <p
                      data-mis-el
                      className={`${MICRO} flex items-center text-(--mis-ink)/55 opacity-0`}
                    >
                      <span className="text-(--mis-ink)/40">0{i + 1}</span>
                      <span className="mx-3 text-[13px] font-medium leading-none text-[#bf9a7a]">
                        +
                      </span>
                      {s.label}
                    </p>
                    <p
                      data-mis-el
                      className={`${DISPLAY} mt-2 text-[length:clamp(3.25rem,min(9.5vw,17vh),9rem)] leading-[0.9] tracking-[-0.045em] tabular-nums opacity-0 md:mt-3 ${
                        s.id === "value" ? ACCENT_TEXT : ""
                      }`}
                    >
                      <span data-mis-number aria-hidden>
                        {s.money ? rand(s.from) : num(s.from)}
                      </span>
                      <span className="sr-only">{s.money ? rand(s.to) : num(s.to)}</span>
                    </p>
                    <p
                      data-mis-el
                      className="mt-2 text-[11px] text-(--mis-ink)/40 opacity-0 md:mt-3 md:text-xs"
                    >
                      {s.formula}
                    </p>
                  </div>
                  <div className="lg:col-span-5 lg:pb-1">
                    <h3
                      data-mis-el
                      className={`${DISPLAY} text-xl leading-[1.04] tracking-[-0.05em] opacity-0 md:text-2xl lg:text-[1.85rem]`}
                    >
                      {s.title}
                    </h3>
                    <p
                      data-mis-el
                      className="mt-2 max-w-[40ch] text-sm leading-relaxed text-[#c5c4bb] opacity-0 md:mt-3 md:text-[15px] lg:text-base"
                    >
                      {s.body}
                    </p>
                  </div>
                </article>
              ))}

              {/* The fix: Skerp's three services */}
              <div
                data-mis-fix
                className="col-start-1 row-start-1 grid grid-cols-1 gap-y-6 lg:grid-cols-12 lg:gap-x-16"
              >
                <div className="lg:col-span-5">
                  <p data-mis-fix-kicker className={`${MICRO} text-(--mis-ink)/55 opacity-0`}>
                    Where it leaks — and what we fix
                  </p>
                  <h3
                    data-mis-fix-head
                    className={`${DISPLAY} mt-2 text-[length:clamp(1.5rem,min(5.2vw,7vh),3.3rem)] leading-[0.95] tracking-[-0.068em] opacity-0`}
                  >
                    {COPY.pivot.map((line, i) => (
                      <span key={line} className="block">
                        {i === 1 ? (
                          <em className="font-semibold not-italic text-(--mis-soft)">{line}</em>
                        ) : (
                          line
                        )}
                      </span>
                    ))}
                  </h3>
                  <p
                    data-mis-fix-lede
                    className="mt-3 max-w-[34ch] text-sm leading-relaxed text-[#c5c4bb] opacity-0 md:text-[15px]"
                  >
                    {COPY.pivotLede}
                  </p>
                </div>
                <ul className="lg:col-span-7">
                  {FIXES.map((f) => (
                    <li
                      key={f.name}
                      data-mis-fix-card
                      className="flex items-start gap-4 border-t border-(--mis-ink)/15 py-3 opacity-0 md:gap-6 md:py-4"
                    >
                      <span className={`${MICRO} pt-1 text-(--mis-ink)/40`}>{f.n}</span>
                      <div className="min-w-0 flex-1">
                        <p className={`${DISPLAY} text-lg leading-tight tracking-[-0.04em] md:text-xl`}>
                          {f.name}
                        </p>
                        <p className="mt-1 max-w-[34ch] text-[13px] leading-relaxed text-[#c5c4bb] md:text-sm">
                          {f.line}
                        </p>
                      </div>
                      <p className="hidden max-w-[26ch] text-[13px] leading-relaxed text-(--mis-ink)/45 lg:block">
                        {f.fix}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Payoff */}
              <div
                data-mis-payoff
                className="pointer-events-none relative z-10 col-start-1 row-start-1"
              >
                <p data-mis-pay-kicker className={`${MICRO} text-(--mis-ink)/55 opacity-0`}>
                  {COPY.payoffKicker}
                </p>
                <p
                  className={`${DISPLAY} mt-2 flex flex-wrap gap-x-[0.28em] text-[length:clamp(2.75rem,min(9vw,15vh),8.5rem)] leading-[0.95] tracking-[-0.05em] md:mt-3`}
                >
                  <span className="-mb-[0.08em] block overflow-hidden pb-[0.12em]">
                    <span
                      data-mis-pay-in
                      className="block will-change-transform"
                      style={{ transform: "translate3d(0,112%,0)" }}
                    >
                      R1 in.
                    </span>
                  </span>
                  <span className="-mb-[0.08em] block overflow-hidden pb-[0.12em]">
                    <span
                      data-mis-pay-back
                      className={`block font-semibold tabular-nums tracking-[-0.05em] will-change-transform ${ACCENT_TEXT}`}
                      style={{ transform: "translate3d(0,112%,0)" }}
                    >
                      R
                      <span data-mis-roas aria-hidden>
                        1
                      </span>
                      <span className="sr-only">
                        {Number.isInteger(ROAS) ? ROAS : ROAS.toFixed(1)}
                      </span>{" "}
                      back.
                    </span>
                  </span>
                </p>
                <div className="mt-6 flex flex-col gap-5 md:mt-9 md:flex-row md:items-center md:gap-10">
                  <a
                    data-mis-pay-cta
                    href={calculatorHref}
                    onClick={handleCta}
                    onFocus={handleCtaFocus}
                    className={`${MICRO} group inline-flex min-h-[52px] w-fit min-w-[240px] items-center justify-between gap-[30px] bg-[#e6e2d8] px-5 text-[#242620] opacity-0 transition-[background-color,translate] duration-300 hover:-translate-y-[3px] hover:bg-[#cba58a] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-[5px] focus-visible:outline-[#b66c43]`}
                  >
                    {ctaLabel}
                    <svg
                      aria-hidden
                      viewBox="0 0 18 18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.6}
                      className="h-[18px] w-[18px] -rotate-45 transition-transform duration-300 group-hover:translate-x-1"
                    >
                      <path d="M2 9h13M10 4l5 5-5 5" />
                    </svg>
                  </a>
                  <div>
                    <p
                      data-mis-pay-note
                      className="max-w-[36ch] text-sm leading-relaxed text-[#c5c4bb] opacity-0 lg:text-[15px]"
                    >
                      {COPY.payoffNote}
                    </p>
                    <p
                      data-mis-pay-contact
                      className="mt-3 text-[13px] text-(--mis-ink)/50 opacity-0"
                    >
                      {COPY.contact}{" "}
                      <a
                        href="https://wa.me/27725742448"
                        className="border-b border-(--mis-ink)/40 pb-px text-(--mis-ink) transition-colors hover:border-[#b3714f] hover:text-(--mis-soft)"
                      >
                        Start a project
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0">
            <div
              data-mis-hint
              className={`${MICRO} flex items-center justify-center gap-3 pb-4 text-(--mis-ink)/50`}
            >
              Scroll
              <span className="h-4 w-px animate-pulse bg-(--mis-ink)/60 motion-reduce:animate-none" />
            </div>
            <div className="relative h-px w-full bg-(--mis-ink)/10">
              <div
                data-mis-bar
                className="h-full origin-left bg-(--mis-accent) will-change-transform"
                style={{ transform: "scaleX(0)" }}
              />
              {WINDOWS.map(([a], i) => (
                <span
                  key={i}
                  className="absolute bottom-0 h-[5px] w-px bg-(--mis-ink)/30"
                  style={{ left: `${a * 100}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
