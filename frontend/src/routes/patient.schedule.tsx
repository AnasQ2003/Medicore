import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ScheduleCalendar } from "@/components/ScheduleCalendar";
import { patientNav } from "@/lib/roleNav";
import { CalendarClock } from "lucide-react";

export const Route = createFileRoute("/patient/schedule")({
  head: () => ({ meta: [{ title: "Schedule & Attendance — Patient" }] }),
  component: PatientScheduleScreen,
});

function PatientScheduleScreen() {
  return (
    <AppShell role="patient" title="Patient Portal" nav={patientNav}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <CalendarClock className="h-7 w-7 text-primary" />
          My Appointments & Attendance
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your visit history, appointment attendance, and manage leave requests.
        </p>
      </div>
      <ScheduleCalendar role="patient" accentClass="bg-gradient-sunset" />
    </AppShell>
  );
}
