/* ------------------------------------------------------------------
 * Skerp Studio pricing model — ported 1:1 from the live site (PM-1.1).
 * Do not change numbers here without updating the written proposals.
 * ------------------------------------------------------------------ */

export const PRICING_MODEL_VERSION = "PM-1.1";

export type TierId = "Start" | "Flow" | "Business" | "Custom";
export type Currency = "ZAR" | "USD" | "EUR" | "GBP" | "AUD";
export const CURRENCIES: Currency[] = ["ZAR", "USD", "EUR", "GBP", "AUD"];

export const TIERS: Record<TierId, { setup: [number, number]; monthly: [number, number]; monthlyNote?: string }> = {
  Start: { setup: [1500, 3000], monthly: [399, 399] },
  Flow: { setup: [4000, 8000], monthly: [799, 799] },
  Business: { setup: [7500, 15000], monthly: [1499, 1499] },
  Custom: { setup: [15000, 100000], monthly: [2500, 2500] },
};

export const CUSTOM_TIERS: { name: string; from: number; suffix?: string; scope: string[] }[] = [
  { name: "Custom Site", from: 15000, scope: ["Bespoke multi-page website", "Lead capture and enquiry flow", "Responsive launch and domain handoff"] },
  { name: "Custom + Light automation", from: 25000, scope: ["Custom website", "1–2 automations for repetitive admin", "Connect key tools and test handoffs"] },
  { name: "Custom Systems", from: 45000, scope: ["Connected multi-step workflows", "Several automations and integrations", "Testing, handover and launch"] },
  { name: "Custom Platform", from: 70000, suffix: "+", scope: ["Custom platform, portal or multi-system build", "Complex workflows and data handoffs", "Staged scope confirmed by Deep Audit"] },
];

export const INCLUDED: Record<TierId, { monthly: number; smallChanges: string }> = {
  Start: { monthly: TIERS.Start.monthly[0], smallChanges: "one tiny monthly fix" },
  Flow: { monthly: TIERS.Flow.monthly[0], smallChanges: "one small monthly fix" },
  Business: { monthly: TIERS.Business.monthly[0], smallChanges: "up to 2 small monthly fixes" },
  Custom: { monthly: TIERS.Custom.monthly[0], smallChanges: "up to 2 small monthly fixes" },
};

export const CHANGE_BUNDLES = [
  { id: "ad_hoc", name: "Ad-hoc", changes: "1–4", price: 180, priceUnit: "per change", validityDays: 90 },
  { id: "s5", name: "Top-up S5", changes: 5, price: 750, priceUnit: "bundle", validityDays: 90 },
  { id: "m10", name: "Top-up M10", changes: 10, price: 1300, priceUnit: "bundle", validityDays: 90 },
  { id: "l20", name: "Top-up L20", changes: 20, price: 2200, priceUnit: "bundle", validityDays: 90 },
  { id: "xl50", name: "Top-up XL50", changes: 50, price: 4500, priceUnit: "bundle", validityDays: 90 },
  { id: "annual_pool99", name: "Annual pool 99", changes: 99, price: 7500, priceUnit: "per year", validityDays: 90 },
] as const;

export const DISBURSEMENTS = {
  domainWithOneYearAndAdmin: 199,
  paymentsProviderSetupWithAdmin: 299,
  thirdParty: { adminMinimum: 100 },
};

export const MARKETING_RATES = [
  { id: "meta_ads", name: "Meta Ads management", short: "Meta Ads", clientRate: 4000, nonClientRate: 5000, inHouse: true },
  { id: "google_ads", name: "Google Ads management", short: "Google Ads", clientRate: 4000, nonClientRate: 5000, inHouse: true },
  { id: "meta_google_bundle", name: "Meta + Google bundle", short: "Meta + Google Ads", clientRate: 7500, nonClientRate: 9000, inHouse: true },
];
export const MARKETING_SPEND_PERCENT = 12;
export const DEEP_AUDIT_PRICE = 3500;

