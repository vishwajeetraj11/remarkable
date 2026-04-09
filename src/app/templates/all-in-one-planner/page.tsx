"use client";

import { useState } from "react";
import { TemplateShell } from "@/components/templates/template-shell";
import { Toggle } from "@/components/templates/variant-controls";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { jsPDF } from "jspdf";
import { createDoc } from "@/lib/templates/pdf-utils";
import { COLORS } from "@/lib/templates/constants";
import {
  type TemplateVariants,
  getPageDimensions,
  getMargins,
  variantSuffix,
} from "@/lib/templates/variants";

// ── Types ──────────────────────────────────────────────────────────────────

interface Section {
  id: string;
  label: string;
  abbr: string;
  startPage: number;
  pageCount: number;
}

// ── Section layout builder ─────────────────────────────────────────────────

function buildSections(weeks: number, includeHabit: boolean, notesPages: number): Section[] {
  const secs: Section[] = [];
  let p = 2; // page 1 = TOC

  secs.push({ id: "yearly", label: "Year Overview", abbr: "YR", startPage: p, pageCount: 1 });
  p += 1;
  secs.push({ id: "quarterly", label: "Quarterly Goals", abbr: "QG", startPage: p, pageCount: 4 });
  p += 4;
  secs.push({ id: "monthly", label: "Monthly Calendar", abbr: "MC", startPage: p, pageCount: 12 });
  p += 12;
  secs.push({ id: "weekly", label: "Weekly Planner", abbr: "WK", startPage: p, pageCount: weeks });
  p += weeks;

  if (includeHabit) {
    secs.push({ id: "habit", label: "Habit Tracker", abbr: "HB", startPage: p, pageCount: 1 });
    p += 1;
  }
  if (notesPages > 0) {
    secs.push({ id: "notes", label: "Notes", abbr: "NO", startPage: p, pageCount: notesPages });
    p += notesPages;
  }

  return secs;
}

function totalPagesFromSections(secs: Section[]): number {
  if (secs.length === 0) return 1;
  const last = secs[secs.length - 1];
  return last.startPage + last.pageCount - 1;
}

// ── Date helpers ───────────────────────────────────────────────────────────

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function toMonday(d: Date): Date {
  const r = new Date(d);
  const day = r.getDay();
  r.setDate(r.getDate() - (day === 0 ? 6 : day - 1));
  return r;
}

function shortDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const DAY_SHORT = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

// ── PDF nav helpers ────────────────────────────────────────────────────────

function drawTabStrip(
  doc: jsPDF,
  w: number,
  m: ReturnType<typeof getMargins>,
  sections: Section[],
  currentId: string,
) {
  const tabW = 18;
  const tabGap = 3;
  const tabH = 16;
  const tabsY = m.top + 6;
  const tabsRight = w - m.right - 2;
  const tabsStartX = tabsRight - sections.length * (tabW + tabGap) + tabGap;

  sections.forEach((s, i) => {
    const tx = tabsStartX + i * (tabW + tabGap);
    const isCurrent = s.id === currentId;

    if (isCurrent) {
      doc.setFillColor(255, 255, 255);
      doc.rect(tx, tabsY, tabW, tabH, "F");
      doc.setTextColor(0, 0, 0);
    } else {
      doc.setFillColor(65, 65, 65);
      doc.rect(tx, tabsY, tabW, tabH, "F");
      doc.setTextColor(190, 190, 190);
      doc.link(tx, tabsY, tabW, tabH, { pageNumber: s.startPage });
    }

    doc.setFontSize(5.5);
    doc.setFont("helvetica", "bold");
    doc.text(s.abbr, tx + tabW / 2, tabsY + tabH / 2 + 2, { align: "center" });
  });

  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
}

