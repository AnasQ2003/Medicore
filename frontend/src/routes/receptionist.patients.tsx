import { createFileRoute } from "@tanstack/react-router";
import { RoleDetailScreen } from "@/components/RoleDetailScreen";
import { receptionistNav } from "@/lib/roleNav";

export const Route = createFileRoute("/receptionist/patients")({
  head: () => ({ meta: [{ title: "Patients — Reception" }] }),
  component: ReceptionistPatientsScreen,
});

function ReceptionistPatientsScreen() {
  return (
    <RoleDetailScreen
      role="receptionist"
      title="Reception"
      nav={receptionistNav}
      screen="Reception Patients"
      description="Manage patients details, records, updates, and live hospital workflow for this role."
      variant="green"
    />
  );
}
