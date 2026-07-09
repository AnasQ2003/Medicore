import { createFileRoute } from "@tanstack/react-router";
import { RoleDetailScreen } from "@/components/RoleDetailScreen";
import { superAdminNav } from "@/lib/roleNav";

export const Route = createFileRoute("/super-admin/doctors")({
  head: () => ({ meta: [{ title: "Doctors — Super Admin" }] }),
  component: SuperAdminDoctorsScreen,
});

function SuperAdminDoctorsScreen() {
  return (
    <RoleDetailScreen
      role="super-admin"
      title="Super Admin"
      nav={superAdminNav}
      screen="Super Admin Doctors"
      description="Manage doctors details, records, updates, and live hospital workflow for this role."
      variant="violet"
    />
  );
}
