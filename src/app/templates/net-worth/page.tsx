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

export default function NetWorthPage() {
  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;

    // Two stacked ledgers — assets on the left half, liabilities on the right —
    // so the page reads as a balance sheet rather than a single flat list. Each
    // side has a label column + a value column ending in a bold subtotal row.
    const colGap = 16;
    const halfW = (bodyW - colGap) / 2;
    const leftX = m.left;
    const rightX = m.left + halfW + colGap;

    // Pre-printed asset prompts grouped by type so the ledger reads as a real
    // net-worth sheet even when blank; remaining rows stay open for write-ins.
    const assetRows = [
      "Cash / Checking",
      "Savings",
      "Emergency Fund",
      "Investments / Brokerage",
      "Retirement (401k / IRA)",
      "Property / Home",
      "Vehicle",
      "Other",
      "",
      "",
    ];
    const liabilityRows = [
      "Mortgage",
      "Auto Loan",
      "Student Loans",
      "Credit Cards",
      "Personal Loans",
      "Medical / Other",
      "",
      "",
    ];

    // Twelve months of net-worth snapshots to chart the trend over a year.
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const headerH = 14;
    const rowH = 16;

    // Shared renderer for one ledger column (Assets or Liabilities). Returns the
    // y just below the bold subtotal row so callers can align both columns.
    function drawLedger(
      x: number,
      top: number,
      title: string,
      valueLabel: string,
      rows: string[],
      totalLabel: string
    ) {
      const labelColW = halfW * 0.6;

      // Section heading above the table.
      drawSectionTitle(doc, title, x, top - 6);

      const tableTop = top;
      const totalRows = rows.length + 1; // +1 subtotal row

      // Header band
      const [hbr, hbg, hbb] = COLORS.headerBg;
      doc.setFillColor(hbr, hbg, hbb);
      doc.rect(x, tableTop, halfW, headerH, "F");

      doc.setFontSize(6.5);
      doc.setFont("helvetica", "bold");
      const [tr, tg, tb] = COLORS.textMedium;
      doc.setTextColor(tr, tg, tb);
      doc.text(title.split(" ")[0], x + 3, tableTop + 9.5);
      doc.text(valueLabel, x + labelColW + 3, tableTop + 9.5);
      doc.setFont("helvetica", "normal");

      // Outer border (header + rows + subtotal)
      const [lr, lg, lb] = COLORS.lineMedium;
      doc.setDrawColor(lr, lg, lb);
      doc.setLineWidth(0.4);
      doc.rect(x, tableTop, halfW, headerH + totalRows * rowH, "S");

      // Value-column separator
      doc.line(x + labelColW, tableTop, x + labelColW, tableTop + headerH + totalRows * rowH);

      // Pre-printed prompts + row separators
      const [llr, llg, llb] = COLORS.lineLight;
      const [dr, dg, db] = COLORS.textDark;
      for (let r = 0; r < rows.length; r++) {
        const ry = tableTop + headerH + r * rowH;
        if (r > 0) {
          doc.setDrawColor(llr, llg, llb);
          doc.setLineWidth(0.3);
          doc.line(x, ry, x + halfW, ry);
        }
        if (rows[r]) {
          doc.setFontSize(7);
          doc.setTextColor(dr, dg, db);
          doc.text(rows[r], x + 3, ry + rowH - 5.5);
        }
        // Faint "$" prefix in the value cell.
        const [tlr, tlg, tlb] = COLORS.textLight;
        doc.setFontSize(7);
        doc.setTextColor(tlr, tlg, tlb);
        doc.text("$", x + labelColW + 3, ry + rowH - 5.5);
      }

      // Subtotal row — heavier separator + bold label.
      const totalsY = tableTop + headerH + rows.length * rowH;
      doc.setDrawColor(lr, lg, lb);
      doc.setLineWidth(0.5);
      doc.line(x, totalsY, x + halfW, totalsY);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(tr, tg, tb);
      doc.text(totalLabel, x + 4, totalsY + rowH - 5.5);
      doc.text("$", x + labelColW + 3, totalsY + rowH - 5.5);
      doc.setFont("helvetica", "normal");

      return totalsY + rowH;
    }

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      drawHeader(doc, variants, { title: "Net Worth Tracker", dark: true });

      const ledgerTop = m.top + 48;

      // ── Assets + Liabilities ledgers (side by side) ──────────────────
      const assetsBottom = drawLedger(
        leftX,
        ledgerTop,
        "Assets",
        "Value $",
        assetRows,
        "TOTAL ASSETS"
      );
      const liabBottom = drawLedger(
        rightX,
        ledgerTop,
        "Liabilities",
        "Balance $",
        liabilityRows,
        "TOTAL LIABILITIES"
      );
      const ledgerBottom = Math.max(assetsBottom, liabBottom);

      // ── Net worth summary box ────────────────────────────────────────
      // A prominent equation strip: Assets − Liabilities = Net Worth.
      const summaryTop = ledgerBottom + 18;
      const summaryH = 40;
      const [hbr, hbg, hbb] = COLORS.headerBg;
      doc.setFillColor(hbr, hbg, hbb);
      const [lr, lg, lb] = COLORS.lineMedium;
      doc.setDrawColor(lr, lg, lb);
      doc.setLineWidth(0.6);
      doc.rect(m.left, summaryTop, bodyW, summaryH, "FD");

      drawSectionTitle(doc, "Net Worth", m.left + 8, summaryTop + 13);

      // Equation: [Total Assets] − [Total Liabilities] = [Net Worth]
      const eqY = summaryTop + 30;
      const [dr, dg, db] = COLORS.textDark;
      const [tlr, tlg, tlb] = COLORS.textLight;
      const cellW = (bodyW - 16 - 40) / 3; // 3 value cells + 2 operator gaps
      const opGap = 20;

      const drawEqCell = (cellX: number, label: string) => {
        // Underlined fill blank with a faint "$".
        doc.setDrawColor(lr, lg, lb);
        doc.setLineWidth(0.5);
        doc.line(cellX, eqY + 2, cellX + cellW, eqY + 2);
        doc.setFontSize(6);
        doc.setTextColor(tlr, tlg, tlb);
        doc.text("$", cellX + 2, eqY - 1);
        doc.setFontSize(5.5);
        doc.text(label, cellX, eqY + 9, { align: "left" });
      };

      let ex = m.left + 8;
      drawEqCell(ex, "Total Assets");
      ex += cellW;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(dr, dg, db);
      doc.text("−", ex + opGap / 2, eqY, { align: "center" });
      ex += opGap;
      drawEqCell(ex, "Total Liabilities");
      ex += cellW;
      doc.text("=", ex + opGap / 2, eqY, { align: "center" });
      ex += opGap;
      drawEqCell(ex, "Net Worth");
      doc.setFont("helvetica", "normal");

      // ── Net-worth-over-time tracker ──────────────────────────────────
      // A 12-month grid: a value blank per month to plot the running total
      // across the year, laid out in two columns of six.
      const trackerTop = summaryTop + summaryH + 18;
      drawSectionTitle(doc, "Net Worth Over Time", m.left, trackerTop);

      const trackTableTop = trackerTop + 8;
      const trackCols = 2;
      const trackColGap = 16;
      const trackColW = (bodyW - trackColGap * (trackCols - 1)) / trackCols;
      const monthLabelW = trackColW * 0.42;
      const trackRowH = 16;
      const perCol = Math.ceil(months.length / trackCols);

      const trackHeight = perCol * trackRowH;
      const [llr, llg, llb] = COLORS.lineLight;

      for (let c = 0; c < trackCols; c++) {
        const tx = m.left + c * (trackColW + trackColGap);
        // Outer border per column block.
        doc.setDrawColor(lr, lg, lb);
        doc.setLineWidth(0.4);
        doc.rect(tx, trackTableTop, trackColW, trackHeight, "S");
        // Month / value separator.
        doc.line(tx + monthLabelW, trackTableTop, tx + monthLabelW, trackTableTop + trackHeight);

        for (let r = 0; r < perCol; r++) {
          const idx = c * perCol + r;
          if (idx >= months.length) break;
          const ry = trackTableTop + r * trackRowH;
          if (r > 0) {
            doc.setDrawColor(llr, llg, llb);
            doc.setLineWidth(0.3);
            doc.line(tx, ry, tx + trackColW, ry);
          }
          // Month label.
          doc.setFontSize(7);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(dr, dg, db);
          doc.text(months[idx], tx + 4, ry + trackRowH - 5.5);
          doc.setFont("helvetica", "normal");
          // Faint "$" prefix in the value cell.
          doc.setFontSize(7);
          doc.setTextColor(tlr, tlg, tlb);
          doc.text("$", tx + monthLabelW + 3, ry + trackRowH - 5.5);
        }
      }

      const [br, bg, bb] = COLORS.black;
      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`net-worth-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Net Worth Tracker"
      description="List your assets and liabilities side by side, compute net worth with a simple Assets − Liabilities equation, then plot the running total month by month across the year."
      onGenerate={generate}
      defaultPageCount={1}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>Assets ledger | Liabilities ledger + subtotals</div>
          <div>Net Worth = Assets − Liabilities equation box</div>
          <div>12-month net-worth-over-time grid</div>
        </div>
      )}
    </TemplateShell>
  );
}
