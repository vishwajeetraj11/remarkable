"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Check, ChevronUp, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  capturePublicTemplateRequest,
  captureTemplateRoadmapVote,
  type TemplateDevice,
} from "@/lib/analytics";
import {
  roadmapStatusCopy,
  templateRoadmap,
  type TemplateRequestStatus,
} from "@/lib/template-roadmap";
import { cn } from "@/lib/utils";

const devices: { value: TemplateDevice; label: string }[] = [
  { value: "remarkable-2", label: "reMarkable 2" },
  { value: "remarkable-paper-pro", label: "reMarkable Paper Pro" },
  { value: "remarkable-paper-pro-move", label: "Paper Pro Move" },
  { value: "supernote", label: "Supernote" },
  { value: "boox", label: "BOOX" },
  { value: "kindle-scribe", label: "Kindle Scribe" },
  { value: "printable", label: "Printed paper" },
  { value: "other", label: "Other" },
];

const statusOrder: TemplateRequestStatus[] = ["building", "planned", "published"];
const VOTE_STORAGE_KEY = "remarkable-skills-template-votes";

export function TemplateRequestBoard() {
  const [votedIds, setVotedIds] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [useCase, setUseCase] = useState("");
  const [device, setDevice] = useState<TemplateDevice>("remarkable-2");
  const [email, setEmail] = useState("");
  const [notify, setNotify] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let nextIds: string[] = [];
    try {
      const stored = JSON.parse(localStorage.getItem(VOTE_STORAGE_KEY) ?? "[]");
      if (Array.isArray(stored)) {
        nextIds = stored.filter((id) => typeof id === "string");
      }
    } catch {
      localStorage.removeItem(VOTE_STORAGE_KEY);
    }
    const frame = requestAnimationFrame(() => setVotedIds(nextIds));
    return () => cancelAnimationFrame(frame);
  }, []);

  const grouped = useMemo(
    () =>
      statusOrder.map((status) => ({
        status,
        items: templateRoadmap.filter((item) => item.status === status),
      })),
    [],
  );

  function voteFor(item: (typeof templateRoadmap)[number]) {
    if (votedIds.includes(item.id)) return;
    const next = [...votedIds, item.id];
    setVotedIds(next);
    localStorage.setItem(VOTE_STORAGE_KEY, JSON.stringify(next));
    captureTemplateRoadmapVote({
      requestId: item.id,
      requestTitle: item.title,
      status: item.status,
    });
  }

  function submitRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;

    capturePublicTemplateRequest({
      requestedTemplate: title,
      useCase,
      device,
      email: notify ? email : "",
    });
    setSubmitted(true);
  }

  function resetForm() {
    setTitle("");
    setUseCase("");
    setEmail("");
    setNotify(true);
    setSubmitted(false);
  }

  return (
    <div className="grid gap-14 lg:grid-cols-[minmax(17rem,0.72fr)_minmax(0,1.45fr)] lg:items-start lg:gap-20">
      <aside className="lg:sticky lg:top-24">
        <div className="border-y border-border py-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Add a request
          </p>
          {submitted ? (
            <div className="flex min-h-[30rem] flex-col justify-center" role="status">
              <span className="mb-5 inline-flex size-10 items-center justify-center rounded-full bg-foreground text-background">
                <Check className="size-4" aria-hidden="true" />
              </span>
              <h2 className="text-2xl font-semibold tracking-tight">Request received.</h2>
              <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
                It will be reviewed before appearing on the public roadmap. Popular, specific requests move fastest.
              </p>
              {notify && email.trim() && (
                <p className="mt-4 flex items-start gap-2 text-sm leading-6 text-muted-foreground">
                  <Mail className="mt-1 size-4 shrink-0" aria-hidden="true" />
                  Publication updates are enabled for this request.
                </p>
              )}
              <Button type="button" variant="outline" className="mt-7 w-fit" onClick={resetForm}>
                Request another
              </Button>
            </div>
          ) : (
            <form onSubmit={submitRequest} className="mt-7 space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="public-request-title">What template is missing?</Label>
                <Input
                  id="public-request-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="For example, dog training log"
                  maxLength={100}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="public-request-use-case">How would you use it?</Label>
                <textarea
                  id="public-request-use-case"
                  value={useCase}
                  onChange={(event) => setUseCase(event.target.value)}
                  placeholder="The workflow, pages, or fields that would make it useful"
                  maxLength={400}
                  rows={5}
                  className="w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="public-request-device">Primary device</Label>
                <select
                  id="public-request-device"
                  value={device}
                  onChange={(event) => setDevice(event.target.value as TemplateDevice)}
                  className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                >
                  {devices.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="public-request-email">Email <span className="font-normal text-muted-foreground">(optional)</span></Label>
                <Input
                  id="public-request-email"
                  type="email"
                  inputMode="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  maxLength={160}
                />
              </div>

              <label className={cn(
                "flex cursor-pointer items-start gap-3 text-sm leading-5 text-muted-foreground",
                !email.trim() && "opacity-55",
              )}>
                <input
                  type="checkbox"
                  checked={notify}
                  onChange={(event) => setNotify(event.target.checked)}
                  disabled={!email.trim()}
                  className="mt-0.5 size-4 accent-foreground"
                />
                Email me only when this request is published.
              </label>

              <Button type="submit" size="lg" className="w-full" disabled={!title.trim()}>
                <Send data-icon="inline-start" /> Submit request
              </Button>
              <p className="text-xs leading-5 text-muted-foreground">
                Requests are reviewed for clarity and duplicates. Email is used only for the publication update you request.
              </p>
            </form>
          )}
        </div>
      </aside>

      <div>
        {grouped.map(({ status, items }, groupIndex) => (
          <section
            key={status}
            aria-labelledby={`roadmap-${status}`}
            className={cn(groupIndex > 0 && "mt-14")}
          >
            <div className="flex items-end justify-between gap-5 border-b border-border pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {String(groupIndex + 1).padStart(2, "0")}
                </p>
                <h2 id={`roadmap-${status}`} className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                  {roadmapStatusCopy[status].label}
                </h2>
              </div>
              <p className="hidden max-w-xs text-right text-xs leading-5 text-muted-foreground sm:block">
                {roadmapStatusCopy[status].description}
              </p>
            </div>

            <div>
              {items.length === 0 && (
                <div className="border-b border-border py-8 text-sm leading-6 text-muted-foreground">
                  No reviewed requests are in this stage yet. Submit a specific workflow above to start the queue.
                </div>
              )}
              {items.map((item) => {
                const hasVoted = votedIds.includes(item.id);
                return (
                  <article key={item.id} className="grid gap-5 border-b border-border py-7 sm:grid-cols-[auto_1fr_auto] sm:items-start">
                    <button
                      type="button"
                      onClick={() => voteFor(item)}
                      disabled={hasVoted}
                      aria-label={`${hasVoted ? "Voted for" : "Vote for"} ${item.title}`}
                      className={cn(
                        "group flex h-14 w-16 flex-col items-center justify-center rounded-lg border text-[0.7rem] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                        hasVoted
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-background hover:border-foreground hover:bg-muted",
                      )}
                    >
                      <ChevronUp className="size-4 transition-transform group-hover:-translate-y-0.5" aria-hidden="true" />
                      {hasVoted ? "Voted" : "Vote"}
                    </button>

                    <div>
                      <h3 className="text-lg font-semibold tracking-tight">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                      <p className="mt-3 text-xs leading-5 text-muted-foreground">
                        <span className="font-semibold text-foreground">For:</span> {item.audience}
                      </p>
                    </div>

                    {item.href && (
                      <Button render={<Link href={item.href} />} variant="outline" className="w-fit">
                        Open template <ArrowUpRight data-icon="inline-end" />
                      </Button>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
