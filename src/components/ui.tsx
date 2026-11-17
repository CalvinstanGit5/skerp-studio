import { Fragment, useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/utils/cn";
import { lockScroll } from "@/lib/smooth";

export function Arrow({ diagonal = false, className }: { diagonal?: boolean; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("arrow", diagonal && "arrow-diag", className)}
    >
      <path d="M4 12h16M13 5l7 7-7 7" />
    </svg>
  );
}

/**
 * Splits text into masked words: <span.sw><span>word</span></span>.
 * GSAP animates the inner spans (".sw > span"). Rendering the split in React
 * (instead of mutating the DOM) keeps React and GSAP from fighting.
 */
export function SplitWords({ text, className, wordClassName }: { text: string; className?: string; wordClassName?: string }) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((w, i) => (
        <Fragment key={`${w}-${i}`}>
          <span className="sw">
            <span className={wordClassName}>{w}</span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  );
}

export function ChapterLabel({ index, label, className }: { index: string; label: string; className?: string }) {
  return (
    <div className={cn("micro flex items-center gap-3 text-muted", className)}>
      <span className="dot" />
      <span className="text-cream">{index}</span>
      <span className="h-px w-8 bg-line-strong" />
      <span>{label}</span>
    </div>
  );
}

/* ------------------------------------------------------------------
 * Modal — used for calculators. Lenis is paused while open; the inner
 * scroller has data-lenis-prevent so it scrolls natively.
 * ------------------------------------------------------------------ */
export function Modal({
  open,
  onClose,
  title,
  kicker,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  kicker?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    lastFocus.current = document.activeElement as HTMLElement;
    lockScroll(true);
    const t = window.setTimeout(() => panelRef.current?.querySelector<HTMLElement>("[data-autofocus], button, input, select")?.focus(), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, summary, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      lockScroll(false);
      lastFocus.current?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="modal-root fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label={title}>
      <div className="no-print absolute inset-0 bg-black/75 backdrop-blur-md modal-fade" onClick={onClose} />
      <div className="modal-scroll absolute inset-0 overflow-y-auto overscroll-contain" data-lenis-prevent>
        <div className="flex min-h-full items-start justify-center px-3 py-6 sm:px-6 sm:py-12" onClick={onClose}>
          <div
            ref={panelRef}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "modal-panel relative w-full border border-line-strong bg-ink-2 shadow-[0_40px_120px_-20px_#000]",
              wide ? "max-w-5xl" : "max-w-3xl",
            )}
          >
            <div className="no-print sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-line bg-ink-2/95 px-5 py-4 backdrop-blur sm:px-8">
              <div>
                {kicker ? <span className="micro text-copper">{kicker}</span> : null}
                <h2 className="display mt-1 text-2xl sm:text-3xl">{title}</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid h-11 w-11 place-items-center border border-line-strong text-2xl leading-none transition-colors hover:border-cream"
              >
                ×
              </button>
            </div>
            <div className="px-5 py-6 sm:px-8 sm:py-8">{children}</div>
          </div>
        </div>
      </div>
      <style>{`
        .modal-fade{animation:mfade .35s ease both}
        .modal-panel{animation:mrise .55s cubic-bezier(.16,1,.3,1) both}
        @keyframes mfade{from{opacity:0}to{opacity:1}}
        @keyframes mrise{from{opacity:0;transform:translateY(28px) scale(.985)}to{opacity:1;transform:none}}
      `}</style>
    </div>,
    document.body,
  );
}
