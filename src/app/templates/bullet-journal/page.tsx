"use client";

import { TemplateShell } from "@/components/templates/template-shell";
import { jsPDF } from "jspdf";
import {
  createDoc,
  addPage,
  drawHeader,
  drawPageNumber,
  drawSectionTitle,
  MM_TO_PT,
} from "@/lib/templates/pdf-utils";
import { COLORS } from "@/lib/templates/constants";
import {
  type TemplateVariants,
  getPageDimensions,
  getMargins,
  variantSuffix,
} from "@/lib/templates/variants";

// ── Collection model ─────────────────────────────────────────────────────────
// A fixed set of classic bullet-journal collections bundled into ONE hyperlinked
// PDF. Page 1 is always the INDEX / KEY; each collection starts at a known page
// computed below. The page count is fixed by the collection set (Future Log
// spans 2 pages), so showPageCount is disabled and the template relies on its
// own index/back-links for navigation on an e-ink tablet.

type CollectionId = "future" | "monthly" | "weekly" | "trackers";

interface Collection {
  id: CollectionId;
  label: string;
  /** 1-based page where this collection begins. */
  startPage: number;
  /** Number of pages this collection occupies. */
  pageCount: number;
}

// Page 1 = INDEX / KEY. Collections begin at page 2. Future Log spans 2 pages so
// the kit always renders the same fixed page count regardless of variant.
const COLLECTION_DEFS: { id: CollectionId; label: string; pageCount: number }[] =
  [
    { id: "future", label: "Future Log", pageCount: 2 },
    { id: "monthly", label: "Monthly Log", pageCount: 1 },
    { id: "weekly", label: "Weekly / Daily Log", pageCount: 1 },
    { id: "trackers", label: "Trackers & Collections", pageCount: 1 },
  ];

function buildCollections(): Collection[] {
  let p = 2; // page 1 is the INDEX / KEY
  return COLLECTION_DEFS.map((def) => {
    const col: Collection = { ...def, startPage: p };
    p += def.pageCount;
    return col;
  });
}

const COLLECTIONS = buildCollections();
// totalPages = last collection's last page. Every doc.link target stays in
// [1, TOTAL_PAGES]: index rows → collection startPage (2..last), back-links → 1.
const TOTAL_PAGES =
  COLLECTIONS[COLLECTIONS.length - 1].startPage +
  COLLECTIONS[COLLECTIONS.length - 1].pageCount -
  1;

// The classic BuJo "key" / legend of rapid-logging signifiers.
const KEY_LEGEND: { sign: string; meaning: string }[] = [
  { sign: "•", meaning: "Task" },
  { sign: "✕", meaning: "Task complete" },
  { sign: ">", meaning: "Task migrated" },
  { sign: "<", meaning: "Task scheduled" },
  { sign: "○", meaning: "Event" },
  { sign: "—", meaning: "Note" },
  { sign: "★", meaning: "Priority" },
  { sign: "!", meaning: "Inspiration" },
];

// ── Shared dot-grid background ────────────────────────────────────────────────
// Mirrors the dot-grid template's approach: evenly spaced subtle dots within a
// rectangular region. BuJo pages are traditionally dot-grid.

function drawDotGrid(
  doc: jsPDF,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  spacingMm = 5,
) {
  const spacing = spacingMm * MM_TO_PT;
  const [r, g, b] = COLORS.dot;
  doc.setFillColor(r, g, b);
  for (let x = x0; x <= x1; x += spacing) {
    for (let y = y0; y <= y1; y += spacing) {
      doc.circle(x, y, 0.6, "F");
    }
  }
}

// ── Shared nav affordance: a tappable "‹ Index" back-link to page 1 ───────────

function drawBackToIndex(
  doc: jsPDF,
  w: number,
  m: ReturnType<typeof getMargins>,
) {
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  const [tr, tg, tb] = COLORS.textMedium;
  doc.setTextColor(tr, tg, tb);
  const text = "‹ Index";
  const tw = doc.getTextWidth(text);
  const x = w - m.right - tw;
  const y = m.top + 36;
  doc.text(text, x, y);
  // Tap target a touch taller than the glyphs for easy e-ink tapping.
  doc.link(x, y - 9, tw, 13, { pageNumber: 1 });
  const [br, bg, bb] = COLORS.black;
  doc.setTextColor(br, bg, bb);
}

