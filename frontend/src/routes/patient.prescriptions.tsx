import { createFileRoute } from "@tanstack/react-router";
import { RoleDetailScreen } from "@/components/RoleDetailScreen";
import { patientNav } from "@/lib/roleNav";

export const Route = createFileRoute("/patient/prescriptions")({
  head: () => ({ meta: [{ title: "Prescriptions — Patient Portal" }] }),
  component: PatientPrescriptionsScreen,
});

function PatientPrescriptionsScreen() {
  return (
    <RoleDetailScreen
      role="patient"
      title="Patient Portal"
      nav={patientNav}
      screen="Patient Portal Prescriptions"
      description="Manage prescriptions details, records, updates, and live hospital workflow for this role."
      variant="sunset"
    />
  );
}
