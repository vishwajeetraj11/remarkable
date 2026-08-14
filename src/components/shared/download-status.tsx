"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  RotateCcw,
  X,
} from "lucide-react";
import { captureEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";

type DownloadState = "idle" | "preparing" | "complete" | "error";

const DOWNLOAD_ACTION = /(?:generate.*download|download.*pdf|download pdf)/i;
const FAILURE_TIMEOUT_MS = 45_000;
const SUCCESS_DISMISS_MS = 12_000;

function errorMessage(reason: unknown) {
  if (reason instanceof Error) return reason.message.slice(0, 200);
  if (typeof reason === "string") return reason.slice(0, 200);
  return "Unknown PDF generation error";
}

/**
 * Consistent feedback for every client-side PDF generator. Existing generators
 * all emit `rs_download` after saving, so this covers puzzles, templates,
 * worksheets, and packs without duplicating state UI in every route.
 */
export function DownloadStatus() {
  const [state, setState] = useState<DownloadState>("idle");
  const [filename, setFilename] = useState<string>();
  const triggerRef = useRef<HTMLElement | null>(null);
  const pendingRef = useRef(false);
  const failureTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const clearTimers = () => {
      if (failureTimerRef.current) clearTimeout(failureTimerRef.current);
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };

    const markFailed = (reason: unknown, failureType: string) => {
      if (!pendingRef.current || !triggerRef.current) return;
      if (failureTimerRef.current) clearTimeout(failureTimerRef.current);
      pendingRef.current = false;
      const message = errorMessage(reason);
      setState("error");
      captureEvent("generation_failed", {
        path: window.location.pathname,
        failure_type: failureType,
        error_message: message,
      });
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const action = target.closest<HTMLElement>(
        "button, [data-slot='button'], [role='button']",
      );
      const label = action?.textContent?.replace(/\s+/g, " ").trim();
      if (
        !action ||
        !label ||
        !DOWNLOAD_ACTION.test(label) ||
        action.matches(":disabled, [aria-disabled='true']")
      ) {
        return;
      }

      clearTimers();
      triggerRef.current = action;
      pendingRef.current = true;
      setFilename(undefined);
      setState("preparing");
      const properties = {
        path: window.location.pathname,
        action_label: label.slice(0, 120),
      };
      captureEvent("generation_started", properties);
      captureEvent("download_started", properties);

      failureTimerRef.current = setTimeout(() => {
        markFailed(
          "The PDF was not ready after 45 seconds",
          "generation_timeout",
        );
      }, FAILURE_TIMEOUT_MS);
    };

    const onDownload = (event: Event) => {
      if (failureTimerRef.current) clearTimeout(failureTimerRef.current);
      pendingRef.current = false;
      const detail = ((event as CustomEvent).detail ?? {}) as {
        filename?: string;
      };
      setFilename(detail.filename);
      setState("complete");
      captureEvent("download_completed", {
        path: window.location.pathname,
        filename: detail.filename,
      });
      dismissTimerRef.current = setTimeout(
        () => setState("idle"),
        SUCCESS_DISMISS_MS,
      );
    };

    const onError = (event: ErrorEvent) =>
      markFailed(event.error ?? event.message, "window_error");
    const onUnhandledRejection = (event: PromiseRejectionEvent) =>
      markFailed(event.reason, "unhandled_rejection");

    document.addEventListener("click", onClick, true);
    window.addEventListener("rs_download", onDownload);
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      clearTimers();
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("rs_download", onDownload);
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  if (state === "idle") return null;

  const retry = () => {
    const trigger = triggerRef.current;
    if (!trigger || trigger.matches(":disabled, [aria-disabled='true']")) {
      return;
    }
    trigger.click();
  };

  return (
    <aside
      className="fixed inset-x-4 bottom-4 z-[60] ml-auto max-w-sm rounded-xl border border-border bg-background p-4 shadow-lg sm:inset-x-auto sm:right-4"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-start gap-3">
        {state === "preparing" && (
          <Loader2 className="mt-0.5 size-5 shrink-0 animate-spin" />
        )}
        {state === "complete" && (
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
        )}
        {state === "error" && (
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
        )}

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            {state === "preparing" && "Preparing your PDF…"}
            {state === "complete" && "PDF downloaded"}
            {state === "error" && "Your PDF did not download"}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {state === "preparing" &&
              "Keep this tab open. Most PDFs are ready in a few seconds."}
            {state === "complete" &&
              (filename
                ? `${filename} is in your Downloads folder.`
                : "Your PDF is in your Downloads folder.")}
            {state === "error" &&
              "Your choices are still here. Try the download again."}
          </p>

          {(state === "complete" || state === "error") && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={retry}
            >
              <RotateCcw />
              {state === "complete" ? "Download another copy" : "Try again"}
            </Button>
          )}
        </div>

        <button
          type="button"
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Dismiss download status"
          onClick={() => setState("idle")}
        >
          <X className="size-4" />
        </button>
      </div>
    </aside>
  );
}
