/* ------------------------------------------------------------------
 * Smooth scrolling core: Lenis drives the native scroll position and
 * GSAP's ticker drives Lenis, so ScrollTrigger and Lenis stay in sync
 * on the exact same frame (no jitter on pinned sections).
 * ------------------------------------------------------------------ */
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);
ScrollTrigger.config({ ignoreMobileResize: true });

let lenis: Lenis | null = null;
let tickerFn: ((time: number) => void) | null = null;
const HEADER_OFFSET = 0;

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function initSmoothScroll() {
  if (lenis || prefersReducedMotion()) return () => {};

  lenis = new Lenis({
    duration: 1.15,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.4,
    autoRaf: false,
  });

  // Every Lenis scroll tick → tell ScrollTrigger to re-evaluate.
  lenis.on("scroll", ScrollTrigger.update);

  // GSAP's ticker → Lenis (time is in seconds, Lenis wants ms).
  tickerFn = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(tickerFn);
  gsap.ticker.lagSmoothing(0);

  return () => {
    if (tickerFn) gsap.ticker.remove(tickerFn);
    lenis?.destroy();
    lenis = null;
    tickerFn = null;
  };
}

export const getLenis = () => lenis;

export function scrollToTarget(target: string | HTMLElement | number, opts: { immediate?: boolean; offset?: number } = {}) {
  const el = typeof target === "string" ? (document.querySelector(target) as HTMLElement | null) : target;
  if (el === null) return;
  const offset = opts.offset ?? HEADER_OFFSET;
  if (lenis) {
    lenis.scrollTo(el as HTMLElement | number, {
      offset,
      immediate: opts.immediate,
      duration: opts.immediate ? 0 : 1.6,
      force: true,
    });
    return;
  }
  const top = typeof el === "number" ? el : el.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top, behavior: opts.immediate || prefersReducedMotion() ? "auto" : "smooth" });
}

/* Used by modals: freeze page scroll while an overlay is open. */
let lockCount = 0;
export function lockScroll(lock: boolean) {
  lockCount = Math.max(0, lockCount + (lock ? 1 : -1));
  const locked = lockCount > 0;
  if (lenis) {
    if (locked) lenis.stop();
    else lenis.start();
  }
  document.documentElement.style.overflow = locked ? "hidden" : "";
}

/* ------------------------------------------------------------------
 * Hash actions: some hashes (e.g. #estimate) open overlays instead of
 * scrolling. Components register handlers here.
 * ------------------------------------------------------------------ */
const hashActions = new Map<string, () => void>();
export function registerHashAction(hash: string, fn: () => void) {
  hashActions.set(hash, fn);
  return () => {
    if (hashActions.get(hash) === fn) hashActions.delete(hash);
  };
}

export function navigateHash(hash: string, immediate = false): boolean {
  const id = hash.replace(/^#/, "");
  if (!id) return false;
  const action = hashActions.get(id);
  if (action) {
    action();
    return true;
  }
  if (id === "top") {
    scrollToTarget(0, { immediate });
    return true;
  }
  const el = document.getElementById(id);
  if (!el) return false;
  scrollToTarget(el, { immediate });
  return true;
}

/** Intercepts in-page anchor clicks (#id and /#id on the landing page) and routes them through Lenis. */
export function interceptAnchors() {
  const onClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as HTMLElement | null)?.closest("a");
    if (!a) return;
    const href = a.getAttribute("href") || "";
    let hash = "";
    if (href.startsWith("#")) hash = href;
    else if (href.startsWith("/#") && window.location.pathname === "/") hash = href.slice(1);
    if (!hash || hash === "#") return;
    if (navigateHash(hash)) {
      e.preventDefault();
      history.replaceState(null, "", hash === "#top" ? window.location.pathname : hash);
    }
  };
  document.addEventListener("click", onClick);
  return () => document.removeEventListener("click", onClick);
}

export { gsap, ScrollTrigger, useGSAP };
