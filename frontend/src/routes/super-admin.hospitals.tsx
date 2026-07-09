import { createFileRoute } from "@tanstack/react-router";
import { RoleDetailScreen } from "@/components/RoleDetailScreen";
import { superAdminNav } from "@/lib/roleNav";

export const Route = createFileRoute("/super-admin/hospitals")({
  head: () => ({ meta: [{ title: "Hospitals — Super Admin" }] }),
  component: SuperAdminHospitalsScreen,
});

function SuperAdminHospitalsScreen() {
  return (
    <RoleDetailScreen
      role="super-admin"
      title="Super Admin"
      nav={superAdminNav}
      screen="Super Admin Hospitals"
      description="Manage hospitals details, records, updates, and live hospital workflow for this role."
      variant="violet"
    />
  );
}
