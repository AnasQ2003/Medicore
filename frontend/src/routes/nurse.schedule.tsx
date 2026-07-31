import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ScheduleCalendar } from "@/components/ScheduleCalendar";
import { nurseNav } from "@/lib/roleNav";
import { CalendarClock } from "lucide-react";

export const Route = createFileRoute("/nurse/schedule")({
  head: () => ({ meta: [{ title: "Schedule — Nurse" }] }),
  component: NurseScheduleScreen,
});

function NurseScheduleScreen() {
  return (
    <AppShell role="nurse" title="Nurse" nav={nurseNav}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <CalendarClock className="h-7 w-7 text-primary" />
          My Schedule & Attendance
        </h1>
        <p className="text-muted-foreground mt-1">
          View your monthly attendance, track leave taken & remaining, and apply for leave.
        </p>
      </div>
      <ScheduleCalendar role="nurse" accentClass="bg-gradient-red" />
    </AppShell>
  );
}
