/* ------------------------------------------------------------------
 * Editable landing-page content. Everything here is real Skerp copy
 * (or short diagnostic lines derived from it).
 * ------------------------------------------------------------------ */
import eagle from "@/assets/eagle-hero.webp";

/** Hero image (eagle on the right; the reticle in Hero.tsx is locked to its eye). */
export const HERO_IMAGE = eagle;
export const HERO_IMAGE_ALT = "Close-up portrait of an eagle looking sharply ahead";
export const TAGLINE = "Skerper as dié, kry jy nie!";

export const NAV_LINKS = [
  { label: "Work", href: "/work" },
  { label: "Automation", href: "/automation" },
  { label: "Business impact", href: "/impact" },
  { label: "Packages", href: "/packages" },
  { label: "Marketing", href: "/marketing" },
  { label: "Estimate", href: "/estimate" },
  { label: "About", href: "/about" },
];

/** Chapter rail (right edge, desktop). `id` must match a section wrapper id. */
export const CHAPTERS = [
  { id: "top", label: "Entry" },
  { id: "leaks", label: "The leak" },
  { id: "work", label: "Work" },
  { id: "automation", label: "Automation" },
  { id: "services", label: "Impact" },
  { id: "pricing", label: "Packages" },
  { id: "contact", label: "Start" },
];

/* ---------------- 02 · The Problem — sticky diagnostic sequence ---------------- */
export const LEAKS = [
  { tag: "VISIBILITY", line: "Customers can't find you or figure out how to reach you.", note: "If they can't see a clear way in, they move on." },
  { tag: "SLOW RESPONSE", line: "Enquiries sit unread for hours or overnight.", note: "Warm leads cool fast. The faster competitor answers first." },
  { tag: "FOLLOW-UP", line: "Follow-ups live in someone's head.", note: "Nothing is tracked. Enquiries stall after the first message." },
  { tag: "MANUAL WORK", line: "Booking, quoting and invoicing still happen by hand.", note: "Every manual step is a place to drop the ball." },
  { tag: "SCATTERED INFO", line: "Leads and notes are scattered across tools and chats.", note: "Nothing connects. Context gets lost." },
  { tag: "HIDDEN ADMIN", line: "Your team retypes the same admin every week.", note: "Hours disappear into work a system could do." },
];

/* ---------------- 03 · Selected work (live links) ---------------- */
export const PROJECTS = [
  {
    name: "Agri-Edge Precision SA",
    url: "https://mellow-belekoy-f878dc.netlify.app/",
    sector: "Precision agriculture",
    discipline: "WEBSITE · DESIGN & DEVELOPMENT",
  },
  {
    name: "Sweet Charlie Strawberry Plants",
    url: "https://sweet-charlie.co.za/",
    sector: "Nursery & growers",
    discipline: "WEBSITE · DESIGN & DEVELOPMENT",
  },
  {
    name: "Lotus & Divya Light — Marigold",
    url: "https://lotusanddivyalight.co.za/",
    sector: "Wellness & lifestyle",
    discipline: "WEBSITE · DESIGN & DEVELOPMENT",
  },
];

/* ---------------- 05 · Impact defaults (same as the original calculators) ---------------- */
export const IMPACT_DEFAULTS = {
  adminHoursPerWeek: 8,
  staffCostPerHour: 100,
  missedEnquiries: 10,
  recoveryRate: 50,
  adBudget: 5000,
  costPerClick: 25,
  enquiryRate: 4,
};

/* ---------------- 07 · Journey ---------------- */
export const JOURNEY = ["Scan", "Call", "Clear Proposal", "Written Total", "Deposit", "Build", "Review", "Publish"];

/* ---------------- FAQ ---------------- */
export const FAQ = [
  {
    q: "What is a Free Leak Scan?",
    a: "Submit your business name and website using the enquiry form. We review the public information and follow up on WhatsApp. You can also request a free 30-minute video call. The scan is not an instant report, locked price or implementation plan.",
  },
  { q: "How do I start?", a: "Free Leak Scan → 30-minute call → clear package or tier → written total → 50% EFT deposit → build." },
  {
    q: "How do payments work?",
    a: "The default is a 50% EFT deposit to start and the balance on delivery or go-live. Banking details are provided on invoices only. The R3,500 Deep Audit is credited to a build agreed within 30 days.",
  },
  {
    q: "What do the monthly amounts cover?",
    a: "Only the care and support inclusions listed for your package or written proposal. New pages, features, integrations, or other out-of-scope work are quoted as a change request or change bundle.",
  },
  {
    q: "How does Custom start at R15,000 if a project may cost R45,000–R90,000?",
    a: "R15,000 is the Custom Site tier. Custom + Light automation starts at R25,000, Custom Systems at R45,000, and Custom Platform at R70,000+. The band depends on systems connected and scope — not a random jump. After the audit, the quote names the tier, lists the scope, and fixes the total in writing.",
  },
  {
    q: "How is marketing priced for clients and marketing-only clients?",
    a: "Package clients and standalone clients have different monthly base rates. The management fee is the higher of the applicable base rate or 12% of ad spend; ad spend is paid separately to the platform. Annual options are available.",
  },
  {
    q: "Do you guarantee leads or sales?",
    a: "No. We use research, platform data and structured testing, but do not guarantee leads or sales from marketing or builds.",
  },
];
