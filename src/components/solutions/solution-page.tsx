"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  Download,
  FileText,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { VariantControls } from "@/components/templates/variant-controls";
import type { SolutionDefinition } from "@/lib/solutions";
import {
  addPage,
  createDoc,
  drawCheckbox,
  drawHeader,
  drawHorizontalLines,
  drawLabeledLine,
  drawPageNumber,
  drawSectionTitle,
} from "@/lib/templates/pdf-utils";
import { COLORS } from "@/lib/templates/constants";
import {
  DEFAULT_VARIANTS,
  getMargins,
  getPageDimensions,
  type TemplateVariants,
  variantSuffix,
} from "@/lib/templates/variants";

const accentClasses: Record<SolutionDefinition["accent"], string> = {
  clay: "bg-orange-100 text-orange-950 dark:bg-orange-950/50 dark:text-orange-100",
  moss: "bg-emerald-100 text-emerald-950 dark:bg-emerald-950/50 dark:text-emerald-100",
  ink: "bg-sky-100 text-sky-950 dark:bg-sky-950/50 dark:text-sky-100",
  ochre: "bg-amber-100 text-amber-950 dark:bg-amber-950/50 dark:text-amber-100",
  slate: "bg-slate-200 text-slate-950 dark:bg-slate-800 dark:text-slate-100",
  plum: "bg-fuchsia-100 text-fuchsia-950 dark:bg-fuchsia-950/50 dark:text-fuchsia-100",
};

function cleanText(value: string, fallback: string) {
  return value.trim() || fallback;
}

function drawIndexPage(
  solution: SolutionDefinition,
  variants: TemplateVariants,
  copies: number,
  requestFields: RequestFields,
) {
  const doc = createDoc(variants);
  const { w, h } = getPageDimensions(variants);
  const m = getMargins(variants);
  const total = 1 + solution.sections.length * copies;

  drawHeader(doc, variants, { title: solution.shortTitle, dark: true });
  let y = m.top + 55;

  if (solution.requestForm) {
    drawLabeledLine(doc, "Workflow:", m.left + 4, y, w - m.right - 4);
    const workflow = cleanText(requestFields.workflow, "Custom workflow");
    doc.setFontSize(8);
    doc.text(workflow.slice(0, 70), m.left + 62, y - 1);
    y += 22;
    drawLabeledLine(doc, "Audience:", m.left + 4, y, w - m.right - 4);
    doc.text(cleanText(requestFields.audience, "Planner user").slice(0, 70), m.left + 62, y - 1);
    y += 28;
  }

  drawSectionTitle(doc, solution.requestForm ? "Requested page map" : "Contents", m.left + 4, y);
  y += 22;

  solution.sections.forEach((section, index) => {
    const targetPage = 2 + index * copies;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(`${String(index + 1).padStart(2, "0")}  ${section}`, m.left + 8, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.textMedium);
    doc.text(`p. ${targetPage}`, w - m.right - 8, y, { align: "right" });
    doc.setTextColor(...COLORS.black);
    doc.link(m.left, y - 14, w - m.left - m.right, 19, { pageNumber: targetPage });
    doc.setDrawColor(...COLORS.lineLight);
    doc.line(m.left + 8, y + 8, w - m.right - 8, y + 8);
    y += 34;
  });

  doc.setFontSize(7);
  doc.setTextColor(...COLORS.textMedium);
  const hint = solution.requestForm
    ? cleanText(requestFields.requiredSections, "Add any extra fields or navigation notes before sending this brief.")
    : "Tap a section to jump to it. Duplicate or rearrange pages on your tablet as the workflow evolves.";
  const lines = doc.splitTextToSize(hint, w - m.left - m.right - 8);
  doc.text(lines, m.left + 4, Math.min(y + 12, h - m.bottom - 32));
  doc.setTextColor(...COLORS.black);
  drawPageNumber(doc, 1, total, variants);

  return { doc, w, h, m, total };
}

