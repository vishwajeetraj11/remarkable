"use client";

import {
  createDoc,
  drawHeader,
  drawPageNumber,
  drawSectionTitle,
} from "@/lib/templates/pdf-utils";
import { COLORS } from "@/lib/templates/constants";
import { TemplateShell } from "@/components/templates/template-shell";
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

const ROWS_PER_MONTH = 7;

export default function BirthdayTrackerPage() {
  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;

    const monthsPerPage = Math.ceil(12 / pageCount);

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      drawHeader(doc, variants, {
        title: "Birthday & Event Tracker",
        subtitle: `Page ${page + 1}`,
        dark: true,
      });

      let y = m.top + 44;
      const startMonth = page * monthsPerPage;
      const endMonth = Math.min(startMonth + monthsPerPage, 12);

      const availableH = h - m.bottom - y - 10;
      const monthCount = endMonth - startMonth;
      const monthBlockH = availableH / monthCount;
      const rowH = Math.min(16, (monthBlockH - 20) / (ROWS_PER_MONTH + 1));

      const dateColW = bodyW * 0.15;
      const nameColW = bodyW * 0.45;

      for (let mi = startMonth; mi < endMonth; mi++) {
        drawSectionTitle(doc, MONTHS[mi], m.left + 4, y + 10);
        y += 16;

        const headerH = 14;
        const [hbr, hbg, hbb] = COLORS.headerBg;
        doc.setFillColor(hbr, hbg, hbb);
        doc.rect(m.left, y, bodyW, headerH, "F");

        doc.setFontSize(6);
        doc.setFont("helvetica", "bold");
        const [tr, tg, tb] = COLORS.textMedium;
        doc.setTextColor(tr, tg, tb);
        doc.text("Date", m.left + 4, y + 10);
        doc.text("Name / Event", m.left + dateColW + 4, y + 10);
        doc.text("Notes / Gift Ideas", m.left + dateColW + nameColW + 4, y + 10);
        doc.setFont("helvetica", "normal");

        const tableH = headerH + ROWS_PER_MONTH * rowH;
        const [lr, lg, lb] = COLORS.lineMedium;
        doc.setDrawColor(lr, lg, lb);
        doc.setLineWidth(0.4);
        doc.rect(m.left, y, bodyW, tableH, "S");

        doc.line(m.left + dateColW, y, m.left + dateColW, y + tableH);
        doc.line(
          m.left + dateColW + nameColW,
          y,
          m.left + dateColW + nameColW,
          y + tableH
        );

        const [llr, llg, llb] = COLORS.lineLight;
        for (let r = 0; r <= ROWS_PER_MONTH; r++) {
          const ry = y + headerH + r * rowH;
          doc.setDrawColor(llr, llg, llb);
          doc.setLineWidth(0.3);
          doc.line(m.left, ry, w - m.right, ry);
        }

        y += tableH + 8;
      }

      const [br, bg, bb] = COLORS.black;
      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`birthday-tracker-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Birthday & Event Tracker"
      description="Annual tracker for birthdays, anniversaries, and important dates organized by month."
      onGenerate={generate}
      defaultPageCount={4}
      maxPages={12}
    >
      {(_, pageCount) => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>12 months across {pageCount} page{pageCount > 1 ? "s" : ""}</div>
          <div>Date | Name / Event | Notes / Gift Ideas</div>
          <div>{ROWS_PER_MONTH} blank rows per month</div>
        </div>
      )}
    </TemplateShell>
  );
}
