"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  getAnalyticsControlName,
} from "@/lib/analytics";
import { CONSENT_EVENT, getConsent } from "@/lib/consent";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

function getSessionAttribution(): Record<string, string | boolean> {
  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get("utm_source")?.trim().toLowerCase();
  let referringDomain = "";

  if (document.referrer) {
    try {
      const referrer = new URL(document.referrer);
      if (referrer.hostname !== window.location.hostname) {
        referringDomain = referrer.hostname.toLowerCase();
      }
    } catch {
      // An invalid referrer should not prevent analytics initialization.
    }
  }

  const isFacebookReferrer =
    referringDomain === "facebook.com" ||
    referringDomain.endsWith(".facebook.com");
  const isFacebookTraffic = utmSource === "facebook" || isFacebookReferrer;

  // Only register attribution when the visit has an explicit campaign or an
  // external referrer. This avoids overwriting a valid session source with
  // "direct" after an internal reload.
  if (!utmSource && !referringDomain) return {};

  return {
    acquisition_source:
      utmSource || (isFacebookReferrer ? "facebook" : referringDomain),
    acquisition_medium: params.get("utm_medium") || "referral",
    acquisition_campaign: params.get("utm_campaign") || "",
    acquisition_content: params.get("utm_content") || "",
    referring_domain: referringDomain,
    is_facebook_traffic: isFacebookTraffic,
  };
}

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
          // Register session attribution before sending the first pageview so
          // it is also inherited by every custom conversion event.
          capture_pageview: false,
          capture_pageleave: true,
          capture_exceptions: true,
        });
        loadedRef.current = true;
        const attribution = getSessionAttribution();
        if (Object.keys(attribution).length > 0) {
          posthog.register_for_session(attribution);
        }
        posthog.capture("$pageview", {
          path: window.location.pathname,
          ...attribution,
        });
      }
      const onDownload = (e: Event) => {
        const detail = ((e as CustomEvent).detail ?? {}) as Record<
          string,
          unknown
        >;
        const props = {
          path: window.location.pathname,
          ...detail,
        };
        posthog.capture("pdf_generated", props);
        if (detail.content_type === "template") {
          posthog.capture("template_downloaded", props);
        }
      };
      const onConsent = () =>
        posthog.capture("consent_choice", { choice: getConsent() });
      const onControlClick = (event: MouseEvent) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const button = target.closest<HTMLElement>(
          "button, [data-slot='button'], [role='button']",
        );
        if (
          !button ||
          button.hasAttribute("data-analytics-ignore") ||
          button.matches(":disabled, [aria-disabled='true']")
        ) {
          return;
        }

        const text = button.textContent?.replace(/\s+/g, " ").trim().slice(0, 100);
        posthog.capture("ui_button_clicked", {
          path: window.location.pathname,
          control_name: getAnalyticsControlName(button, text || "button"),
          button_text: text || undefined,
          button_type: button.getAttribute("type") || "button",
        });
      };
      const onNativeInputChange = (event: Event) => {
        const target = event.target;
        if (
          !(
            target instanceof HTMLInputElement ||
            target instanceof HTMLSelectElement ||
            target instanceof HTMLTextAreaElement
          ) ||
          target.matches("[data-slot='slider'], input[type='hidden']") ||
          target.hasAttribute("data-analytics-ignore")
        ) {
          return;
        }

        const controlType =
          target instanceof HTMLSelectElement
            ? "select"
            : target instanceof HTMLTextAreaElement
              ? "textarea"
              : target.type || "text";
        const props: Record<string, unknown> = {
          path: window.location.pathname,
          control_name: getAnalyticsControlName(target, controlType),
          control_type: controlType,
        };

        if (target instanceof HTMLSelectElement) {
          props.value = target.value;
        } else if (target instanceof HTMLInputElement) {
          if (["checkbox", "radio"].includes(target.type)) {
            props.value = target.checked;
          } else if (["number", "range"].includes(target.type)) {
            props.value = target.valueAsNumber;
          } else {
            props.has_value = target.value.length > 0;
            props.value_length = target.value.length;
          }
        } else {
          props.has_value = target.value.length > 0;
          props.value_length = target.value.length;
        }

        posthog.capture("ui_input_changed", props);
      };
      window.addEventListener("rs_download", onDownload);
      window.addEventListener(CONSENT_EVENT, onConsent);
      document.addEventListener("click", onControlClick);
      document.addEventListener("change", onNativeInputChange);
      cleanup = () => {
        window.removeEventListener("rs_download", onDownload);
        window.removeEventListener(CONSENT_EVENT, onConsent);
        document.removeEventListener("click", onControlClick);
        document.removeEventListener("change", onNativeInputChange);
      };
    });
    return () => cleanup?.();
  }, []);

  // posthog-js only auto-captures the initial pageview; report SPA navigations.
  useEffect(() => {
    if (!loadedRef.current) return;
    import("posthog-js").then(({ default: posthog }) =>
      posthog.capture("$pageview", { path: window.location.pathname })
    );
  }, [pathname]);

  return null;
}
