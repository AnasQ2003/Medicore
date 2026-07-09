import { createFileRoute } from "@tanstack/react-router";
import { RoleDetailScreen } from "@/components/RoleDetailScreen";
import { superAdminNav } from "@/lib/roleNav";

export const Route = createFileRoute("/super-admin/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Super Admin" }] }),
  component: SuperAdminAnalyticsScreen,
});

function SuperAdminAnalyticsScreen() {
  return (
    <RoleDetailScreen
      role="super-admin"
      title="Super Admin"
      nav={superAdminNav}
      screen="Super Admin Analytics"
      description="Manage analytics details, records, updates, and live hospital workflow for this role."
      variant="violet"
    />
  );
}
