"use client";

import { useState, useRef, useEffect } from "react";

const categories = [
  { value: "bug", label: "Something broken" },
  { value: "pdf", label: "PDF issue" },
  { value: "suggestion", label: "Suggestion" },
  { value: "other", label: "Other" },
] as const;

type Category = (typeof categories)[number]["value"];

export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<Category>("bug");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    const page = window.location.href;
    const subject = encodeURIComponent(
      `[${categories.find((c) => c.value === category)?.label}] Feedback — Remarkable Skills`
    );
    const body = encodeURIComponent(
      `Category: ${categories.find((c) => c.value === category)?.label}\nPage: ${page}\n\n${message.trim()}`
    );

    window.location.href = `mailto:vishwajeet.raj11@gmail.com?subject=${subject}&body=${body}`;

    setSent(true);
    setTimeout(() => {
      setOpen(false);
      setSent(false);
      setMessage("");
      setCategory("bug");
    }, 2000);
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div
          ref={panelRef}
          className="absolute bottom-14 right-0 w-80 rounded-xl border border-border bg-popover shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          {sent ? (
            <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-8 w-8 text-green-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p className="text-sm font-medium">Thanks for your feedback!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="p-4 pb-0">
                <p className="text-sm font-semibold">Send feedback</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Found a problem? Let us know.
                </p>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        category === cat.value
                          ? "bg-foreground text-background"
                          : "bg-muted text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe what happened…"
                  rows={3}
                  className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-label="Feedback message"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <span className="text-[10px] text-muted-foreground/50">
                  Opens your email client
                </span>
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="rounded-lg bg-foreground px-4 py-1.5 text-xs font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  Send
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        aria-label="Send feedback"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="h-[18px] w-[18px]"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
          />
        </svg>
      </button>
    </div>
  );
}
