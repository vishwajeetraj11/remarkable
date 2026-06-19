import { jsPDF } from "jspdf";
import { COLORS, INK_INTENSITY, MM_TO_PT } from "./constants";
import {
  type TemplateVariants,
  type InkIntensity,
  LINE_SPACING_SCALE,
  getPageDimensions,
  getMargins,
  getSimpleMargins,
} from "./variants";

// Module-level "active" ink intensity. Helpers such as drawCheckbox/drawBox
// don't receive `variants`, so instead of churning ~352 call sites in template
// pages we record the intensity whenever a doc/page is created (both of which
// already receive `variants`) and read it from the structural draw helpers.
// Default is "regular", the identity mapping, so any code path that never sets
// it behaves exactly as before this option existed.
let activeInkIntensity: InkIntensity = "regular";

export function setInkIntensity(intensity: InkIntensity) {
  activeInkIntensity = intensity;
}

// Module-level flag tracking whether the per-document custom title has been
// applied yet. A custom title replaces ONLY the first drawHeader call of a
// generated document; subsequent drawHeader calls (multi-page templates that
// draw distinct per-page titles, e.g. "January 2026") fall back to opts.title.
// Reset to false in createDoc so each generated PDF starts fresh. When no
// custom title is set this flag is never read in a way that changes output,
// so default rendering stays byte-identical.
let customTitleConsumed = false;

// Shift a structural RGB draw color toward lighter/darker per active intensity.
// At "regular" greyShift is 0, so the returned tuple equals the input exactly.
function inkColor(rgb: readonly [number, number, number]): [number, number, number] {
  const { greyShift } = INK_INTENSITY[activeInkIntensity];
  const clamp = (v: number) => Math.max(0, Math.min(255, v + greyShift));
  return [clamp(rgb[0]), clamp(rgb[1]), clamp(rgb[2])];
}

// Scale a structural line width per active intensity.
// At "regular" widthScale is 1, so the returned width equals the input exactly.
function inkWidth(width: number): number {
  return width * INK_INTENSITY[activeInkIntensity].widthScale;
}

export function createDoc(variants: TemplateVariants) {
  setInkIntensity(variants.inkIntensity);
  // Start each document with the custom title unconsumed so the first
  // drawHeader call of this PDF can apply it.
  customTitleConsumed = false;
  const { w, h } = getPageDimensions(variants);
  return new jsPDF({ unit: "pt", format: [w, h] });
}

export function addPage(doc: jsPDF, variants: TemplateVariants) {
  setInkIntensity(variants.inkIntensity);
  const { w, h } = getPageDimensions(variants);
  doc.addPage([w, h]);
}

export interface DrawHeaderOptions {
  title: string;
  subtitle?: string;
  dark?: boolean;
}

// Truncate `text` with a trailing ellipsis so it fits within `maxW`. Assumes
// the caller has already set the font + size that will be used to draw, so the
// measurement matches the rendered glyphs. For text that already fits (e.g. the
// short default template titles) the original string is returned unchanged, so
// this is a no-op for the default rendering path.
function fitTextToWidth(doc: jsPDF, text: string, maxW: number): string {
  if (doc.getTextWidth(text) <= maxW) return text;
  const ellipsis = "…";
  // Reserve room for the ellipsis, then trim characters until it fits.
  let truncated = text;
  while (truncated.length > 0 && doc.getTextWidth(truncated + ellipsis) > maxW) {
    truncated = truncated.slice(0, -1);
  }
  return truncated.length > 0 ? truncated + ellipsis : ellipsis;
}

export function drawHeader(
  doc: jsPDF,
  variants: TemplateVariants,
  opts: DrawHeaderOptions
) {
  const { w } = getPageDimensions(variants);
  const m = getMargins(variants);
  const bodyW = w - m.left - m.right;

  // Allow a user-supplied custom title to override the template's default,
  // but ONLY for the first drawHeader call of the document. Subsequent calls
  // (multi-page templates with distinct per-page titles) keep opts.title.
  // When no custom title is set the resolved title is exactly opts.title for
  // every call and the flag logic is a no-op, so output stays byte-identical
  // to before this option existed.
  const customTitle = variants.customTitle?.trim();
  let title = opts.title;
  if (customTitle && !customTitleConsumed) {
    title = customTitle;
    customTitleConsumed = true;
  }

  if (opts.dark) {
    const [r, g, b] = COLORS.headerBgDark;
    doc.setFillColor(r, g, b);
    doc.rect(m.left, m.top, bodyW, 28, "F");
    const [wr, wg, wb] = COLORS.white;
    doc.setTextColor(wr, wg, wb);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    // Title starts at m.left + 8; keep an 8pt gap before the right edge so the
    // text never collides with the header bar border (measured at 9pt bold).
    const titleX = m.left + 8;
    const maxTitleW = bodyW - 8 - (titleX - m.left);
    doc.text(fitTextToWidth(doc, title, maxTitleW), titleX, m.top + 18);
    if (opts.subtitle) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.text(opts.subtitle, w - m.right - 8, m.top + 18, { align: "right" });
    }
  } else {
    const [r, g, b] = COLORS.headerBg;
    doc.setFillColor(r, g, b);
    doc.rect(m.left, m.top, bodyW, 28, "F");
    const [dr, dg, db] = inkColor(COLORS.lineDark);
    doc.setDrawColor(dr, dg, db);
    doc.setLineWidth(inkWidth(0.5));
    doc.line(m.left, m.top + 28, w - m.right, m.top + 28);
    const [tr, tg, tb] = COLORS.textMedium;
    doc.setTextColor(tr, tg, tb);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    // Title starts at m.left + 6; keep a 6pt gap before the right edge
    // (measured at 8pt bold).
    const titleX = m.left + 6;
    const maxTitleW = bodyW - 6 - (titleX - m.left);
    doc.text(fitTextToWidth(doc, title, maxTitleW), titleX, m.top + 18);
    if (opts.subtitle) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.text(opts.subtitle, w - m.right - 6, m.top + 18, { align: "right" });
    }
  }
  doc.setFont("helvetica", "normal");
  const [br, bg, bb] = COLORS.black;
  doc.setTextColor(br, bg, bb);
}

