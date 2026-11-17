import { useEffect, useMemo, useRef, useState } from "react";
import { CANVAS, FLOW_EDGES, FLOW_NODES, FLOW_PAYOFF, type FlowIconName, type FlowNode } from "@/data/automationFlow";
import { Arrow, ChapterLabel, SplitWords } from "@/components/ui";
import { openModal } from "@/components/ModalHost";
import { gsap, getLenis, ScrollTrigger, useGSAP } from "@/lib/smooth";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/* ---------------- Icons (n8n-ish, 24×24 strokes) ---------------- */
const ICONS: Record<FlowIconName, string> = {
  bolt: "M13 2 4 14h7l-1 8 9-12h-7l1-8Z",
  filter: "M3 5h18M6 12h12M10 19h4",
  database: "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3Zm0 0v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
  chat: "M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z",
  bell: "M6 16V11a6 6 0 1 1 12 0v5l2 2H4l2-2Zm4 4a2 2 0 0 0 4 0",
  clock: "M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  invoice: "M6 3h12v18l-3-2-3 2-3-2-3 2V3Zm3 5h6M9 12h6M9 16h3",
  chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
};

function FlowIcon({ name }: { name: FlowIconName }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-[46%] w-[46%]" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");
const half = CANVAS.node / 2;

/** Bezier between the output port of `a` and the input port of `b`. */
function edgePath(a: FlowNode, b: FlowNode) {
  const x1 = a.x + half;
  const x2 = b.x - half;
  const dx = Math.max(50, (x2 - x1) * 0.5);
  return `M ${x1} ${a.y} C ${x1 + dx} ${a.y}, ${x2 - dx} ${b.y}, ${x2} ${b.y}`;
}

/* ---------------- Camera maths (screen-space) ---------------- */
const isSmall = () => window.innerWidth < 768;

function focusCamera(node: FlowNode) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const s = isSmall() ? Math.min(0.9, vw / 480) : gsap.utils.clamp(0.8, 1.2, vw / 1350);
  const fx = isSmall() ? vw * 0.5 : vw * 0.33;
  const fy = isSmall() ? vh * 0.3 : vh * 0.5;
  return { x: fx - node.x * s, y: fy - node.y * s, scale: s };
}

function overviewCamera() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const xs = FLOW_NODES.map((n) => n.x);
  const ys = FLOW_NODES.map((n) => n.y);
  const minX = Math.min(...xs) - 150;
  const maxX = Math.max(...xs) + 150;
  const minY = Math.min(...ys) - 170;
  const maxY = Math.max(...ys) + 170;
  const s = Math.min((vw * 0.9) / (maxX - minX), (vh * (isSmall() ? 0.4 : 0.52)) / (maxY - minY), 1);
  const fy = isSmall() ? vh * 0.36 : vh * 0.44;
  return { x: vw / 2 - ((minX + maxX) / 2) * s, y: fy - ((minY + maxY) / 2) * s, scale: s };
}

/** Explore view: flow sits higher so the info box has empty space underneath. */
function exploreCamera() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const xs = FLOW_NODES.map((n) => n.x);
  const ys = FLOW_NODES.map((n) => n.y);
  const minX = Math.min(...xs) - 150;
  const maxX = Math.max(...xs) + 150;
  const minY = Math.min(...ys) - 170;
  const maxY = Math.max(...ys) + 170;
  // Desktop: flow on the left, info panel bottom-right. Phone: flow on top, panel below.
  const wide = vw >= 768;
  const s = Math.min((vw * (wide ? 0.56 : 0.92)) / (maxX - minX), (vh * (wide ? 0.5 : 0.3)) / (maxY - minY), 1);
  const fx = wide ? vw * 0.34 : vw / 2;
  const fy = vh * (wide ? 0.44 : 0.3);
  return { x: fx - ((minX + maxX) / 2) * s, y: fy - ((minY + maxY) / 2) * s, scale: s };
}

/* ------------------------------------------------------------------
 * Magnetic dot field. A grid of dots that leans toward the pointer
 * (never sticks) and springs back when it leaves, with a soft light
 * following the cursor. Screen-space, so it stays put while the camera moves.
 * ------------------------------------------------------------------ */
