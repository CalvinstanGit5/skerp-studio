import type React from "react";
import { useRef } from "react";
import { CUSTOM_TIERS, INCLUDED, PRICING_MODEL_VERSION, TIERS, deepAuditLabel, money, moneyRange, type TierId } from "@/lib/pricing";
import { CurrencyToggle, useCurrency } from "@/lib/currency";
import { whatsappHref } from "@/lib/contact";
import { Arrow, ChapterLabel, SplitWords } from "@/components/ui";
import { openModal } from "@/components/ModalHost";
import { gsap, useGSAP } from "@/lib/smooth";
import { cn } from "@/utils/cn";

/* ------------------------------------------------------------------
 * Landing-page packages: one pinned scroll that walks through each
 * package (friendly copy, PM-1.1 prices), then "Scope first. Clear total."
 * Copy lives here; prices come from lib/pricing so they never drift.
 * ------------------------------------------------------------------ */
export const PACKAGE_COPY: Record<
  TierId,
  { tagline: string; forWho: string; problem: string; gets: string[]; goodFor: string; note: string }
> = {
  Start: {
    tagline: "Your digital front door",
    forWho: "For sole traders and local services that need to be easy to find and easy to contact.",
    problem: "People can't find you online, or can't quickly see how to reach you.",
    gets: [
      "A clean, mobile-friendly website with the pages customers look for first",
      "Clear buttons to call, WhatsApp or send an enquiry",
      "Set up so Google can find your business",
      "A look that makes the next step obvious",
    ],
    goodFor: "Trades, tutors, consultants and small local shops.",
    note: "50% EFT deposit to start. No audit needed.",
  },
  Flow: {
    tagline: "Enquiries that don't go cold",
    forWho: "For businesses that already get enquiries and want every one followed up.",
    problem: "Messages sit unanswered, and booking or invoicing still happens by hand.",
    gets: [
      "A website that leads visitors straight to an enquiry",
      "Automatic WhatsApp or email follow-ups",
      "Simple booking, EFT or invoice steps where you need them",
      "Repetitive admin taken off your plate",
    ],
    goodFor: "Salons, clinics, guesthouses and service teams.",
    note: "50% EFT deposit to start. No audit needed.",
  },
  Business: {
    tagline: "One system, not ten chats",
    forWho: "For growing businesses with a team, where leads and admin are spread across too many places.",
    problem: "Customer details live in different apps, chats and notebooks, and things slip through.",
    gets: [
      "A website built around how you actually sell",
      "One customer list or CRM to track every enquiry",
      "Forms, bookings or payments that fit your process",
      "Your tools connected so information moves by itself",
    ],
    goodFor: "Established service businesses and multi-staff teams.",
    note: `Starts with a free Leak Scan and call. The ${deepAuditLabel()} Deep Audit is credited to your build.`,
  },
  Custom: {
    tagline: "Built around your business",
    forWho: "For businesses with their own way of working that a standard package won't fit.",
    problem: "You need joined-up systems, several automations or something bespoke, not just a website.",
    gets: [
      "A custom website, a workflow system, or both",
      "Deeper connections to the tools you rely on",
      "Automation or AI where it saves real time",
      "A fixed, written scope agreed before we start",
    ],
    goodFor: "Specialist firms, multi-location businesses and automation builds.",
    note: `Starts with a free Leak Scan and call. The ${deepAuditLabel()} Deep Audit is credited to your build.`,
  },
};

const IDS: TierId[] = ["Start", "Flow", "Business", "Custom"];
const pad = (n: number) => String(n + 1).padStart(2, "0");

export function PackageButtons({ id, className, compact = false }: { id: TierId; className?: string; compact?: boolean }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <button type="button" className={cn("btn btn-copper", compact && "!min-h-[44px] !gap-3 !px-4")} onClick={() => openModal({ kind: "estimate", pkg: id })}>
        GET QUOTE <Arrow diagonal />
      </button>
      <a href={`/packages#package-${id.toLowerCase()}`} className={cn("btn btn-ghost", compact && "!min-h-[44px] !gap-3 !px-4")}>
        SEE PACKAGE <Arrow />
      </a>
    </div>
  );
}

