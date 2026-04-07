"use client";

import {
  createDoc,
  drawHeader,
  drawPageNumber,
  drawSectionTitle,
  drawLabeledLine,
  drawHorizontalLines,
} from "@/lib/templates/pdf-utils";
import { COLORS } from "@/lib/templates/constants";
import { TemplateShell } from "@/components/templates/template-shell";
import {
  type TemplateVariants,
  getPageDimensions,
  getMargins,
  variantSuffix,
} from "@/lib/templates/variants";

export default function MonthlyBudgetPage() {
  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;

    const categories = [
      "Housing", "Utilities", "Groceries", "Transport",
      "Insurance", "Subscriptions", "Entertainment", "Savings",
      "Debt Payments", "Other",
    ];

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      drawHeader(doc, variants, { title: "Monthly Budget", dark: true });

      let y = m.top + 44;
      drawLabeledLine(doc, "Month:", m.left + 4, y, m.left + 140);
      drawLabeledLine(doc, "Income:", m.left + 150, y, w - m.right - 4);

      y += 20;
      // Table header
      const cols = [
        { label: "Category", w: 0.35 },
        { label: "Budget", w: 0.2 },
        { label: "Actual", w: 0.2 },
        { label: "Diff", w: 0.25 },
      ];

      const rowH = 20;
      const headerH = 16;
      const [hbr, hbg, hbb] = COLORS.headerBg;
      doc.setFillColor(hbr, hbg, hbb);
      doc.rect(m.left, y, bodyW, headerH, "F");

      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      const [tr, tg, tb] = COLORS.textMedium;
      doc.setTextColor(tr, tg, tb);

      let cx = m.left;
      cols.forEach((col) => {
        doc.text(col.label, cx + 4, y + 11);
        cx += bodyW * col.w;
      });
      doc.setFont("helvetica", "normal");

      // Table border
      const [lr, lg, lb] = COLORS.lineMedium;
      doc.setDrawColor(lr, lg, lb);
      doc.setLineWidth(0.4);
      const tableH = headerH + (categories.length + 1) * rowH;
      doc.rect(m.left, y, bodyW, tableH, "S");

      // Column lines
      cx = m.left;
      cols.forEach((col) => {
        cx += bodyW * col.w;
        if (cx < w - m.right) {
          doc.line(cx, y, cx, y + tableH);
        }
      });

      // Row lines + category labels
      const [llr, llg, llb] = COLORS.lineLight;
      const [br, bg, bb] = COLORS.black;
      for (let r = 0; r <= categories.length; r++) {
        const ry = y + headerH + r * rowH;
        doc.setDrawColor(llr, llg, llb);
        doc.setLineWidth(0.3);
        doc.line(m.left, ry, w - m.right, ry);

        if (r < categories.length) {
          doc.setFontSize(7);
          doc.setTextColor(br, bg, bb);
          doc.text(categories[r], m.left + 4, ry + 13);
        }
      }

      // Total row
      const totalY = y + headerH + categories.length * rowH;
      doc.setFillColor(hbr, hbg, hbb);
      doc.rect(m.left, totalY, bodyW, rowH, "F");
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(br, bg, bb);
      doc.text("TOTAL", m.left + 4, totalY + 13);
      doc.setFont("helvetica", "normal");

      // Notes section below table
      const notesY = y + tableH + 16;
      if (notesY < h - m.bottom - 40) {
        drawSectionTitle(doc, "Notes", m.left + 4, notesY);
        drawHorizontalLines(doc, variants, {
          startY: notesY + 4,
          endY: h - m.bottom,
          spacing: 18,
        });
      }

      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`monthly-budget-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Monthly Budget"
      description="Budget table with 10 categories, budget vs. actual columns, and a notes section."
      onGenerate={generate}
      defaultPageCount={3}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>10 pre-labeled expense categories</div>
          <div>Budget / Actual / Difference columns</div>
          <div>Total row at bottom</div>
          <div>Notes section</div>
        </div>
      )}
    </TemplateShell>
  );
}
