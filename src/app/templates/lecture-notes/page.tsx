"use client";

import {
  createDoc,
  drawHeader,
  drawPageNumber,
  drawSectionTitle,
  drawHorizontalLines,
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

export default function LectureNotesPage() {
  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      drawHeader(doc, variants, { title: "Lecture / Class Notes", dark: true });

      let y = m.top + 44;
      drawLabeledLine(doc, "Date:", m.left + 4, y, m.left + 100);
      drawLabeledLine(doc, "Course:", m.left + 110, y, w - m.right - 4);
      y += 16;
      drawLabeledLine(doc, "Lecture:", m.left + 4, y, m.left + 200);
      drawLabeledLine(doc, "Lecturer:", m.left + 210, y, w - m.right - 4);

      y += 22;
      drawSectionTitle(doc, "Key Concepts", m.left + 4, y);
      drawHorizontalLines(doc, variants, {
        startY: y + 2,
        endY: y + 54,
        spacing: 16,
      });

      y += 66;
      drawSectionTitle(doc, "Notes", m.left + 4, y);
      const notesEnd = h - m.bottom - 80;
      drawHorizontalLines(doc, variants, {
        startY: y + 2,
        endY: notesEnd,
        spacing: 16,
      });

      // Questions / follow-up at bottom
      y = notesEnd + 8;
      const [lr, lg, lb] = COLORS.lineMedium;
      doc.setDrawColor(lr, lg, lb);
      doc.setLineWidth(0.5);
      doc.line(m.left, y - 4, w - m.right, y - 4);

      drawSectionTitle(doc, "Questions / Follow-Up", m.left + 4, y);
      drawHorizontalLines(doc, variants, {
        startY: y + 2,
        endY: h - m.bottom,
        spacing: 16,
      });

      const [br, bg, bb] = COLORS.black;
      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`lecture-notes-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Lecture / Class Notes"
      description="Structured lecture page with key concepts, main notes area, and questions section."
      onGenerate={generate}
      defaultPageCount={10}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>Course & lecture metadata</div>
          <div>Key concepts section</div>
          <div>Large notes area</div>
          <div>Questions / follow-up at bottom</div>
        </div>
      )}
    </TemplateShell>
  );
}