// ── INDEX / KEY page (page 1) ─────────────────────────────────────────────────

function renderIndexPage(
  doc: jsPDF,
  variants: TemplateVariants,
  w: number,
  h: number,
  m: ReturnType<typeof getMargins>,
) {
  const bodyW = w - m.left - m.right;

  drawHeader(doc, variants, { title: "Bullet Journal", dark: true });

  // ── Key / Legend block ──────────────────────────────────────────────────
  let y = m.top + 52;
  drawSectionTitle(doc, "Key", m.left + 4, y);
  y += 16;

  const keyColW = bodyW / 2;
  const keyRowH = 17;
  const keyRows = Math.ceil(KEY_LEGEND.length / 2);
  KEY_LEGEND.forEach((k, i) => {
    const col = i < keyRows ? 0 : 1;
    const rowInCol = i % keyRows;
    const kx = m.left + 8 + col * keyColW;
    const ky = y + rowInCol * keyRowH;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    const [br, bg, bb] = COLORS.black;
    doc.setTextColor(br, bg, bb);
    doc.text(k.sign, kx, ky);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const [tr, tg, tb] = COLORS.textMedium;
    doc.setTextColor(tr, tg, tb);
    doc.text(k.meaning, kx + 16, ky);
  });
  y += keyRows * keyRowH + 10;

  // Divider
  const [lr, lg, lb] = COLORS.lineLight;
  doc.setDrawColor(lr, lg, lb);
  doc.setLineWidth(0.4);
  doc.line(m.left + 4, y, w - m.right - 4, y);
  y += 18;

  // ── Contents (hyperlinked) ───────────────────────────────────────────────
  drawSectionTitle(doc, "Contents", m.left + 4, y);
  y += 18;

  COLLECTIONS.forEach((c) => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const [br, bg, bb] = COLORS.black;
    doc.setTextColor(br, bg, bb);
    doc.text(c.label, m.left + 8, y);

    const pageStr =
      c.pageCount > 1
        ? `p. ${c.startPage}–${c.startPage + c.pageCount - 1}`
        : `p. ${c.startPage}`;
    doc.setFontSize(8);
    const [tr2, tg2, tb2] = COLORS.textMedium;
    doc.setTextColor(tr2, tg2, tb2);
    doc.text(pageStr, w - m.right - 8, y, { align: "right" });

    // Dot leader between label and page number.
    const nameW = doc.getTextWidth(c.label);
    doc.setFontSize(10);
    const pageW = doc.getTextWidth(pageStr);
    const leaderStart = m.left + 8 + nameW + 6;
    doc.setFontSize(6);
    const leaderEnd = w - m.right - 8 - pageW - 6;
    const [llr, llg, llb] = COLORS.lineLight;
    doc.setTextColor(llr, llg, llb);
    let dx = leaderStart;
    while (dx < leaderEnd) {
      doc.text(".", dx, y);
      dx += 4;
    }

    // Tappable row → collection start page. Target in [2, TOTAL_PAGES].
    const rowH = 16;
    doc.link(m.left, y - rowH + 4, bodyW, rowH, { pageNumber: c.startPage });

    // Underline the label.
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.setFontSize(10);
    doc.line(m.left + 8, y + 2, m.left + 8 + nameW, y + 2);

    y += 26;
  });

  y += 6;
  drawSectionTitle(doc, "Index", m.left + 4, y);
  y += 6;

  // Blank numbered index lines (the BuJo "running index" of your own pages).
  doc.setFontSize(8);
  const idxRowH = 16;
  let idxNum = 1;
  const idxBottom = h - m.bottom - 22;
  while (y + idxRowH <= idxBottom) {
    const ry = y + idxRowH;
    const [nr, ng, nb] = COLORS.textLight;
    doc.setTextColor(nr, ng, nb);
    doc.text(String(idxNum), m.left + 8, ry - 3);
    const [ir, ig, ib] = COLORS.lineLight;
    doc.setDrawColor(ir, ig, ib);
    doc.setLineWidth(0.3);
    doc.line(m.left + 26, ry, w - m.right - 4, ry);
    y += idxRowH;
    idxNum += 1;
  }

  // Hint line.
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  const [hr, hg, hb] = COLORS.textLight;
  doc.setTextColor(hr, hg, hb);
  doc.text(
    "Tap a collection to jump there. Tap ‹ Index on any page to return here.",
    m.left + 4,
    h - m.bottom - 8,
  );

  const [br2, bg2, bb2] = COLORS.black;
  doc.setTextColor(br2, bg2, bb2);

  drawPageNumber(doc, 1, TOTAL_PAGES, variants);
}

