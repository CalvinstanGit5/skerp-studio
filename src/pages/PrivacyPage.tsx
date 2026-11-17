import { EMAIL, WHATSAPP_DISPLAY, whatsappHref } from "@/lib/contact";
import { SplitWords } from "@/components/ui";
import { PageShell } from "./PageShell";

/* Privacy notice describing exactly what this site does with data.
 * If you already have a reviewed privacy.html, drop it into /public and it will be served instead. */
export function PrivacyPage() {
  const sections = [
    {
      h: "What we collect",
      p: "When you use the enquiry, estimate or Leak Scan forms we collect the details you type in: name, email, WhatsApp number, business name, website and your message. The estimate form also records the options you selected and the indicative band shown to you.",
    },
    {
      h: "How it is sent",
      p: "Form submissions are processed by Netlify Forms, our hosting provider. When you choose WhatsApp, your enquiry text opens in WhatsApp (Meta) so you can send it to us directly. We only receive what you choose to send.",
    },
    {
      h: "On your device",
      p: "To save you retyping, your contact details are stored in your own browser (localStorage, key “skerp-contact-draft”). They never leave your device unless you submit a form. Clear your browser storage to remove them.",
    },
    {
      h: "How we use it",
      p: "Only to reply to your enquiry, prepare a Leak Scan, estimate or proposal, and deliver work you agree to. We do not sell your information. We process personal information in line with South Africa's Protection of Personal Information Act (POPIA).",
    },
    {
      h: "Your rights",
      p: "You may ask what we hold about you, ask us to correct it, or ask us to delete it. Contact us and we will respond promptly.",
    },
  ];
  return (
    <PageShell title="Privacy | Skerp Studio">
      <div className="pad-x mx-auto max-w-[980px] pb-28 pt-20">
        <span className="micro text-copper">PRIVACY</span>
        <h1 className="page-title display mt-6 text-[clamp(56px,9vw,130px)]">
          <SplitWords text="Your details," />
          <br />
          <em>
            <SplitWords text="handled straight." />
          </em>
        </h1>
        <div className="mt-16 divide-y divide-line border-y border-line">
          {sections.map((s) => (
            <section key={s.h} className="reveal-up grid gap-3 py-8 md:grid-cols-[220px_1fr]">
              <h2 className="micro pt-1 text-cream">{s.h}</h2>
              <p className="leading-relaxed text-muted">{s.p}</p>
            </section>
          ))}
        </div>
        <p className="reveal-up mt-10 text-muted">
          Questions? Email{" "}
          <a className="text-cream underline underline-offset-4" href={`mailto:${EMAIL}`}>
            {EMAIL}
          </a>{" "}
          or WhatsApp{" "}
          <a className="text-cream underline underline-offset-4" href={whatsappHref()} target="_blank" rel="noopener noreferrer">
            {WHATSAPP_DISPLAY}
          </a>
          .
        </p>
      </div>
    </PageShell>
  );
}
