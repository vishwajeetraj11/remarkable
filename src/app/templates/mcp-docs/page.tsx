"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";
import { VariantControls } from "@/components/templates/variant-controls";
import { Button } from "@/components/ui/button";
import {
  type TemplateVariants,
  DEFAULT_VARIANTS,
  getPageDimensions,
  getMargins,
  variantSuffix,
} from "@/lib/templates/variants";
import { COLORS } from "@/lib/templates/constants";

// ─── Doc catalog ─────────────────────────────────────────────────────────────

const SECTIONS = [
  {
    group: "Getting Started",
    items: [
      {
        id: "intro",
        title: "Introduction",
        url: "https://modelcontextprotocol.io/docs/getting-started/intro.md",
      },
      {
        id: "architecture",
        title: "Architecture Overview",
        url: "https://modelcontextprotocol.io/docs/learn/architecture.md",
      },
    ],
  },
  {
    group: "Concepts",
    items: [
      {
        id: "client-concepts",
        title: "Client Concepts",
        url: "https://modelcontextprotocol.io/docs/learn/client-concepts.md",
      },
      {
        id: "server-concepts",
        title: "Server Concepts",
        url: "https://modelcontextprotocol.io/docs/learn/server-concepts.md",
      },
    ],
  },
  {
    group: "Building",
    items: [
      {
        id: "build-server",
        title: "Build an MCP Server",
        url: "https://modelcontextprotocol.io/docs/develop/build-server.md",
      },
      {
        id: "build-client",
        title: "Build an MCP Client",
        url: "https://modelcontextprotocol.io/docs/develop/build-client.md",
      },
      {
        id: "connect-local",
        title: "Connect Local Servers",
        url: "https://modelcontextprotocol.io/docs/develop/connect-local-servers.md",
      },
      {
        id: "connect-remote",
        title: "Connect Remote Servers",
        url: "https://modelcontextprotocol.io/docs/develop/connect-remote-servers.md",
      },
    ],
  },
  {
    group: "Tools & Security",
    items: [
      {
        id: "debugging",
        title: "Debugging",
        url: "https://modelcontextprotocol.io/docs/tools/debugging.md",
      },
      {
        id: "inspector",
        title: "MCP Inspector",
        url: "https://modelcontextprotocol.io/docs/tools/inspector.md",
      },
      {
        id: "security",
        title: "Security Best Practices",
        url: "https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices.md",
      },
    ],
  },
] as const;

type SectionItem = (typeof SECTIONS)[number]["items"][number];

// ─── Markdown preprocessing ───────────────────────────────────────────────────

