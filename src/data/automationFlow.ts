/* ------------------------------------------------------------------
 * 04 · Automation flow — EDIT ME.
 *
 * Nodes are placed on a virtual canvas (CANVAS.width × CANVAS.height).
 * The scroll sequence visits nodes in array order: the camera pans to
 * each node, its incoming edges draw, the node pops in and its
 * "what / why" caption appears. Then everything turns green.
 *
 *  - Add/remove nodes freely; keep x/y inside the canvas.
 *  - Every edge draws when its `to` node appears.
 *  - `icon` must be one of the keys in FlowIcon (Automation.tsx).
 * ------------------------------------------------------------------ */

export type FlowIconName = "bolt" | "filter" | "database" | "chat" | "bell" | "clock" | "invoice" | "chart";

export interface FlowNode {
  id: string;
  kind: string; // tiny n8n-style type label
  title: string; // node name
  icon: FlowIconName;
  x: number; // centre x on the virtual canvas
  y: number; // centre y on the virtual canvas
  what: string; // what this node does
  why: string; // why it connects to the next step
}

export interface FlowEdge {
  from: string;
  to: string;
  label?: string;
}

export const CANVAS = { width: 2200, height: 1000, node: 132 };

export const FLOW_NODES: FlowNode[] = [
  {
    id: "trigger",
    kind: "TRIGGER",
    title: "New enquiry",
    icon: "bolt",
    x: 180,
    y: 500,
    what: "A form, WhatsApp message or booking request comes in.",
    why: "Every flow starts from a real event, so nobody has to remember to check an inbox.",
  },
  {
    id: "clean",
    kind: "SET · VALIDATE",
    title: "Tidy & qualify",
    icon: "filter",
    x: 470,
    y: 500,
    what: "Name, number, service and source are cleaned into one record.",
    why: "Every step after this gets the same reliable details — no retyping.",
  },
  {
    id: "crm",
    kind: "CRM",
    title: "Save the lead",
    icon: "database",
    x: 760,
    y: 500,
    what: "The lead lands in your customer list or pipeline automatically.",
    why: "Nothing lives in someone's head or a buried chat. Two paths run from here.",
  },
  {
    id: "reply",
    kind: "WHATSAPP",
    title: "Instant reply",
    icon: "chat",
    x: 1080,
    y: 300,
    what: "The customer gets a friendly confirmation within seconds.",
    why: "Fast replies stop warm leads from going cold or shopping around.",
  },
  {
    id: "alert",
    kind: "EMAIL · WHATSAPP",
    title: "Alert the team",
    icon: "bell",
    x: 1080,
    y: 700,
    what: "The right person is notified with the full context.",
    why: "Handoffs happen instantly, without forwarding chains.",
  },
  {
    id: "followup",
    kind: "WAIT · IF",
    title: "Follow up if quiet",
    icon: "clock",
    x: 1400,
    y: 300,
    what: "No reply after 48 hours? A polite follow-up goes out.",
    why: "Most lost leads are simply leads nobody followed up.",
  },
  {
    id: "invoice",
    kind: "BOOKING · EFT",
    title: "Book or invoice",
    icon: "invoice",
    x: 1400,
    y: 700,
    what: "A booking link or EFT invoice step is sent when they're ready.",
    why: "The path from interest to paid work stays short.",
  },
  {
    id: "report",
    kind: "SCHEDULE",
    title: "Weekly summary",
    icon: "chart",
    x: 1720,
    y: 500,
    what: "Enquiries, replies and bookings — summarised every Monday.",
    why: "You see what's working without building spreadsheets.",
  },
];

export const FLOW_EDGES: FlowEdge[] = [
  { from: "trigger", to: "clean" },
  { from: "clean", to: "crm" },
  { from: "crm", to: "reply" },
  { from: "crm", to: "alert" },
  { from: "reply", to: "followup" },
  { from: "alert", to: "invoice" },
  { from: "followup", to: "report" },
  { from: "invoice", to: "report" },
];

export const FLOW_PAYOFF = {
  word: "AUTOMATED.",
  line: "Runs every hour of every day. Nobody has to remember.",
};
