import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SolutionPage } from "@/components/solutions/solution-page";
import {
  SOLUTION_SLUGS,
  SOLUTIONS,
  isSolutionSlug,
} from "@/lib/solutions";
import { toolOpenGraph } from "@/lib/seo";

export function generateStaticParams() {
  return SOLUTION_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata(
  props: PageProps<"/solutions/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  if (!isSolutionSlug(slug)) return {};
  const solution = SOLUTIONS[slug];
  const path = `/solutions/${slug}`;
  return {
    title: `${solution.title} — Free PDF Generator`,
    description: solution.description,
    alternates: { canonical: path },
    ...toolOpenGraph({
      title: solution.title,
      description: solution.description,
      path,
    }),
  };
}

export default async function SolutionRoute(
  props: PageProps<"/solutions/[slug]">,
) {
  const { slug } = await props.params;
  if (!isSolutionSlug(slug)) notFound();
  return <SolutionPage solution={SOLUTIONS[slug]} />;
}
