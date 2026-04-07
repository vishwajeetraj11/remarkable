"use client";

import { useState } from "react";
import { TemplateShell } from "@/components/templates/template-shell";
import { Toggle } from "@/components/templates/variant-controls";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createDoc, drawPageNumber } from "@/lib/templates/pdf-utils";
import { COLORS } from "@/lib/templates/constants";
import {
  type TemplateVariants,
  getPageDimensions,
  getMargins,
  variantSuffix,
} from "@/lib/templates/variants";

const CUE_WIDTHS = {
  slim: { ratio: 0.22, label: "Slim (22%)" },
  standard: { ratio: 0.3, label: "Standard (30%)" },
  wide: { ratio: 0.38, label: "Wide (38%)" },
};

type CueKey = keyof typeof CUE_WIDTHS;

export default function CornellPage() {
  const [cueWidth, setCueWidth] = useState<CueKey>("standard");
  const [summary, setSummary] = useState(true);

  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const lineSpacing = 18;
    const summaryH = summary ? 100 : 0;
    const headerH = 36;

    const cueRatio = CUE_WIDTHS[cueWidth].ratio;
    const bodyW = w - m.left - m.right;

    const isLeftHanded = variants.handedness === "left";
    const cueColW = bodyW * cueRatio;
    const cueX = isLeftHanded ? w - m.right - cueColW : m.left;
    const notesX = isLeftHanded ? m.left : m.left + cueColW;
    const notesEndX = isLeftHanded ? w - m.right - cueColW : w - m.right;

    const contentTop = m.top + headerH;
    const contentBottom = h - m.bottom - summaryH;

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      const [hbr, hbg, hbb] = COLORS.headerBg;
      doc.setFillColor(hbr, hbg, hbb);
      doc.rect(m.left, m.top, bodyW, headerH, "F");
      const [lr, lg, lb] = COLORS.lineMedium;
      doc.setDrawColor(lr, lg, lb);
      doc.line(m.left, m.top + headerH, w - m.right, m.top + headerH);

      doc.setFontSize(7);
      const [tr, tg, tb] = COLORS.textMedium;
      doc.setTextColor(tr, tg, tb);
      doc.text("Date:", m.left + 4, m.top + 12);
      doc.text("Topic:", notesX + 4, m.top + 12);

      const [llr, llg, llb] = COLORS.lineLight;
      doc.setDrawColor(llr, llg, llb);
      doc.line(m.left + 28, m.top + 14, m.left + cueColW - 8, m.top + 14);
      doc.line(notesX + 36, m.top + 14, w - m.right - 8, m.top + 14);

      const [dr, dg, db] = COLORS.lineDark;
      doc.setDrawColor(dr, dg, db);
      doc.setLineWidth(0.7);
      doc.rect(m.left, m.top, bodyW, h - m.top - m.bottom, "S");

      doc.line(notesX, contentTop, notesX, contentBottom);

      const [lr2, lg2, lb2] = COLORS.lineLight;
      doc.setDrawColor(lr2, lg2, lb2);
      doc.setLineWidth(0.3);
      for (let y = contentTop + lineSpacing; y < contentBottom; y += lineSpacing) {
        doc.line(cueX + 4, y, cueX + cueColW - 4, y);
      }
      for (let y = contentTop + lineSpacing; y < contentBottom; y += lineSpacing) {
        doc.line(notesX + 4, y, notesEndX - 4, y);
      }

      doc.setFontSize(6.5);
      const [tl, tlg, tlb] = COLORS.textLight;
      doc.setTextColor(tl, tlg, tlb);
      doc.text("CUE / QUESTIONS", cueX + cueColW / 2, contentTop + 10, {
        align: "center",
      });
      doc.text(
        "NOTES",
        notesX + (notesEndX - notesX) / 2,
        contentTop + 10,
        { align: "center" }
      );

      if (summary) {
        doc.setDrawColor(dr, dg, db);
        doc.setLineWidth(0.7);
        doc.line(m.left, contentBottom, w - m.right, contentBottom);
        doc.setFontSize(6.5);
        doc.setTextColor(dr, dg, db);
        doc.text("SUMMARY", m.left + 4, contentBottom + 10);
        doc.setDrawColor(lr2, lg2, lb2);
        doc.setLineWidth(0.3);
        for (
          let y = contentBottom + lineSpacing * 1.5;
          y < h - m.bottom - 4;
          y += lineSpacing
        ) {
          doc.line(m.left + 4, y, w - m.right - 4, y);
        }
      }

      const [br, bg, bb] = COLORS.black;
      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(
      `cornell-notes-${cueWidth}-${variantSuffix(variants)}-${pageCount}p.pdf`
    );
  }

  const cueRatio = CUE_WIDTHS[cueWidth].ratio;

  return (
    <TemplateShell
      title="Cornell Notes"
      description="Two-column study layout: cue column on the left, notes on the right, optional summary section at the bottom."
      onGenerate={generate}
      extraControls={() => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Cue column width</Label>
            <Select
              value={cueWidth}
              onValueChange={(v) => setCueWidth(v as CueKey)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CUE_WIDTHS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="pt-1">
            <Toggle
              checked={summary}
              onToggle={() => setSummary((v) => !v)}
              label="Include summary section"
            />
          </div>
        </div>
      )}
    >
      {(variants) => (
        <div className="flex gap-5">
          <div
            className="border border-gray-300 rounded"
            style={{
              width: 220,
              height: 280,
              flexShrink: 0,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div className="bg-gray-100 border-b border-gray-300 px-2 py-1.5 flex gap-2 text-[9px] text-gray-400">
              <span>Date: ________</span>
              <span className="ml-2">Topic: ___________________</span>
            </div>
            <div
              className="flex"
              style={{
                height: summary
                  ? "calc(100% - 56px - 28px)"
                  : "calc(100% - 28px)",
                flexDirection:
                  variants.handedness === "left" ? "row-reverse" : "row",
              }}
            >
              <div
                className={`shrink-0 flex items-start justify-center pt-1 text-[7px] text-gray-400 ${variants.handedness === "left" ? "border-l" : "border-r"} border-gray-300`}
                style={{ width: `${cueRatio * 100}%` }}
              >
                CUE
              </div>
              <div className="flex-1 flex items-start justify-center pt-1 text-[7px] text-gray-400">
                NOTES
              </div>
            </div>
            {summary && (
              <div
                className="border-t border-gray-300 px-2 py-1 text-[7px] text-gray-400"
                style={{ height: 28 }}
              >
                SUMMARY
              </div>
            )}
          </div>
          <div className="text-xs text-muted-foreground space-y-1.5">
            <div>
              Cue column:{" "}
              <span className="font-medium">
                {Math.round(cueRatio * 100)}%
              </span>
            </div>
            <div>
              Notes:{" "}
              <span className="font-medium">
                {Math.round((1 - cueRatio) * 100)}%
              </span>
            </div>
            {summary && <div>Summary section</div>}
          </div>
        </div>
      )}
    </TemplateShell>
  );
}
