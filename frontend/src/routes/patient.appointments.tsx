import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { patientNav } from "@/lib/roleNav";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Calendar, Plus, Loader2, AlertCircle, RefreshCw, Clock } from "lucide-react";
import { appointmentAPI, adminAPI } from "@/lib/api/client";
import useApi from "@/hooks/useApi";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/patient/appointments")({
  head: () => ({ meta: [{ title: "My Appointments — Patient Portal" }] }),
  component: PatientAppointmentsScreen,
});

interface Appointment {
  id: number;
  appointmentCode: string;
  doctor: string;
  date: string;
  time: string;
  reason: string;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
  type: string;
}
interface Doctor {
  id: number;
  name: string;
}

const statusStyles = {
  Pending: "bg-amber-100 text-amber-700",
  Confirmed: "bg-blue-100 text-blue-700",
  Completed: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-rose-100 text-rose-700",
};

function PatientAppointmentsScreen() {
  const { data: rawAppts, loading, error, refetch } = useApi(() => appointmentAPI.getAll());
  const { data: rawDocs } = useApi(() => adminAPI.getDoctors());
  
  const appointments = (rawAppts as unknown as Appointment[]) ?? [];
  const doctors = (rawDocs as unknown as Doctor[]) ?? [];

  const [bookOpen, setBookOpen] = useState(false);
  const [form, setForm] = useState({ doctorId: "", date: "", time: "", reason: "", type: "Consultation" });

  const book = async () => {
    if (!form.date || !form.time || !form.reason) return toast.error("All required fields must be filled");
    try {
      await appointmentAPI.book({
        doctorId: form.doctorId ? Number(form.doctorId) : undefined,
        date: form.date,
        time: form.time,
        reason: form.reason,
        type: form.type,
      });
      toast.success("Appointment request submitted successfully");
      setBookOpen(false);
      setForm({ doctorId: "", date: "", time: "", reason: "", type: "Consultation" });
      refetch();
    } catch {
      toast.error("Failed to book appointment");
    }
  };

  const cancelAppt = async (code: string) => {
    try {
      await appointmentAPI.updateStatus(code, "Cancelled");
      toast.success("Appointment request cancelled");
      refetch();
    } catch {
      toast.error("Failed to cancel appointment");
    }
  };

  return (
    <AppShell role="patient" title="Patient Portal" nav={patientNav}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">Manage your clinic bookings and doctor consultation slots</p>
        </div>
        <Button onClick={() => setBookOpen(true)} className="bg-gradient-primary text-white shadow-glow shrink-0">
          <Plus className="h-4 w-4 mr-2" />Request Appointment
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
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground bg-secondary/20 rounded-2xl border">
              No appointments found on your record. Click the button to request one!
            </div>
          ) : (
            appointments.map((a, i) => (
              <motion.div key={a.id}
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white border rounded-2xl p-5 shadow-card hover:shadow-elevated transition flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-primary text-white flex flex-col items-center justify-center text-[10px] font-bold">
                    <span className="uppercase">{a.date.split("-")[1] ? `Month ${a.date.split("-")[1]}` : a.date}</span>
                    <span className="text-lg leading-none mt-0.5">{a.date.split("-")[2] || ""}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-base leading-tight">{a.doctor ?? "Doctor Pending Assigned"}</h3>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Code: <span className="font-mono">{a.appointmentCode}</span> • Time Slot: <span className="font-medium text-foreground">{a.time}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 bg-secondary/40 px-2.5 py-0.5 rounded-full w-fit">
                      Reason: {a.reason}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={statusStyles[a.status] || ""}>{a.status}</Badge>
                  {(a.status === "Pending" || a.status === "Confirmed") && (
                    <Button size="sm" variant="ghost" className="text-rose-600 hover:bg-rose-50" onClick={() => cancelAppt(a.appointmentCode)}>
                      Cancel
                    </Button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Booking Dialog */}
      <Dialog open={bookOpen} onOpenChange={setBookOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" />Book Appointment</DialogTitle>
            <DialogDescription>Request a consultation or follow-up slot.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Doctor Preferred</Label>
              <Select value={form.doctorId} onValueChange={(v) => setForm({ ...form, doctorId: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select doctor (optional)..." /></SelectTrigger>
                <SelectContent>
                  {doctors.map((d) => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date *</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-1.5" /></div>
              <div><Label>Time *</Label><Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="mt-1.5" /></div>
            </div>
            <div>
              <Label>Appointment Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Consultation">Consultation</SelectItem>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                  <SelectItem value="Check-up">Check-up</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Reason *</Label>
              <Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="E.g. Fever, persistent cough, etc." className="mt-1.5" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBookOpen(false)}>Cancel</Button>
            <Button onClick={book} className="bg-gradient-primary text-white">Book Appointment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
