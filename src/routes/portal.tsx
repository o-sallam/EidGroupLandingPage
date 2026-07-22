import { createFileRoute, Navigate } from "@tanstack/react-router";

// Convenience redirect: /portal → video 1
export const Route = createFileRoute("/portal")({
  component: () => <Navigate to="/video/$n" params={{ n: "1" }} replace />,
});
