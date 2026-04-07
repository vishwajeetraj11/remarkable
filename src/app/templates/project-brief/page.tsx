"use client";

import {
  createDoc,
  drawHeader,
  drawPageNumber,
  drawSectionTitle,
  drawHorizontalLines,
  drawLabeledLine,
  drawBox,
} from "@/lib/templates/pdf-utils";
import { TemplateShell } from "@/components/templates/template-shell";
import {
  type TemplateVariants,
  getPageDimensions,
  getMargins,
  variantSuffix,
} from "@/lib/templates/variants";

export default function ProjectBriefPage() {
  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      drawHeader(doc, variants, { title: "Project Brief", dark: true });

      let y = m.top + 44;
      drawLabeledLine(doc, "Project:", m.left + 4, y, w - m.right - 4);
      y += 16;
      drawLabeledLine(doc, "Owner:", m.left + 4, y, m.left + bodyW * 0.45);
      drawLabeledLine(doc, "Start:", m.left + bodyW * 0.5, y, w - m.right - 4);
      y += 16;
      drawLabeledLine(doc, "Status:", m.left + 4, y, m.left + bodyW * 0.45);
      drawLabeledLine(doc, "Deadline:", m.left + bodyW * 0.5, y, w - m.right - 4);

      y += 22;
      drawSectionTitle(doc, "Objective", m.left + 4, y);
      drawHorizontalLines(doc, variants, {
        startY: y + 2,
        endY: y + 40,
        spacing: 18,
      });

      y += 52;
      drawSectionTitle(doc, "Scope & Deliverables", m.left + 4, y);
      drawHorizontalLines(doc, variants, {
        startY: y + 2,
        endY: y + 60,
        spacing: 18,
      });

      y += 72;
      const halfW = (bodyW - 12) / 2;
      drawBox(doc, m.left, y, halfW, 80, { label: "Key Stakeholders" });
      drawBox(doc, m.left + halfW + 12, y, halfW, 80, { label: "Resources" });

      y += 92;
      drawSectionTitle(doc, "Risks & Dependencies", m.left + 4, y);
      drawHorizontalLines(doc, variants, {
        startY: y + 2,
        endY: y + 60,
        spacing: 18,
      });

      y += 72;
      drawSectionTitle(doc, "Success Criteria", m.left + 4, y);
      drawHorizontalLines(doc, variants, {
        startY: y + 2,
        endY: h - m.bottom,
        spacing: 18,
      });

      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`project-brief-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Project Brief"
      description="One-page project overview with objective, scope, stakeholders, risks, and success criteria."
      onGenerate={generate}
      defaultPageCount={3}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>Project metadata header</div>
          <div>Objective & scope sections</div>
          <div>Stakeholders & resources boxes</div>
          <div>Risks & success criteria</div>
        </div>
      )}
    </TemplateShell>
  );
}
