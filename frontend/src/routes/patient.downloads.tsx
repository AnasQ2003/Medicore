import { createFileRoute } from "@tanstack/react-router";
import { RoleDetailScreen } from "@/components/RoleDetailScreen";
import { patientNav } from "@/lib/roleNav";

export const Route = createFileRoute("/patient/downloads")({
  head: () => ({ meta: [{ title: "Downloads — Patient Portal" }] }),
  component: PatientDownloadsScreen,
});

function PatientDownloadsScreen() {
  return (
    <RoleDetailScreen
      role="patient"
      title="Patient Portal"
      nav={patientNav}
      screen="Patient Portal Downloads"
      description="Manage downloads details, records, updates, and live hospital workflow for this role."
      variant="sunset"
    />
  );
}
