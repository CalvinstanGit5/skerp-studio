import { EMAIL, WHATSAPP_DISPLAY, whatsappHref } from "@/lib/contact";
import { TAGLINE } from "@/data/site";

export function Footer({ onLanding = true }: { onLanding?: boolean }) {
  const fix = (href: string) => (onLanding || !href.startsWith("#") ? href : `/${href}`);
  const explore = [
    { label: "Business impact", href: "/impact" },
    { label: "Work", href: "/work" },
    { label: "Automation", href: "/automation" },
    { label: "Packages", href: "/packages" },
    { label: "Marketing", href: "/marketing" },
    { label: "Estimate", href: "/estimate" },
    { label: "Free leak scan", href: "/start" },
    { label: "FAQ", href: "/start#faq" },
    { label: "About", href: "/about" },
  ];
  return (
    <footer className="pad-x relative border-t border-line bg-ink pb-8 pt-20">
      <div className="flex flex-col justify-between gap-14 pb-20 lg:flex-row">
        <div>
          <a href={fix("#top")} className="display block text-[clamp(48px,6vw,92px)]">
            SKERP STUDIO<span className="text-copper">.</span>
          </a>
          <p className="mt-5 text-muted">
            {TAGLINE}
            <br />
            Websites. Audits. Automation.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-12 sm:gap-20">
          <div className="flex flex-col gap-3">
            <span className="micro mb-2 text-dim">EXPLORE</span>
            {explore.map((l) => (
              <a key={l.label} href={fix(l.href)} className="text-sm text-cream/80 transition-colors hover:text-peach">
                {l.label}
              </a>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <span className="micro mb-2 text-dim">GET IN TOUCH</span>
            <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="text-sm text-cream/80 hover:text-peach">
              WhatsApp {WHATSAPP_DISPLAY}
            </a>
            <a href={`mailto:${EMAIL}`} className="break-all text-sm text-cream/80 hover:text-peach">
              {EMAIL}
            </a>
            <a href="/privacy" className="text-sm text-cream/80 hover:text-peach">
              Privacy
            </a>
          </div>
        </div>
      </div>
      <div className="micro flex flex-col gap-3 border-t border-line pt-6 text-dim md:flex-row md:items-center md:justify-between">
        <span>© {new Date().getFullYear()} SKERP STUDIO. ALL RIGHTS RESERVED.</span>
        <span>MADE WITH PRECISION IN SOUTH AFRICA.</span>
        <span className="flex gap-6">
          <a href="/privacy" className="hover:text-cream">
            PRIVACY
          </a>
          <a href={fix("#top")} className="hover:text-cream">
            BACK TO TOP ↑
          </a>
        </span>
      </div>
    </footer>
  );
}
