import { useRef } from "react";
import { JOURNEY, TAGLINE } from "@/data/site";
import eagleEye from "@/assets/eagle-eye-close.jpg";
import { DEEP_AUDIT_MESSAGE, LEAK_SCAN_MESSAGE, VIDEO_CALL_MESSAGE, WHATSAPP_DISPLAY, openContact, whatsappHref } from "@/lib/contact";
import { deepAuditLabel } from "@/lib/pricing";
import { Arrow, SplitWords } from "@/components/ui";
import { gsap, useGSAP } from "@/lib/smooth";

/** Landing-page close: copper climax + project journey. Scan / contact live on /start. */
export function FinalCta() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        /* ScrollTrigger: the closing headline settles from oversized + loose
           tracking into place as the copper chapter scrolls in (scrubbed). */
        gsap.fromTo(
          ".cta-word",
          { scale: 1.35, letterSpacing: "0.04em", opacity: 0.15, filter: "blur(6px)" },
          {
            scale: 1,
            letterSpacing: "-0.065em",
            opacity: 1,
            filter: "blur(0px)",
            ease: "none",
            stagger: 0.12,
            scrollTrigger: { trigger: ".cta-hero", start: "top 85%", end: "top 15%", scrub: 1 },
          },
        );
        /* ScrollTrigger: journey steps light up one after another (scrubbed). */
        const steps = gsap.utils.toArray<HTMLElement>(".journey-step");
        const jt = gsap.timeline({ scrollTrigger: { trigger: ".journey", start: "top 85%", end: "bottom 45%", scrub: 0.6 } });
        steps.forEach((s, i) => {
          jt.fromTo(s, { opacity: 0.25, y: 18 }, { opacity: 1, y: 0, duration: 0.5 }, i * 0.4).fromTo(
            s.querySelector(".journey-fill"),
            { scaleX: 0 },
            { scaleX: 1, duration: 0.5 },
            i * 0.4,
          );
        });
        gsap.utils.toArray<HTMLElement>(".fc-reveal .sw > span").length &&
          gsap.from(".fc-reveal .sw > span", { yPercent: 115, duration: 1.2, stagger: 0.06, ease: "expo.out", scrollTrigger: { trigger: ".fc-reveal", start: "top 80%" } });
        gsap.utils.toArray<HTMLElement>(".fc-fade").forEach((el) =>
          gsap.from(el, { opacity: 0, y: 40, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%" } }),
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="contact" ref={root} aria-labelledby="cta-title" className="relative">
      {/* -------- Copper climax -------- */}
      <div className="cta-hero pad-x relative overflow-hidden pb-24 pt-36 md:pt-48" data-bg="#a86b4e">
        <div className="micro flex items-center justify-between text-cream/80">
          <span>07 — YOUR NEXT MOVE</span>
          <span className="italic">{TAGLINE}</span>
        </div>
        <h2 id="cta-title" className="display mt-14 text-[clamp(72px,14vw,240px)] text-cream [&_em]:!text-peach">
          <span className="cta-word inline-block origin-left">READY TO</span>
          <br />
          <span className="cta-word inline-block origin-left">
            GET <em>SKERP?</em>
          </span>
        </h2>

        <ol className="journey mt-16 flex gap-0 overflow-x-auto pb-2" aria-label="How a project runs">
          {JOURNEY.map((step, i) => (
            <li key={step} className="journey-step relative min-w-[132px] flex-1 border-y border-l border-cream/40 px-4 py-4 last:border-r">
              <span className="mono block text-[11px] text-cream/70">{String(i + 1).padStart(2, "0")}</span>
              <strong className="mt-1 block text-sm leading-tight md:text-base">{step}</strong>
              <span className="journey-fill absolute inset-x-0 bottom-0 h-[3px] origin-left bg-cream" />
              {i < JOURNEY.length - 1 ? (
                <span aria-hidden="true" className="absolute -right-[10px] top-1/2 z-10 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-full bg-[#7d4f37] text-[11px]">
                  →
                </span>
              ) : null}
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-wrap items-center gap-8">
          <a href="/start" className="btn btn-primary">
            FREE LEAK SCAN <Arrow diagonal />
          </a>
          <button type="button" className="link-u text-cream" onClick={() => openContact({ service: "30-minute video call", message: VIDEO_CALL_MESSAGE })}>
            BOOK A VIDEO CALL <Arrow diagonal />
          </button>
          <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="link-u text-cream">
            WHATSAPP {WHATSAPP_DISPLAY} <Arrow diagonal />
          </a>
          <a href="/about" className="link-u text-cream">
            ABOUT SKERP <Arrow diagonal />
          </a>
        </div>
      </div>

    </section>
  );
}

/** Free Leak Scan, Deep Audit, video call and contact options (used on /start). Every form opens as a popup. */
export function StartOptions() {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".fc-reveal .sw > span", { yPercent: 115, duration: 1.2, stagger: 0.06, ease: "expo.out", delay: 0.1 });
        gsap.utils.toArray<HTMLElement>(".fc-fade").forEach((el) =>
          gsap.from(el, { opacity: 0, y: 40, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 92%" } }),
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );
  return (
    <div ref={root}>
      {/* -------- Free Leak Scan -------- */}
      <div id="scan" className="pad-x relative pb-10 pt-16" data-bg="#0b0b0a" aria-labelledby="scan-title">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] overflow-hidden lg:block">
          <img
            src={eagleEye}
            alt=""
            className="absolute right-0 top-1/2 h-[140%] w-auto -translate-y-1/2 object-cover opacity-40 mix-blend-lighten"
            style={{ objectPosition: "60% 30%" }}
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-ink/60 to-ink" />
        </div>
        <div className="relative z-10">
          <div className="micro flex items-center gap-3 text-muted">
            <span className="dot" /> FREE LEAK SCAN
          </div>
          <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <h2 id="scan-title" className="fc-reveal display text-[clamp(52px,8vw,132px)]">
              <SplitWords text="First look." />
              <br />
              <em>
                <SplitWords text="No locked price." />
              </em>
            </h2>
            <p className="lede fc-fade">
              Start with a free Leak Scan and free 30-minute video call. If you decide to proceed with a Business or Custom build, the {deepAuditLabel()} Deep Audit
              confirms scope and is credited toward the build within 30 days.
            </p>
          </div>

        <div className="mt-16 grid gap-4 lg:grid-cols-3">
          <article className="fc-fade flex flex-col border border-copper/60 bg-[linear-gradient(160deg,#21160f,#121210_70%)] p-7">
            <span className="micro text-copper">FREE</span>
            <h3 className="display mt-4 text-5xl normal-case">Leak Scan</h3>
            <p className="mt-4 flex-1 text-sm leading-relaxed text-muted">
              Request a free Leak Scan by submitting your business name and website. Or book a free 30-minute video call. We review your details and reply on
              WhatsApp; the scan is not an instant report or final quote.
            </p>
            <button type="button" className="btn btn-copper mt-8" onClick={() => openContact({ service: "Free Leak Scan", openForm: true, message: LEAK_SCAN_MESSAGE })}>
              REQUEST A FREE LEAK SCAN <Arrow diagonal />
            </button>
          </article>
          <article className="fc-fade flex flex-col border border-line p-7">
            <span className="micro text-dim">ONLY IF YOU PROCEED · {deepAuditLabel()} · BUSINESS+</span>
            <h3 className="display mt-4 text-5xl normal-case">Deep Audit</h3>
            <p className="mt-4 flex-1 text-sm leading-relaxed text-muted">
              After the free scan and call, choose to proceed with a Business or Custom build and the Deep Audit confirms scope and final price. It is credited in
              full toward the build within 30 days. Not needed for Start or Flow.
            </p>
            <button type="button" className="btn btn-ghost mt-8" onClick={() => openContact({ service: "Deep Audit", message: DEEP_AUDIT_MESSAGE })}>
              BOOK SKERP AUDIT <Arrow diagonal />
            </button>
          </article>
          <article className="fc-fade flex flex-col border border-line p-7">
            <span className="micro text-dim">LET'S TALK</span>
            <h3 className="display mt-4 text-5xl normal-case">Book a video call</h3>
            <p className="mt-4 flex-1 text-sm leading-relaxed text-muted">
              Have a question before choosing a package? Book a 30-minute video call to talk through your goals and next steps.
            </p>
            <button type="button" className="btn btn-ghost mt-8" onClick={() => openContact({ service: "30-minute video call", openForm: true, message: VIDEO_CALL_MESSAGE })}>
              BOOK A VIDEO CALL <Arrow diagonal />
            </button>
          </article>
        </div>
        <p className="fc-fade mt-6 text-xs text-dim">
          The Leak Scan and video call are free. Submit your details and website; your enquiry opens in WhatsApp so we can follow up.
        </p>
        </div>
      </div>

      {/* -------- Contact options + enquiry form -------- */}
      <div className="pad-x pb-32 pt-20" data-bg="#0b0b0a">
        <div id="contact-options" tabIndex={-1} aria-labelledby="contact-options-title" className="fc-fade border-t border-line pt-10 outline-none">
          <div className="micro flex flex-col justify-between gap-2 text-dim sm:flex-row">
            <span id="contact-options-title" className="text-cream">
              CHOOSE YOUR WAY TO START
            </span>
            <span>GOOD WORK STARTS WITH A CONVERSATION.</span>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="flex flex-col justify-between gap-8 border border-line p-7">
              <div>
                <span className="micro text-copper">WHATSAPP</span>
                <p className="mt-3 text-xl">
                  Fastest way to start a conversation. <span className="text-peach">{WHATSAPP_DISPLAY}</span>
                </p>
              </div>
              <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="btn btn-primary self-start">
                START A CHAT <Arrow diagonal />
              </a>
            </div>
            <div className="flex flex-col justify-between gap-8 border border-line p-7">
              <div>
                <span className="micro text-copper">FORM</span>
                <p className="mt-3 text-xl">Share the details of your project.</p>
              </div>
              <button type="button" className="btn btn-ghost self-start" onClick={() => openContact({ service: "Not Sure" })}>
                OPEN PROJECT FORM <Arrow diagonal />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
