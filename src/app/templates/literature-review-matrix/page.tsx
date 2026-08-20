"use client";

import { useState } from "react";
import { TemplateShell } from "@/components/templates/template-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addPage,
  createDoc,
  drawHeader,
  drawHorizontalLines,
  drawLabeledLine,
  drawPageNumber,
  drawSectionTitle,
} from "@/lib/templates/pdf-utils";
import { COLORS } from "@/lib/templates/constants";
import {
  type TemplateVariants,
  getMargins,
  getPageDimensions,
  variantSuffix,
} from "@/lib/templates/variants";

function fitSingleLine(
  doc: ReturnType<typeof createDoc>,
  value: string,
  maxWidth: number,
) {
  if (doc.getTextWidth(value) <= maxWidth) return value;
  const suffix = "...";
  if (doc.getTextWidth(suffix) > maxWidth) return "";
  let fitted = value;
  while (fitted.length > 0 && doc.getTextWidth(`${fitted}${suffix}`) > maxWidth) {
    fitted = fitted.slice(0, -1);
  }
  return `${fitted}${suffix}`;
}

function drawTableGrid(
  doc: ReturnType<typeof createDoc>,
  x: number,
  y: number,
  widths: number[],
  rowH: number,
  rows: number,
) {
  const totalW = widths.reduce((sum, width) => sum + width, 0);
  doc.setDrawColor(COLORS.lineMedium[0], COLORS.lineMedium[1], COLORS.lineMedium[2]);
  doc.setLineWidth(0.4);
  doc.rect(x, y, totalW, rowH * rows, "S");
  let currentX = x;
  widths.slice(0, -1).forEach((width) => {
    currentX += width;
    doc.line(currentX, y, currentX, y + rowH * rows);
  });
  for (let row = 1; row < rows; row += 1) {
    doc.setDrawColor(COLORS.lineLight[0], COLORS.lineLight[1], COLORS.lineLight[2]);
    doc.line(x, y + row * rowH, x + totalW, y + row * rowH);
  }
}

function drawTableHeaders(
  doc: ReturnType<typeof createDoc>,
  labels: string[],
  x: number,
  y: number,
  widths: number[],
  rowH: number,
) {
  let currentX = x;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.setTextColor(COLORS.textMedium[0], COLORS.textMedium[1], COLORS.textMedium[2]);
  labels.forEach((label, index) => {
    doc.text(label, currentX + 4, y + rowH / 2 + 2, {
      maxWidth: widths[index] - 8,
    });
    currentX += widths[index];
  });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(COLORS.black[0], COLORS.black[1], COLORS.black[2]);
}

async function generateMatrix(
  variants: TemplateVariants,
  pageCount: number,
  topic: string,
  researchQuestion: string,
) {
  const doc = createDoc(variants);
  const { w, h } = getPageDimensions(variants);
  const m = getMargins(variants);
  const bodyW = w - m.left - m.right;
  const footerBottom = h - m.bottom - 22;
  const compact = h < 450;
  const cleanTopic = topic.trim() || "Research topic";
  const cleanQuestion = researchQuestion.trim() || "Research question";

  for (let page = 0; page < pageCount; page += 1) {
    if (page > 0) addPage(doc, variants);
    drawHeader(doc, variants, {
      title: "Literature Review Matrix",
      subtitle: `Page ${page + 1} of ${pageCount}`,
    });

    let y = m.top + 48;
    drawLabeledLine(doc, "Topic:", m.left + 4, y, w - m.right - 4);
    doc.setFontSize(8);
    doc.setTextColor(COLORS.textMedium[0], COLORS.textMedium[1], COLORS.textMedium[2]);
    doc.text(
      fitSingleLine(doc, cleanTopic, w - m.right - 4 - (m.left + 40)),
      m.left + 40,
      y,
    );
    y += 18;
    drawLabeledLine(doc, "Research question:", m.left + 4, y, w - m.right - 4);
    doc.text(
      fitSingleLine(doc, cleanQuestion, w - m.right - 4 - (m.left + 92)),
      m.left + 92,
      y,
    );
    y += 22;

    const widths = [
      bodyW * 0.15,
      bodyW * 0.17,
      bodyW * 0.18,
      bodyW * 0.15,
      bodyW * 0.17,
      bodyW * 0.18,
    ];
    const tableRows = compact ? 5 : 8;
    const synthesisReserve = compact ? 88 : 110;
    const rowH = compact
      ? Math.max(18, Math.min(24, (footerBottom - y - synthesisReserve - 16) / tableRows))
      : Math.min(40, Math.max(28, (footerBottom - y - 110) / tableRows));
    drawTableGrid(doc, m.left, y, widths, rowH, tableRows);
    drawTableHeaders(
      doc,
      ["Citation", "Method / sample", "Findings", "Limitations", "Relevance / themes", "Synthesis notes"],
      m.left,
      y,
      widths,
      rowH,
    );

    const synthesisY = y + rowH * tableRows + 16;
    drawSectionTitle(doc, "Cross-source synthesis", m.left + 4, synthesisY);
    drawHorizontalLines(doc, variants, {
      startY: synthesisY + 4,
      endY: footerBottom,
      spacing: compact ? 12 : 16,
    });
    drawPageNumber(doc, page + 1, pageCount, variants);
  }

  doc.save(`literature-review-matrix-${variantSuffix(variants)}-${pageCount}p.pdf`);
}

export default function LiteratureReviewMatrixPage() {
  const [topic, setTopic] = useState("");
  const [researchQuestion, setResearchQuestion] = useState("");

  return (
    <TemplateShell
      title="Literature Review Matrix"
      description="Compare sources side by side with space for methods, findings, limitations, themes, and synthesis."
      onGenerate={(variants, pageCount) =>
        generateMatrix(variants, pageCount, topic, researchQuestion)
      }
      defaultPageCount={5}
      maxPages={20}
      extraControls={() => (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="review-topic">Topic</Label>
            <Input
              id="review-topic"
              value={topic}
              maxLength={80}
              placeholder="Urban heat and public health"
              onChange={(event) => setTopic(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="review-question">Research question</Label>
            <Input
              id="review-question"
              value={researchQuestion}
              maxLength={120}
              placeholder="What patterns recur across studies?"
              onChange={(event) => setResearchQuestion(event.target.value)}
            />
          </div>
        </div>
      )}
    >
      {() => (
        <div className="space-y-1.5 text-xs text-muted-foreground">
          <div>Repeated source rows for cross-source comparison</div>
          <div>Six columns for cross-source analysis</div>
          <div>Dedicated synthesis lines below the matrix</div>
        </div>
      )}
    </TemplateShell>
  );
}
