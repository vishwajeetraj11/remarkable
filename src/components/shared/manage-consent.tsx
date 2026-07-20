"use client";

import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { getConsent, resetConsent, subscribeConsent } from "@/lib/consent";

const SSR = "ssr" as const;

/** Shows the visitor's current cookie-consent choice and lets them reset it
 * (the consent banner reappears immediately). Used on the privacy page. */
export function ManageConsent() {
  const choice = useSyncExternalStore(subscribeConsent, getConsent, () => SSR);

  if (choice === SSR) return null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/20 p-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Current choice:{" "}
        <span className="font-medium text-foreground">
          {choice === "granted"
            ? "Accepted — Google Ads tag active"
            : choice === "denied"
              ? "Declined — Google Ads tag off"
              : "Not chosen yet"}
        </span>
      </p>
      <Button variant="outline" size="sm" onClick={() => resetConsent()}>
        Reset choice
      </Button>
    </div>
  );
}
