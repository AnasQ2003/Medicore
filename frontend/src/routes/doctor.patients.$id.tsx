import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { doctorNav } from "@/lib/doctorNav";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Phone, Mail, MapPin, Calendar, Pill, FileText, Activity, AlertTriangle, Download, Heart, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Area, AreaChart } from "recharts";
import { patientAPI } from "@/lib/api/client";
import useApi from "@/hooks/useApi";

export const Route = createFileRoute("/doctor/patients/$id")({
  head: () => ({ meta: [{ title: "Patient EMR — Doctor" }] }),
  component: PatientDetailScreen,
});

interface Vital { id: number; recordedAt: string; bp: string; pulse: number; temp: number; spo2: number; }
interface ApiPatient {
  id: number; patientCode: string; name: string; age: number; gender: string;
  bloodGroup: string; phone: string; email: string; address?: string;
  condition?: string; allergies?: string; chronic?: string;
  vitals: Vital[];
  prescriptions: { id: string; items: string; status: string; date: string; }[];
  appointments: { appointmentCode: string; date: string; time: string; reason: string; status: string; }[];
}

function PatientDetailScreen() {
  const { id } = useParams({ from: "/doctor/patients/$id" });
  const { data: rawPatient, loading, error } = useApi(() => patientAPI.getById(id), [id]);
  const p = rawPatient as unknown as ApiPatient | null;

  if (loading) {
    return (
      <AppShell role="doctor" title="Doctor" nav={doctorNav}>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  if (error || !p) {
    return (
      <AppShell role="doctor" title="Doctor" nav={doctorNav}>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold">Patient not found</h2>
          <p className="text-muted-foreground mt-2">{error}</p>
          <Button asChild className="mt-4"><Link to="/doctor/patients">Back to Patients</Link></Button>
        </div>
      </AppShell>
    );
  }

  const allergyList = (p.allergies ?? "").split(",").map((a) => a.trim()).filter(Boolean);
  const chronicList = (p.chronic ?? "").split(",").map((c) => c.trim()).filter(Boolean);

  const vitalsChart = [...(p.vitals ?? [])].reverse().map((v) => ({
    date: new Date(v.recordedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    pulse: v.pulse,
    spo2: v.spo2,
    systolic: parseInt(v.bp?.split("/")[0] ?? "0"),
  }));

  const latest = p.vitals?.[0] ?? null;

  return (
    <AppShell role="doctor" title="Doctor" nav={doctorNav}>
      <Button asChild variant="ghost" className="mb-4"><Link to="/doctor/patients"><ArrowLeft className="h-4 w-4 mr-2" />Back to patients</Link></Button>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-primary text-white p-6 mb-6 shadow-elevated">
        <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-5">
          <div className="h-20 w-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-bold border-2 border-white/30">
            {p.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold">{p.name}</h1>
            <div className="text-white/80 text-sm mt-1">
              {p.patientCode} • {p.age ?? "—"} years • {p.gender ?? "—"} • Blood {p.bloodGroup ?? "—"}
            </div>
            <div className="flex flex-wrap gap-3 mt-3 text-xs">
              {p.phone && <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{p.phone}</span>}
              {p.email && <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" />{p.email}</span>}
              {p.address && <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{p.address}</span>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="bg-white text-primary hover:bg-white/90"><Calendar className="h-4 w-4 mr-2" />Book</Button>
            <Button className="bg-white/20 backdrop-blur-md hover:bg-white/30 border border-white/30"><Pill className="h-4 w-4 mr-2" />Rx</Button>
          </div>
        </div>
      </motion.div>

      {/* Vitals cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "BP", value: latest?.bp ?? "—", icon: Heart, c: "from-rose-500 to-pink-600" },
          { label: "Pulse", value: latest ? `${latest.pulse} bpm` : "—", icon: Activity, c: "from-blue-500 to-cyan-500" },
          { label: "Temp", value: latest ? `${latest.temp}°C` : "—", icon: Activity, c: "from-amber-500 to-orange-500" },
          { label: "SpO2", value: latest ? `${latest.spo2}%` : "—", icon: Activity, c: "from-emerald-500 to-teal-500" },
        ].map((v, i) => (
          <motion.div key={v.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4 }}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${v.c} text-white p-5 shadow-elevated`}>
            <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/20 blur-2xl" />
            <v.icon className="h-5 w-5 opacity-80" />
            <div className="text-2xl md:text-3xl font-bold mt-3">{v.value}</div>
            <div className="text-xs uppercase tracking-wider opacity-90 mt-1">{v.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-card border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Appointments</TabsTrigger>
          <TabsTrigger value="vitals">Vitals Trend</TabsTrigger>
          <TabsTrigger value="meds">Prescriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="grid lg:grid-cols-2 gap-4">
          <div className="bg-gradient-card border rounded-2xl p-5 shadow-card">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" />Allergies</h3>
            <div className="flex flex-wrap gap-2">
              {allergyList.length === 0 || allergyList[0] === "None known" ? (
                <Badge variant="secondary">None known</Badge>
              ) : allergyList.map((a) => <Badge key={a} className="bg-rose-100 text-rose-700">{a}</Badge>)}
            </div>
          </div>
          <div className="bg-gradient-card border rounded-2xl p-5 shadow-card">
            <h3 className="font-semibold mb-3">Chronic conditions</h3>
            <div className="space-y-1.5">
              {chronicList.length === 0 ? <span className="text-sm text-muted-foreground">None</span>
                : chronicList.map((c) => <div key={c} className="text-sm">• {c}</div>)}
            </div>
          </div>
          <div className="lg:col-span-2 bg-gradient-card border rounded-2xl p-5 shadow-card">
            <h3 className="font-semibold mb-3">Current condition summary</h3>
            <p className="text-sm leading-relaxed">{p.condition || "No condition notes on file."}</p>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-3">
          {(!p.appointments || p.appointments.length === 0) ? (
            <div className="text-center py-12 text-muted-foreground">No prior appointments</div>
          ) : p.appointments.map((a, i) => (
            <motion.div key={a.appointmentCode} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white border rounded-2xl p-5 shadow-card relative pl-12">
              <div className="absolute left-5 top-5 h-3 w-3 rounded-full bg-gradient-primary ring-4 ring-primary/20" />
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold">{a.reason}</div>
                <Badge variant="outline">{a.date}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{a.time}</span>
                <Badge className={
                  a.status === "Completed" ? "bg-emerald-100 text-emerald-700" :
                  a.status === "Confirmed" ? "bg-accent text-accent-foreground" : ""
                }>{a.status}</Badge>
              </div>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="vitals">
          <div className="bg-gradient-card border rounded-2xl p-5 shadow-card">
            <h3 className="font-semibold mb-4">Vitals over time</h3>
            {vitalsChart.length < 2 ? (
              <div className="text-center py-8 text-muted-foreground">Not enough vitals data to chart.</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={vitalsChart}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.6 0.23 25)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="oklch(0.6 0.23 25)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Area type="monotone" dataKey="systolic" stroke="oklch(0.6 0.23 25)" fill="url(#g1)" strokeWidth={2} />
                  <Line type="monotone" dataKey="pulse" stroke="oklch(0.55 0.2 250)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </TabsContent>

        <TabsContent value="meds" className="space-y-3">
          {(!p.prescriptions || p.prescriptions.length === 0) ? (
            <div className="text-center py-12 text-muted-foreground">No active prescriptions</div>
          ) : p.prescriptions.map((rx, i) => (
            <motion.div key={rx.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="flex items-start gap-4 bg-white border rounded-2xl p-4 shadow-card">
              <div className="h-12 w-12 rounded-xl bg-gradient-red text-white flex items-center justify-center shadow-glow-red flex-shrink-0"><Pill className="h-5 w-5" /></div>
              <div className="flex-1">
                <div className="font-semibold">{rx.id}</div>
                <div className="text-sm text-muted-foreground mt-0.5 whitespace-pre-line">{rx.items}</div>
                <div className="text-xs text-muted-foreground mt-1">{rx.date}</div>
              </div>
              <Badge className={rx.status === "Issued" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
                {rx.status}
              </Badge>
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
