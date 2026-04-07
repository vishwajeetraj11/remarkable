"use client";

import { useState } from "react";
import { TemplateShell } from "@/components/templates/template-shell";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  createDoc,
  addPage,
  drawHeader,
  drawPageNumber,
  drawBox,
  drawSectionTitle,
  drawHorizontalLines,
  drawCheckbox,
} from "@/lib/templates/pdf-utils";
import {
  type TemplateVariants,
  getPageDimensions,
  getMargins,
  variantSuffix,
} from "@/lib/templates/variants";

const QUARTER_LABELS: Record<string, string> = {
  q1: "Q1 — January to March",
  q2: "Q2 — April to June",
  q3: "Q3 — July to September",
  q4: "Q4 — October to December",
};

const QUARTER_MONTHS: Record<string, string[]> = {
  q1: ["January", "February", "March"],
  q2: ["April", "May", "June"],
  q3: ["July", "August", "September"],
  q4: ["October", "November", "December"],
};

export default function QuarterlyGoalsPage() {
  const [quarter, setQuarter] = useState("q1");
  const [year, setYear] = useState(new Date().getFullYear());

  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;
    const months = QUARTER_MONTHS[quarter];

    // Page 1: Quarter overview
    drawHeader(doc, variants, {
      title: `${QUARTER_LABELS[quarter]} ${year}`,
      dark: true,
    });

    let y = m.top + 48;
    drawSectionTitle(doc, "Quarter Theme / Focus", m.left + 4, y);
    drawHorizontalLines(doc, variants, { startY: y + 2, endY: y + 40, spacing: 18 });

    y += 52;
    drawSectionTitle(doc, "Key Goals", m.left + 4, y);
    y += 10;
    for (let i = 0; i < 5; i++) {
      drawCheckbox(doc, m.left + 6, y + i * 22, 8);
      doc.setDrawColor(210, 210, 210);
      doc.setLineWidth(0.3);
      doc.line(m.left + 20, y + i * 22 + 8, w - m.right - 4, y + i * 22 + 8);
    }

    y += 120;
    drawSectionTitle(doc, "Key Metrics / KPIs", m.left + 4, y);
    drawHorizontalLines(doc, variants, {
      startY: y + 2,
      endY: y + 60,
      spacing: 18,
    });

    y += 72;
    const thirdW = (bodyW - 16) / 3;
    months.forEach((month, i) => {
      drawBox(doc, m.left + i * (thirdW + 8), y, thirdW, h - m.bottom - y, {
        label: month,
      });
    });

    drawPageNumber(doc, 1, pageCount, variants);

    // Monthly detail pages
    for (let mi = 0; mi < 3; mi++) {
      addPage(doc, variants);
      drawHeader(doc, variants, {
        title: `${months[mi]} ${year}`,
        subtitle: QUARTER_LABELS[quarter],
      });

      let cy = m.top + 48;
      drawSectionTitle(doc, "Month Goals", m.left + 4, cy);
      cy += 10;
      for (let i = 0; i < 4; i++) {
        drawCheckbox(doc, m.left + 6, cy + i * 22, 8);
        doc.setDrawColor(210, 210, 210);
        doc.setLineWidth(0.3);
        doc.line(m.left + 20, cy + i * 22 + 8, w - m.right - 4, cy + i * 22 + 8);
      }

      cy += 100;
      drawSectionTitle(doc, "Key Tasks", m.left + 4, cy);
      drawHorizontalLines(doc, variants, {
        startY: cy + 2,
        endY: cy + 100,
        spacing: 18,
      });

      cy += 112;
      drawSectionTitle(doc, "Notes & Reflections", m.left + 4, cy);
      drawHorizontalLines(doc, variants, {
        startY: cy + 2,
        endY: h - m.bottom,
        spacing: 18,
      });

      drawPageNumber(doc, mi + 2, pageCount, variants);
    }

    // Extra pages
    for (let i = 0; i < pageCount - 4; i++) {
      addPage(doc, variants);
      drawHeader(doc, variants, {
        title: `${QUARTER_LABELS[quarter]} — Notes`,
      });
      drawHorizontalLines(doc, variants, {
        startY: m.top + 40,
        endY: h - m.bottom,
        spacing: 18,
      });
      drawPageNumber(doc, i + 5, pageCount, variants);
    }

    doc.save(`quarterly-goals-${quarter}-${year}-${variantSuffix(variants)}.pdf`);
  }

  return (
    <TemplateShell
      title="Quarterly Goals"
      description="Quarter overview with goal tracking, monthly breakdowns, and KPI sections."
      onGenerate={generate}
      defaultPageCount={4}
      maxPages={12}
      extraControls={() => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Quarter</Label>
            <Select value={quarter} onValueChange={setQuarter}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(QUARTER_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Year</Label>
            <Input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
              className="w-32"
            />
          </div>
        </div>
      )}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>1 quarter overview + 3 monthly detail pages</div>
          <div>Goal checkboxes with progress lines</div>
          <div>KPI tracking section</div>
          <div>Monthly breakdown columns</div>
        </div>
      )}
    </TemplateShell>
  );
}
