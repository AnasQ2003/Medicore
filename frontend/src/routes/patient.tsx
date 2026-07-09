import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/patient")({
  head: () => ({ meta: [{ title: "Patient — MediCore" }] }),
  component: () => <Outlet />,
});
