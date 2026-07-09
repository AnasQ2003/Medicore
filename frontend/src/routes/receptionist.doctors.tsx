import { createFileRoute } from "@tanstack/react-router";
import { RoleDetailScreen } from "@/components/RoleDetailScreen";
import { receptionistNav } from "@/lib/roleNav";

export const Route = createFileRoute("/receptionist/doctors")({
  head: () => ({ meta: [{ title: "Doctors — Reception" }] }),
  component: ReceptionistDoctorsScreen,
});

function ReceptionistDoctorsScreen() {
  return (
    <RoleDetailScreen
      role="receptionist"
      title="Reception"
      nav={receptionistNav}
      screen="Reception Doctors"
      description="Manage doctors details, records, updates, and live hospital workflow for this role."
      variant="green"
    />
  );
}
