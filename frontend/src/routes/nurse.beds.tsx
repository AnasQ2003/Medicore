import { createFileRoute } from "@tanstack/react-router";
import { RoleDetailScreen } from "@/components/RoleDetailScreen";
import { nurseNav } from "@/lib/roleNav";

export const Route = createFileRoute("/nurse/beds")({
  head: () => ({ meta: [{ title: "Beds — Nurse" }] }),
  component: NurseBedsScreen,
});

function NurseBedsScreen() {
  return (
    <RoleDetailScreen
      role="nurse"
      title="Nurse"
      nav={nurseNav}
      screen="Nurse Beds"
      description="Manage beds details, records, updates, and live hospital workflow for this role."
      variant="red"
    />
  );
}
