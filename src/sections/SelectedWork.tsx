/**
 * ============================================================================
 *  SelectedWork — Skerp Studio (www.skerpstudio.com)
 *  Pinned, scroll-scrubbed showcase of four live client websites.
 *  Styled to match Skerp Studio's exact identity: warm parchment (#f2f0e9),
 *  deep olive-charcoal (#242620 / #252722), burnished Karoo copper (#a86b4e /
 *  #9c684d / #b3714f / #cba58a), Inter Tight display + DM Sans body/labels,
 *  sharp architectural rules, eagle crest, and real studio copy.
 * ============================================================================
 *
 *  STRUCTURE & SCROLL DISTANCE
 *    [data-sw="track"]   Outer scroll wrapper, height = 800svh.
 *                        Pinned scroll distance = 800 − 100 ≈ 700svh (~7 screens).
 *    [data-sw="stage"]   Sticky 100svh viewport (element to pin in GSAP).
 *    renderFrame(p)      Pure function mapping progress p ∈ [0, 1] to
 *                        GPU-friendly transforms & opacity.
 *    useNativeScrub()    Lightweight rAF + lerp scroll driver (zero external
 *                        animation libraries — no Framer Motion, no GSAP here).
 *
 *  SEQUENTIAL TIMELINE (p = 0 → 1)
 *    0.00 – 0.12  Intro   — Copper seam draws across #f2f0e9 parchment shutters;
 *                           "BUILT TO" / "WORK." part to reveal #242620 stage
 *                           while Project 01 settles into the exhibition frame.
 *    0.12 – 0.78  Work    — 4 live builds wipe sequentially with inner parallax,
 *                           masked Inter Tight word reveals, rolling 01/04 count,
 *                           scrubbed copper rail fills, and a live copper thread
 *                           connecting the frame to each active project node.
 *    0.78 – 0.97  Payoff  — Frame morphs to 16:10 & collapses into a stacked deck,
 *                           fans out into all 4 live project cards, eagle crest
 *                           draws in copper, "FOUR BUILDS. ALL LIVE." + CTAs rise.
 *    0.97 – 1.00  Hold    — Brief settle before the stage cleanly unpins.
 *
 *  HOW TO ATTACH GSAP SCROLLTRIGGER LATER
 *    1. Install & register once in your app entry:
 *         import gsap from "gsap";
 *         import { ScrollTrigger } from "gsap/ScrollTrigger";
 *         gsap.registerPlugin(ScrollTrigger);
 *
 *    2A. DROP-IN SCRUB (recommended — keeps CSS sticky on [data-sw="stage"]):
 *        Delete `useNativeScrub(trackRef, stageRef, render);` below and add:
 *
 *          useLayoutEffect(() => {
 *            const proxy = { p: 0 };
 *            const tween = gsap.to(proxy, {
 *              p: 1,
 *              ease: "none",
 *              onUpdate: () => render(proxy.p),
 *              scrollTrigger: {
 *                trigger: trackRef.current, // scrub across [data-sw="track"]
 *                start: "top top",
 *                end: "bottom bottom",      // ~700svh scroll distance
 *                scrub: 0.75,
 *                invalidateOnRefresh: true,
 *                onRefresh: remeasure,
 *              },
 *            });
 *            return () => { tween.scrollTrigger?.kill(); tween.kill(); };
 *          }, [render, remeasure]);
 *
 *    2B. GSAP-OWNED PIN:
 *        Remove `sticky top-0` from [data-sw="stage"] and the inline height on
 *        [data-sw="track"], then pin [data-sw="stage"] directly:
 *
 *          ScrollTrigger.create({
 *            trigger: stageRef.current,
 *            pin: stageRef.current,
 *            start: "top top",
 *            end: "+=700%",                 // ~700svh pinned scroll distance
 *            scrub: 0.75,
 *            anticipatePin: 1,
 *            invalidateOnRefresh: true,
 *            onRefresh: remeasure,
 *            onUpdate: (self) => render(self.progress),
 *          });
 *
 *        Individual elements also carry `data-sw` hooks ("shutter-top",
 *        "shutter-bottom", "seam", "frame", "slide", "slide-inner", "part",
 *        "thread", "seg-fill", "tile", "eagle", "outro-head", "outro-cta")
 *        if you prefer composing a native `gsap.timeline()`.
 * ============================================================================
 */

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import type { RefObject } from "react";

/* ============================================================================
   1. EDITABLE DATA — projects & Skerp Studio copy
   ========================================================================== */

type PlaceholderMotif = "seedtray" | "botanical" | "marigold" | "highveld";

type Project = {
  id: string;
  name: string;
  short: string;
  description: string;
  category: string;
  context: string;
  url: string;
  domain: string;
  /** Warm Skerp-family copper/earth accent (6-digit hex) */
  accent: string;
  /** Placeholder visual motif until replaced with a real screenshot */
  motif: PlaceholderMotif;
};

const PROJECTS: Project[] = [
  {
    id: "agri-edge",
    name: "Agri-Edge Precision SA",
    short: "Agri-Edge",
    description:
      "Made-to-order precision sowing systems built for South African growers.",
    category: "WEBSITE · DESIGN & DEVELOPMENT",
    context: "AGTECH · SOUTH AFRICA",
    url: "https://mellow-belekoy-f878dc.netlify.app/",
    domain: "mellow-belekoy-f878dc.netlify.app",
    accent: "#B87B58",
    motif: "seedtray",
  },
  {
    id: "sweet-charlie",
    name: "Sweet Charlie Strawberry Plants",
    short: "Sweet Charlie",
    description:
      "Healthy strawberry plants for home gardens, farms, nurseries and bulk orders.",
    category: "WEBSITE · DESIGN & DEVELOPMENT",
    context: "HORTICULTURE · GAUTENG",
    url: "https://sweet-charlie.co.za/",
    domain: "sweet-charlie.co.za",
    accent: "#C47D64",
    motif: "botanical",
  },
  {
    id: "lotus-divya-marigold",
    name: "Lotus & Divya Light — Marigold",
    short: "Lotus & Divya",
    description:
      "Hand-harvested marigold boxes and prayer goods, prepared to order in Gauteng.",
    category: "WEBSITE · DESIGN & DEVELOPMENT",
    context: "PRE-ORDER · GAUTENG",
    url: "https://lotusanddivyalight.co.za/",
    domain: "lotusanddivyalight.co.za",
    accent: "#CC8A52",
    motif: "marigold",
  },
  {
    id: "goldveld-charters",
    name: "Goldveld Charters",
    short: "Goldveld",
    description:
      "Reliable private bus and group transport across Southern Africa, direct on WhatsApp.",
    category: "WEBSITE · DESIGN & DEVELOPMENT",
    context: "GROUP TRANSPORT · GAUTENG",
    url: "https://goldveld-charters.netlify.app/",
    domain: "goldveld-charters.netlify.app",
    accent: "#C49A67",
    motif: "highveld",
  },
];

const STUDIO = {
  marker: "SKERP STUDIO",
  countLabel: "04 LIVE WEBSITES",
  introTop: "BUILT TO",
  introBottom: "WORK.",
  introSummary:
    "A few examples of the digital experiences we create for businesses.",
  motto: "Skerper as dié, kry jy nie!",
  scrollCue: "SCROLL TO EXPLORE",
  visitLabel: "VISIT WEBSITE",
  outroMarker: "SKERP STUDIO",
  outroTop: "SPOTLIGHT",
  outroBottomPrefix: "BUILDS. ",
  outroBottomAccent: "ALL LIVE.",
  outroTagline: "Websites. Audits. Automation.",
  primaryCta: {
    label: "START A PROJECT",
    href: "/start",
  },
  whatsappCta: {
    label: "WHATSAPP 072 574 2448",
    href: "https://wa.me/27725742448?text=Hi%20Skerp%20Studio%2C%20I%E2%80%99d%20like%20to%20discuss%20a%20project.",
  },
};