function PriceBlock({ id }: { id: TierId }) {
  const { currency } = useCurrency();
  const t = TIERS[id];
  return (
    <div className="border border-line bg-ink-2/80 p-6 backdrop-blur md:p-8">
      <span className="micro text-dim">SETUP</span>
      <p className="display mt-2 text-[clamp(34px,3.4vw,52px)] normal-case">From {money(t.setup[0], currency)}</p>
      <p className="mt-1 text-sm text-muted">Usually {moneyRange(t.setup[0], t.setup[1], currency, id === "Custom")}, depending on what you need.</p>
      <div className="my-5 h-px bg-line" />
      <span className="micro text-dim">MONTHLY CARE</span>
      <p className="mt-2 text-xl text-cream">
        {money(t.monthly[0], currency)}
        <span className="text-muted"> / month</span>
      </p>
      <p className="mt-1 text-sm text-muted">Hosting, monitoring and {INCLUDED[id].smallChanges}.</p>
      {id === "Custom" ? (
        <ul className="mt-5 divide-y divide-line border-y border-line text-sm">
          {CUSTOM_TIERS.map((c) => (
            <li key={c.name} className="flex items-center justify-between gap-4 py-2">
              <span className="text-cream/85">{c.name}</span>
              <span className="text-muted">
                from {money(c.from, currency)}
                {c.suffix ?? ""}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      {currency !== "ZAR" ? <p className="mt-3 text-[11px] italic text-dim">Indicative {currency}. Final price in your written quote.</p> : null}
      <PackageButtons id={id} className="mt-7" />
    </div>
  );
}

export function PackagesShowcase() {
  const root = useRef<HTMLElement>(null);
  const { currency } = useCurrency();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);
        const panels = q(".pkg-panel");
        gsap.set(panels, { autoAlpha: 0 });
        gsap.set(q(".pkg-bar"), { opacity: 0 });
        gsap.set(q(".pkg-panel .pkg-word > .sw > span"), { yPercent: 115 });
        gsap.set(q(".pkg-get"), { opacity: 0, x: -24 });
        gsap.set(q(".pkg-price"), { opacity: 0, y: 40 });
        gsap.set(q(".pkg-ghost"), { opacity: 0, x: 80 });
        gsap.set(q(".pkg-payoff"), { autoAlpha: 0 });
        gsap.set(q(".pkg-box"), { opacity: 0, y: 60 });
        gsap.set(q(".pkg-payoff .sw > span"), { yPercent: 115 });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: q(".pkg-pin")[0],
            start: "top top",
            end: () => `+=${window.innerHeight * 5.4}`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        tl.to(q(".pkg-intro"), { opacity: 0, y: -50, filter: "blur(8px)", duration: 0.4 }, 0.15).to(q(".pkg-bar"), { opacity: 1, duration: 0.3 }, 0.2);

        IDS.forEach((_, i) => {
          const at = 0.5 + i * 1.1;
          const p = panels[i];
          tl.set(p, { autoAlpha: 1 }, at)
            .to(p.querySelectorAll(".pkg-word > .sw > span"), { yPercent: 0, duration: 0.3, stagger: 0.03, ease: "power3.out" }, at)
            .to(p.querySelector(".pkg-ghost"), { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }, at)
            .to(p.querySelectorAll(".pkg-get"), { opacity: 1, x: 0, duration: 0.25, stagger: 0.06, ease: "power2.out" }, at + 0.15)
            .to(p.querySelector(".pkg-price"), { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, at + 0.1)
            .fromTo(q(`.pkg-tab-fill-${i}`), { scaleX: 0 }, { scaleX: 1, duration: 1.1 }, at)
            .to(q(`.pkg-tab-${i}`), { color: "#f2f0e9", duration: 0.1 }, at);
          if (i < IDS.length - 1) {
            tl.to(p, { autoAlpha: 0, y: -30, filter: "blur(6px)", duration: 0.22, ease: "power2.in" }, at + 0.88).to(
              q(`.pkg-tab-${i}`),
              { color: "#6f6d65", duration: 0.1 },
              at + 0.95,
            );
          }
        });

        const tp = 0.5 + IDS.length * 1.1;
        tl.to(panels[IDS.length - 1], { autoAlpha: 0, y: -30, duration: 0.22 }, tp - 0.2)
          .to(q(".pkg-bar-tabs"), { opacity: 0, duration: 0.2 }, tp - 0.2)
          .set(q(".pkg-payoff"), { autoAlpha: 1 }, tp)
          .to(q(".pkg-payoff .sw > span"), { yPercent: 0, duration: 0.35, stagger: 0.05, ease: "power3.out" }, tp)
          .to(q(".pkg-box"), { opacity: 1, y: 0, duration: 0.35, stagger: 0.08, ease: "power3.out" }, tp + 0.15)
          .to({}, { duration: 0.7 });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="pricing" ref={root} data-bg="#0b0b0a" aria-labelledby="pricing-title" className="relative">
      <div className="pkg-pin relative w-full motion-safe:md:h-svh motion-safe:md:overflow-hidden">
        {/* Top bar: real logo, same type as the site */}
        <div className="pkg-bar pad-x relative z-20 flex items-center justify-between gap-4 border-b border-line py-4 motion-safe:md:absolute motion-safe:md:inset-x-0 motion-safe:md:top-0">
          <a href="/packages" className="flex items-center gap-3" aria-label="Skerp Studio packages">
            <img src="/images/skerp-logo-96.webp" alt="" width={44} height={44} className="h-11 w-11" />
            <span className="hidden flex-col leading-none sm:flex">
              <span className="font-display text-[22px] font-black tracking-[-0.075em]">
                SKERP<span className="text-copper">.</span>
              </span>
              <span className="mt-1 text-[8px] font-bold tracking-[0.42em] text-muted">STUDIO</span>
            </span>
          </a>
          <ol className="pkg-bar-tabs hidden items-center gap-6 lg:flex">
            {IDS.map((id, i) => (
              <li key={id} className="w-28">
                <span className={`pkg-tab-${i} micro block text-dim`}>
                  {pad(i)} {id.toUpperCase()}
                </span>
                <span className="mt-2 block h-px overflow-hidden bg-line">
                  <span className={`pkg-tab-fill-${i} block h-full origin-left scale-x-0 bg-copper`} />
                </span>
              </li>
            ))}
          </ol>
          <CurrencyToggle />
        </div>

        {/* Intro */}
        <div className="pkg-intro pad-x relative z-10 pt-16 motion-safe:md:absolute motion-safe:md:inset-0 motion-safe:md:flex motion-safe:md:flex-col motion-safe:md:justify-center motion-safe:md:pt-0">
          <ChapterLabel index="06" label="PACKAGES · CLEAR FROM THE START" />
          <h2 id="pricing-title" className="display mt-8 text-[clamp(56px,9vw,150px)]">
            Good work.
            <br />
            <em>Clear pricing.</em>
          </h2>
          <p className="lede mt-6 max-w-xl">Four packages and one honest price list. Scroll through them, or jump straight to the one that fits.</p>
        </div>

        {/* Package panels */}
        <div className="relative z-10 motion-safe:md:absolute motion-safe:md:inset-0">
          {IDS.map((id, i) => {
            const c = PACKAGE_COPY[id];
            return (
              <article key={id} id={`landing-package-${id.toLowerCase()}`} className="pkg-panel pad-x relative border-t border-line py-16 motion-safe:md:absolute motion-safe:md:inset-0 motion-safe:md:flex motion-safe:md:items-center motion-safe:md:border-0 motion-safe:md:pb-10 motion-safe:md:pt-28">
                <span
                  aria-hidden="true"
                  className="pkg-ghost display pointer-events-none absolute -bottom-[6vw] right-[-2vw] hidden text-[30vw] leading-none text-transparent md:block"
                  style={{ WebkitTextStroke: "1px #f2f0e914" }}
                >
                  {pad(i)}
                </span>
                <div className="relative grid w-full gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16">
                  <div>
                    <div className="micro flex items-center gap-3 text-copper">
                      {pad(i)} <span className="h-px w-10 bg-copper/60" /> {c.tagline.toUpperCase()}
                    </div>
                    <h3 className="pkg-word display mt-5 text-[clamp(52px,7vw,118px)] normal-case">
                      <SplitWords text={`Skerp ${id}.`} />
                    </h3>
                    <p className="mt-5 max-w-xl text-lg text-cream/85">{c.forWho}</p>
                    <p className="mt-3 max-w-xl text-muted">
                      <span className="text-peach">Sound familiar?</span> {c.problem}
                    </p>
                    <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                      {c.gets.map((g) => (
                        <li key={g} className="pkg-get flex gap-3 text-sm leading-relaxed text-cream/85">
                          <span className="mt-[7px] h-[7px] w-[7px] shrink-0 bg-copper" />
                          {g}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-6 text-sm text-dim">
                      <span className="micro mr-2 text-muted">GOOD FOR</span>
                      {c.goodFor}
                    </p>
                  </div>
                  <div className="pkg-price">
                    <PriceBlock id={id} />
                    <p className="mt-3 text-xs text-dim">{c.note}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Payoff: scope first, clear total, four big boxes */}
        <div className="pkg-payoff pad-x relative z-10 border-t border-line py-20 motion-safe:md:absolute motion-safe:md:inset-0 motion-safe:md:flex motion-safe:md:flex-col motion-safe:md:justify-center motion-safe:md:border-0 motion-safe:md:py-0 motion-safe:md:pt-20">
          <div className="text-center">
            <span className="micro text-copper">WEBSITES · AUDITS · AUTOMATION</span>
            <h3 className="display mt-4 text-[clamp(48px,7vw,116px)]">
              <SplitWords text="Scope first." />
              <br />
              <em>
                <SplitWords text="Clear total." />
              </em>
            </h3>
            <p className="mx-auto mt-4 max-w-2xl text-muted">
              50% EFT deposit once your written scope and total are agreed; the balance on delivery. Business and Custom start with a free Leak Scan and a 30-minute call.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {IDS.map((id, i) => (
              <div key={id} className="pkg-box group relative flex min-h-[230px] flex-col justify-between border border-line bg-ink-2/80 p-6 transition-colors duration-500 hover:border-copper md:p-7">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="mono text-sm text-copper">{pad(i)}</span>
                    <span className="micro text-dim">{money(TIERS[id].monthly[0], currency)}/MO</span>
                  </div>
                  <p className="display mt-5 text-4xl normal-case md:text-5xl">Skerp {id}</p>
                  <p className="mt-2 text-sm text-muted">{PACKAGE_COPY[id].tagline}</p>
                </div>
                <div className="mt-6">
                  <p className="text-lg text-cream">
                    From {money(TIERS[id].setup[0], currency)}
                    <span className="text-sm text-muted"> setup</span>
                  </p>
                  <PackageButtons id={id} compact className="mt-4" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            <a href={whatsappHref("Hi Skerp Studio, I'd like to talk about which package fits my business.")} target="_blank" rel="noopener noreferrer" className="link-u">
              ENQUIRE ON WHATSAPP <Arrow diagonal />
            </a>
            <button type="button" className="link-u" onClick={() => openModal({ kind: "estimate" })}>
              ESTIMATE YOUR PROJECT <Arrow diagonal />
            </button>
            <a href="/packages" className="link-u">
              COMPARE ALL PACKAGES <Arrow />
            </a>
            <span className="micro text-dim">MODEL {PRICING_MODEL_VERSION}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Side-by-side package cards (used under the automation story: Business + Custom). */
export function PackageCards({ ids, title, intro }: { ids: TierId[]; title: React.ReactNode; intro: string }) {
  return (
    <section className="pad-x py-24" aria-label="Automation pricing">
      <ChapterLabel index="03" label="WHAT IT COSTS" />
      <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <h2 className="display text-[clamp(48px,7vw,110px)]">{title}</h2>
        <div className="flex flex-col items-start gap-4 lg:items-end">
          <p className="max-w-md text-muted lg:text-right">{intro}</p>
          <CurrencyToggle />
        </div>
      </div>
      <div className="mt-12 grid gap-4 lg:grid-cols-2">
        {ids.map((id) => {
          const c = PACKAGE_COPY[id];
          return (
            <article key={id} className="reveal-up flex flex-col border border-line bg-ink-2/60 p-6 md:p-8">
              <span className="micro text-copper">{c.tagline.toUpperCase()}</span>
              <a href={`/packages#package-${id.toLowerCase()}`} className="group mt-3 inline-flex items-center gap-3">
                <h3 className="display text-[clamp(40px,4.4vw,68px)] normal-case transition-colors group-hover:text-peach">Skerp {id}</h3>
                <Arrow className="h-6 w-6 text-copper transition-transform group-hover:translate-x-1" />
              </a>
              <p className="mt-3 text-cream/85">{c.forWho}</p>
              <ul className="mt-5 grid gap-2">
                {c.gets.map((g) => (
                  <li key={g} className="flex gap-3 text-sm text-cream/80">
                    <span className="mt-[7px] h-[7px] w-[7px] shrink-0 bg-copper" />
                    {g}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex-1">
                <PriceBlock id={id} />
              </div>
              <p className="mt-3 text-xs text-dim">{c.note}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