function cleanMarkdown(raw: string): string {
  let s = raw;
  s = s.replace(/^---[\s\S]*?---\n?/, "");
  s = s.replace(/```mermaid[\s\S]*?```/gm, "");
  s = s.replace(/^```(\w+)[^\n]*$/gm, "```");
  s = s.replace(
    /<\/?(?:Note|Warning|Info|Tip|Frame|Steps|Step|CodeGroup|Tabs|Tab|Card|CardGroup|AccordionGroup|Accordion|ResponseField|Expandable|ParamField|Tooltip)[^>]*>/g,
    ""
  );
  s = s.replace(/<img[^>]*>/g, "");
  s = s.replace(/<[^>]+>/g, "");
  s = s.replace(/\n{3,}/g, "\n\n");
  return s.trim();
}

// ─── Block types & parser ─────────────────────────────────────────────────────

type Block =
  | { t: "h1"; text: string }
  | { t: "h2"; text: string }
  | { t: "h3"; text: string }
  | { t: "para"; text: string }
  | { t: "bullet"; text: string; depth: number }
  | { t: "code"; lines: string[] }
  | { t: "rule" }
  | { t: "blank" };

function stripInline(s: string): string {
  s = s.replace(/!\[[^\]]*\]\([^)]+\)/g, "");
  s = s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  s = s.replace(/\*\*([^*]+)\*\*/g, "$1");
  s = s.replace(/\*([^*\n]+)\*/g, "$1");
  s = s.replace(/`([^`]+)`/g, "$1");
  s = s.replace(/~~([^~]+)~~/g, "$1");
  s = s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"');
  return s.trim();
}

function parseBlocks(md: string): Block[] {
  const lines = md.split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code fence
    if (line.trim() === "```") {
      i++;
      const codeLines: string[] = [];
      while (i < lines.length && lines[i].trim() !== "```") {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      if (codeLines.length > 0) blocks.push({ t: "code", lines: codeLines });
      continue;
    }

    // Headings (h4+ treated as h3)
    const h1m = line.match(/^#\s+(.*)/);
    if (h1m) { blocks.push({ t: "h1", text: stripInline(h1m[1]) }); i++; continue; }
    const h2m = line.match(/^##\s+(.*)/);
    if (h2m) { blocks.push({ t: "h2", text: stripInline(h2m[1]) }); i++; continue; }
    const h3m = line.match(/^#{3,}\s+(.*)/);
    if (h3m) { blocks.push({ t: "h3", text: stripInline(h3m[1]) }); i++; continue; }

    // Horizontal rule
    if (/^[-*]{3,}$/.test(line.trim())) {
      blocks.push({ t: "rule" }); i++; continue;
    }

    // Bullet / numbered list
    const bulletM = line.match(/^(\s*)[-*]\s+(.*)/);
    if (bulletM) {
      blocks.push({ t: "bullet", text: stripInline(bulletM[2]), depth: Math.floor(bulletM[1].length / 2) });
      i++;
      continue;
    }
    const numM = line.match(/^(\s*)\d+\.\s+(.*)/);
    if (numM) {
      blocks.push({ t: "bullet", text: stripInline(numM[2]), depth: Math.floor(numM[1].length / 2) });
      i++;
      continue;
    }

    // Blank
    if (line.trim() === "") {
      const last = blocks[blocks.length - 1];
      if (!last || last.t !== "blank") blocks.push({ t: "blank" });
      i++;
      continue;
    }

    // Paragraph — merge continuation lines
    let para = stripInline(line);
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].match(/^#{1,}\s/) &&
      !lines[i].match(/^\s*[-*]\s/) &&
      !lines[i].match(/^\s*\d+\.\s/) &&
      lines[i].trim() !== "```" &&
      !/^[-*]{3,}$/.test(lines[i].trim())
    ) {
      para += " " + stripInline(lines[i]);
      i++;
    }
    if (para) blocks.push({ t: "para", text: para });
  }

  return blocks;
}

// ─── PDF builder ─────────────────────────────────────────────────────────────