/* ============================================================================
   2. TIMELINE CONSTANTS — fractions of total scroll progress (0 → 1)
   ========================================================================== */

const TRACK_VH = 800; // wrapper height in svh → ~700svh pinned scroll distance
const SMOOTHING = 0.11; // native rAF scrub smoothing (0.06 silky · 0.25 crisp)
const DECK_SCALE = 1.34; // stacked deck size relative to a landed tile
const TILE_ASPECT = 1.6; // payoff cards are 16:10 — frame morphs to match

const TIMELINE = {
  introEnd: 0.12, // parchment shutters fully parted, Project 01 settled
  projectsEnd: 0.78, // Project 04 hands off into the deck collapse
  wipe: 0.06, // scroll span of each project-to-project wipe
  outroEnd: 0.97, // payoff complete; 0.97–1.00 holds cleanly before unpin
};

/* ============================================================================
   3. MATH & STYLE HELPERS
   ========================================================================== */

const clamp = (v: number, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v);
const range = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const easeIn = (t: number) => t * t * t;
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
const easeInOutQuart = (t: number) =>
  t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2;
const n3 = (v: number) => Math.round(v * 1000) / 1000;
const pad = (n: number) => String(n).padStart(2, "0");

const N = PROJECTS.length;
const SEG = (TIMELINE.projectsEnd - TIMELINE.introEnd) / N;
const projectStart = (i: number) => TIMELINE.introEnd + i * SEG;
const restPoint = (i: number) =>
  projectStart(i) + TIMELINE.wipe / 2 + (SEG - TIMELINE.wipe) * 0.3;

type Styles = {
  t?: string;
  o?: number;
  pe?: boolean;
  v?: boolean;
  dash?: number;
  clip?: string;
};
type Cache = {
  t?: string;
  o?: string;
  pe?: string;
  v?: string;
  dash?: string;
  clip?: string;
};
const styleCache = new WeakMap<Element, Cache>();

function apply(el: HTMLElement | SVGElement | null | undefined, s: Styles) {
  if (!el) return;
  let c = styleCache.get(el);
  if (!c) styleCache.set(el, (c = {}));
  const st = el.style;
  if (s.t !== undefined && s.t !== c.t) st.transform = c.t = s.t;
  if (s.o !== undefined) {
    const o = String(n3(s.o));
    if (o !== c.o) st.opacity = c.o = o;
  }
  if (s.pe !== undefined) {
    const pe = s.pe ? "auto" : "none";
    if (pe !== c.pe) st.pointerEvents = c.pe = pe;
  }
  if (s.v !== undefined) {
    const v = s.v ? "visible" : "hidden";
    if (v !== c.v) st.visibility = c.v = v;
  }
  if (s.dash !== undefined) {
    const d = String(n3(s.dash));
    if (d !== c.dash) st.strokeDashoffset = c.dash = d;
  }
  if (s.clip !== undefined && s.clip !== c.clip) st.clipPath = c.clip = s.clip;
}

/* ============================================================================
   4. DOM COLLECTION & LAYOUT MEASUREMENT
   ========================================================================== */

type Els = {
  stage: HTMLElement;
  frame: HTMLElement | null;
  grid: HTMLElement | null;
  shutterTop: HTMLElement | null;
  shutterBottom: HTMLElement | null;
  seam: HTMLElement | null;
  cueFill: HTMLElement | null;
  introFade: HTMLElement[];
  introWords: HTMLElement[];
  slides: HTMLElement[];
  slideInners: HTMLElement[];
  slideShades: HTMLElement[];
  shots: HTMLImageElement[];
  crestLogo: HTMLElement | null;
  texts: HTMLElement[];
  textParts: HTMLElement[][];
  chrome: HTMLElement[];
  counter: HTMLElement | null;
  segFills: HTMLElement[];
  segLabels: HTMLElement[];
  segDots: HTMLElement[];
  thread: HTMLElement | null;
  threadLine: HTMLElement | null;
  threadDot: HTMLElement | null;
  glows: HTMLElement[];
  outro: HTMLElement | null;
  outroGlow: HTMLElement | null;
  tiles: HTMLElement[];
  tileCaptions: HTMLElement[];
  outroHead: HTMLElement[];
  outroCta: HTMLElement[];
  eagle: { el: SVGElement; at: number }[];
};

type Metrics = {
  reduced: boolean;
  cover: number;
  coverX: number;
  coverY: number;
  deckX: number;
  deckY: number;
  segX: number[];
  collapse: number;
  clipX: number;
  clipY: number;
  tiles: { x: number; y: number }[];
  /** How far each full-page screenshot can scroll inside the frame (px). */
  shotTravel: number[];
};

const all = (root: ParentNode, key: string) =>
  Array.from(root.querySelectorAll<HTMLElement>(`[data-sw="${key}"]`));
const one = (root: ParentNode, key: string) =>
  root.querySelector<HTMLElement>(`[data-sw="${key}"]`);

function collect(stage: HTMLElement): Els {
  const texts = all(stage, "text");
  return {
    stage,
    frame: one(stage, "frame"),
    grid: one(stage, "grid"),
    shutterTop: one(stage, "shutter-top"),
    shutterBottom: one(stage, "shutter-bottom"),
    seam: one(stage, "seam"),
    cueFill: one(stage, "cue-fill"),
    introFade: all(stage, "intro-fade"),
    introWords: all(stage, "intro-word"),
    slides: all(stage, "slide"),
    slideInners: all(stage, "slide-inner"),
    slideShades: all(stage, "slide-shade"),
    shots: all(stage, "shot") as HTMLImageElement[],
    crestLogo: one(stage, "crest-logo"),
    texts,
    textParts: texts.map((t) => all(t, "part")),
    chrome: all(stage, "chrome"),
    counter: one(stage, "counter"),
    segFills: all(stage, "seg-fill"),
    segLabels: all(stage, "seg-label"),
    segDots: all(stage, "seg-dot"),
    thread: one(stage, "thread"),
    threadLine: one(stage, "thread-line"),
    threadDot: one(stage, "thread-dot"),
    glows: all(stage, "glow"),
    outro: one(stage, "outro"),
    outroGlow: one(stage, "outro-glow"),
    tiles: all(stage, "tile"),
    tileCaptions: all(stage, "tile-caption"),
    outroHead: all(stage, "outro-head"),
    outroCta: all(stage, "outro-cta"),
    eagle: Array.from(
      stage.querySelectorAll<SVGElement>('[data-sw="eagle"]'),
    ).map((el) => ({ el, at: Number(el.getAttribute("data-at")) || 0 })),
  };
}

