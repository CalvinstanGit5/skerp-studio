import { PageShell } from "./PageShell";
import { EstimateCalculator } from "@/components/calculators/EstimateCalculator";
import { SplitWords } from "@/components/ui";

export function EstimatePage() {
  return (
    <PageShell title="Estimate your project | Skerp Studio" description="Answer a few questions for an indicative Skerp Studio price band in your currency.">
      <div className="pad-x mx-auto max-w-[1100px] pb-28 pt-16 md:pt-24">
        <div className="micro flex items-center gap-3 text-muted">
          <span className="dot" /> PROJECT ESTIMATE
        </div>
        <h1 className="page-title display mt-8 text-[clamp(56px,9vw,140px)]">
          <SplitWords text="Estimate" />
          <br />
          <em>
            <SplitWords text="your project." />
          </em>
        </h1>
        <p className="lede reveal-up mt-6 max-w-2xl">A few quick questions give you an indicative band in your currency. The written quote after a short call fixes the total.</p>
        <div className="reveal-up mt-12 border border-line-strong bg-ink-2 p-5 sm:p-8">
          <EstimateCalculator onClose={() => undefined} />
        </div>
      </div>
    </PageShell>
  );
}
