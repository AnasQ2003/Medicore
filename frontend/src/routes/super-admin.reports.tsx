import { createFileRoute } from "@tanstack/react-router";
import { RoleDetailScreen } from "@/components/RoleDetailScreen";
import { superAdminNav } from "@/lib/roleNav";

export const Route = createFileRoute("/super-admin/reports")({
  head: () => ({ meta: [{ title: "Reports — Super Admin" }] }),
  component: SuperAdminReportsScreen,
});

function SuperAdminReportsScreen() {
  return (
    <RoleDetailScreen
      role="super-admin"
      title="Super Admin"
      nav={superAdminNav}
      screen="Super Admin Reports"
      description="Manage reports details, records, updates, and live hospital workflow for this role."
      variant="violet"
    />
  );
}
