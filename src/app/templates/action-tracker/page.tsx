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

export default function ActionTrackerPage() {
  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;

    const cols = [
      { label: "Done", width: 0.06 },
      { label: "Action Item", width: 0.38 },
      { label: "Owner", width: 0.18 },
      { label: "Due", width: 0.14 },
      { label: "Status / Notes", width: 0.24 },
    ];

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      drawHeader(doc, variants, { title: "Action-Item Tracker", dark: true });

      const tableTop = m.top + 44;
      const rowH = 22;
      const headerH = 16;
      const maxRows = Math.floor((h - m.bottom - tableTop - headerH) / rowH);

      // Column headers
      let colX = m.left;
      const [hbr, hbg, hbb] = COLORS.headerBg;
      doc.setFillColor(hbr, hbg, hbb);
      doc.rect(m.left, tableTop, bodyW, headerH, "F");

      doc.setFontSize(6.5);
      doc.setFont("helvetica", "bold");
      const [tr, tg, tb] = COLORS.textMedium;
      doc.setTextColor(tr, tg, tb);

      cols.forEach((col) => {
        const colW = bodyW * col.width;
        doc.text(col.label, colX + 4, tableTop + 11);
        colX += colW;
      });

      doc.setFont("helvetica", "normal");

      // Grid lines
      const [lr, lg, lb] = COLORS.lineMedium;
      doc.setDrawColor(lr, lg, lb);
      doc.setLineWidth(0.4);

      // Outer border
      doc.rect(m.left, tableTop, bodyW, headerH + maxRows * rowH, "S");

      // Column lines
      colX = m.left;
      cols.forEach((col) => {
        colX += bodyW * col.width;
        if (colX < w - m.right) {
          doc.line(colX, tableTop, colX, tableTop + headerH + maxRows * rowH);
        }
      });

      // Row lines
      const [llr, llg, llb] = COLORS.lineLight;
      doc.setDrawColor(llr, llg, llb);
      doc.setLineWidth(0.3);
      for (let r = 0; r <= maxRows; r++) {
        const ry = tableTop + headerH + r * rowH;
        doc.line(m.left, ry, w - m.right, ry);
      }

      // Checkboxes
      const checkColW = bodyW * cols[0].width;
      for (let r = 0; r < maxRows; r++) {
        const ry = tableTop + headerH + r * rowH;
        drawCheckbox(doc, m.left + (checkColW - 7) / 2, ry + (rowH - 7) / 2, 7);
      }

      const [br, bg, bb] = COLORS.black;
      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`action-tracker-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Action-Item Tracker"
      description="Tabular action-item tracker with columns for checkbox, action, owner, due date, and status."
      onGenerate={generate}
      defaultPageCount={3}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>Table layout with column headers</div>
          <div>Checkbox | Action | Owner | Due | Status</div>
          <div>Maximizes rows per page</div>
        </div>
      )}
    </TemplateShell>
  );
}
