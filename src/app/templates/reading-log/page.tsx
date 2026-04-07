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

export default function ReadingLogPage() {
  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;

    const cols = [
      { label: "#", w: 0.05 },
      { label: "Title", w: 0.32 },
      { label: "Author", w: 0.22 },
      { label: "Start", w: 0.1 },
      { label: "End", w: 0.1 },
      { label: "Rating", w: 0.09 },
      { label: "Notes", w: 0.12 },
    ];

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      drawHeader(doc, variants, { title: "Reading Log", dark: true });

      const tableTop = m.top + 44;
      const headerH = 16;
      const rowH = 24;
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
      const numColW = bodyW * cols[0].w;
      const [br, bg, bb] = COLORS.black;
      for (let r = 0; r < maxRows; r++) {
        const ry = tableTop + headerH + r * rowH;
        doc.setDrawColor(llr, llg, llb);
        doc.setLineWidth(0.3);
        doc.line(m.left, ry + rowH, w - m.right, ry + rowH);

        // Row number
        doc.setFontSize(6);
        const [tl, tlg, tlb] = COLORS.textLight;
        doc.setTextColor(tl, tlg, tlb);
        doc.text(
          String(page * maxRows + r + 1),
          m.left + numColW / 2,
          ry + rowH / 2 + 2,
          { align: "center" }
        );
      }

      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`reading-log-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Reading Log"
      description="Track books read with title, author, dates, rating, and notes columns."
      onGenerate={generate}
      defaultPageCount={3}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div># | Title | Author | Start | End | Rating | Notes</div>
          <div>Numbered rows for easy tracking</div>
        </div>
      )}
    </TemplateShell>
  );
}
