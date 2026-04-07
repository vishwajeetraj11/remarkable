import { jsPDF } from "jspdf";
import { COLORS, MM_TO_PT } from "./constants";
import {
  type TemplateVariants,
  getPageDimensions,
  getMargins,
  getSimpleMargins,
} from "./variants";

export function createDoc(variants: TemplateVariants) {
  const { w, h } = getPageDimensions(variants);
  return new jsPDF({ unit: "pt", format: [w, h] });
}

export function addPage(doc: jsPDF, variants: TemplateVariants) {
  const { w, h } = getPageDimensions(variants);
  doc.addPage([w, h]);
}

export interface DrawHeaderOptions {
  title: string;
  subtitle?: string;
  dark?: boolean;
}

export function drawHeader(
  doc: jsPDF,
  variants: TemplateVariants,
  opts: DrawHeaderOptions
) {
  const { w } = getPageDimensions(variants);
  const m = getMargins(variants);
  const bodyW = w - m.left - m.right;

  if (opts.dark) {
    const [r, g, b] = COLORS.headerBgDark;
    doc.setFillColor(r, g, b);
    doc.rect(m.left, m.top, bodyW, 28, "F");
    const [wr, wg, wb] = COLORS.white;
    doc.setTextColor(wr, wg, wb);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(opts.title, m.left + 8, m.top + 18);
    if (opts.subtitle) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.text(opts.subtitle, w - m.right - 8, m.top + 18, { align: "right" });
    }
  } else {
    const [r, g, b] = COLORS.headerBg;
    doc.setFillColor(r, g, b);
    doc.rect(m.left, m.top, bodyW, 28, "F");
    const [dr, dg, db] = COLORS.lineDark;
    doc.setDrawColor(dr, dg, db);
    doc.setLineWidth(0.5);
    doc.line(m.left, m.top + 28, w - m.right, m.top + 28);
    const [tr, tg, tb] = COLORS.textMedium;
    doc.setTextColor(tr, tg, tb);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(opts.title, m.left + 6, m.top + 18);
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
  const [r, g, b] = COLORS.lineLight;
  doc.setDrawColor(r, g, b);
  doc.setLineWidth(0.3);
  let y = opts.startY + opts.spacing;
  while (y <= opts.endY) {
    doc.line(m.left + 4, y, w - m.right - 4, y);
    y += opts.spacing;
  }
}

export function drawCheckbox(
  doc: jsPDF,
  x: number,
  y: number,
  size = 8
) {
  const [r, g, b] = COLORS.lineMedium;
  doc.setDrawColor(r, g, b);
  doc.setLineWidth(0.5);
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
  const [lr, lg, lb] = COLORS.lineLight;
  doc.setDrawColor(lr, lg, lb);
  doc.setLineWidth(0.4);
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
  const [r, g, b] = COLORS.lineMedium;
  doc.setDrawColor(r, g, b);
  doc.setLineWidth(0.5);
  doc.rect(x, y, w, h, "S");
  if (opts?.label) {
    drawSectionTitle(doc, opts.label, x + 4, y + 10);
  }
}

export { MM_TO_PT };