// ── Future Log (12-month overview, 6 months per page across 2 pages) ──────────

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function renderFutureLogPage(
  doc: jsPDF,
  variants: TemplateVariants,
  w: number,
  h: number,
  m: ReturnType<typeof getMargins>,
  col: Collection,
  pageNum: number,
  half: number, // 0 = Jan–Jun, 1 = Jul–Dec
) {
  const title = `${col.label} (${half === 0 ? "Jan–Jun" : "Jul–Dec"})`;
  drawHeader(doc, variants, { title, dark: true });
  drawBackToIndex(doc, w, m);

  const top = m.top + 52;
  const bottom = h - m.bottom - 8;
  const cellH = (bottom - top) / 6;

  const months = MONTHS.slice(half * 6, half * 6 + 6);
  const [lr, lg, lb] = COLORS.lineMedium;

  months.forEach((month, i) => {
    const cy = top + i * cellH;
    // Month label band.
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    const [tr, tg, tb] = COLORS.textMedium;
    doc.setTextColor(tr, tg, tb);
    doc.text(month.toUpperCase(), m.left + 4, cy + 12);

    // Separator under each month band.
    doc.setDrawColor(lr, lg, lb);
    doc.setLineWidth(0.4);
    doc.line(m.left, cy, w - m.right, cy);

    // Dot grid for the month's writing area (below the label).
    drawDotGrid(doc, m.left + 6, cy + 22, w - m.right - 6, cy + cellH - 6);
  });
  // Bottom border of the last cell.
  doc.setDrawColor(lr, lg, lb);
  doc.setLineWidth(0.4);
  doc.line(m.left, bottom, w - m.right, bottom);

  doc.setFont("helvetica", "normal");
  const [br, bg, bb] = COLORS.black;
  doc.setTextColor(br, bg, bb);

  drawPageNumber(doc, pageNum, TOTAL_PAGES, variants);
}

// ── Monthly Log (dates list down the side + a tasks/notes area) ───────────────

function renderMonthlyLogPage(
  doc: jsPDF,
  variants: TemplateVariants,
  w: number,
  h: number,
  m: ReturnType<typeof getMargins>,
  col: Collection,
) {
  drawHeader(doc, variants, { title: col.label, dark: true });
  drawBackToIndex(doc, w, m);

  const bodyW = w - m.left - m.right;
  const top = m.top + 52;
  const bottom = h - m.bottom - 8;

  // Left: numbered day list (1–31). Right: tasks / monthly area.
  const dateColW = bodyW * 0.42;
  const splitX = m.left + dateColW;

  // Section headers.
  drawSectionTitle(doc, "Calendar", m.left + 4, top);
  drawSectionTitle(doc, "Tasks", splitX + 8, top);

  const listTop = top + 10;
  const days = 31;
  const rowH = (bottom - listTop) / days;
  const [lr, lg, lb] = COLORS.lineLight;
  doc.setFontSize(8);

  for (let d = 1; d <= days; d++) {
    const ry = listTop + d * rowH;
    const [tr, tg, tb] = COLORS.textMedium;
    doc.setTextColor(tr, tg, tb);
    doc.text(String(d), m.left + 6, ry - 2);
    doc.setDrawColor(lr, lg, lb);
    doc.setLineWidth(0.3);
    doc.line(m.left + 22, ry, splitX - 6, ry);
  }

  // Vertical divider between calendar list and tasks.
  const [lm, lgm, lbm] = COLORS.lineMedium;
  doc.setDrawColor(lm, lgm, lbm);
  doc.setLineWidth(0.4);
  doc.line(splitX, top - 6, splitX, bottom);

  // Tasks area: dot grid for flexible monthly task logging.
  drawDotGrid(doc, splitX + 8, listTop + 6, w - m.right - 4, bottom - 2);

  const [br, bg, bb] = COLORS.black;
  doc.setTextColor(br, bg, bb);

  drawPageNumber(doc, col.startPage, TOTAL_PAGES, variants);
}

