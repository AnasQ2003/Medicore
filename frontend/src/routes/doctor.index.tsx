import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Calendar, Users, Pill, FileText, Activity, TrendingUp, Heart, Clock, Stethoscope, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { Slideshow } from "@/components/Slideshow";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { doctorNav } from "@/lib/roleNav";
import { doctorSlides } from "@/lib/mockData";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";
import { appointmentAPI, patientAPI, notificationAPI } from "@/lib/api/client";
import useApi from "@/hooks/useApi";
import { getUser } from "@/lib/auth";

export const Route = createFileRoute("/doctor/")({
  head: () => ({ meta: [{ title: "Doctor — MediCore" }] }),
  component: DoctorScreen,
});

const graphDataSets = {
  week: [
    { label: "Mon", apps: 8, completed: 7 }, { label: "Tue", apps: 12, completed: 11 },
    { label: "Wed", apps: 10, completed: 9 }, { label: "Thu", apps: 14, completed: 13 },
    { label: "Fri", apps: 9, completed: 8 }, { label: "Sat", apps: 6, completed: 6 }, { label: "Sun", apps: 4, completed: 3 },
  ],
  month: [
    { label: "W1", apps: 42, completed: 38 }, { label: "W2", apps: 48, completed: 44 },
    { label: "W3", apps: 52, completed: 49 }, { label: "W4", apps: 46, completed: 43 },
  ],
  year: [
    { label: "Jan", apps: 180, completed: 165 }, { label: "Feb", apps: 195, completed: 182 },
    { label: "Mar", apps: 210, completed: 198 }, { label: "Apr", apps: 205, completed: 194 },
    { label: "May", apps: 230, completed: 218 }, { label: "Jun", apps: 245, completed: 232 },
  ],
};

const recoveryCohortSets = {
  cardio: [
    { week: "W1", score: 55, target: 60 }, { week: "W2", score: 62, target: 65 }, { week: "W3", score: 68, target: 70 },
    { week: "W4", score: 74, target: 75 }, { week: "W5", score: 80, target: 80 }, { week: "W6", score: 88, target: 85 },
  ],
  ortho: [
    { week: "W1", score: 48, target: 50 }, { week: "W2", score: 58, target: 60 }, { week: "W3", score: 65, target: 68 },
    { week: "W4", score: 72, target: 75 }, { week: "W5", score: 79, target: 80 }, { week: "W6", score: 85, target: 85 },
  ],
  general: [
    { week: "W1", score: 60, target: 60 }, { week: "W2", score: 68, target: 70 }, { week: "W3", score: 75, target: 75 },
    { week: "W4", score: 82, target: 80 }, { week: "W5", score: 88, target: 85 }, { week: "W6", score: 92, target: 90 },
  ],
};

interface ApiAppt { id: number; appointmentCode: string; patient: string; patientId: string; date: string; time: string; reason: string; type: string; status: string; }
interface ApiPatient { id: number; name: string; patientCode: string; age: number; bloodGroup: string; condition: string; vitals: { bp: string; pulse: number }[]; }
interface ApiNotif { id: number; type: string; title: string; body: string; time: string; }

const MOCK_QUEUE: ApiAppt[] = [
  { id: 101, appointmentCode: "APT-101", patient: "Ahmed Ali", patientId: "1", date: new Date().toISOString(), time: "08:30", reason: "Hypertension Follow-up", type: "Routine", status: "Completed" },
  { id: 102, appointmentCode: "APT-102", patient: "Fatima Noor", patientId: "2", date: new Date().toISOString(), time: "09:00", reason: "Chest Pain Assessment", type: "Urgent", status: "In Consultation" },
  { id: 103, appointmentCode: "APT-103", patient: "Hassan Raza", patientId: "3", date: new Date().toISOString(), time: "09:30", reason: "Post-Op Cardiac Review", type: "Follow-up", status: "Pending" },
  { id: 104, appointmentCode: "APT-104", patient: "Bilal Khan", patientId: "4", date: new Date().toISOString(), time: "10:00", reason: "ECG Evaluation", type: "Diagnostic", status: "Confirmed" },
  { id: 105, appointmentCode: "APT-105", patient: "Ayesha Tariq", patientId: "5", date: new Date().toISOString(), time: "10:30", reason: "CBC Result Review", type: "Lab Review", status: "Pending" },
  { id: 106, appointmentCode: "APT-106", patient: "Sara Malik", patientId: "6", date: new Date().toISOString(), time: "11:00", reason: "General Wellness Check", type: "General", status: "Pending" },
];

