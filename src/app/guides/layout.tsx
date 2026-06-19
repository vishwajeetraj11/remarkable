import { Breadcrumbs } from "@/components/shared/breadcrumbs";

// No metadata here: the index page and each guide page set their own.
// `Breadcrumbs` renders nothing on `/guides` (one segment) and the trail on
// each `/guides/<slug>` detail page.
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Breadcrumbs />
      {children}
    </>
  );
}
