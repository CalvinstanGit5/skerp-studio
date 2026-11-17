import { Automation } from "@/sections/Automation";
import { TimeSaved } from "@/sections/Impact";
import { PageShell } from "./PageShell";
import { Arrow, ChapterLabel } from "@/components/ui";
import { openModal } from "@/components/ModalHost";
import { PackageCards } from "@/sections/PackagesShowcase";

export function AutomationPage() {
  return (
    <PageShell title="Automation | Skerp Studio" description="How we build the automation that catches leads and removes admin, and how much time it gives back.">
      <Automation />
      <div className="pad-x pt-24">
        <ChapterLabel index="02" label="WHAT IT GIVES BACK" />
      </div>
      <TimeSaved index="02" />
      <div className="pad-x reveal-up flex flex-col items-start justify-between gap-8 border-t border-line py-20 md:flex-row md:items-center">
        <p className="display text-[clamp(36px,5vw,72px)]">
          Automate <em>your admin.</em>
        </p>
        <div className="flex flex-wrap items-center gap-6">
          <button type="button" className="btn btn-copper" onClick={() => openModal({ kind: "estimate", pkg: "Flow" })}>
            GET QUOTE <Arrow diagonal />
          </button>
          <a href="/start" className="btn btn-ghost">
            FREE LEAK SCAN <Arrow diagonal />
          </a>
          <a href="/packages#package-business" className="link-u">
            SKERP BUSINESS <Arrow />
          </a>
        </div>
      </div>
      <PackageCards
        ids={["Business", "Custom"]}
        title={
          <>
            Automation, <em>priced clearly.</em>
          </>
        }
        intro="Automation lives in Skerp Business and Skerp Custom. Pick the one that fits, get a quote, or open the full package."
      />
    </PageShell>
  );
}
