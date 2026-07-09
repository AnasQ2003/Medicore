import { createFileRoute } from "@tanstack/react-router";
import { RoleDetailScreen } from "@/components/RoleDetailScreen";
import { receptionistNav } from "@/lib/roleNav";

export const Route = createFileRoute("/receptionist/register")({
  head: () => ({ meta: [{ title: "Register — Reception" }] }),
  component: ReceptionistRegisterScreen,
});

function ReceptionistRegisterScreen() {
  return (
    <RoleDetailScreen
      role="receptionist"
      title="Reception"
      nav={receptionistNav}
      screen="Reception Register"
      description="Manage register details, records, updates, and live hospital workflow for this role."
      variant="green"
    />
  );
}