/* ------------------------- Packages content ------------------------- */
export interface PackageInfo {
  id: TierId;
  name: string;
  forWho: string;
  problem: string;
  includes: string[];
  examples: string;
  excludes?: string;
}

export const PACKAGES: PackageInfo[] = [
  {
    id: "Start",
    name: "Skerp Start",
    forWho: "Sole traders and local services that need a sharp digital home and clear enquiries.",
    problem: "The business is hard to find, or a potential customer cannot quickly work out how to get in touch.",
    includes: [
      "A focused, mobile-ready website for the pages customers need first",
      "Clear calls to action and a straightforward enquiry route",
      "Basic search foundations to help customers find the business",
      "A considered visual front door that makes the next step clear",
    ],
    examples: "Trades, tutors, consultants, small local shops.",
  },
  {
    id: "Flow",
    name: "Skerp Flow",
    forWho: "Businesses that already get enquiries and need the next step to run without friction.",
    problem: "Enquiries stall after the first message because follow-up, booking or handoffs are manual.",
    includes: [
      "A clear website path from first visit to enquiry",
      "A practical WhatsApp or email follow-up flow",
      "Simple booking or EFT / invoice steps where needed",
      "Automation for agreed, repetitive admin tasks",
    ],
    examples: "Salons, clinics, hospitality, service teams.",
  },
  {
    id: "Business",
    name: "Skerp Business",
    forWho: "Growing SMEs that need systems, not only a site.",
    problem: "Leads, customer details and admin work are spread across disconnected tools.",
    includes: [
      "A conversion-focused site structure shaped around your business",
      "A CRM or structured customer list to track enquiries",
      "Multi-step forms, booking or payment flows where required",
      "Connected workflows between agreed business tools",
    ],
    examples: "Established service businesses, multi-staff operations.",
  },
  {
    id: "Custom",
    name: "Skerp Custom",
    forWho: "Site, automation, or both — scoped after audit; from R15,000.",
    problem: "Some businesses need joined-up systems, several automations or a bespoke digital product — not just a website.",
    includes: [
      "A tailored website, workflow system or both",
      "Deeper integrations and data handling where the scope needs them",
      "Automation or AI assistance where it removes real work",
      "A fixed, written scope confirmed after the Deep Audit",
    ],
    examples: "Specialist firms, multi-location, heavier digital operations and automation builds.",
    excludes: "Open-ended enterprise platforms outside agreed scope.",
  },
];

/* ------------------------- Currency helpers ------------------------- */
const FX: Record<Exclude<Currency, "ZAR">, number> = { USD: 16.4, EUR: 18.5, GBP: 21.7, AUD: 11.5 };

/** Converts a rand amount into a rounded foreign amount (same rounding steps as the live site). */
export function convert(amount: number, currency: Currency): number {
  if (currency === "ZAR") return amount;
  const value = amount / FX[currency];
  let step = 10;
  if (value >= 200) step = 25;
  if (value >= 500) step = 50;
  if (value >= 2000) step = 100;
  const rounded = Math.ceil(value / step) * step;
  return Math.max(rounded, Math.ceil(value));
}

export function formatMoney(amount: number, currency: Currency): string {
  if (currency === "ZAR") return `R${amount.toLocaleString("en-US")}`;
  if (currency === "USD") return `$${amount.toLocaleString("en-US")}`;
  if (currency === "EUR") return `€${amount.toLocaleString("en-IE")}`;
  if (currency === "GBP") return `£${amount.toLocaleString("en-GB")}`;
  return `A$${amount.toLocaleString("en-AU")}`;
}

/** Convert (if needed) + format. */
export function money(amount: number, currency: Currency): string {
  return formatMoney(currency === "ZAR" ? amount : convert(amount, currency), currency);
}

export function moneyRange(low: number, high: number, currency: Currency, plus = false): string {
  if (low === high) return money(low, currency);
  const suffix = plus ? "+" : "";
  if (currency === "ZAR") return `R${low.toLocaleString("en-US")}–R${high.toLocaleString("en-US")}${suffix}`;
  return `${formatMoney(convert(low, currency), currency)}–${formatMoney(convert(high, currency), currency)}${suffix}`;
}

