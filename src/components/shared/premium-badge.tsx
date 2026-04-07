"use client";

import Link from "next/link";
import { Crown } from "lucide-react";
import { isPremium } from "@/lib/premium";

export function ProBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 ${className}`}
    >
      <Crown className="h-2.5 w-2.5" />
      Pro
    </span>
  );
}

export function PremiumUpsell({
  feature,
}: {
  feature: string;
}) {
  const premium = isPremium();

  if (premium) return null;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/40 dark:bg-amber-950/20">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900/40">
          <Crown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
            {feature} is a Premium feature
          </p>
          <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400/80">
            Upgrade to Premium to unlock this and more.
          </p>
          <Link
            href="/pricing"
            className="mt-2 inline-flex items-center gap-1 rounded-md bg-amber-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-amber-700"
          >
            View plans
          </Link>
        </div>
      </div>
    </div>
  );
}
