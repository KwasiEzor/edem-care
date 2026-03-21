"use client";

import dynamic from "next/dynamic";

const CookieConsentManager = dynamic(
  () => import("./cookie-consent-manager").then((m) => m.CookieConsentManager),
  { ssr: false }
);

export function LazyCookieBanner() {
  return <CookieConsentManager />;
}
