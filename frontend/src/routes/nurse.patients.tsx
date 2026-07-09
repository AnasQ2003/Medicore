import { createFileRoute } from "@tanstack/react-router";
import { RoleDetailScreen } from "@/components/RoleDetailScreen";
import { nurseNav } from "@/lib/roleNav";

export const Route = createFileRoute("/nurse/patients")({
  head: () => ({ meta: [{ title: "Patients — Nurse" }] }),
  component: NursePatientsScreen,
});

function NursePatientsScreen() {
  return (
    <RoleDetailScreen
      role="nurse"
      title="Nurse"
      nav={nurseNav}
      screen="Nurse Patients"
      description="Manage patients details, records, updates, and live hospital workflow for this role."
      variant="red"
    />
  );
}
