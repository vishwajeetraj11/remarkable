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

export default function SleepLogPage() {
  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;

    const cols = [
      { label: "Date", w: 0.1 },
      { label: "Bed Time", w: 0.12 },
      { label: "Wake Time", w: 0.12 },
      { label: "Hours", w: 0.08 },
      { label: "Quality (1-5)", w: 0.14 },
      { label: "Notes", w: 0.44 },
    ];

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      drawHeader(doc, variants, { title: "Sleep Log", dark: true });

      const tableTop = m.top + 44;
      const headerH = 16;
      const rowH = 22;
      const maxRows = Math.floor((h - m.bottom - tableTop - headerH - 10) / rowH);

      const [hbr, hbg, hbb] = COLORS.headerBg;
      doc.setFillColor(hbr, hbg, hbb);
      doc.rect(m.left, tableTop, bodyW, headerH, "F");

      doc.setFontSize(6);
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
      for (let r = 0; r < maxRows; r++) {
        const ry = tableTop + headerH + (r + 1) * rowH;
        doc.setDrawColor(llr, llg, llb);
        doc.setLineWidth(0.3);
        doc.line(m.left, ry, w - m.right, ry);
      }

      const [br, bg, bb] = COLORS.black;
      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`sleep-log-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Sleep Log"
      description="Track sleep with bed time, wake time, hours, quality rating, and notes."
      onGenerate={generate}
      defaultPageCount={3}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>Date | Bed | Wake | Hours | Quality | Notes</div>
          <div>Maximizes rows per page</div>
        </div>
      )}
    </TemplateShell>
  );
}
