"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { captureEvent, captureTemplateSearch } from "@/lib/analytics";
import { TemplateRequestForm } from "./template-request-form";
import { thumbs, fallbackThumb } from "./thumbs";

type Template = { name: string; href: string; desc: string };
type Pack = {
  name: string;
  badge: string;
  description: string;
  templates: Template[];
};

function TemplateCard({
  template,
  packBadge,
  searchQuery,
}: {
  template: Template;
  packBadge: string;
  searchQuery?: string;
}) {
  const content = thumbs[template.href] ?? fallbackThumb;
  return (
    <Link
      href={template.href}
      className="group block"
      onClick={() => {
        if (!searchQuery) return;
        captureEvent("template_search_result_opened", {
          search_query: searchQuery.trim().toLowerCase(),
          template_slug: template.href,
          template_name: template.name,
          source_page: "/templates",
        });
      }}
    >
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
  const [query, setQuery] = useState("");
  const lastTrackedSearch = useRef("");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredPacks = useMemo(() => {
    if (!normalizedQuery) return packs;
    return packs
      .map((pack) => ({
        ...pack,
        templates: pack.templates.filter((template) =>
          [template.name, template.desc, pack.name, pack.description]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery),
        ),
      }))
      .filter((pack) => pack.templates.length > 0);
  }, [normalizedQuery, packs]);
  const resultCount = filteredPacks.reduce(
    (count, pack) => count + pack.templates.length,
    0,
  );

  useEffect(() => {
    if (normalizedQuery.length < 2) return;
    const signature = `${normalizedQuery}:${resultCount}`;
    const timeout = window.setTimeout(() => {
      if (lastTrackedSearch.current === signature) return;
      lastTrackedSearch.current = signature;
      captureTemplateSearch(normalizedQuery, resultCount, "/templates");
    }, 600);
    return () => window.clearTimeout(timeout);
  }, [normalizedQuery, resultCount]);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
        <p className="mt-2 text-muted-foreground max-w-xl">
          {totalCount} customizable templates organized into {packs.length} packs.
          Every template supports multiple page sizes — with left/right-handed
          layouts, portrait and landscape orientations.
        </p>
      </div>

      <div className="relative mb-12 max-w-xl">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="text"
          role="searchbox"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search templates by name or use…"
          aria-label="Search templates"
          className="h-10 pl-9 pr-10"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setQuery("")}
            aria-label="Clear template search"
            className="absolute right-2 top-1/2 -translate-y-1/2"
          >
            <X aria-hidden="true" />
          </Button>
        )}
      </div>

      {normalizedQuery && resultCount > 0 && (
        <p className="mb-8 text-sm text-muted-foreground" role="status">
          {resultCount} {resultCount === 1 ? "template" : "templates"} for “
          {query.trim()}”
        </p>
      )}

      {filteredPacks.map((pack) => (
        <section key={pack.name} className="mb-16">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-semibold tracking-tight">{pack.name}</h2>
            <Badge variant="secondary">{pack.badge}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-6">{pack.description}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-6">
            {pack.templates.map((t) => (
              <TemplateCard
                key={t.href}
                template={t}
                packBadge={pack.badge}
                searchQuery={normalizedQuery || undefined}
              />
            ))}
          </div>
        </section>
      ))}

      {normalizedQuery && resultCount === 0 && (
        <div className="mb-16">
          <div className="mb-8 max-w-lg">
            <p className="text-lg font-semibold">No matching template yet</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              “{query.trim()}” may be exactly what we should build next. Send the
              request below and it will be counted in our roadmap data.
            </p>
          </div>
          <TemplateRequestForm
            key={normalizedQuery}
            sourcePage="/templates#zero-results"
            initialRequest={query.trim()}
          />
        </div>
      )}

      {(!normalizedQuery || resultCount > 0) && (
        <TemplateRequestForm sourcePage="/templates" className="mb-8" />
      )}
    </>
  );
}
