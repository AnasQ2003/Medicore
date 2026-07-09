import { createFileRoute } from "@tanstack/react-router";
import { RoleDetailScreen } from "@/components/RoleDetailScreen";
import { patientNav } from "@/lib/roleNav";

export const Route = createFileRoute("/patient/profile")({
  head: () => ({ meta: [{ title: "Profile — Patient Portal" }] }),
  component: PatientProfileScreen,
});

function PatientProfileScreen() {
  return (
    <RoleDetailScreen
      role="patient"
      title="Patient Portal"
      nav={patientNav}
      screen="Patient Portal Profile"
      description="Manage profile details, records, updates, and live hospital workflow for this role."
      variant="sunset"
    />
  );
}