function drawPageHeader(
  doc: jsPDF,
  w: number,
  m: ReturnType<typeof getMargins>,
  title: string,
  subtitle: string | undefined,
  sections: Section[],
  currentId: string,
) {
  const bodyW = w - m.left - m.right;
  const [hr, hg, hb] = COLORS.headerBgDark;
  doc.setFillColor(hr, hg, hb);
  doc.rect(m.left, m.top, bodyW, 28, "F");

  const [wr, wg, wb] = COLORS.white;
  doc.setTextColor(wr, wg, wb);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(title, m.left + 8, m.top + 18);

  if (subtitle) {
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    const titleW = doc.getTextWidth(title);
    doc.text(subtitle, m.left + 12 + titleW, m.top + 18);
  }

  drawTabStrip(doc, w, m, sections, currentId);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
}

function drawFooterNav(
  doc: jsPDF,
  w: number,
  h: number,
  m: ReturnType<typeof getMargins>,
  pageNum: number,
  total: number,
) {
  const y = h - 10;
  const [pr, pg, pb] = COLORS.textLight;
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(pr, pg, pb);

  // page number
  doc.text(`${pageNum} / ${total}`, w / 2, y, { align: "center" });

  // TOC link above page number
  const tocText = "\u2191 Index";
  const tocW = doc.getTextWidth(tocText);
  doc.text(tocText, w / 2, y - 10, { align: "center" });
  doc.link(w / 2 - tocW / 2, y - 18, tocW, 10, { pageNumber: 1 });

  // Back
  if (pageNum > 2) {
    const backText = "\u2190 Back";
    doc.text(backText, m.left, y);
    const bw = doc.getTextWidth(backText);
    doc.link(m.left, y - 8, bw, 10, { pageNumber: pageNum - 1 });
  }

  // Next
  if (pageNum < total) {
    const nextText = "Next \u2192";
    doc.text(nextText, w - m.right, y, { align: "right" });
    const nw = doc.getTextWidth(nextText);
    doc.link(w - m.right - nw, y - 8, nw, 10, { pageNumber: pageNum + 1 });
  }

  doc.setTextColor(0, 0, 0);
}

function bodyTop(m: ReturnType<typeof getMargins>): number {
  return m.top + 36;
}

function bodyBottom(h: number, m: ReturnType<typeof getMargins>): number {
  return h - m.bottom - 24; // leave room for footer nav
}

// ── Page renderers ─────────────────────────────────────────────────────────

function renderTOCPage(
  doc: jsPDF,
  w: number,
  h: number,
  m: ReturnType<typeof getMargins>,
  sections: Section[],
  plannerName: string,
  total: number,
) {
  const bodyW = w - m.left - m.right;

  // Header
  const [hr, hg, hb] = COLORS.headerBgDark;
  doc.setFillColor(hr, hg, hb);
  doc.rect(m.left, m.top, bodyW, 28, "F");
  const [wr, wg, wb] = COLORS.white;
  doc.setTextColor(wr, wg, wb);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(plannerName, m.left + 8, m.top + 19);

  // "Contents" label
  let y = m.top + 52;
  const [tr, tg, tb] = COLORS.textMedium;
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(tr, tg, tb);
  doc.text("CONTENTS", m.left + 4, y);
  y += 16;

  sections.forEach((s) => {
    const [br, bg, bb] = COLORS.black;
    doc.setTextColor(br, bg, bb);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(s.label, m.left + 8, y);

    const pageStr = `p. ${s.startPage}`;
    doc.setFontSize(8);
    const [tr2, tg2, tb2] = COLORS.textMedium;
    doc.setTextColor(tr2, tg2, tb2);
    doc.text(pageStr, w - m.right - 8, y, { align: "right" });

    // Dot leader
    const nameW = doc.getTextWidth(s.label);
    const pageW = doc.getTextWidth(pageStr);
    const leaderStart = m.left + 8 + nameW + 4;
    const leaderEnd = w - m.right - 8 - pageW - 4;
    doc.setFontSize(6);
    const [lr, lg, lb] = COLORS.lineLight;
    doc.setTextColor(lr, lg, lb);
    let dx = leaderStart;
    while (dx < leaderEnd) {
      doc.text(".", dx, y);
      dx += 4;
    }

    // Clickable link over the whole row
    const rowH = 14;
    doc.link(m.left, y - rowH + 2, bodyW, rowH, { pageNumber: s.startPage });

    // Underline the label
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(m.left + 8, y + 2, m.left + 8 + nameW, y + 2);

    y += 28;
  });

  // Page number
  const [pr, pg, pb] = COLORS.textLight;
  doc.setFontSize(7);
  doc.setTextColor(pr, pg, pb);
  doc.text(`1 / ${total}`, w / 2, h - 10, { align: "center" });
  doc.setTextColor(0, 0, 0);
}

