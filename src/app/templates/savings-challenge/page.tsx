"use client";

import { useState } from "react";
import {
  createDoc,
  drawHeader,
  drawPageNumber,
  drawCheckbox,
  drawLabeledLine,
  drawSectionTitle,
} from "@/lib/templates/pdf-utils";
import { COLORS } from "@/lib/templates/constants";
import { TemplateShell } from "@/components/templates/template-shell";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type TemplateVariants,
  getPageDimensions,
  getMargins,
  variantSuffix,
} from "@/lib/templates/variants";

type ChallengeType = "fixed" | "incremental";

export default function SavingsChallengePage() {
  const [challengeType, setChallengeType] = useState<ChallengeType>("incremental");

  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;

    const totalWeeks = 52;
    const gridCols = 4;
    const gridRows = 13;
    const weeksPerPage = Math.ceil(totalWeeks / pageCount);

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      drawHeader(doc, variants, {
        title: "52-Week Savings Challenge",
        subtitle: challengeType === "fixed" ? "Fixed Amount" : "Incremental",
        dark: true,
      });

      let y = m.top + 44;

      drawLabeledLine(doc, "Goal Amount:", m.left + 4, y, m.left + bodyW * 0.4);
      drawLabeledLine(doc, "Start Date:", m.left + bodyW * 0.5, y, w - m.right - 4);
      y += 20;

      const weekStart = page * weeksPerPage;
      const weekEnd = Math.min(weekStart + weeksPerPage, totalWeeks);
      const weeksThisPage = weekEnd - weekStart;
      const rowsThisPage = Math.ceil(weeksThisPage / gridCols);

      const gap = 6;
      const cellW = (bodyW - gap * (gridCols - 1)) / gridCols;
      const availableH = h - m.bottom - y - 36;
      const cellH = Math.min(38, (availableH - gap * (rowsThisPage - 1)) / rowsThisPage);

      for (let i = 0; i < weeksThisPage; i++) {
        const weekNum = weekStart + i + 1;
        const col = i % gridCols;
        const row = Math.floor(i / gridCols);

        const cx = m.left + col * (cellW + gap);
        const cy = y + row * (cellH + gap);

        const [lr, lg, lb] = COLORS.lineMedium;
        doc.setDrawColor(lr, lg, lb);
        doc.setLineWidth(0.5);
        doc.rect(cx, cy, cellW, cellH, "S");

        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        const [tr, tg, tb] = COLORS.textDark;
        doc.setTextColor(tr, tg, tb);
        doc.text(`Week ${weekNum}`, cx + 4, cy + 10);
        doc.setFont("helvetica", "normal");

        const amount =
          challengeType === "incremental" ? `$${weekNum}` : "$___";
        doc.setFontSize(6.5);
        const [mr, mg, mb] = COLORS.textMedium;
        doc.setTextColor(mr, mg, mb);
        doc.text(`Amount: ${amount}`, cx + 4, cy + 22);

        const checkboxSize = 7;
        drawCheckbox(doc, cx + cellW - checkboxSize - 6, cy + 6, checkboxSize);

        const [ltR, ltG, ltB] = COLORS.textLight;
        doc.setFontSize(5);
        doc.setTextColor(ltR, ltG, ltB);
        doc.text("Saved", cx + cellW - checkboxSize - 8, cy + 6 + checkboxSize + 7, {
          align: "center",
        });
      }

      const totalY = y + rowsThisPage * (cellH + gap) + 4;
      if (totalY < h - m.bottom - 20) {
        const runningStart = weekStart + 1;
        const runningEnd = weekEnd;
        let runningTotal = 0;
        if (challengeType === "incremental") {
          for (let wk = runningStart; wk <= runningEnd; wk++) runningTotal += wk;
        }

        const [hbr, hbg, hbb] = COLORS.headerBg;
        doc.setFillColor(hbr, hbg, hbb);
        doc.rect(m.left, totalY, bodyW, 18, "F");
        const [lr2, lg2, lb2] = COLORS.lineMedium;
        doc.setDrawColor(lr2, lg2, lb2);
        doc.setLineWidth(0.4);
        doc.rect(m.left, totalY, bodyW, 18, "S");

        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        const [tr2, tg2, tb2] = COLORS.textDark;
        doc.setTextColor(tr2, tg2, tb2);
        doc.text(
          `Running Total (Weeks ${runningStart}–${runningEnd}):`,
          m.left + 4,
          totalY + 12
        );

        if (challengeType === "incremental") {
          doc.setFont("helvetica", "normal");
          doc.text(`$${runningTotal}`, m.left + bodyW * 0.6, totalY + 12);
        } else {
          drawLabeledLine(doc, "$", m.left + bodyW * 0.6, totalY + 12, w - m.right - 6);
        }
        doc.setFont("helvetica", "normal");
      }

      const [br, bg, bb] = COLORS.black;
      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`savings-challenge-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Savings Challenge"
      description="52-week savings tracker with weekly checkboxes and running totals."
      onGenerate={generate}
      defaultPageCount={2}
      maxPages={4}
      extraControls={() => (
        <div className="space-y-2">
          <Label>Challenge type</Label>
          <Select value={challengeType} onValueChange={(v) => setChallengeType(v as ChallengeType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">Fixed Amount (same each week)</SelectItem>
              <SelectItem value="incremental">Incremental ($1 more each week)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    >
      {(_, pageCount) => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>52 weeks across {pageCount} page{pageCount > 1 ? "s" : ""}</div>
          <div>4-column grid with week number, amount, and checkbox</div>
          <div>
            {challengeType === "incremental"
              ? "Incremental: $1, $2, $3… up to $52 (total $1,378)"
              : "Fixed: same amount each week"}
          </div>
          <div>Running total row per page</div>
        </div>
      )}
    </TemplateShell>
  );
}
