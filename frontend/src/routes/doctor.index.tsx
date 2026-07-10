import { createFileRoute, Link } from "@tanstack/react-router";
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

export const Route = createFileRoute("/doctor/")({
  head: () => ({ meta: [{ title: "Doctor — MediCore" }] }),
  component: DoctorScreen,
});

const weekData = [
  { day: "Mon", apps: 8, completed: 7 }, { day: "Tue", apps: 12, completed: 11 },
  { day: "Wed", apps: 10, completed: 9 }, { day: "Thu", apps: 14, completed: 13 },
  { day: "Fri", apps: 9, completed: 8 }, { day: "Sat", apps: 6, completed: 6 }, { day: "Sun", apps: 4, completed: 3 },
];
const recoveryData = [
  { week: "W1", score: 55 }, { week: "W2", score: 62 }, { week: "W3", score: 68 },
  { week: "W4", score: 74 }, { week: "W5", score: 80 }, { week: "W6", score: 85 },
];

interface ApiAppt { id: number; appointmentCode: string; patient: string; patientId: string; date: string; time: string; reason: string; type: string; status: string; }
interface ApiPatient { id: number; name: string; patientCode: string; age: number; bloodGroup: string; condition: string; vitals: { bp: string; pulse: number }[]; }
interface ApiNotif { id: number; type: string; title: string; body: string; time: string; }

