import { CurrencyToggle, useCurrency } from "@/lib/currency";
import { MARKETING_RATES, MARKETING_SPEND_PERCENT, money } from "@/lib/pricing";
import { MARKETING_WA_MESSAGE, whatsappHref } from "@/lib/contact";
import { Arrow, SplitWords } from "@/components/ui";
import { PageShell } from "./PageShell";

const DESCRIPTION = "In-house Meta and Google Ads management by Skerp Studio. Client rates, marketing-only rates, and a clear higher-of fee rule.";

function MarketingContent() {
  const { currency } = useCurrency();
  return (
    <div className="pad-x mx-auto max-w-[1300px] pb-28 pt-20">
      <span className="micro text-copper">OPTIONAL ADD-ON OR STANDALONE · SOUTH AFRICA</span>
      <h1 className="page-title display mt-8 text-[clamp(64px,11vw,180px)]">
        <SplitWords text="Marketing," />
        <br />
        <em>
          <SplitWords text="done in-house." />
        </em>
      </h1>
      <p className="lede reveal-up mt-8 max-w-2xl">
        Skerp Studio sets up and manages Meta and Google Ads campaigns. Ad spend is paid separately to the platforms. We use research, platform data and
        structured testing; we do not guarantee leads or sales.
      </p>

      <section className="reveal-up mt-24" aria-labelledby="marketing-rates-title">
        <div className="flex flex-col gap-6 border-b border-line pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id="marketing-rates-title" className="display text-[clamp(36px,5vw,72px)]">
              Clear monthly rates.
            </h2>
            <p className="mt-3 text-muted">Choose one channel or manage both together. Ad spend is separate.</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="micro text-dim">DISPLAY CURRENCY</span>
            <CurrencyToggle />
          </div>
        </div>
        <div className="divide-y divide-line border-b border-line">
          {MARKETING_RATES.map((r) => (
            <article key={r.id} className="grid items-center gap-6 py-8 md:grid-cols-[1fr_2fr]">
              <h3 className="display text-3xl normal-case md:text-4xl">{r.short}</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <span className="micro text-dim">CLIENT WITH A PACKAGE · MONTHLY</span>
                  <strong className="display mt-2 block text-4xl normal-case text-peach">From {money(r.clientRate, currency)}</strong>
                </div>
                <div>
                  <span className="micro text-dim">STANDALONE CLIENT · MONTHLY</span>
                  <strong className="display mt-2 block text-4xl normal-case">From {money(r.nonClientRate, currency)}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
        <p className="border-b border-line py-5 text-xl font-bold">Annual options available</p>
        <div className="mt-8 text-sm leading-relaxed text-muted">
          <span className="micro text-dim">WHAT'S INCLUDED</span>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>Campaign setup and ongoing management</li>
            <li>Optimisation and standard reporting</li>
            <li>You pay your ad spend directly to Meta or Google</li>
          </ul>
          <p className="mt-4">
            <strong className="text-cream">Management fee:</strong> the higher of the monthly base rate or {MARKETING_SPEND_PERCENT}% of ad spend.
          </p>
        </div>
      </section>

      <section className="reveal-up mt-24 grid gap-8 border-t border-line pt-14 md:grid-cols-2" aria-labelledby="marketing-how-title">
        <h2 id="marketing-how-title" className="display text-[clamp(40px,6vw,96px)]">
          One Skerp <em>team.</em>
        </h2>
        <div>
          <p className="lede">
            Campaign setup and management for Meta and Google Ads are delivered by Skerp Studio. Marketing is optional with a package or available as a standalone
            service.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-8">
            <a href="/start" className="btn btn-primary">
              REQUEST A FREE LEAK SCAN <Arrow diagonal />
            </a>
            <a href="/packages" className="link-u">
              VIEW PACKAGES <Arrow diagonal />
            </a>
            <a href={whatsappHref(MARKETING_WA_MESSAGE)} target="_blank" rel="noopener noreferrer" className="link-u">
              WHATSAPP SKERP <Arrow diagonal />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export function MarketingPage() {
  return (
    <>
      <PageShell title="In-house Marketing | Skerp Studio" description={DESCRIPTION}>
        <MarketingContent />
      </PageShell>
    </>
  );
}
