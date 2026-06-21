"use client";

import {
  createDoc,
  drawHeader,
  drawLabeledLine,
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

const QUADRANTS = [
  {
    eyebrow: "Urgent + Important",
    title: "Do",
    prompt: "Handle now",
  },
  {
    eyebrow: "Not Urgent + Important",
    title: "Schedule",
    prompt: "Plan time",
  },
  {
    eyebrow: "Urgent + Not Important",
    title: "Delegate",
    prompt: "Hand off or shorten",
  },
  {
    eyebrow: "Not Urgent + Not Important",
    title: "Delete",
    prompt: "Drop, defer, or archive",
  },
] as const;

function drawQuadrant(
  doc: ReturnType<typeof createDoc>,
  x: number,
  y: number,
  width: number,
  height: number,
  quadrant: (typeof QUADRANTS)[number]
) {
  const [hbr, hbg, hbb] = COLORS.headerBg;
  const [lr, lg, lb] = COLORS.lineMedium;
  const [llr, llg, llb] = COLORS.lineLight;
  const [tmr, tmg, tmb] = COLORS.textMedium;
  const [tlr, tlg, tlb] = COLORS.textLight;

  doc.setDrawColor(lr, lg, lb);
  doc.setLineWidth(0.5);
  doc.rect(x, y, width, height, "S");

  doc.setFillColor(hbr, hbg, hbb);
  doc.rect(x, y, width, 28, "F");

  doc.setTextColor(tmr, tmg, tmb);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(quadrant.title.toUpperCase(), x + 8, y + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(tlr, tlg, tlb);
  doc.text(quadrant.eyebrow, x + 8, y + 22);
  doc.text(quadrant.prompt, x + width - 8, y + 22, { align: "right" });

  doc.setDrawColor(llr, llg, llb);
  doc.setLineWidth(0.3);
  let lineY = y + 42;
  while (lineY < y + height - 10) {
    doc.line(x + 8, lineY, x + width - 8, lineY);
    lineY += 14;
  }
}

export default function EisenhowerMatrixPage() {
  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      drawHeader(doc, variants, {
        title: "Eisenhower Matrix",
        subtitle: `Page ${page + 1}`,
        dark: true,
      });

      let y = m.top + 44;
      drawLabeledLine(doc, "Date:", m.left + 4, y, m.left + bodyW * 0.32);
      drawLabeledLine(
        doc,
        "Main focus:",
        m.left + bodyW * 0.38,
        y,
        w - m.right - 4
      );

      y += 18;
      const gap = 8;
      const gridH = h - m.bottom - y - 18;
      const qW = (bodyW - gap) / 2;
      const qH = (gridH - gap) / 2;

      QUADRANTS.forEach((quadrant, idx) => {
        const x = m.left + (idx % 2) * (qW + gap);
        const qY = y + Math.floor(idx / 2) * (qH + gap);
        drawQuadrant(doc, x, qY, qW, qH, quadrant);
      });

      const [br, bg, bb] = COLORS.black;
      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`eisenhower-matrix-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Eisenhower Matrix"
      description="Four-quadrant priority page for sorting tasks by urgency and importance."
      onGenerate={generate}
      defaultPageCount={3}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>Do / Schedule / Delegate / Delete quadrants</div>
          <div>Date and main-focus lines</div>
          <div>Ruled writing space in each quadrant</div>
        </div>
      )}
    </TemplateShell>
  );
}
