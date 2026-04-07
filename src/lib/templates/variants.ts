import { DEVICES, type DeviceKey } from "./constants";

export type WeekStart = "monday" | "sunday";
export type Handedness = "right" | "left";
export type Orientation = "portrait" | "landscape";

export interface TemplateVariants {
  weekStart: WeekStart;
  handedness: Handedness;
  orientation: Orientation;
  device: DeviceKey;
}

export const DEFAULT_VARIANTS: TemplateVariants = {
  weekStart: "monday",
  handedness: "right",
  orientation: "portrait",
  device: "remarkable2",
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
  return `${d}-${o}-${h}`;
}
