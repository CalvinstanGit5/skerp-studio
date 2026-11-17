import { useState } from "react";
import { CurrencyToggle, useCurrency } from "@/lib/currency";
import { CUSTOM_TIERS, INCLUDED, MARKETING_RATES, MARKETING_SPEND_PERCENT, PACKAGES, TIERS, money, moneyRange } from "@/lib/pricing";
import { whatsappHref } from "@/lib/contact";
import { Arrow, SplitWords } from "@/components/ui";
import { PageShell } from "./PageShell";

function PackageContent({ slug }: { slug: string }) {
  const { currency } = useCurrency();
  const [tier, setTier] = useState(0);
  const pkg = PACKAGES.find((p) => p.id.toLowerCase() === slug);

  if (!pkg) {
    return (
      <div className="pad-x py-32">
        <a className="link-u" href="/packages">
          BACK TO PACKAGES <Arrow diagonal />
        </a>
        <h1 className="display mt-10 text-7xl">Package not found.</h1>
      </div>
    );
  }

  const band = TIERS[pkg.id];
  const inc = INCLUDED[pkg.id];
  const wa = whatsappHref(`Hi Skerp Studio, I'd like to discuss Skerp ${pkg.id} and the optional marketing add-on.`);
  const R = (n: number) => money(n, currency);
  const sel = CUSTOM_TIERS[tier];

  return (
    <div className="pad-x mx-auto max-w-[1240px] pb-28 pt-16">
      <div className="micro flex items-center gap-3 text-muted">
        <span className="dot" /> PACKAGE DETAILS <span className="ml-auto text-dim">{pkg.id.toUpperCase()}</span>
      </div>

      <div className="mt-14 flex flex-col gap-8 border-b border-line pb-14 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="micro text-copper">SKERP {pkg.id.toUpperCase()}</span>
          <h1 className="page-title display mt-4 text-[clamp(60px,10vw,150px)]">
            <SplitWords text={pkg.name} />
            <span className="text-copper">.</span>
          </h1>
          <p className="lede mt-6 max-w-2xl">{pkg.forWho}</p>
        </div>
        <CurrencyToggle />
      </div>

      <section className="reveal-up grid gap-10 border-b border-line py-14 md:grid-cols-[0.8fr_1.2fr]" aria-labelledby="pkg-includes">
        <div>
          <span className="micro text-dim">WHAT YOU GET</span>
          <h2 id="pkg-includes" className="display mt-4 text-[clamp(34px,4.5vw,60px)]">
            A clearer way <em>to work.</em>
          </h2>
        </div>
        <div>
          <p className="text-muted">{pkg.problem}</p>
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {pkg.includes.map((item) => (
              <li key={item} className="flex gap-4 py-4">
                <span className="font-bold text-copper">+</span>
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm text-muted">
            <strong className="text-cream">Often a fit for:</strong> {pkg.examples}
          </p>
          {pkg.excludes ? (
            <p className="mt-2 text-sm text-muted">
              <strong className="text-cream">Outside scope:</strong> {pkg.excludes}
            </p>
          ) : null}
        </div>
      </section>

      <section className="reveal-up grid gap-10 border-b border-line py-14 md:grid-cols-[0.8fr_1.2fr]" aria-labelledby="pkg-pricing">
        <div>
          <span className="micro text-dim">STRAIGHT BANDS</span>
          <h2 id="pkg-pricing" className="display mt-4 text-[clamp(34px,4.5vw,60px)]">
            Scope first. <em>Clear total.</em>
          </h2>
        </div>
        <div className="border border-line bg-ink-2 p-6">
          <p className="flex items-center justify-between gap-4 border-b border-line py-4">
            <span className="micro text-dim">SETUP FROM</span>
            <strong className="display text-right text-3xl normal-case">{moneyRange(band.setup[0], band.setup[1], currency)}</strong>
          </p>
          <p className="flex items-center justify-between gap-4 border-b border-line py-4">
            <span className="micro text-dim">MONTHLY CARE FROM</span>
            <strong className="display text-right text-3xl normal-case">{R(band.monthly[0])}/month</strong>
          </p>
          <small className="mt-4 block text-xs leading-relaxed text-muted">
            Includes {inc.smallChanges}. Annual plans available. New pages, features and integrations are scoped separately.
          </small>
        </div>
      </section>

      {pkg.id === "Custom" ? (
        <section className="reveal-up grid gap-10 border-b border-line py-14 md:grid-cols-[0.8fr_1.2fr]" aria-labelledby="custom-tier-title">
          <div>
            <span className="micro text-dim">CHOOSE A STARTING SCOPE</span>
            <h2 id="custom-tier-title" className="display mt-4 text-[clamp(34px,4.5vw,60px)]">
              Why custom <em>costs vary.</em>
            </h2>
          </div>
          <div>
            <p className="text-muted">
              Custom work is priced by the systems, integrations and workflows your business needs. Pick the closest starting point; a Deep Audit confirms the
              exact scope and fixed written price.
            </p>
            <div className="mt-6 grid gap-2 sm:grid-cols-2" role="group" aria-label="Custom starting scope">
              {CUSTOM_TIERS.map((t, i) => (
                <button
                  key={t.name}
                  type="button"
                  aria-pressed={tier === i}
                  onClick={() => setTier(i)}
                  className={`flex flex-col items-start gap-1 border p-4 text-left transition-colors ${tier === i ? "border-copper bg-copper/10" : "border-line hover:border-line-strong"}`}
                >
                  <span className="text-sm">{t.name}</span>
                  <strong className="font-display text-xl">
                    From {R(t.from)}
                    {t.suffix ?? ""}
                  </strong>
                </button>
              ))}
            </div>
            <div className="mt-4 border border-line p-5">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-lg font-semibold">{sel.name}</h3>
                <strong className="micro text-copper">
                  STARTING FROM {R(sel.from)}
                  {sel.suffix ?? ""}
                </strong>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-muted">
                {sel.scope.map((s) => (
                  <li key={s}>— {s}</li>
                ))}
              </ul>
            </div>
            <p className="mt-4 text-sm text-muted">
              <strong className="text-cream">Why the range?</strong> Connected tools, workflow complexity, data handoffs, testing and delivery effort determine the
              scope. The audit defines these before the final quote.
            </p>
          </div>
        </section>
      ) : null}

      <section className="reveal-up grid gap-10 border-b border-line py-14 md:grid-cols-[0.8fr_1.2fr]" aria-labelledby="marketing-addon-title">
        <div>
          <span className="micro text-dim">OPTIONAL ADD-ON</span>
          <h2 id="marketing-addon-title" className="display mt-4 text-[clamp(34px,4.5vw,60px)]">
            Marketing, <em>when you're ready.</em>
          </h2>
        </div>
        <div>
          <p className="text-muted">Meta Ads, Google Ads or both, managed by one Skerp team.</p>
          <div className="mt-5 divide-y divide-line border-y border-line">
            {MARKETING_RATES.map((r) => (
              <p key={r.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <span>{r.name}</span>
                <strong className="font-display text-xl">From {R(r.clientRate)} / month</strong>
              </p>
            ))}
          </div>
          <p className="border-b border-line py-4 font-bold">Annual options available</p>
          <small className="mt-3 block text-xs text-muted">
            Management is the higher of the agreed base rate or {MARKETING_SPEND_PERCENT}% of ad spend. Ad spend is paid separately by you to Meta or Google.
          </small>
          <a className="link-u mt-5" href="/marketing">
            MARKETING SERVICE DETAILS <Arrow diagonal />
          </a>
        </div>
      </section>

      {pkg.id === "Business" || pkg.id === "Custom" ? (
        <p className="reveal-up mt-10 text-sm text-muted">
          <strong className="text-cream">Before a Business or Custom build:</strong> start with a free Leak Scan and free 30-minute video call. If you decide to
          proceed, the Deep Audit is {R(3500)}; it confirms the scope and is credited in full toward a build agreed within 30 days.
        </p>
      ) : null}
      <p className="reveal-up mt-4 text-sm text-muted">
        <strong className="text-cream">Build payment:</strong> a 50% EFT deposit is due after the scope and written total are agreed. The remaining balance is due
        on delivery or go-live.
      </p>

      <div className="reveal-up mt-14 flex flex-col items-start justify-between gap-6 border-t border-line pt-10 md:flex-row md:items-center">
        <span className="micro text-dim">WANT TO TALK THROUGH THE FIT?</span>
        <a className="btn btn-copper" href={wa} target="_blank" rel="noopener noreferrer">
          SEND US A WHATSAPP <Arrow diagonal />
        </a>
      </div>
    </div>
  );
}

export function PackagePage({ slug }: { slug: string }) {
  const pkg = PACKAGES.find((p) => p.id.toLowerCase() === slug);
  return (
    <>
      <PageShell
        title={pkg ? `${pkg.name} | Skerp Studio` : "Package not found | Skerp Studio"}
        description={pkg?.forWho}
      >
        <PackageContent slug={slug} />
      </PageShell>
    </>
  );
}