const MOCK_ACTIVITY: ApiNotif[] = [
  { id: 1, type: "Consultation", title: "Session Completed — Ahmed Ali", body: "Follow-up for hypertension management. BP controlled. Medication adjusted.", time: "08:45 AM" },
  { id: 2, type: "Prescription", title: "Rx Issued — Fatima Noor", body: "Amlodipine 5mg OD & Atorvastatin 10mg HS prescribed after ECG review.", time: "09:10 AM" },
  { id: 3, type: "Lab", title: "Lipid Panel Result Reviewed", body: "Total Cholesterol 210 mg/dL. LDL within borderline range. Statin titration recommended.", time: "09:40 AM" },
  { id: 4, type: "Referral", title: "Cardiology Referral Sent", body: "Hassan Raza referred for echocardiogram and stress test at Cardio Unit.", time: "10:05 AM" },
  { id: 5, type: "Vital", title: "Urgent Vitals Alert — Bilal Khan", body: "SpO2 dropped to 91%. Patient moved to observation. Oxygen therapy initiated.", time: "10:20 AM" },
  { id: 6, type: "Report", title: "Holter Monitor Report Filed", body: "24h ECG analysis complete. Rare PVCs noted. No significant arrhythmia detected.", time: "11:00 AM" },
];

// DoctorScreen — main dashboard with slideshow, charts, today's queue, quick actions.
function DoctorScreen() {
  const currentUser = getUser();
  const doctorDisplayName = currentUser?.name ? (currentUser.name.toLowerCase().startsWith("dr.") ? currentUser.name : `Dr. ${currentUser.name}`) : "Dr. Sarah Khan";
  const [activityRange, setActivityRange] = useState<"week" | "month" | "year">("week");
  const [recoveryCohort, setRecoveryCohort] = useState<"cardio" | "ortho" | "general">("cardio");

  const { data: rawAppts } = useApi(() => appointmentAPI.getAll());
  const { data: rawPatients } = useApi(() => patientAPI.getAll());
  const { data: rawNotifs } = useApi(() => notificationAPI.getAll());

  const appointments: ApiAppt[] = ((rawAppts as unknown as ApiAppt[]) ?? []).length > 0
    ? (rawAppts as unknown as ApiAppt[])
    : MOCK_QUEUE;
  const patients = (rawPatients as unknown as ApiPatient[]) ?? [];
  const notifications: ApiNotif[] = ((rawNotifs as unknown as ApiNotif[]) ?? []).length > 0
    ? (rawNotifs as unknown as ApiNotif[])
    : MOCK_ACTIVITY;

  const spotlightPatient = patients[0] ?? {
    id: 1,
    name: "Patient John Doe",
    patientCode: "P-1001",
    age: 30,
    bloodGroup: "O+",
    condition: "Hypertension Routine Follow-up",
    vitals: [{ bp: "120/80", pulse: 72 }]
  };

  const activeActivityData = graphDataSets[activityRange];
  const activeRecoveryData = recoveryCohortSets[recoveryCohort];

  return (
    <AppShell role="doctor" title="Doctor" nav={doctorNav}>
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold tracking-tight"
          >
            Good morning, <span className="text-gradient">{doctorDisplayName}</span>
          </motion.h1>
          <p className="text-muted-foreground mt-1">You have {appointments.length || 8} appointment{appointments.length !== 1 ? "s" : ""} scheduled today.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline"><Link to="/doctor/prescriptions"><Pill className="h-4 w-4 mr-2" />New Rx</Link></Button>
          <Button asChild className="bg-gradient-primary text-white shadow-glow"><Link to="/doctor/appointments"><Calendar className="h-4 w-4 mr-2" />Schedule Queue</Link></Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Appointments" value={String(appointments.length || 8)} change="Scheduled Today" icon={Calendar} delay={0} to="/doctor/appointments" />
        <StatCard label="Active Patients" value={String(patients.length || 5)} change="Under Your Care" icon={Users} delay={0.05} to="/doctor/patients" />
        <StatCard label="Completed" value={String(appointments.filter(a => a.status === "Completed").length || 3)} change="Consultations" icon={Pill} delay={0.1} to="/doctor/appointments" />
        <StatCard label="Notifications" value={String(notifications.length || 4)} change="Unread Alerts" icon={FileText} delay={0.15} to="/doctor/notifications" />
      </div>

      {/* Slideshow + Quick actions */}
      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
          <Slideshow slides={doctorSlides} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-gradient-card border border-border rounded-2xl p-5 shadow-card space-y-3">
          <h3 className="font-semibold flex items-center gap-2"><Activity className="h-4 w-4 text-primary" />Quick Actions</h3>
          {[
            { label: "Today's queue", to: "/doctor/appointments", icon: Calendar, c: "bg-blue-500" },
            { label: "View all patients", to: "/doctor/patients", icon: Users, c: "bg-emerald-500" },
            { label: "Issue prescription", to: "/doctor/prescriptions", icon: Pill, c: "bg-rose-500" },
            { label: "Apply for leave", to: "/doctor/leave", icon: AlertCircle, c: "bg-amber-500" },
            { label: "Set availability", to: "/doctor/schedule", icon: Clock, c: "bg-violet-500" },
          ].map((a, i) => (
            <motion.div key={a.label} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.05 }}>
              <Link to={a.to as any} className="group flex items-center gap-3 p-3 rounded-xl bg-secondary/40 hover:bg-secondary transition-all hover:translate-x-1">
                <div className={`h-9 w-9 rounded-lg ${a.c} flex items-center justify-center text-white shadow-md`}>
                  <a.icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium flex-1">{a.label}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Detailed & Filtered Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        {/* Chart 1: Activity Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gradient-card border border-border rounded-2xl p-5 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="font-semibold flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />Consultation Activity</h3>
              <p className="text-xs text-muted-foreground">Scheduled appointments vs completed consultations</p>
            </div>
            {/* Filter buttons */}
            <div className="flex gap-1 bg-secondary/60 p-1 rounded-xl border border-border/50 text-xs">
              {(["week", "month", "year"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setActivityRange(r)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all capitalize ${activityRange === r
                      ? "bg-white text-primary shadow-sm font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs mb-3 text-muted-foreground">
            <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-blue-500 inline-block" /> Scheduled</div>
            <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-emerald-500 inline-block" /> Completed</div>
          </div>

          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={activeActivityData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="label" fontSize={11} stroke="hsl(var(--muted-foreground))" />
              <YAxis fontSize={11} stroke="hsl(var(--muted-foreground))" label={{ value: "Consultations", angle: -90, position: "insideLeft", fontSize: 10 }} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", backgroundColor: "rgba(255, 255, 255, 0.95)", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                formatter={(val: any, name: any) => [val, name === "apps" ? "Scheduled" : "Completed"]}
              />
              <Bar dataKey="apps" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Scheduled" />
              <Bar dataKey="completed" fill="#10b981" radius={[6, 6, 0, 0]} name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Chart 2: Patient Recovery Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-gradient-card border border-border rounded-2xl p-5 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="font-semibold flex items-center gap-2"><Heart className="h-4 w-4 text-rose-500" />Patient Recovery Index</h3>
              <p className="text-xs text-muted-foreground">Average recovery progress score across cohort</p>
            </div>
            {/* Filter buttons */}
            <div className="flex gap-1 bg-secondary/60 p-1 rounded-xl border border-border/50 text-xs">
              {(["cardio", "ortho", "general"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setRecoveryCohort(c)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all capitalize ${recoveryCohort === c
                      ? "bg-white text-rose-600 shadow-sm font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs mb-3 text-muted-foreground">
            <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-500 inline-block" /> Cohort Score</div>
            <div className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-amber-500 inline-block" /> Target Benchmark</div>
          </div>

          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={activeRecoveryData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="week" fontSize={11} stroke="hsl(var(--muted-foreground))" />
              <YAxis fontSize={11} domain={[40, 100]} stroke="hsl(var(--muted-foreground))" label={{ value: "Score %", angle: -90, position: "insideLeft", fontSize: 10 }} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", backgroundColor: "rgba(255, 255, 255, 0.95)" }}
                formatter={(val: any, name: any) => [`${val}%`, name === "score" ? "Cohort Score" : "Target"]}
              />
              <Line type="monotone" dataKey="target" stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={2} dot={false} name="Target Benchmark" />
              <Line type="monotone" dataKey="score" stroke="#f43f5e" strokeWidth={3} dot={{ r: 5, fill: "#f43f5e" }} activeDot={{ r: 8 }} name="Cohort Recovery Score" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Today schedule + spotlight patient */}
      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2 bg-gradient-card border border-border rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" />Appointment Queue</h3>
              <p className="text-xs text-muted-foreground">{appointments.length || 8} appointments • {appointments.filter(a => a.status === "Completed").length} completed</p>
            </div>
            <Button asChild variant="ghost" size="sm"><Link to="/doctor/appointments">View calendar →</Link></Button>
          </div>
          <div className="space-y-2">
            {appointments.slice(0, 6).map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.04 }} whileHover={{ x: 4, scale: 1.005 }}
                className="flex items-center gap-4 p-3 rounded-xl bg-secondary/40 hover:bg-secondary hover:shadow-md transition-all cursor-pointer"
              >
                <div className="text-sm font-mono font-semibold text-primary w-14">{a.time}</div>
                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-glow shrink-0 ${a.status === "Completed" ? "bg-emerald-500" :
                    a.status === "In Consultation" ? "bg-gradient-primary" :
                      a.status === "Confirmed" ? "bg-blue-500" : "bg-gradient-primary"
                  }`}>
                  {a.patient?.[0] ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <Link to="/doctor/patients/$id" params={{ id: String(a.patientId || 1) }} className="font-medium truncate hover:text-primary transition-colors block">{a.patient}</Link>
                  <div className="text-xs text-muted-foreground truncate">{a.reason} <span className="mx-1">•</span> <span className="font-medium">{a.type}</span></div>
                </div>
                <Badge
                  variant={a.status === "Completed" ? "secondary" : a.status === "Pending" ? "outline" : "default"}
                  className={`shrink-0 ${a.status === "Confirmed" ? "bg-accent text-accent-foreground" :
                      a.status === "Completed" ? "bg-emerald-100 text-emerald-700" :
                        a.status === "In Consultation" ? "bg-blue-100 text-blue-700" : ""
                    }`}
                >
                  {a.status === "Completed" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                  {a.status}
                </Badge>
              </motion.div>
            ))}
            {appointments.length === 0 && <div className="text-center py-8 text-muted-foreground text-sm">No appointments loaded yet.</div>}
          </div>
        </motion.div>

        {/* Spotlight Patient Card with Fixed BP & Pulse */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="bg-gradient-card border border-border rounded-2xl p-6 shadow-card">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Stethoscope className="h-4 w-4 text-primary" />Spotlight Patient</h3>
          {spotlightPatient ? (
            <>
              <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                <div className="h-14 w-14 rounded-2xl bg-gradient-red text-white flex items-center justify-center font-bold text-lg shadow-glow-red">
                  {spotlightPatient.name[0]}
                </div>
                <div>
                  <div className="font-semibold">{spotlightPatient.name}</div>
                  <div className="text-xs text-muted-foreground">{spotlightPatient.patientCode || "P-1001"} • {spotlightPatient.age || 30}y • {spotlightPatient.bloodGroup || "O+"}</div>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-xs uppercase text-muted-foreground tracking-wider mb-1">Condition</div>
                  <div className="font-medium text-foreground">{spotlightPatient.condition || "Hypertension Routine Follow-up"}</div>
                </div>
                <div>
                  <div className="text-xs uppercase text-muted-foreground tracking-wider mb-1.5">Recovery Progress</div>
                  <Progress value={68} className="h-2" />
                  <div className="text-xs mt-1 text-muted-foreground font-medium">68% — on track</div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="rounded-xl bg-blue-50/90 border border-blue-200 p-3 text-center shadow-sm">
                    <div className="text-xs font-semibold text-blue-700">BP</div>
                    <div className="font-bold text-base text-blue-900 mt-0.5">{spotlightPatient.vitals?.[0]?.bp || "120/80"}</div>
                  </div>
                  <div className="rounded-xl bg-rose-50/90 border border-rose-200 p-3 text-center shadow-sm">
                    <div className="text-xs font-semibold text-rose-700">Pulse</div>
                    <div className="font-bold text-base text-rose-900 mt-0.5">{spotlightPatient.vitals?.[0]?.pulse ? spotlightPatient.vitals[0].pulse + " bpm" : "72 bpm"}</div>
                  </div>
                </div>
                <Button asChild variant="outline" className="w-full mt-3 font-semibold bg-white hover:bg-slate-50 border-border">
                  <Link to="/doctor/patients/$id" params={{ id: String(spotlightPatient.id || 1) }}>
                    <Stethoscope className="h-4 w-4 mr-2 text-primary" />Open Full EMR
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground text-sm">No patients on record.</div>
          )}
        </motion.div>
      </div>

      {/* Recent notifications */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-6 bg-gradient-card border border-border rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Recent Activity</h3>
          <Button asChild variant="ghost" size="sm"><Link to="/doctor/notifications">See all →</Link></Button>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {notifications.slice(0, 6).map((n, i) => {
            const targetRoute =
              n.type === "Prescription" ? "/doctor/prescriptions" :
              n.type === "Consultation" ? "/doctor/appointments" :
              n.type === "Lab" || n.type === "Report" ? "/doctor/reports" :
              n.type === "Vital" || n.type === "Referral" ? "/doctor/patients" :
              "/doctor/notifications";

            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.05 }}
                whileHover={{ y: -4 }}
                onClick={() => navigate({ to: targetRoute as any })}
                className="rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-primary/40"
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className={`text-[10px] uppercase ${n.type === "Consultation" ? "border-blue-300 text-blue-700 bg-blue-50" :
                      n.type === "Prescription" ? "border-emerald-300 text-emerald-700 bg-emerald-50" :
                        n.type === "Lab" ? "border-violet-300 text-violet-700 bg-violet-50" :
                          n.type === "Referral" ? "border-amber-300 text-amber-700 bg-amber-50" :
                            n.type === "Vital" ? "border-rose-300 text-rose-700 bg-rose-50" :
                              "border-slate-300 text-slate-700 bg-slate-50"
                    }`}>{n.type}</Badge>
                  <span className="text-xs text-muted-foreground font-mono">{n.time}</span>
                </div>
                <div className="font-medium text-sm group-hover:text-primary transition-colors">{n.title}</div>
                <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.body}</div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </AppShell>
  );
}