function renderYearlyPage(
  doc: jsPDF,
  w: number,
  h: number,
  m: ReturnType<typeof getMargins>,
  sections: Section[],
  startYear: number,
  pageNum: number,
  total: number,
) {
  drawPageHeader(doc, w, m, "Year Overview", startYear.toString(), sections, "yearly");

  const bt = bodyTop(m);
  const bb = bodyBottom(h, m);
  const bodyW = w - m.left - m.right;

  // 4×3 mini month grid
  const cols = 4;
  const rows = 3;
  const gapX = 8;
  const gapY = 8;
  const cellW = (bodyW - gapX * (cols - 1)) / cols;
  const cellH = (bb - bt - gapY * (rows - 1)) / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const monthIdx = r * cols + c;
      const cx = m.left + c * (cellW + gapX);
      const cy = bt + r * (cellH + gapY);

      // Month header
      const [hr2, hg2, hb2] = COLORS.headerBg;
      doc.setFillColor(hr2, hg2, hb2);
      doc.rect(cx, cy, cellW, 14, "F");
      const [tr, tg, tb] = COLORS.textMedium;
      doc.setTextColor(tr, tg, tb);
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "bold");
      doc.text(MONTH_SHORT[monthIdx], cx + cellW / 2, cy + 10, { align: "center" });

      // Border
      const [lr, lg, lb] = COLORS.lineLight;
      doc.setDrawColor(lr, lg, lb);
      doc.setLineWidth(0.4);
      doc.rect(cx, cy, cellW, cellH, "S");

      // Mini day grid
      const gridTop = cy + 18;
      const gridBot = cy + cellH - 4;
      const dayW = cellW / 7;
      const slotH = (gridBot - gridTop) / 6;
      const firstDay = new Date(startYear, monthIdx, 1);
      const dow = firstDay.getDay();
      const offset = dow === 0 ? 6 : dow - 1;
      const daysInMonth = new Date(startYear, monthIdx + 1, 0).getDate();

      for (let d = 1; d <= daysInMonth; d++) {
        const pos = d - 1 + offset;
        const dc = pos % 7;
        const dr = Math.floor(pos / 7);
        const dx = cx + dc * dayW + dayW / 2;
        const dy = gridTop + dr * slotH + slotH * 0.7;
        doc.setFontSize(4.5);
        doc.setFont("helvetica", "normal");
        const [br, bg, bb2] = COLORS.black;
        doc.setTextColor(br, bg, bb2);
        doc.text(d.toString(), dx, dy, { align: "center" });
      }
    }
  }

  drawFooterNav(doc, w, h, m, pageNum, total);
}

