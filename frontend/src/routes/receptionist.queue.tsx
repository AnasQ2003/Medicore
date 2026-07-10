import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { receptionistNav } from "@/lib/roleNav";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, RefreshCw, Clock, CheckCircle2, UserCheck, Play } from "lucide-react";
import { appointmentAPI } from "@/lib/api/client";
import useApi from "@/hooks/useApi";
import { toast } from "sonner";

export const Route = createFileRoute("/receptionist/queue")({
  head: () => ({ meta: [{ title: "Live Queue — Reception" }] }),
  component: ReceptionistQueueScreen,
});

interface Appointment {
  id: number;
  appointmentCode: string;
  patient: string;
  doctor: string;
  time: string;
  date: string;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
  reason: string;
}

function ReceptionistQueueScreen() {
  const { data: rawAppts, loading, error, refetch } = useApi(() => appointmentAPI.getAll());
  const appointments = (rawAppts as unknown as Appointment[]) ?? [];

  // Filter today's appointments for the queue
  const todayStr = new Date().toISOString().split("T")[0];
  const queue = appointments.filter(
    (a) => a.date === todayStr && a.status !== "Completed" && a.status !== "Cancelled"
  );

  const handleCheckIn = async (code: string) => {
    try {
      await appointmentAPI.updateStatus(code, "Confirmed");
      toast.success("Patient checked in. Sent to doctor's queue.");
      refetch();
    } catch {
      toast.error("Failed to check in patient");
    }
  };

  const handleComplete = async (code: string) => {
    try {
      await appointmentAPI.updateStatus(code, "Completed");
      toast.success("Appointment completed");
      refetch();
    } catch {
      toast.error("Failed to complete appointment");
    }
  };

  return (
    <AppShell role="receptionist" title="Reception" nav={receptionistNav}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Check-In Queue</h1>
          <p className="text-muted-foreground">Today's active clinical queue ({queue.length} patients)</p>
        </div>
        <Button variant="outline" size="sm" onClick={refetch} className="shrink-0">
          <RefreshCw className="h-3.5 w-3.5 mr-2" />Refresh Queue
        </Button>
      </div>

      {loading && <div className="flex items-center justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
      {error && (
        <div className="text-center py-16 text-destructive">
          <AlertCircle className="h-8 w-8 mx-auto mb-3" />
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {queue.length === 0 ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-card border rounded-2xl p-12 text-center text-muted-foreground">
                <UserCheck className="h-12 w-12 mx-auto mb-4 text-emerald-500 opacity-60" />
                <h3 className="font-semibold text-lg text-foreground mb-1">Queue is Clear</h3>
                <p className="text-sm">No scheduled patients are waiting to check in for today.</p>
              </motion.div>
            ) : (
              queue.map((appt, i) => (
                <motion.div key={appt.id}
                  initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-white border rounded-2xl p-5 shadow-card hover:shadow-elevated transition flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-primary text-white flex items-center justify-center font-bold font-mono">
                      {appt.time}
                    </div>
                    <div>
                      <div className="font-semibold text-base">{appt.patient}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Code: <span className="font-mono text-primary">{appt.appointmentCode}</span> • Consulting: <span className="font-medium text-foreground">{appt.doctor}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 bg-secondary/40 px-2.5 py-0.5 rounded-full w-fit">
                        Reason: {appt.reason}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {appt.status === "Pending" ? (
                      <Button onClick={() => handleCheckIn(appt.appointmentCode)} className="bg-gradient-primary text-white shadow-glow">
                        <Play className="h-3.5 w-3.5 mr-1.5" /> Check In
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Badge className="bg-emerald-100 text-emerald-700 mr-2 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Waiting for Doctor
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => handleComplete(appt.appointmentCode)}>
                          Checkout
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Quick Summary Sidebar */}
          <div className="space-y-4">
            <div className="bg-gradient-card border rounded-2xl p-6 shadow-card">
              <h3 className="font-semibold mb-3">Live Status Board</h3>
              <div className="space-y-3.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-2"><Clock className="h-4 w-4 text-amber-500" /> Pending Check-in</span>
                  <span className="font-bold">{queue.filter((a) => a.status === "Pending").length}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-2"><UserCheck className="h-4 w-4 text-primary" /> Active Waiting</span>
                  <span className="font-bold text-primary">{queue.filter((a) => a.status === "Confirmed").length}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t pt-3">
                  <span className="text-muted-foreground flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Completed Today</span>
                  <span className="font-bold text-emerald-600">
                    {appointments.filter((a) => a.date === todayStr && a.status === "Completed").length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