export const deepAuditLabel = () => `R${DEEP_AUDIT_PRICE.toLocaleString("en-US")}`;

/* ------------------------- Estimate engine ------------------------- */
export interface EstimateInputs {
  businessType: string;
  siteStatus: "none" | "new" | "existing-minor" | "existing-rework";
  pages: "1-3" | "4-6" | "7-12" | "13-25" | "25+";
  design: "template" | "customised" | "custom" | "premium";
  forms: "none" | "contact" | "multi" | "upload";
  booking: "none" | "simple" | "advanced";
  payments: "none" | "link" | "shop";
  crm: "none" | "list" | "pipeline" | "custom-db";
  whatsapp: boolean;
  emailComms: boolean;
  automations: "none" | "1-2" | "3-5" | "6+";
  ai: "none" | "assist" | "agent";
  integrations: "none" | "1-2" | "3+";
  portal: boolean;
  dashboard: boolean;
  recurring: boolean;
  seo: boolean;
  analytics: boolean;
}

export const DEFAULT_ESTIMATE_INPUTS: EstimateInputs = {
  businessType: "",
  siteStatus: "new",
  pages: "1-3",
  design: "customised",
  forms: "contact",
  booking: "none",
  payments: "none",
  crm: "none",
  whatsapp: true,
  emailComms: false,
  automations: "none",
  ai: "none",
  integrations: "none",
  portal: false,
  dashboard: false,
  recurring: false,
  seo: true,
  analytics: false,
};

const cap = (v: number, max: number) => Math.min(v, max);

function score(f: EstimateInputs) {
  let a = 0;
  if (f.siteStatus === "existing-minor") a += 1;
  else if (f.siteStatus === "existing-rework") a += 3;
  else if (f.siteStatus === "new" || f.siteStatus === "none") a += 2;
  a += { "1-3": 1, "4-6": 2, "7-12": 4, "13-25": 6, "25+": 7 }[f.pages];
  a += { template: 0, customised: 2, custom: 5, premium: 8 }[f.design];
  a = cap(a, 15);

  let b = 0;
  if (f.forms === "contact") b += 1;
  else if (f.forms === "multi") b += 3;
  else if (f.forms === "upload") b += 4;
  if (f.booking === "simple") b += 3;
  else if (f.booking === "advanced") b += 6;
  if (f.payments === "link") b += 3;
  else if (f.payments === "shop") b += 6;
  b = cap(b, 10);

  let c = 0;
  if (f.crm === "list") c = 2;
  else if (f.crm === "pipeline") c = 5;
  else if (f.crm === "custom-db") c = 8;
  c = cap(c, 12);

  let d = 0;
  if (f.whatsapp) d += 4;
  if (f.emailComms) d += 3;
  d = cap(d, 10);

  let e = 0;
  if (f.automations === "1-2") e = 6;
  else if (f.automations === "3-5") e = 12;
  else if (f.automations === "6+") e = 18;
  e = cap(e, 20);

  let ai = 0;
  if (f.ai === "assist") ai = 5;
  else if (f.ai === "agent") ai = 11;
  ai = cap(ai, 13);

  let g = 0;
  if (f.integrations === "1-2") g = 4;
  else if (f.integrations === "3+") g = 9;
  g = cap(g, 12);

  let h = 0;
  if (f.portal) h += 3;
  if (f.dashboard) h += 2;
  if (f.recurring) h += 2;
  if (f.seo || f.analytics) h += 1;
  h = cap(h, 8);

  return { scs: a + b + c + d + e + ai + g + h, engine: e + ai + g };
}

function levelFor(scs: number, engine: number): TierId {
  return engine >= 28 || (engine >= 20 && scs >= 55) || scs >= 55 || engine >= 18
    ? "Custom"
    : scs >= 35
      ? "Business"
      : scs >= 18
        ? "Flow"
        : "Start";
}