function buildPDF(
  variants: TemplateVariants,
  sections: Array<{ title: string; content: string }>
): jsPDF {
  const { w, h } = getPageDimensions(variants);
  const m = getMargins(variants);
  const bodyW = w - m.left - m.right;
  const doc = new jsPDF({ unit: "pt", format: [w, h] });

  const contentTop = m.top + 20;
  const contentBottom = h - m.bottom - 14;

  let y = contentTop;
  let sectionLabel = "";

  // ── page utilities ──

  function currentPageNum() {
    return doc.getCurrentPageInfo().pageNumber;
  }

  function newPage(label?: string) {
    doc.addPage([w, h]);
    y = contentTop;
    if (label !== undefined) sectionLabel = label;
    drawRunningHeader();
  }

  function ensureSpace(needed: number) {
    if (y + needed > contentBottom) newPage();
  }

  function drawRunningHeader() {
    const [r, g, b] = COLORS.textLight;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(r, g, b);
    doc.text("MCP Documentation", m.left, m.top + 10);
    if (sectionLabel) {
      doc.text(sectionLabel, w - m.right, m.top + 10, { align: "right" });
    }
    const [lr, lg, lb] = COLORS.lineLight;
    doc.setDrawColor(lr, lg, lb);
    doc.setLineWidth(0.3);
    doc.line(m.left, m.top + 14, w - m.right, m.top + 14);
    const [br, bg, bb] = COLORS.black;
    doc.setTextColor(br, bg, bb);
  }

  // ── block renderer ──

  function renderBlock(block: Block) {
    switch (block.t) {
      case "h1": {
        ensureSpace(28);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        const [r, g, b] = COLORS.textDark;
        doc.setTextColor(r, g, b);
        const wrapped = doc.splitTextToSize(block.text, bodyW - 4);
        for (const l of wrapped) { doc.text(l, m.left, y); y += 16; }
        const [lr, lg, lb] = COLORS.lineMedium;
        doc.setDrawColor(lr, lg, lb);
        doc.setLineWidth(0.5);
        doc.line(m.left, y, w - m.right, y);
        y += 10;
        doc.setFont("helvetica", "normal");
        const [br, bg, bb] = COLORS.black;
        doc.setTextColor(br, bg, bb);
        break;
      }
      case "h2": {
        ensureSpace(20);
        y += 5;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        const [r, g, b] = COLORS.textDark;
        doc.setTextColor(r, g, b);
        const wrapped = doc.splitTextToSize(block.text, bodyW - 4);
        for (const l of wrapped) { doc.text(l, m.left, y); y += 12; }
        y += 3;
        doc.setFont("helvetica", "normal");
        const [br, bg, bb] = COLORS.black;
        doc.setTextColor(br, bg, bb);
        break;
      }
      case "h3": {
        ensureSpace(16);
        y += 3;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        const [r, g, b] = COLORS.textDark;
        doc.setTextColor(r, g, b);
        const wrapped = doc.splitTextToSize(block.text, bodyW - 4);
        for (const l of wrapped) { doc.text(l, m.left, y); y += 10; }
        y += 2;
        doc.setFont("helvetica", "normal");
        const [br, bg, bb] = COLORS.black;
        doc.setTextColor(br, bg, bb);
        break;
      }
      case "para": {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        const [r, g, b] = COLORS.textDark;
        doc.setTextColor(r, g, b);
        const wrapped = doc.splitTextToSize(block.text, bodyW - 4);
        for (const l of wrapped) {
          ensureSpace(11);
          doc.text(l, m.left, y);
          y += 11;
        }
        const [br, bg, bb] = COLORS.black;
        doc.setTextColor(br, bg, bb);
        break;
      }
      case "bullet": {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        const [r, g, b] = COLORS.textDark;
        doc.setTextColor(r, g, b);
        const dotX = m.left + 6 + block.depth * 10;
        const textX = dotX + 7;
        const availW = w - m.right - textX - 4;
        const wrapped = doc.splitTextToSize(block.text, availW);
        ensureSpace(wrapped.length * 11 + 2);
        const [dr, dg, db] = COLORS.textMedium;
        doc.setFillColor(dr, dg, db);
        doc.circle(dotX, y - 2.5, 1.2, "F");
        for (const l of wrapped) { doc.text(l, textX, y); y += 11; }
        y += 1;
        const [br, bg, bb] = COLORS.black;
        doc.setTextColor(br, bg, bb);
        break;
      }
      case "code": {
        const lineH = 8.5;
        const padding = 5;
        // Cap at 55 lines so a single block never exceeds a page
        const visibleLines = block.lines.slice(0, 55);
        const truncated = block.lines.length > 55;
        const blockH = visibleLines.length * lineH + padding * 2 + (truncated ? 10 : 0);

        // If block is taller than the whole content area, start fresh page anyway
        if (y + blockH > contentBottom && y > contentTop + 5) newPage();

        const [fr, fg, fb] = [245, 245, 245] as [number, number, number];
        doc.setFillColor(fr, fg, fb);
        doc.rect(m.left, y - padding + 2, bodyW, blockH, "F");
        const [lr, lg, lb] = COLORS.lineLight;
        doc.setDrawColor(lr, lg, lb);
        doc.setLineWidth(0.3);
        doc.rect(m.left, y - padding + 2, bodyW, blockH, "S");

        doc.setFont("courier", "normal");
        doc.setFontSize(6.5);
        doc.setTextColor(50, 50, 50);

        let cy = y + 4;
        for (const codeLine of visibleLines) {
          const safe = codeLine.length > 90 ? codeLine.slice(0, 87) + "…" : codeLine;
          doc.text(safe, m.left + 5, cy);
          cy += lineH;
        }
        if (truncated) {
          doc.setFontSize(6);
          const [tr, tg, tb] = COLORS.textLight;
          doc.setTextColor(tr, tg, tb);
          doc.text(`… ${block.lines.length - 55} more lines`, m.left + 5, cy);
        }
        y += blockH + 6;
        doc.setFont("helvetica", "normal");
        const [br, bg, bb] = COLORS.black;
        doc.setTextColor(br, bg, bb);
        break;
      }
      case "rule": {
        ensureSpace(10);
        const [lr, lg, lb] = COLORS.lineLight;
        doc.setDrawColor(lr, lg, lb);
        doc.setLineWidth(0.3);
        doc.line(m.left, y, w - m.right, y);
        y += 8;
        break;
      }
      case "blank": {
        y += 5;
        break;
      }
    }
  }

  // ── Cover page ──

  const [hbr, hbg, hbb] = COLORS.headerBgDark;
  doc.setFillColor(hbr, hbg, hbb);
  doc.rect(0, 0, w, h * 0.38, "F");

  const [wr, wg, wb] = COLORS.white;
  doc.setTextColor(wr, wg, wb);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.text("Model Context Protocol", m.left, h * 0.2);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.text("Complete Documentation", m.left, h * 0.2 + 22);

  const [tlr, tlg, tlb] = COLORS.textLight;
  doc.setTextColor(tlr, tlg, tlb);
  doc.setFontSize(7.5);
  doc.text("modelcontextprotocol.io", m.left, h * 0.2 + 38);

  const [tmr, tmg, tmb] = COLORS.textMedium;
  doc.setTextColor(tmr, tmg, tmb);
  doc.setFontSize(8);
  const generated = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  doc.text(`Generated ${generated}`, m.left, h * 0.48);
  doc.text(`${sections.length} chapters`, m.left, h * 0.48 + 13);

  const [br, bg, bb] = COLORS.black;
  doc.setTextColor(br, bg, bb);

  // ── TOC placeholder (page 2) ──

  doc.addPage([w, h]);
  const TOC_PAGE = 2;

  // ── Section pages ──

  const tocEntries: Array<{ title: string; pageNum: number }> = [];

  for (const section of sections) {
    newPage(section.title);
    tocEntries.push({ title: section.title, pageNum: currentPageNum() });

    // Section title as H1
    renderBlock({ t: "h1", text: section.title });

    const blocks = parseBlocks(cleanMarkdown(section.content));
    for (const block of blocks) renderBlock(block);
  }

  // ── Add page numbers to all content pages ──

  const totalPages = doc.getNumberOfPages();
  const [pnr, png, pnb] = COLORS.textLight;
  for (let p = 2; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(pnr, png, pnb);
    doc.text(String(p - 1), w / 2, h - m.bottom + 10, { align: "center" });
  }
  const [brr, bgg, bbb] = COLORS.black;
  doc.setTextColor(brr, bgg, bbb);

  // ── Render TOC on page 2 ──

  doc.setPage(TOC_PAGE);
  y = contentTop;
  sectionLabel = "Table of Contents";
  drawRunningHeader();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  const [tdr, tdg, tdb] = COLORS.textDark;
  doc.setTextColor(tdr, tdg, tdb);
  doc.text("Table of Contents", m.left, y);
  y += 12;
  const [lmr, lmg, lmb] = COLORS.lineMedium;
  doc.setDrawColor(lmr, lmg, lmb);
  doc.setLineWidth(0.5);
  doc.line(m.left, y, w - m.right, y);
  y += 16;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  const [bkr, bkg, bkb] = COLORS.black;
  doc.setTextColor(bkr, bkg, bkb);

  for (const entry of tocEntries) {
    if (y > contentBottom) break; // overflow protection
    const pageStr = String(entry.pageNum - 1);
    const pageStrW = doc.getTextWidth(pageStr);
    const maxTitleW = bodyW - pageStrW - 14;
    const title = doc.splitTextToSize(entry.title, maxTitleW)[0];

    doc.text(title, m.left, y);

    // Dot leader
    const titleEndX = m.left + doc.getTextWidth(title) + 4;
    const pageX = w - m.right - pageStrW - 2;
    const [dlr, dlg, dlb] = COLORS.lineLight;
    doc.setDrawColor(dlr, dlg, dlb);
    doc.setLineWidth(0.3);
    doc.setLineDashPattern([0.5, 2.5], 0);
    doc.line(titleEndX, y - 2, pageX - 3, y - 2);
    doc.setLineDashPattern([], 0);

    const [tdr2, tdg2, tdb2] = COLORS.textDark;
    doc.setTextColor(tdr2, tdg2, tdb2);
    doc.text(pageStr, w - m.right, y, { align: "right" });

    y += 15;
  }

  // Page number on TOC page
  doc.setFontSize(7);
  const [pnr2, png2, pnb2] = COLORS.textLight;
  doc.setTextColor(pnr2, png2, pnb2);
  doc.text("1", w / 2, h - m.bottom + 10, { align: "center" });

  return doc;
}

