import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { Calendar, Users, Pill, FileText, Activity, TrendingUp, Heart, Clock, Stethoscope, AlertCircle, CheckCircle2, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { Slideshow } from "@/components/Slideshow";
import { motion, AnimatePresence } from "framer-motion";
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

const APPT_OVERRIDES_KEY = "medicore_doctor_appointments_overrides";

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
  { id: 101, appointmentCode: "APT-101", patient: "Ahmed Ali", patientId: "1042", date: new Date().toISOString(), time: "08:30", reason: "Hypertension Follow-up", type: "Routine", status: "Completed" },
  { id: 102, appointmentCode: "APT-102", patient: "Fatima Noor", patientId: "1043", date: new Date().toISOString(), time: "09:00", reason: "Chest Pain Assessment", type: "Urgent", status: "In Consultation" },
  { id: 103, appointmentCode: "APT-103", patient: "Hassan Raza", patientId: "1044", date: new Date().toISOString(), time: "09:30", reason: "Post-Op Cardiac Review", type: "Follow-up", status: "Pending" },
  { id: 104, appointmentCode: "APT-104", patient: "Bilal Khan", patientId: "1046", date: new Date().toISOString(), time: "10:00", reason: "ECG Evaluation", type: "Diagnostic", status: "Confirmed" },
  { id: 105, appointmentCode: "APT-105", patient: "Ayesha Tariq", patientId: "1045", date: new Date().toISOString(), time: "10:30", reason: "CBC Result Review", type: "Lab Review", status: "Pending" },
  { id: 106, appointmentCode: "APT-106", patient: "Sara Malik", patientId: "1049", date: new Date().toISOString(), time: "11:00", reason: "General Wellness Check", type: "General", status: "Pending" },
];

const MOCK_ACTIVITY: ApiNotif[] = [
  { id: 1, type: "Consultation", title: "Session Completed — Ahmed Ali", body: "Follow-up for hypertension management. BP controlled. Medication adjusted.", time: "08:45 AM" },
  { id: 2, type: "Prescription", title: "Rx Issued — Fatima Noor", body: "Amlodipine 5mg OD & Atorvastatin 10mg HS prescribed after ECG review.", time: "09:10 AM" },
  { id: 3, type: "Lab", title: "Lipid Panel Result Reviewed", body: "Total Cholesterol 210 mg/dL. LDL within borderline range. Statin titration recommended.", time: "09:40 AM" },
  { id: 4, type: "Referral", title: "Cardiology Referral Sent", body: "Hassan Raza referred for echocardiogram and stress test at Cardio Unit.", time: "10:05 AM" },
  { id: 5, type: "Vital", title: "Urgent Vitals Alert — Bilal Khan", body: "SpO2 dropped to 91%. Patient moved to observation. Oxygen therapy initiated.", time: "10:20 AM" },
  { id: 6, type: "Report", title: "Holter Monitor Report Filed", body: "24h ECG analysis complete. Rare PVCs noted. No significant arrhythmia detected.", time: "11:00 AM" },
];

// Patient spotlight data aligned with appointment queue patients
const SPOTLIGHT_PATIENTS = [
  { id: "1043", name: "Fatima Noor", patientCode: "P-1043", age: 28, gender: "Female", bloodGroup: "A+", condition: "Chest Pain Assessment / Anxiety with Palpitations", bp: "115/75", pulse: 96, progress: 72, urgency: "Urgent" },
  { id: "1044", name: "Hassan Raza", patientCode: "P-1044", age: 66, gender: "Male", bloodGroup: "O-", condition: "Post-Op Cardiac Review — 3 Month CABG Follow-up", bp: "146/96", pulse: 88, progress: 55, urgency: "Follow-up" },
  { id: "1046", name: "Bilal Khan", patientCode: "P-1046", age: 45, gender: "Male", bloodGroup: "O+", condition: "ECG Evaluation — Chest Discomfort Query", bp: "118/76", pulse: 70, progress: 80, urgency: "Diagnostic" },
  { id: "1045", name: "Ayesha Tariq", patientCode: "P-1045", age: 35, gender: "Female", bloodGroup: "AB+", condition: "CBC Result Review — Gestational Diabetes Follow-up", bp: "120/78", pulse: 74, progress: 88, urgency: "Lab Review" },
  { id: "1049", name: "Sara Malik", patientCode: "P-1049", age: 41, gender: "Female", bloodGroup: "O+", condition: "General Wellness Check — Migraine Review", bp: "116/74", pulse: 68, progress: 91, urgency: "General" },
  { id: "1042", name: "Ahmed Ali", patientCode: "P-1042", age: 54, gender: "Male", bloodGroup: "B+", condition: "Hypertension Follow-up — BP Controlled", bp: "138/92", pulse: 82, progress: 94, urgency: "Completed" },
];