function renderQuarterlyPage(
  doc: jsPDF,
  w: number,
  h: number,
  m: ReturnType<typeof getMargins>,
  sections: Section[],
  quarter: number, // 1-4
  startYear: number,
  pageNum: number,
  total: number,
) {
  const qLabel = `Q${quarter} Goals`;
  const months = [(quarter - 1) * 3, (quarter - 1) * 3 + 1, (quarter - 1) * 3 + 2];
  drawPageHeader(doc, w, m, qLabel, `${startYear}`, sections, "quarterly");

  const bt = bodyTop(m);
  const bb = bodyBottom(h, m);
  const bodyW = w - m.left - m.right;

  // Quarter focus at top
  const [tr, tg, tb] = COLORS.textMedium;
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(tr, tg, tb);
  doc.text("QUARTER FOCUS", m.left + 4, bt + 8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  const [lr, lg, lb] = COLORS.lineLight;
  doc.setDrawColor(lr, lg, lb);
  doc.setLineWidth(0.4);
  for (let i = 0; i < 2; i++) {
    doc.line(m.left + 4, bt + 18 + i * 14, m.left + bodyW - 4, bt + 18 + i * 14);
  }

  // 3 month columns
  const colGap = 8;
  const colW = (bodyW - colGap * 2) / 3;
  const colTop = bt + 52;
  const colBot = bb;

  months.forEach((monthIdx, ci) => {
    const cx = m.left + ci * (colW + colGap);
    const cy = colTop;

    // Month header
    const [hr2, hg2, hb2] = COLORS.headerBgDark;
    doc.setFillColor(hr2, hg2, hb2);
    doc.rect(cx, cy, colW, 18, "F");
    const [wr, wg2, wb] = COLORS.white;
    doc.setTextColor(wr, wg2, wb);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text(MONTH_NAMES[monthIdx], cx + colW / 2, cy + 12, { align: "center" });

    // Goal lines
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    const lineSpacing = 16;
    let ly = cy + 30;
    doc.setFontSize(6.5);
    const [tr2, tg2, tb2] = COLORS.textMedium;
    doc.setTextColor(tr2, tg2, tb2);
    let lineNum = 1;
    while (ly < colBot - 4) {
      doc.text(`${lineNum}.`, cx + 4, ly);
      doc.setTextColor(0, 0, 0);
      doc.setDrawColor(lr, lg, lb);
      doc.setLineWidth(0.3);
      doc.line(cx + 12, ly + 1, cx + colW - 4, ly + 1);
      doc.setTextColor(tr2, tg2, tb2);
      ly += lineSpacing;
      lineNum++;
    }
  });

  drawFooterNav(doc, w, h, m, pageNum, total);
}

function renderMonthlyPage(
  doc: jsPDF,
  w: number,
  h: number,
  m: ReturnType<typeof getMargins>,
  sections: Section[],
  monthIdx: number, // 0-11
  year: number,
  weekStart: Date,
  weeks: number,
  weeklySec: Section,
  pageNum: number,
  total: number,
) {
  const monthLabel = MONTH_NAMES[monthIdx];
  drawPageHeader(doc, w, m, monthLabel, year.toString(), sections, "monthly");

  const bt = bodyTop(m);
  const bb = bodyBottom(h, m);
  const bodyW = w - m.left - m.right;

  // Day-of-week labels
  let y = bt + 10;
  const colW = bodyW / 7;
  DAY_SHORT.forEach((d, i) => {
    const [tr, tg, tb] = COLORS.textMedium;
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(tr, tg, tb);
    doc.text(d, m.left + i * colW + colW / 2, y, { align: "center" });
  });
  y += 6;

  // Divider
  const [lr, lg, lb] = COLORS.lineMedium;
  doc.setDrawColor(lr, lg, lb);
  doc.setLineWidth(0.4);
  doc.line(m.left, y, w - m.right, y);
  y += 2;

  // Calendar rows
  const firstDayOfMonth = new Date(year, monthIdx, 1);
  const dow = firstDayOfMonth.getDay();
  const startOffset = dow === 0 ? 6 : dow - 1;
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const rowCount = Math.ceil((startOffset + daysInMonth) / 7);
  const rowH = Math.min(68, (bb - y) / rowCount);

  for (let row = 0; row < rowCount; row++) {
    const rowY = y + row * rowH;

    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.3);
    doc.line(m.left, rowY, w - m.right, rowY);

    for (let col = 0; col < 7; col++) {
      const dayNum = row * 7 + col - startOffset + 1;
      const cellX = m.left + col * colW;

      if (dayNum >= 1 && dayNum <= daysInMonth) {
        // Day number
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text(dayNum.toString(), cellX + 4, rowY + 12);

        // Find week page for this day
        const cellDate = new Date(year, monthIdx, dayNum);
        const diffMs = cellDate.getTime() - weekStart.getTime();
        const weekIdx = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
        if (weekIdx >= 0 && weekIdx < weeks) {
          const weekPage = weeklySec.startPage + weekIdx;
          // Subtle link on entire cell
          doc.link(cellX, rowY, colW, rowH, { pageNumber: weekPage });
          // Small week indicator
          doc.setFontSize(5.5);
          doc.setFont("helvetica", "normal");
          const [tr, tg, tb] = COLORS.textLight;
          doc.setTextColor(tr, tg, tb);
          doc.text(`W${weekIdx + 1}`, cellX + colW - 2, rowY + 12, { align: "right" });
        }
      }

      // Vertical column separator
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.2);
      if (col < 6) {
        doc.line(m.left + (col + 1) * colW, rowY, m.left + (col + 1) * colW, rowY + rowH);
      }
    }
  }

  // Bottom border
  const finalY = y + rowCount * rowH;
  doc.setDrawColor(210, 210, 210);
  doc.setLineWidth(0.3);
  doc.line(m.left, finalY, w - m.right, finalY);

  drawFooterNav(doc, w, h, m, pageNum, total);
}

