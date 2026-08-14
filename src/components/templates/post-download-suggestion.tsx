"use client";

import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  captureTemplateRequest,
  captureTemplateSuggestion,
  normalizeTemplateDevice,
} from "@/lib/analytics";

const suggestions = [
  { value: "dated-planners", label: "Dated planners" },
  { value: "study-teaching", label: "Study & teaching" },
  { value: "work-meetings", label: "Work & meetings" },
  { value: "health-wellness", label: "Health & wellness" },
] as const;

export function PostDownloadSuggestion({
  templateSlug,
  templateName,
  device,
}: {
  templateSlug: string;
  templateName: string;
  device: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [customRequest, setCustomRequest] = useState("");
  const [customSubmitted, setCustomSubmitted] = useState(false);

  function selectSuggestion(value: string) {
    captureTemplateSuggestion({
      suggestion: value,
      templateSlug,
      templateName,
      device,
    });
    setSelected(value);
  }

  function submitCustomRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customRequest.trim()) return;
    captureTemplateRequest({
      requestedTemplate: customRequest,
      category: "other",
      device: normalizeTemplateDevice(device),
      sourcePage: `${templateSlug}#after-download`,
    });
    captureTemplateSuggestion({
      suggestion: "custom-request",
      templateSlug,
      templateName,
      device,
    });
    setCustomSubmitted(true);
  }

  return (
    <section
      className="mt-8 border-y border-border py-6"
      aria-labelledby="next-template-heading"
    >
      <div className="flex items-start gap-3">
        <Sparkles className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <h2 id="next-template-heading" className="text-sm font-semibold">
            What should we create next?
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            One click helps us choose what to build.
          </p>

          {selected ? (
            <p className="mt-4 flex items-center gap-2 text-sm" role="status">
              <Check className="size-4" aria-hidden="true" />
              Vote recorded. Thank you.
            </p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <Button
                  key={suggestion.value}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => selectSuggestion(suggestion.value)}
                >
                  {suggestion.label}
                </Button>
              ))}
            </div>
          )}

          {!selected && !customSubmitted && (
            <form onSubmit={submitCustomRequest} className="mt-3 flex max-w-lg gap-2">
              <Input
                value={customRequest}
                onChange={(event) => setCustomRequest(event.target.value)}
                placeholder="Something else…"
                aria-label="Suggest another template"
                maxLength={100}
              />
              <Button type="submit" variant="ghost" disabled={!customRequest.trim()}>
                Send
              </Button>
            </form>
          )}

          {customSubmitted && (
            <p className="mt-4 flex items-center gap-2 text-sm" role="status">
              <Check className="size-4" aria-hidden="true" />
              Request recorded. Thank you.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
