"use client";

import { useState } from "react";
import { TemplateShell } from "@/components/templates/template-shell";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  createDoc,
  drawPageNumber,
  drawHeader,
  drawLabeledLine,
} from "@/lib/templates/pdf-utils";
import { COLORS } from "@/lib/templates/constants";
import {
  type TemplateVariants,
  getPageDimensions,
  getMargins,
  variantSuffix,
} from "@/lib/templates/variants";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function FitnessPlannerPage() {
  const [exerciseRows, setExerciseRows] = useState(5);

  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      drawHeader(doc, variants, {
        title: "Fitness Planner",
        subtitle: `Week ${page + 1}`,
      });

      let y = m.top + 38;

      drawLabeledLine(doc, "Weekly Goal:", m.left + 4, y, m.left + bodyW * 0.6);
      const midRight = m.left + bodyW * 0.62;
      drawLabeledLine(doc, "Start Wt:", midRight, y, midRight + bodyW * 0.16);
      drawLabeledLine(doc, "End Wt:", midRight + bodyW * 0.2, y, w - m.right - 4);

      y += 14;

      const dayColW = bodyW / 7;
      const dayBlockH = h - m.bottom - y - 16;
      const exerciseRowH = Math.min(
        (dayBlockH - 16) / exerciseRows,
        28
      );

      for (let d = 0; d < 7; d++) {
        const dx = m.left + d * dayColW;

        const [hbr, hbg, hbb] = COLORS.headerBg;
        doc.setFillColor(hbr, hbg, hbb);
        doc.rect(dx, y, dayColW, 14, "F");

        const [ldr, ldg, ldb] = COLORS.lineMedium;
        doc.setDrawColor(ldr, ldg, ldb);
        doc.setLineWidth(0.4);
        doc.rect(dx, y, dayColW, dayBlockH, "S");

        doc.setFontSize(6);
        doc.setFont("helvetica", "bold");
        const [tmr, tmg, tmb] = COLORS.textMedium;
        doc.setTextColor(tmr, tmg, tmb);
        doc.text(DAYS[d], dx + dayColW / 2, y + 10, { align: "center" });
        doc.setFont("helvetica", "normal");

        const rowStartY = y + 16;
        for (let r = 0; r < exerciseRows; r++) {
          const ry = rowStartY + r * exerciseRowH;

          if (r > 0) {
            const [llr, llg, llb] = COLORS.lineLight;
            doc.setDrawColor(llr, llg, llb);
            doc.setLineWidth(0.2);
            doc.line(dx + 3, ry, dx + dayColW - 3, ry);
          }

          const [tlr, tlg, tlb] = COLORS.textLight;
          doc.setTextColor(tlr, tlg, tlb);
          doc.setFontSize(4.5);

          doc.text("Exercise:", dx + 3, ry + 7);
          const [lr, lg, lb] = COLORS.lineLight;
          doc.setDrawColor(lr, lg, lb);
          doc.setLineWidth(0.3);
          doc.line(dx + 22, ry + 8, dx + dayColW - 3, ry + 8);

          doc.text("Sets x Reps:", dx + 3, ry + 15);
          doc.line(dx + 28, ry + 16, dx + dayColW - 3, ry + 16);

          doc.text("Weight/Dur:", dx + 3, ry + 23);
          doc.line(dx + 27, ry + 24, dx + dayColW - 3, ry + 24);
        }
      }

      const [br, bg, bb] = COLORS.black;
      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`fitness-planner-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Fitness Planner"
      description="Weekly workout planner with exercise rows, sets/reps fields, and weight tracking per day."
      onGenerate={generate}
      defaultPageCount={4}
      extraControls={() => (
        <div className="space-y-2">
          <Label>Exercises per day: {exerciseRows}</Label>
          <Slider
            min={3}
            max={8}
            value={[exerciseRows]}
            onValueChange={(v) => {
              const val = Array.isArray(v) ? v[0] : v;
              setExerciseRows(val);
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>3</span><span>8</span>
          </div>
        </div>
      )}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>7 day columns (Mon–Sun)</div>
          <div>{exerciseRows} exercise rows per day</div>
          <div>Sets × Reps + Weight/Duration fields</div>
          <div>Weekly goal + start/end weight</div>
        </div>
      )}
    </TemplateShell>
  );
}
