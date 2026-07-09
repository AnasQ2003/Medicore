import { createFileRoute } from "@tanstack/react-router";
import { RoleDetailScreen } from "@/components/RoleDetailScreen";
import { patientNav } from "@/lib/roleNav";

export const Route = createFileRoute("/patient/appointments")({
  head: () => ({ meta: [{ title: "Appointments — Patient Portal" }] }),
  component: PatientAppointmentsScreen,
});

function PatientAppointmentsScreen() {
  return (
    <RoleDetailScreen
      role="patient"
      title="Patient Portal"
      nav={patientNav}
      screen="Patient Portal Appointments"
      description="Manage appointments details, records, updates, and live hospital workflow for this role."
      variant="sunset"
    />
  );
}
