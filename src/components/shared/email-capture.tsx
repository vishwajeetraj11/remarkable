"use client";

import { useState, useEffect, useCallback, useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Mail, Check } from "lucide-react";
import {
  shouldShowEmailCapture,
  dismissEmailCapture,
  submitEmail,
} from "@/lib/download-tracker";
import { captureEmailSubmitted } from "@/lib/analytics";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ---------- Inline mode ---------- */

export function EmailCaptureInline() {
  const [visible, setVisible] = useState(() => shouldShowEmailCapture());
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const emailId = useId();
  const descriptionId = useId();

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!isValidEmail(email)) return;
      submitEmail();
      captureEmailSubmitted(email);
      setStatus("success");
      setTimeout(() => setVisible(false), 2500);
    },
    [email],
  );

  if (!visible) return null;

  return (
    <div className="relative rounded-xl border border-border bg-muted/40 px-5 py-4">
      {status === "success" ? (
        <div role="status" className="flex items-center gap-2 text-sm text-green-600">
          <Check className="size-4" />
          <span>Thanks — we recorded your interest.</span>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <div id={descriptionId} className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
            <Mail className="size-4" />
            <span>Your email is recorded in PostHog analytics only; this is not a mailing-list signup.</span>
          </div>
          <div className="flex flex-1 gap-2">
            <label htmlFor={emailId} className="sr-only">
              Email address
            </label>
            <Input
              id={emailId}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-describedby={descriptionId}
              className="min-h-11 max-w-xs"
            />
            <Button type="submit" size="sm" disabled={!isValidEmail(email)} className="min-h-11">
              Share email
            </Button>
          </div>
          <button
            type="button"
            onClick={() => {
              dismissEmailCapture();
              setVisible(false);
            }}
            aria-label="Dismiss"
            className="absolute right-2 top-2 inline-flex size-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:static"
          >
            <X className="size-4" />
          </button>
        </form>
      )}
    </div>
  );
}

/* ---------- Banner mode (fixed bottom) ---------- */

export function EmailCaptureBanner() {
  const [visible, setVisible] = useState(() => shouldShowEmailCapture());
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const emailId = useId();
  const descriptionId = useId();

  const refresh = useCallback(() => {
    setVisible(shouldShowEmailCapture());
  }, []);

  useEffect(() => {
    window.addEventListener("rs_download", refresh);
    return () => window.removeEventListener("rs_download", refresh);
  }, [refresh]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!isValidEmail(email)) return;
      submitEmail();
      captureEmailSubmitted(email);
      setStatus("success");
      setTimeout(() => setVisible(false), 2500);
    },
    [email],
  );

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 animate-in slide-in-from-bottom-4 duration-300">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
        {status === "success" ? (
          <div role="status" className="flex flex-1 items-center justify-center gap-2 text-sm text-green-600">
            <Check className="size-4" />
            <span>Thanks — we recorded your interest.</span>
          </div>
        ) : (
          <>
            <Mail className="hidden size-5 shrink-0 text-muted-foreground sm:block" />
            <p id={descriptionId} className="text-sm text-muted-foreground sm:shrink-0">
              Your email is recorded in PostHog analytics only; this is not a mailing-list signup.
            </p>
            <form
              onSubmit={handleSubmit}
              className="flex w-full flex-1 items-center gap-2 sm:w-auto"
            >
              <label htmlFor={emailId} className="sr-only">
                Email address
              </label>
              <Input
                id={emailId}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-describedby={descriptionId}
                className="min-h-11 max-w-60"
              />
              <Button type="submit" size="sm" disabled={!isValidEmail(email)} className="min-h-11">
                Share email
              </Button>
            </form>
            <button
              type="button"
              onClick={() => {
                dismissEmailCapture();
                setVisible(false);
              }}
              aria-label="Dismiss email signup"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <X className="size-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