function DoctorScreen() {
  const currentUser = getUser();
  const navigate = useNavigate();
  const doctorDisplayName = currentUser?.name ? (currentUser.name.toLowerCase().startsWith("dr.") ? currentUser.name : `Dr. ${currentUser.name}`) : "Dr. Sarah Ali";
  const [activityRange, setActivityRange] = useState<"week" | "month" | "year">("week");
  const [recoveryCohort, setRecoveryCohort] = useState<"cardio" | "ortho" | "general">("cardio");
  const [spotlightIdx, setSpotlightIdx] = useState(0);

  const { data: rawAppts } = useApi(() => appointmentAPI.getAll());
  const { data: rawPatients } = useApi(() => patientAPI.getAll());
  const { data: rawNotifs } = useApi(() => notificationAPI.getAll());

  // Read persistent appointment overrides from localStorage (set in doctor.appointments.tsx)
  const [overrides, setOverrides] = useState<Record<string, { status?: string; time?: string }>>({});
  const loadOverrides = useCallback(() => {
    try {
      const saved = localStorage.getItem(APPT_OVERRIDES_KEY);
      if (saved) setOverrides(JSON.parse(saved));
    } catch {}
  }, []);
  useEffect(() => {
    loadOverrides();
    window.addEventListener("storage", loadOverrides);
    window.addEventListener("medicore_appt_updated", loadOverrides);
    return () => {
      window.removeEventListener("storage", loadOverrides);
      window.removeEventListener("medicore_appt_updated", loadOverrides);
    };
  }, [loadOverrides]);

  const rawList: ApiAppt[] = ((rawAppts as unknown as ApiAppt[]) ?? []).length > 0
    ? (rawAppts as unknown as ApiAppt[])
    : MOCK_QUEUE;

  // Apply persistent overrides on top of raw list
  const appointments: ApiAppt[] = rawList.map(a => {
    const ov = overrides[a.id];
    return ov ? { ...a, status: ov.status ?? a.status, time: ov.time ?? a.time } : a;
  });

  const notifications: ApiNotif[] = ((rawNotifs as unknown as ApiNotif[]) ?? []).length > 0
    ? (rawNotifs as unknown as ApiNotif[])
    : MOCK_ACTIVITY;

  // Queue = only non-completed, non-cancelled (ongoing + upcoming)
  const activeQueue = appointments.filter(a => a.status !== "Completed" && a.status !== "Cancelled");
  // Sort: In Consultation first, then Confirmed, then Pending/Delayed
  const sortedQueue = [
    ...activeQueue.filter(a => a.status === "In Consultation"),
    ...activeQueue.filter(a => a.status === "Confirmed"),
    ...activeQueue.filter(a => a.status === "Pending"),
    ...activeQueue.filter(a => a.status === "Delayed"),
  ];

  const completedCount = appointments.filter(a => a.status === "Completed").length;
  const totalCount = appointments.length;

  const activeActivityData = graphDataSets[activityRange];
  const activeRecoveryData = recoveryCohortSets[recoveryCohort];

  // Spotlight auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      setSpotlightIdx(i => (i + 1) % SPOTLIGHT_PATIENTS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const spotlightPatient = SPOTLIGHT_PATIENTS[spotlightIdx];

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
          <p className="text-muted-foreground mt-1">You have {sortedQueue.length} active appointment{sortedQueue.length !== 1 ? "s" : ""} in queue today.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline"><Link to="/doctor/prescriptions"><Pill className="h-4 w-4 mr-2" />New Rx</Link></Button>
          <Button asChild className="bg-gradient-primary text-white shadow-glow"><Link to="/doctor/appointments"><Calendar className="h-4 w-4 mr-2" />Schedule Queue</Link></Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="In Queue" value={String(sortedQueue.length)} change="Active & Upcoming" icon={Calendar} delay={0} to="/doctor/appointments" />
        <StatCard label="Completed Today" value={String(completedCount)} change="Consultations done" icon={CheckCircle2} delay={0.05} to="/doctor/appointments" />
        <StatCard label="In Consultation" value={String(appointments.filter(a => a.status === "In Consultation").length)} change="Currently active" icon={Stethoscope} delay={0.1} to="/doctor/appointments" />
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
            { label: "My charges & earnings", to: "/doctor/charges", icon: Activity, c: "bg-teal-500" },
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

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        {/* Chart 1: Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gradient-card border border-border rounded-2xl p-5 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="font-semibold flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />Consultation Activity</h3>
              <p className="text-xs text-muted-foreground">Scheduled appointments vs completed consultations</p>
            </div>
            <div className="flex gap-1 bg-secondary/60 p-1 rounded-xl border border-border/50 text-xs">
              {(["week", "month", "year"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setActivityRange(r)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all capitalize ${activityRange === r ? "bg-primary text-white shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"}`}
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
                contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", backgroundColor: "var(--popover)", color: "var(--popover-foreground)", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                formatter={(val: any, name: any) => [val, name === "apps" ? "Scheduled" : "Completed"]}
              />
              <Bar dataKey="apps" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Scheduled" />
              <Bar dataKey="completed" fill="#10b981" radius={[6, 6, 0, 0]} name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Chart 2: Recovery Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-gradient-card border border-border rounded-2xl p-5 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="font-semibold flex items-center gap-2"><Heart className="h-4 w-4 text-rose-500" />Patient Recovery Index</h3>
              <p className="text-xs text-muted-foreground">Average recovery progress score across cohort</p>
            </div>
            <div className="flex gap-1 bg-secondary/60 p-1 rounded-xl border border-border/50 text-xs">
              {(["cardio", "ortho", "general"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setRecoveryCohort(c)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all capitalize ${recoveryCohort === c ? "bg-primary text-white shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"}`}
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
                contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", backgroundColor: "var(--popover)", color: "var(--popover-foreground)" }}
                formatter={(val: any, name: any) => [`${val}%`, name === "score" ? "Cohort Score" : "Target"]}
              />
              <Line type="monotone" dataKey="target" stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={2} dot={false} name="Target Benchmark" />
              <Line type="monotone" dataKey="score" stroke="#f43f5e" strokeWidth={3} dot={{ r: 5, fill: "#f43f5e" }} activeDot={{ r: 8 }} name="Cohort Recovery Score" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* TODAY'S QUEUE (active only) + SPOTLIGHT SLIDESHOW */}
      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        {/* Active Queue */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2 bg-gradient-card border border-border rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" />Appointment Queue — Active & Upcoming</h3>
              <p className="text-xs text-muted-foreground">
                {sortedQueue.length} in queue · {completedCount} completed today · Completed patients moved to <Link to="/doctor/appointments" className="text-primary underline">Past tab</Link>
              </p>
            </div>
            <Button asChild variant="ghost" size="sm"><Link to="/doctor/appointments">Full view →</Link></Button>
          </div>
          <div className="space-y-2">
            {sortedQueue.slice(0, 6).map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.04 }} whileHover={{ x: 4, scale: 1.005 }}
                className="flex items-center gap-4 p-3 rounded-xl bg-secondary/40 hover:bg-secondary hover:shadow-md transition-all cursor-pointer"
              >
                <div className="text-sm font-mono font-semibold text-primary w-14">{a.time}</div>
                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-glow shrink-0 ${
                  a.status === "In Consultation" ? "bg-gradient-primary animate-pulse" :
                  a.status === "Confirmed" ? "bg-blue-500" :
                  a.status === "Delayed" ? "bg-orange-500" : "bg-gradient-primary"
                }`}>
                  {a.patient?.[0] ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <Link to="/doctor/patients/$id" params={{ id: String(a.patientId || 1) }} className="font-medium truncate hover:text-primary transition-colors block">{a.patient}</Link>
                  <div className="text-xs text-muted-foreground truncate">{a.reason} <span className="mx-1">•</span> <span className="font-medium">{a.type}</span></div>
                </div>
                <Badge
                  className={`shrink-0 ${
                    a.status === "In Consultation" ? "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300 animate-pulse" :
                    a.status === "Confirmed" ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" :
                    a.status === "Delayed" ? "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 font-bold" :
                    "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                  }`}
                >
                  {a.status}
                </Badge>
              </motion.div>
            ))}
            {sortedQueue.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-emerald-500 opacity-50" />
                <div className="font-semibold">All consultations completed for today!</div>
                <div className="text-xs mt-1">No active or upcoming appointments in queue.</div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Spotlight Patient Slideshow */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="bg-gradient-card border border-border rounded-2xl p-6 shadow-card overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2"><Stethoscope className="h-4 w-4 text-primary" />Patient Spotlight</h3>
            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full" onClick={() => setSpotlightIdx(i => (i - 1 + SPOTLIGHT_PATIENTS.length) % SPOTLIGHT_PATIENTS.length)}>
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <span className="text-xs text-muted-foreground font-mono">{spotlightIdx + 1}/{SPOTLIGHT_PATIENTS.length}</span>
              <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full" onClick={() => setSpotlightIdx(i => (i + 1) % SPOTLIGHT_PATIENTS.length)}>
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={spotlightIdx}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                <div className={`h-14 w-14 rounded-2xl text-white flex items-center justify-center font-bold text-lg shadow-glow shrink-0 ${
                  spotlightPatient.urgency === "Urgent" ? "bg-gradient-to-br from-rose-500 to-red-600" :
                  spotlightPatient.urgency === "Completed" ? "bg-gradient-to-br from-emerald-500 to-teal-600" :
                  "bg-gradient-primary"
                }`}>
                  {spotlightPatient.name[0]}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate">{spotlightPatient.name}</div>
                  <div className="text-xs text-muted-foreground">{spotlightPatient.patientCode} · {spotlightPatient.age}y · {spotlightPatient.bloodGroup}</div>
                  <Badge className={`text-[10px] mt-1 ${
                    spotlightPatient.urgency === "Urgent" ? "bg-rose-100 text-rose-700" :
                    spotlightPatient.urgency === "Completed" ? "bg-emerald-100 text-emerald-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>{spotlightPatient.urgency}</Badge>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-xs uppercase text-muted-foreground tracking-wider mb-1">Condition</div>
                  <div className="font-medium text-foreground text-xs leading-relaxed">{spotlightPatient.condition}</div>
                </div>
                <div>
                  <div className="text-xs uppercase text-muted-foreground tracking-wider mb-1.5 flex items-center justify-between">
                    Recovery Progress <span className="text-primary font-bold">{spotlightPatient.progress}%</span>
                  </div>
                  <Progress value={spotlightPatient.progress} className="h-2" />
                  <div className="text-xs mt-1 text-muted-foreground">{spotlightPatient.progress >= 90 ? "Excellent — ready for discharge" : spotlightPatient.progress >= 70 ? "Good — on track" : "Needs attention"}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-3 text-center">
                    <div className="text-xs font-semibold text-blue-500">BP</div>
                    <div className="font-bold text-base text-blue-400 mt-0.5">{spotlightPatient.bp}</div>
                  </div>
                  <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-center">
                    <div className="text-xs font-semibold text-rose-500">Pulse</div>
                    <div className="font-bold text-base text-rose-400 mt-0.5">{spotlightPatient.pulse} bpm</div>
                  </div>
                </div>
                <Button asChild variant="outline" className="w-full text-xs font-semibold border-border">
                  <Link to="/doctor/patients/$id" params={{ id: spotlightPatient.id }}>
                    <Stethoscope className="h-3.5 w-3.5 mr-2 text-primary" />Open Full EMR
                  </Link>
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots indicator */}
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {SPOTLIGHT_PATIENTS.map((_, i) => (
              <button
                key={i}
                onClick={() => setSpotlightIdx(i)}
                className={`rounded-full transition-all ${i === spotlightIdx ? "w-5 h-2 bg-primary" : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"}`}
              />
            ))}
          </div>
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
                className="rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-primary/40"
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge className={`text-[10px] uppercase ${
                    n.type === "Consultation" ? "border-blue-500/30 text-blue-400 bg-blue-500/10" :
                    n.type === "Prescription" ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" :
                    n.type === "Lab" ? "border-violet-500/30 text-violet-400 bg-violet-500/10" :
                    n.type === "Referral" ? "border-amber-500/30 text-amber-400 bg-amber-500/10" :
                    n.type === "Vital" ? "border-rose-500/30 text-rose-400 bg-rose-500/10" :
                    "border-slate-500/30 text-slate-400 bg-slate-500/10"
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
