"use client";

import {
  createDoc,
  drawHeader,
  drawPageNumber,
  drawCheckbox,
  drawLabeledLine,
} from "@/lib/templates/pdf-utils";
import { COLORS } from "@/lib/templates/constants";
import { TemplateShell } from "@/components/templates/template-shell";
import {
  type TemplateVariants,
  getPageDimensions,
  getMargins,
  variantSuffix,
} from "@/lib/templates/variants";

const ROOMS: { name: string; tasks: string[] }[] = [
  { name: "Kitchen", tasks: ["Dishes", "Counters", "Stovetop", "Floor", "Trash"] },
  { name: "Bathroom", tasks: ["Toilet", "Sink", "Mirror", "Shower/Tub", "Floor"] },
  { name: "Bedroom", tasks: ["Make Bed", "Laundry", "Dust", "Vacuum"] },
  { name: "Living Room", tasks: ["Tidy Up", "Dust", "Vacuum", "Windows"] },
  { name: "Other", tasks: ["Entryway", "Hallway", "Garbage Out", "Recycling"] },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CleaningSchedulePage() {
  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      drawHeader(doc, variants, { title: "Cleaning Schedule" });

      let y = m.top + 44;
      drawLabeledLine(doc, "Week of:", m.left + 4, y, m.left + 180);

      y += 20;

      const taskColW = bodyW * 0.3;
      const dayColW = (bodyW - taskColW) / 7;
      const rowH = 16;
      const sectionHeaderH = 18;

      for (const room of ROOMS) {
        const sectionH = sectionHeaderH + room.tasks.length * rowH;
        if (y + sectionH > h - m.bottom - 20) break;

        const [hbr, hbg, hbb] = COLORS.headerBg;
        doc.setFillColor(hbr, hbg, hbb);
        doc.rect(m.left, y, bodyW, sectionHeaderH, "F");

        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        const [tmr, tmg, tmb] = COLORS.textDark;
        doc.setTextColor(tmr, tmg, tmb);
        doc.text(room.name, m.left + 4, y + 12);

        const [thr, thg, thb] = COLORS.textMedium;
        doc.setTextColor(thr, thg, thb);
        doc.setFontSize(5.5);
        for (let d = 0; d < 7; d++) {
          const dx = m.left + taskColW + d * dayColW + dayColW / 2;
          doc.text(DAYS[d], dx, y + 12, { align: "center" });
        }
        doc.setFont("helvetica", "normal");

        const [lr, lg, lb] = COLORS.lineMedium;
        doc.setDrawColor(lr, lg, lb);
        doc.setLineWidth(0.4);
        doc.rect(m.left, y, bodyW, sectionH, "S");
        doc.line(m.left + taskColW, y, m.left + taskColW, y + sectionH);

        for (let d = 1; d < 7; d++) {
          const dx = m.left + taskColW + d * dayColW;
          doc.setDrawColor(230, 230, 230);
          doc.setLineWidth(0.2);
          doc.line(dx, y + sectionHeaderH, dx, y + sectionH);
        }

        for (let t = 0; t < room.tasks.length; t++) {
          const ry = y + sectionHeaderH + t * rowH;

          const [llr, llg, llb] = COLORS.lineLight;
          doc.setDrawColor(llr, llg, llb);
          doc.setLineWidth(0.3);
          doc.line(m.left, ry + rowH, w - m.right, ry + rowH);

          doc.setFontSize(6);
          const [tlr, tlg, tlb] = COLORS.textMedium;
          doc.setTextColor(tlr, tlg, tlb);
          doc.text(room.tasks[t], m.left + 6, ry + 11);

          for (let d = 0; d < 7; d++) {
            const cx = m.left + taskColW + d * dayColW;
            const boxSize = Math.min(dayColW - 4, rowH - 5);
            drawCheckbox(
              doc,
              cx + (dayColW - boxSize) / 2,
              ry + (rowH - boxSize) / 2,
              boxSize
            );
          }
        }

        y += sectionH + 6;
      }

      const [br, bg, bb] = COLORS.black;
      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`cleaning-schedule-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Cleaning Schedule"
      description="Weekly cleaning checklist organized by room with daily checkboxes."
      onGenerate={generate}
      defaultPageCount={3}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>5 rooms: Kitchen, Bathroom, Bedroom, Living Room, Other</div>
          <div>4-5 tasks per room with Mon–Sun checkboxes</div>
          <div>&quot;Week of&quot; date field at top</div>
        </div>
      )}
    </TemplateShell>
  );
}
