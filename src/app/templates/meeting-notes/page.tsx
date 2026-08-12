"use client";

import { TemplateShell } from "@/components/templates/template-shell";
import type { TemplateVariants } from "@/lib/templates/variants";

function downloadPdf(buffer: ArrayBuffer, filename: string) {
  const url = URL.createObjectURL(
    new Blob([buffer], { type: "application/pdf" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

function generateMeetingNotesPdf(
  variants: TemplateVariants,
  pageCount: number,
) {
  return new Promise<void>((resolve, reject) => {
    const worker = new Worker(
      new URL("./meeting-notes.worker.ts", import.meta.url),
      { type: "module" },
    );

    worker.addEventListener("message", (event) => {
      const data = event.data as
        | { buffer: ArrayBuffer; filename: string }
        | { error: string };
      worker.terminate();
      if ("error" in data) {
        reject(new Error(data.error));
        return;
      }
      downloadPdf(data.buffer, data.filename);
      resolve();
    });
    worker.addEventListener("error", (event) => {
      worker.terminate();
      reject(new Error(event.message || "Meeting Notes PDF generation failed"));
    });
    worker.postMessage({ variants, pageCount });
  });
}

export default function MeetingNotesPage() {
  async function generate(variants: TemplateVariants, pageCount: number) {
    await generateMeetingNotesPdf(variants, pageCount);
  }

  return (
    <TemplateShell
      title="Meeting Notes"
      description="Structured meeting page with attendees, agenda, discussion notes, and action items."
      onGenerate={generate}
      defaultPageCount={5}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>Date, time, attendees header</div>
          <div>Agenda section</div>
          <div>Discussion notes area</div>
          <div>Action items with checkboxes</div>
        </div>
      )}
    </TemplateShell>
  );
}
