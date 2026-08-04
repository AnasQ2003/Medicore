import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { nurseNav } from "@/lib/roleNav";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search, HeartPulse, Thermometer, Activity, Droplets, Wind, TrendingUp,
  TrendingDown, Minus, Clock, BedDouble, RefreshCw, AlertCircle, Loader2, Plus
} from "lucide-react";
import { patientAPI } from "@/lib/api/client";
import useApi from "@/hooks/useApi";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/nurse/vitals")({
  head: () => ({ meta: [{ title: "Vitals — Nurse" }] }),
  component: NurseVitalsScreen,
});

interface VitalRecord {
  patientId: number;
  patient: string;
  patientCode: string;
  bed: string;
  ward: string;
  bp: string;
  pulse: number;
  temp: number;
  spo2: number;
  respRate?: number;
  weight?: number;
  recordedAt: string;
  recordedBy: string;
  trend?: "up" | "down" | "stable";
  alert?: string;
}

const MOCK_VITALS: VitalRecord[] = [
  {
    patientId: 1, patient: "Muhammad Usama Khan", patientCode: "P-1001", bed: "ICU-04", ward: "ICU",
    bp: "145/90", pulse: 102, temp: 38.1, spo2: 93, respRate: 22, weight: 78,
    recordedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    recordedBy: "Nurse Sara Bibi", trend: "up",
    alert: "⚠ SpO₂ below 95% — Notify on-call physician"
  },
  {
    patientId: 2, patient: "Sara Ahmed", patientCode: "P-1002", bed: "Bed-302A", ward: "General Ward",
    bp: "118/76", pulse: 74, temp: 36.6, spo2: 99, respRate: 16, weight: 58,
    recordedAt: new Date(Date.now() - 90 * 60000).toISOString(),
    recordedBy: "Nurse Rida Noor", trend: "stable"
  },
  {
    patientId: 3, patient: "Hamza Riaz", patientCode: "P-1003", bed: "Bed-114B", ward: "Medical Ward",
    bp: "128/82", pulse: 82, temp: 37.2, spo2: 97, respRate: 18, weight: 85,
    recordedAt: new Date(Date.now() - 120 * 60000).toISOString(),
    recordedBy: "Nurse Amna Siddiqui", trend: "down"
  },
  {
    patientId: 4, patient: "Fatima Noor", patientCode: "P-1004", bed: "Bed-205", ward: "Surgical Ward",
    bp: "122/78", pulse: 76, temp: 37.0, spo2: 98, respRate: 15, weight: 63,
    recordedAt: new Date(Date.now() - 45 * 60000).toISOString(),
    recordedBy: "Nurse Rida Noor", trend: "stable"
  },
  {
    patientId: 5, patient: "Ali Hassan Sheikh", patientCode: "P-1005", bed: "ICU-07", ward: "ICU",
    bp: "150/95", pulse: 112, temp: 38.5, spo2: 91, respRate: 26, weight: 72,
    recordedAt: new Date(Date.now() - 15 * 60000).toISOString(),
    recordedBy: "Nurse Sara Bibi", trend: "up",
    alert: "⛔ CRITICAL — SpO₂ 91%, Pulse 112. Escalate to intensivist immediately"
  },
  {
    patientId: 6, patient: "Ayesha Malik", patientCode: "P-1006", bed: "Bed-408A", ward: "Maternity Ward",
    bp: "110/70", pulse: 68, temp: 36.8, spo2: 100, respRate: 14, weight: 71,
    recordedAt: new Date(Date.now() - 200 * 60000).toISOString(),
    recordedBy: "Nurse Amna Siddiqui", trend: "stable"
  },
  {
    patientId: 7, patient: "Bilal Chaudhry", patientCode: "P-1007", bed: "Bed-312C", ward: "Orthopedic Ward",
    bp: "130/85", pulse: 80, temp: 37.1, spo2: 97, respRate: 16, weight: 90,
    recordedAt: new Date(Date.now() - 180 * 60000).toISOString(),
    recordedBy: "Nurse Rida Noor", trend: "stable"
  },
  {
    patientId: 8, patient: "Zainab Qureshi", patientCode: "P-1008", bed: "Bed-501", ward: "Neurology Ward",
    bp: "120/80", pulse: 72, temp: 36.9, spo2: 99, respRate: 15, weight: 55,
    recordedAt: new Date(Date.now() - 240 * 60000).toISOString(),
    recordedBy: "Nurse Sara Bibi", trend: "stable"
  },
];

