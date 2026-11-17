import { useEffect } from "react";
import { Landing } from "@/pages/Landing";
import { MarketingPage } from "@/pages/MarketingPage";
import { PackagePage } from "@/pages/PackagePage";
import { PrivacyPage } from "@/pages/PrivacyPage";
import { AutomationPage } from "@/pages/AutomationPage";
import { ImpactPage } from "@/pages/ImpactPage";
import { PackagesPage } from "@/pages/PackagesPage";
import { StartPage } from "@/pages/StartPage";
import { AboutPage } from "@/pages/AboutPage";
import { WorkPage } from "@/pages/WorkPage";
import { EstimatePage } from "@/pages/EstimatePage";
import { ModalHost } from "@/components/ModalHost";
import { CurrencyProvider } from "@/lib/currency";
import { initSmoothScroll, interceptAnchors } from "@/lib/smooth";

function resolveRoute() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (["/marketing", "/marketing.html"].includes(path)) return <MarketingPage />;
  if (["/privacy", "/privacy.html"].includes(path)) return <PrivacyPage />;
  if (path === "/automation") return <AutomationPage />;
  if (path === "/impact") return <ImpactPage />;
  if (path === "/packages") return <PackagesPage />;
  if (["/start", "/scan", "/contact", "/free-leak-scan"].includes(path)) return <StartPage />;
  if (path === "/about") return <AboutPage />;
  if (path === "/work") return <WorkPage />;
  if (path === "/estimate") return <EstimatePage />;
  const pkg = path.match(/^\/packages\/(start|flow|business|custom)$/i);
  if (pkg) return <PackagePage slug={pkg[1].toLowerCase()} />;
  return <Landing />;
}

export default function App() {
  // Lenis smooth scroll (skipped automatically for prefers-reduced-motion) + in-page anchor routing.
  useEffect(() => {
    const destroyLenis = initSmoothScroll();
    const stopAnchors = interceptAnchors();
    return () => {
      stopAnchors();
      destroyLenis();
    };
  }, []);

  return (
    <CurrencyProvider>
      {resolveRoute()}
      <ModalHost />
    </CurrencyProvider>
  );
}
