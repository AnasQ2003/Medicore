import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/doctor")({
  head: () => ({ meta: [{ title: "Doctor — MediCore" }] }),
  component: () => <Outlet />,
});