function renderWeeklyPage(
  doc: jsPDF,
  w: number,
  h: number,
  m: ReturnType<typeof getMargins>,
  sections: Section[],
  weekIdx: number,
  weekStart: Date,
  pageNum: number,
  total: number,
) {
  const wb = addDays(weekStart, weekIdx * 7);
  const we = addDays(wb, 6);
  const subtitle = `${shortDate(wb)} \u2013 ${shortDate(we)}`;
  drawPageHeader(doc, w, m, `Week ${weekIdx + 1}`, subtitle, sections, "weekly");

  const bt = bodyTop(m);
  const bb = bodyBottom(h, m);
  const bodyW = w - m.left - m.right;

  // Day columns
  const colW = bodyW / 7;
  const headerH = 22;

  DAY_SHORT.forEach((d, i) => {
    const cx = m.left + i * colW;
    const dayDate = addDays(wb, i);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    const [tr, tg, tb] = COLORS.textDark;
    doc.setTextColor(tr, tg, tb);
    doc.text(d, cx + colW / 2, bt + 10, { align: "center" });
    doc.setFontSize(6);
    doc.setFont("helvetica", "normal");
    const [tr2, tg2, tb2] = COLORS.textMedium;
    doc.setTextColor(tr2, tg2, tb2);
    doc.text(shortDate(dayDate), cx + colW / 2, bt + 19, { align: "center" });
  });

  // Grid lines
  const [lr, lg, lb] = COLORS.lineLight;
  doc.setDrawColor(lr, lg, lb);
  doc.setLineWidth(0.4);
  // Vertical separators
  for (let i = 0; i <= 7; i++) {
    const x = m.left + i * colW;
    doc.line(x, bt + headerH, x, bb);
  }
  // Horizontal header bottom
  doc.setLineWidth(0.5);
  doc.line(m.left, bt + headerH, w - m.right, bt + headerH);
  // Horizontal writing lines
  doc.setLineWidth(0.3);
  const lineSpacing = 20;
  let ly = bt + headerH + lineSpacing;
  while (ly < bb - 4) {
    doc.line(m.left, ly, w - m.right, ly);
    ly += lineSpacing;
  }
  // Bottom border
  doc.setLineWidth(0.4);
  doc.line(m.left, bb, w - m.right, bb);

  doc.setTextColor(0, 0, 0);
  drawFooterNav(doc, w, h, m, pageNum, total);
}

