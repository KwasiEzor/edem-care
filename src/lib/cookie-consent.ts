export type CookieConsent = {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
};

export const DEFAULT_CONSENT: CookieConsent = {
  essential: true,
  analytics: false,
  marketing: false,
};

const CONSENT_KEY = "edem_cookie_consent";

export function getStoredConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(CONSENT_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function setStoredConsent(consent: CookieConsent) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  // Trigger custom event for components to react
  window.dispatchEvent(new Event("cookie-consent-updated"));
}

export function hasUserConsented(): boolean {
  return getStoredConsent() !== null;
}