function offsetWithin(el: HTMLElement, root: HTMLElement) {
  let x = 0;
  let y = 0;
  let n: HTMLElement | null = el;
  while (n && n !== root) {
    x += n.offsetLeft;
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  return { x, y };
}

function measure(e: Els, m: Metrics) {
  const { stage, frame, grid, tiles } = e;
  if (!frame || !grid) return;

  const sw = stage.clientWidth;
  const sh = stage.clientHeight;
  const f = offsetWithin(frame, stage);
  const fw = frame.offsetWidth;
  const fh = frame.offsetHeight;
  const fcx = f.x + fw / 2;
  const fcy = f.y + fh / 2;

  m.cover = Math.max(sw / fw, sh / fh) * 1.03;
  m.coverX = sw / 2 - fcx;
  m.coverY = sh / 2 - fcy;

  const g = offsetWithin(grid, stage);
  const gcx = g.x + grid.offsetWidth / 2;
  const gcy = g.y + grid.offsetHeight / 2;
  m.deckX = gcx - fcx;
  m.deckY = gcy - fcy;

  m.tiles = tiles.map((t) => {
    const o = offsetWithin(t, stage);
    const artH = t.offsetWidth / TILE_ASPECT;
    t.style.transformOrigin = `50% ${artH / 2}px`;
    return { x: gcx - (o.x + t.offsetWidth / 2), y: gcy - (o.y + artH / 2) };
  });

  // Copper connector spans from frame bottom edge straight to the rail line.
  m.segX = e.segFills.map((s) => {
    const o = offsetWithin(s, stage);
    return o.x + s.offsetWidth / 2;
  });
  if (e.thread && e.segFills[0]) {
    const lineY = offsetWithin(e.segFills[0], stage).y;
    const frameBottom = f.y + fh;
    e.thread.style.top = `${frameBottom}px`;
    e.thread.style.height = `${Math.max(0, lineY - frameBottom)}px`;
  }

  // Morph frame cleanly to 16:10 tile proportions during collapse.
  const tw = tiles[0]?.offsetWidth || 1;
  const fa = fw / fh;
  m.clipX = fa > TILE_ASPECT ? (fw - fh * TILE_ASPECT) / 2 : 0;
  m.clipY = fa < TILE_ASPECT ? (fh - fw / TILE_ASPECT) / 2 : 0;
  m.collapse = clamp((tw * DECK_SCALE) / (fw - m.clipX * 2), 0.2, 0.9);
  m.shotTravel = e.shots.map((img) => Math.max(0, img.offsetHeight - fh));
}

function readProgress(track: HTMLElement, stage: HTMLElement) {
  const dist = track.offsetHeight - stage.offsetHeight;
  return dist > 0 ? clamp(-track.getBoundingClientRect().top / dist) : 0;
}

/* ============================================================================
   5. SCROLL CHOREOGRAPHY — pure function of progress p ∈ [0, 1]
   ========================================================================== */

function revealGroup(parts: HTMLElement[], t: number, M: number) {
  const last = Math.max(1, parts.length - 1);
  parts.forEach((el, k) => {
    const d = k / last;
    const a = easeOut(range(t, d * 0.48, d * 0.48 + 0.52));
    apply(el, { t: `translate3d(0,${n3((1 - a) * 112 * M)}%,0)`, o: a });
  });
}

function renderFrame(p: number, e: Els, m: Metrics) {
  const { introEnd: I, projectsEnd: P, wipe: W } = TIMELINE;
  const M = m.reduced ? 0 : 1;

  /* --- 1 · Intro: copper seam draws → #f2f0e9 parchment shutters part ----- */
  const fadeIntro = range(p, 0, 0.032);
  const seam = easeOut(range(p, 0.003, 0.038));
  const open = easeInOutQuart(range(p, 0.028, I));
  const settle = easeOut(range(p, 0.032, I + 0.03));

  e.introFade.forEach((el) =>
    apply(el, {
      o: 1 - fadeIntro,
      t: `translate3d(0,${n3(-fadeIntro * 14 * M)}px,0)`,
    }),
  );
  e.introWords.forEach((el, k) =>
    apply(el, {
      t: `translate3d(${n3((k ? 1 : -1) * seam * 1.4 * M)}%,0,0)`,
    }),
  );
  apply(e.seam, { t: `scaleX(${n3(seam)})`, o: 1 - range(p, 0.042, 0.075) });
  apply(e.cueFill, { t: `scaleY(${n3(clamp(p / 0.03))})` });

  const shutterO = M ? 1 : 1 - open;
  apply(e.shutterTop, {
    t: `translate3d(0,${n3(-open * 100 * M)}%,0)`,
    o: shutterO,
    v: open < 1,
  });
  apply(e.shutterBottom, {
    t: `translate3d(0,${n3(open * 100 * M)}%,0)`,
    o: shutterO,
    v: open < 1,
  });

  /* --- 2 · Exhibition frame: zoom-settle on entry, deck morph on exit ----- */
  const collapse = easeInOut(range(p, P, P + 0.07));
  const coverScale = lerp(m.cover, 1, M ? settle : 1);
  const fx = (m.coverX * (1 - settle) + m.deckX * collapse) * M;
  const fy = (m.coverY * (1 - settle) + m.deckY * collapse) * M;
  const fs = coverScale * lerp(1, m.collapse, collapse * M);
  const frameFade = range(p, P + 0.046, P + 0.076);

  apply(e.frame, {
    t: `translate3d(${n3(fx)}px,${n3(fy)}px,0) scale(${n3(fs)})`,
    o: 1 - frameFade,
    v: frameFade < 1,
    clip:
      collapse > 0 && M
        ? `inset(${n3(m.clipY * collapse)}px ${n3(m.clipX * collapse)}px)`
        : "none",
  });

  /* --- 3 · Project slides: rising wipe + inner counter-parallax ----------- */
  const wipeIn = (i: number) =>
    i <= 0
      ? 1
      : i >= N
        ? 0
        : easeInOut(range(p, projectStart(i) - W / 2, projectStart(i) + W / 2));

  for (let i = 0; i < N; i++) {
    const w = wipeIn(i);
    const next = wipeIn(i + 1);
    const drift = range(
      p,
      i ? projectStart(i) - W / 2 : 0.03,
      i < N - 1 ? projectStart(i + 1) + W / 2 : P + 0.07,
    );
    // Slideshow: each site slides in from the RIGHT, the previous one eases left and dims.
    apply(e.slides[i], {
      t: `translate3d(${n3((1 - w) * 100 * M - next * 18 * M)}%,0,0)`,
      o: M ? 1 : w,
      v: w > 0 && next < 1,
    });
    // No zoom on the screenshots: they stay crisp; only a gentle parallax slide.
    apply(e.slideInners[i], { t: `translate3d(${n3(-(1 - w) * 40 * M)}%,0,0)` });
    // Full-page screenshot scrolls down the site while this project is on stage.
    const travel = m.shotTravel[i] || 0;
    const read = easeInOut(range(drift, 0.08, 0.86));
    apply(e.shots[i], { t: `translate3d(0,${n3(-travel * read)}px,0)` });
    apply(e.slideShades[i], { o: next * 0.68 });
  }

  /* --- 4 · Editorial typography: masked sequential reveal in & out -------- */
  for (let i = 0; i < N; i++) {
    const inAt = i ? projectStart(i) - W * 0.1 : I - 0.04;
    const tin = range(p, inAt, inAt + W * 1.18);
    const outAt = i < N - 1 ? projectStart(i + 1) - W * 0.95 : P - W * 0.6;
    const tout = range(p, outAt, outAt + W * 0.55);
    const parts = e.textParts[i] ?? [];
    const last = Math.max(1, parts.length - 1);
    parts.forEach((el, k) => {
      const d = k / last;
      const a = easeOut(range(tin, d * 0.45, d * 0.45 + 0.55));
      const b = easeIn(range(tout, d * 0.3, d * 0.3 + 0.7));
      apply(el, {
        t: `translate3d(0,${n3(((1 - a) * 112 - b * 112) * M)}%,0)`,
        o: a * (1 - b),
      });
    });
    apply(e.texts[i], { pe: tin > 0.58 && tout < 0.42 });
  }

  /* --- 5 · Studio chrome: counter, copper connector thread & index rail --- */
  let active = 0;
  for (let i = 1; i < N; i++) active += wipeIn(i);
  apply(e.counter, { t: `translate3d(0,${n3((-active * 100) / N)}%,0)` });

  const chromeOut = range(p, P - 0.01, P + 0.036);
  e.chrome.forEach((el, k) => {
    const cin = easeOut(range(p, I - 0.038 + k * 0.01, I + 0.008 + k * 0.01));
    apply(el, {
      o: cin * (1 - chromeOut),
      t: `translate3d(0,${n3((1 - cin) * 12 * M)}px,0)`,
      pe: cin > 0.5 && chromeOut < 0.5,
    });
  });

  for (let i = 0; i < N; i++) {
    const segA = i ? projectStart(i) : I;
    const segB = i < N - 1 ? projectStart(i + 1) : P;
    apply(e.segFills[i], { t: `scaleX(${n3(range(p, segA, segB))})` });
    const current = clamp(1 - Math.abs(active - i));
    apply(e.segLabels[i], { o: 0.45 + 0.55 * current });
    apply(e.segDots[i], {
      o: current,
      t: `scale(${n3(0.4 + 0.6 * current)})`,
    });
    apply(e.glows[i], { o: current * open * (1 - chromeOut) });
  }

  if (e.thread && m.segX.length) {
    const lo = Math.floor(clamp(active, 0, N - 1));
    const hi = Math.min(N - 1, lo + 1);
    const x = lerp(m.segX[lo], m.segX[hi], active - lo);
    const settledIn = 1 - clamp(Math.abs(active - Math.round(active)) * 2);
    const drawn = easeOut(range(p, I - 0.008, I + 0.03)) * (1 - chromeOut);
    apply(e.thread, { t: `translate3d(${n3(x)}px,0,0)`, o: drawn });
    apply(e.threadLine, { t: `scaleY(${n3(lerp(0.32, 1, settledIn))})` });
    apply(e.threadDot, { t: `scale(${n3(settledIn)})`, o: settledIn });
  }

  /* --- 6 · Payoff: stacked deck → 4-card fan-out → eagle crest → CTA ------ */
  apply(e.outro, { v: p > P + 0.03, pe: p > P + 0.13 });
  const appear = easeOut(range(p, P + 0.042, P + 0.076));
  apply(e.outroGlow, { o: appear });

  e.tiles.forEach((el, i) => {
    const off = m.tiles[i] ?? { x: 0, y: 0 };
    const f = easeInOut(range(p, P + 0.066 + i * 0.011, P + 0.138 + i * 0.011));
    const inv = (1 - f) * M;
    const rot = (N - 1 - i) * 2.6 * (i % 2 ? 1 : -1) * inv;
    const s = M ? lerp(DECK_SCALE, 1, f) : 1;
    apply(el, {
      t: `translate3d(${n3(off.x * inv)}px,${n3(off.y * inv)}px,0) rotate(${n3(rot)}deg) scale(${n3(s)})`,
      o: appear,
    });
    apply(e.tileCaptions[i], { o: range(f, 0.62, 1) });
  });

  revealGroup(e.outroHead, range(p, P + 0.088, P + 0.155), M);
  revealGroup(e.outroCta, range(p, P + 0.145, P + 0.185), M);

  const draw = range(p, P + 0.042, P + 0.158);
  const logoIn = easeOut(range(draw, 0, 0.7));
  apply(e.crestLogo, { o: logoIn, t: `scale(${n3(lerp(0.7, 1, logoIn))}) rotate(${n3((1 - logoIn) * -12 * M)}deg)` });
}

/* ============================================================================
   6. NATIVE SCROLL-SCRUB DRIVER — replace with ScrollTrigger (see header)
   ========================================================================== */

function useNativeScrub(
  trackRef: RefObject<HTMLElement | null>,
  stageRef: RefObject<HTMLElement | null>,
  onFrame: (p: number) => void,
) {
  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;
    const instant = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let current = -1;
    let raf = 0;
    let last = 0;

    const tick = (now: number) => {
      const target = readProgress(track, stage);
      const dt = last ? Math.min(64, now - last) : 16.7;
      last = now;
      if (current < 0 || instant) {
        current = target;
      } else {
        current +=
          (target - current) * (1 - Math.pow(1 - SMOOTHING, dt / 16.7));
        if (Math.abs(target - current) < 0.0001) current = target;
      }
      onFrame(current);
      if (current !== target) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
        last = 0;
      }
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    kick();
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
    };
  }, [trackRef, stageRef, onFrame]);
}

