const DOWNLOAD_COUNT_KEY = "rs_download_count";
const EMAIL_DISMISSED_KEY = "rs_email_dismissed";
const EMAIL_SUBMITTED_KEY = "rs_email_submitted";
const EMAIL_ADDRESS_KEY = "rs_email_address";

const DISMISS_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function trackDownload() {
  if (typeof window === "undefined") return;
  const count = getDownloadCount();
  localStorage.setItem(DOWNLOAD_COUNT_KEY, String(count + 1));
  window.dispatchEvent(new Event("rs_download"));
}

export function getDownloadCount(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(DOWNLOAD_COUNT_KEY) || "0", 10);
}

export function shouldShowEmailCapture(): boolean {
  if (typeof window === "undefined") return false;
  if (localStorage.getItem(EMAIL_SUBMITTED_KEY)) return false;

  const dismissed = localStorage.getItem(EMAIL_DISMISSED_KEY);
  if (dismissed) {
    const dismissedAt = parseInt(dismissed, 10);
    if (Date.now() - dismissedAt < DISMISS_DURATION_MS) return false;
  }

  return getDownloadCount() >= 1;
}

export function dismissEmailCapture() {
  if (typeof window === "undefined") return;
  localStorage.setItem(EMAIL_DISMISSED_KEY, String(Date.now()));
}

export function submitEmail(email: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(EMAIL_SUBMITTED_KEY, "true");
  localStorage.setItem(EMAIL_ADDRESS_KEY, email);
}