function DotField() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const GAP = 26;
    const RADIUS = 170;
    const PULL = 0.42;
    let dpr = 1;
    let w = 0;
    let h = 0;
    let dots: { x: number; y: number; ox: number; oy: number }[] = [];
    let px = -9999;
    let py = -9999;
    let lx = -9999;
    let ly = -9999;
    let light = 0;
    let inside = false;
    let raf = 0;

    const build = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      dots = [];
      for (let y = GAP / 2; y < h; y += GAP) for (let x = GAP / 2; x < w; x += GAP) dots.push({ x, y, ox: 0, oy: 0 });
      draw();
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      if (light > 0.01) {
        const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, RADIUS * 1.6);
        g.addColorStop(0, `rgba(192,122,82,${0.16 * light})`);
        g.addColorStop(1, "rgba(192,122,82,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
      for (const d of dots) {
        const dx = lx - d.x;
        const dy = ly - d.y;
        const dist = Math.hypot(dx, dy);
        const near = light * Math.max(0, 1 - dist / RADIUS);
        const a = 0.13 + near * 0.75;
        const r = 1 + near * 1.3;
        ctx.fillStyle = near > 0.05 ? `rgba(239,207,182,${a})` : `rgba(242,240,233,${a})`;
        ctx.beginPath();
        ctx.arc(d.x + d.ox, d.y + d.oy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = () => {
      raf = 0;
      lx += (px - lx) * 0.18;
      ly += (py - ly) * 0.18;
      light += ((inside ? 1 : 0) - light) * 0.08;
      let moving = Math.abs(px - lx) > 0.3 || Math.abs(py - ly) > 0.3 || Math.abs((inside ? 1 : 0) - light) > 0.005;
      for (const d of dots) {
        const dx = lx - d.x;
        const dy = ly - d.y;
        const dist = Math.hypot(dx, dy);
        const f = inside && dist < RADIUS ? (1 - dist / RADIUS) ** 2 * PULL : 0;
        const tx = dx * f;
        const ty = dy * f;
        d.ox += (tx - d.ox) * 0.16;
        d.oy += (ty - d.oy) * 0.16;
        if (Math.abs(tx - d.ox) > 0.05 || Math.abs(ty - d.oy) > 0.05) moving = true;
      }
      draw();
      if (moving) raf = requestAnimationFrame(step);
    };
    const kick = () => {
      if (!raf && !reduce) raf = requestAnimationFrame(step);
    };

    const host = canvas.parentElement!;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      const r = canvas.getBoundingClientRect();
      px = e.clientX - r.left;
      py = e.clientY - r.top;
      if (!inside) {
        lx = px;
        ly = py;
      }
      inside = true;
      kick();
    };
    const onLeave = () => {
      inside = false;
      kick();
    };

    build();
    const ro = new ResizeObserver(build);
    ro.observe(canvas);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    return () => {
      ro.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);
  return <canvas ref={ref} aria-hidden="true" className="dot-field pointer-events-none absolute inset-0 h-full w-full" />;
}

export function Automation() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const nodeById = useMemo(() => Object.fromEntries(FLOW_NODES.map((n) => [n.id, n])), []);
  const n = FLOW_NODES.length;
  const [playing, setPlaying] = useState(false);
  const [exploring, setExploring] = useState(false);
  const [hover, setHover] = useState<{ i: number; x: number } | null>(null);
  const exploringRef = useRef(false);
  const marks = useRef({ firstNode: 0, explore: 1 }); // fractions of the pinned scroll
  const runId = useRef(0);

  /** Stops an auto-play exactly where it is. */
  const cancelWorkflow = () => {
    runId.current++;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(window.scrollY, { immediate: true, force: true });
    else window.scrollTo({ top: window.scrollY });
    setPlaying(false);
  };

  /** Plays the workflow by scrolling for the visitor: from wherever they are, or from node 1 again. */
  const playWorkflow = (restart = false) => {
    if (reduced) return;
    if (playing) return cancelWorkflow();
    const id = ++runId.current;
    const pin = root.current?.querySelector(".auto-pin");
    const st = pin ? ScrollTrigger.getAll().find((t) => t.trigger === pin) : undefined;
    if (!st) return;
    const span = st.end - st.start;
    const end = st.start + span * marks.current.explore + 2;
    const nodeStart = st.start + span * marks.current.firstNode;
    const lenis = getLenis();
    setPlaying(true);
    setHover(null);
    const run = (from: number) => {
      const duration = gsap.utils.clamp(3, 22, ((end - from) / span) * 24);
      if (id !== runId.current) return;
      const done = () => id === runId.current && setPlaying(false);
      if (lenis) lenis.scrollTo(end, { duration, force: true, easing: (t: number) => t, onComplete: done });
      else {
        window.scrollTo({ top: end, behavior: "smooth" });
        window.setTimeout(done, 1200);
      }
    };
    const now = window.scrollY;
    if (restart || now < nodeStart - 2 || now >= end - 4) {
      if (lenis) lenis.scrollTo(nodeStart, { duration: 1.1, force: true, onComplete: () => run(nodeStart) });
      else {
        window.scrollTo({ top: nodeStart });
        run(nodeStart);
      }
    } else run(now);
  };

  useGSAP(
    () => {
      if (reduced) return;
      const q = gsap.utils.selector(root);
      const cam = q(".flow-canvas")[0];

      /* Start state (JS-only so reduced-motion users never see hidden content). */
      gsap.set(cam, { transformOrigin: "0 0", ...overviewCamera() });
      gsap.set(q(".edge-draw, .edge-ok"), { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set(q(".edge-flow"), { opacity: 0 });
      gsap.set(q(".node-body"), { opacity: 0.14, scale: 0.88 });
      gsap.set(q(".node-label"), { opacity: 0 });
      gsap.set(q(".ok-ring, .ok-badge"), { opacity: 0 });
      gsap.set(q(".ok-badge"), { scale: 0.4 });
      gsap.set(q(".caption"), { opacity: 0, y: 26 });
      gsap.set(q(".payoff .sw > span"), { yPercent: 115 });
      gsap.set(q(".payoff-line, .toast-ok"), { opacity: 0, y: 16 });

      /* ---------- ScrollTrigger: the signature pinned flow ----------
       * Pinned for (nodes × 0.8 + 3.4) viewports and scrubbed:
       *  intro → camera dives to node 1 → for each node: pan, draw
       *  incoming edges, pop node, show caption → zoom out → green
       *  execution pass in order → "AUTOMATED." payoff. */
      const STEP = 1;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: q(".auto-pin")[0],
          start: "top top",
          end: () => `+=${(n * 0.8 + 4.8) * window.innerHeight}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true, // camera values are functions → recomputed on resize
          onUpdate: (self) => {
            const on = self.progress >= marks.current.explore - 0.01;
            if (on !== exploringRef.current) {
              exploringRef.current = on;
              setExploring(on);
              if (!on) setHover(null);
            }
          },
        },
      });

      tl.to(q(".auto-intro"), { opacity: 0, y: -60, filter: "blur(8px)", duration: 0.5 }, 0.15).to(q(".ghost-edges"), { opacity: 0.5, duration: 0.5 }, 0.2);

      FLOW_NODES.forEach((node, i) => {
        const t = 1.2 + i * STEP;
        // Camera pan/zoom to this node (function values = responsive).
        tl.to(
          cam,
          {
            x: () => focusCamera(node).x,
            y: () => focusCamera(node).y,
            scale: () => focusCamera(node).scale,
            duration: i === 0 ? 0.9 : 0.55,
            ease: "power2.inOut",
          },
          i === 0 ? 0.35 : t - 0.4,
        );
        // Incoming connection lines draw in.
        const incoming = FLOW_EDGES.map((e, ei) => ({ e, ei })).filter(({ e }) => e.to === node.id);
        incoming.forEach(({ ei }) => tl.to(q(`.edge-draw-${ei}`), { strokeDashoffset: 0, duration: 0.35, ease: "power1.inOut" }, t - 0.1));
        // Node pops in.
        tl.to(q(`.node-${i} .node-body`), { opacity: 1, scale: 1, duration: 0.25, ease: "back.out(2)" }, t + 0.2)
          .to(q(`.node-${i} .node-label`), { opacity: 1, duration: 0.2 }, t + 0.25)
          // Caption: what it is + why it connects.
          .to(q(`.caption-${i}`), { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" }, t + 0.3)
          .fromTo(q(`.step-${i}`), { scaleX: 0 }, { scaleX: 1, duration: 0.8 }, t)
          .to(q(`.caption-${i}`), { opacity: 0, y: -18, duration: 0.15, ease: "power2.in" }, t + 0.82);
      });

      const tEnd = 1.2 + n * STEP;
      tl.to(cam, { x: () => overviewCamera().x, y: () => overviewCamera().y, scale: () => overviewCamera().scale, duration: 0.8, ease: "power2.inOut" }, tEnd - 0.2)
        .to(q(".auto-steps"), { opacity: 0, duration: 0.3 }, tEnd);

      // Green execution pass, in flow order.
      const tExec = tEnd + 0.7;
      FLOW_NODES.forEach((node, i) => {
        const at = tExec + i * 0.14;
        FLOW_EDGES.forEach((e, ei) => e.to === node.id && tl.to(q(`.edge-ok-${ei}`), { strokeDashoffset: 0, duration: 0.14 }, at - 0.1));
        tl.to(q(`.node-${i} .ok-ring`), { opacity: 1, duration: 0.1 }, at)
          .to(q(`.node-${i} .ok-badge`), { opacity: 1, scale: 1, duration: 0.12, ease: "back.out(3)" }, at)
          .to(q(`.node-${i} .node-icon`), { color: "#3ddc84", duration: 0.1 }, at);
      });
      const tDone = tExec + n * 0.14 + 0.1;
      tl.to(q(".edge-flow"), { opacity: 1, duration: 0.2 }, tDone)
        .to(q(".exec-idle"), { opacity: 0, y: -10, duration: 0.15 }, tDone)
        .to(q(".toast-ok"), { opacity: 1, y: 0, duration: 0.2 }, tDone + 0.05)
        .to(q(".flow-stage"), { opacity: 0.32, filter: "blur(1.5px)", duration: 0.4 }, tDone + 0.25)
        .to(q(".payoff .sw > span"), { yPercent: 0, duration: 0.5, stagger: 0.05, ease: "expo.out" }, tDone + 0.3)
        .to(q(".payoff-line"), { opacity: 1, y: 0, duration: 0.3 }, tDone + 0.6);

      // Explore: "AUTOMATED." clears, the finished workflow stays on screen to hover and read.
      const tExplore = tDone + 1.6;
      tl.to(q(".payoff"), { y: () => -window.innerHeight * 0.6, scale: 1.25, opacity: 0, filter: "blur(12px)", duration: 0.45, ease: "power2.in" }, tExplore)
        .to(q(".toast-ok"), { opacity: 0, duration: 0.2 }, tExplore)
        .to(q(".flow-stage"), { opacity: 1, filter: "blur(0px)", duration: 0.4 }, tExplore)
        .to(cam, { x: () => exploreCamera().x, y: () => exploreCamera().y, scale: () => exploreCamera().scale, duration: 0.5, ease: "power2.inOut" }, tExplore)
        .fromTo(q(".explore-ui"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.3 }, tExplore + 0.3)
        .fromTo(q(".explore-panel"), { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.35, ease: "power2.out" }, tExplore + 0.25);
      const tEnd2 = tExplore + 0.65;
      tl.to({}, { duration: 0.9 }, tEnd2);
      marks.current = { firstNode: 1.1 / tl.duration(), explore: tEnd2 / tl.duration() };
    },
    { scope: root, dependencies: [reduced], revertOnUpdate: true },
  );

  if (reduced) {
    return (
      <section id="automation" data-bg="#0b0b0a" aria-labelledby="automation-title" className="pad-x py-28">
        <ChapterLabel index="04" label="AUTOMATION" />
        <h2 id="automation-title" className="display mt-10 text-[clamp(48px,7vw,110px)]">
          From leak <em>to flow.</em>
        </h2>
        <ol className="mt-14 grid gap-4 md:grid-cols-2">
          {FLOW_NODES.map((node, i) => (
            <li key={node.id} className="flex gap-5 border border-line p-6">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-2 border-ok text-ok">
                <FlowIcon name={node.icon} />
              </span>
              <div>
                <span className="micro text-dim">
                  {pad(i + 1)} · {node.kind}
                </span>
                <h3 className="mt-1 text-xl font-semibold">{node.title}</h3>
                <p className="mt-2 text-sm text-cream/80">{node.what}</p>
                <p className="mt-1 text-sm text-muted">{node.why}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="display mt-16 text-[clamp(64px,12vw,200px)] text-ok">{FLOW_PAYOFF.word}</p>
        <p className="lede mt-4">{FLOW_PAYOFF.line}</p>
      </section>
    );
  }

  return (
    <section id="automation" ref={root} data-bg="#0e0d0b" aria-labelledby="automation-title" className="relative">
      <div className="auto-pin relative h-svh w-full overflow-hidden">
        <DotField />
        {/* vignette */}
        <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_40%,#0b0b0a_100%)]" />

        {/* Canvas (camera target) */}
        <div className="flow-stage absolute inset-0">
          <div className="flow-canvas absolute left-0 top-0 will-change-transform" style={{ width: CANVAS.width, height: CANVAS.height }}>
            <svg className="absolute inset-0 overflow-visible" width={CANVAS.width} height={CANVAS.height} aria-hidden="true">
              <g className="ghost-edges" opacity="0.25">
                {FLOW_EDGES.map((e, ei) => (
                  <path key={`g${ei}`} d={edgePath(nodeById[e.from], nodeById[e.to])} fill="none" stroke="#f2f0e9" strokeOpacity="0.2" strokeWidth="2" strokeDasharray="5 9" />
                ))}
              </g>
              {FLOW_EDGES.map((e, ei) => {
                const d = edgePath(nodeById[e.from], nodeById[e.to]);
                return (
                  <g key={ei}>
                    <path className={`edge-draw edge-draw-${ei}`} d={d} pathLength={1} fill="none" stroke="#c07a52" strokeWidth="3" strokeLinecap="round" />
                    <path className={`edge-ok edge-ok-${ei}`} d={d} pathLength={1} fill="none" stroke="#3ddc84" strokeWidth="3.5" strokeLinecap="round" />
                    <path className="edge-flow flow-flowing" d={d} pathLength={1} fill="none" stroke="#d9ffe9" strokeWidth="3.5" strokeLinecap="round" />
                  </g>
                );
              })}
            </svg>

            {FLOW_NODES.map((node, i) => (
              <div
                key={node.id}
                className={`node-${i} absolute ${exploring ? "cursor-help" : ""}`}
                style={{ left: node.x - half, top: node.y - half, width: CANVAS.node, height: CANVAS.node }}
                tabIndex={exploring ? 0 : -1}
                aria-label={exploring ? `${node.title}: ${node.what}` : undefined}
                onPointerEnter={(e) => {
                  if (!exploringRef.current) return;
                  const r = e.currentTarget.getBoundingClientRect();
                  setHover({ i, x: r.left + r.width / 2 });
                }}
                onPointerLeave={() => setHover((h) => (h?.i === i ? null : h))}
                onFocus={(e) => {
                  if (!exploringRef.current) return;
                  const r = e.currentTarget.getBoundingClientRect();
                  setHover({ i, x: r.left + r.width / 2 });
                }}
                onBlur={() => setHover((h) => (h?.i === i ? null : h))}
              >
                <div className="node-label absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="mono text-[13px] tracking-wider text-copper">{node.kind}</span>
                </div>
                <div className="node-body flow-node h-full w-full">
                  <span className="port -left-[8px]" />
                  <span className="port -right-[8px]" />
                  <span className="node-icon grid h-full w-full place-items-center text-cream">
                    <FlowIcon name={node.icon} />
                  </span>
                  <span className="ok-ring" />
                  <span className="ok-badge absolute -right-3 -top-3 grid h-9 w-9 place-items-center rounded-full bg-ok text-ink shadow-[0_0_20px_#3ddc8466]">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m5 12 5 5 9-10" />
                    </svg>
                  </span>
                </div>
                <div className="node-label absolute left-1/2 top-[calc(100%+16px)] -translate-x-1/2 whitespace-nowrap text-center">
                  <span className="font-display text-[22px] font-semibold tracking-tight text-cream">{node.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* HUD */}
        <div className="pad-x absolute inset-x-0 top-24 z-10 flex items-center justify-between">
          <ChapterLabel index="04" label="AUTOMATION" />
          <span className="mono hidden items-center gap-2 rounded-full border border-line bg-ink/70 px-3 py-1.5 text-[11px] text-muted sm:flex">
            <span className="h-2 w-2 rounded-full bg-ok" /> lead-to-booking.workflow · active
          </span>
        </div>

        {/* Intro */}
        <div className="auto-intro pointer-events-none pad-x absolute inset-0 z-10 flex flex-col items-center justify-center text-center">
          <h2 id="automation-title" className="display text-[clamp(48px,8vw,140px)]">
            From leak <em>to flow.</em>
          </h2>
          <p className="lede mt-6 max-w-xl">This is what we build behind the scenes. Scroll to watch one enquiry move through a Skerp automation — node by node.</p>
        </div>

        {/* Captions (screen-space, next to the focused node) */}
        <div className="pointer-events-none absolute inset-0 z-10">
          {FLOW_NODES.map((node, i) => (
            <div
              key={node.id}
              className={`caption caption-${i} absolute left-5 right-5 top-[calc(30vh+96px)] md:left-[calc(33vw+130px)] md:right-auto md:top-1/2 md:w-[min(440px,40vw)] md:-translate-y-1/2`}
            >
              <div className="relative border border-line-strong bg-ink/85 p-5 backdrop-blur-md md:p-7">
                <span className="absolute -left-[72px] top-1/2 hidden h-px w-[70px] bg-gradient-to-r from-transparent to-copper md:block" />
                <div className="micro flex items-center justify-between text-dim">
                  <span className="text-copper">{node.kind}</span>
                  <span>
                    NODE {pad(i + 1)} / {pad(n)}
                  </span>
                </div>
                <h3 className="display mt-3 text-3xl normal-case md:text-4xl">{node.title}</h3>
                <dl className="mt-4 space-y-3 text-sm leading-relaxed">
                  <div>
                    <dt className="micro text-[10px] text-dim">WHAT IT IS</dt>
                    <dd className="mt-1 text-cream/90">{node.what}</dd>
                  </div>
                  <div>
                    <dt className="micro text-[10px] text-dim">WHY IT CONNECTS</dt>
                    <dd className="mt-1 text-muted">{node.why}</dd>
                  </div>
                </dl>
              </div>
            </div>
          ))}
        </div>

        {/* Explore panel (bottom right): what the whole workflow does; hovering a node swaps in that node's detail */}
        <aside
          aria-live="polite"
          className={`explore-panel absolute bottom-[104px] left-5 right-5 z-30 border border-line-strong bg-ink/90 p-5 opacity-0 backdrop-blur-md md:bottom-[112px] md:left-auto md:right-[clamp(20px,5vw,88px)] md:w-[420px] md:p-6 ${exploring ? "" : "pointer-events-none"}`}
        >
          {hover ? (
            <>
              <div className="micro flex items-center justify-between text-dim">
                <span className="text-copper">{FLOW_NODES[hover.i].kind}</span>
                <span>
                  NODE {pad(hover.i + 1)} / {pad(n)}
                </span>
              </div>
              <h3 className="display mt-2 text-2xl normal-case md:text-3xl">{FLOW_NODES[hover.i].title}</h3>
              <dl className="mt-3 space-y-2 text-sm leading-relaxed">
                <div>
                  <dt className="micro text-[10px] text-dim">WHAT IT IS</dt>
                  <dd className="mt-1 text-cream/90">{FLOW_NODES[hover.i].what}</dd>
                </div>
                <div>
                  <dt className="micro text-[10px] text-dim">WHY IT CONNECTS</dt>
                  <dd className="mt-1 text-muted">{FLOW_NODES[hover.i].why}</dd>
                </div>
              </dl>
            </>
          ) : (
            <>
              <div className="micro flex items-center justify-between text-dim">
                <span className="flex items-center gap-2 text-ok">
                  <span className="h-2 w-2 rounded-full bg-ok" /> LIVE WORKFLOW
                </span>
                <span>{pad(n)} STEPS · 24/7</span>
              </div>
              <h3 className="display mt-2 text-2xl normal-case md:text-3xl">What this automation does</h3>
              <p className="mt-3 text-sm leading-relaxed text-cream/85">
                Every enquiry is captured, tidied and saved, answered in seconds, passed to the right person, followed up if it goes quiet, and turned into a
                booking or EFT invoice. On Monday you get one summary of what came in and what converted.
              </p>
              <ul className="mt-3 hidden space-y-1 text-sm text-muted md:block">
                <li>· Connects your website forms, WhatsApp, email, customer list, calendar and invoicing</li>
                <li>· Usually built in Skerp Flow or Skerp Business</li>
                <li>· Hover any step to see what it does</li>
              </ul>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
                <button type="button" className="btn btn-copper !min-h-[42px] !px-4" onClick={() => openModal({ kind: "time" })}>
                  HOW MUCH TIME IT SAVES <Arrow diagonal />
                </button>
                <button type="button" className="link-u" onClick={() => openModal({ kind: "estimate", pkg: "Flow" })}>
                  GET QUOTE <Arrow diagonal />
                </button>
              </div>
            </>
          )}
        </aside>

        {/* Payoff */}
        <div className="payoff pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-center">
          <p className="display text-[clamp(64px,15vw,260px)] text-ok drop-shadow-[0_0_60px_#3ddc8433]">
            <SplitWords text={FLOW_PAYOFF.word} />
          </p>
          <p className="payoff-line lede mt-4 max-w-lg text-cream/80">{FLOW_PAYOFF.line}</p>
        </div>

        {/* Bottom HUD: step progress + n8n-style execute pill */}
        <div className="pad-x absolute inset-x-0 bottom-7 z-20 flex flex-col items-center gap-5">
          <div className="auto-steps grid w-full max-w-3xl gap-1.5" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
            {FLOW_NODES.map((node, i) => (
              <div key={node.id} className="h-[2px] overflow-hidden bg-line">
                <div className={`step-${i} h-full origin-left scale-x-0 bg-copper`} />
              </div>
            ))}
          </div>
          <div className="relative flex h-14 items-center justify-center">
            <button
              type="button"
              onClick={() => playWorkflow(false)}
              aria-label={playing ? "Cancel the running workflow" : "Execute workflow"}
              className="exec-idle exec-pill mono group flex h-14 min-w-[250px] cursor-pointer items-center justify-center gap-3 rounded-full border border-line-strong bg-ink/85 px-7 text-[13px] text-cream/85 backdrop-blur"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-copper/15 text-copper transition-colors group-hover:bg-copper group-hover:text-ink">{playing ? "■" : "▶"}</span>
              {playing ? "Executing… click to cancel" : "Execute workflow"}
            </button>
            <span className="toast-ok pointer-events-none mono absolute left-1/2 top-1/2 flex h-12 -translate-x-1/2 -translate-y-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-ok/50 bg-[#0f2418] px-5 text-[13px] text-ok">
              ✓ Workflow executed successfully
            </span>
            <div className={`explore-ui absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-5 opacity-0 ${exploring ? "" : "pointer-events-none"}`}>
              
              <button
                type="button"
                onClick={() => playWorkflow(true)}
                aria-label={playing ? "Cancel the running workflow" : "Run the workflow again"}
                className="exec-pill mono group flex h-14 min-w-[220px] cursor-pointer items-center justify-center gap-3 rounded-full border border-ok/50 bg-[#0f2418]/90 px-7 text-[13px] text-ok backdrop-blur"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-ok/15 transition-colors group-hover:bg-ok group-hover:text-ink">{playing ? "■" : "↻"}</span>
                {playing ? "Cancel" : "Run it again"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
