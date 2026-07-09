import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/nurse")({
  head: () => ({ meta: [{ title: "Nurse — MediCore" }] }),
  component: () => <Outlet />,
});