const getVitalStatus = (v: VitalRecord): "critical" | "caution" | "normal" => {
  if (v.spo2 < 93 || v.pulse > 108 || v.temp > 38.4) return "critical";
  if (v.spo2 < 96 || v.pulse > 95 || v.temp > 37.5) return "caution";
  return "normal";
};

const timeAgo = (iso: string) => {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.round(mins / 60)}h ago`;
};

const TrendIcon = ({ trend }: { trend?: "up" | "down" | "stable" }) => {
  if (trend === "up") return <TrendingUp className="h-3.5 w-3.5 text-rose-500" />;
  if (trend === "down") return <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
};

function NurseVitalsScreen() {
  const { data: _api, loading, error, refetch } = useApi(() => patientAPI.getAll());
  const [q, setQ] = useState("");
  const [wardFilter, setWardFilter] = useState("All");
  const [open, setOpen] = useState(false);
  const [selectedPat, setSelectedPat] = useState<VitalRecord | null>(null);
  const [form, setForm] = useState({ bp: "", pulse: "", temp: "", spo2: "", respRate: "", weight: "" });

  const WARDS = ["All", "ICU", "General Ward", "Medical Ward", "Surgical Ward", "Maternity Ward", "Orthopedic Ward", "Neurology Ward"];

  const filtered = MOCK_VITALS.filter((v) => {
    const matchQ = v.patient.toLowerCase().includes(q.toLowerCase()) ||
      v.bed.toLowerCase().includes(q.toLowerCase()) ||
      v.patientCode.toLowerCase().includes(q.toLowerCase());
    const matchWard = wardFilter === "All" || v.ward === wardFilter;
    return matchQ && matchWard;
  });

  const criticalCount = MOCK_VITALS.filter((v) => getVitalStatus(v) === "critical").length;
  const cautionCount = MOCK_VITALS.filter((v) => getVitalStatus(v) === "caution").length;

  const submitVitals = () => {
    if (!form.bp || !form.pulse || !form.temp || !form.spo2) return toast.error("All core vital fields required");
    toast.success(`Vitals recorded for ${selectedPat?.patient}`, { description: `BP ${form.bp} · HR ${form.pulse} · Temp ${form.temp}°C · SpO₂ ${form.spo2}%` });
    setOpen(false);
    setForm({ bp: "", pulse: "", temp: "", spo2: "", respRate: "", weight: "" });
  };

  return (
    <AppShell role="nurse" title="Nurse" nav={nurseNav}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient Vitals</h1>
          <p className="text-muted-foreground">Latest vital signs across all admitted patients</p>
        </div>
        <Button variant="outline" size="sm" onClick={refetch} className="shrink-0">
          <RefreshCw className="h-3.5 w-3.5 mr-2" />Refresh
        </Button>
      </div>

      {/* Alert banner for critical patients */}
      {criticalCount > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 animate-pulse" />
          <div>
            <div className="font-bold text-rose-800 dark:text-rose-300">{criticalCount} Critical Patient{criticalCount > 1 ? "s" : ""} Requiring Immediate Attention</div>
            <div className="text-xs text-rose-600 dark:text-rose-400">{cautionCount} additional patients under observation</div>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Critical", value: criticalCount, color: "from-rose-500 to-red-600" },
          { label: "Caution", value: cautionCount, color: "from-amber-500 to-orange-600" },
          { label: "Stable", value: MOCK_VITALS.length - criticalCount - cautionCount, color: "from-emerald-500 to-teal-600" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`rounded-2xl bg-gradient-to-br ${s.color} text-white p-4 shadow-elevated`}>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs opacity-90 mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patient, code, bed..." className="pl-9" />
        </div>
      </div>
      <div className="flex gap-2 flex-wrap mb-6">
        {WARDS.map((w) => (
          <button key={w} onClick={() => setWardFilter(w)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              wardFilter === w ? "bg-rose-600 text-white border-rose-600" : "bg-secondary text-muted-foreground border-border hover:border-rose-400"
            }`}>{w}</button>
        ))}
      </div>

      {loading && <div className="flex items-center justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}

      {/* Vitals cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((v, i) => {
          const status = getVitalStatus(v);
          const borderCls = status === "critical" ? "border-rose-300 dark:border-rose-800" : status === "caution" ? "border-amber-200 dark:border-amber-900" : "border-border";
          return (
            <motion.div key={v.patientId}
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              whileHover={{ y: -4 }}
              className={`bg-card border rounded-2xl p-5 shadow-card hover:shadow-elevated transition-all ${borderCls}`}>
              {/* Alert */}
              {v.alert && (
                <div className={`mb-3 text-xs px-3 py-2 rounded-xl font-semibold ${
                  status === "critical" ? "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900" : "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900"
                }`}>{v.alert}</div>
              )}

              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-sm leading-tight text-card-foreground">{v.patient}</h3>
                  <span className="font-mono text-[10px] text-primary">{v.patientCode}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendIcon trend={v.trend} />
                  <Badge className={
                    status === "critical" ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300" :
                    status === "caution" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" :
                    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                  }>{status === "critical" ? "Critical" : status === "caution" ? "Caution" : "Stable"}</Badge>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-3">
                <span className="flex items-center gap-1"><BedDouble className="h-3 w-3" />{v.bed}</span>
                <span>{v.ward}</span>
              </div>

              {/* Vitals grid */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Blood Pressure", value: `${v.bp} mmHg`, icon: <Droplets className="h-3.5 w-3.5" />, color: "text-rose-500" },
                  { label: "Pulse", value: `${v.pulse} bpm`, icon: <HeartPulse className="h-3.5 w-3.5" />, color: v.pulse > 100 ? "text-rose-500" : "text-violet-500" },
                  { label: "Temperature", value: `${v.temp}°C`, icon: <Thermometer className="h-3.5 w-3.5" />, color: v.temp > 37.5 ? "text-amber-500" : "text-teal-500" },
                  { label: "SpO₂", value: `${v.spo2}%`, icon: <Activity className="h-3.5 w-3.5" />, color: v.spo2 < 95 ? "text-rose-500" : "text-emerald-500" },
                  ...(v.respRate ? [{ label: "Resp. Rate", value: `${v.respRate}/min`, icon: <Wind className="h-3.5 w-3.5" />, color: "text-blue-500" }] : []),
                  ...(v.weight ? [{ label: "Weight", value: `${v.weight} kg`, icon: <Activity className="h-3.5 w-3.5" />, color: "text-indigo-500" }] : []),
                ].map((item) => (
                  <div key={item.label} className="bg-secondary/50 dark:bg-secondary/30 rounded-xl p-2.5 flex flex-col">
                    <div className={`flex items-center gap-1 ${item.color} mb-1`}>{item.icon}<span className="text-[10px] text-muted-foreground">{item.label}</span></div>
                    <div className="font-bold text-sm text-foreground font-mono">{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-3 mt-3 flex items-center justify-between">
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="h-3 w-3" />{timeAgo(v.recordedAt)} · {v.recordedBy}
                </span>
                <Button size="sm" variant="outline" className="h-7 text-[10px] text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  onClick={() => { setSelectedPat(v); setOpen(true); }}>
                  <Plus className="h-3 w-3 mr-1" />New Reading
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Record Vitals Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><HeartPulse className="h-5 w-5 text-rose-500" />Record Vitals — {selectedPat?.patient}</DialogTitle>
            <DialogDescription>{selectedPat?.patientCode} · {selectedPat?.bed} · {selectedPat?.ward}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div><Label>BP (mmHg) *</Label><Input value={form.bp} onChange={(e) => setForm({ ...form, bp: e.target.value })} placeholder="120/80" className="mt-1.5" /></div>
            <div><Label>Pulse (bpm) *</Label><Input type="number" value={form.pulse} onChange={(e) => setForm({ ...form, pulse: e.target.value })} placeholder="72" className="mt-1.5" /></div>
            <div><Label>Temp (°C) *</Label><Input type="number" step="0.1" value={form.temp} onChange={(e) => setForm({ ...form, temp: e.target.value })} placeholder="36.8" className="mt-1.5" /></div>
            <div><Label>SpO₂ (%) *</Label><Input type="number" value={form.spo2} onChange={(e) => setForm({ ...form, spo2: e.target.value })} placeholder="98" className="mt-1.5" /></div>
            <div><Label>Resp. Rate /min</Label><Input type="number" value={form.respRate} onChange={(e) => setForm({ ...form, respRate: e.target.value })} placeholder="16" className="mt-1.5" /></div>
            <div><Label>Weight (kg)</Label><Input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="70" className="mt-1.5" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submitVitals} className="bg-rose-600 hover:bg-rose-700 text-white">Save Vitals</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
