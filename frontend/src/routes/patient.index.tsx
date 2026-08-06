import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Calendar, FileText, Pill, Receipt, Download, Heart, Thermometer, Activity, Droplets, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Clock, MapPin, Star, ChevronRight, UserCheck, Building2, Zap } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { patientNav } from "@/lib/roleNav";
import { appointmentAPI, prescriptionAPI, billAPI } from "@/lib/api/client";
import useApi from "@/hooks/useApi";
import { getUser } from "@/lib/auth";
import { useState, useEffect } from "react";
import { Slideshow } from "@/components/Slideshow";
import { patientSlides } from "@/lib/mockData";
import { RoleRequestModal } from "@/components/RoleRequestModal";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, RadialBarChart, RadialBar } from "recharts";

export const Route = createFileRoute("/patient/")({
  head: () => ({ meta: [{ title: "Patient Portal — MediCore" }] }),
  component: PatientScreen,
});

interface Appointment { id: number; appointmentCode: string; date: string; time: string; doctor: string; reason: string; type: string; status: string; }
interface Prescription { id: string; items: string; status: string; date: string; patient: string; }
interface Bill { id: string; billCode: string; amount: number; description: string; status: string; createdAt: string; }

const statusColors: Record<string, string> = {
  Confirmed: "bg-blue-100 text-blue-800",
  Pending: "bg-amber-100 text-amber-800",
  Completed: "bg-emerald-100 text-emerald-800",
  Cancelled: "bg-rose-100 text-rose-800",
};

// Mock health vitals trend data
const vitalsTrend = [
  { day: "Mon", bp: 118, hr: 72, o2: 98 },
  { day: "Tue", bp: 122, hr: 75, o2: 97 },
  { day: "Wed", bp: 120, hr: 70, o2: 99 },
  { day: "Thu", bp: 125, hr: 78, o2: 98 },
  { day: "Fri", bp: 119, hr: 71, o2: 98 },
  { day: "Sat", bp: 116, hr: 68, o2: 99 },
  { day: "Sun", bp: 121, hr: 73, o2: 97 },
];

const healthScoreData = [{ name: "Health Score", value: 82, fill: "#10b981" }];

const MOCK_MEDICATIONS = [
  { name: "Amlodipine 5mg", time: "08:00 AM", taken: true, type: "Heart" },
  { name: "Atorvastatin 10mg", time: "10:00 PM", taken: false, type: "Lipids" },
  { name: "Metformin 500mg", time: "02:00 PM", taken: true, type: "Diabetes" },
  { name: "Aspirin 75mg", time: "07:00 AM", taken: true, type: "Blood Thinner" },
];

const MOCK_REMINDERS = [
  { text: "Blood Pressure check at Cardiology Unit", time: "Tomorrow 10:30 AM", urgent: true },
  { text: "HbA1c Lab Test — Fasting Required", time: "Thursday 08:00 AM", urgent: false },
  { text: "Follow-up with Dr. Sarah Khan", time: "Next Monday 2:00 PM", urgent: false },
  { text: "Annual Eye Screening", time: "2026-08-20", urgent: false },
];

