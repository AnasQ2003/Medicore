import { createFileRoute } from "@tanstack/react-router";
import { RoleDetailScreen } from "@/components/RoleDetailScreen";
import { superAdminNav } from "@/lib/roleNav";

export const Route = createFileRoute("/super-admin/staff")({
  head: () => ({ meta: [{ title: "Staff — Super Admin" }] }),
  component: SuperAdminStaffScreen,
});

function SuperAdminStaffScreen() {
  return (
    <RoleDetailScreen
      role="super-admin"
      title="Super Admin"
      nav={superAdminNav}
      screen="Super Admin Staff"
      description="Manage staff details, records, updates, and live hospital workflow for this role."
      variant="violet"
    />
  );
}
