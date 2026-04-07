"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Mail, Check } from "lucide-react";
import {
  shouldShowEmailCapture,
  dismissEmailCapture,
  submitEmail,
} from "@/lib/download-tracker";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ---------- Inline mode ---------- */

export function EmailCaptureInline() {
  const [visible, setVisible] = useState(() => shouldShowEmailCapture());
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success">("idle");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!isValidEmail(email)) return;
      submitEmail(email);
      setStatus("success");
      setTimeout(() => setVisible(false), 2500);
    },
    [email],
  );

  if (!visible) return null;

  return (
    <div className="rounded-xl border border-border bg-muted/40 px-5 py-4">
      {status === "success" ? (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <Check className="size-4" />
          <span>You&apos;re subscribed — we&apos;ll keep you posted!</span>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
            <Mail className="size-4" />
            <span>Get notified when we add new puzzles and templates</span>
          </div>
          <div className="flex flex-1 gap-2">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="max-w-xs"
            />
            <Button type="submit" size="sm" disabled={!isValidEmail(email)}>
              Subscribe
            </Button>
          </div>
          <button
            type="button"
            onClick={() => {
              dismissEmailCapture();
              setVisible(false);
            }}
            aria-label="Dismiss"
            className="absolute right-3 top-3 sm:static text-muted-foreground hover:text-foreground transition-colors"
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
      submitEmail(email);
      setStatus("success");
      setTimeout(() => setVisible(false), 2500);
    },
    [email],
  );

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 animate-in slide-in-from-bottom-4 duration-300">
      <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-3">
        {status === "success" ? (
          <div className="flex flex-1 items-center justify-center gap-2 text-sm text-green-600">
            <Check className="size-4" />
            <span>You&apos;re subscribed — we&apos;ll keep you posted!</span>
          </div>
        ) : (
          <>
            <Mail className="hidden size-5 shrink-0 text-muted-foreground sm:block" />
            <p className="shrink-0 text-sm text-muted-foreground">
              Get notified when we add new puzzles &amp; templates
            </p>
            <form
              onSubmit={handleSubmit}
              className="flex flex-1 items-center gap-2"
            >
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="max-w-60"
              />
              <Button type="submit" size="sm" disabled={!isValidEmail(email)}>
                Subscribe
              </Button>
            </form>
            <button
              type="button"
              onClick={() => {
                dismissEmailCapture();
                setVisible(false);
              }}
              aria-label="Dismiss email signup"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="size-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
