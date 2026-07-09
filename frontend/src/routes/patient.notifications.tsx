import { createFileRoute } from "@tanstack/react-router";
import { RoleDetailScreen } from "@/components/RoleDetailScreen";
import { patientNav } from "@/lib/roleNav";

export const Route = createFileRoute("/patient/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Patient Portal" }] }),
  component: PatientNotificationsScreen,
});

function PatientNotificationsScreen() {
  return (
    <RoleDetailScreen
      role="patient"
      title="Patient Portal"
      nav={patientNav}
      screen="Patient Portal Notifications"
      description="Manage notifications details, records, updates, and live hospital workflow for this role."
      variant="sunset"
    />
  );
}
