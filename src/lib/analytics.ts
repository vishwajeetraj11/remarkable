/**
 * Thin PostHog capture helpers, safe to call from any client component.
 * posthog-js is imported lazily and only when a key is configured, so these
 * are no-ops in dev without env and add nothing to the initial bundle.
 * Initialization itself lives in `PostHogInit` (loaded in the root layout).
 */

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;

export function captureEvent(name: string, props?: Record<string, unknown>) {
  if (!KEY || typeof window === "undefined") return;
  import("posthog-js").then(({ default: posthog }) => {
    if (posthog.__loaded) posthog.capture(name, props);
  });
}

/** Record an email signup and tie the anonymous person to the address. */
export function captureEmailSubmitted(email: string) {
  if (!KEY || typeof window === "undefined") return;
  import("posthog-js").then(({ default: posthog }) => {
    if (!posthog.__loaded) return;
    posthog.identify(email, { email });
    posthog.capture("email_submitted", { email });
  });
}
