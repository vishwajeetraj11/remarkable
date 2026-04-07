"use client";

import {
  createDoc,
  drawHeader,
  drawPageNumber,
} from "@/lib/templates/pdf-utils";
import { COLORS } from "@/lib/templates/constants";
import { TemplateShell } from "@/components/templates/template-shell";
import {
  type TemplateVariants,
  getPageDimensions,
  getMargins,
  variantSuffix,
} from "@/lib/templates/variants";

export default function ExpenseTrackerPage() {
  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;

    const cols = [
      { label: "Date", w: 0.14 },
      { label: "Description", w: 0.36 },
      { label: "Category", w: 0.2 },
      { label: "Amount", w: 0.15 },
      { label: "Paid By", w: 0.15 },
    ];

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      drawHeader(doc, variants, { title: "Expense Tracker", dark: true });

      const tableTop = m.top + 44;
      const headerH = 16;
      const rowH = 20;
      const maxRows = Math.floor((h - m.bottom - tableTop - headerH - 20) / rowH);

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

      const [lr, lg, lb] = COLORS.lineMedium;
      doc.setDrawColor(lr, lg, lb);
      doc.setLineWidth(0.4);
      doc.rect(m.left, tableTop, bodyW, headerH + maxRows * rowH, "S");

      cx = m.left;
      cols.forEach((col) => {
        cx += bodyW * col.w;
        if (cx < w - m.right) {
          doc.line(cx, tableTop, cx, tableTop + headerH + maxRows * rowH);
        }
      });

      const [llr, llg, llb] = COLORS.lineLight;
      for (let r = 0; r <= maxRows; r++) {
        const ry = tableTop + headerH + r * rowH;
        doc.setDrawColor(llr, llg, llb);
        doc.setLineWidth(0.3);
        doc.line(m.left, ry, w - m.right, ry);
      }

      const [br, bg, bb] = COLORS.black;
      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`expense-tracker-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Expense Tracker"
      description="Log daily expenses with date, description, category, amount, and payment method."
      onGenerate={generate}
      defaultPageCount={5}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>Date | Description | Category | Amount | Paid By</div>
          <div>Maximizes rows per page</div>
        </div>
      )}
    </TemplateShell>
  );
}
