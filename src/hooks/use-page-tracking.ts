"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { getStoredConsent } from "@/lib/cookie-consent";

function getSessionHash(): string {
  const key = "edem_session";
  const today = new Date().toISOString().split("T")[0];
  const stored = sessionStorage.getItem(key);

  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.date === today) return parsed.hash;
    } catch {
      // ignore malformed data
    }
  }

  const hash = crypto.randomUUID();
  sessionStorage.setItem(key, JSON.stringify({ date: today, hash }));
  return hash;
}

function getReferrerDomain(): string | null {
  try {
    if (!document.referrer) return null;
    const url = new URL(document.referrer);
    // Skip same-origin referrers
    if (url.origin === window.location.origin) return null;
    return url.hostname;
  } catch {
    return null;
  }
}

export function usePageTracking() {
  const pathname = usePathname();
  const lastTracked = useRef<string>("");
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const checkConsent = () => {
      const consent = getStoredConsent();
      setHasConsent(!!consent?.analytics);
    };

    checkConsent();
    window.addEventListener("cookie-consent-updated", checkConsent);
    return () =>
      window.removeEventListener("cookie-consent-updated", checkConsent);
  }, []);

  useEffect(() => {
    // Only track if analytics consent is given
    if (!hasConsent) return;

    // Skip admin routes
    if (pathname.startsWith("/admin")) return;
    // Skip duplicate tracking for same path
    if (lastTracked.current === pathname) return;
    lastTracked.current = pathname;

    const sessionHash = getSessionHash();
    const referrerOrigin = getReferrerDomain();

    // Fire-and-forget
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page_path: pathname,
        referrer_origin: referrerOrigin,
        session_hash: sessionHash,
      }),
    }).catch(() => {
      // Silent fail
    });
  }, [pathname, hasConsent]);
}