function driversFor(f: EstimateInputs): string[] {
  const p: string[] = [];
  if (f.siteStatus === "new" || f.siteStatus === "none") p.push("New or rebuilt web presence");
  else if (f.siteStatus === "existing-rework") p.push("Existing site needs meaningful rework");
  if (f.design === "custom" || f.design === "premium") p.push("Custom design");
  if (f.pages === "13-25" || f.pages === "25+") p.push("Larger site structure");
  if (f.booking !== "none") p.push("Booking / scheduling");
  if (f.payments !== "none") p.push("Payments");
  if (f.crm === "pipeline" || f.crm === "custom-db") p.push("Customer data / CRM");
  if (f.whatsapp) p.push("WhatsApp communication");
  if (f.automations !== "none") p.push("Workflow automation");
  if (f.ai !== "none") p.push("AI assistance");
  if (f.integrations !== "none") p.push("System integrations");
  if (f.portal) p.push("Customer accounts / portal");
  if (f.dashboard) p.push("Reporting / dashboards");
  if (p.length === 0) p.push("Focused web and enquiry setup");
  return p.slice(0, 6);
}

/** Position inside a band (same maths as the live site, incl. rounding to R50). */
function band(low: number, high: number, scs: number): [number, number] {
  const m = Math.min(1, Math.max(0, (scs - 10) / 70));
  const mid = low + (high - low) * (0.25 + m * 0.5);
  const spread = (high - low) * 0.2;
  return [Math.round((mid - spread) / 50) * 50, Math.round((mid + spread) / 50) * 50];
}

export interface Estimate {
  level: TierId;
  setupLow: number;
  setupHigh: number;
  monthlyLow: number;
  monthlyHigh: number;
  monthlyNote?: string;
  drivers: string[];
  pricingModelVersion: string;
  automationBuildRequired: boolean;
}

export function buildEstimate(f: EstimateInputs): Estimate {
  const { scs, engine } = score(f);
  const level = levelFor(scs, engine);
  const tier = TIERS[level];
  const [sLow, sHigh] = band(tier.setup[0], tier.setup[1], scs);
  // Note: the live model rounds fixed monthly amounts to the nearest R50 too (e.g. R399 → R400).
  const [mLow, mHigh] = band(tier.monthly[0], tier.monthly[1], scs);
  return {
    level,
    setupLow: Math.max(tier.setup[0], sLow),
    setupHigh: Math.min(tier.setup[1], Math.max(sHigh, sLow + (tier.setup[0] === tier.setup[1] ? 0 : 500))),
    monthlyLow: mLow,
    monthlyHigh: tier.monthly[0] === tier.monthly[1] ? mLow : Math.max(mHigh, mLow + 50),
    monthlyNote: tier.monthlyNote,
    drivers: driversFor(f),
    pricingModelVersion: PRICING_MODEL_VERSION,
    automationBuildRequired: engine >= 28 || (engine >= 20 && scs >= 55),
  };
}

export const setupLabel = (e: Estimate, c: Currency) => moneyRange(e.setupLow, e.setupHigh, c);

export function monthlyLabel(e: Estimate, c: Currency): string {
  if (e.monthlyNote) return e.monthlyNote;
  if (e.monthlyLow === e.monthlyHigh) return `${money(e.monthlyLow, c)}/month`;
  const plus = e.monthlyHigh >= 7500;
  if (c === "ZAR")
    return `R${e.monthlyLow.toLocaleString("en-ZA")}–R${e.monthlyHigh.toLocaleString("en-ZA")}${plus ? "+" : ""}/month`;
  return `${moneyRange(e.monthlyLow, e.monthlyHigh, c, plus)}/month`;
}

