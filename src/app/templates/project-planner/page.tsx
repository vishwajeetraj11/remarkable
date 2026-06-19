"use client";

import { useState } from "react";
import { TemplateShell } from "@/components/templates/template-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { jsPDF } from "jspdf";
import {
  createDoc,
  addPage,
  drawHeader,
  drawPageNumber,
  drawSectionTitle,
  drawHorizontalLines,
  drawLabeledLine,
  drawCheckbox,
} from "@/lib/templates/pdf-utils";
import { COLORS } from "@/lib/templates/constants";
import {
  type TemplateVariants,
  getPageDimensions,
  getMargins,
  variantSuffix,
} from "@/lib/templates/variants";

// ── Section model ────────────────────────────────────────────────────────────
// A fixed set of project sections. Page 1 is always the hyperlinked INDEX; each
// section starts at a known page computed below. The page count is fixed by the
// section set (Notes spans 2 pages), so showPageCount is disabled and the
// template relies on its own index/back-links for navigation.

type SectionId =
  | "overview"
  | "goals"
  | "milestones"
  | "tasks"
  | "risks"
  | "notes";

interface Section {
  id: SectionId;
  label: string;
  /** 1-based page where this section begins. */
  startPage: number;
  /** Number of pages this section occupies. */
  pageCount: number;
}

// Page 1 = INDEX. Sections begin at page 2. Notes spans 2 pages so the planner
// always renders the same fixed page count regardless of variant/orientation.
const SECTION_DEFS: { id: SectionId; label: string; pageCount: number }[] = [
  { id: "overview", label: "Overview & Brief", pageCount: 1 },
  { id: "goals", label: "Goals & Success Criteria", pageCount: 1 },
  { id: "milestones", label: "Milestones & Timeline", pageCount: 1 },
  { id: "tasks", label: "Task List / Backlog", pageCount: 1 },
  { id: "risks", label: "Risks & Issues", pageCount: 1 },
  { id: "notes", label: "Notes", pageCount: 2 },
];

function buildSections(): Section[] {
  let p = 2; // page 1 is the INDEX
  return SECTION_DEFS.map((def) => {
    const sec: Section = { ...def, startPage: p };
    p += def.pageCount;
    return sec;
  });
}

const SECTIONS = buildSections();
// totalPages = last section's last page. Every doc.link target stays in
// [1, TOTAL_PAGES]: index rows → section startPage (2..last), back-links → 1.
const TOTAL_PAGES =
  SECTIONS[SECTIONS.length - 1].startPage +
  SECTIONS[SECTIONS.length - 1].pageCount -
  1;

// ── Shared nav affordance: a tappable "‹ Index" back-link to page 1 ──────────

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

// ── INDEX page (page 1) ──────────────────────────────────────────────────────

function renderIndexPage(
  doc: jsPDF,
  variants: TemplateVariants,
  w: number,
  h: number,
  m: ReturnType<typeof getMargins>,
  projectName: string,
) {
  const bodyW = w - m.left - m.right;

  drawHeader(doc, variants, { title: "Project Planner", dark: true });

  // Project title area under the header.
  let y = m.top + 48;
  drawLabeledLine(doc, "Project:", m.left + 4, y, w - m.right - 4);
  if (projectName) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    const [br, bg, bb] = COLORS.black;
    doc.setTextColor(br, bg, bb);
    const labelW = doc.getTextWidth("Project:") + 8;
    doc.text(projectName, m.left + 4 + labelW + 8, y - 1);
    doc.setFont("helvetica", "normal");
  }

  y += 28;
  drawSectionTitle(doc, "Contents", m.left + 4, y);
  y += 18;

  SECTIONS.forEach((s) => {
    // Section label
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const [br, bg, bb] = COLORS.black;
    doc.setTextColor(br, bg, bb);
    doc.text(s.label, m.left + 8, y);

    // Page number (right aligned)
    const pageStr =
      s.pageCount > 1
        ? `p. ${s.startPage}–${s.startPage + s.pageCount - 1}`
        : `p. ${s.startPage}`;
    doc.setFontSize(8);
    const [tr2, tg2, tb2] = COLORS.textMedium;
    doc.setTextColor(tr2, tg2, tb2);
    doc.text(pageStr, w - m.right - 8, y, { align: "right" });

    // Dot leader between label and page number
    const nameW = doc.getTextWidth(s.label);
    const pageW = doc.getTextWidth(pageStr);
    doc.setFontSize(10);
    const leaderStart = m.left + 8 + nameW + 6;
    doc.setFontSize(6);
    const leaderEnd = w - m.right - 8 - pageW - 6;
    const [lr, lg, lb] = COLORS.lineLight;
    doc.setTextColor(lr, lg, lb);
    let dx = leaderStart;
    while (dx < leaderEnd) {
      doc.text(".", dx, y);
      dx += 4;
    }

    // Tappable row → section start page. Target in [2, TOTAL_PAGES].
    const rowH = 16;
    doc.link(m.left, y - rowH + 4, bodyW, rowH, { pageNumber: s.startPage });

    // Underline the label
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.setFontSize(10);
    doc.line(m.left + 8, y + 2, m.left + 8 + nameW, y + 2);

    y += 30;
  });

  // Hint line
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  const [hr, hg, hb] = COLORS.textLight;
  doc.setTextColor(hr, hg, hb);
  doc.text(
    "Tap a section to jump there. Tap ‹ Index on any page to return here.",
    m.left + 4,
    h - m.bottom - 8,
  );

  const [br2, bg2, bb2] = COLORS.black;
  doc.setTextColor(br2, bg2, bb2);

  drawPageNumber(doc, 1, TOTAL_PAGES, variants);
}

