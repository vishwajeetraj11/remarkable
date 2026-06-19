"use client";

import {
  createDoc,
  drawHeader,
  drawPageNumber,
  drawSectionTitle,
  drawCheckbox,
} from "@/lib/templates/pdf-utils";
import { COLORS } from "@/lib/templates/constants";
import { TemplateShell } from "@/components/templates/template-shell";
import {
  type TemplateVariants,
  getPageDimensions,
  getMargins,
  variantSuffix,
} from "@/lib/templates/variants";

export default function DebtTrackerPage() {
  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;

    // Debt-list table columns. Creditor takes the most room; the numeric
    // columns are sized so figures + the "$"/"%" fit without crowding.
    const cols = [
      { label: "Creditor / Account", w: 0.3 },
      { label: "Balance", w: 0.16 },
      { label: "APR %", w: 0.11 },
      { label: "Min. Pmt", w: 0.15 },
      { label: "Due", w: 0.12 },
      { label: "Order", w: 0.16 },
    ];

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      drawHeader(doc, variants, { title: "Debt Payoff Tracker", dark: true });

      // ── Debt list table ──────────────────────────────────────────────
      const tableTop = m.top + 44;
      const headerH = 16;
      const rowH = 20;
      // Reserve space at the bottom for a Totals row + the payoff section.
      const payoffH = 132;
      const totalsH = rowH;
      const tableAvail = h - m.bottom - tableTop - headerH - totalsH - payoffH - 16;
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

      // ── Payoff tracking section ──────────────────────────────────────
      const sectionTop = tableBottom + 14;

      // Left: snowball / avalanche method note + balance-countdown legend.
      const colGap = 14;
      const leftW = bodyW * 0.46;
      const rightX = m.left + leftW + colGap;
      const rightW = bodyW - leftW - colGap;

      drawSectionTitle(doc, "Payoff Method", m.left, sectionTop);
      doc.setFontSize(7);
      const [dr, dg, db] = COLORS.textDark;
      doc.setTextColor(dr, dg, db);
      // Two mutually-exclusive method checkboxes.
      const methodY = sectionTop + 12;
      drawCheckbox(doc, m.left, methodY, 8);
      doc.text("Snowball — smallest balance first", m.left + 12, methodY + 7);
      drawCheckbox(doc, m.left, methodY + 16, 8);
      doc.text("Avalanche — highest APR first", m.left + 12, methodY + 23);

      // Extra-payment + target-date capture lines.
      const capY = methodY + 40;
      const [tlr, tlg, tlb] = COLORS.textLight;
      const drawCapture = (label: string, y: number) => {
        doc.setTextColor(tlr, tlg, tlb);
        doc.setFontSize(7);
        doc.text(label, m.left, y);
        const lw = doc.getTextWidth(label);
        const [clr, clg, clb] = COLORS.lineLight;
        doc.setDrawColor(clr, clg, clb);
        doc.setLineWidth(0.4);
        doc.line(m.left + lw + 4, y + 1, m.left + leftW, y + 1);
      };
      drawCapture("Extra $/mo:", capY);
      drawCapture("Debt-free goal:", capY + 16);
      drawCapture("Total paid off:", capY + 32);

      // Right: payoff progress thermometer — segmented bar to colour in as the
      // total balance shrinks, with 0% / 100% anchors.
      doc.setTextColor(dr, dg, db);
      drawSectionTitle(doc, "Payoff Progress", rightX, sectionTop);

      const barY = sectionTop + 12;
      const barH = 18;
      const segments = 10;
      const segW = rightW / segments;
      doc.setDrawColor(lr, lg, lb);
      doc.setLineWidth(0.5);
      doc.rect(rightX, barY, rightW, barH, "S");
      doc.setDrawColor(llr, llg, llb);
      doc.setLineWidth(0.3);
      for (let s = 1; s < segments; s++) {
        const sx = rightX + s * segW;
        doc.line(sx, barY, sx, barY + barH);
      }
      // 0% / 50% / 100% scale labels under the bar.
      doc.setFontSize(6);
      doc.setTextColor(tlr, tlg, tlb);
      doc.text("0%", rightX, barY + barH + 8);
      doc.text("50%", rightX + rightW / 2, barY + barH + 8, { align: "center" });
      doc.text("100%", rightX + rightW, barY + barH + 8, { align: "right" });

      // Milestone checklist beneath the thermometer.
      doc.setTextColor(dr, dg, db);
      doc.setFontSize(7);
      const mileTop = barY + barH + 20;
      const milestones = ["First debt cleared", "Halfway there", "Debt free!"];
      milestones.forEach((label, i) => {
        const my = mileTop + i * 14;
        drawCheckbox(doc, rightX, my, 8);
        doc.text(label, rightX + 12, my + 7);
      });

      const [br, bg, bb] = COLORS.black;
      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`debt-tracker-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Debt Payoff Tracker"
      description="List debts with balance, APR, and minimum payment, then track payoff progress with a snowball/avalanche method and a progress thermometer."
      onGenerate={generate}
      defaultPageCount={1}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>Creditor | Balance | APR | Min. Pmt | Due | Order + Totals</div>
          <div>Snowball/avalanche method + payoff progress thermometer</div>
        </div>
      )}
    </TemplateShell>
  );
}