function renderHabitPage(
  doc: jsPDF,
  w: number,
  h: number,
  m: ReturnType<typeof getMargins>,
  sections: Section[],
  pageNum: number,
  total: number,
) {
  drawPageHeader(doc, w, m, "Habit Tracker", undefined, sections, "habit");

  const bt = bodyTop(m);
  const bb = bodyBottom(h, m);
  const bodyW = w - m.left - m.right;
  const maxHabits = 8;
  const days = 31;

  const habitColW = 80;
  const dayColW = (bodyW - habitColW) / days;
  const rowH = (bb - bt - 16) / (maxHabits + 1);

  // Header row: day numbers
  const [tr, tg, tb] = COLORS.textMedium;
  doc.setFontSize(5.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(tr, tg, tb);
  for (let d = 1; d <= days; d++) {
    doc.text(
      d.toString(),
      m.left + habitColW + (d - 0.5) * dayColW,
      bt + rowH / 2 + 2,
      { align: "center" },
    );
  }

  // Habit rows
  for (let hi = 0; hi < maxHabits; hi++) {
    const ry = bt + (hi + 1) * rowH;

    const [lr, lg, lb] = COLORS.lineLight;
    doc.setDrawColor(lr, lg, lb);
    doc.setLineWidth(0.3);
    doc.line(m.left, ry, w - m.right, ry);

    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(tr, tg, tb);
    doc.text(`Habit ${hi + 1}`, m.left + 4, ry + rowH / 2 + 2);

    // Checkboxes
    for (let d = 0; d < days; d++) {
      const cx = m.left + habitColW + d * dayColW + dayColW / 2;
      const boxSize = Math.min(6, dayColW * 0.7);
      const bx = cx - boxSize / 2;
      const by = ry + (rowH - boxSize) / 2;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.4);
      doc.rect(bx, by, boxSize, boxSize, "S");
    }
  }

  // Vertical separator: habits vs days
  const [lm, lgm, lbm] = COLORS.lineMedium;
  doc.setDrawColor(lm, lgm, lbm);
  doc.setLineWidth(0.5);
  doc.line(m.left + habitColW, bt, m.left + habitColW, bt + (maxHabits + 1) * rowH);

  drawFooterNav(doc, w, h, m, pageNum, total);
}

function renderNotesPage(
  doc: jsPDF,
  w: number,
  h: number,
  m: ReturnType<typeof getMargins>,
  sections: Section[],
  noteIdx: number,
  pageNum: number,
  total: number,
) {
  drawPageHeader(doc, w, m, "Notes", undefined, sections, "notes");

  const bt = bodyTop(m);
  const bb = bodyBottom(h, m);
  const lineSpacing = 20;
  const [lr, lg, lb] = COLORS.lineLight;
  doc.setDrawColor(lr, lg, lb);
  doc.setLineWidth(0.3);
  let ly = bt + lineSpacing;
  while (ly <= bb) {
    doc.line(m.left + 4, ly, w - m.right - 4, ly);
    ly += lineSpacing;
  }

  drawFooterNav(doc, w, h, m, pageNum, total);
}

// ── Main generator ─────────────────────────────────────────────────────────

async function generatePlanner(
  variants: TemplateVariants,
  startDateStr: string,
  weeks: number,
  includeHabit: boolean,
  notesPages: number,
) {
  const { w, h } = getPageDimensions(variants);
  const m = getMargins(variants);
  const doc = createDoc(variants);

  const startDate = new Date(startDateStr + "T00:00:00");
  const weekStart = toMonday(startDate);
  const startYear = startDate.getFullYear();

  const sections = buildSections(weeks, includeHabit, notesPages);
  const total = totalPagesFromSections(sections);

  const weeklySec = sections.find((s) => s.id === "weekly")!;
  const monthlySec = sections.find((s) => s.id === "monthly")!;

  const plannerLabel = `All-in-One Planner \u2014 ${startYear}`;

  // Page 1: TOC
  renderTOCPage(doc, w, h, m, sections, plannerLabel, total);

  // Page 2: Yearly Overview
  doc.addPage();
  renderYearlyPage(doc, w, h, m, sections, startYear, 2, total);

  // Pages 3-6: Quarterly Goals
  for (let q = 1; q <= 4; q++) {
    doc.addPage();
    renderQuarterlyPage(doc, w, h, m, sections, q, startYear, sections.find((s) => s.id === "quarterly")!.startPage + q - 1, total);
  }

  // Pages 7-18: Monthly Calendars
  for (let mo = 0; mo < 12; mo++) {
    doc.addPage();
    renderMonthlyPage(
      doc, w, h, m, sections,
      mo, startYear,
      weekStart, weeks, weeklySec,
      monthlySec.startPage + mo,
      total,
    );
  }

  // Weekly pages
  for (let wi = 0; wi < weeks; wi++) {
    doc.addPage();
    renderWeeklyPage(doc, w, h, m, sections, wi, weekStart, weeklySec.startPage + wi, total);
  }

  // Habit tracker
  if (includeHabit) {
    doc.addPage();
    const habitSec = sections.find((s) => s.id === "habit")!;
    renderHabitPage(doc, w, h, m, sections, habitSec.startPage, total);
  }

  // Notes pages
  for (let ni = 0; ni < notesPages; ni++) {
    doc.addPage();
    const notesSec = sections.find((s) => s.id === "notes")!;
    renderNotesPage(doc, w, h, m, sections, ni, notesSec.startPage + ni, total);
  }

  const suffix = variantSuffix(variants);
  doc.save(`all-in-one-planner-${startYear}-${suffix}.pdf`);
}

