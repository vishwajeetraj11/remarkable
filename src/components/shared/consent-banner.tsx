"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getConsent, setConsent, subscribeConsent } from "@/lib/consent";

// Server snapshot sentinel: render nothing until hydrated so SSR HTML never
// contains the banner for visitors who already chose.
const SSR = "ssr" as const;

/**
 * Minimal cookie-consent banner shown to all visitors until they choose.
 * Only rendered when a Google Ads tag ID is configured — without it there is
 * no marketing cookie to consent to. Declining simply keeps the tag off.
 */
export function ConsentBanner() {
  const consent = useSyncExternalStore(subscribeConsent, getConsent, () => SSR);

  if (!process.env.NEXT_PUBLIC_GOOGLE_ADS_ID) return null;
  if (consent !== null) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center">
        <p className="flex-1 text-sm text-muted-foreground">
          We use a Google Ads tag (a cookie) to measure whether our ads work.
          It only runs if you accept. See our{" "}
          <Link href="/privacy" className="underline hover:text-foreground">
            privacy policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConsent("denied")}
          >
            Decline
          </Button>
          <Button size="sm" onClick={() => setConsent("granted")}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
