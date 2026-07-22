import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { PortalShell } from "@/components/PortalShell";

const DocumentsPageLazy = lazy(() => import("@/components/DocumentsPage").then(m => ({ default: m.DocumentsPage })));

export const Route = createFileRoute("/documents")({
  component: () => (
    <Suspense fallback={<DocumentsLoading />}>
      <DocumentsPageLazy />
    </Suspense>
  ),
});

function DocumentsLoading() {
  return (
    <PortalShell>
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[color:var(--gold)]" />
      </div>
    </PortalShell>
  );
}