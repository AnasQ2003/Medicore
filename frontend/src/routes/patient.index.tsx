import { createFileRoute } from "@tanstack/react-router";
import { LayoutDashboard, Calendar, FileText, Pill, Receipt, UserCircle, Download, FlaskConical } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { patientNav } from "@/lib/roleNav";

export const Route = createFileRoute("/patient/")({
  head: () => ({ meta: [{ title: "Patient Portal — MediCore" }] }),
  component: PatientScreen,
});

const nav = [
  { label: "Dashboard", to: "/patient", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Book Appointment", to: "/patient", icon: <Calendar className="h-4 w-4" /> },
  { label: "Prescriptions", to: "/patient", icon: <Pill className="h-4 w-4" /> },
  { label: "Lab Reports", to: "/patient", icon: <FlaskConical className="h-4 w-4" /> },
  { label: "Bills", to: "/patient", icon: <Receipt className="h-4 w-4" /> },
  { label: "Profile", to: "/patient", icon: <UserCircle className="h-4 w-4" /> },
];

// PatientScreen — upcoming appointments, prescriptions, reports, billing.
function PatientScreen() {
  return (
    <AppShell role="patient" title="Patient Portal" nav={patientNav}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground">Here's your health summary.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Next Appointment" value="Tue 10:30" change="Dr. Sarah Khan" icon={Calendar} delay={0} />
        <StatCard label="Active Prescriptions" value="3" icon={Pill} delay={0.05} />
        <StatCard label="Reports Ready" value="2" change="1 new" icon={FileText} delay={0.1} />
        <StatCard label="Outstanding" value="$120" change="Due Mar 15" icon={Receipt} delay={0.15} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}} className="lg:col-span-2 bg-gradient-card border border-border rounded-2xl p-6 shadow-card">
          <h3 className="font-semibold mb-4">Upcoming Appointments</h3>
          <div className="space-y-3">
            {[
              { date: "Tue, Mar 12", time: "10:30 AM", doc: "Dr. Sarah Khan", spec: "Cardiologist", status: "Confirmed" },
              { date: "Fri, Mar 22", time: "02:00 PM", doc: "Dr. Imran Ali", spec: "Dermatologist", status: "Pending" },
            ].map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-secondary/40"
              >
                <div className="h-14 w-14 rounded-xl bg-gradient-primary flex flex-col items-center justify-center text-primary-foreground">
                  <div className="text-[10px] uppercase">{a.date.split(",")[0]}</div>
                  <div className="font-bold text-lg leading-none">{a.date.split(" ")[2]}</div>
                </div>
                <div className="flex-1">
                  <div className="font-medium">{a.doc}</div>
                  <div className="text-xs text-muted-foreground">{a.spec} · {a.time}</div>
                </div>
                <Badge className={a.status === "Confirmed" ? "bg-accent text-accent-foreground" : ""}>{a.status}</Badge>
              </motion.div>
            ))}
            <Button className="w-full bg-gradient-primary text-primary-foreground shadow-glow mt-2">
              <Calendar className="h-4 w-4 mr-2"/>Book New Appointment
            </Button>
          </div>
        </motion.div>

        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3}} className="bg-gradient-card border border-border rounded-2xl p-6 shadow-card">
          <h3 className="font-semibold mb-4">Recent Prescriptions</h3>
          <div className="space-y-3">
            {[
              { med: "Paracetamol 500mg", freq: "Twice daily · 5 days", date: "Mar 5" },
              { med: "Amlodipine 5mg", freq: "Once daily · 30 days", date: "Feb 28" },
              { med: "Atorvastatin 10mg", freq: "Bedtime · 30 days", date: "Feb 28" },
            ].map((p) => (
              <div key={p.med} className="p-3 rounded-xl bg-secondary/40">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-sm">{p.med}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{p.freq}</div>
                  </div>
                  <Button size="icon" variant="ghost" className="h-7 w-7"><Download className="h-3.5 w-3.5"/></Button>
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">Prescribed {p.date}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.35}} className="mt-6 bg-gradient-card border border-border rounded-2xl p-6 shadow-card">
        <h3 className="font-semibold mb-4">Activity Timeline</h3>
        <div className="relative pl-6 space-y-4 border-l-2 border-border">
          {[
            ["Mar 5", "Lab report uploaded — CBC", "accent"],
            ["Mar 5", "Prescription issued by Dr. Khan", "primary"],
            ["Mar 5", "Consultation completed", "primary"],
            ["Feb 28", "Appointment booked", "muted"],
          ].map(([d, t, c], i) => (
            <div key={i} className="relative">
              <div className={`absolute -left-[29px] top-1 h-3 w-3 rounded-full ${c === "accent" ? "bg-accent" : c === "primary" ? "bg-primary" : "bg-muted-foreground"} shadow-glow`} />
              <div className="text-xs text-muted-foreground">{d}</div>
              <div className="text-sm font-medium">{t}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </AppShell>
  );
}
