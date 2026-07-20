const CONSENT_KEY = "rs_consent";

/** Fired on `window` whenever the stored consent choice changes. */
export const CONSENT_EVENT = "rs_consent_change";

export type ConsentChoice = "granted" | "denied";

export function getConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(CONSENT_KEY);
  return value === "granted" || value === "denied" ? value : null;
}

export function setConsent(choice: ConsentChoice) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONSENT_KEY, choice);
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

export function resetConsent() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CONSENT_KEY);
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

/** `useSyncExternalStore` subscribe function for consent changes. */
export function subscribeConsent(callback: () => void) {
  window.addEventListener(CONSENT_EVENT, callback);
  return () => window.removeEventListener(CONSENT_EVENT, callback);
}
