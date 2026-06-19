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
  return `${d}-${o}-${h}${i}${ls}`;
}
