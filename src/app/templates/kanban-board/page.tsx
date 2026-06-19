"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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

const COLUMN_LABELS: Record<number, string[]> = {
  3: ["To Do", "Doing", "Done"],
  4: ["Backlog", "Next", "Doing", "Done"],
  5: ["Ideas", "Backlog", "Doing", "Review", "Done"],
};

export default function KanbanBoardPage() {
  const [columnCount, setColumnCount] = useState(4);

  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;
    const labels = COLUMN_LABELS[columnCount];

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      drawHeader(doc, variants, {
        title: "Kanban Board",
        subtitle: `${columnCount} columns`,
        dark: true,
      });

      let y = m.top + 44;
      drawLabeledLine(doc, "Project:", m.left + 4, y, m.left + bodyW * 0.45);
      drawLabeledLine(
        doc,
        "Date:",
        m.left + bodyW * 0.52,
        y,
        w - m.right - 4
      );

      y += 18;
      const gap = 6;
      const colW = (bodyW - gap * (columnCount - 1)) / columnCount;
      const colH = h - m.bottom - y - 18;
      const headerH = 18;
      const cardGap = 7;
      const cardCount = Math.max(
        3,
        Math.min(8, Math.floor((colH - headerH - 8) / 44))
      );
      const cardH =
        (colH - headerH - 8 - cardGap * (cardCount - 1)) / cardCount;

      labels.forEach((label, idx) => {
        const x = m.left + idx * (colW + gap);
        const [lr, lg, lb] = COLORS.lineMedium;
        const [hbr, hbg, hbb] = COLORS.headerBg;
        const [tmr, tmg, tmb] = COLORS.textMedium;

        doc.setDrawColor(lr, lg, lb);
        doc.setLineWidth(0.5);
        doc.rect(x, y, colW, colH, "S");

        doc.setFillColor(hbr, hbg, hbb);
        doc.rect(x, y, colW, headerH, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(tmr, tmg, tmb);
        doc.text(label.toUpperCase(), x + colW / 2, y + 12, {
          align: "center",
        });
        doc.setFont("helvetica", "normal");

        for (let card = 0; card < cardCount; card++) {
          const cardY = y + headerH + 8 + card * (cardH + cardGap);
          const [llr, llg, llb] = COLORS.lineLight;
          doc.setDrawColor(llr, llg, llb);
          doc.setLineWidth(0.4);
          doc.roundedRect(x + 5, cardY, colW - 10, cardH, 3, 3, "S");

          doc.setDrawColor(llr, llg, llb);
          doc.setLineWidth(0.3);
          doc.line(x + 11, cardY + 12, x + colW - 11, cardY + 12);
          doc.line(x + 11, cardY + cardH - 11, x + colW - 11, cardY + cardH - 11);

          const [tlr, tlg, tlb] = COLORS.textLight;
          doc.setTextColor(tlr, tlg, tlb);
          doc.setFontSize(5);
          doc.text("Owner", x + 11, cardY + cardH - 4);
          doc.text("Due", x + colW - 11, cardY + cardH - 4, {
            align: "right",
          });
        }
      });

      const [br, bg, bb] = COLORS.black;
      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`kanban-board-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Kanban Board"
      description="Printable workflow board with card slots for tasks, owners, and due dates."
      onGenerate={generate}
      defaultPageCount={2}
      extraControls={() => (
        <div className="space-y-2">
          <Label>Columns: {columnCount}</Label>
          <Slider
            min={3}
            max={5}
            value={[columnCount]}
            onValueChange={(v) => {
              const val = Array.isArray(v) ? v[0] : v;
              setColumnCount(val);
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>3</span>
            <span>5</span>
          </div>
        </div>
      )}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>{COLUMN_LABELS[columnCount].join(" / ")} workflow</div>
          <div>Task cards with owner and due-date lines</div>
          <div>Adjustable 3 to 5 column layout</div>
        </div>
      )}
    </TemplateShell>
  );
}
