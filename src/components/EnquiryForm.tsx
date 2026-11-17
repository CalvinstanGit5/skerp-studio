import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  DEFAULT_WA_MESSAGE,
  EMAIL,
  SERVICE_OPTIONS,
  WHATSAPP_DISPLAY,
  enquiryTemplate,
  readDraft,
  submitNetlifyForm,
  whatsappHref,
} from "@/lib/contact";
import { Arrow } from "@/components/ui";

/** The one project / leak-scan / call enquiry form. Always shown inside a popup. */
export function EnquiryForm({ initialService = "Not Sure", initialMessage }: { initialService?: string; initialMessage?: string }) {
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const [service, setService] = useState(initialService);
  const [message, setMessage] = useState(initialMessage ?? enquiryTemplate(initialService));
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ text: string; fallback?: string } | null>(null);
  const [draft] = useState(() => readDraft());
  const waMessage = message.trim() ? message : DEFAULT_WA_MESSAGE;
  const isScan = service === "Free Leak Scan";

  useEffect(() => {
    const t = window.setTimeout(() => {
      const first = document.querySelector<HTMLInputElement>(".enquiry-form input[name='name']");
      (first && !first.value ? first : messageRef.current)?.focus({ preventScroll: true });
    }, 120);
    return () => window.clearTimeout(t);
  }, []);

  const changeService = (next: string) => {
    if (!message.trim() || message === enquiryTemplate(service)) setMessage(enquiryTemplate(next));
    setService(next);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const v = {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      business: String(fd.get("business") || "Not provided"),
      service: String(fd.get("service") || "Not Sure"),
      website: String(fd.get("website") || ""),
      message: String(fd.get("message") || ""),
    };
    const text = [
      `Name: ${v.name}`,
      `Email: ${v.email}`,
      `Business: ${v.business}`,
      ...(v.website ? [`Website: ${v.website}`] : []),
      `What do you need?: ${v.service}`,
      "",
      "Message:",
      v.message,
    ].join("\n");
    setSending(true);
    setStatus(null);
    try {
      await submitNetlifyForm({ "form-name": "enquiry", ...v, _subject: `Skerp Studio enquiry: ${v.service}`, channel: "enquiry", submitted_at: new Date().toISOString() });
    } catch {
      /* WhatsApp hand-off below still delivers the enquiry */
    }
    const win = window.open(whatsappHref(text), "_blank", "noopener,noreferrer");
    setStatus({
      text: "Thanks. WhatsApp is opening with your enquiry so we receive it straight away. We will reply as soon as we can.",
      fallback: win ? undefined : whatsappHref(text),
    });
    setSending(false);
  };

  return (
    <form name="enquiry" method="POST" data-netlify="true" data-netlify-honeypot="bot-field" onSubmit={onSubmit} aria-busy={sending} className="enquiry-form">
      <input type="hidden" name="form-name" value="enquiry" />
      <p className="visually-hidden">
        <label>
          Leave blank <input name="bot-field" tabIndex={-1} autoComplete="off" />
        </label>
      </p>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="field">
          Name
          <input name="name" type="text" required autoComplete="name" defaultValue={draft.name || ""} />
        </label>
        <label className="field">
          Email
          <input name="email" type="email" required autoComplete="email" defaultValue={draft.email || ""} />
        </label>
        <label className="field">
          Business{isScan ? " *" : ""}
          <input name="business" type="text" required={isScan} autoComplete="organization" defaultValue={draft.business || ""} />
        </label>
        <label className="field">
          Website or Facebook page{isScan ? " *" : ""}
          <input name="website" type="text" inputMode="url" required={isScan} placeholder="example.co.za" defaultValue={draft.website || ""} />
        </label>
        <label className="field md:col-span-2">
          What do you need?
          <select name="service" required value={service} onChange={(e) => changeService(e.target.value)}>
            {[...SERVICE_OPTIONS, ...(SERVICE_OPTIONS.includes(service) ? [] : [service])].map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
        <label className="field md:col-span-2">
          Message
          <textarea ref={messageRef} name="message" required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="What are you looking for?" rows={7} />
        </label>
      </div>
      <div className="mt-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <button type="submit" className="btn btn-copper">
          {sending ? "SENDING..." : "SEND ON WHATSAPP"} <Arrow diagonal />
        </button>
        <p className="max-w-md text-xs leading-relaxed text-dim">
          One click sends your enquiry on WhatsApp so we get it straight away. Prefer to chat first?{" "}
          <a className="text-cream underline underline-offset-4" href={whatsappHref(waMessage)} target="_blank" rel="noopener noreferrer">
            {WHATSAPP_DISPLAY}
          </a>{" "}
          ·{" "}
          <a className="text-cream underline underline-offset-4" href={`mailto:${EMAIL}`}>
            {EMAIL}
          </a>
        </p>
      </div>
      {status ? (
        <p role="status" className="mt-5 border-l-2 border-ok pl-4 text-sm text-cream/90">
          {status.text}{" "}
          {status.fallback ? (
            <a href={status.fallback} target="_blank" rel="noopener noreferrer" className="text-ok underline">
              Open WhatsApp
            </a>
          ) : null}
        </p>
      ) : null}
    </form>
  );
}
