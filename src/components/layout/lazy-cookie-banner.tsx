"use client";

import dynamic from "next/dynamic";

const CookieBanner = dynamic(
  () => import("./cookie-banner").then((m) => m.CookieBanner),
  { ssr: false }
);

export function LazyCookieBanner() {
  return <CookieBanner />;
}