function drawWorkingPage(
  doc: ReturnType<typeof createDoc>,
  solution: SolutionDefinition,
  variants: TemplateVariants,
  section: string,
  page: number,
  total: number,
  requestFields: RequestFields,
) {
  const { w, h } = getPageDimensions(variants);
  const m = getMargins(variants);
  drawHeader(doc, variants, { title: section, subtitle: solution.shortTitle, dark: true });
  let y = m.top + 53;

  const labels = solution.requestForm
    ? ["Requirement", "Priority", "Example / reference"]
    : ["Date", "Owner", "Status"];
  const colW = (w - m.left - m.right - 16) / labels.length;
  labels.forEach((label, index) => {
    const start = m.left + 4 + index * (colW + 8);
    drawLabeledLine(doc, `${label}:`, start, y, start + colW);
  });

  y += 32;
  drawSectionTitle(doc, solution.requestForm ? "What this page must do" : "Context / objective", m.left + 4, y);
  drawHorizontalLines(doc, variants, { startY: y + 4, endY: y + 80, spacing: 18 });

  y += 104;
  drawSectionTitle(doc, solution.requestForm ? "Fields and layout" : "Working notes", m.left + 4, y);
  drawHorizontalLines(doc, variants, {
    startY: y + 4,
    endY: h - m.bottom - 150,
    spacing: 18,
  });

  y = h - m.bottom - 126;
  drawSectionTitle(doc, solution.requestForm ? "Acceptance checklist" : "Next actions", m.left + 4, y);
  y += 14;
  for (let row = 0; row < 4; row++) {
    drawCheckbox(doc, m.left + 6, y + row * 20, 7);
    doc.setDrawColor(...COLORS.lineLight);
    doc.line(m.left + 19, y + row * 20 + 7, w - m.right - 4, y + row * 20 + 7);
  }

  if (solution.requestForm && page === 2 && requestFields.requiredSections.trim()) {
    doc.setFontSize(6.5);
    doc.setTextColor(...COLORS.textMedium);
    const brief = doc.splitTextToSize(requestFields.requiredSections.trim(), w - m.left - m.right - 24);
    doc.text(brief.slice(0, 3), m.left + 20, h - m.bottom - 50);
    doc.setTextColor(...COLORS.black);
  }

  drawPageNumber(doc, page, total, variants);
  doc.setFontSize(6.5);
  doc.setTextColor(...COLORS.textMedium);
  const indexText = "‹ Index";
  const indexW = doc.getTextWidth(indexText);
  doc.text(indexText, w - m.right - indexW, h - 10);
  doc.link(w - m.right - indexW, h - 19, indexW, 12, { pageNumber: 1 });
  doc.setTextColor(...COLORS.black);
}

function drawRepeatablePage(
  doc: ReturnType<typeof createDoc>,
  solution: SolutionDefinition,
  variants: TemplateVariants,
  page: number,
  total: number,
) {
  const { w, h } = getPageDimensions(variants);
  const m = getMargins(variants);
  drawHeader(doc, variants, { title: solution.shortTitle, dark: true });
  let y = m.top + 50;
  const bodyW = w - m.left - m.right;

  drawLabeledLine(doc, "Customer:", m.left + 4, y, m.left + bodyW * 0.58);
  drawLabeledLine(doc, "Date:", m.left + bodyW * 0.62, y, w - m.right - 4);
  y += 19;
  drawLabeledLine(doc, "Contact:", m.left + 4, y, m.left + bodyW * 0.58);
  drawLabeledLine(doc, "Representative:", m.left + bodyW * 0.62, y, w - m.right - 4);
  y += 27;

  const available = h - m.bottom - y - 24;
  const sectionHeight = available / solution.sections.length;
  solution.sections.forEach((section, index) => {
    drawSectionTitle(doc, section, m.left + 4, y);
    const contentTop = y + 10;
    const contentBottom = Math.min(y + sectionHeight - 8, h - m.bottom - 18);
    if (index >= solution.sections.length - 2) {
      let rowY = contentTop + 3;
      while (rowY + 15 < contentBottom) {
        drawCheckbox(doc, m.left + 7, rowY, 6);
        doc.setDrawColor(...COLORS.lineLight);
        doc.line(m.left + 18, rowY + 6, w - m.right - 4, rowY + 6);
        rowY += 18;
      }
    } else {
      drawHorizontalLines(doc, variants, {
        startY: contentTop,
        endY: contentBottom,
        spacing: 16,
      });
    }
    y += sectionHeight;
  });

  drawPageNumber(doc, page, total, variants);
}