// ── Section: Overview & Brief ────────────────────────────────────────────────

function renderOverviewPage(
  doc: jsPDF,
  variants: TemplateVariants,
  w: number,
  h: number,
  m: ReturnType<typeof getMargins>,
  sec: Section,
) {
  drawHeader(doc, variants, { title: sec.label, dark: true });
  drawBackToIndex(doc, w, m);

  const bodyW = w - m.left - m.right;
  let y = m.top + 52;

  drawLabeledLine(doc, "Owner:", m.left + 4, y, m.left + bodyW * 0.45);
  drawLabeledLine(doc, "Start:", m.left + bodyW * 0.5, y, w - m.right - 4);
  y += 18;
  drawLabeledLine(doc, "Status:", m.left + 4, y, m.left + bodyW * 0.45);
  drawLabeledLine(doc, "Target:", m.left + bodyW * 0.5, y, w - m.right - 4);

  y += 26;
  drawSectionTitle(doc, "Objective", m.left + 4, y);
  drawHorizontalLines(doc, variants, { startY: y + 2, endY: y + 54, spacing: 18 });

  y += 68;
  drawSectionTitle(doc, "Scope & Deliverables", m.left + 4, y);
  drawHorizontalLines(doc, variants, { startY: y + 2, endY: y + 90, spacing: 18 });

  y += 104;
  drawSectionTitle(doc, "Stakeholders", m.left + 4, y);
  drawHorizontalLines(doc, variants, {
    startY: y + 2,
    endY: h - m.bottom - 8,
    spacing: 18,
  });

  drawPageNumber(doc, sec.startPage, TOTAL_PAGES, variants);
}

// ── Section: Goals & Success Criteria ────────────────────────────────────────

function renderGoalsPage(
  doc: jsPDF,
  variants: TemplateVariants,
  w: number,
  h: number,
  m: ReturnType<typeof getMargins>,
  sec: Section,
) {
  drawHeader(doc, variants, { title: sec.label, dark: true });
  drawBackToIndex(doc, w, m);

  let y = m.top + 52;
  drawSectionTitle(doc, "Goals", m.left + 4, y);
  drawHorizontalLines(doc, variants, { startY: y + 2, endY: y + 110, spacing: 22 });

  y += 124;
  drawSectionTitle(doc, "Success Criteria / Definition of Done", m.left + 4, y);
  drawHorizontalLines(doc, variants, {
    startY: y + 2,
    endY: h - m.bottom - 8,
    spacing: 22,
  });

  drawPageNumber(doc, sec.startPage, TOTAL_PAGES, variants);
}

// ── Section: Milestones & Timeline (dated table) ─────────────────────────────

