import { createFileRoute } from "@tanstack/react-router";
import { RoleDetailScreen } from "@/components/RoleDetailScreen";
import { nurseNav } from "@/lib/roleNav";

export const Route = createFileRoute("/nurse/medications")({
  head: () => ({ meta: [{ title: "Medications — Nurse" }] }),
  component: NurseMedicationsScreen,
});

function NurseMedicationsScreen() {
  return (
    <RoleDetailScreen
      role="nurse"
      title="Nurse"
      nav={nurseNav}
      screen="Nurse Medications"
      description="Manage medications details, records, updates, and live hospital workflow for this role."
      variant="red"
    />
  );
}