// ── Page component ─────────────────────────────────────────────────────────

export default function AllInOnePlannerPage() {
  const today = new Date();
  const defaultDate = today.toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(defaultDate);
  const [weeks, setWeeks] = useState(12);
  const [includeHabit, setIncludeHabit] = useState(true);
  const [notesPages, setNotesPages] = useState(5);

  const sections = buildSections(weeks, includeHabit, notesPages);
  const total = totalPagesFromSections(sections);

  async function generate(variants: TemplateVariants) {
    await generatePlanner(variants, startDate, weeks, includeHabit, notesPages);
  }

  return (
    <TemplateShell
      title="All-in-One Planner Builder"
      description="A fully hyperlinked PDF planner — tap any section tab or TOC entry to jump straight there. Includes year overview, quarterly goals, monthly calendars with week deep-links, weekly pages, habit tracker, and notes."
      showPageCount={false}
      onGenerate={(v) => generate(v)}
      downloadLabel={() => `Generate & Download PDF (${total} pages)`}
      extraControls={() => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="startDate">Start date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label>Weekly pages: {weeks}</Label>
            <Slider
              min={4}
              max={52}
              step={4}
              value={[weeks]}
              onValueChange={(v) => setWeeks(Array.isArray(v) ? v[0] : v)}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>4</span>
              <span>52</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notes pages: {notesPages}</Label>
            <Slider
              min={0}
              max={20}
              value={[notesPages]}
              onValueChange={(v) => setNotesPages(Array.isArray(v) ? v[0] : v)}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>20</span>
            </div>
          </div>
          <div className="pt-1 space-y-2">
            <Toggle
              checked={includeHabit}
              onToggle={() => setIncludeHabit((v) => !v)}
              label="Include habit tracker"
            />
          </div>
        </div>
      )}
    >
      {() => (
        <div className="space-y-3 text-sm">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Planner structure ({total} pages)
          </div>
          <div className="grid grid-cols-2 gap-2">
            {sections.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-2 rounded-md border border-border px-3 py-2 bg-muted/20"
              >
                <span className="inline-flex items-center justify-center w-7 h-5 rounded text-[10px] font-bold bg-foreground text-background shrink-0">
                  {s.abbr}
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-medium truncate">{s.label}</div>
                  <div className="text-[10px] text-muted-foreground">
                    p.{s.startPage}
                    {s.pageCount > 1 ? `\u2013${s.startPage + s.pageCount - 1}` : ""} &middot; {s.pageCount} page{s.pageCount !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            ))}
            {/* TOC entry */}
            <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2 bg-muted/20">
              <span className="inline-flex items-center justify-center w-7 h-5 rounded text-[10px] font-bold bg-foreground text-background shrink-0">
                TC
              </span>
              <div>
                <div className="text-xs font-medium">Index / TOC</div>
                <div className="text-[10px] text-muted-foreground">p.1 &middot; 1 page</div>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Every page has clickable section tabs in the header and Prev / Index / Next links in the footer. Monthly calendar cells link directly to the matching weekly page.
          </p>
        </div>
      )}
    </TemplateShell>
  );
}
