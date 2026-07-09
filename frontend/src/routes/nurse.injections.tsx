import { createFileRoute } from "@tanstack/react-router";
import { RoleDetailScreen } from "@/components/RoleDetailScreen";
import { nurseNav } from "@/lib/roleNav";

export const Route = createFileRoute("/nurse/injections")({
  head: () => ({ meta: [{ title: "Injections — Nurse" }] }),
  component: NurseInjectionsScreen,
});

function NurseInjectionsScreen() {
  return (
    <RoleDetailScreen
      role="nurse"
      title="Nurse"
      nav={nurseNav}
      screen="Nurse Injections"
      description="Manage injections details, records, updates, and live hospital workflow for this role."
      variant="red"
    />
  );
}