const MOCK_HEALTH_GOALS = [
  { label: "Daily Steps Goal (10,000)", value: 73 },
  { label: "Hydration Target (2.5L)", value: 60 },
  { label: "Medication Adherence", value: 94 },
  { label: "Sleep Goal (8 hrs)", value: 81 },
];

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

  // Doctor-sent reminders from localStorage (updated in real-time)
  const [doctorReminders, setDoctorReminders] = useState<{ id: string; title: string; body: string; time: string; urgent: boolean }[]>([]);

  const loadDoctorReminders = () => {
    const email = currentUser?.email || "patient@medicore.app";
    const notifKey = `medicore_user_notifications_${email}`;
    try {
      const raw = localStorage.getItem(notifKey);
      if (raw) {
        const all = JSON.parse(raw);
        const reminders = all.filter((n: any) => n.type === "reminder");
        setDoctorReminders(reminders);
      }
    } catch {}
  };

  useEffect(() => {
    loadDoctorReminders();
    const handleStorage = () => loadDoctorReminders();
    window.addEventListener("storage", handleStorage);
    window.addEventListener("medicore_user_updated", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("medicore_user_updated", handleStorage);
    };
  }, [currentUser?.email]);


  return (
    <AppShell role="patient" title="Patient Portal" nav={patientNav}>
      <div className="space-y-6 max-w-7xl mx-auto">

        {/* Hero Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Patient Health Portal</p>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, <span className="text-gradient">{patientName}</span> 👋
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} · Your health is our priority
            </p>
          </div>
          <Button
            onClick={() => setRequestModalOpen(true)}
            className="bg-gradient-sunset text-white shadow-glow font-semibold self-start"
          >
            <UserCheck className="h-4 w-4 mr-2" /> Request Care Assistance
          </Button>
        </div>

        {/* Hero Slideshow */}
        <Slideshow slides={patientSlides} />

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Next Appointment" value={nextAppt ? nextAppt.date : "None"} change={nextAppt ? nextAppt.doctor : "No upcoming"} icon={Calendar} delay={0} to="/patient/appointments" />
          <StatCard label="Active Prescriptions" value={String(activeRx.length)} change="Currently active Rx" icon={Pill} delay={0.05} to="/patient/prescriptions" />
          <StatCard label="Total Appointments" value={String(appointments.length)} change={`${upcoming.length} upcoming`} icon={FileText} delay={0.1} to="/patient/appointments" />
          <StatCard label="Outstanding Balance" value={totalOwed > 0 ? `PKR ${totalOwed.toLocaleString()}` : "All Clear"} change={`${unpaidBills.length} unpaid bills`} icon={Receipt} delay={0.15} to="/patient/bills" />
        </div>

        {/* Vitals Trend + Health Score */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* BP/HR Trend Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-gradient-card border border-border rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">7-Day Vitals Trend</h3>
                <p className="text-xs text-muted-foreground">Blood Pressure & Heart Rate monitoring</p>
              </div>
              <Badge className="bg-emerald-100 text-emerald-800 text-xs">✓ Normal Range</Badge>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={vitalsTrend} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="bpGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[60, 135]} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="bp" name="BP (mmHg)" stroke="#3b82f6" fill="url(#bpGrad)" strokeWidth={2} dot={{ r: 3 }} />
                <Area type="monotone" dataKey="hr" name="HR (bpm)" stroke="#ef4444" fill="url(#hrGrad)" strokeWidth={2} dot={{ r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="h-2 w-4 rounded bg-blue-500 inline-block" /> Blood Pressure</span>
              <span className="flex items-center gap-1"><span className="h-2 w-4 rounded bg-red-500 inline-block" /> Heart Rate</span>
            </div>
          </motion.div>

          {/* Health Score Gauge */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-gradient-card border border-border rounded-2xl p-6 shadow-card flex flex-col items-center justify-between">
            <h3 className="font-semibold w-full mb-3">Overall Health Score</h3>
            <div className="relative">
              <ResponsiveContainer width={160} height={160}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="85%" data={healthScoreData} startAngle={225} endAngle={-45}>
                  <RadialBar background={{ fill: "#1e293b" }} dataKey="value" cornerRadius={8} fill="#10b981" />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-emerald-500">82</span>
                <span className="text-xs text-muted-foreground">/ 100</span>
              </div>
            </div>
            <div className="text-center mt-2">
              <p className="text-sm font-semibold text-emerald-500">Good Health</p>
              <p className="text-xs text-muted-foreground mt-1">Maintaining consistent vitals. Keep up the daily medication schedule.</p>
            </div>

            {/* Quick vitals row */}
            <div className="grid grid-cols-3 gap-2 w-full mt-4 pt-3 border-t border-border">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">BP</p>
                <p className="font-bold text-sm text-blue-500">120/80</p>
              </div>
              <div className="text-center border-x border-border">
                <p className="text-xs text-muted-foreground">HR</p>
                <p className="font-bold text-sm text-red-500">72 bpm</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">SpO2</p>
                <p className="font-bold text-sm text-emerald-500">98%</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Medication Schedule + Upcoming Appointments */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Today's Medication Schedule */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-gradient-card border border-border rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Pill className="h-4 w-4 text-primary" /> Today's Medication Plan
              </h3>
              <Button size="sm" variant="ghost" className="text-xs" onClick={() => navigate({ to: "/patient/prescriptions" as any })}>View Rx →</Button>
            </div>
            <div className="space-y-3">
              {MOCK_MEDICATIONS.map((med, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40 border border-border/50">
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${med.taken ? "bg-emerald-500/15" : "bg-amber-500/15"}`}>
                    {med.taken
                      ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      : <Clock className="h-4 w-4 text-amber-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{med.name}</p>
                    <p className="text-xs text-muted-foreground">{med.time} · {med.type}</p>
                  </div>
                  <Badge className={med.taken ? "bg-emerald-100 text-emerald-800 text-[10px]" : "bg-amber-100 text-amber-800 text-[10px]"}>
                    {med.taken ? "Taken" : "Pending"}
                  </Badge>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Upcoming Appointments */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="bg-gradient-card border border-border rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" /> Upcoming Appointments
              </h3>
              <Button size="sm" variant="ghost" className="text-xs" onClick={() => navigate({ to: "/patient/appointments" as any })}>View All →</Button>
            </div>
            <div className="space-y-3">
              {upcoming.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">No upcoming appointments.</div>
              ) : upcoming.slice(0, 4).map((a, i) => (
                <motion.div key={a.id}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.05 }}
                  onClick={() => navigate({ to: "/patient/appointments" as any })}
                  className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40 hover:bg-secondary transition-all cursor-pointer group border border-border/50">
                  <div className="h-10 w-10 rounded-xl bg-gradient-primary flex flex-col items-center justify-center text-white flex-shrink-0 text-xs font-bold">
                    {a.date.split("-")[2] ?? "--"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium group-hover:text-primary transition-colors">{a.doctor ?? "Doctor TBA"}</div>
                    <div className="text-xs text-muted-foreground">{a.reason} · {a.time}</div>
                  </div>
                  <Badge className={statusColors[a.status] ?? ""}>{a.status}</Badge>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Health Goals Progress + Reminders */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Health Goals */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-gradient-card border border-border rounded-2xl p-6 shadow-card">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Daily Health Goals
            </h3>
            <div className="space-y-4">
              {MOCK_HEALTH_GOALS.map((goal, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">{goal.label}</span>
                    <span className={`font-semibold ${goal.value >= 80 ? "text-emerald-500" : "text-amber-500"}`}>{goal.value}%</span>
                  </div>
                  <Progress value={goal.value} className="h-2" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Health Reminders — includes doctor-sent reminders */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="bg-gradient-card border border-border rounded-2xl p-6 shadow-card">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Health Reminders
              {doctorReminders.length > 0 && (
                <span className="ml-auto text-xs bg-rose-500 text-white rounded-full px-2 py-0.5 font-bold">{doctorReminders.length} new</span>
              )}
            </h3>
            <div className="space-y-3">
              {/* Doctor-sent reminders appear first */}
              {doctorReminders.map((r, i) => (
                <div key={r.id} className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 flex gap-3">
                  <div className="h-2 w-2 rounded-full mt-1.5 flex-shrink-0 bg-rose-500 animate-pulse" />
                  <div>
                    <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">{r.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{r.body}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><Clock className="h-3 w-3" />{r.time}</p>
                  </div>
                </div>
              ))}
              {/* Static reminders */}
              {MOCK_REMINDERS.map((r, i) => (
                <div key={i} className={`p-3 rounded-xl border flex gap-3 ${r.urgent ? "border-amber-500/30 bg-amber-500/10" : "border-border/50 bg-secondary/30"}`}>
                  <div className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${r.urgent ? "bg-amber-500 animate-pulse" : "bg-primary"}`} />
                  <div>
                    <p className="text-sm font-medium">{r.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><Clock className="h-3 w-3" />{r.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Billing Summary */}
        {bills.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="bg-gradient-card border border-border rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2"><Receipt className="h-4 w-4 text-primary" /> Billing Summary</h3>
              <Button size="sm" variant="ghost" className="text-xs" onClick={() => navigate({ to: "/patient/bills" as any })}>Manage Bills →</Button>
            </div>
            <div className="divide-y divide-border">
              {bills.slice(0, 5).map((b) => (
                <div key={b.billCode ?? b.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-sm font-medium">{b.description}</div>
                    <div className="text-xs text-muted-foreground">{b.billCode} · {new Date(b.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm">PKR {b.amount?.toLocaleString()}</span>
                    <Badge className={b.status === "Paid" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}>
                      {b.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Hospital Facilities Quick Access */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="bg-gradient-card border border-border rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /> Quick Access — Hospital Services</h3>
            <Button size="sm" variant="ghost" className="text-xs" onClick={() => navigate({ to: "/patient/facilities" as any })}>Browse All →</Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "VIP Suites", icon: Star, color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
              { label: "MRI & CT Scan", icon: Zap, color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
              { label: "Home Doctor Visit", icon: MapPin, color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
              { label: "Lab Reports", icon: Activity, color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => navigate({ to: "/patient/facilities" as any })}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border ${item.color} hover:scale-105 transition-transform cursor-pointer`}>
                <item.icon className="h-6 w-6" />
                <span className="text-xs font-semibold text-center">{item.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        <RoleRequestModal open={requestModalOpen} onOpenChange={setRequestModalOpen} role="patient" defaultCategory="Doctor Change & Care" />
      </div>
    </AppShell>
  );
}
