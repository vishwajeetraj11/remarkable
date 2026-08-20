"use client";

import Link from "next/link";
import { captureEvent, captureTemplateDiscovery } from "@/lib/analytics";
import type { TemplateCatalogItem } from "@/lib/templates/catalog";
import { fallbackThumb, thumbs } from "./thumbs";

export interface TemplateDiscoveryProps {
  templates: readonly TemplateCatalogItem[];
  sourcePage: string;
  placement: string;
  packBadge?: string;
  searchQuery?: string;
  className?: string;
}

/**
 * Reusable visual catalog for template links. The placement is explicit so
 * homepage, guide, and post-download recommendations can share the component
 * while keeping discovery analytics attributable to the surface that led the
 * visitor to a template.
 */
export function TemplateDiscovery({
  templates,
  sourcePage,
  placement,
  packBadge,
  searchQuery,
  className,
}: TemplateDiscoveryProps) {
  return (
    <div
      className={
        className ??
        "grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6"
      }
    >
      {templates.map((template) => {
        const content = thumbs[template.href] ?? fallbackThumb;
        return (
          <Link
            key={template.href}
            href={template.href}
            className="group block"
            onClick={() => {
              captureTemplateDiscovery({
                templateSlug: template.href,
                templateName: template.name,
                sourcePage,
                placement,
              });
              if (searchQuery) {
                captureEvent("template_search_result_opened", {
                  search_query: searchQuery.trim().toLowerCase(),
                  template_slug: template.href,
                  template_name: template.name,
                  source_page: sourcePage,
                });
              }
            }}
          >
            <div className="aspect-5/7 overflow-hidden rounded-lg border border-border/80 bg-background p-4 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-foreground/15 group-hover:shadow-sm">
              <svg
                viewBox="0 0 120 168"
                fill="none"
                className="h-full w-full text-foreground"
                aria-hidden="true"
              >
                {content}
              </svg>
            </div>
            <div className="mt-2.5 flex items-center gap-2">
              <p className="text-sm font-medium">{template.name}</p>
              {packBadge && (
                <span className="text-[10px] font-medium text-muted-foreground/40">
                  {packBadge}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground/70">{template.desc}</p>
          </Link>
        );
      })}
    </div>
  );
}
