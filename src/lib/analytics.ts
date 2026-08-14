/**
 * Thin PostHog capture helpers, safe to call from any client component.
 * posthog-js is imported lazily and only when a key is configured, so these
 * are no-ops in dev without env and add nothing to the initial bundle.
 * Initialization itself lives in `PostHogInit` (loaded in the root layout).
 */

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;

export function captureEvent(name: string, props?: Record<string, unknown>) {
  if (!KEY || typeof window === "undefined") return;
  import("posthog-js").then(({ default: posthog }) => {
    if (posthog.__loaded) posthog.capture(name, props);
  });
}

const MAX_ANALYTICS_LABEL_LENGTH = 100;

function cleanAnalyticsLabel(value: string | null | undefined) {
  const cleaned = value?.replace(/\s+/g, " ").trim();
  return cleaned ? cleaned.slice(0, MAX_ANALYTICS_LABEL_LENGTH) : undefined;
}

/**
 * Resolve a stable, human-readable name for a form control without requiring
 * every call site to duplicate analytics props. Explicit data attributes and
 * accessible labels win; nearby labels cover the generator control layout.
 */
export function getAnalyticsControlName(
  element: Element | null,
  fallback?: string,
) {
  if (!element) return cleanAnalyticsLabel(fallback) ?? "unknown";

  const explicit =
    element.getAttribute("data-analytics-name") ||
    element.getAttribute("aria-label") ||
    element.getAttribute("name");
  if (explicit) return cleanAnalyticsLabel(explicit) ?? "unknown";

  // Regular buttons are named by their own visible text. Looking for a nearby
  // form label can incorrectly associate a submit button with the last field
  // in its container. Select triggers are the exception because their label is
  // intentionally rendered as a sibling.
  if (
    element.matches("button, [data-slot='button'], [role='button']") &&
    !element.matches("[data-slot='select-trigger']")
  ) {
    return cleanAnalyticsLabel(fallback) ?? "button";
  }

  const wrappingLabel = element.closest("label");
  if (wrappingLabel) {
    const wrappingLabelText = cleanAnalyticsLabel(wrappingLabel.textContent);
    if (wrappingLabelText) return wrappingLabelText;
  }

  const id = element.getAttribute("id");
  if (id) {
    const escapedId =
      typeof CSS !== "undefined" && CSS.escape ? CSS.escape(id) : id;
    const label = document.querySelector(`label[for="${escapedId}"]`);
    const labelText = cleanAnalyticsLabel(label?.textContent);
    if (labelText) return labelText;
  }

  let parent = element.parentElement;
  for (let depth = 0; parent && depth < 3; depth += 1) {
    const directLabel = Array.from(parent.children).find(
      (child) => child.tagName === "LABEL",
    );
    const nestedLabels = parent.querySelectorAll("label");
    const labelText = cleanAnalyticsLabel(
      (directLabel ?? (nestedLabels.length === 1 ? nestedLabels[0] : null))
        ?.textContent,
    );
    if (labelText) {
      // Slider labels commonly display the live value ("Pages: 3"). Keep the
      // property cardinality stable while the numeric value travels separately.
      if (element.matches("input[type='range']") && labelText.includes(":")) {
        return labelText.split(":", 1)[0];
      }
      return labelText;
    }
    parent = parent.parentElement;
  }

  return (
    cleanAnalyticsLabel(element.getAttribute("placeholder")) ??
    cleanAnalyticsLabel(fallback) ??
    "unknown"
  );
}

export function captureUiInputChanged(props: {
  controlName: string;
  controlType: string;
  value?: string | number | boolean;
  previousValue?: string | number | boolean;
  valueLength?: number;
  hasValue?: boolean;
  changeReason?: string;
}) {
  captureEvent("ui_input_changed", {
    path: window.location.pathname,
    control_name: props.controlName,
    control_type: props.controlType,
    value: props.value,
    previous_value: props.previousValue,
    value_length: props.valueLength,
    has_value: props.hasValue,
    change_reason: props.changeReason,
  });
}

export type TemplateDevice =
  | "remarkable-2"
  | "remarkable-paper-pro"
  | "remarkable-paper-pro-move"
  | "remarkable-paper-pure"
  | "supernote"
  | "boox"
  | "kindle-scribe"
  | "printable"
  | "other";

export type TemplateCategory =
  | "planning"
  | "work"
  | "study"
  | "finance"
  | "wellness"
  | "family"
  | "other";

export function normalizeTemplateDevice(device: string): TemplateDevice {
  if (device === "remarkable2") return "remarkable-2";
  if (device === "paperPro") return "remarkable-paper-pro";
  if (device === "paperProMove") return "remarkable-paper-pro-move";
  if (device === "paperPure") return "remarkable-paper-pure";
  if (["supernote", "supernoteManta"].includes(device)) return "supernote";
  if (["booxNote", "booxTab"].includes(device)) return "boox";
  if (device === "kindleScribe") return "kindle-scribe";
  if (["a4", "letter"].includes(device)) return "printable";
  if (
    [
      "remarkable-2",
      "remarkable-paper-pro",
      "remarkable-paper-pro-move",
      "remarkable-paper-pure",
      "supernote",
      "boox",
      "kindle-scribe",
      "printable",
    ].includes(device)
  ) {
    return device as TemplateDevice;
  }
  return "other";
}

/** Keep template-demand event names and property keys consistent in PostHog. */
export function captureTemplateSearch(
  query: string,
  resultCount: number,
  sourcePage: string,
) {
  const props = {
    search_query: query.trim().toLowerCase(),
    result_count: resultCount,
    source_page: sourcePage,
  };
  captureEvent("template_search", props);
  if (resultCount === 0) captureEvent("template_search_no_results", props);
}

export function captureTemplateRequest(props: {
  requestedTemplate: string;
  useCase?: string;
  category: TemplateCategory;
  device: TemplateDevice;
  sourcePage: string;
}) {
  captureEvent("template_request_submitted", {
    requested_template: props.requestedTemplate.trim(),
    use_case: props.useCase?.trim() || undefined,
    category: props.category,
    device: normalizeTemplateDevice(props.device),
    source_page: props.sourcePage,
  });
}

export function captureTemplateSuggestion(props: {
  suggestion: string;
  templateSlug: string;
  templateName: string;
  device: string;
}) {
  captureEvent("template_suggestion_selected", {
    suggestion: props.suggestion,
    template_slug: props.templateSlug,
    template_name: props.templateName,
    device: normalizeTemplateDevice(props.device),
    source_page: props.templateSlug,
  });
}

export function captureTemplateFunnelEvent(
  name: "template_generator_started" | "template_generated",
  props: {
    templateSlug: string;
    templateName: string;
    device: string;
    orientation: string;
    pageCount: number;
  },
) {
  captureEvent(name, {
    template_slug: props.templateSlug,
    template_name: props.templateName,
    device: normalizeTemplateDevice(props.device),
    orientation: props.orientation,
    page_count: props.pageCount,
    source_page: props.templateSlug,
  });
}

/** Record an email signup and tie the anonymous person to the address. */
export function captureEmailSubmitted(email: string) {
  if (!KEY || typeof window === "undefined") return;
  import("posthog-js").then(({ default: posthog }) => {
    if (!posthog.__loaded) return;
    posthog.identify(email, { email });
    posthog.capture("email_submitted", { email });
  });
}