// ── Weekly / Daily Log (dot-grid spread, 7 day blocks) ────────────────────────

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function renderWeeklyLogPage(
  doc: jsPDF,
  variants: TemplateVariants,
  w: number,
  h: number,
  m: ReturnType<typeof getMargins>,
  col: Collection,
) {
  drawHeader(doc, variants, { title: col.label, dark: true });
  drawBackToIndex(doc, w, m);

  const bodyW = w - m.left - m.right;
  const top = m.top + 52;
  const bottom = h - m.bottom - 8;

  // Two columns of day blocks: 4 left, 3 right + a free notes block.
  const colW = bodyW / 2;
  const leftX = m.left;
  const rightX = m.left + colW;
  const blockH = (bottom - top) / 4;

  const [lr, lg, lb] = COLORS.lineLight;

  const drawDayBlock = (
    x: number,
    y: number,
    label: string,
    bw: number,
  ) => {
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    const [tr, tg, tb] = COLORS.textMedium;
    doc.setTextColor(tr, tg, tb);
    doc.text(label.toUpperCase(), x + 6, y + 11);
    doc.setDrawColor(lr, lg, lb);
    doc.setLineWidth(0.3);
    doc.line(x + 4, y + 15, x + bw - 6, y + 15);
    drawDotGrid(doc, x + 6, y + 24, x + bw - 6, y + blockH - 6);
  };

  // Left column: Mon–Thu
  for (let i = 0; i < 4; i++) {
    drawDayBlock(leftX, top + i * blockH, DAYS[i], colW - 6);
  }
  // Right column: Fri–Sun + Notes
  for (let i = 0; i < 3; i++) {
    drawDayBlock(rightX + 6, top + i * blockH, DAYS[4 + i], colW - 6);
  }
  drawDayBlock(rightX + 6, top + 3 * blockH, "Notes", colW - 6);

  // Vertical divider between columns.
  const [lm, lgm, lbm] = COLORS.lineMedium;
  doc.setDrawColor(lm, lgm, lbm);
  doc.setLineWidth(0.4);
  doc.line(rightX + 3, top, rightX + 3, bottom);

  doc.setFont("helvetica", "normal");
  const [br, bg, bb] = COLORS.black;
  doc.setTextColor(br, bg, bb);

  drawPageNumber(doc, col.startPage, TOTAL_PAGES, variants);
}

// ── Trackers & Collections (habit/mood grid + blank dot-grid area) ────────────

