import { createFileRoute } from "@tanstack/react-router";
import { RoleDetailScreen } from "@/components/RoleDetailScreen";
import { superAdminNav } from "@/lib/roleNav";

export const Route = createFileRoute("/super-admin/settings")({
  head: () => ({ meta: [{ title: "Settings — Super Admin" }] }),
  component: SuperAdminSettingsScreen,
});

function SuperAdminSettingsScreen() {
  return (
    <RoleDetailScreen
      role="super-admin"
      title="Super Admin"
      nav={superAdminNav}
      screen="Super Admin Settings"
      description="Manage settings details, records, updates, and live hospital workflow for this role."
      variant="violet"
    />
  );
}
