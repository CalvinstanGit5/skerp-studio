import { useCallback, useEffect, useState } from "react";
import { Modal } from "@/components/ui";
import { EnquiryForm } from "@/components/EnquiryForm";
import { EstimateCalculator } from "@/components/calculators/EstimateCalculator";
import { AdsCalculator, TimeCalculator } from "@/components/calculators/ImpactCalculators";
import { LEAK_SCAN_MESSAGE, VIDEO_CALL_MESSAGE, openContact, type ContactDetail } from "@/lib/contact";
import { PACKAGE_PRESETS, type TierId } from "@/lib/pricing";
import { registerHashAction } from "@/lib/smooth";

/* ------------------------------------------------------------------
 * Every calculator and form on the site opens here, as a popup, on any page.
 *   openModal({ kind: "estimate", pkg: "Flow" })
 *   openModal({ kind: "time" }) / openModal({ kind: "ads" })
 *   openContact({ service, message })  → enquiry form popup
 * Hashes work too: #estimate, #time-calculator, #ads-calculator, #scan, #contact, #call
 * ------------------------------------------------------------------ */
export type ModalRequest = { kind: "estimate"; pkg?: TierId } | { kind: "time" } | { kind: "ads" };

export function openModal(detail: ModalRequest) {
  window.dispatchEvent(new CustomEvent<ModalRequest>("skerp-modal", { detail }));
}

type State = ModalRequest | { kind: "contact"; service: string; message?: string; key: number } | null;

export function ModalHost() {
  const [state, setState] = useState<State>(null);
  const close = useCallback(() => setState(null), []);

  useEffect(() => {
    const onModal = (e: Event) => setState((e as CustomEvent<ModalRequest>).detail);
    const onContact = (e: Event) => {
      const d = (e as CustomEvent<ContactDetail>).detail || {};
      setState({ kind: "contact", service: d.service || "Not Sure", message: d.message, key: Date.now() });
    };
    window.addEventListener("skerp-modal", onModal);
    window.addEventListener("skerp-contact", onContact);
    const offs = [
      registerHashAction("estimate", () => openModal({ kind: "estimate" })),
      registerHashAction("time-calculator", () => openModal({ kind: "time" })),
      registerHashAction("ads-calculator", () => openModal({ kind: "ads" })),
      registerHashAction("scan", () => openContact({ service: "Free Leak Scan", message: LEAK_SCAN_MESSAGE })),
      registerHashAction("contact", () => openContact({ service: "Not Sure" })),
      registerHashAction("call", () => openContact({ service: "30-minute video call", message: VIDEO_CALL_MESSAGE })),
    ];
    // Open straight away when a page is loaded with one of these hashes (e.g. /#estimate from another page).
    const hash = window.location.hash.replace("#", "");
    const direct: Record<string, () => void> = {
      estimate: () => openModal({ kind: "estimate" }),
      "time-calculator": () => openModal({ kind: "time" }),
      "ads-calculator": () => openModal({ kind: "ads" }),
      scan: () => openContact({ service: "Free Leak Scan", message: LEAK_SCAN_MESSAGE }),
      contact: () => openContact({ service: "Not Sure" }),
      call: () => openContact({ service: "30-minute video call", message: VIDEO_CALL_MESSAGE }),
    };
    if (direct[hash]) window.setTimeout(direct[hash], 400);
    return () => {
      window.removeEventListener("skerp-modal", onModal);
      window.removeEventListener("skerp-contact", onContact);
      offs.forEach((off) => off());
    };
  }, []);

  const kind = state?.kind;
  const pkg = state && state.kind === "estimate" ? state.pkg : undefined;

  return (
    <>
      <Modal
        open={kind === "estimate"}
        onClose={close}
        title={pkg ? `Quote for Skerp ${pkg}.` : "Let's start your project."}
        kicker={pkg ? "PROJECT ESTIMATE · PRESET" : "PROJECT ESTIMATE"}
        wide
      >
        <EstimateCalculator key={pkg || "open"} onClose={close} preset={pkg ? PACKAGE_PRESETS[pkg] : undefined} presetLabel={pkg ? `Skerp ${pkg}` : undefined} />
      </Modal>
      <Modal open={kind === "time"} onClose={close} title="Time-saved calculator" kicker="BUSINESS IMPACT">
        <TimeCalculator onDone={close} />
      </Modal>
      <Modal open={kind === "ads"} onClose={close} title="Ads impact calculator" kicker="BUSINESS IMPACT">
        <AdsCalculator onDone={close} />
      </Modal>
      <Modal
        open={kind === "contact"}
        onClose={close}
        title={state?.kind === "contact" && state.service === "Free Leak Scan" ? "Free Leak Scan." : state?.kind === "contact" && state.service === "30-minute video call" ? "Book a video call." : "Let's talk."}
        kicker="SEND US YOUR DETAILS"
        wide
      >
        {state?.kind === "contact" ? <EnquiryForm key={state.key} initialService={state.service} initialMessage={state.message} /> : null}
      </Modal>
    </>
  );
}
