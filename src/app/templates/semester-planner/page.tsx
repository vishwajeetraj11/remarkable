"use client";

import { useEffect, useState } from "react";
import { getLocalMonthInputValue } from "@/lib/client-date";
import { TemplateShell } from "@/components/templates/template-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addPage,
  createDoc,
  drawBox,
  drawCheckbox,
  drawHeader,
  drawHorizontalLines,
  drawLabeledLine,
  drawPageNumber,
  drawSectionTitle,
  keepOnlyPage,
} from "@/lib/templates/pdf-utils";
import { COLORS } from "@/lib/templates/constants";
import {
  type TemplateVariants,
  getMargins,
  getPageDimensions,
  variantSuffix,
} from "@/lib/templates/variants";

const PAGE_LABELS = [
  "Index / semester overview",
  "Course dashboard",
  "Weekly timetable",
  "Assignment tracker",
  "Exam tracker",
  "Lecture notes 1",
  "Lecture notes 2",
] as const;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function monthLabel(value: string) {
  const [year, month] = value.split("-").map(Number);
  if (!year || !month) return "Semester start";
  return `${MONTHS[month - 1]} ${year}`;
}

function drawIndexLink(
  doc: ReturnType<typeof createDoc>,
  variants: TemplateVariants,
  includeLink = true,
) {
  const { w } = getPageDimensions(variants);
  const m = getMargins(variants);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(COLORS.textMedium[0], COLORS.textMedium[1], COLORS.textMedium[2]);
  const label = "Index";
  const labelW = doc.getTextWidth(label);
  doc.text(label, w - m.right - labelW, m.top + 40);
  if (includeLink) {
    doc.link(w - m.right - labelW, m.top + 32, labelW, 12, { pageNumber: 1 });
  }
  doc.setTextColor(COLORS.black[0], COLORS.black[1], COLORS.black[2]);
}

function drawTableGrid(
  doc: ReturnType<typeof createDoc>,
  x: number,
  y: number,
  widths: number[],
  rowH: number,
  rows: number,
) {
  const totalW = widths.reduce((sum, width) => sum + width, 0);
  doc.setDrawColor(COLORS.lineMedium[0], COLORS.lineMedium[1], COLORS.lineMedium[2]);
  doc.setLineWidth(0.4);
  doc.rect(x, y, totalW, rowH * rows, "S");
  let currentX = x;
  widths.slice(0, -1).forEach((width) => {
    currentX += width;
    doc.line(currentX, y, currentX, y + rowH * rows);
  });
  for (let row = 1; row < rows; row += 1) {
    doc.setDrawColor(COLORS.lineLight[0], COLORS.lineLight[1], COLORS.lineLight[2]);
    doc.line(x, y + row * rowH, x + totalW, y + row * rowH);
  }
}

function drawTableLabels(
  doc: ReturnType<typeof createDoc>,
  labels: string[],
  x: number,
  y: number,
  widths: number[],
  rowH: number,
) {
  let currentX = x;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(COLORS.textMedium[0], COLORS.textMedium[1], COLORS.textMedium[2]);
  labels.forEach((label, index) => {
    doc.text(label, currentX + 4, y + rowH / 2 + 2, {
      maxWidth: widths[index] - 8,
    });
    currentX += widths[index];
  });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(COLORS.black[0], COLORS.black[1], COLORS.black[2]);
}

function drawLecturePage(
  doc: ReturnType<typeof createDoc>,
  variants: TemplateVariants,
  page: number,
  total: number,
  title: string,
  includeLink: boolean,
) {
  const { w, h } = getPageDimensions(variants);
  const m = getMargins(variants);
  const bodyW = w - m.left - m.right;
  const footerBottom = h - m.bottom - 24;
  const compact = h < 450;
  drawHeader(doc, variants, { title, subtitle: "Semester notes" });
  drawIndexLink(doc, variants, includeLink);

  let y = m.top + 62;
  drawLabeledLine(doc, "Course / topic:", m.left + 4, y, m.left + bodyW * 0.58);
  drawLabeledLine(doc, "Date:", m.left + bodyW * 0.68, y, w - m.right - 4);
  y += 24;
  drawSectionTitle(doc, "Key concepts", m.left + 4, y);
  const keyConceptEnd = y + (compact ? 34 : 68);
  drawHorizontalLines(doc, variants, {
    startY: y + 4,
    endY: keyConceptEnd,
    spacing: compact ? 12 : 16,
  });
  y = keyConceptEnd + 18;
  drawSectionTitle(doc, "Lecture notes", m.left + 4, y);
  const availableAfterLectureHeading = footerBottom - y;
  const halfW = (bodyW - 12) / 2;
  const boxHeight = compact ? 40 : 90;
  const lectureNotesHeight = Math.max(
    compact ? 42 : 80,
    availableAfterLectureHeading - boxHeight - 12,
  );
  drawHorizontalLines(doc, variants, {
    startY: y + 4,
    endY: y + lectureNotesHeight,
    spacing: compact ? 12 : 16,
  });
  y += lectureNotesHeight + 12;
  const finalBoxHeight = Math.max(30, footerBottom - y);
  drawBox(doc, m.left, y, halfW, finalBoxHeight, { label: "Questions" });
  drawBox(doc, m.left + halfW + 12, y, halfW, finalBoxHeight, { label: "Next actions" });
  drawPageNumber(doc, page, total, variants);
}

