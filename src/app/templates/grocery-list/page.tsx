"use client";

import {
  createDoc,
  drawPageNumber,
  drawSectionTitle,
  drawCheckbox,
} from "@/lib/templates/pdf-utils";
import { COLORS } from "@/lib/templates/constants";
import { TemplateShell } from "@/components/templates/template-shell";
import {
  type TemplateVariants,
  getPageDimensions,
  getMargins,
  variantSuffix,
} from "@/lib/templates/variants";

const SECTIONS = [
  "Produce", "Dairy & Eggs", "Meat & Seafood",
  "Bakery", "Pantry & Canned", "Frozen",
  "Beverages", "Household", "Other",
];

export default function GroceryListPage() {
  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Grocery List", m.left + 4, m.top + 16);
      doc.setFont("helvetica", "normal");

      const [lr, lg, lb] = COLORS.lineMedium;
      doc.setDrawColor(lr, lg, lb);
      doc.setLineWidth(0.5);
      doc.line(m.left, m.top + 22, w - m.right, m.top + 22);

      // Two-column layout
      const colW = (bodyW - 12) / 2;
      let leftY = m.top + 32;
      let rightY = m.top + 32;

      SECTIONS.forEach((section, idx) => {
        const isLeft = idx % 2 === 0;
        const x = isLeft ? m.left : m.left + colW + 12;
        let y = isLeft ? leftY : rightY;

        drawSectionTitle(doc, section, x + 4, y);
        y += 10;

        const itemCount = 5;
        for (let i = 0; i < itemCount; i++) {
          drawCheckbox(doc, x + 4, y + i * 16, 6);
          const [llr, llg, llb] = COLORS.lineLight;
          doc.setDrawColor(llr, llg, llb);
          doc.setLineWidth(0.2);
          doc.line(x + 14, y + i * 16 + 6, x + colW - 4, y + i * 16 + 6);
        }

        const sectionH = 10 + itemCount * 16 + 10;
        if (isLeft) leftY += sectionH;
        else rightY += sectionH;
      });

      const [br, bg, bb] = COLORS.black;
      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`grocery-list-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Grocery List"
      description="Organized grocery list with 9 pre-labeled sections in a two-column layout."
      onGenerate={generate}
      defaultPageCount={2}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>9 categorized sections</div>
          <div>Two-column layout</div>
          <div>Checkboxes per item</div>
        </div>
      )}
    </TemplateShell>
  );
}
