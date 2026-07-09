import { createFileRoute } from "@tanstack/react-router";
import { RoleDetailScreen } from "@/components/RoleDetailScreen";
import { receptionistNav } from "@/lib/roleNav";

export const Route = createFileRoute("/receptionist/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Reception" }] }),
  component: ReceptionistNotificationsScreen,
});

function ReceptionistNotificationsScreen() {
  return (
    <RoleDetailScreen
      role="receptionist"
      title="Reception"
      nav={receptionistNav}
      screen="Reception Notifications"
      description="Manage notifications details, records, updates, and live hospital workflow for this role."
      variant="green"
    />
  );
}
