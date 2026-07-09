import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/receptionist")({
  head: () => ({ meta: [{ title: "Receptionist — MediCore" }] }),
  component: () => <Outlet />,
});