function renderTrackersPage(
  doc: jsPDF,
  variants: TemplateVariants,
  w: number,
  h: number,
  m: ReturnType<typeof getMargins>,
  col: Collection,
) {
  drawHeader(doc, variants, { title: col.label, dark: true });
  drawBackToIndex(doc, w, m);

  const bodyW = w - m.left - m.right;
  let y = m.top + 52;

  // ── Habit / mood tracker grid (habits down the side, 31 days across) ──────
  drawSectionTitle(doc, "Habit / Mood Tracker", m.left + 4, y);
  y += 12;

  const labelW = bodyW * 0.26;
  const gridX = m.left + labelW;
  const gridW = bodyW - labelW;
  const days = 31;
  const cellW = gridW / days;
  const habitRows = 8;
  const rowH = 14;
  const gridTop = y;

  const [lr, lg, lb] = COLORS.lineLight;
  const [lm, lgm, lbm] = COLORS.lineMedium;

  // Day numbers across the top.
  doc.setFontSize(5);
  const [tr, tg, tb] = COLORS.textMedium;
  doc.setTextColor(tr, tg, tb);
  for (let d = 0; d < days; d++) {
    if ((d + 1) % 5 === 0 || d === 0) {
      doc.text(String(d + 1), gridX + d * cellW + cellW / 2, gridTop - 2, {
        align: "center",
      });
    }
  }

  // Habit rows.
  for (let r = 0; r <= habitRows; r++) {
    const ry = gridTop + r * rowH;
    doc.setDrawColor(lr, lg, lb);
    doc.setLineWidth(0.3);
    doc.line(m.left, ry, m.left + bodyW, ry);
    if (r < habitRows) {
      // Habit label line.
      doc.setDrawColor(lr, lg, lb);
      doc.line(m.left + 4, ry + rowH - 3, gridX - 6, ry + rowH - 3);
    }
  }
  // Day column verticals.
  doc.setDrawColor(lr, lg, lb);
  doc.setLineWidth(0.2);
  for (let d = 0; d <= days; d++) {
    const cx = gridX + d * cellW;
    doc.line(cx, gridTop, cx, gridTop + habitRows * rowH);
  }
  // Outer border + label separator.
  doc.setDrawColor(lm, lgm, lbm);
  doc.setLineWidth(0.4);
  doc.rect(m.left, gridTop, bodyW, habitRows * rowH, "S");
  doc.line(gridX, gridTop, gridX, gridTop + habitRows * rowH);

  y = gridTop + habitRows * rowH + 18;

  // ── Blank dot-grid collection area ───────────────────────────────────────
  drawSectionTitle(doc, "Collection", m.left + 4, y);
  y += 8;
  const bottom = h - m.bottom - 8;
  drawDotGrid(doc, m.left + 6, y + 6, w - m.right - 6, bottom);

  const [br, bg, bb] = COLORS.black;
  doc.setTextColor(br, bg, bb);

  drawPageNumber(doc, col.startPage, TOTAL_PAGES, variants);
}

// ── Main generator ────────────────────────────────────────────────────────────

async function generateBulletJournal(variants: TemplateVariants) {
  const { w, h } = getPageDimensions(variants);
  const m = getMargins(variants);
  const doc = createDoc(variants);

  // Page 1: INDEX / KEY
  renderIndexPage(doc, variants, w, h, m);

  COLLECTIONS.forEach((col) => {
    switch (col.id) {
      case "future":
        for (let i = 0; i < col.pageCount; i++) {
          addPage(doc, variants);
          renderFutureLogPage(doc, variants, w, h, m, col, col.startPage + i, i);
        }
        break;
      case "monthly":
        addPage(doc, variants);
        renderMonthlyLogPage(doc, variants, w, h, m, col);
        break;
      case "weekly":
        addPage(doc, variants);
        renderWeeklyLogPage(doc, variants, w, h, m, col);
        break;
      case "trackers":
        addPage(doc, variants);
        renderTrackersPage(doc, variants, w, h, m, col);
        break;
    }
  });

  doc.save(`bullet-journal-${variantSuffix(variants)}.pdf`);
}

// ── Page component ─────────────────────────────────────────────────────────────

export default function BulletJournalPage() {
  return (
    <TemplateShell
      title="Bullet Journal"
      description="A printable, hyperlinked bullet-journal kit — tap the index to jump to any collection, and tap ‹ Index on any page to return. Includes a key/legend, future log, monthly log, weekly/daily log, and a trackers & collections page, all on a dot-grid."
      showPageCount={false}
      onGenerate={(v) => generateBulletJournal(v)}
      downloadLabel={() => `Generate & Download PDF (${TOTAL_PAGES} pages)`}
    >
      {() => (
        <div className="space-y-3 text-sm">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Collection set ({TOTAL_PAGES} pages)
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-1.5 bg-muted/20">
              <span className="text-xs font-medium">Index / Key</span>
              <span className="text-[10px] text-muted-foreground">p.1</span>
            </div>
            {COLLECTIONS.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-md border border-border px-3 py-1.5 bg-muted/20"
              >
                <span className="text-xs font-medium">{c.label}</span>
                <span className="text-[10px] text-muted-foreground">
                  p.{c.startPage}
                  {c.pageCount > 1 ? `–${c.startPage + c.pageCount - 1}` : ""}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            The index page carries the classic BuJo key and links to every
            collection, and each collection page has a tappable
            &lsquo;&lsquo;‹ Index&rsquo;&rsquo; link back to the top &mdash; so it
            navigates like an app on your tablet.
          </p>
        </div>
      )}
    </TemplateShell>
  );
}