function renderMilestonesPage(
  doc: jsPDF,
  variants: TemplateVariants,
  w: number,
  h: number,
  m: ReturnType<typeof getMargins>,
  sec: Section,
) {
  drawHeader(doc, variants, { title: sec.label, dark: true });
  drawBackToIndex(doc, w, m);

  const bodyW = w - m.left - m.right;
  const top = m.top + 52;
  const bottom = h - m.bottom - 8;

  // Columns: Done | Milestone | Owner | Due
  const doneW = 28;
  const dueW = 70;
  const ownerW = 90;
  const milestoneW = bodyW - doneW - dueW - ownerW;

  const colX = [
    m.left,
    m.left + doneW,
    m.left + doneW + milestoneW,
    m.left + doneW + milestoneW + ownerW,
  ];
  const headers = ["✓", "Milestone", "Owner", "Due"];

  // Header row
  const headerY = top;
  const [hr, hg, hb] = COLORS.headerBg;
  doc.setFillColor(hr, hg, hb);
  doc.rect(m.left, headerY, bodyW, 16, "F");
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  const [tr, tg, tb] = COLORS.textMedium;
  doc.setTextColor(tr, tg, tb);
  headers.forEach((hd, i) => {
    const align = i === 0 ? "center" : "left";
    const tx = i === 0 ? colX[i] + doneW / 2 : colX[i] + 4;
    doc.text(hd, tx, headerY + 11, { align: align as "left" | "center" });
  });

  // Rows
  const rowH = 24;
  const rowsTop = headerY + 16;
  const rowCount = Math.floor((bottom - rowsTop) / rowH);

  const [lr, lg, lb] = COLORS.lineLight;
  for (let r = 0; r < rowCount; r++) {
    const ry = rowsTop + r * rowH;
    doc.setDrawColor(lr, lg, lb);
    doc.setLineWidth(0.3);
    doc.line(m.left, ry + rowH, w - m.right, ry + rowH);
    // Checkbox in done column
    drawCheckbox(doc, colX[0] + (doneW - 9) / 2, ry + (rowH - 9) / 2, 9);
  }

  // Vertical separators + outer border
  const [lm, lgm, lbm] = COLORS.lineMedium;
  doc.setDrawColor(lm, lgm, lbm);
  doc.setLineWidth(0.4);
  const gridBottom = rowsTop + rowCount * rowH;
  [colX[1], colX[2], colX[3]].forEach((cx) => {
    doc.line(cx, headerY, cx, gridBottom);
  });
  doc.rect(m.left, headerY, bodyW, gridBottom - headerY, "S");

  doc.setFont("helvetica", "normal");
  const [br, bg, bb] = COLORS.black;
  doc.setTextColor(br, bg, bb);

  drawPageNumber(doc, sec.startPage, TOTAL_PAGES, variants);
}

// ── Section: Task List / Backlog (checklist) ─────────────────────────────────

function renderTasksPage(
  doc: jsPDF,
  variants: TemplateVariants,
  w: number,
  h: number,
  m: ReturnType<typeof getMargins>,
  sec: Section,
) {
  drawHeader(doc, variants, { title: sec.label, dark: true });
  drawBackToIndex(doc, w, m);

  const top = m.top + 52;
  const bottom = h - m.bottom - 8;
  const rowH = 22;
  const rowCount = Math.floor((bottom - top) / rowH);

  const [lr, lg, lb] = COLORS.lineLight;
  for (let r = 0; r < rowCount; r++) {
    const ry = top + r * rowH;
    drawCheckbox(doc, m.left + 4, ry + 4, 9);
    doc.setDrawColor(lr, lg, lb);
    doc.setLineWidth(0.3);
    doc.line(m.left + 22, ry + rowH - 4, w - m.right - 4, ry + rowH - 4);
  }

  drawPageNumber(doc, sec.startPage, TOTAL_PAGES, variants);
}

// ── Section: Risks & Issues (table) ──────────────────────────────────────────

function renderRisksPage(
  doc: jsPDF,
  variants: TemplateVariants,
  w: number,
  h: number,
  m: ReturnType<typeof getMargins>,
  sec: Section,
) {
  drawHeader(doc, variants, { title: sec.label, dark: true });
  drawBackToIndex(doc, w, m);

  const bodyW = w - m.left - m.right;
  const top = m.top + 52;
  const bottom = h - m.bottom - 8;

  // Columns: Risk / Issue | Impact | Mitigation / Action
  const impactW = 70;
  const riskW = bodyW * 0.42;
  const colX = [m.left, m.left + riskW, m.left + riskW + impactW];
  const headers = ["Risk / Issue", "Impact", "Mitigation / Action"];

  const headerY = top;
  const [hr, hg, hb] = COLORS.headerBg;
  doc.setFillColor(hr, hg, hb);
  doc.rect(m.left, headerY, bodyW, 16, "F");
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  const [tr, tg, tb] = COLORS.textMedium;
  doc.setTextColor(tr, tg, tb);
  headers.forEach((hd, i) => doc.text(hd, colX[i] + 4, headerY + 11));

  const rowH = 28;
  const rowsTop = headerY + 16;
  const rowCount = Math.floor((bottom - rowsTop) / rowH);

  const [lr, lg, lb] = COLORS.lineLight;
  for (let r = 0; r < rowCount; r++) {
    const ry = rowsTop + r * rowH;
    doc.setDrawColor(lr, lg, lb);
    doc.setLineWidth(0.3);
    doc.line(m.left, ry + rowH, w - m.right, ry + rowH);
  }

  const [lm, lgm, lbm] = COLORS.lineMedium;
  doc.setDrawColor(lm, lgm, lbm);
  doc.setLineWidth(0.4);
  const gridBottom = rowsTop + rowCount * rowH;
  [colX[1], colX[2]].forEach((cx) => doc.line(cx, headerY, cx, gridBottom));
  doc.rect(m.left, headerY, bodyW, gridBottom - headerY, "S");

  doc.setFont("helvetica", "normal");
  const [br, bg, bb] = COLORS.black;
  doc.setTextColor(br, bg, bb);

  drawPageNumber(doc, sec.startPage, TOTAL_PAGES, variants);
}

