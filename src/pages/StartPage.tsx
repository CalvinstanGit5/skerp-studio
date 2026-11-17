import { PageShell } from "./PageShell";
import { StartOptions } from "@/sections/FinalCta";
import { FAQ } from "@/data/site";
import { WHATSAPP_DISPLAY, whatsappHref } from "@/lib/contact";
import { Arrow, SplitWords } from "@/components/ui";
import { openModal } from "@/components/ModalHost";

export function StartPage() {
  return (
    <PageShell
      title="Start here | Free Leak Scan · Skerp Studio"
      description="Request a free Leak Scan, book a 30-minute video call or send Skerp Studio your project on WhatsApp."
    >
      <div className="pad-x pt-16 md:pt-24">
        <div className="micro flex items-center gap-3 text-muted">
          <span className="dot" /> START HERE
        </div>
        <h1 className="page-title display mt-8 text-[clamp(56px,10vw,160px)]">
          <SplitWords text="Let's find" />
          <br />
          <em>
            <SplitWords text="your leak." />
          </em>
        </h1>
        <p className="lede reveal-up mt-8 max-w-2xl">
          Pick the way that suits you. Every option is free to start, and nothing is locked in until you see a written scope and total.{" "}
          <span className="sm:block sm:whitespace-nowrap">
            Fastest of all: WhatsApp us on{" "}
            <a className="whitespace-nowrap text-cream underline underline-offset-4" href={whatsappHref()} target="_blank" rel="noopener noreferrer">
              {WHATSAPP_DISPLAY}
            </a>
            .
          </span>
        </p>
      </div>

      <StartOptions />

      <div className="pad-x reveal-up pb-10">
        <div className="flex flex-col items-start justify-between gap-6 border border-line p-7 md:flex-row md:items-center md:p-10">
          <div>
            <span className="micro text-copper">NOT SURE WHICH LEVEL FITS?</span>
            <p className="display mt-3 text-[clamp(30px,3.4vw,54px)]">
              Estimate <em>your project.</em>
            </p>
            <p className="mt-2 max-w-lg text-sm text-muted">Answer a few questions for an indicative band in your currency.</p>
          </div>
          <button type="button" className="btn btn-copper" onClick={() => openModal({ kind: "estimate" })}>
            ESTIMATE YOUR PROJECT <Arrow diagonal />
          </button>
        </div>
      </div>

      <div id="faq" className="pad-x grid gap-12 pb-28 pt-20 lg:grid-cols-[0.8fr_1.2fr]" aria-labelledby="faq-title">
        <div className="reveal-up">
          <span className="micro text-dim">FAQ</span>
          <h2 id="faq-title" className="display mt-4 text-[clamp(48px,6vw,96px)]">
            Straight <em>answers.</em>
          </h2>
        </div>
        <div className="divide-y divide-line border-y border-line">
          {FAQ.map((f) => (
            <details key={f.q} className="group py-1">
              <summary className="flex items-center justify-between gap-6 py-5 text-lg font-semibold">
                {f.q}
                <span className="grid h-8 w-8 shrink-0 place-items-center border border-line-strong text-copper transition-transform duration-300 group-open:rotate-45">+</span>
              </summary>
              <p className="pb-6 pr-12 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