type RequestFields = {
  workflow: string;
  audience: string;
  requiredSections: string;
};

const EMPTY_REQUEST: RequestFields = {
  workflow: "",
  audience: "",
  requiredSections: "",
};

function PdfPreview({
  solution,
  orientation,
  requestFields,
}: {
  solution: SolutionDefinition;
  orientation: TemplateVariants["orientation"];
  requestFields: RequestFields;
}) {
  const isLandscape = orientation === "landscape";
  const previewSections = solution.requestForm && requestFields.requiredSections.trim()
    ? requestFields.requiredSections.split(/[,\n]/).map((item) => item.trim()).filter(Boolean).slice(0, 6)
    : solution.sections;

  return (
    <div
      className={`relative mx-auto overflow-hidden border border-stone-300 bg-[#fbfaf4] text-stone-950 shadow-[0_28px_80px_-36px_rgba(28,25,23,0.45)] dark:border-stone-600 dark:bg-[#ede9df] ${
        isLandscape ? "aspect-[7/5] w-full max-w-3xl" : "aspect-[5/7] w-full max-w-md"
      }`}
    >
      <div className="flex h-full flex-col p-[7%]">
        <div className="flex items-end justify-between border-b-2 border-stone-900 pb-[3%]">
          <div>
            <p className="text-[clamp(7px,1.2vw,12px)] font-semibold uppercase tracking-[0.18em] text-stone-500">
              {solution.eyebrow}
            </p>
            <p className="mt-1 text-[clamp(16px,3vw,30px)] font-semibold tracking-tight">
              {solution.shortTitle}
            </p>
          </div>
          <span className="text-[clamp(7px,1.1vw,11px)] text-stone-500">01 / 07</span>
        </div>

        <div className={`grid flex-1 gap-[3%] pt-[5%] ${isLandscape ? "grid-cols-2" : "grid-cols-1"}`}>
          {previewSections.slice(0, isLandscape ? 6 : 5).map((section, index) => (
            <div key={section} className="min-h-0 border-t border-stone-300 pt-[2%]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[clamp(8px,1.35vw,13px)] font-semibold">{section}</span>
                <span className="text-[clamp(7px,1vw,10px)] tabular-nums text-stone-400">0{index + 1}</span>
              </div>
              <div className="mt-[3%] space-y-[5%]">
                {[0, 1, 2].map((line) => (
                  <div key={line} className="h-px bg-stone-300" />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-stone-300 pt-[3%] text-[clamp(7px,1vw,10px)] text-stone-500">
          <span>remarkable.vishwajeet.co</span>
          <span>Tap sections · Write by hand · Export as PDF</span>
        </div>
      </div>
    </div>
  );
}

export function SolutionPage({ solution }: { solution: SolutionDefinition }) {
  const [variants, setVariants] = useState<TemplateVariants>({ ...DEFAULT_VARIANTS });
  const [copies, setCopies] = useState(1);
  const [requestFields, setRequestFields] = useState<RequestFields>(EMPTY_REQUEST);
  const totalPages = useMemo(
    () => solution.repeatablePage ? copies : 1 + solution.sections.length * copies,
    [copies, solution.repeatablePage, solution.sections.length],
  );

  function generatePdf(sample: boolean) {
    if (sample) {
      const doc = createDoc(variants);
      const { w, h } = getPageDimensions(variants);
      const m = getMargins(variants);
      drawHeader(doc, variants, { title: `${solution.shortTitle} — Sample`, dark: true });
      let y = m.top + 52;
      solution.sections.slice(0, 6).forEach((section, index) => {
        drawSectionTitle(doc, `${index + 1}. ${section}`, m.left + 4, y);
        y += 13;
        doc.setDrawColor(...COLORS.lineLight);
        const bottom = Math.min(y + 42, h - m.bottom - 24);
        doc.rect(m.left + 4, y, w - m.left - m.right - 8, bottom - y);
        y = bottom + 18;
      });
      drawPageNumber(doc, 1, 1, variants);
      doc.save(`${solution.fileName}-free-sample-${variantSuffix(variants)}.pdf`);
      return;
    }

    if (solution.repeatablePage) {
      const doc = createDoc(variants);
      for (let page = 1; page <= copies; page++) {
        if (page > 1) addPage(doc, variants);
        drawRepeatablePage(doc, solution, variants, page, copies);
      }
      doc.save(`${solution.fileName}-${variantSuffix(variants)}-${copies}p.pdf`);
      return;
    }

    const { doc, total } = drawIndexPage(solution, variants, copies, requestFields);
    let page = 1;
    solution.sections.forEach((section) => {
      for (let copy = 0; copy < copies; copy++) {
        addPage(doc, variants);
        page += 1;
        drawWorkingPage(doc, solution, variants, section, page, total, requestFields);
      }
    });
    doc.save(`${solution.fileName}-${variantSuffix(variants)}-${totalPages}p.pdf`);
  }

  function openRequestEmail() {
    const subject = encodeURIComponent(`Custom planner request: ${cleanText(requestFields.workflow, "New workflow")}`);
    const body = encodeURIComponent(
      [
        `Workflow: ${cleanText(requestFields.workflow, "Not specified")}`,
        `Who it is for: ${cleanText(requestFields.audience, "Not specified")}`,
        `Required sections / fields: ${cleanText(requestFields.requiredSections, "Not specified")}`,
        `Device: ${variants.device}`,
        `Orientation: ${variants.orientation}`,
        "",
        "I have also downloaded the generated planner brief PDF.",
      ].join("\n"),
    );
    window.location.href = `mailto:vishwajeetraj11@gmail.com?subject=${subject}&body=${body}`;
  }

  return (
    <main>
      <section className="mx-auto grid max-w-6xl gap-12 px-4 pb-16 pt-10 lg:grid-cols-[minmax(0,0.88fr)_minmax(420px,1.12fr)] lg:items-center lg:pb-24 lg:pt-16">
        <div>
          <span className={`inline-flex px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] ${accentClasses[solution.accent]}`}>
            {solution.eyebrow}
          </span>
          <h1 className="mt-7 text-4xl font-semibold leading-[0.98] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
            {solution.title}
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground">
            {solution.description}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3 text-sm">
            <a href="#generator" className="inline-flex h-11 items-center gap-2 bg-foreground px-5 font-medium text-background transition-opacity hover:opacity-85">
              Build the PDF <ArrowRight className="size-4" />
            </a>
            <button
              type="button"
              onClick={() => generatePdf(true)}
              className="inline-flex h-11 items-center gap-2 border border-border px-5 font-medium transition-colors hover:bg-muted"
            >
              <Download className="size-4" /> Free sample
            </button>
          </div>
          <p className="mt-5 text-sm text-muted-foreground">{solution.promise}</p>
        </div>

        <div className="relative lg:pl-8">
          <div className="absolute -left-3 top-1/3 hidden h-px w-16 bg-border lg:block" />
          <PdfPreview solution={solution} orientation={variants.orientation} requestFields={requestFields} />
        </div>
      </section>

      <section id="generator" className="border-y border-border bg-muted/25 scroll-mt-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-[0.75fr_1.25fr] lg:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Generator</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">Configure the working file</h2>
            <p className="mt-4 max-w-md leading-7 text-muted-foreground">
              The PDF is generated in your browser. Nothing is uploaded, and no account is required.
            </p>
            <div className="mt-8 border-l border-border pl-5 text-sm text-muted-foreground">
              <p>{totalPages} pages</p>
              <p className="mt-1">
                {solution.repeatablePage
                  ? `${copies} complete visit ${copies === 1 ? "form" : "forms"}`
                  : `1 tappable index + ${solution.sections.length * copies} working pages`}
              </p>
            </div>
          </div>

          <div className="space-y-7 border border-border bg-background p-5 sm:p-7">
            <VariantControls variants={variants} onChange={setVariants} />

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <Label>{solution.repeatablePage ? "Number of visit pages" : "Copies of each working page"}</Label>
                <span className="text-sm font-semibold tabular-nums">{copies}</span>
              </div>
              <Slider
                min={1}
                max={4}
                value={[copies]}
                onValueChange={(value) => setCopies(Array.isArray(value) ? value[0] : value)}
              />
              <div className="flex justify-between text-xs text-muted-foreground"><span>1</span><span>4</span></div>
            </div>

            {solution.requestForm && (
              <div className="grid gap-5 border-t border-border pt-7">
                <div className="space-y-2">
                  <Label htmlFor="request-workflow">What should the planner help you do?</Label>
                  <Input
                    id="request-workflow"
                    placeholder="Example: Track site inspections across five locations"
                    value={requestFields.workflow}
                    onChange={(event) => setRequestFields({ ...requestFields, workflow: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="request-audience">Who will use it?</Label>
                  <Input
                    id="request-audience"
                    placeholder="Example: Field engineers using a Paper Pro"
                    value={requestFields.audience}
                    onChange={(event) => setRequestFields({ ...requestFields, audience: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="request-sections">Required sections or fields</Label>
                  <textarea
                    id="request-sections"
                    className="min-h-28 w-full border border-input bg-transparent px-3 py-2 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    placeholder="List the information each page must capture"
                    value={requestFields.requiredSections}
                    onChange={(event) => setRequestFields({ ...requestFields, requiredSections: event.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-border pt-7 sm:flex-row">
              <Button size="lg" className="h-11 px-5" onClick={() => generatePdf(false)}>
                <FileText data-icon="inline-start" /> Generate {totalPages}-page PDF
              </Button>
              <Button size="lg" variant="outline" className="h-11 px-5" onClick={() => generatePdf(true)}>
                <Download data-icon="inline-start" /> Download 1-page sample
              </Button>
              {solution.requestForm && (
                <Button size="lg" variant="ghost" className="h-11 px-5" onClick={openRequestEmail}>
                  <Mail data-icon="inline-start" /> Open request email
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-14 px-4 py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Who it is for</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">A focused tool for a repeated job</h2>
          <ul className="mt-8 space-y-5">
            {solution.whoFor.map((item) => (
              <li key={item} className="flex gap-4 border-t border-border pt-5 leading-7">
                <Check className="mt-1 size-4 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Inside the PDF</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">Six sections, one clear sequence</h2>
          <ol className="mt-8 border-y border-border">
            {solution.sections.map((section, index) => (
              <li key={section} className="grid grid-cols-[3rem_1fr] border-b border-border py-4 last:border-b-0">
                <span className="text-sm tabular-nums text-muted-foreground">0{index + 1}</span>
                <span className="font-medium">{section}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-y border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 lg:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Short usage guide</p>
          <div className="mt-8 grid gap-px bg-border md:grid-cols-3">
            {solution.guide.map((step, index) => (
              <article key={step.title} className="bg-background p-7 sm:p-9">
                <span className="text-sm tabular-nums text-muted-foreground">0{index + 1}</span>
                <h3 className="mt-10 text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 leading-7 text-muted-foreground">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 lg:py-24">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Related templates</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">Extend the workflow</h2>
          </div>
          <Link href="/templates" className="text-sm font-medium underline underline-offset-4">Browse all templates</Link>
        </div>
        <div className="mt-9 border-y border-border">
          {solution.related.map((template) => (
            <Link key={template.href} href={template.href} className="group grid gap-3 border-b border-border py-6 last:border-b-0 sm:grid-cols-[0.75fr_1.25fr_auto] sm:items-center">
              <h3 className="font-semibold group-hover:underline group-hover:underline-offset-4">{template.title}</h3>
              <p className="text-sm leading-6 text-muted-foreground">{template.description}</p>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