/* ------------------------- Estimate form schema ------------------------- */
export const ESTIMATE_SELECTS: { key: keyof EstimateInputs; label: string; options: { value: string; label: string }[] }[] = [
  { key: "siteStatus", label: "Website situation", options: [
    { value: "none", label: "No website yet" }, { value: "new", label: "Need a new website" },
    { value: "existing-minor", label: "Existing site — small changes" }, { value: "existing-rework", label: "Existing site — needs rework" } ] },
  { key: "pages", label: "Rough page count", options: [
    { value: "1-3", label: "1–3 pages" }, { value: "4-6", label: "4–6 pages" }, { value: "7-12", label: "7–12 pages" },
    { value: "13-25", label: "13–25 pages" }, { value: "25+", label: "25+ pages" } ] },
  { key: "design", label: "Design level", options: [
    { value: "template", label: "Template" }, { value: "customised", label: "Customised template" },
    { value: "custom", label: "Custom design" }, { value: "premium", label: "Premium / highly interactive" } ] },
  { key: "forms", label: "Forms", options: [
    { value: "none", label: "None" }, { value: "contact", label: "Simple contact form" },
    { value: "multi", label: "Multi-step or quote form" }, { value: "upload", label: "Forms with file upload" } ] },
  { key: "booking", label: "Booking", options: [
    { value: "none", label: "Not needed" }, { value: "simple", label: "Simple booking" },
    { value: "advanced", label: "Advanced (staff, deposits, locations)" } ] },
  { key: "payments", label: "EFT payments", options: [
    { value: "none", label: "Not needed" }, { value: "link", label: "EFT / invoice workflow" } ] },
  { key: "crm", label: "Customer data", options: [
    { value: "none", label: "None yet" }, { value: "list", label: "Simple lead list" },
    { value: "pipeline", label: "CRM pipeline" }, { value: "custom-db", label: "Custom database" } ] },
  { key: "automations", label: "Automations", options: [
    { value: "none", label: "None" }, { value: "1-2", label: "1–2 workflows" },
    { value: "3-5", label: "3–5 workflows" }, { value: "6+", label: "6+ workflows" } ] },
  { key: "ai", label: "AI assistance", options: [
    { value: "none", label: "Not needed" }, { value: "assist", label: "Drafting / FAQ / classification" },
    { value: "agent", label: "AI or voice agent in the flow" } ] },
  { key: "integrations", label: "Integrations", options: [
    { value: "none", label: "None" }, { value: "1-2", label: "1–2 systems" }, { value: "3+", label: "3 or more systems" } ] },
];

export const ESTIMATE_TOGGLES: { key: keyof EstimateInputs; label: string }[] = [
  { key: "whatsapp", label: "WhatsApp communication" },
  { key: "emailComms", label: "Email follow-up sequences" },
  { key: "portal", label: "Customer accounts / portal" },
  { key: "dashboard", label: "Reporting / dashboards" },
  { key: "recurring", label: "Recurring payments" },
  { key: "seo", label: "SEO foundations" },
  { key: "analytics", label: "Analytics setup" },
];

/* ------------------------------------------------------------------
 * "Get quote" presets: open the estimate already shaped like each package
 * (PM-1.1). The client can still change every answer.
 * ------------------------------------------------------------------ */
export const PACKAGE_PRESETS: Record<TierId, EstimateInputs> = {
  Start: { ...DEFAULT_ESTIMATE_INPUTS },
  Flow: {
    ...DEFAULT_ESTIMATE_INPUTS,
    pages: "4-6",
    design: "custom",
    forms: "multi",
    booking: "simple",
    payments: "link",
    crm: "list",
    emailComms: true,
    automations: "1-2",
  },
  Business: {
    ...DEFAULT_ESTIMATE_INPUTS,
    pages: "7-12",
    design: "custom",
    forms: "multi",
    booking: "simple",
    payments: "link",
    crm: "pipeline",
    emailComms: true,
    automations: "3-5",
    integrations: "1-2",
    dashboard: true,
    analytics: true,
  },
  Custom: {
    ...DEFAULT_ESTIMATE_INPUTS,
    pages: "13-25",
    design: "premium",
    forms: "upload",
    booking: "advanced",
    payments: "shop",
    crm: "custom-db",
    emailComms: true,
    automations: "6+",
    ai: "assist",
    integrations: "3+",
    portal: true,
    dashboard: true,
    analytics: true,
  },
};