// ── Section: Notes (ruled lines, may span multiple pages) ────────────────────

function renderNotesPage(
  doc: jsPDF,
  variants: TemplateVariants,
  w: number,
  h: number,
  m: ReturnType<typeof getMargins>,
  sec: Section,
  pageNum: number,
  noteIdx: number,
) {
  const title = sec.pageCount > 1 ? `${sec.label} (${noteIdx + 1})` : sec.label;
  drawHeader(doc, variants, { title, dark: true });
  drawBackToIndex(doc, w, m);

  drawHorizontalLines(doc, variants, {
    startY: m.top + 50,
    endY: h - m.bottom - 8,
    spacing: 20,
  });

  drawPageNumber(doc, pageNum, TOTAL_PAGES, variants);
}

// ── Main generator ───────────────────────────────────────────────────────────

async function generatePlanner(
  variants: TemplateVariants,
  projectName: string,
) {
  const { w, h } = getPageDimensions(variants);
  const m = getMargins(variants);
  const doc = createDoc(variants);

  // Page 1: INDEX
  renderIndexPage(doc, variants, w, h, m, projectName.trim());

  // Section pages (each section begins at sec.startPage)
  SECTIONS.forEach((sec) => {
    switch (sec.id) {
      case "overview":
        addPage(doc, variants);
        renderOverviewPage(doc, variants, w, h, m, sec);
        break;
      case "goals":
        addPage(doc, variants);
        renderGoalsPage(doc, variants, w, h, m, sec);
        break;
      case "milestones":
        addPage(doc, variants);
        renderMilestonesPage(doc, variants, w, h, m, sec);
        break;
      case "tasks":
        addPage(doc, variants);
        renderTasksPage(doc, variants, w, h, m, sec);
        break;
      case "risks":
        addPage(doc, variants);
        renderRisksPage(doc, variants, w, h, m, sec);
        break;
      case "notes":
        for (let i = 0; i < sec.pageCount; i++) {
          addPage(doc, variants);
          renderNotesPage(doc, variants, w, h, m, sec, sec.startPage + i, i);
        }
        break;
    }
  });

  doc.save(`project-planner-${variantSuffix(variants)}.pdf`);
}

// ── Page component ───────────────────────────────────────────────────────────

export default function ProjectPlannerPage() {
  const [projectName, setProjectName] = useState("");

  async function generate(variants: TemplateVariants) {
    await generatePlanner(variants, projectName);
  }

  return (
    <TemplateShell
      title="Project Planner"
      description="A printable, hyperlinked project planner — tap the index to jump to any section, and tap ‹ Index on any page to return. Includes overview, goals, milestones, tasks, risks, and notes."
      showPageCount={false}
      onGenerate={(v) => generate(v)}
      downloadLabel={() => `Generate & Download PDF (${TOTAL_PAGES} pages)`}
      extraControls={() => (
        <div className="space-y-1.5">
          <Label htmlFor="projectName">Project name on contents page (optional)</Label>
          <Input
            id="projectName"
            type="text"
            placeholder="e.g. Website Redesign"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full"
            maxLength={60}
          />
        </div>
      )}
    >
      {() => (
        <div className="space-y-3 text-sm">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Planner structure ({TOTAL_PAGES} pages)
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-1.5 bg-muted/20">
              <span className="text-xs font-medium">Index / Contents</span>
              <span className="text-[10px] text-muted-foreground">p.1</span>
            </div>
            {SECTIONS.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-md border border-border px-3 py-1.5 bg-muted/20"
              >
                <span className="text-xs font-medium">{s.label}</span>
                <span className="text-[10px] text-muted-foreground">
                  p.{s.startPage}
                  {s.pageCount > 1 ? `–${s.startPage + s.pageCount - 1}` : ""}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            The contents page links to every section, and each section page has a
            tappable &lsquo;&lsquo;‹ Index&rsquo;&rsquo; link back to the
            top &mdash; so it navigates like an app on your tablet.
          </p>
        </div>
      )}
    </TemplateShell>
  );
}
