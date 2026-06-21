"use client";

import {
  createDoc,
  drawHeader,
  drawPageNumber,
  drawSectionTitle,
} from "@/lib/templates/pdf-utils";
import { COLORS } from "@/lib/templates/constants";
import { TemplateShell } from "@/components/templates/template-shell";
import {
  type TemplateVariants,
  getPageDimensions,
  getMargins,
  variantSuffix,
} from "@/lib/templates/variants";

export default function SinkingFundsPage() {
  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;

    // Sinking-funds table columns. The fund name takes the most room; the
    // numeric columns are sized so figures + the "$" fit without crowding.
    const cols = [
      { label: "Fund / Purpose", w: 0.28 },
      { label: "Goal $", w: 0.14 },
      { label: "Saved $", w: 0.14 },
      { label: "Remaining $", w: 0.16 },
      { label: "Monthly $", w: 0.14 },
      { label: "Target Date", w: 0.14 },
    ];

    // A handful of representative funds anchor the progress thermometers below
    // so the page reads as a real planner even when blank.
    const progressFunds = [
      "Car / Auto",
      "Holiday / Travel",
      "Gifts",
      "Insurance",
      "Home / Repairs",
      "Emergency",
    ];

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      drawHeader(doc, variants, { title: "Sinking Funds Tracker", dark: true });

      // ── Funds table ──────────────────────────────────────────────────
      const tableTop = m.top + 44;
      const headerH = 16;
      const rowH = 20;
      // Reserve space at the bottom for a Totals row + the progress section.
      const progressH = 150;
      const totalsH = rowH;
      const tableAvail =
        h - m.bottom - tableTop - headerH - totalsH - progressH - 16;
      const listRows = Math.max(6, Math.floor(tableAvail / rowH));
      const tableBottom = tableTop + headerH + (listRows + 1) * rowH; // +1 totals row

      // Header band
      const [hbr, hbg, hbb] = COLORS.headerBg;
      doc.setFillColor(hbr, hbg, hbb);
      doc.rect(m.left, tableTop, bodyW, headerH, "F");

      doc.setFontSize(6.5);
      doc.setFont("helvetica", "bold");
      const [tr, tg, tb] = COLORS.textMedium;
      doc.setTextColor(tr, tg, tb);

      let cx = m.left;
      cols.forEach((col) => {
        doc.text(col.label, cx + 3, tableTop + 11);
        cx += bodyW * col.w;
      });
      doc.setFont("helvetica", "normal");

      // Outer table border (header + list rows + totals row)
      const [lr, lg, lb] = COLORS.lineMedium;
      doc.setDrawColor(lr, lg, lb);
      doc.setLineWidth(0.4);
      doc.rect(m.left, tableTop, bodyW, headerH + (listRows + 1) * rowH, "S");

      // Vertical column separators
      cx = m.left;
      cols.forEach((col) => {
        cx += bodyW * col.w;
        if (cx < w - m.right) {
          doc.line(cx, tableTop, cx, tableBottom);
        }
      });

      // Row separators for the list rows
      const [llr, llg, llb] = COLORS.lineLight;
      for (let r = 0; r < listRows; r++) {
        const ry = tableTop + headerH + (r + 1) * rowH;
        doc.setDrawColor(llr, llg, llb);
        doc.setLineWidth(0.3);
        doc.line(m.left, ry, w - m.right, ry);
      }

      // Totals row — heavier separator above + bold label
      const totalsY = tableTop + headerH + listRows * rowH;
      doc.setDrawColor(lr, lg, lb);
      doc.setLineWidth(0.5);
      doc.line(m.left, totalsY, w - m.right, totalsY);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(tr, tg, tb);
      doc.text("TOTAL", m.left + 4, totalsY + rowH - 7);
      doc.setFont("helvetica", "normal");

      // ── Per-fund progress section ────────────────────────────────────
      // A compact set of progress thermometers — one per representative fund —
      // to colour in as each goal fills up, each with 0% / 100% anchors.
      const sectionTop = tableBottom + 14;

      drawSectionTitle(doc, "Fund Progress", m.left, sectionTop);

      const colGap = 18;
      const progCols = 2;
      const progColW = (bodyW - colGap * (progCols - 1)) / progCols;
      const barTop = sectionTop + 14;
      const rowGap = 30;
      const barH = 12;
      const segments = 10;
      const labelH = 9;

      const [dr, dg, db] = COLORS.textDark;
      const [tlr, tlg, tlb] = COLORS.textLight;

      progressFunds.forEach((label, i) => {
        const col = i % progCols;
        const row = Math.floor(i / progCols);
        const px = m.left + col * (progColW + colGap);
        const py = barTop + row * rowGap;

        // Fund label above the bar.
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(dr, dg, db);
        doc.text(label, px, py);
        doc.setFont("helvetica", "normal");

        // Segmented thermometer to fill in as the fund grows.
        const barY = py + 4;
        doc.setDrawColor(lr, lg, lb);
        doc.setLineWidth(0.5);
        doc.rect(px, barY, progColW, barH, "S");
        const segW = progColW / segments;
        doc.setDrawColor(llr, llg, llb);
        doc.setLineWidth(0.3);
        for (let s = 1; s < segments; s++) {
          const sx = px + s * segW;
          doc.line(sx, barY, sx, barY + barH);
        }

        // 0% / 50% / 100% scale labels under the bar.
        doc.setFontSize(5.5);
        doc.setTextColor(tlr, tlg, tlb);
        const scaleY = barY + barH + labelH - 3;
        doc.text("0%", px, scaleY);
        doc.text("50%", px + progColW / 2, scaleY, { align: "center" });
        doc.text("100%", px + progColW, scaleY, { align: "right" });
      });

      const [br, bg, bb] = COLORS.black;
      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`sinking-funds-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Sinking Funds Tracker"
      description="List sinking funds with goal, saved, and monthly contribution amounts, then track progress toward each goal with per-fund thermometers."
      onGenerate={generate}
      defaultPageCount={1}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>Fund | Goal | Saved | Remaining | Monthly | Target + Totals</div>
          <div>Per-fund progress thermometers with 0–100% anchors</div>
        </div>
      )}
    </TemplateShell>
  );
}
