import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { receptionistNav } from "@/lib/roleNav";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Calendar, Search, Plus, Loader2, AlertCircle, CheckCircle2, Clock, X, RefreshCw } from "lucide-react";
import { appointmentAPI, patientAPI, adminAPI } from "@/lib/api/client";
import useApi from "@/hooks/useApi";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/receptionist/appointments")({
  head: () => ({ meta: [{ title: "Appointments — Reception" }] }),
  component: ReceptionistAppointmentsScreen,
});

interface Appointment {
  id: number; appointmentCode: string; patient: string; patientId: number;
  doctor: string; doctorId?: number; date: string; time: string; reason: string; type: string; status: string;
}
interface ApiPatient { id: number; name: string; patientCode: string; }
interface ApiDoctor { id: number; name: string; }

const statusStyles: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700",
  Confirmed: "bg-accent text-accent-foreground",
  Completed: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-rose-100 text-rose-700",
};

const statusIcons: Record<string, React.ElementType> = {
  Pending: Clock,
  Confirmed: Calendar,
  Completed: CheckCircle2,
  Cancelled: X,
};

function ReceptionistAppointmentsScreen() {
  const { data: rawAppts, loading, error, refetch } = useApi(() => appointmentAPI.getAll());
  const { data: rawPatients } = useApi(() => patientAPI.getAll());
  const { data: rawDoctors } = useApi(() => adminAPI.getDoctors());

  const appointments = (rawAppts as unknown as Appointment[]) ?? [];
  const patients = (rawPatients as unknown as ApiPatient[]) ?? [];
  const doctors = (rawDoctors as unknown as ApiDoctor[]) ?? [];

  const [q, setQ] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [bookOpen, setBookOpen] = useState(false);
  const [form, setForm] = useState({ patientId: "", doctorId: "", date: "", time: "", reason: "", type: "Consultation" });

  const filtered = appointments.filter((a) => {
    const matchQ = a.patient.toLowerCase().includes(q.toLowerCase()) || a.appointmentCode.toLowerCase().includes(q.toLowerCase());
    const matchStatus = filterStatus === "All" || a.status === filterStatus;
    return matchQ && matchStatus;
  });

  const updateStatus = async (code: string, status: string) => {
    try {
      await appointmentAPI.updateStatus(code, status);
      toast.success(`Appointment ${code} → ${status}`);
      refetch();
    } catch { toast.error("Failed to update"); }
  };

  const book = async () => {
    if (!form.patientId || !form.date || !form.time || !form.reason) return toast.error("Please fill all required fields");
    try {
      await appointmentAPI.book({
        patientId: Number(form.patientId),
        doctorId: form.doctorId ? Number(form.doctorId) : undefined,
        date: form.date,
        time: form.time,
        reason: form.reason,
        type: form.type,
      });
      toast.success("Appointment booked successfully");
      setBookOpen(false);
      setForm({ patientId: "", doctorId: "", date: "", time: "", reason: "", type: "Consultation" });
      refetch();
    } catch { toast.error("Failed to book appointment"); }
  };

  const counts = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === "Pending").length,
    confirmed: appointments.filter((a) => a.status === "Confirmed").length,
    completed: appointments.filter((a) => a.status === "Completed").length,
  };

  return (
    <AppShell role="receptionist" title="Reception" nav={receptionistNav}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointment Book</h1>
          <p className="text-muted-foreground">{appointments.length} total appointments on record</p>
        </div>
        <Button onClick={() => setBookOpen(true)} className="bg-gradient-primary text-white shadow-glow">
          <Plus className="h-4 w-4 mr-2" />Book Appointment
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: counts.total, color: "from-violet-500 to-purple-600" },
          { label: "Pending", value: counts.pending, color: "from-amber-500 to-orange-600" },
          { label: "Confirmed", value: counts.confirmed, color: "from-blue-500 to-cyan-600" },
          { label: "Completed", value: counts.completed, color: "from-emerald-500 to-teal-600" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`rounded-2xl bg-gradient-to-br ${s.color} text-white p-5 shadow-elevated`}>
            <div className="text-3xl font-bold">{s.value}</div>
            <div className="text-sm opacity-90 mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patient or appointment code…" className="pl-9" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["All", "Pending", "Confirmed", "Completed", "Cancelled"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={refetch} className="shrink-0"><RefreshCw className="h-3.5 w-3.5 mr-2" />Refresh</Button>
      </div>

      {loading && <div className="flex items-center justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
      {error && (
        <div className="text-center py-16 text-destructive">
          <AlertCircle className="h-8 w-8 mx-auto mb-3" />
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-gradient-card border border-border rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-6 py-3">Code</th>
                  <th className="text-left px-6 py-3">Patient</th>
                  <th className="text-left px-6 py-3">Doctor</th>
                  <th className="text-left px-6 py-3">Date & Time</th>
                  <th className="text-left px-6 py-3">Reason</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="text-left px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => {
                  const Icon = statusIcons[a.status] ?? Clock;
                  return (
                    <motion.tr key={a.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 + i * 0.03 }}
                      className="border-t border-border hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-primary">{a.appointmentCode}</td>
                      <td className="px-6 py-4 font-medium">{a.patient}</td>
                      <td className="px-6 py-4 text-muted-foreground">{a.doctor ?? "—"}</td>
                      <td className="px-6 py-4">
                        <div>{a.date}</div>
                        <div className="text-xs text-muted-foreground">{a.time}</div>
                      </td>
                      <td className="px-6 py-4 max-w-[160px] truncate">{a.reason}</td>
                      <td className="px-6 py-4">
                        <Badge className={`flex items-center gap-1 w-fit ${statusStyles[a.status] ?? ""}`}>
                          <Icon className="h-3 w-3" />{a.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1.5 flex-wrap">
                          {a.status === "Pending" && (
                            <Button size="sm" className="bg-accent text-accent-foreground" onClick={() => updateStatus(a.appointmentCode, "Confirmed")}>Confirm</Button>
                          )}
                          {(a.status === "Pending" || a.status === "Confirmed") && (
                            <Button size="sm" variant="outline" onClick={() => updateStatus(a.appointmentCode, "Completed")}>Complete</Button>
                          )}
                          {a.status !== "Cancelled" && a.status !== "Completed" && (
                            <Button size="sm" variant="outline" className="text-destructive" onClick={() => updateStatus(a.appointmentCode, "Cancelled")}>Cancel</Button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-16 text-muted-foreground">No appointments found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Book Dialog */}
      <Dialog open={bookOpen} onOpenChange={setBookOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" />Book Appointment</DialogTitle>
            <DialogDescription>Schedule a new appointment for a registered patient.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Patient *</Label>
              <Select value={form.patientId} onValueChange={(v) => setForm({ ...form, patientId: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select patient…" /></SelectTrigger>
                <SelectContent>
                  {patients.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name} ({p.patientCode})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Doctor (optional)</Label>
              <Select value={form.doctorId} onValueChange={(v) => setForm({ ...form, doctorId: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select doctor…" /></SelectTrigger>
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
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Consultation", "Follow-up", "Emergency", "Check-up", "Procedure"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Reason *</Label>
              <Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Chief complaint or reason…" className="mt-1.5" />
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
