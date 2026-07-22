import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { PortalShell } from "@/components/PortalShell";

const AdminPageLazy = lazy(() => import("@/components/AdminPage").then(m => ({ default: m.AdminPage })));

export const Route = createFileRoute("/admin")({
  component: () => (
    <Suspense fallback={<AdminLoading />}>
      <AdminPageLazy />
    </Suspense>
  ),
});

function AdminLoading() {
  return (
    <PortalShell>
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[color:var(--gold)]" />
      </div>
    </PortalShell>
  );
}