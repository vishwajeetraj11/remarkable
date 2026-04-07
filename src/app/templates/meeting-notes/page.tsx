"use client";

import {
  createDoc,
  drawHeader,
  drawPageNumber,
  drawSectionTitle,
  drawHorizontalLines,
  drawCheckbox,
  drawLabeledLine,
} from "@/lib/templates/pdf-utils";
import { COLORS } from "@/lib/templates/constants";
import { TemplateShell } from "@/components/templates/template-shell";
import {
  type TemplateVariants,
  getPageDimensions,
  getMargins,
  variantSuffix,
} from "@/lib/templates/variants";

export default function MeetingNotesPage() {
  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      drawHeader(doc, variants, { title: "Meeting Notes", dark: true });

      let y = m.top + 44;
      drawLabeledLine(doc, "Date:", m.left + 4, y, m.left + 120);
      drawLabeledLine(doc, "Time:", m.left + 130, y, m.left + 240);
      y += 16;
      drawLabeledLine(doc, "Meeting:", m.left + 4, y, w - m.right - 4);
      y += 16;
      drawLabeledLine(doc, "Attendees:", m.left + 4, y, w - m.right - 4);
      y += 16;
      drawLabeledLine(doc, "Objective:", m.left + 4, y, w - m.right - 4);

      y += 22;
      drawSectionTitle(doc, "Agenda", m.left + 4, y);
      y += 10;
      for (let i = 0; i < 4; i++) {
        const [lr, lg, lb] = COLORS.lineLight;
        doc.setDrawColor(lr, lg, lb);
        doc.setLineWidth(0.3);
        doc.line(m.left + 4, y + i * 18 + 8, w - m.right - 4, y + i * 18 + 8);
      }

      y += 82;
      drawSectionTitle(doc, "Discussion Notes", m.left + 4, y);
      const notesEnd = h - m.bottom - 120;
      drawHorizontalLines(doc, variants, {
        startY: y + 2,
        endY: notesEnd,
        spacing: 18,
      });

      y = notesEnd + 10;
      drawSectionTitle(doc, "Action Items", m.left + 4, y);
      y += 10;
      const actionsEnd = h - m.bottom - 10;
      const actionLines = Math.floor((actionsEnd - y) / 20);
      for (let i = 0; i < actionLines; i++) {
        drawCheckbox(doc, m.left + 6, y + i * 20, 7);
        const [lr, lg, lb] = COLORS.lineLight;
        doc.setDrawColor(lr, lg, lb);
        doc.setLineWidth(0.3);
        doc.line(m.left + 18, y + i * 20 + 7, w - m.right - 4, y + i * 20 + 7);
      }

      const [br, bg, bb] = COLORS.black;
      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`meeting-notes-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Meeting Notes"
      description="Structured meeting page with attendees, agenda, discussion notes, and action items."
      onGenerate={generate}
      defaultPageCount={5}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>Date, time, attendees header</div>
          <div>Agenda section</div>
          <div>Discussion notes area</div>
          <div>Action items with checkboxes</div>
        </div>
      )}
    </TemplateShell>
  );
}
