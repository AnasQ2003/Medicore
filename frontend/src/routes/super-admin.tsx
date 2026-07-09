import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/super-admin")({
  head: () => ({ meta: [{ title: "Super Admin — MediCore" }] }),
  component: () => <Outlet />,
});
