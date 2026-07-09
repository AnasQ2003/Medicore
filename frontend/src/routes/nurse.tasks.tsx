import { createFileRoute } from "@tanstack/react-router";
import { RoleDetailScreen } from "@/components/RoleDetailScreen";
import { nurseNav } from "@/lib/roleNav";

export const Route = createFileRoute("/nurse/tasks")({
  head: () => ({ meta: [{ title: "Tasks — Nurse" }] }),
  component: NurseTasksScreen,
});

function NurseTasksScreen() {
  return (
    <RoleDetailScreen
      role="nurse"
      title="Nurse"
      nav={nurseNav}
      screen="Nurse Tasks"
      description="Manage tasks details, records, updates, and live hospital workflow for this role."
      variant="red"
    />
  );
}
