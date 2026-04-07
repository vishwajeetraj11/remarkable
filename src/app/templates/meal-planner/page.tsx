"use client";

import {
  createDoc,
  drawHeader,
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

export default function MealPlannerPage() {
  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;

    const dayLabels =
      variants.weekStart === "sunday"
        ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const meals = ["Breakfast", "Lunch", "Dinner", "Snacks"];

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      drawHeader(doc, variants, { title: "Meal Planner", dark: true });

      const gridTop = m.top + 44;
      const mealColW = bodyW * 0.12;
      const dayColW = (bodyW - mealColW) / 7;
      const rowH = (h - m.bottom - gridTop - 10) / (meals.length + 1);

      // Header row with days
      const [hbr, hbg, hbb] = COLORS.headerBg;
      doc.setFillColor(hbr, hbg, hbb);
      doc.rect(m.left, gridTop, bodyW, rowH, "F");

      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      const [tr, tg, tb] = COLORS.textMedium;
      doc.setTextColor(tr, tg, tb);

      dayLabels.forEach((day, i) => {
        const dx = m.left + mealColW + i * dayColW;
        doc.text(day, dx + dayColW / 2, gridTop + rowH / 2 + 2, {
          align: "center",
        });
      });
      doc.setFont("helvetica", "normal");

      // Grid
      const [lr, lg, lb] = COLORS.lineMedium;
      doc.setDrawColor(lr, lg, lb);
      doc.setLineWidth(0.4);
      doc.rect(m.left, gridTop, bodyW, rowH * (meals.length + 1), "S");

      // Meal column border
      doc.line(
        m.left + mealColW,
        gridTop,
        m.left + mealColW,
        gridTop + rowH * (meals.length + 1)
      );

      // Day column lines
      for (let i = 1; i < 7; i++) {
        const x = m.left + mealColW + i * dayColW;
        doc.line(x, gridTop, x, gridTop + rowH * (meals.length + 1));
      }

      // Row lines + meal labels
      const [br, bg, bb] = COLORS.black;
      for (let r = 0; r < meals.length; r++) {
        const ry = gridTop + (r + 1) * rowH;
        doc.setDrawColor(lr, lg, lb);
        doc.setLineWidth(0.3);
        doc.line(m.left, ry, w - m.right, ry);

        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(tr, tg, tb);
        doc.text(meals[r], m.left + 4, ry + rowH / 2 + 2);
      }

      doc.setFont("helvetica", "normal");
      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`meal-planner-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Meal Planner"
      description="Weekly meal grid with rows for breakfast, lunch, dinner, and snacks across 7 days."
      showWeekStart
      onGenerate={generate}
      defaultPageCount={4}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>7-day columns with meal rows</div>
          <div>Breakfast / Lunch / Dinner / Snacks</div>
          <div>Large cells for writing recipes</div>
        </div>
      )}
    </TemplateShell>
  );
}
