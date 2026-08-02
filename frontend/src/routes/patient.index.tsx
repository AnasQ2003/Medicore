import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Calendar, FileText, Pill, Receipt, Download } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { patientNav } from "@/lib/roleNav";
import { appointmentAPI, prescriptionAPI, billAPI } from "@/lib/api/client";
import useApi from "@/hooks/useApi";
import { getUser } from "@/lib/auth";

import { useState } from "react";
import { Slideshow } from "@/components/Slideshow";
import { patientSlides } from "@/lib/mockData";
import { RoleRequestModal } from "@/components/RoleRequestModal";
import { UserCheck } from "lucide-react";

export const Route = createFileRoute("/patient/")({
  head: () => ({ meta: [{ title: "Patient Portal — MediCore" }] }),
  component: PatientScreen,
});

interface Appointment { id: number; appointmentCode: string; date: string; time: string; doctor: string; reason: string; type: string; status: string; }
interface Prescription { id: string; items: string; status: string; date: string; patient: string; }
interface Bill { id: string; billCode: string; amount: number; description: string; status: string; createdAt: string; }

const statusColors: Record<string, string> = {
  Confirmed: "bg-accent text-accent-foreground",
  Pending: "bg-amber-100 text-amber-700",
  Completed: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-rose-100 text-rose-700",
};