async function generateSemesterPlanner(
  variants: TemplateVariants,
  semesterName: string,
  startMonth: string,
  sampleOnly = false,
) {
  const doc = createDoc(variants);
  const { w, h } = getPageDimensions(variants);
  const m = getMargins(variants);
  const bodyW = w - m.left - m.right;
  const footerBottom = h - m.bottom - 24;
  const compact = h < 450;
  const total = PAGE_LABELS.length;
  const title = semesterName.trim() || "Semester Planner";
  const startLabel = monthLabel(startMonth);

  drawHeader(doc, variants, { title, subtitle: startLabel, dark: true });
  let y = m.top + 56;
  drawSectionTitle(doc, "CONTENTS", m.left + 4, y);
  y += 20;
  PAGE_LABELS.forEach((label, index) => {
    const page = index + 1;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(COLORS.black[0], COLORS.black[1], COLORS.black[2]);
    doc.text(label, m.left + 10, y);
    doc.setFontSize(7);
    doc.setTextColor(COLORS.textMedium[0], COLORS.textMedium[1], COLORS.textMedium[2]);
    doc.text(`p. ${page}`, w - m.right - 10, y, { align: "right" });
    const labelW = doc.getTextWidth(label);
    doc.setDrawColor(COLORS.lineLight[0], COLORS.lineLight[1], COLORS.lineLight[2]);
    doc.setLineWidth(0.3);
    for (let dotX = m.left + 10 + labelW + 8; dotX < w - m.right - 40; dotX += 5) {
      doc.text(".", dotX, y);
    }
    if (!sampleOnly) {
      doc.link(m.left, y - 12, bodyW, 18, { pageNumber: page });
    }
    y += compact ? 16 : 28;
  });
  y += compact ? 6 : 12;
  const halfW = (bodyW - 12) / 2;
  const overviewBoxHeight = compact ? 25 : 90;
  drawBox(doc, m.left, y, halfW, overviewBoxHeight, { label: "Academic goals" });
  drawBox(doc, m.left + halfW + 12, y, halfW, overviewBoxHeight, { label: "Important dates" });
  y += overviewBoxHeight + (compact ? 6 : 14);
  const milestoneHeight = compact ? Math.max(24, footerBottom - y) : 82;
  drawBox(doc, m.left, y, bodyW, milestoneHeight, { label: "Semester milestones" });
  if (!compact) {
    y += milestoneHeight + 14;
    drawSectionTitle(doc, "Notes", m.left + 4, y);
    drawHorizontalLines(doc, variants, { startY: y + 4, endY: footerBottom, spacing: 18 });
  }
  drawPageNumber(doc, 1, total, variants);

  // Course dashboard.
  addPage(doc, variants);
  drawHeader(doc, variants, { title: "Course dashboard", subtitle: title });
  drawIndexLink(doc, variants, !sampleOnly);
  y = m.top + 62;
  const courseWidths = [bodyW * 0.15, bodyW * 0.3, bodyW * 0.2, bodyW * 0.15, bodyW * 0.2];
  const courseRowH = compact ? 24 : 32;
  const courseRows = compact ? 5 : 7;
  drawTableGrid(doc, m.left, y, courseWidths, courseRowH, courseRows);
  drawTableLabels(doc, ["Code", "Course", "Instructor", "Room", "Focus / grade"], m.left, y, courseWidths, courseRowH);
  y += courseRowH * courseRows + (compact ? 8 : 26);
  drawSectionTitle(doc, "Semester workload notes", m.left + 4, y);
  drawHorizontalLines(doc, variants, { startY: y + 4, endY: footerBottom, spacing: compact ? 12 : 18 });
  drawPageNumber(doc, 2, total, variants);

  // Weekly timetable.
  addPage(doc, variants);
  drawHeader(doc, variants, { title: "Weekly timetable", subtitle: title });
  drawIndexLink(doc, variants, !sampleOnly);
  y = m.top + 62;
  const days = variants.weekStart === "sunday"
    ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const timeW = bodyW * 0.16;
  const dayW = (bodyW - timeW) / 7;
  const rowH = Math.min(48, (footerBottom - y) / 8);
  const timetableWidths = [timeW, dayW, dayW, dayW, dayW, dayW, dayW, dayW];
  drawTableGrid(doc, m.left, y, timetableWidths, rowH, 8);
  drawTableLabels(doc, ["Time", ...days], m.left, y, timetableWidths, rowH);
  for (let row = 1; row < 8; row += 1) {
    doc.setFontSize(7);
    doc.setTextColor(COLORS.textMedium[0], COLORS.textMedium[1], COLORS.textMedium[2]);
    doc.text(`${8 + row - 1}:00`, m.left + 5, y + row * rowH + rowH / 2 + 2);
  }
  drawPageNumber(doc, 3, total, variants);

  // Assignment tracker.
  addPage(doc, variants);
  drawHeader(doc, variants, { title: "Assignment tracker", subtitle: title });
  drawIndexLink(doc, variants, !sampleOnly);
  y = m.top + 62;
  const assignmentWidths = [bodyW * 0.08, bodyW * 0.26, bodyW * 0.2, bodyW * 0.16, bodyW * 0.18, bodyW * 0.12];
  const assignmentRowH = compact ? 22 : 30;
  const assignmentRows = compact ? Math.max(5, Math.floor((footerBottom - y) / assignmentRowH)) : 11;
  drawTableGrid(doc, m.left, y, assignmentWidths, assignmentRowH, assignmentRows);
  drawTableLabels(doc, ["Done", "Assignment", "Course", "Due", "Status", "Grade"], m.left, y, assignmentWidths, assignmentRowH);
  for (let row = 1; row < assignmentRows; row += 1) {
    drawCheckbox(doc, m.left + 8, y + row * assignmentRowH + (assignmentRowH - 8) / 2, 8);
  }
  drawPageNumber(doc, 4, total, variants);

  // Exam tracker.
  addPage(doc, variants);
  drawHeader(doc, variants, { title: "Exam tracker", subtitle: title });
  drawIndexLink(doc, variants, !sampleOnly);
  y = m.top + 62;
  const examWidths = [bodyW * 0.22, bodyW * 0.2, bodyW * 0.18, bodyW * 0.2, bodyW * 0.2];
  const examRowH = compact ? 23 : 34;
  const examRows = compact ? Math.max(4, Math.floor((footerBottom - y) / examRowH)) : 9;
  drawTableGrid(doc, m.left, y, examWidths, examRowH, examRows);
  drawTableLabels(doc, ["Course", "Exam / format", "Date", "Study plan", "Result / notes"], m.left, y, examWidths, examRowH);
  for (let row = 1; row < examRows; row += 1) {
    drawCheckbox(doc, m.left + 8, y + row * examRowH + (examRowH - 8) / 2, 8);
  }
  drawPageNumber(doc, 5, total, variants);

  addPage(doc, variants);
  drawLecturePage(doc, variants, 6, total, "Lecture notes 1", !sampleOnly);
  addPage(doc, variants);
  drawLecturePage(doc, variants, 7, total, "Lecture notes 2", !sampleOnly);

  if (sampleOnly) keepOnlyPage(doc, 1);
  doc.save(`semester-planner-${variantSuffix(variants)}-${sampleOnly ? "sample" : "full"}.pdf`);
}

