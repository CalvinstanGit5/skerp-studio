import { createContext, useContext, useState, type ReactNode } from "react";
import { CURRENCIES, type Currency } from "./pricing";
import { cn } from "@/utils/cn";

const CurrencyContext = createContext<{ currency: Currency; setCurrency: (c: Currency) => void }>({
  currency: "ZAR",
  setCurrency: () => {},
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("ZAR");
  return <CurrencyContext.Provider value={{ currency, setCurrency }}>{children}</CurrencyContext.Provider>;
}

export const useCurrency = () => useContext(CurrencyContext);

export function CurrencyToggle({ className }: { className?: string }) {
  const { currency, setCurrency } = useCurrency();
  return (
    <div role="group" aria-label="Currency" className={cn("inline-flex border border-line", className)}>
      {CURRENCIES.map((c) => (
        <button
          key={c}
          type="button"
          aria-pressed={currency === c}
          onClick={() => setCurrency(c)}
          className={cn(
            "micro px-3 py-2 transition-colors duration-300",
            currency === c ? "bg-cream text-ink" : "text-cream/60 hover:text-cream",
          )}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
