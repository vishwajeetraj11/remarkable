"use client";

import { useState } from "react";
import { TemplateShell } from "@/components/templates/template-shell";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  createDoc,
  drawPageNumber,
  drawSectionTitle,
  drawLabeledLine,
} from "@/lib/templates/pdf-utils";
import { COLORS } from "@/lib/templates/constants";
import {
  type TemplateVariants,
  getPageDimensions,
  getMargins,
  variantSuffix,
} from "@/lib/templates/variants";

export default function TimeBlockPage() {
  const [startHour, setStartHour] = useState(7);
  const [endHour, setEndHour] = useState(20);

  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;
    const hours = endHour - startHour;

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Time Blocks", m.left + 4, m.top + 16);
      doc.setFont("helvetica", "normal");
      drawLabeledLine(doc, "Date:", m.left + bodyW * 0.55, m.top + 16, w - m.right - 4);

      const scheduleTop = m.top + 32;
      const scheduleH = h - m.bottom - scheduleTop - 10;
      const slotH = scheduleH / hours;

      const timeColW = 32;
      const blockW = bodyW - timeColW;

      for (let i = 0; i <= hours; i++) {
        const y = scheduleTop + i * slotH;
        const hr = startHour + i;
        const label = hr < 12 ? `${hr}am` : hr === 12 ? "12pm" : `${hr - 12}pm`;

        // Time label
        doc.setFontSize(7);
        const [tr, tg, tb] = COLORS.textMedium;
        doc.setTextColor(tr, tg, tb);
        doc.text(label, m.left + 2, y + 4);

        // Full-width line
        const [lr, lg, lb] = i === 0 ? COLORS.lineMedium : COLORS.lineLight;
        doc.setDrawColor(lr, lg, lb);
        doc.setLineWidth(i === 0 ? 0.5 : 0.3);
        doc.line(m.left + timeColW, y, w - m.right, y);

        // Half-hour dashed line
        if (i < hours) {
          const halfY = y + slotH / 2;
          doc.setDrawColor(230, 230, 230);
          doc.setLineWidth(0.2);
          doc.line(m.left + timeColW, halfY, w - m.right, halfY);
        }
      }

      // Vertical border
      const [lr, lg, lb] = COLORS.lineMedium;
      doc.setDrawColor(lr, lg, lb);
      doc.setLineWidth(0.4);
      doc.line(m.left + timeColW, scheduleTop, m.left + timeColW, scheduleTop + scheduleH);

      const [br, bg, bb] = COLORS.black;
      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`time-block-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Time-Block Page"
      description="Full-day time-blocking grid with half-hour slots for focused scheduling."
      onGenerate={generate}
      defaultPageCount={7}
      extraControls={() => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start hour: {startHour < 12 ? `${startHour}am` : startHour === 12 ? "12pm" : `${startHour - 12}pm`}</Label>
            <Slider
              min={5}
              max={12}
              value={[startHour]}
              onValueChange={(v) => {
                const val = Array.isArray(v) ? v[0] : v;
                setStartHour(val);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label>End hour: {endHour < 12 ? `${endHour}am` : endHour === 12 ? "12pm" : `${endHour - 12}pm`}</Label>
            <Slider
              min={15}
              max={23}
              value={[endHour]}
              onValueChange={(v) => {
                const val = Array.isArray(v) ? v[0] : v;
                setEndHour(val);
              }}
            />
          </div>
        </div>
      )}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>{endHour - startHour} hour blocks</div>
          <div>Half-hour subdivisions</div>
          <div>Wide writing area per block</div>
        </div>
      )}
    </TemplateShell>
  );
}
