import SelectedWork from "@/sections/SelectedWork";
import { PageShell } from "./PageShell";
import { Arrow } from "@/components/ui";
import { whatsappHref } from "@/lib/contact";

export function WorkPage() {
  return (
    <PageShell title="Work | Skerp Studio" description="Live websites built by Skerp Studio for South African businesses.">
      <SelectedWork standalone />
      <div className="pad-x reveal-up flex flex-col items-start justify-between gap-8 border-t border-line py-20 md:flex-row md:items-center">
        <p className="display text-[clamp(36px,5vw,72px)]">
          Your business <em>next?</em>
        </p>
        <div className="flex flex-wrap items-center gap-6">
          <a href="/start" className="btn btn-primary">
            FREE LEAK SCAN <Arrow diagonal />
          </a>
          <a href="/packages" className="link-u">
            SEE PACKAGES <Arrow />
          </a>
          <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="link-u">
            WHATSAPP <Arrow diagonal />
          </a>
        </div>
      </div>
    </PageShell>
  );
}
