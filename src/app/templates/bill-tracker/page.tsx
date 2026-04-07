"use client";

import {
  createDoc,
  drawHeader,
  drawPageNumber,
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

export default function BillTrackerPage() {
  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;

    const cols = [
      { label: "Paid", w: 0.07 },
      { label: "Bill / Payee", w: 0.3 },
      { label: "Due Date", w: 0.15 },
      { label: "Amount", w: 0.15 },
      { label: "Method", w: 0.15 },
      { label: "Notes", w: 0.18 },
    ];

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      drawHeader(doc, variants, { title: "Bill Tracker", dark: true });

      const tableTop = m.top + 44;
      const headerH = 16;
      const rowH = 22;
      const maxRows = Math.floor((h - m.bottom - tableTop - headerH - 10) / rowH);

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
      const paidColW = bodyW * cols[0].w;
      for (let r = 0; r < maxRows; r++) {
        const ry = tableTop + headerH + r * rowH;
        doc.setDrawColor(llr, llg, llb);
        doc.setLineWidth(0.3);
        doc.line(m.left, ry + rowH, w - m.right, ry + rowH);
        drawCheckbox(doc, m.left + (paidColW - 7) / 2, ry + (rowH - 7) / 2, 7);
      }

      const [br, bg, bb] = COLORS.black;
      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`bill-tracker-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Bill Tracker"
      description="Track bills with paid checkbox, payee, due date, amount, payment method, and notes."
      onGenerate={generate}
      defaultPageCount={3}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>Paid checkbox | Bill | Due | Amount | Method | Notes</div>
          <div>Maximizes rows per page</div>
        </div>
      )}
    </TemplateShell>
  );
}
