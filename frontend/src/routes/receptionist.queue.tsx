import { createFileRoute } from "@tanstack/react-router";
import { RoleDetailScreen } from "@/components/RoleDetailScreen";
import { receptionistNav } from "@/lib/roleNav";

export const Route = createFileRoute("/receptionist/queue")({
  head: () => ({ meta: [{ title: "Queue — Reception" }] }),
  component: ReceptionistQueueScreen,
});

function ReceptionistQueueScreen() {
  return (
    <RoleDetailScreen
      role="receptionist"
      title="Reception"
      nav={receptionistNav}
      screen="Reception Queue"
      description="Manage queue details, records, updates, and live hospital workflow for this role."
      variant="green"
    />
  );
}