export default function SemesterPlannerPage() {
  const [semesterName, setSemesterName] = useState("");
  const [startMonth, setStartMonth] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setStartMonth((value) => value || getLocalMonthInputValue());
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <TemplateShell
      title="Semester Planner"
      description="A linked academic pack for semester overview, courses, timetable, assignments, exams, and lecture notes."
      showWeekStart
      showPageCount={false}
      onGenerate={(variants) => generateSemesterPlanner(variants, semesterName, startMonth)}
      onSampleGenerate={(variants) => generateSemesterPlanner(variants, semesterName, startMonth, true)}
      downloadLabel={() => "Generate & Download Full Semester Pack"}
      extraControls={() => (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="semester-name">Semester name</Label>
            <Input
              id="semester-name"
              value={semesterName}
              maxLength={50}
              placeholder="Fall 2026"
              onChange={(event) => setSemesterName(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="semester-start">Start month</Label>
            <Input
              id="semester-start"
              type="month"
              value={startMonth}
              onChange={(event) => setStartMonth(event.target.value)}
            />
          </div>
        </div>
      )}
    >
      {() => (
        <div className="space-y-1.5 text-xs text-muted-foreground">
          <div>Linked index plus six academic work pages</div>
          <div>Course, timetable, assignment, and exam tables</div>
          <div>Two lecture-note pages with questions and next actions</div>
        </div>
      )}
    </TemplateShell>
  );
}
