"use client";

import { useState } from "react";
import { Check, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  captureTemplateRequest,
  type TemplateCategory,
  type TemplateDevice,
} from "@/lib/analytics";
import { cn } from "@/lib/utils";

const categories: { value: TemplateCategory; label: string }[] = [
  { value: "planning", label: "Planning & productivity" },
  { value: "work", label: "Work & meetings" },
  { value: "study", label: "Study & teaching" },
  { value: "finance", label: "Money & life admin" },
  { value: "wellness", label: "Health & wellness" },
  { value: "family", label: "Family & home" },
  { value: "other", label: "Something else" },
];

const devices: { value: TemplateDevice; label: string }[] = [
  { value: "remarkable-2", label: "reMarkable 2" },
  { value: "remarkable-paper-pro", label: "reMarkable Paper Pro" },
  {
    value: "remarkable-paper-pro-move",
    label: "reMarkable Paper Pro Move",
  },
  { value: "remarkable-paper-pure", label: "reMarkable Paper Pure" },
  { value: "supernote", label: "Supernote" },
  { value: "boox", label: "BOOX" },
  { value: "kindle-scribe", label: "Kindle Scribe" },
  { value: "printable", label: "Printed paper" },
  { value: "other", label: "Other" },
];

export function TemplateRequestForm({
  sourcePage,
  initialRequest = "",
  className,
}: {
  sourcePage: string;
  initialRequest?: string;
  className?: string;
}) {
  const [requestedTemplate, setRequestedTemplate] = useState(initialRequest);
  const [useCase, setUseCase] = useState("");
  const [category, setCategory] = useState<TemplateCategory>("planning");
  const [device, setDevice] = useState<TemplateDevice>("remarkable-2");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!requestedTemplate.trim()) return;

    captureTemplateRequest({
      requestedTemplate,
      useCase,
      category,
      device,
      sourcePage,
    });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div
        className={cn(
          "flex min-h-48 flex-col items-start justify-center border-y border-border py-8",
          className,
        )}
        role="status"
      >
        <span className="mb-4 inline-flex size-9 items-center justify-center rounded-full bg-foreground text-background">
          <Check className="size-4" aria-hidden="true" />
        </span>
        <h3 className="font-semibold">Request recorded</h3>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          Thanks. We use requests like yours to decide what to build next.
        </p>
        <Button
          type="button"
          variant="link"
          className="mt-3 h-auto px-0"
          onClick={() => {
            setRequestedTemplate("");
            setUseCase("");
            setSubmitted(false);
          }}
        >
          Request another template
        </Button>
      </div>
    );
  }

  return (
    <section
      className={cn(
        "grid gap-8 border-y border-border py-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-14",
        className,
      )}
      aria-labelledby="template-request-heading"
    >
      <div>
        <Lightbulb className="mb-4 size-5 text-muted-foreground" aria-hidden="true" />
        <h2 id="template-request-heading" className="text-xl font-semibold tracking-tight">
          Missing something useful?
        </h2>
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
          Tell us what would earn a permanent place on your tablet. Requests are
          anonymous and directly shape the next templates we make.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="requested-template">Template you need</Label>
          <Input
            id="requested-template"
            value={requestedTemplate}
            onChange={(event) => setRequestedTemplate(event.target.value)}
            placeholder="For example, teacher lesson planner"
            maxLength={100}
            required
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="template-use-case">What would you use it for?</Label>
          <Input
            id="template-use-case"
            value={useCase}
            onChange={(event) => setUseCase(event.target.value)}
            placeholder="A short example helps us design it well"
            maxLength={160}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="template-category">Category</Label>
          <select
            id="template-category"
            value={category}
            onChange={(event) => setCategory(event.target.value as TemplateCategory)}
            className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          >
            {categories.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="template-device">Device</Label>
          <select
            id="template-device"
            value={device}
            onChange={(event) => setDevice(event.target.value as TemplateDevice)}
            className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          >
            {devices.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between gap-4 pt-1 sm:col-span-2">
          <p className="text-xs text-muted-foreground">No email or account required.</p>
          <Button type="submit" disabled={!requestedTemplate.trim()}>
            Send request
          </Button>
        </div>
      </form>
    </section>
  );
}
