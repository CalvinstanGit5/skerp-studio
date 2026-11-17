import { PageShell } from "./PageShell";
import { TAGLINE } from "@/data/site";
import { EMAIL, WHATSAPP_DISPLAY, whatsappHref } from "@/lib/contact";
import { Arrow, SplitWords } from "@/components/ui";

/* DRAFT COPY — edit freely. Kept to things that are true of Skerp today. */
const PRINCIPLES = [
  { n: "01", title: "Leak first. Tools second.", text: "We look at where enquiries, time and money slip away before we recommend anything. A website, WhatsApp flow or automation is only the tool that closes the leak." },
  { n: "02", title: "Straight pricing.", text: "Clear package bands, a written scope and a fixed total before any work starts. No discounts and no surprise invoices; if the budget is smaller, we remove features to match it." },
  { n: "03", title: "Built to keep working.", text: "Every build comes with a monthly care plan for hosting, monitoring and small edits, so your site and systems keep running after launch." },
];

export function AboutPage() {
  return (
    <PageShell title="About | Skerp Studio" description="Skerp Studio is a South African digital studio for websites, audits and practical automation.">
      <div className="pad-x pt-16 md:pt-24">
        <div className="micro flex items-center gap-3 text-muted">
          <span className="dot" /> ABOUT SKERP
        </div>
        <div className="mt-8 grid items-center gap-12 lg:grid-cols-2">
          <h1 className="page-title display text-[clamp(56px,10vw,160px)]">
            <SplitWords text="Bly" />
            <br />
            <em>
              <SplitWords text="skerp." />
            </em>
          </h1>
          <img src="/images/skerp-logo-512.webp" alt="Skerp Studio logo: an eagle head above the words Skerp Studio" width={512} height={512} className="reveal-up h-auto w-52 justify-self-center self-center lg:w-72" />
        </div>
        <div className="reveal-up mt-14 grid gap-10 border-t border-line pt-10 lg:grid-cols-2">
          <p className="text-2xl leading-snug text-cream md:text-3xl">
            Skerp Studio is a South African digital studio working with businesses of every size, at home and abroad. We build websites, audit how companies
            win and lose customers, and automate the admin that slows them down.
          </p>
          <div className="space-y-5 text-muted">
            <p>
              Skerp is run by Calvin Marais, a builder who spends his days on websites, n8n automation and data systems. Every project is designed and built by the
              same person you speak to on WhatsApp, so nothing gets lost in a handover.
            </p>
            <p>
              We work with everyone who needs their business to run sharper: local businesses that need a strong front door, established companies replacing
              manual admin with connected systems, and international clients who want serious automation built properly. Conversations happen in English or
              Afrikaans, and quotes are available in rand, dollars, euros, pounds or Australian dollars.
            </p>
            <p className="micro italic text-cream/60">{TAGLINE}</p>
          </div>
        </div>
      </div>

      <div className="pad-x grid gap-4 pb-10 pt-24 md:grid-cols-3">
        {PRINCIPLES.map((p) => (
          <article key={p.n} className="reveal-up border border-line p-7">
            <span className="mono text-sm text-copper">{p.n}</span>
            <h2 className="display mt-6 text-4xl normal-case">{p.title}</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted">{p.text}</p>
          </article>
        ))}
      </div>

      <div className="pad-x reveal-up pb-28 pt-10">
        <div className="flex flex-col items-start justify-between gap-8 border-t border-line pt-10 md:flex-row md:items-center">
          <p className="display text-[clamp(36px,5vw,72px)]">
            Ready to get <em>skerp?</em>
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <a href="/start" className="btn btn-primary">
              FREE LEAK SCAN <Arrow diagonal />
            </a>
            <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="link-u">
              WHATSAPP {WHATSAPP_DISPLAY} <Arrow diagonal />
            </a>
            <a href={`mailto:${EMAIL}`} className="link-u">
              EMAIL <Arrow diagonal />
            </a>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
