"use client";

import { useState } from "react";
import { TemplateShell } from "@/components/templates/template-shell";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  createDoc,
  addPage,
  drawHeader,
  drawPageNumber,
  drawBox,
  drawSectionTitle,
  drawHorizontalLines,
} from "@/lib/templates/pdf-utils";
import { COLORS } from "@/lib/templates/constants";
import {
  type TemplateVariants,
  getPageDimensions,
  getMargins,
  variantSuffix,
} from "@/lib/templates/variants";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function YearlyRoadmapPage() {
  const [year, setYear] = useState(new Date().getFullYear());

  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;

    // Page 1: Year overview with goals
    drawHeader(doc, variants, { title: `${year} Yearly Roadmap`, dark: true });
    const startY = m.top + 40;

    drawSectionTitle(doc, "Vision & Goals", m.left + 4, startY);
    drawHorizontalLines(doc, variants, {
      startY: startY + 4,
      endY: startY + 80,
      spacing: 18,
    });

    // Quarterly overview boxes
    const qStartY = startY + 96;
    const qBoxW = (bodyW - 12) / 2;
    const qBoxH = (h - m.bottom - qStartY - 12) / 2;

    drawBox(doc, m.left, qStartY, qBoxW, qBoxH, { label: "Q1 — Jan–Mar" });
    doc.link(m.left, qStartY, qBoxW, qBoxH, { pageNumber: 2 });

    drawBox(doc, m.left + qBoxW + 12, qStartY, qBoxW, qBoxH, { label: "Q2 — Apr–Jun" });
    doc.link(m.left + qBoxW + 12, qStartY, qBoxW, qBoxH, { pageNumber: 3 });

    drawBox(doc, m.left, qStartY + qBoxH + 12, qBoxW, qBoxH, { label: "Q3 — Jul–Sep" });
    doc.link(m.left, qStartY + qBoxH + 12, qBoxW, qBoxH, { pageNumber: 5 });

    drawBox(doc, m.left + qBoxW + 12, qStartY + qBoxH + 12, qBoxW, qBoxH, { label: "Q4 — Oct–Dec" });
    doc.link(m.left + qBoxW + 12, qStartY + qBoxH + 12, qBoxW, qBoxH, { pageNumber: 6 });

    drawPageNumber(doc, 1, pageCount + 1, variants);

    // Month-pair pages (2 months per page)
    for (let i = 0; i < 12; i += 2) {
      addPage(doc, variants);
      const pageNum = Math.floor(i / 2) + 2;

      drawHeader(doc, variants, {
        title: `${MONTHS[i]} – ${MONTHS[i + 1]} ${year}`,
        dark: true,
      });

      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.textMedium[0], COLORS.textMedium[1], COLORS.textMedium[2]);
      const backText = "< Overview";
      const backW = doc.getTextWidth(backText);
      doc.text(backText, w - m.right - backW, m.top + 36);
      doc.link(w - m.right - backW, m.top + 28, backW, 12, { pageNumber: 1 });

      const mStartY = m.top + 44;
      const halfH = (h - m.bottom - mStartY - 12) / 2;

      // First month
      drawSectionTitle(doc, MONTHS[i], m.left + 4, mStartY);
      drawBox(doc, m.left, mStartY + 4, bodyW, halfH);
      drawHorizontalLines(doc, variants, {
        startY: mStartY + 4,
        endY: mStartY + halfH,
        spacing: 18,
      });

      // Second month
      const m2Y = mStartY + halfH + 12;
      drawSectionTitle(doc, MONTHS[i + 1], m.left + 4, m2Y);
      drawBox(doc, m.left, m2Y + 4, bodyW, halfH);
      drawHorizontalLines(doc, variants, {
        startY: m2Y + 4,
        endY: m2Y + halfH,
        spacing: 18,
      });

      drawPageNumber(doc, pageNum, pageCount + 1, variants);
    }

    // Extra blank pages
    for (let i = 0; i < pageCount - 7; i++) {
      addPage(doc, variants);
      drawHeader(doc, variants, { title: `${year} — Notes` });
      drawHorizontalLines(doc, variants, {
        startY: m.top + 40,
        endY: h - m.bottom,
        spacing: 18,
      });
    }

    doc.save(`yearly-roadmap-${year}-${variantSuffix(variants)}.pdf`);
  }

  return (
    <TemplateShell
      title="Yearly Roadmap"
      description="Full-year overview with quarterly goal boxes and monthly detail pages."
      onGenerate={generate}
      defaultPageCount={7}
      maxPages={20}
      extraControls={() => (
        <div className="space-y-1.5">
          <Label>Year</Label>
          <Input
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
            className="w-32"
          />
        </div>
      )}
    >
      {() => (
        <div className="flex gap-4">
          <div className="border border-border/40 rounded p-3 w-48 shrink-0">
            <div className="text-xs font-bold mb-2">{year} Roadmap</div>
            <div className="grid grid-cols-2 gap-1.5">
              {["Q1", "Q2", "Q3", "Q4"].map((q) => (
                <div key={q} className="border border-border/30 rounded p-1 text-[8px] text-muted-foreground text-center">
                  {q}
                </div>
              ))}
            </div>
            <div className="mt-2 text-[8px] text-muted-foreground">+ 6 month-pair pages</div>
          </div>
          <div className="text-xs text-muted-foreground space-y-1.5">
            <div>1 overview page + 6 month pages</div>
            <div>Quarterly goal boxes</div>
            <div>Monthly detail sections</div>
          </div>
        </div>
      )}
    </TemplateShell>
  );
}
