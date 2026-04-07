"use client";

import {
  createDoc,
  drawHeader,
  drawPageNumber,
  drawCheckbox,
  drawLabeledLine,
  drawSectionTitle,
  drawHorizontalLines,
  drawBox,
} from "@/lib/templates/pdf-utils";
import { COLORS } from "@/lib/templates/constants";
import { TemplateShell } from "@/components/templates/template-shell";
import {
  type TemplateVariants,
  getPageDimensions,
  getMargins,
  variantSuffix,
} from "@/lib/templates/variants";

const TIME_SLOTS = ["Morning", "Afternoon", "Evening"];

export default function TravelPlannerPage() {
  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      drawHeader(doc, variants, { title: "Travel Planner", dark: true });

      let y = m.top + 44;

      drawLabeledLine(doc, "Destination:", m.left + 4, y, w - m.right - 4);
      y += 16;
      const midX = m.left + bodyW / 2;
      drawLabeledLine(doc, "Dates:", m.left + 4, y, midX - 10);
      drawLabeledLine(doc, "Budget:", midX + 4, y, w - m.right - 4);

      y += 24;
      drawSectionTitle(doc, "Packing Checklist", m.left + 4, y);
      y += 12;

      const colW = (bodyW - 8) / 2;
      const checkLineH = 16;
      const packingRows = 8;

      for (let col = 0; col < 2; col++) {
        const cx = m.left + 4 + col * (colW + 4);
        for (let r = 0; r < packingRows; r++) {
          const ry = y + r * checkLineH;
          drawCheckbox(doc, cx, ry, 7);
          const [lr, lg, lb] = COLORS.lineLight;
          doc.setDrawColor(lr, lg, lb);
          doc.setLineWidth(0.3);
          doc.line(cx + 12, ry + 7, cx + colW - 4, ry + 7);
        }
      }

      y += packingRows * checkLineH + 14;
      drawSectionTitle(doc, "Daily Itinerary", m.left + 4, y);
      y += 12;

      const slotH = 42;
      for (const slot of TIME_SLOTS) {
        if (y + slotH > h - m.bottom - 80) break;

        drawBox(doc, m.left + 4, y, bodyW - 8, slotH, { label: slot });
        drawHorizontalLines(doc, variants, {
          startY: y + 12,
          endY: y + slotH - 4,
          spacing: 14,
        });
        y += slotH + 4;
      }

      y += 8;
      const notesTop = y;
      if (notesTop < h - m.bottom - 40) {
        drawSectionTitle(doc, "Notes", m.left + 4, y);
        drawHorizontalLines(doc, variants, {
          startY: y + 4,
          endY: h - m.bottom - 20,
          spacing: 16,
        });
      }

      const [br, bg, bb] = COLORS.black;
      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`travel-planner-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Travel Planner"
      description="Trip planning template with packing checklist, daily itinerary, and budget tracking."
      onGenerate={generate}
      defaultPageCount={3}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>Destination, dates &amp; budget fields</div>
          <div>Two-column packing checklist (16 items)</div>
          <div>Morning / Afternoon / Evening itinerary</div>
          <div>Notes section at bottom</div>
        </div>
      )}
    </TemplateShell>
  );
}
