"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { thumbs, fallbackThumb } from "./thumbs";

type Template = { name: string; href: string; desc: string };
type Pack = {
  name: string;
  badge: string;
  description: string;
  templates: Template[];
};

function TemplateCard({ template, packBadge }: { template: Template; packBadge: string }) {
  const content = thumbs[template.href] ?? fallbackThumb;
  return (
    <Link href={template.href} className="group block">
      <div className="aspect-5/7 rounded-lg border border-border/80 bg-background p-4 overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:border-foreground/15 group-hover:shadow-sm">
        <svg viewBox="0 0 120 168" fill="none" className="w-full h-full text-foreground">
          {content}
        </svg>
      </div>
      <div className="mt-2.5 flex items-center gap-2">
        <p className="text-sm font-medium">{template.name}</p>
        <span className="text-[10px] text-muted-foreground/40 font-medium">{packBadge}</span>
      </div>
      <p className="text-xs text-muted-foreground/70">{template.desc}</p>
    </Link>
  );
}

export function TemplatesView({ packs }: { packs: Pack[] }) {
  const totalCount = packs.reduce((a, p) => a + p.templates.length, 0);

  return (
    <>
      <div className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
        <p className="mt-2 text-muted-foreground max-w-xl">
          {totalCount} customizable templates organized into {packs.length} packs.
          Every template supports multiple page sizes — with left/right-handed
          layouts, portrait and landscape orientations.
        </p>
      </div>

      {packs.map((pack) => (
        <section key={pack.name} className="mb-16">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-semibold tracking-tight">{pack.name}</h2>
            <Badge variant="secondary">{pack.badge}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-6">{pack.description}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-6">
            {pack.templates.map((t) => (
              <TemplateCard key={t.href} template={t} packBadge={pack.badge} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