function PatientScreen() {
  const navigate = useNavigate();
  const currentUser = getUser();
  const patientName = currentUser?.name || "Patient";
  const { data: rawAppts } = useApi(() => appointmentAPI.getAll());
  const { data: rawRx } = useApi(() => prescriptionAPI.getAll());
  const { data: rawBills } = useApi(() => billAPI.getAll());

  const appointments = (rawAppts as unknown as Appointment[]) ?? [];
  const prescriptions = (rawRx as unknown as Prescription[]) ?? [];
  const bills = (rawBills as unknown as Bill[]) ?? [];

  const upcoming = appointments.filter((a) => a.status !== "Completed" && a.status !== "Cancelled");
  const activeRx = prescriptions.filter((p) => p.status === "Issued");
  const unpaidBills = bills.filter((b) => b.status === "Unpaid");
  const totalOwed = unpaidBills.reduce((sum, b) => sum + (b.amount ?? 0), 0);

  const nextAppt = upcoming[0] ?? null;

  const [requestModalOpen, setRequestModalOpen] = useState(false);

  return (
    <AppShell role="patient" title="Patient Portal" nav={patientNav}>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, <span className="text-gradient">{patientName}</span> 👋</h1>
          <p className="text-muted-foreground">Here's your health summary.</p>
        </div>
        <Button
          onClick={() => setRequestModalOpen(true)}
          className="bg-gradient-sunset text-white shadow-glow font-semibold self-start"
        >
          <UserCheck className="h-4 w-4 mr-2" /> 🩺 Request Doctor Change / Care Assistance
        </Button>
      </div>

      {/* Hero Slideshow */}
      <div className="mb-6">
        <Slideshow slides={patientSlides} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Next Appointment"
          value={nextAppt ? nextAppt.date : "None"}
          change={nextAppt ? nextAppt.doctor : ""}
          icon={Calendar} delay={0}
          to="/patient/appointments"
        />
        <StatCard label="Active Prescriptions" value={String(activeRx.length)} icon={Pill} delay={0.05} to="/patient/prescriptions" />
        <StatCard label="Appointments" value={String(appointments.length)} change={`${upcoming.length} upcoming`} icon={FileText} delay={0.1} to="/patient/appointments" />
        <StatCard
          label="Outstanding"
          value={totalOwed > 0 ? `$${totalOwed.toFixed(0)}` : "Cleared"}
          change={`${unpaidBills.length} unpaid bills`}
          icon={Receipt} delay={0.15}
          to="/patient/bills"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        {/* Upcoming Appointments */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-gradient-card border border-border rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Upcoming Appointments</h3>
            <Button size="sm" variant="ghost" className="text-xs" onClick={() => navigate({ to: "/patient/appointments" as any })}>View All →</Button>
          </div>
          <div className="space-y-3">
            {upcoming.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">No upcoming appointments.</div>
            ) : upcoming.slice(0, 4).map((a, i) => (
              <motion.div key={a.id}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.05 }}
                onClick={() => navigate({ to: "/patient/appointments" as any })}
                className="flex items-center gap-4 p-4 rounded-xl bg-secondary/40 hover:bg-secondary transition-all cursor-pointer group">
                <div className="h-14 w-14 rounded-xl bg-gradient-primary flex flex-col items-center justify-center text-primary-foreground flex-shrink-0">
                  <div className="text-[10px] uppercase">{a.date.split("-")[1] ? `Month ${a.date.split("-")[1]}` : a.date.slice(0, 3)}</div>
                  <div className="font-bold text-lg leading-none">{a.date.split("-")[2] ?? a.date}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium group-hover:text-primary transition-colors">{a.doctor ?? "Doctor TBA"}</div>
                  <div className="text-xs text-muted-foreground">{a.reason} · {a.time}</div>
                </div>
                <Badge className={statusColors[a.status] ?? ""}>{a.status}</Badge>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Prescriptions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-gradient-card border border-border rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Prescriptions</h3>
            <Button size="sm" variant="ghost" className="text-xs" onClick={() => navigate({ to: "/patient/prescriptions" as any })}>View All →</Button>
          </div>
          <div className="space-y-3">
            {prescriptions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">No prescriptions on file.</div>
            ) : prescriptions.slice(0, 4).map((rx) => (
              <div
                key={rx.id}
                onClick={() => navigate({ to: "/patient/prescriptions" as any })}
                className="p-3 rounded-xl bg-secondary/40 hover:bg-secondary transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-sm group-hover:text-primary transition-colors">{rx.id}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{rx.items}</div>
                  </div>
                  <Button size="icon" variant="ghost" className="h-7 w-7"><Download className="h-3.5 w-3.5" /></Button>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <div className="text-[10px] text-muted-foreground">{rx.date}</div>
                  <Badge className={rx.status === "Issued" ? "bg-emerald-100 text-emerald-700 text-[10px]" : "bg-amber-100 text-amber-700 text-[10px]"}>
                    {rx.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bills */}
      {bills.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="mt-6 bg-gradient-card border border-border rounded-2xl p-6 shadow-card">
          <h3 className="font-semibold mb-4">Billing Summary</h3>
          <div className="divide-y divide-border">
            {bills.slice(0, 5).map((b) => (
              <div key={b.billCode ?? b.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium text-sm">{b.description}</div>
                  <div className="text-xs text-muted-foreground">{b.billCode} • {new Date(b.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">${b.amount}</span>
                  <Badge className={b.status === "Paid" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}>
                    {b.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Activity Timeline */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="mt-6 bg-gradient-card border border-border rounded-2xl p-6 shadow-card">
        <h3 className="font-semibold mb-4">Activity Timeline</h3>
        <div className="relative pl-6 space-y-4 border-l-2 border-border">
          {appointments.slice(0, 5).map((a, i) => (
            <div key={a.id} className="relative">
              <div className={`absolute -left-[29px] top-1 h-3 w-3 rounded-full shadow-glow ${
                a.status === "Completed" ? "bg-emerald-500" : a.status === "Confirmed" ? "bg-primary" : "bg-muted-foreground"
              }`} />
              <div className="text-xs text-muted-foreground">{a.date}</div>
              <div className="text-sm font-medium">{a.reason} — {a.status}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Role Request Modal for Patient Doctor Change */}
      <RoleRequestModal
        open={requestModalOpen}
        onOpenChange={setRequestModalOpen}
        role="patient"
        defaultCategory="Doctor Change & Care"
      />
    </AppShell>
  );
}
