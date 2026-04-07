"use client";

import { TemplateShell } from "@/components/templates/template-shell";
import {
  createDoc,
  drawPageNumber,
  drawHeader,
  drawSectionTitle,
  drawLabeledLine,
  drawBox,
} from "@/lib/templates/pdf-utils";
import { COLORS } from "@/lib/templates/constants";
import {
  type TemplateVariants,
  getPageDimensions,
  getMargins,
  variantSuffix,
} from "@/lib/templates/variants";

const WEEKS_PER_PAGE = 4;
const TABLE_COLS = ["Week", "Date", "Weight", "Change", "Notes"];

export default function WeightLossTrackerPage() {
  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      const weekStart = page * WEEKS_PER_PAGE + 1;
      const weekEnd = weekStart + WEEKS_PER_PAGE - 1;

      drawHeader(doc, variants, {
        title: "Weight Loss Tracker",
        subtitle: `Weeks ${weekStart}–${weekEnd}`,
      });

      let y = m.top + 38;

      drawLabeledLine(doc, "Goal Weight:", m.left + 4, y, m.left + bodyW * 0.35);
      drawLabeledLine(doc, "Starting Weight:", m.left + bodyW * 0.4, y, w - m.right - 4);

      y += 18;

      drawSectionTitle(doc, "Weekly Log", m.left + 4, y);
      y += 8;

      const colWidths = [
        bodyW * 0.1,
        bodyW * 0.22,
        bodyW * 0.16,
        bodyW * 0.16,
        bodyW * 0.36,
      ];
      const rowH = 22;

      const [hbr, hbg, hbb] = COLORS.headerBg;
      doc.setFillColor(hbr, hbg, hbb);
      doc.rect(m.left, y, bodyW, rowH, "F");

      doc.setFontSize(6);
      doc.setFont("helvetica", "bold");
      const [tmr, tmg, tmb] = COLORS.textMedium;
      doc.setTextColor(tmr, tmg, tmb);

      let cx = m.left;
      for (let c = 0; c < TABLE_COLS.length; c++) {
        doc.text(TABLE_COLS[c], cx + 6, y + 14);
        cx += colWidths[c];
      }
      doc.setFont("helvetica", "normal");

      const [lmr, lmg, lmb] = COLORS.lineMedium;
      doc.setDrawColor(lmr, lmg, lmb);
      doc.setLineWidth(0.4);
      doc.rect(m.left, y, bodyW, rowH * (WEEKS_PER_PAGE + 1), "S");

      cx = m.left;
      for (let c = 0; c < TABLE_COLS.length - 1; c++) {
        cx += colWidths[c];
        doc.line(cx, y, cx, y + rowH * (WEEKS_PER_PAGE + 1));
      }

      for (let r = 1; r <= WEEKS_PER_PAGE; r++) {
        const ry = y + r * rowH;
        const [llr, llg, llb] = COLORS.lineLight;
        doc.setDrawColor(llr, llg, llb);
        doc.setLineWidth(0.3);
        doc.line(m.left, ry, w - m.right, ry);

        const [tlr, tlg, tlb] = COLORS.textLight;
        doc.setTextColor(tlr, tlg, tlb);
        doc.setFontSize(7);
        doc.text(String(weekStart + r - 1), m.left + 6, ry + 14);
      }

      y += rowH * (WEEKS_PER_PAGE + 1) + 16;

      drawSectionTitle(doc, "Progress Chart", m.left + 4, y);
      y += 8;

      const graphH = h - m.bottom - y - 20;
      const graphW = bodyW - 30;
      const graphLeft = m.left + 30;

      drawBox(doc, graphLeft, y, graphW, graphH);

      const gridRows = 8;
      const gridCols = WEEKS_PER_PAGE;
      const cellH = graphH / gridRows;
      const cellW = graphW / gridCols;

      const [llr, llg, llb] = COLORS.lineLight;
      doc.setDrawColor(llr, llg, llb);
      doc.setLineWidth(0.2);

      for (let r = 1; r < gridRows; r++) {
        const gy = y + r * cellH;
        doc.line(graphLeft, gy, graphLeft + graphW, gy);
      }
      for (let c = 1; c < gridCols; c++) {
        const gx = graphLeft + c * cellW;
        doc.line(gx, y, gx, y + graphH);
      }

      const [tlr2, tlg2, tlb2] = COLORS.textLight;
      doc.setTextColor(tlr2, tlg2, tlb2);
      doc.setFontSize(5);

      doc.text("Weight", m.left + 2, y + graphH / 2, { angle: 90 });

      for (let c = 0; c < gridCols; c++) {
        doc.text(
          `Wk ${weekStart + c}`,
          graphLeft + c * cellW + cellW / 2,
          y + graphH + 10,
          { align: "center" }
        );
      }

      for (let r = 0; r <= gridRows; r++) {
        doc.text("___", m.left + 8, y + r * cellH + 3);
      }

      const [br, bg, bb] = COLORS.black;
      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`weight-loss-tracker-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Weight Loss Tracker"
      description="12-week weight tracking with weekly logs, change tracking, and a blank progress chart grid."
      onGenerate={generate}
      defaultPageCount={3}
      maxPages={12}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>4 weeks per page</div>
          <div>Weekly log: date, weight, change, notes</div>
          <div>Blank progress chart grid</div>
          <div>Goal + starting weight fields</div>
        </div>
      )}
    </TemplateShell>
  );
}
