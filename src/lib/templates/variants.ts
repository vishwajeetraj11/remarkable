import { DEVICES, type DeviceKey } from "./constants";

export type WeekStart = "monday" | "sunday";
export type Handedness = "right" | "left";
export type Orientation = "portrait" | "landscape";
export type InkIntensity = "light" | "regular" | "bold";
export type LineSpacing = "narrow" | "regular" | "wide";

export interface TemplateVariants {
  weekStart: WeekStart;
  handedness: Handedness;
  orientation: Orientation;
  device: DeviceKey;
  inkIntensity: InkIntensity;
  // Ruled-line density for templates with ruled writing lines (see
  // drawHorizontalLines). "regular" is the identity (scale 1.0) so default
  // output stays byte-identical.
  lineSpacing: LineSpacing;
  // Optional user-supplied page title that overrides the template's default
  // header title (see drawHeader). Empty/absent means "use the default".
  customTitle?: string;
  // Optional tappable prev/next page navigation drawn in the shared footer
  // (see drawPageNumber). Opt-in, default false; when false the footer is
  // byte-identical to before this option existed. Only meaningful for
  // multi-page output (the runtime guard also requires total > 1).
  tappableNav?: boolean;
  // Optional start date (ISO YYYY-MM-DD, from an <input type="date">) printed
  // as a formatted date in the header subtitle (see drawHeader + formatStartDate).
  // Only meaningful for templates that draw a header via drawHeader. Empty/absent
  // means "no date"; when empty the header subtitle is byte-identical to before
  // this option existed.
  startDate?: string;
}

// Format an ISO YYYY-MM-DD date for display in a header, e.g. "Mon, 6 Jan 2026"
// (weekday + day + month + year). Returns "" for empty/invalid input.
//
// IMPORTANT: the ISO string is parsed as a LOCAL date by constructing the Date
// from explicit y/m/d parts. We deliberately avoid `new Date("YYYY-MM-DD")`,
// which the spec parses as UTC midnight — in negative-offset (e.g. US) zones
// that renders as the previous calendar day.
export function formatStartDate(iso: string | undefined): string {
  if (!iso) return "";
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return "";
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  // Reject impossible dates (e.g. 2026-02-31 would roll over to March).
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return "";
  }
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${weekdays[date.getDay()]}, ${day} ${months[month - 1]} ${year}`;
}

// Multiplier applied to drawHorizontalLines' base spacing per line-density
// choice. "regular" MUST be exactly 1.0 so the ruled output is byte-identical
// to before this option existed (spacing * 1.0 === spacing).
export const LINE_SPACING_SCALE: Record<LineSpacing, number> = {
  narrow: 0.8,
  regular: 1.0,
  wide: 1.25,
};

export const DEFAULT_VARIANTS: TemplateVariants = {
  weekStart: "monday",
  handedness: "right",
  orientation: "portrait",
  device: "remarkable2",
  inkIntensity: "regular",
  lineSpacing: "regular",
  customTitle: "",
  tappableNav: false,
  startDate: "",
};

export function getPageDimensions(variants: TemplateVariants) {
  const { w, h } = DEVICES[variants.device];
  return variants.orientation === "landscape" ? { w: h, h: w } : { w, h };
}

export function getMargins(variants: TemplateVariants) {
  const m = 28;
  const binding = 56;
  if (variants.handedness === "left") {
    return { top: m, bottom: m, left: m, right: binding };
  }
  return { top: m, bottom: m, left: binding, right: m };
}

export function getSimpleMargins() {
  return { top: 28, bottom: 28, left: 28, right: 28 };
}

export function variantSuffix(v: TemplateVariants) {
  const d = v.device === "remarkable2" ? "rm2" : v.device === "paperPro" ? "pp" : v.device;
  const o = v.orientation === "portrait" ? "p" : "l";
  const h = v.handedness === "right" ? "rh" : "lh";
  const i = v.inkIntensity === "regular" ? "" : `-${v.inkIntensity}`;
  const ls = v.lineSpacing === "regular" ? "" : `-${v.lineSpacing}`;
  const nav = v.tappableNav ? "-nav" : "";
  // Append "-dated" when a valid start date is set; never embed the raw date in
  // the filename. Empty/invalid startDate adds nothing, keeping the default
  // suffix unchanged.
  const dated = formatStartDate(v.startDate) ? "-dated" : "";
  return `${d}-${o}-${h}${i}${ls}${nav}${dated}`;
}
