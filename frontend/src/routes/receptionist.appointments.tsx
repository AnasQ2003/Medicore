import { createFileRoute } from "@tanstack/react-router";
import { RoleDetailScreen } from "@/components/RoleDetailScreen";
import { receptionistNav } from "@/lib/roleNav";

export const Route = createFileRoute("/receptionist/appointments")({
  head: () => ({ meta: [{ title: "Appointments — Reception" }] }),
  component: ReceptionistAppointmentsScreen,
});

function ReceptionistAppointmentsScreen() {
  return (
    <RoleDetailScreen
      role="receptionist"
      title="Reception"
      nav={receptionistNav}
      screen="Reception Appointments"
      description="Manage appointments details, records, updates, and live hospital workflow for this role."
      variant="green"
    />
  );
}
