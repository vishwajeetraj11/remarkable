import { jsPDF } from "jspdf";
import { COLORS } from "./constants";
import {
  type TemplateVariants,
  getPageDimensions,
  getMargins,
} from "./variants";

export interface PackTemplate {
  name: string;
  description: string;
  generate: (doc: jsPDF, variants: TemplateVariants) => void;
}

export interface PackConfig {
  name: string;
  number: number;
  templates: PackTemplate[];
}

export function generatePackPdf(pack: PackConfig, variants: TemplateVariants) {
  const { w, h } = getPageDimensions(variants);
  const doc = new jsPDF({ unit: "pt", format: [w, h] });
  const m = getMargins(variants);
  const bodyW = w - m.left - m.right;

  // Index page
  const [hr, hg, hb] = COLORS.headerBgDark;
  doc.setFillColor(hr, hg, hb);
  doc.rect(m.left, m.top, bodyW, 36, "F");
  const [wr, wg, wb] = COLORS.white;
  doc.setTextColor(wr, wg, wb);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Pack ${pack.number}: ${pack.name}`, m.left + 10, m.top + 24);

  doc.setFont("helvetica", "normal");
  const [br, bg, bb] = COLORS.black;
  doc.setTextColor(br, bg, bb);

  let y = m.top + 56;
  doc.setFontSize(8);
  const [tr, tg, tb] = COLORS.textMedium;
  doc.setTextColor(tr, tg, tb);
  doc.text("CONTENTS", m.left + 4, y);
  y += 16;

  let currentPage = 2;
  const pageMap: { name: string; startPage: number; rowY: number }[] = [];

  pack.templates.forEach((tpl, idx) => {
    pageMap.push({ name: tpl.name, startPage: currentPage, rowY: y });

    doc.setFontSize(9);
    doc.setTextColor(br, bg, bb);
    doc.text(`${idx + 1}. ${tpl.name}`, m.left + 10, y);

    const pageStr = `p. ${currentPage}`;
    doc.setFontSize(7);
    doc.setTextColor(tr, tg, tb);
    doc.text(pageStr, w - m.right - 10, y, { align: "right" });

    // Dot leader
    const nameW = doc.getTextWidth(`${idx + 1}. ${tpl.name}`);
    const pageW = doc.getTextWidth(pageStr);
    const leaderStart = m.left + 10 + nameW + 4;
    const leaderEnd = w - m.right - 10 - pageW - 4;
    doc.setFontSize(6);
    const [lr, lg, lb] = COLORS.lineLight;
    doc.setTextColor(lr, lg, lb);
    let dotX = leaderStart;
    while (dotX < leaderEnd) {
      doc.text(".", dotX, y);
      dotX += 4;
    }

    y += 6;
    doc.setFontSize(7);
    doc.setTextColor(tr, tg, tb);
    doc.text(tpl.description, m.left + 18, y);
    y += 18;

    currentPage += 1;
  });

  // Add internal links from index to each template section
  pageMap.forEach((entry) => {
    doc.link(m.left, entry.rowY - 10, bodyW, 26, { pageNumber: entry.startPage });
  });

  // Page number on index
  doc.setFontSize(7);
  const [pr, pg, pb] = COLORS.textLight;
  doc.setTextColor(pr, pg, pb);
  doc.text("1 / " + (pack.templates.length + 1), w / 2, h - 12, {
    align: "center",
  });

  // Generate each template
  pack.templates.forEach((tpl, idx) => {
    doc.addPage([w, h]);
    tpl.generate(doc, variants);

    doc.setFontSize(7);
    doc.setTextColor(pr, pg, pb);
    doc.text(
      `${idx + 2} / ${pack.templates.length + 1}`,
      w / 2,
      h - 12,
      { align: "center" }
    );
  });

  doc.setTextColor(br, bg, bb);
  return doc;
}
