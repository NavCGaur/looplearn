// Minimal Google Analytics (GA4) helper
// Reads measurement ID from the caller and injects gtag.js, then exposes helpers

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    _gaInitialized?: boolean;
  }
}

export const initGA = (measurementId: string) => {
  if (!measurementId) return;
  if (typeof window === "undefined") return;

  if (window._gaInitialized) return;

  window.dataLayer = window.dataLayer || [];

  function gtag() {
    window.dataLayer!.push(arguments);
  }

  window.gtag = gtag as any;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer.push(["js", new Date()]);
  // disable automatic page view so we can control pageview events manually
  window.dataLayer.push(["config", measurementId, { send_page_view: false }]);
  window._gaInitialized = true;
};

export const pageview = (path: string) => {
  try {
    if (typeof window === "undefined" || !window.gtag) return;
    window.gtag("event", "page_view", { page_path: path });
  } catch (e) {
    // swallow errors to avoid breaking the app
  }
};

export const event = (action: string, params?: Record<string, any>) => {
  try {
    if (typeof window === "undefined" || !window.gtag) return;
    window.gtag("event", action, params || {});
  } catch (e) {
    // noop
  }
};

export const isGAEnabled = () => !!(typeof window !== "undefined" && window._gaInitialized && window.gtag);
