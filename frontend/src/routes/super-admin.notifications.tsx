import { createFileRoute } from "@tanstack/react-router";
import { RoleDetailScreen } from "@/components/RoleDetailScreen";
import { superAdminNav } from "@/lib/roleNav";

export const Route = createFileRoute("/super-admin/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Super Admin" }] }),
  component: SuperAdminNotificationsScreen,
});

function SuperAdminNotificationsScreen() {
  return (
    <RoleDetailScreen
      role="super-admin"
      title="Super Admin"
      nav={superAdminNav}
      screen="Super Admin Notifications"
      description="Manage notifications details, records, updates, and live hospital workflow for this role."
      variant="violet"
    />
  );
}
