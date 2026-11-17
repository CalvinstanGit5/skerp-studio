import { useMemo, useState, type FormEvent } from "react";
import {
  DEFAULT_ESTIMATE_INPUTS,
  ESTIMATE_SELECTS,
  ESTIMATE_TOGGLES,
  buildEstimate,
  monthlyLabel,
  setupLabel,
  type Estimate,
  type EstimateInputs,
} from "@/lib/pricing";
import { CurrencyToggle, useCurrency } from "@/lib/currency";
import { WHATSAPP_NUMBER, openContact, readDraft, saveDraft, submitNetlifyForm } from "@/lib/contact";
import { Arrow } from "@/components/ui";
import { TAGLINE } from "@/data/site";

type Step = "needs" | "details" | "result";

export function EstimateCalculator({ onClose, preset, presetLabel }: { onClose: () => void; preset?: EstimateInputs; presetLabel?: string }) {
  const { currency } = useCurrency();
  const [inputs, setInputs] = useState<EstimateInputs>(preset ?? DEFAULT_ESTIMATE_INPUTS);
  const [step, setStep] = useState<Step>("needs");
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const [lead, setLead] = useState(() => {
    const d = readDraft();
    return { name: d.name || "", business: d.business || "", whatsapp: d.whatsapp || "", email: d.email || "", website: d.website || "", message: "" };
  });

  const set = <K extends keyof EstimateInputs>(key: K, value: EstimateInputs[K]) => setInputs((p) => ({ ...p, [key]: value }));

  const requirements = useMemo(() => {
    const r: string[] = [];
    if (inputs.businessType) r.push(`Business type: ${inputs.businessType}`);
    r.push(`Site: ${inputs.siteStatus}`, `Pages: ${inputs.pages}`, `Design: ${inputs.design}`);
    if (inputs.forms !== "none") r.push(`Forms: ${inputs.forms}`);
    if (inputs.booking !== "none") r.push(`Booking: ${inputs.booking}`);
    if (inputs.payments !== "none") r.push(`Payments: ${inputs.payments}`);
    if (inputs.crm !== "none") r.push(`Customer data: ${inputs.crm}`);
    if (inputs.automations !== "none") r.push(`Automations: ${inputs.automations}`);
    if (inputs.ai !== "none") r.push(`AI: ${inputs.ai}`);
    if (inputs.integrations !== "none") r.push(`Integrations: ${inputs.integrations}`);
    ESTIMATE_TOGGLES.forEach(({ key, label }) => inputs[key] === true && r.push(label));
    return r;
  }, [inputs]);

  const scrollPanelTop = () =>
    window.setTimeout(() => document.querySelector(".modal-scroll")?.scrollTo({ top: 0, behavior: "smooth" }), 40);

  const toDetails = () => {
    try {
      setEstimate(buildEstimate(inputs));
      setStep("details");
      scrollPanelTop();
    } catch (err) {
      console.error(err);
      setStatus("Something went wrong building the estimate. Please try again or contact us.");
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    saveDraft(lead);
    const est = estimate ?? buildEstimate(inputs);
    setEstimate(est);
    setStep("result");
    setSending(true);
    setStatus("");
    scrollPanelTop();
    const validUntil = new Date(Date.now() + 1440 * 60 * 1000);
    try {
      await submitNetlifyForm({
        "form-name": "estimate",
        name: lead.name,
        business: lead.business,
        whatsapp: lead.whatsapp,
        email: lead.email,
        website: lead.website || "Not provided",
        message: lead.message || "Estimate request",
        service: `Estimate · Skerp ${est.level}`,
        channel: "estimate",
        level: est.level,
        setup_range: setupLabel(est, currency),
        monthly_range: monthlyLabel(est, currency),
        currency,
        valid_until: validUntil.toISOString(),
        drivers: est.drivers.join("; "),
        requirements: requirements.join(" | "),
        pricing_model_version: est.pricingModelVersion,
        automation_build_required: est.automationBuildRequired ? "true" : "false",
        quote_summary: [
          `Level: Skerp ${est.level}`,
          `Setup: ${setupLabel(est, currency)}`,
          `Monthly: ${monthlyLabel(est, currency)}`,
          `Currency: ${currency}`,
          `Valid until: ${validUntil.toLocaleString("en-ZA")}`,
        ].join(" | "),
        _subject: `Skerp estimate: ${lead.business || lead.name} · ${est.level}`,
      });
      setStatus("Your estimate is ready below. Skerp also received your details by form.");
    } catch {
      setStatus("Your estimate is ready below. Prefer WhatsApp or Enquire to send it to Skerp.");
    } finally {
      setSending(false);
    }
  };

  const quoteMessage = (service: string) => {
    const q = estimate
      ? [
          `Quote (valid 24 hours · ${currency}):`,
          `Level: Skerp ${estimate.level}`,
          `Setup: ${setupLabel(estimate, currency)}`,
          `Monthly: ${monthlyLabel(estimate, currency)}`,
          `Drivers: ${estimate.drivers.join("; ") || "n/a"}`,
        ].join("\n")
      : "Quote: (optional — from the online estimate if you have one)";
    return ["Good day, Skerp team.", "", `I would like to enquire about ${service}.`, "", "Message:", "", q].join("\n");
  };

  const enquire = (service: string) => {
    onClose();
    window.setTimeout(() => openContact({ service, message: quoteMessage(service), openForm: true }), 80);
  };

  const whatsappEstimate = () => {
    if (!estimate) return;
    const msg = quoteMessage(`my project estimate (Skerp ${estimate.level})`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
  };

  const print = () => {
    document.body.classList.add("printing-estimate");
    window.print();
    window.setTimeout(() => document.body.classList.remove("printing-estimate"), 500);
  };

  return (
    <div>
      <div className="no-print mb-8 flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <p className="max-w-md text-sm text-muted">Answer a few questions to get an indicative price. Choose your currency.</p>
        <CurrencyToggle />
      </div>

      {/* Progress */}
      <ol className="no-print mb-8 grid grid-cols-3 gap-2">
        {(["needs", "details", "result"] as Step[]).map((s, i) => (
          <li key={s} className="micro">
            <span className={`block h-0.5 ${["needs", "details", "result"].indexOf(step) >= i ? "bg-copper" : "bg-line"}`} />
            <span className={`mt-2 block ${step === s ? "text-cream" : "text-dim"}`}>
              0{i + 1} · {s === "needs" ? "Requirements" : s === "details" ? "Your details" : "Estimate"}
            </span>
          </li>
        ))}
      </ol>

      {step === "needs" && presetLabel ? (
        <p className="mb-6 border-l-2 border-copper pl-4 text-sm text-cream/85">
          We've filled this in to match a typical <strong className="text-peach">{presetLabel}</strong> project. Change anything that doesn't fit your business, then see your estimate.
        </p>
      ) : null}
      {step === "needs" && (
        <div>
          <label className="field">
            Business type
            <input
              type="text"
              value={inputs.businessType}
              onChange={(e) => set("businessType", e.target.value)}
              placeholder="e.g. salon, tutor, security, retail"
              maxLength={80}
              data-autofocus
            />
          </label>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {ESTIMATE_SELECTS.map((s) => (
              <label key={s.key} className="field">
                {s.label}
                <select value={String(inputs[s.key])} onChange={(e) => set(s.key, e.target.value as never)}>
                  {s.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {ESTIMATE_TOGGLES.map((t) => (
              <label key={t.key} className="flex cursor-pointer items-center gap-3 border border-line px-4 py-3 text-sm transition-colors hover:border-line-strong">
                <input type="checkbox" checked={!!inputs[t.key]} onChange={(e) => set(t.key, e.target.checked as never)} className="h-4 w-4 accent-[#c07a52]" />
                <span>{t.label}</span>
              </label>
            ))}
          </div>
          <button type="button" className="btn btn-primary mt-8" onClick={toDetails}>
            CONTINUE TO YOUR DETAILS <Arrow diagonal />
          </button>
          <p className="mt-3 text-xs text-dim">Next step: your contact details. The estimate only appears after we can follow up.</p>
        </div>
      )}

      {step === "details" && estimate && (
        <form onSubmit={onSubmit}>
          <p className="mb-6 text-lg">
            Your selections point toward <strong className="text-peach">Skerp {estimate.level}</strong>. Confirm your details to unlock the estimate
            and so we can follow up.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="field">
              Name
              <input required name="name" autoComplete="name" value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} data-autofocus />
            </label>
            <label className="field">
              Business name
              <input required name="business" autoComplete="organization" value={lead.business} onChange={(e) => setLead({ ...lead, business: e.target.value })} />
            </label>
            <label className="field">
              WhatsApp
              <input required name="whatsapp" type="tel" autoComplete="tel" value={lead.whatsapp} onChange={(e) => setLead({ ...lead, whatsapp: e.target.value })} />
            </label>
            <label className="field">
              Email
              <input required name="email" type="email" autoComplete="email" value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} />
            </label>
            <label className="field">
              Website (optional)
              <input name="website" type="url" placeholder="https://" value={lead.website} onChange={(e) => setLead({ ...lead, website: e.target.value })} />
            </label>
            <label className="field sm:col-span-2">
              Message (optional)
              <textarea name="message" value={lead.message} onChange={(e) => setLead({ ...lead, message: e.target.value })} />
            </label>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-6">
            <button className="btn btn-primary" type="submit">
              {sending ? "SENDING..." : "SHOW MY ESTIMATE"} <Arrow diagonal />
            </button>
            <button type="button" className="link-u" onClick={() => setStep("needs")}>
              Back to requirements
            </button>
          </div>
          {status ? <p className="mt-4 text-sm text-muted">{status}</p> : null}
        </form>
      )}

      {step === "result" && estimate && (
        <div>
          <article className="estimate-sheet paper p-6 sm:p-10">
            <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[#c4c0b6] pb-6">
              <div>
                <strong className="display text-3xl">SKERP STUDIO</strong>
                <span className="mt-1 block text-sm italic text-[#5f6058]">{TAGLINE}</span>
              </div>
              <div className="text-right">
                <span className="micro">PROJECT ESTIMATE</span>
                <span className="mt-1 block text-sm">{new Date().toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
            </header>
            <p className="mt-5 text-xs leading-relaxed text-[#5f6058]">
              This document is an estimate only — not a quotation or contract. A quote names the tier, lists its scope, and fixes the total in writing. Final
              pricing follows confirmed scope (Deep Audit for Business and Custom).
            </p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <span className="micro">PREPARED FOR</span>
                <p className="mt-2 text-sm leading-relaxed">
                  {lead.name}
                  <br />
                  {lead.business}
                  <br />
                  {lead.whatsapp}
                  <br />
                  {lead.email}
                </p>
              </div>
              <div>
                <span className="micro">ESTIMATED LEVEL</span>
                <strong className="display mt-2 block text-5xl">Skerp {estimate.level}</strong>
                <p className="mt-3 text-base font-semibold">
                  Setup {setupLabel(estimate, currency)}
                  <br />
                  {monthlyLabel(estimate, currency)}
                </p>
                <p className="mt-2 text-xs text-[#77756d]">Valid for 24 hours · {currency} · not a final quote</p>
              </div>
            </div>
            <div className="mt-8 grid gap-6 border-t border-[#c4c0b6] pt-6 sm:grid-cols-2">
              <div>
                <span className="micro">WHAT DROVE THIS BAND</span>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {estimate.drivers.map((d) => (
                    <li key={d}>+ {d}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="micro">SELECTED REQUIREMENTS</span>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {requirements.map((r) => (
                    <li key={r}>— {r}</li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-8 border-t border-[#c4c0b6] pt-5 text-xs leading-relaxed text-[#5f6058]">
              This estimate is valid for 24 hours. Review it first, then enquire, print or email when you are ready. Business and Custom require a Deep Audit
              before final price. The written quote lists the tier, scope and fixed total. Builds use a 50% EFT deposit to start, with the balance due on
              delivery or go-live; banking details are provided on invoices only. Out-of-scope work is a change request or change bundle.
            </p>
          </article>

          <div className="no-print mt-6 flex flex-wrap gap-3">
            <button type="button" className="btn btn-primary" onClick={() => enquire(`Skerp ${estimate.level} (from my estimate)`)}>
              ENQUIRE ABOUT THIS ESTIMATE <Arrow diagonal />
            </button>
            <button type="button" className="btn btn-ghost" onClick={print}>
              PRINT ESTIMATE <Arrow diagonal />
            </button>
            <button type="button" className="btn btn-ghost" onClick={whatsappEstimate}>
              WHATSAPP THIS ESTIMATE <Arrow diagonal />
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => enquire("a Free Leak Scan (second opinion on my estimate)")}>
              FREE LEAK SCAN <Arrow diagonal />
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => enquire("a Deep Audit (required for this level)")}>
              BOOK SKERP AUDIT <Arrow diagonal />
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => enquire(`starting Skerp ${estimate.level} (deposit to confirm)`)}>
              START THIS PACKAGE <Arrow diagonal />
            </button>
          </div>
          {status ? <p className="no-print mt-4 text-sm text-muted">{status}</p> : null}
        </div>
      )}
    </div>
  );
}
