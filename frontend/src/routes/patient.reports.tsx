import { createFileRoute } from "@tanstack/react-router";
import { RoleDetailScreen } from "@/components/RoleDetailScreen";
import { patientNav } from "@/lib/roleNav";

export const Route = createFileRoute("/patient/reports")({
  head: () => ({ meta: [{ title: "Lab Reports — Patient Portal" }] }),
  component: PatientReportsScreen,
});

function PatientReportsScreen() {
  return (
    <RoleDetailScreen
      role="patient"
      title="Patient Portal"
      nav={patientNav}
      screen="Patient Portal Lab Reports"
      description="Manage lab reports details, records, updates, and live hospital workflow for this role."
      variant="sunset"
    />
  );
}
