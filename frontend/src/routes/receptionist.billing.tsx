import { createFileRoute } from "@tanstack/react-router";
import { RoleDetailScreen } from "@/components/RoleDetailScreen";
import { receptionistNav } from "@/lib/roleNav";

export const Route = createFileRoute("/receptionist/billing")({
  head: () => ({ meta: [{ title: "Billing — Reception" }] }),
  component: ReceptionistBillingScreen,
});

function ReceptionistBillingScreen() {
  return (
    <RoleDetailScreen
      role="receptionist"
      title="Reception"
      nav={receptionistNav}
      screen="Reception Billing"
      description="Manage billing details, records, updates, and live hospital workflow for this role."
      variant="green"
    />
  );
}
