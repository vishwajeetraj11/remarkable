import { Breadcrumbs } from "@/components/shared/breadcrumbs";

export default function SolutionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Breadcrumbs />
      {children}
    </>
  );
}