/* ============================================================================
   7. SKERP STUDIO BRAND ELEMENTS & PLACEHOLDER VISUALS
   ========================================================================== */

/** Exact Skerp Studio arrow icon from www.skerpstudio.com (`zl` component). */
function SkerpArrow({
  diagonal = true,
  className = "",
}: {
  diagonal?: boolean;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-[17px] w-[17px] shrink-0 transition-transform duration-250 ${
        diagonal
          ? "-rotate-45 group-hover/cta:translate-x-[3px] group-hover/cta:-translate-y-[3px]"
          : "group-hover/cta:translate-x-[4px]"
      } ${className}`}
    >
      <path d="M4 12h16M13 5l7 7-7 7" />
    </svg>
  );
}

/** Exact Skerp Studio stacked wordmark (`SKERP.` + `STUDIO`). */
function SkerpWordmark({ light = true }: { light?: boolean }) {
  return (
    <span
      className={`inline-flex flex-col leading-none select-none ${
        light ? "text-[#f1eee5]" : "text-[#22231f]"
      }`}
    >
      <span className="font-['Inter_Tight',sans-serif] text-[22px] font-black leading-[0.78] tracking-[-0.075em] md:text-[26px]">
        SKERP
        <span className={light ? "text-[#b47755]" : "text-[#ae714e]"}>.</span>
      </span>
      <span
        className={`mt-[5px] font-['DM_Sans',sans-serif] text-[7px] font-bold tracking-[0.36em] ${
          light ? "text-[#b8b9b0]" : "text-[#22231f]"
        }`}
      >
        STUDIO
      </span>
    </span>
  );
}


/** Foreshortened Highveld road centre-line markers (viewBox 100×40). */
const ROAD_MARKS = [
  "49.9,1 50.1,1 50.12,1.6 49.88,1.6",
  "49.86,2.5 50.14,2.5 50.17,3.7 49.83,3.7",
  "49.81,5 50.19,5 50.24,6.9 49.76,6.9",
  "49.73,9 50.27,9 50.34,12.2 49.66,12.2",
  "49.6,15.5 50.4,15.5 50.52,21 49.48,21",
  "49.38,26 50.62,26 50.82,35.5 49.18,35.5",
];

/**
 * EDITORIAL IMAGE PLACEHOLDER
 * Warm olive-charcoal, limestone & Karoo-copper compositions tailored to each
 * client's craft and harmonised with www.skerpstudio.com's exact palette.
 *
 * Replace with a real project screenshot (or live iframe thumbnail):
 *   <img
 *     src={`/images/work/${project.id}.webp`}
 *     alt={`${project.name} website`}
 *     className="absolute inset-0 h-full w-full object-cover"
 *   />
 */
function ProjectPlaceholder({
  project,
  compact = false,
}: {
  project: Project;
  compact?: boolean;
}) {
  const base = "absolute inset-0 overflow-hidden [container-type:size]";

  if (project.motif === "seedtray") {
    const fade = "linear-gradient(to top, #000 22%, transparent 90%)";
    return (
      <div
        data-placeholder="project-image"
        className={base}
        style={{
          background:
            "radial-gradient(68% 58% at 52% 30%, rgba(184,123,88,0.22) 0%, transparent 70%), radial-gradient(80% 70% at 24% 40%, rgba(74,88,62,0.42) 0%, transparent 72%), linear-gradient(180deg, #22271e 0%, #171915 100%)",
        }}
      >
        {/* Perspective seedling propagation tray — warm stone rules + copper seeds */}
        <div className="absolute inset-x-[-48%] bottom-[-8%] h-[138%] [perspective:1000px]">
          <div
            className="absolute inset-0 origin-bottom"
            style={{
              transform: "rotateX(58deg)",
              backgroundImage:
                "radial-gradient(circle, #cba58a 0 2px, transparent 2.8px), linear-gradient(90deg, rgba(230,226,216,0.16) 1px, transparent 1px), linear-gradient(0deg, rgba(230,226,216,0.16) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
              maskImage: fade,
              WebkitMaskImage: fade,
            }}
          />
        </div>
        {/* Editorial calibration horizon */}
        <div className="absolute inset-x-[12%] top-[34%] flex items-center gap-3">
          <span className="h-px flex-1 bg-[#e6e2d8]/18" />
          <span className="h-[7px] w-[7px] rounded-full bg-[#b87b58]" />
          <span className="h-px flex-1 bg-[#e6e2d8]/18" />
        </div>
        {!compact && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-[6%] top-[16%] select-none font-['Inter_Tight',sans-serif] text-[14cqmin] font-extrabold leading-none tracking-[-0.07em] text-[#f2f0e9]/[0.045]"
          >
            01
          </span>
        )}
      </div>
    );
  }

  if (project.motif === "botanical") {
    const seed =
      "radial-gradient(1.5px 2.3px at 50% 50%, rgba(239,207,182,0.55) 95%, transparent 100%)";
    const mask =
      "radial-gradient(46% 56% at 38% 52%, #000 24%, transparent 96%)";
    return (
      <div
        data-placeholder="project-image"
        className={base}
        style={{
          background:
            "radial-gradient(55% 64% at 36% 52%, rgba(168,94,74,0.52) 0%, rgba(112,62,48,0.28) 48%, transparent 76%), radial-gradient(46% 48% at 78% 28%, rgba(190,192,173,0.18) 0%, transparent 72%), linear-gradient(155deg, #271d1a 0%, #181714 78%)",
        }}
      >
        {/* Warm botanical seed stipple */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `${seed}, ${seed}`,
            backgroundSize: "30px 36px, 30px 36px",
            backgroundPosition: "0 0, 15px 18px",
            maskImage: mask,
            WebkitMaskImage: mask,
          }}
        />
        {/* Sage-limestone & terracotta editorial contour rings */}
        <div className="absolute right-[11%] top-[14%] h-[42cqmin] w-[42cqmin] rounded-full border border-[#e6e2d8]/16" />
        <div className="absolute right-[11%] top-[14%] h-[42cqmin] w-[42cqmin] translate-x-[16%] translate-y-[16%] rounded-full border border-[#c47d64]/28" />
        <div className="absolute left-[22%] top-[36%] h-[22cqmin] w-[22cqmin] rounded-full bg-[#f2f0e9]/[0.05] blur-2xl" />
        {!compact && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-[6%] top-[16%] select-none font-['Inter_Tight',sans-serif] text-[14cqmin] font-extrabold leading-none tracking-[-0.07em] text-[#f2f0e9]/[0.045]"
          >
            02
          </span>
        )}
      </div>
    );
  }

  if (project.motif === "marigold") {
    const outerRings =
      "radial-gradient(circle, transparent 0 10%, #000 10.5% 23%, transparent 23.5% 28%, #000 28.5% 42%, transparent 42.5% 47%, #000 47.5% 60%, transparent 67%)";
    const innerRings =
      "radial-gradient(circle, transparent 0 23%, #000 23.5% 28%, transparent 28.5% 42%, #000 42.5% 47%, transparent 47.5%)";
    const bloom =
      "absolute left-1/2 top-[48%] h-[84cqmin] w-[84cqmin] -translate-x-1/2 -translate-y-1/2 rounded-full";
    return (
      <div
        data-placeholder="project-image"
        className={base}
        style={{
          background:
            "radial-gradient(40% 48% at 50% 48%, rgba(204,138,82,0.42) 0%, transparent 72%), radial-gradient(90% 65% at 50% 115%, rgba(168,107,78,0.34) 0%, transparent 70%), linear-gradient(180deg, #241c14 0%, #171713 84%)",
        }}
      >
        <div
          className={bloom}
          style={{
            background:
              "repeating-conic-gradient(from 0deg, rgba(204,138,82,0.32) 0deg 5deg, transparent 5deg 12deg)",
            maskImage: outerRings,
            WebkitMaskImage: outerRings,
          }}
        />
        <div
          className={bloom}
          style={{
            background:
              "repeating-conic-gradient(from 6deg, rgba(241,233,220,0.2) 0deg 4deg, transparent 4deg 12deg)",
            maskImage: innerRings,
            WebkitMaskImage: innerRings,
          }}
        />
        {/* Warm divya lamp core in cream & ochre */}
        <div
          className="absolute left-1/2 top-[48%] h-[13cqmin] w-[13cqmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, #f6f0e7 0%, #cc8a52 44%, transparent 74%)",
            boxShadow: "0 0 80px 22px rgba(204,138,82,0.36)",
          }}
        />
        {!compact && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-[6%] top-[16%] select-none font-['Inter_Tight',sans-serif] text-[14cqmin] font-extrabold leading-none tracking-[-0.07em] text-[#f2f0e9]/[0.045]"
          >
            03
          </span>
        )}
      </div>
    );
  }

  // "highveld" — Gauteng / Southern Africa open road at warm dusk
  return (
    <div
      data-placeholder="project-image"
      className={base}
      style={{
        background:
          "linear-gradient(180deg, #1b1d19 0%, #26251f 30%, #3d3225 50%, #6b5038 58.6%, #181915 59%, #141512 100%)",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(54% 26% at 50% 59%, rgba(203,165,138,0.38) 0%, transparent 72%)",
        }}
      />
      <div
        className="absolute left-1/2 top-[59%] h-[28cqmin] w-[28cqmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, #f6f0e7 0%, #c49a67 42%, transparent 72%)",
          clipPath: "inset(0 0 50% 0)",
        }}
      />
      <div
        className="absolute inset-x-0 top-[59%] h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(230,226,216,0.55) 28%, rgba(230,226,216,0.55) 72%, transparent)",
        }}
      />
      <svg
        className="absolute left-0 top-[59%] h-[41%] w-full"
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <polygon points="49.3,0 50.7,0 96,40 4,40" fill="#1e1e19" />
        <path
          d="M49.3 0 L4 40 M50.7 0 L96 40"
          stroke="#e6e2d8"
          strokeOpacity={0.28}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
          fill="none"
        />
        <g fill="#cba58a" fillOpacity={0.82}>
          {ROAD_MARKS.map((pts) => (
            <polygon key={pts} points={pts} />
          ))}
        </g>
      </svg>
      {!compact && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-[6%] top-[16%] select-none font-['Inter_Tight',sans-serif] text-[14cqmin] font-extrabold leading-none tracking-[-0.07em] text-[#f2f0e9]/[0.045]"
        >
          04
        </span>
      )}
    </div>
  );
}

/** Per-project editorial overlay (domain, micro-label, Inter Tight title, CTA). */
function ProjectOverlay({
  project,
  index,
  onFocus,
}: {
  project: Project;
  index: number;
  onFocus: () => void;
}) {
  const words = project.name.split(" ");
  return (
    <div
      data-sw="text"
      onFocus={onFocus}
      className="pointer-events-none absolute inset-0 z-20"
    >
      {/* Live domain — top right */}
      <div className="absolute right-5 top-4 hidden overflow-hidden md:right-8 md:top-6 md:block">
        <p
          data-sw="part"
          className="font-['DM_Sans',sans-serif] text-[10px] font-bold uppercase tracking-[0.105em] text-[#eeeae0]/65 md:text-[11px]"
        >
          {project.domain}
        </p>
      </div>

      {/* Bottom editorial lockup */}
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 md:p-10 lg:p-12">
        <div className="grid items-end gap-5 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-7 lg:col-span-8">
            <div className="overflow-hidden">
              <p
                data-sw="part"
                className="flex items-center gap-[11px] font-['DM_Sans',sans-serif] text-[10px] font-bold uppercase tracking-[0.105em] text-[#cba58a] md:text-[11px]"
              >
                <span>{pad(index + 1)}</span>
                <span
                  aria-hidden="true"
                  className="inline-block h-px w-[21px] bg-current"
                />
                <span>{project.context}</span>
              </p>
            </div>

            <h3 className="mt-3 text-balance font-['Inter_Tight',sans-serif] text-[clamp(2.15rem,5.6vw,5.75rem)] font-extrabold leading-[0.94] tracking-[-0.055em] text-[#f2f0e9] md:mt-4">
              {words.map((word, k) => (
                <span
                  key={`${word}-${k}`}
                  className="mr-[0.22em] inline-block overflow-hidden pb-[0.1em] align-top last:mr-0"
                >
                  <span data-sw="part" className="inline-block">
                    {word}
                  </span>
                </span>
              ))}
            </h3>
          </div>

          <div className="md:col-span-5 md:justify-self-end lg:col-span-4">
            <div className="overflow-hidden">
              <p
                data-sw="part"
                className="max-w-[36ch] font-['DM_Sans',sans-serif] text-[14px] leading-[1.55] text-[#d2d0c7] md:text-[16px]"
              >
                {project.description}
              </p>
            </div>

            {/* Exact Skerp Studio `.button.button-light` action */}
            <div className="mt-5 overflow-hidden pt-1 md:mt-6">
              <div data-sw="part">
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/cta inline-flex min-h-[48px] items-center justify-between gap-[26px] bg-[#e6e2d8] px-5 font-['DM_Sans',sans-serif] text-[11px] font-bold uppercase tracking-[0.105em] text-[#242620] transition-[background-color,color,transform] duration-250 hover:-translate-y-[3px] hover:bg-[#cba58a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b66c43] md:min-h-[52px]"
                >
                  <span>{STUDIO.visitLabel}</span>
                  <SkerpArrow diagonal />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   8. MAIN COMPONENT — default export
   ========================================================================== */

export default function SelectedWork({ standalone = false }: { standalone?: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const elsRef = useRef<Els | null>(null);
  const progressRef = useRef(0);
  const metricsRef = useRef<Metrics>({
    reduced: false,
    cover: 1.2,
    coverX: 0,
    coverY: 0,
    deckX: 0,
    deckY: 0,
    segX: [],
    collapse: 0.4,
    clipX: 0,
    clipY: 0,
    tiles: [],
    shotTravel: [],
  });

  /* Work page: skip the long intro and open on the stacked deck of sites (logo on top);
   * scrolling then fans them out into their places. A short automatic intro plays on load. */
  const START = standalone ? TIMELINE.projectsEnd + 0.07 : 0;
  const introRef = useRef(standalone ? 0 : 1);
  const toTimeline = useCallback(
    (p: number) => {
      const base = START + p * (1 - START);
      if (introRef.current >= 1) return base;
      const t = introRef.current;
      const k = 1 - (1 - t) ** 3;
      return lerp(TIMELINE.projectsEnd + 0.005, base, k);
    },
    [START],
  );

  /** Apply scroll progress p ∈ [0, 1] — called by native scrub or ScrollTrigger. */
  const render = useCallback(
    (p: number) => {
      progressRef.current = p;
      if (elsRef.current) renderFrame(toTimeline(p), elsRef.current, metricsRef.current);
    },
    [toTimeline],
  );

  // Automatic intro on the Work page: last site collapses into the stacked deck.
  useEffect(() => {
    if (!standalone) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      introRef.current = 1;
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      introRef.current = Math.min(1, (now - t0) / 1400);
      if (elsRef.current) renderFrame(toTimeline(progressRef.current), elsRef.current, metricsRef.current);
      if (introRef.current < 1) raf = requestAnimationFrame(tick);
    };
    const start = window.setTimeout(() => (raf = requestAnimationFrame(tick)), 250);
    return () => {
      window.clearTimeout(start);
      cancelAnimationFrame(raf);
    };
  }, [standalone, toTimeline]);

  /** Re-measure layout geometry on resize / font load and redraw current frame. */
  const remeasure = useCallback(() => {
    if (!elsRef.current) return;
    measure(elsRef.current, metricsRef.current);
    renderFrame(toTimeline(progressRef.current), elsRef.current, metricsRef.current);
  }, []);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const track = trackRef.current;
    if (!stage || !track) return;
    elsRef.current = collect(stage);
    metricsRef.current.reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    progressRef.current = readProgress(track, stage);
    remeasure();
    const ro = new ResizeObserver(() => remeasure());
    ro.observe(stage);
    document.fonts?.ready.then(() => remeasure()).catch(() => undefined);
    return () => ro.disconnect();
  }, [remeasure]);

  // Swap this single line for the GSAP ScrollTrigger block in the file header.
  useNativeScrub(trackRef, stageRef, render);

  const scrollToProgress = useCallback((target: number) => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;
    const dist = track.offsetHeight - stage.offsetHeight;
    const top =
      window.scrollY + track.getBoundingClientRect().top + target * dist;
    window.scrollTo({
      top,
      behavior: metricsRef.current.reduced ? "auto" : "smooth",
    });
  }, []);

  const focusProject = (i: number) => {
    const p = progressRef.current;
    const from = projectStart(i) - TIMELINE.wipe / 2;
    if (p < from || p > from + SEG) scrollToProgress(restPoint(i));
  };

  return (
    <section
      id="work"
      aria-labelledby="work-title"
      className={`${standalone ? "" : "overlap-prev"} relative z-10 bg-transparent font-['DM_Sans',sans-serif] text-[#f1eee5] antialiased selection:bg-[#b98361] selection:text-white`}
    >
      <h2 id="work-title" className="sr-only">
        Selected Work — Built to Work.
      </h2>

      {/* SCROLL TRACK — height sets the ~700svh pinned scroll run */}
      <div
        ref={trackRef}
        data-sw="track"
        className="relative"
        style={{ height: `${standalone ? 230 : TRACK_VH}svh` }}
      >
        {/* PINNED STAGE — Skerp deep olive-charcoal (#242620) gallery viewport */}
        <div
          ref={stageRef}
          data-sw="stage"
          className="sticky top-0 h-svh w-full overflow-hidden bg-[#242620]"
        >
          {/* Subtle warm Karoo-copper ambient wash — opacity-only per project */}
          {PROJECTS.map((pr) => (
            <div
              key={pr.id}
              data-sw="glow"
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0"
              style={{
                background: `radial-gradient(68% 58% at 50% 48%, ${pr.accent}24 0%, transparent 74%)`,
              }}
            />
          ))}

          {/* ================= EXHIBITION FRAME ================= */}
          <div
            data-sw="frame"
            className="absolute bottom-[5.25rem] top-[3.75rem] left-[clamp(16px,5.1vw,88px)] right-[clamp(16px,5.1vw,88px)] z-10 overflow-hidden border border-[#54584f] bg-[#181a16] will-change-transform md:bottom-[6.5rem] md:top-[4.75rem]"
          >
            {PROJECTS.map((pr) => (
              <div
                key={pr.id}
                data-sw="slide"
                className="absolute inset-0 overflow-hidden will-change-transform"
              >
                <div
                  data-sw="slide-inner"
                  className="absolute inset-0 will-change-transform"
                >
                  {/* REAL IMAGE DROP-IN:
                      Replace <ProjectPlaceholder project={pr} /> below with:
                      <img
                        src={`/images/work/${pr.id}.webp`}
                        alt={`${pr.name} website`}
                        className="absolute inset-0 h-full w-full object-cover"
                      /> */}
                  <ProjectPlaceholder project={pr} />
                  <img
                    data-sw="shot"
                    src={`/images/work/${pr.id}-full.webp`}
                    alt={`${pr.name} website, landing page`}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => window.dispatchEvent(new Event("resize"))}
                    onError={(e) => (e.currentTarget.style.display = "none")}
                    className="absolute inset-0 block h-full w-full object-cover object-left-top"
                  />
                </div>
                <div
                  data-sw="slide-shade"
                  aria-hidden="true"
                  className="absolute inset-0 bg-[#141513] opacity-0"
                />
                {/* Crisp warm top seam on incoming wipes */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-px bg-[#cba58a]/45"
                />
              </div>
            ))}

            {/* Warm Skerp olive-charcoal scrims (#141513, never cold black) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[58%] bg-gradient-to-t from-[#141513]/90 via-[#141513]/35 to-transparent"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-[#141513]/58 to-transparent"
            />

            {/* Discipline marker — exact Skerp 7px copper dot + micro-label */}
            <div className="pointer-events-none absolute left-5 top-4 z-20 flex items-center gap-[10px] text-[10px] font-bold uppercase tracking-[0.105em] text-[#eeeae0]/85 md:left-8 md:top-6 md:text-[11px]">
              <span
                aria-hidden="true"
                className="inline-block h-[7px] w-[7px] shrink-0 rounded-full bg-[#b3714f]"
              />
              <span className="hidden sm:inline">
                WEBSITE · DESIGN &amp; DEVELOPMENT
              </span>
              <span className="sm:hidden">LIVE WEBSITE</span>
            </div>

            {PROJECTS.map((pr, i) => (
              <ProjectOverlay
                key={pr.id}
                project={pr}
                index={i}
                onFocus={() => focusProject(i)}
              />
            ))}
          </div>

          {/* ================= TOP BAR CHROME ================= */}
          <div className="pointer-events-none absolute top-0 left-[clamp(16px,5.1vw,88px)] right-[clamp(16px,5.1vw,88px)] z-20 flex h-[3.75rem] items-center justify-between md:h-[4.75rem]">
            <div data-sw="chrome" className="flex items-center gap-5 opacity-0">
              <SkerpWordmark light />
              <span
                aria-hidden="true"
                className="hidden h-4 w-px bg-[#54584f] sm:inline-block"
              />
              <span className="hidden items-center gap-[10px] text-[11px] font-bold uppercase tracking-[0.105em] text-[#a8aaa0] sm:inline-flex">
                <span
                  aria-hidden="true"
                  className="inline-block h-[7px] w-[7px] rounded-full bg-[#b3714f]"
                />
                {STUDIO.marker}
              </span>
            </div>

            <div
              data-sw="chrome"
              className="flex items-baseline gap-1.5 text-[11px] font-bold uppercase tracking-[0.105em] tabular-nums opacity-0"
            >
              <span className="relative inline-block h-[1em] overflow-hidden leading-none text-[#f1eee5]">
                <span data-sw="counter" className="block">
                  {PROJECTS.map((pr, i) => (
                    <span key={pr.id} className="block h-[1em] leading-none">
                      {pad(i + 1)}
                    </span>
                  ))}
                </span>
              </span>
              <span className="text-[#94978c]">/ {pad(N)}</span>
            </div>
          </div>

          {/* ================= COPPER CONNECTOR THREAD =================
              Visibly links the exhibition frame to the active project node on
              the index rail and glides between nodes as you scroll. */}
          <div
            data-sw="thread"
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 z-20 w-px opacity-0 will-change-transform"
          >
            <span
              data-sw="thread-line"
              className="absolute inset-0 origin-top bg-[#b3714f]"
            />
            <span
              data-sw="thread-dot"
              className="absolute -bottom-[3.5px] left-1/2 h-[7px] w-[7px] -translate-x-1/2 rounded-full bg-[#b3714f]"
            />
          </div>

          {/* ================= SEQUENTIAL INDEX RAIL ================= */}
          <nav
            data-sw="chrome"
            aria-label="Selected client websites"
            className="absolute bottom-0 left-[clamp(16px,5.1vw,88px)] right-[clamp(16px,5.1vw,88px)] z-20 flex h-[5.25rem] items-center opacity-0 md:h-[6.5rem]"
          >
            <ol
              className="grid w-full gap-3 sm:gap-5 md:gap-7"
              style={{ gridTemplateColumns: `repeat(${N}, minmax(0, 1fr))` }}
            >
              {PROJECTS.map((pr, i) => (
                <li key={pr.id}>
                  <button
                    type="button"
                    onClick={() => scrollToProgress(restPoint(i))}
                    aria-label={`Jump to ${pr.name}`}
                    className="group block w-full cursor-pointer py-2 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b66c43]"
                  >
                    <span
                      data-sw="seg-label"
                      className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.105em] opacity-45 md:text-[11px]"
                    >
                      <span
                        data-sw="seg-dot"
                        aria-hidden="true"
                        className="hidden h-[6px] w-[6px] shrink-0 rounded-full bg-[#b3714f] opacity-0 md:inline-block"
                      />
                      <span className="tabular-nums text-[#cba58a]">
                        {pad(i + 1)}
                      </span>
                      <span className="hidden truncate text-[#f1eee5] sm:inline">
                        {pr.short}
                      </span>
                    </span>
                    <span className="relative mt-2.5 block h-px w-full overflow-hidden bg-[#54584f] transition-colors group-hover:bg-[#757970]">
                      <span
                        data-sw="seg-fill"
                        className="absolute inset-0 origin-left bg-[#b3714f]"
                        style={{ transform: "scaleX(0)" }}
                      />
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>

          {/* ================= PAYOFF — ALL 4 LIVE + SKERP CTA ================= */}
          <div
            data-sw="outro"
            className="invisible absolute inset-0 z-20 flex flex-col justify-center"
          >
            <div
              data-sw="outro-glow"
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0"
              style={{
                background:
                  "radial-gradient(60% 48% at 50% 24%, rgba(168,107,78,0.22), transparent 72%)",
              }}
            />

            <div className="relative mx-auto w-full px-[clamp(16px,5.1vw,88px)]">
              {/* Self-drawing eagle crest + Skerp display payoff */}
              <div className="flex flex-col items-center text-center">
                <img
                  data-sw="crest-logo"
                  src="/images/skerp-logo-192.webp"
                  alt="Skerp Studio"
                  width={192}
                  height={192}
                  className="h-auto w-[72px] opacity-0 will-change-transform md:w-[96px] [@media(max-height:660px)]:hidden"
                />

                <div className="mt-3 overflow-hidden md:mt-4">
                  <p
                    data-sw="outro-head"
                    className="flex items-center justify-center gap-[10px] text-[10px] font-bold uppercase tracking-[0.105em] text-[#a8aaa0] md:text-[11px]"
                  >
                    <span
                      aria-hidden="true"
                      className="inline-block h-[7px] w-[7px] rounded-full bg-[#b3714f]"
                    />
                    {STUDIO.outroMarker}
                  </p>
                </div>

                <p className="mt-2.5 font-['Inter_Tight',sans-serif] text-[clamp(2.5rem,min(7.4vw,10.2svh),6.75rem)] font-extrabold uppercase leading-[0.88] tracking-[-0.068em] text-[#f2f0e9] md:mt-3">
                  <span className="block overflow-hidden pb-[0.05em]">
                    <span data-sw="outro-head" className="block">
                      {STUDIO.outroTop}
                    </span>
                  </span>
                  <span className="block overflow-hidden pb-[0.07em]">
                    <span data-sw="outro-head" className="block">
                      {STUDIO.outroBottomPrefix}
                      <em className="font-semibold italic tracking-[-0.075em] text-[#cba58a]">
                        {STUDIO.outroBottomAccent}
                      </em>
                    </span>
                  </span>
                </p>
              </div>

              {/* 4-project fan-out strip — every card opens the live site */}
              <ul
                data-sw="grid"
                className="mt-6 grid grid-cols-2 gap-3 md:mt-10 md:grid-cols-4 md:gap-5"
              >
                {PROJECTS.map((pr, i) => (
                  <li key={pr.id} className="min-w-0">
                    <a
                      data-sw="tile"
                      href={pr.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Visit ${pr.name} website`}
                      className="group/cta block opacity-0 will-change-transform focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b66c43]"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden border border-[#54584f] bg-[#181a16] transition-colors duration-300 group-hover/cta:border-[#cba58a]">
                        <div className="absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover/cta:scale-[1.04]">
                          <ProjectPlaceholder project={pr} />
                          <img
                            src={`/images/work/${pr.id}-top.webp`}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            onError={(e) => (e.currentTarget.style.display = "none")}
                            className="absolute inset-0 h-full w-full object-cover object-top"
                          />
                        </div>
                        <div
                          aria-hidden="true"
                          className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-[#141513]/80 to-transparent px-3 pb-2 pt-6 text-[9px] font-bold uppercase tracking-[0.105em] text-[#f2f0e9]"
                        >
                          <span className="text-[#cba58a]">{pad(i + 1)}</span>
                          <span className="opacity-0 transition-opacity duration-250 group-hover/cta:opacity-100">
                            VISIT ↗
                          </span>
                        </div>
                      </div>

                      <div
                        data-sw="tile-caption"
                        className="mt-2.5 flex items-baseline justify-between gap-2 opacity-0 md:mt-3"
                      >
                        <span className="truncate font-['Inter_Tight',sans-serif] text-[15px] font-bold leading-tight tracking-[-0.035em] text-[#f2f0e9] transition-colors group-hover/cta:text-[#efcfb6] md:text-[18px]">
                          {pr.name}
                        </span>
                        <SkerpArrow
                          diagonal
                          className="h-[14px] w-[14px] text-[#94978c] group-hover/cta:text-[#cba58a]"
                        />
                      </div>
                    </a>
                  </li>
                ))}
              </ul>

              {/* Closing editorial bar — motto + Karoo copper CTA + WhatsApp link */}
              <div className="mt-6 flex flex-col items-start justify-between gap-4 border-t border-[#54584f] pt-5 sm:flex-row sm:items-center md:mt-10 md:pt-6">
                <div className="overflow-hidden">
                  <div data-sw="outro-cta">
                    <p className="font-['Inter_Tight',sans-serif] text-[18px] font-semibold leading-tight tracking-[-0.03em] text-[#f2f0e9] md:text-[22px]">
                      {STUDIO.motto}
                    </p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.105em] text-[#94978c] md:text-[11px]">
                      {STUDIO.outroTagline}
                    </p>
                  </div>
                </div>

                <div className="overflow-hidden pt-1">
                  <div
                    data-sw="outro-cta"
                    className="flex flex-wrap items-center gap-5 md:gap-7"
                  >
                    <a
                      href={STUDIO.primaryCta.href}
                      className="group/cta inline-flex min-h-[48px] items-center justify-between gap-[26px] bg-[#a86b4e] px-5 text-[11px] font-bold uppercase tracking-[0.105em] text-[#f6f0e7] transition-[background-color,color,transform] duration-250 hover:-translate-y-[3px] hover:bg-[#f1e9dc] hover:text-[#252620] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b66c43] md:min-h-[52px]"
                    >
                      <span>{STUDIO.primaryCta.label}</span>
                      <SkerpArrow diagonal />
                    </a>
                    <a
                      href={STUDIO.whatsappCta.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/cta inline-flex items-center gap-[10px] border-b border-[#f1eee5]/70 py-[7px] text-[11px] font-bold uppercase tracking-[0.105em] text-[#f1eee5] transition-colors duration-250 hover:border-[#cba58a] hover:text-[#cba58a]"
                    >
                      <span>{STUDIO.whatsappCta.label}</span>
                      <SkerpArrow diagonal className="h-[15px] w-[15px]" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= INTRO SHUTTERS (#f2f0e9 PARCHMENT) =================
              Matches www.skerpstudio.com's warm parchment canvas & exact
              "SELECTED WORK" / "BUILT TO WORK." typography, then splits along
              a burnished-copper rule to reveal the #242620 dark stage inside. */}
          <div
            data-sw="shutter-top"
            className="absolute inset-x-0 top-0 z-30 flex h-1/2 flex-col justify-between border-b border-[#c4c0b6] bg-[#f2f0e9] px-[clamp(20px,5.1vw,88px)] pt-6 text-[#22231f] will-change-transform md:pt-8"
          >
            <div
              data-sw="intro-fade"
              className="flex items-center justify-between gap-4 text-[11px] font-bold uppercase tracking-[0.105em]"
            >
              <span className="inline-flex items-center gap-[10px]">
                <span
                  aria-hidden="true"
                  className="inline-block h-[7px] w-[7px] rounded-full bg-[#b3714f]"
                />
                {STUDIO.marker}
              </span>
              <span className="text-[#22231f]/50">{STUDIO.countLabel}</span>
            </div>

            <div
              data-sw="intro-word"
              aria-hidden="true"
              className="pb-[1.8svh] font-['Inter_Tight',sans-serif] text-[clamp(3.6rem,13.5vw,13.25rem)] font-extrabold uppercase leading-[0.82] tracking-[-0.068em] text-[#22231f]"
            >
              {STUDIO.introTop}
            </div>
          </div>

          <div
            data-sw="shutter-bottom"
            className="absolute inset-x-0 bottom-0 z-30 flex h-1/2 flex-col justify-between border-t border-[#c4c0b6] bg-[#f2f0e9] px-[clamp(20px,5.1vw,88px)] pb-6 text-[#22231f] will-change-transform md:pb-8"
          >
            <div
              data-sw="intro-word"
              aria-hidden="true"
              className="pt-[1.8svh] text-right font-['Inter_Tight',sans-serif] text-[clamp(3.6rem,13.5vw,13.25rem)] font-semibold uppercase italic leading-[0.82] tracking-[-0.075em] text-[#9c684d]"
            >
              {STUDIO.introBottom}
            </div>

            <div
              data-sw="intro-fade"
              className="flex items-end justify-between gap-6"
            >
              <p className="max-w-[32ch] text-[14px] leading-[1.5] text-[#5f6058] md:text-[17px]">
                {STUDIO.introSummary}
              </p>

              <div className="flex shrink-0 items-center gap-4 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.105em] text-[#22231f] md:text-[11px]">
                <span className="hidden text-[#77756d] normal-case tracking-[-0.01em] font-medium lg:inline">
                  {STUDIO.motto}
                </span>
                <span className="hidden text-[#c4c0b6] lg:inline">·</span>
                <span className="sm:hidden">SCROLL</span>
                <span className="hidden sm:inline">{STUDIO.scrollCue}</span>
                <span className="relative block h-9 w-px overflow-hidden bg-[#c4c0b6]">
                  <span
                    data-sw="cue-fill"
                    className="absolute inset-0 origin-top bg-[#9c684d]"
                    style={{ transform: "scaleY(0)" }}
                  />
                </span>
              </div>
            </div>
          </div>

          {/* Burnished Karoo-copper horizon seam between the shutters */}
          <div
            data-sw="seam"
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-1/2 z-40 h-[2px] -translate-y-1/2 bg-[#a86b4e]"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
      </div>
    </section>
  );
}