export function drawPageNumber(
  doc: jsPDF,
  page: number,
  total: number,
  variants: TemplateVariants
) {
  const { w, h } = getPageDimensions(variants);
  const [r, g, b] = COLORS.textLight;
  doc.setFontSize(7);
  doc.setTextColor(r, g, b);
  doc.text(`${page} / ${total}`, w / 2, h - 12, { align: "center" });
  const [br, bg, bb] = COLORS.black;
  doc.setTextColor(br, bg, bb);
}

export function drawHorizontalLines(
  doc: jsPDF,
  variants: TemplateVariants,
  opts: {
    startY: number;
    endY: number;
    spacing: number;
    useBindingMargin?: boolean;
  }
) {
  const { w } = getPageDimensions(variants);
  const m = opts.useBindingMargin !== false ? getMargins(variants) : getSimpleMargins();
  setInkIntensity(variants.inkIntensity);
  const [r, g, b] = inkColor(COLORS.lineLight);
  doc.setDrawColor(r, g, b);
  doc.setLineWidth(inkWidth(0.3));
  // Scale the ruled-line spacing per the chosen density. At "regular" the
  // scale is exactly 1.0, so spacing === opts.spacing and the line positions
  // are byte-identical to before this option existed. Region geometry
  // (startY/endY) is unchanged; only how many ruled lines fit it changes.
  const spacing = opts.spacing * LINE_SPACING_SCALE[variants.lineSpacing];
  let y = opts.startY + spacing;
  while (y <= opts.endY) {
    doc.line(m.left + 4, y, w - m.right - 4, y);
    y += spacing;
  }
}

export function drawCheckbox(
  doc: jsPDF,
  x: number,
  y: number,
  size = 8
) {
  const [r, g, b] = inkColor(COLORS.lineMedium);
  doc.setDrawColor(r, g, b);
  doc.setLineWidth(inkWidth(0.5));
  doc.rect(x, y, size, size, "S");
}

export function drawLabeledLine(
  doc: jsPDF,
  label: string,
  x: number,
  y: number,
  lineEndX: number
) {
  const [tr, tg, tb] = COLORS.textLight;
  doc.setTextColor(tr, tg, tb);
  doc.setFontSize(7);
  doc.text(label, x, y);
  const labelW = doc.getTextWidth(label);
  const [lr, lg, lb] = inkColor(COLORS.lineLight);
  doc.setDrawColor(lr, lg, lb);
  doc.setLineWidth(inkWidth(0.4));
  doc.line(x + labelW + 4, y + 1, lineEndX, y + 1);
  const [br, bg, bb] = COLORS.black;
  doc.setTextColor(br, bg, bb);
}

export function drawSectionTitle(
  doc: jsPDF,
  title: string,
  x: number,
  y: number
) {
  const [r, g, b] = COLORS.textMedium;
  doc.setTextColor(r, g, b);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text(title.toUpperCase(), x, y);
  doc.setFont("helvetica", "normal");
  const [br, bg, bb] = COLORS.black;
  doc.setTextColor(br, bg, bb);
}

export function drawBox(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  opts?: { fill?: boolean; label?: string }
) {
  if (opts?.fill) {
    const [fr, fg, fb] = COLORS.headerBg;
    doc.setFillColor(fr, fg, fb);
    doc.rect(x, y, w, h, "F");
  }
  const [r, g, b] = inkColor(COLORS.lineMedium);
  doc.setDrawColor(r, g, b);
  doc.setLineWidth(inkWidth(0.5));
  doc.rect(x, y, w, h, "S");
  if (opts?.label) {
    drawSectionTitle(doc, opts.label, x + 4, y + 10);
  }
}

export { MM_TO_PT };
