"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { CONSENT_EVENT, getConsent } from "@/lib/consent";

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
const CONVERSION_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;

/** Minimum gap between conversion events, so a puzzle+answer-key double save
 * (or a rapid re-generate) counts as one conversion. */
const CONVERSION_DEBOUNCE_MS = 3000;

function loadGtag(adsId: string) {
  if (window.gtag) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // Google's snippet pushes the arguments object itself, not an array.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  // Consent Mode v2 signals. The script only ever loads after the visitor
  // accepts the banner, so every state is granted at load time.
  window.gtag("consent", "default", {
    ad_storage: "granted",
    ad_user_data: "granted",
    ad_personalization: "granted",
    analytics_storage: "granted",
  });
  window.gtag("js", new Date());
  window.gtag("config", adsId);
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${adsId}`;
  document.head.appendChild(script);
}

/**
 * Consent-gated Google Ads tag. Nothing loads (no script, no cookie) until
 * the visitor accepts via the consent banner; the choice is stored in
 * localStorage. Fires a conversion whenever a PDF is generated (the
 * `rs_download` event dispatched by `trackDownload`).
 */
export function GoogleAdsTag() {
  const pathname = usePathname();
  const loadedRef = useRef(false);
  const lastConversionRef = useRef(0);

  useEffect(() => {
    if (!ADS_ID) return;

    function syncConsent() {
      if (!loadedRef.current && getConsent() === "granted") {
        loadGtag(ADS_ID!);
        loadedRef.current = true;
      }
    }

    function onDownload() {
      if (!loadedRef.current || !window.gtag) return;
      const now = Date.now();
      if (now - lastConversionRef.current < CONVERSION_DEBOUNCE_MS) return;
      lastConversionRef.current = now;
      window.gtag("event", "conversion", {
        send_to: CONVERSION_LABEL ? `${ADS_ID}/${CONVERSION_LABEL}` : ADS_ID,
      });
    }

    syncConsent();
    window.addEventListener(CONSENT_EVENT, syncConsent);
    window.addEventListener("rs_download", onDownload);
    return () => {
      window.removeEventListener(CONSENT_EVENT, syncConsent);
      window.removeEventListener("rs_download", onDownload);
    };
  }, []);

  // gtag's config only sees the initial page; report SPA navigations.
  useEffect(() => {
    if (loadedRef.current && window.gtag && ADS_ID) {
      window.gtag("config", ADS_ID, { page_path: pathname });
    }
  }, [pathname]);

  return null;
}
