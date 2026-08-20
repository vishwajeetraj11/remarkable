"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { captureTemplateSearch } from "@/lib/analytics";
import {
  getTemplatesByHref,
  type TemplateCatalogPack,
} from "@/lib/templates/catalog";
import { TemplateRequestForm } from "./template-request-form";
import { TemplateDiscovery } from "./template-discovery";

const POPULAR_THIS_WEEK = getTemplatesByHref([
  "/templates/calendar-2026",
  "/templates/planner",
  "/templates/lecture-notes",
  "/templates/vision-board",
  "/templates/meeting-notes",
]);

const PLANNING_AND_NOTES = getTemplatesByHref([
  "/templates/semester-planner",
  "/templates/monthly-reset",
  "/templates/quarterly-review",
  "/templates/literature-review-matrix",
]);

export function TemplatesView({ packs }: { packs: TemplateCatalogPack[] }) {
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

      {!normalizedQuery && (
        <div className="mb-16 space-y-12">
          <section aria-labelledby="popular-this-week-heading">
            <h2
              id="popular-this-week-heading"
              className="mb-6 text-xl font-semibold tracking-tight"
            >
              Popular this week
            </h2>
            <TemplateDiscovery
              templates={POPULAR_THIS_WEEK}
              sourcePage="/templates"
              placement="popular_this_week"
              className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5 lg:gap-6"
            />
          </section>
          <section aria-labelledby="planning-and-notes-heading">
            <h2
              id="planning-and-notes-heading"
              className="mb-6 text-xl font-semibold tracking-tight"
            >
              Planning &amp; Notes
            </h2>
            <TemplateDiscovery
              templates={PLANNING_AND_NOTES}
              sourcePage="/templates"
              placement="planning_and_notes"
            />
          </section>
        </div>
      )}

      {filteredPacks.map((pack) => (
        <section key={pack.name} className="mb-16">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-semibold tracking-tight">{pack.name}</h2>
            <Badge variant="secondary">{pack.badge}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-6">{pack.description}</p>
          <TemplateDiscovery
            templates={pack.templates}
            sourcePage="/templates"
            placement={normalizedQuery ? "search_results" : "pack_grid"}
            packBadge={pack.badge}
            searchQuery={normalizedQuery || undefined}
          />
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
