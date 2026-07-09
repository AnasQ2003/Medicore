import { createFileRoute } from "@tanstack/react-router";
import { RoleDetailScreen } from "@/components/RoleDetailScreen";
import { patientNav } from "@/lib/roleNav";

export const Route = createFileRoute("/patient/bills")({
  head: () => ({ meta: [{ title: "Bills — Patient Portal" }] }),
  component: PatientBillsScreen,
});

function PatientBillsScreen() {
  return (
    <RoleDetailScreen
      role="patient"
      title="Patient Portal"
      nav={patientNav}
      screen="Patient Portal Bills"
      description="Manage bills details, records, updates, and live hospital workflow for this role."
      variant="sunset"
    />
  );
}
