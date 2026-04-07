"use client";

import { useState } from "react";
import { TemplateShell } from "@/components/templates/template-shell";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  createDoc,
  drawHeader,
  drawPageNumber,
} from "@/lib/templates/pdf-utils";
import { COLORS } from "@/lib/templates/constants";
import {
  type TemplateVariants,
  getPageDimensions,
  getMargins,
  variantSuffix,
} from "@/lib/templates/variants";

export default function PasswordLogPage() {
  const [rowsPerPage, setRowsPerPage] = useState(15);

  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;

    const cols = [
      { label: "Service / Website", w: 0.28 },
      { label: "Username / Email", w: 0.27 },
      { label: "Password", w: 0.22 },
      { label: "Notes", w: 0.23 },
    ];

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      drawHeader(doc, variants, { title: "Password Log", dark: true });

      const tableTop = m.top + 44;
      const headerH = 16;
      const availableH = h - m.bottom - tableTop - headerH - 20;
      const rowH = Math.min(26, availableH / rowsPerPage);

      const [hbr, hbg, hbb] = COLORS.headerBg;
      doc.setFillColor(hbr, hbg, hbb);
      doc.rect(m.left, tableTop, bodyW, headerH, "F");

      doc.setFontSize(6.5);
      doc.setFont("helvetica", "bold");
      const [tr, tg, tb] = COLORS.textMedium;
      doc.setTextColor(tr, tg, tb);

      let cx = m.left;
      cols.forEach((col) => {
        doc.text(col.label, cx + 4, tableTop + 11);
        cx += bodyW * col.w;
      });
      doc.setFont("helvetica", "normal");

      const totalH = headerH + rowsPerPage * rowH;
      const [lr, lg, lb] = COLORS.lineMedium;
      doc.setDrawColor(lr, lg, lb);
      doc.setLineWidth(0.4);
      doc.rect(m.left, tableTop, bodyW, totalH, "S");

      cx = m.left;
      cols.forEach((col) => {
        cx += bodyW * col.w;
        if (cx < w - m.right) {
          doc.line(cx, tableTop, cx, tableTop + totalH);
        }
      });

      for (let r = 0; r < rowsPerPage; r++) {
        const ry = tableTop + headerH + r * rowH;

        if (r % 2 === 0) {
          doc.setFillColor(250, 250, 250);
          doc.rect(m.left + 0.25, ry, bodyW - 0.5, rowH, "F");
        }

        const [llr, llg, llb] = COLORS.lineLight;
        doc.setDrawColor(llr, llg, llb);
        doc.setLineWidth(0.3);
        doc.line(m.left, ry + rowH, w - m.right, ry + rowH);
      }

      const [br, bg, bb] = COLORS.black;
      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`password-log-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Password Log"
      description="Organized password and login tracker with columns for service, username, and notes."
      onGenerate={generate}
      defaultPageCount={3}
      extraControls={() => (
        <div className="space-y-2">
          <Label>Rows per page: {rowsPerPage}</Label>
          <Slider
            min={10}
            max={25}
            value={[rowsPerPage]}
            onValueChange={(v) => {
              const val = Array.isArray(v) ? v[0] : v;
              setRowsPerPage(val);
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>10</span>
            <span>25</span>
          </div>
        </div>
      )}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>Service | Username | Password | Notes</div>
          <div>{rowsPerPage} rows per page with alternating backgrounds</div>
        </div>
      )}
    </TemplateShell>
  );
}
