import { useEffect } from "react";
import { PageShell } from "./PageShell";
import {
  CHANGE_BUNDLES,
  CUSTOM_TIERS,
  DISBURSEMENTS,
  INCLUDED,
  MARKETING_RATES,
  MARKETING_SPEND_PERCENT,
  PRICING_MODEL_VERSION,
  TIERS,
  deepAuditLabel,
  formatMoney,
  money,
  moneyRange,
  type TierId,
} from "@/lib/pricing";
import { CurrencyToggle, useCurrency } from "@/lib/currency";
import { whatsappHref } from "@/lib/contact";
import { Arrow, SplitWords } from "@/components/ui";
import { openModal } from "@/components/ModalHost";
import { PACKAGE_COPY } from "@/sections/PackagesShowcase";
import { scrollToTarget } from "@/lib/smooth";

const IDS: TierId[] = ["Start", "Flow", "Business", "Custom"];

/** All packages on one page, in the original Skerp list style. Each row has its own anchor (#package-start …). */
export function PackagesPage() {
  const { currency } = useCurrency();

  // Land on the package a visitor picked ("See package" buttons link to /packages#package-flow etc.).
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith("#package-")) return;
    const t = window.setTimeout(() => {
      const el = document.querySelector<HTMLElement>(hash);
      if (el) {
        scrollToTarget(el, { offset: -90, immediate: true });
        el.classList.add("pkg-highlight");
      }
    }, 250);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <PageShell title="Packages | Skerp Studio" description="Skerp Start, Flow, Business and Custom: what you get and what it costs, in rand or your currency.">
      <div className="pad-x mx-auto max-w-[1320px] pb-24 pt-16 md:pt-24">
        <div className="micro flex items-center gap-3 text-muted">
          <span className="dot" /> CLEAR FROM THE START
        </div>
        <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <h1 className="page-title display text-[clamp(56px,10vw,160px)]">
            <SplitWords text="Good work." />
            <br />
            <em>
              <SplitWords text="Clear pricing." />
            </em>
          </h1>
          <div className="flex flex-col items-start gap-4 lg:items-end">
            <p className="max-w-sm text-muted lg:text-right">Four levels of Skerp. Ranges, not guesswork: your written quote fixes the total before any work starts.</p>
            <CurrencyToggle />
          </div>
        </div>

        {/* Package list */}
        <div className="mt-16 border-t border-line">
          {IDS.map((id, i) => {
            const c = PACKAGE_COPY[id];
            const t = TIERS[id];
            return (
              <article id={`package-${id.toLowerCase()}`} key={id} className="pkg-row reveal-up grid scroll-mt-28 gap-8 border-b border-line py-12 md:grid-cols-[80px_1fr_minmax(260px,340px)] md:gap-10 md:py-16">
                <span className="mono text-sm text-copper">0{i + 1}</span>
                <div>
                  <span className="micro text-copper">{c.tagline.toUpperCase()}</span>
                  <h2 className="display mt-3 text-[clamp(44px,5.5vw,84px)] normal-case">Skerp {id}</h2>
                  <p className="mt-4 max-w-2xl text-lg text-cream/85">{c.forWho}</p>
                  <p className="mt-3 max-w-2xl text-muted">
                    <strong className="font-semibold text-peach">Sound familiar?</strong> {c.problem}
                  </p>
                  <ul className="mt-6 grid max-w-3xl gap-3 sm:grid-cols-2">
                    {c.gets.map((g) => (
                      <li key={g} className="flex gap-3 text-sm leading-relaxed text-cream/85">
                        <span className="mt-[7px] h-[7px] w-[7px] shrink-0 bg-copper" />
                        {g}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 text-sm text-muted">
                    <span className="micro mr-2 text-dim">GOOD FOR</span>
                    {c.goodFor}
                  </p>
                  {id === "Custom" ? (
                    <div className="mt-8 grid gap-3 sm:grid-cols-2">
                      {CUSTOM_TIERS.map((ct) => (
                        <div key={ct.name} className="border border-line p-5">
                          <div className="flex items-baseline justify-between gap-3">
                            <span className="font-semibold text-cream">{ct.name}</span>
                            <span className="text-sm text-peach">
                              from {money(ct.from, currency)}
                              {ct.suffix ?? ""}
                            </span>
                          </div>
                          <ul className="mt-3 space-y-1 text-sm text-muted">
                            {ct.scope.map((x) => (
                              <li key={x}>· {x}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="md:border-l md:border-line md:pl-10">
                  <span className="micro text-dim">SETUP</span>
                  <p className="display mt-2 text-4xl normal-case">{moneyRange(t.setup[0], t.setup[1], currency, id === "Custom")}</p>
                  <span className="micro mt-6 block text-dim">MONTHLY CARE</span>
                  <p className="mt-2 text-xl">
                    {money(t.monthly[0], currency)}
                    <span className="text-muted"> / month</span>
                  </p>
                  <p className="mt-1 text-sm text-muted">Hosting, monitoring and {INCLUDED[id].smallChanges}.</p>
                  {currency !== "ZAR" ? <p className="mt-2 text-[11px] italic text-dim">Indicative {currency}. Final price in your written quote.</p> : null}
                  <p className="mt-4 text-xs text-dim">{c.note}</p>
                  <div className="mt-6 flex flex-col gap-3">
                    <button type="button" className="btn btn-copper" onClick={() => openModal({ kind: "estimate", pkg: id })}>
                      GET QUOTE <Arrow diagonal />
                    </button>
                    <a href={whatsappHref(`Hi Skerp Studio, I'd like to talk about Skerp ${id}.`)} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                      ASK ON WHATSAPP <Arrow diagonal />
                    </a>
                    <a href={`/packages/${id.toLowerCase()}`} className="link-u self-start">
                      FULL DETAILS <Arrow />
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Fine print, in plain words */}
        <div className="reveal-up mt-16 grid gap-10 text-sm leading-relaxed text-muted lg:grid-cols-2">
          <div className="space-y-4">
            <p>
              <strong className="text-cream">How payment works.</strong> Once your written scope and total are agreed, a 50% EFT deposit starts the build. The balance is due
              on delivery. Banking details are only ever shared on invoices.
            </p>
            <p>
              <strong className="text-cream">Business and Custom.</strong> These start with a free Leak Scan and a 30-minute call. If you go ahead, the {deepAuditLabel()} Deep
              Audit confirms the scope and final price, and it is credited in full to your build within 30 days.
            </p>
          </div>
          <div className="space-y-4">
            <p>
              <strong className="text-cream">Extra changes.</strong>{" "}
              {CHANGE_BUNDLES.map((b, i) => (
                <span key={b.id}>
                  {i > 0 ? " · " : ""}
                  {b.changes} for {b.priceUnit === "per change" ? `${formatMoney(b.price, currency)} each` : formatMoney(b.price, currency)}
                  {b.name === "Annual pool 99" ? " a year" : ""}
                </span>
              ))}
              . Bundles are valid for 90 days.
            </p>
            <p>
              <strong className="text-cream">Costs we pass on.</strong> Domain for a year plus admin {formatMoney(DISBURSEMENTS.domainWithOneYearAndAdmin, currency)} ·
              payment provider setup plus admin {formatMoney(DISBURSEMENTS.paymentsProviderSetupWithAdmin, currency)} · anything else at cost plus admin (minimum{" "}
              {formatMoney(DISBURSEMENTS.thirdParty.adminMinimum, currency)}). Model {PRICING_MODEL_VERSION}.
            </p>
          </div>
        </div>

        {/* Marketing add-on */}
        <div className="reveal-up mt-16 grid gap-8 border border-line p-7 md:p-10 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <span className="micro text-copper">OPTIONAL ADD-ON</span>
            <p className="display mt-3 text-[clamp(32px,3.6vw,58px)]">
              Marketing, <em>when you're ready.</em>
            </p>
            <p className="mt-3 text-sm text-muted">Meta Ads, Google Ads or both, managed by the same Skerp team.</p>
          </div>
          <div>
            <div className="divide-y divide-line border-y border-line">
              {MARKETING_RATES.map((r) => (
                <p key={r.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <span>{r.name}</span>
                  <strong className="font-display text-xl">From {money(r.clientRate, currency)} / month</strong>
                </p>
              ))}
            </div>
            <p className="mt-3 text-xs text-dim">
              Management is the higher of the agreed base rate or {MARKETING_SPEND_PERCENT}% of ad spend. Ad spend is paid by you, directly to Meta or Google.
            </p>
            <a href="/marketing" className="link-u mt-5">
              MARKETING DETAILS <Arrow diagonal />
            </a>
          </div>
        </div>

        {/* Not sure */}
        <div className="reveal-up mt-6 flex flex-col items-start justify-between gap-6 border border-line p-7 md:flex-row md:items-center md:p-10">
          <div>
            <span className="micro text-copper">NOT SURE WHICH ONE FITS?</span>
            <p className="display mt-3 text-[clamp(30px,3.4vw,54px)]">
              Estimate <em>your project.</em>
            </p>
            <p className="mt-2 max-w-lg text-sm text-muted">Answer a few quick questions for an indicative band in your currency, or start with a free Leak Scan.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn btn-copper" onClick={() => openModal({ kind: "estimate" })}>
              ESTIMATE YOUR PROJECT <Arrow diagonal />
            </button>
            <a href="/start" className="btn btn-ghost">
              FREE LEAK SCAN <Arrow diagonal />
            </a>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
