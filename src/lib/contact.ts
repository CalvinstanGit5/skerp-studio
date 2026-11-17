/* Contact + lead plumbing — preserved from the live site. */

export const WHATSAPP_DISPLAY = "072 574 2448";
export const WHATSAPP_NUMBER = "27725742448".replace(/\D/g, "");
export const EMAIL = "calvinmarais@gmail.com";
export const DEFAULT_WA_MESSAGE = "Hi Skerp Studio, I'd like to discuss a project.";
export const MARKETING_WA_MESSAGE = "Hi Skerp Studio, I would like to discuss marketing.";

export const whatsappHref = (message?: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent((message && message.trim()) || DEFAULT_WA_MESSAGE)}`;

export const SERVICE_OPTIONS = [
  "Skerp Start",
  "Skerp Flow",
  "Skerp Business",
  "Skerp Custom",
  "Free Leak Scan",
  "30-minute video call",
  "Marketing",
  "Website",
  "Website Audit",
  "Automation",
  "Not Sure",
];

export const enquiryTemplate = (service: string) =>
  !service || service === "Not Sure"
    ? ""
    : ["Good day, Skerp team.", "", `I would like to enquire about ${service}.`, "", "Message:", "", "Quote: (optional — from the online estimate if you have one)"].join("\n");

/* ---------------- Draft storage (pre-fills forms across visits) ---------------- */
const DRAFT_KEY = "skerp-contact-draft";
export type Draft = Partial<Record<"name" | "email" | "business" | "whatsapp" | "website", string>>;

export function readDraft(): Draft {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveDraft(values: Draft) {
  try {
    const next: Draft = { ...readDraft() };
    (Object.keys(values) as (keyof Draft)[]).forEach((k) => {
      const v = (values[k] || "").trim();
      if (v) next[k] = v;
    });
    localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable */
  }
}

/* ---------------- Netlify Forms submission ---------------- */
export async function submitNetlifyForm(fields: Record<string, string>) {
  saveDraft({ name: fields.name, email: fields.email, business: fields.business, whatsapp: fields.whatsapp, website: fields.website });
  const res = await fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(fields).toString(),
  });
  if (!res.ok) throw new Error("Form host rejected the submission");
}

/* ---------------- Contact event bus ----------------
 * Any component can open + prefill the enquiry form at the bottom of the landing page:
 *   openContact({ service: "Free Leak Scan", message: "...", openForm: true })
 */
export interface ContactDetail {
  service?: string;
  message?: string;
  openForm?: boolean;
}

export function openContact(detail: ContactDetail) {
  window.dispatchEvent(new CustomEvent<ContactDetail>("skerp-contact", { detail }));
}

export const LEAK_SCAN_MESSAGE = [
  "Good day, Skerp team.",
  "",
  "I would like a Free Leak Scan (public evidence look — no locked price).",
  "",
  "Message:",
  "",
  "Website / social links:",
  "What feels stuck:",
].join("\n");

export const VIDEO_CALL_MESSAGE = [
  "Good day, Skerp team.",
  "",
  "I would like to book a 30-minute video call.",
  "",
  "Message:",
  "",
  "A few suitable days / times:",
  "What I would like to discuss:",
].join("\n");

export const DEEP_AUDIT_MESSAGE = [
  "Good day, Skerp team.",
  "",
  "I would like to enquire about a Deep Audit (Business / Custom).",
  "",
  "Message:",
  "",
  "Quote: (optional — from the online estimate if you have one)",
].join("\n");
