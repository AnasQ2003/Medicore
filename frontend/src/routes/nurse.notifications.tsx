import { createFileRoute } from "@tanstack/react-router";
import { RoleDetailScreen } from "@/components/RoleDetailScreen";
import { nurseNav } from "@/lib/roleNav";

export const Route = createFileRoute("/nurse/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Nurse" }] }),
  component: NurseNotificationsScreen,
});

function NurseNotificationsScreen() {
  return (
    <RoleDetailScreen
      role="nurse"
      title="Nurse"
      nav={nurseNav}
      screen="Nurse Notifications"
      description="Manage notifications details, records, updates, and live hospital workflow for this role."
      variant="red"
    />
  );
}