// ─── Page component ───────────────────────────────────────────────────────────

export default function McpDocsPage() {
  const [variants, setVariants] = useState<TemplateVariants>(DEFAULT_VARIANTS);
  const [selected, setSelected] = useState<Set<string>>(() => {
    const all = new Set<string>();
    for (const sec of SECTIONS) for (const item of sec.items) all.add(item.id);
    return all;
  });
  const [status, setStatus] = useState("");
  const [generating, setGenerating] = useState(false);

  function toggleItem(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleGroup(items: readonly SectionItem[]) {
    const ids = items.map((i) => i.id);
    const allOn = ids.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOn) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  }

  async function generate() {
    const toFetch = SECTIONS.flatMap((g) => g.items.filter((item) => selected.has(item.id)));
    if (toFetch.length === 0) {
      setStatus("Select at least one section.");
      return;
    }

    setGenerating(true);
    setStatus(`Fetching 0 / ${toFetch.length} pages…`);

    try {
      const fetched: Array<{ title: string; content: string }> = [];

      for (let idx = 0; idx < toFetch.length; idx++) {
        const item = toFetch[idx];
        setStatus(`Fetching ${idx + 1} / ${toFetch.length}: ${item.title}…`);
        const res = await fetch(`/api/fetch-md?url=${encodeURIComponent(item.url)}`);
        if (!res.ok) throw new Error(`Failed to fetch "${item.title}"`);
        const data = (await res.json()) as { content: string };
        fetched.push({ title: item.title, content: data.content });
      }

      setStatus("Rendering PDF…");
      await new Promise((r) => setTimeout(r, 10)); // let UI update
      const doc = buildPDF(variants, fetched);
      doc.save(`mcp-docs-${variantSuffix(variants)}.pdf`);
      setStatus(`Done — ${toFetch.length} chapters downloaded.`);
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setGenerating(false);
    }
  }

  const selectedCount = selected.size;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">MCP Documentation PDF</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Fetch the Model Context Protocol documentation and export a reMarkable-optimized PDF
          for offline reading. Content is fetched live from modelcontextprotocol.io.
        </p>
      </div>

      <div className="space-y-6 mb-8 p-5 border border-border rounded-xl bg-muted/20">
        <VariantControls variants={variants} onChange={setVariants} showWeekStart={false} />

        <div>
          <p className="text-sm font-medium mb-3">Chapters to include</p>
          <div className="space-y-5">
            {SECTIONS.map((sec) => {
              const allOn = sec.items.every((i) => selected.has(i.id));
              const someOn = sec.items.some((i) => selected.has(i.id));
              return (
                <div key={sec.group}>
                  <label className="flex items-center gap-2 text-sm font-medium mb-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5"
                      checked={allOn}
                      ref={(el) => {
                        if (el) el.indeterminate = someOn && !allOn;
                      }}
                      onChange={() => toggleGroup(sec.items)}
                    />
                    {sec.group}
                  </label>
                  <div className="ml-5 space-y-1.5">
                    {sec.items.map((item) => (
                      <label
                        key={item.id}
                        className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          className="h-3.5 w-3.5"
                          checked={selected.has(item.id)}
                          onChange={() => toggleItem(item.id)}
                        />
                        {item.title}
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button onClick={generate} disabled={generating || selectedCount === 0} size="lg">
          {generating ? "Generating…" : `Download PDF  (${selectedCount} chapter${selectedCount !== 1 ? "s" : ""})`}
        </Button>
        {status && (
          <span className="text-sm text-muted-foreground">{status}</span>
        )}
      </div>

      <p className="text-xs text-muted-foreground mt-6">
        Includes a cover page, table of contents, and all selected chapters. Code blocks,
        headings, and bullet points are rendered. Diagrams and images are omitted.
      </p>
    </div>
  );
}
