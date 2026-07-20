"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { CONSENT_EVENT, getConsent } from "@/lib/consent";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

/**
 * Lazy PostHog init, same dormant-env pattern as Clarity: no key, no load.
 * Captures SPA pageviews and a `pdf_generated` product event via the
 * `rs_download` event dispatched by `trackDownload`.
 */
export function PostHogInit() {
  const pathname = usePathname();
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!KEY) return;
    let cleanup: (() => void) | undefined;
    import("posthog-js").then(({ default: posthog }) => {
      if (!loadedRef.current) {
        posthog.init(KEY!, {
          api_host: HOST,
          capture_pageview: true,
          capture_pageleave: true,
          capture_exceptions: true,
        });
        loadedRef.current = true;
      }
      const onDownload = (e: Event) =>
        posthog.capture("pdf_generated", {
          path: window.location.pathname,
          ...((e as CustomEvent).detail ?? {}),
        });
      const onConsent = () =>
        posthog.capture("consent_choice", { choice: getConsent() });
      window.addEventListener("rs_download", onDownload);
      window.addEventListener(CONSENT_EVENT, onConsent);
      cleanup = () => {
        window.removeEventListener("rs_download", onDownload);
        window.removeEventListener(CONSENT_EVENT, onConsent);
      };
    });
    return () => cleanup?.();
  }, []);

  // posthog-js only auto-captures the initial pageview; report SPA navigations.
  useEffect(() => {
    if (!loadedRef.current) return;
    import("posthog-js").then(({ default: posthog }) =>
      posthog.capture("$pageview")
    );
  }, [pathname]);

  return null;
}
