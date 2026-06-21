import { ErrorBoundary } from "@/components/shared/error-boundary";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Breadcrumbs />
      {children}
    </ErrorBoundary>
  );
}
