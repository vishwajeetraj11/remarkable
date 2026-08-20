import { TemplatesView } from "@/components/templates/templates-view";
import { Faq } from "@/components/shared/faq";
import { TEMPLATE_PACKS } from "@/lib/templates/catalog";

const faqs = [
  {
    question: "How many templates are there?",
    answer:
      "There are 65+ templates organized into 8 themed packs — plus a hyperlinked all-in-one planner — covering planning, meetings, focus, study, life admin, journaling, fitness, and life planning.",
  },
  {
    question: "Which devices do the templates work on?",
    answer:
      "Templates are optimized for the reMarkable 2 and Paper Pro, and also work on Supernote, BOOX, and Kindle Scribe. Choose A4 or US Letter to match your device.",
  },
  {
    question: "Can I print the templates on paper?",
    answer:
      "Yes. Each template is a PDF you can print at home on A4 or US Letter paper, or use directly on an e-ink tablet.",
  },
  {
    question: "Do I need an account to download a template?",
    answer:
      "No. Templates are generated in your browser and download instantly — no sign-up or login required.",
  },
  {
    question: "Are the templates free?",
    answer:
      "Yes. Every template is completely free to generate and download as a PDF.",
  },
];

export default function TemplatesPage() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <TemplatesView packs={TEMPLATE_PACKS} />
      </div>

      <div className="border-t border-border">
        <Faq items={faqs} />
      </div>
    </>
  );
}
