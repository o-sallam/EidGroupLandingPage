import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { PortalShell } from "@/components/PortalShell";

const ContactPageLazy = lazy(() => import("@/components/ContactPage").then(m => ({ default: m.ContactPage })));

export const Route = createFileRoute("/contact")({
  component: () => (
    <Suspense fallback={<ContactLoading />}>
      <ContactPageLazy />
    </Suspense>
  ),
});

function ContactLoading() {
  return (
    <PortalShell>
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[color:var(--gold)]" />
      </div>
    </PortalShell>
  );
}