// DoctorScreen — main dashboard with slideshow, charts, today's queue, quick actions.
function DoctorScreen() {
  const { data: rawAppts } = useApi(() => appointmentAPI.getAll());
  const { data: rawPatients } = useApi(() => patientAPI.getAll());
  const { data: rawNotifs } = useApi(() => notificationAPI.getAll());

  const appointments = (rawAppts as unknown as ApiAppt[]) ?? [];
  const patients = (rawPatients as unknown as ApiPatient[]) ?? [];
  const notifications = (rawNotifs as unknown as ApiNotif[]) ?? [];

  const spotlightPatient = patients[0] ?? null;

  return (
    <AppShell role="doctor" title="Doctor" nav={doctorNav}>
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold tracking-tight"
          >
            Good morning, <span className="text-gradient">Doctor</span> 👋
          </motion.h1>
          <p className="text-muted-foreground mt-1">You have {appointments.length} appointment{appointments.length !== 1 ? "s" : ""} scheduled.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline"><Link to="/doctor/prescriptions"><Pill className="h-4 w-4 mr-2"/>New Rx</Link></Button>
          <Button asChild className="bg-gradient-primary text-white shadow-glow"><Link to="/doctor/appointments"><Calendar className="h-4 w-4 mr-2"/>Book Appt</Link></Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Appointments" value={String(appointments.length)} change={`${appointments.filter(a => a.status === "Pending").length} pending`} icon={Calendar} delay={0} />
        <StatCard label="Active Patients" value={String(patients.length)} change="Registered" icon={Users} delay={0.05} />
        <StatCard label="Completed" value={String(appointments.filter(a => a.status === "Completed").length)} change="Appointments" icon={Pill} delay={0.1} />
        <StatCard label="Notifications" value={String(notifications.length)} change="Recent" icon={FileText} delay={0.15} />
      </div>

      {/* Slideshow + Quick actions */}
      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}} className="lg:col-span-2">
          <Slideshow slides={doctorSlides} />
        </motion.div>

        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.25}} className="bg-gradient-card border border-border rounded-2xl p-5 shadow-card space-y-3">
          <h3 className="font-semibold flex items-center gap-2"><Activity className="h-4 w-4 text-primary"/>Quick Actions</h3>
          {[
            { label: "Today's queue", to: "/doctor/appointments", icon: Calendar, c: "bg-blue-500" },
            { label: "View all patients", to: "/doctor/patients", icon: Users, c: "bg-emerald-500" },
            { label: "Issue prescription", to: "/doctor/prescriptions", icon: Pill, c: "bg-rose-500" },
            { label: "Apply for leave", to: "/doctor/leave", icon: AlertCircle, c: "bg-amber-500" },
            { label: "Set availability", to: "/doctor/schedule", icon: Clock, c: "bg-violet-500" },
          ].map((a, i) => (
            <motion.div key={a.label} initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} transition={{delay:0.3+i*0.05}}>
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
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3}} className="bg-gradient-card border border-border rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary"/>Weekly Activity</h3>
              <p className="text-xs text-muted-foreground">Appointments scheduled vs completed</p>
            </div>
            <Badge variant="secondary">+12%</Badge>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2}/>
              <XAxis dataKey="day" fontSize={11}/>
              <YAxis fontSize={11}/>
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }}/>
              <Bar dataKey="apps" fill="oklch(0.6 0.2 250)" radius={[6,6,0,0]} />
              <Bar dataKey="completed" fill="oklch(0.65 0.18 165)" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.35}} className="bg-gradient-card border border-border rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold flex items-center gap-2"><Heart className="h-4 w-4 text-destructive"/>Patient Recovery Trend</h3>
              <p className="text-xs text-muted-foreground">Avg recovery score across cohort</p>
            </div>
            <Badge className="bg-accent text-accent-foreground">+30 pts</Badge>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={recoveryData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2}/>
              <XAxis dataKey="week" fontSize={11}/>
              <YAxis fontSize={11} domain={[40, 100]}/>
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }}/>
              <Line type="monotone" dataKey="score" stroke="oklch(0.6 0.23 25)" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }}/>
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Today schedule + spotlight patient */}
      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.4}} className="lg:col-span-2 bg-gradient-card border border-border rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold flex items-center gap-2"><Calendar className="h-4 w-4 text-primary"/>Appointment Queue</h3>
              <p className="text-xs text-muted-foreground">{appointments.length} appointments • {appointments.filter(a => a.status === "Completed").length} completed</p>
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
                <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm shadow-glow">
                  {a.patient?.[0] ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <Link to="/doctor/patients/$id" params={{ id: String(a.patientId) }} className="font-medium truncate hover:text-primary transition-colors block">{a.patient}</Link>
                  <div className="text-xs text-muted-foreground truncate">{a.reason} • {a.type}</div>
                </div>
                <Badge
                  variant={a.status === "Completed" ? "secondary" : a.status === "Pending" ? "outline" : "default"}
                  className={a.status === "Confirmed" ? "bg-accent text-accent-foreground" : a.status === "Completed" ? "bg-emerald-100 text-emerald-700" : ""}
                >
                  {a.status === "Completed" && <CheckCircle2 className="h-3 w-3 mr-1"/>}
                  {a.status}
                </Badge>
              </motion.div>
            ))}
            {appointments.length === 0 && <div className="text-center py-8 text-muted-foreground text-sm">No appointments loaded yet.</div>}
          </div>
        </motion.div>

        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.45}} className="bg-gradient-card border border-border rounded-2xl p-6 shadow-card">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Stethoscope className="h-4 w-4 text-primary"/>Spotlight Patient</h3>
          {spotlightPatient ? (
            <>
              <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                <div className="h-14 w-14 rounded-2xl bg-gradient-red text-white flex items-center justify-center font-bold text-lg shadow-glow-red">
                  {spotlightPatient.name[0]}
                </div>
                <div>
                  <div className="font-semibold">{spotlightPatient.name}</div>
                  <div className="text-xs text-muted-foreground">{spotlightPatient.patientCode} • {spotlightPatient.age}y • {spotlightPatient.bloodGroup}</div>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-xs uppercase text-muted-foreground tracking-wider mb-1">Condition</div>
                  <div>{spotlightPatient.condition || "—"}</div>
                </div>
                <div>
                  <div className="text-xs uppercase text-muted-foreground tracking-wider mb-1.5">Recovery Progress</div>
                  <Progress value={68} className="h-2"/>
                  <div className="text-xs mt-1 text-muted-foreground">68% — on track</div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="rounded-lg bg-blue-50 p-2 text-center">
                    <div className="text-xs text-blue-700">BP</div>
                    <div className="font-bold text-blue-900">{spotlightPatient.vitals?.[0]?.bp ?? "—"}</div>
                  </div>
                  <div className="rounded-lg bg-rose-50 p-2 text-center">
                    <div className="text-xs text-rose-700">Pulse</div>
                    <div className="font-bold text-rose-900">{spotlightPatient.vitals?.[0]?.pulse ?? "—"}</div>
                  </div>
                </div>
                <Button asChild variant="outline" className="w-full mt-2">
                  <Link to="/doctor/patients/$id" params={{ id: String(spotlightPatient.id) }}>
                    <Stethoscope className="h-4 w-4 mr-2"/>Open Full EMR
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
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.5}} className="mt-6 bg-gradient-card border border-border rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Recent Activity</h3>
          <Button asChild variant="ghost" size="sm"><Link to="/doctor/notifications">See all →</Link></Button>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {notifications.slice(0,3).map((n, i) => (
            <motion.div
              key={n.id}
              initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.5+i*0.05}}
              whileHover={{y: -4}}
              className="rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-[10px] uppercase">{n.type}</Badge>
                <span className="text-xs text-muted-foreground">{n.time}</span>
              </div>
              <div className="font-medium text-sm">{n.title}</div>
              <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.body}</div>
            </motion.div>
          ))}
          {notifications.length === 0 && <div className="col-span-full text-center text-sm text-muted-foreground py-6">No recent notifications.</div>}
        </div>
      </motion.div>
    </AppShell>
  );
}
