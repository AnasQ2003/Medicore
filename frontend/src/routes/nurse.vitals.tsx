import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { nurseNav } from "@/lib/roleNav";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search, HeartPulse, Thermometer, Activity, Droplets, Wind, TrendingUp,
  TrendingDown, Minus, Clock, BedDouble, AlertCircle, Plus
} from "lucide-react";
import { patientAPI } from "@/lib/api/client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const INITIAL_VITALS: VitalRecord[] = [
  {
    patientId: 101, patient: "Muhammad Usama Khan", patientCode: "P-1001", bed: "ICU-04", ward: "ICU",
    bp: "145/90", pulse: 102, temp: 38.1, spo2: 93, respRate: 22, weight: 78,
    recordedAt: new Date(Date.now() - 25 * 60000).toISOString(),
    recordedBy: "Nurse Emily Watson", trend: "up",
    alert: "⚠ Critical — SpO₂ below 94%, HR elevated. Monitor cardiac rhythm"
  },
  {
    patientId: 105, patient: "Ali Hassan Sheikh", patientCode: "P-1005", bed: "ICU-07", ward: "ICU",
    bp: "150/95", pulse: 112, temp: 38.5, spo2: 91, respRate: 26, weight: 72,
    recordedAt: new Date(Date.now() - 15 * 60000).toISOString(),
    recordedBy: "Nurse Emily Watson", trend: "up",
    alert: "⛔ CRITICAL — SpO₂ 91%, Pulse 112 bpm. Immediate nursing intervention"
  },
  {
    patientId: 102, patient: "Sara Ahmed", patientCode: "P-1002", bed: "Bed-302A", ward: "General Ward",
    bp: "118/76", pulse: 74, temp: 36.6, spo2: 99, respRate: 16, weight: 58,
    recordedAt: new Date(Date.now() - 45 * 60000).toISOString(),
    recordedBy: "Nurse Emily Watson", trend: "stable"
  },
  {
    patientId: 109, patient: "Tariq Mehmood", patientCode: "P-1009", bed: "Bed-305B", ward: "General Ward",
    bp: "124/80", pulse: 78, temp: 36.8, spo2: 98, respRate: 16, weight: 81,
    recordedAt: new Date(Date.now() - 80 * 60000).toISOString(),
    recordedBy: "Nurse Emily Watson", trend: "stable"
  },
  {
    patientId: 103, patient: "Hamza Riaz", patientCode: "P-1003", bed: "Bed-114B", ward: "Medical Ward",
    bp: "128/82", pulse: 82, temp: 37.2, spo2: 97, respRate: 18, weight: 85,
    recordedAt: new Date(Date.now() - 110 * 60000).toISOString(),
    recordedBy: "Nurse Emily Watson", trend: "down"
  },
  {
    patientId: 110, patient: "Maryam Bibi", patientCode: "P-1010", bed: "Bed-118", ward: "Medical Ward",
    bp: "135/88", pulse: 94, temp: 37.6, spo2: 96, respRate: 19, weight: 64,
    recordedAt: new Date(Date.now() - 60 * 60000).toISOString(),
    recordedBy: "Nurse Emily Watson", trend: "stable",
    alert: "⚠ Mild Pyrexia — Check temp again in 1 hour"
  },
  {
    patientId: 104, patient: "Fatima Noor", patientCode: "P-1004", bed: "Bed-205", ward: "Surgical Ward",
    bp: "122/78", pulse: 76, temp: 37.0, spo2: 98, respRate: 15, weight: 63,
    recordedAt: new Date(Date.now() - 35 * 60000).toISOString(),
    recordedBy: "Nurse Emily Watson", trend: "stable"
  },
  {
    patientId: 111, patient: "Kamran Akram", patientCode: "P-1011", bed: "Bed-210A", ward: "Surgical Ward",
    bp: "126/80", pulse: 84, temp: 37.1, spo2: 98, respRate: 17, weight: 79,
    recordedAt: new Date(Date.now() - 95 * 60000).toISOString(),
    recordedBy: "Nurse Emily Watson", trend: "stable"
  },
  {
    patientId: 106, patient: "Ayesha Malik", patientCode: "P-1006", bed: "Bed-408A", ward: "Maternity Ward",
    bp: "110/70", pulse: 68, temp: 36.8, spo2: 100, respRate: 14, weight: 71,
    recordedAt: new Date(Date.now() - 150 * 60000).toISOString(),
    recordedBy: "Nurse Emily Watson", trend: "stable"
  },
  {
    patientId: 107, patient: "Bilal Chaudhry", patientCode: "P-1007", bed: "Bed-312C", ward: "Orthopedic Ward",
    bp: "130/85", pulse: 80, temp: 37.1, spo2: 97, respRate: 16, weight: 90,
    recordedAt: new Date(Date.now() - 130 * 60000).toISOString(),
    recordedBy: "Nurse Emily Watson", trend: "stable"
  },
  {
    patientId: 108, patient: "Zainab Qureshi", patientCode: "P-1008", bed: "Bed-501", ward: "Neurology Ward",
    bp: "120/80", pulse: 72, temp: 36.9, spo2: 99, respRate: 15, weight: 55,
    recordedAt: new Date(Date.now() - 180 * 60000).toISOString(),
    recordedBy: "Nurse Emily Watson", trend: "stable"
  },
];

const WARDS = ["All", "ICU", "General Ward", "Medical Ward", "Surgical Ward", "Maternity Ward", "Orthopedic Ward", "Neurology Ward"];

const getVitalStatus = (v: VitalRecord): "critical" | "caution" | "normal" => {
  if (v.spo2 < 94 || v.pulse > 105 || v.temp > 38.2) return "critical";
  if (v.spo2 < 96 || v.pulse > 95 || v.temp > 37.5) return "caution";
  return "normal";
};

const timeAgo = (iso: string) => {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.round(mins / 60)}h ago`;
};

const TrendIcon = ({ trend }: { trend?: "up" | "down" | "stable" }) => {
  if (trend === "up") return <TrendingUp className="h-3.5 w-3.5 text-rose-500" />;
  if (trend === "down") return <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
};

function NurseVitalsScreen() {
  const [vitalsList, setVitalsList] = useState<VitalRecord[]>(INITIAL_VITALS);
  const [q, setQ] = useState("");
  const [wardFilter, setWardFilter] = useState("All");
  const [open, setOpen] = useState(false);
  const [selectedPat, setSelectedPat] = useState<VitalRecord | null>(null);
  const [form, setForm] = useState({ patientId: 0, bp: "", pulse: "", temp: "", spo2: "", respRate: "", weight: "" });

  const filtered = vitalsList.filter((v) => {
    const matchQ = v.patient.toLowerCase().includes(q.toLowerCase()) ||
      v.bed.toLowerCase().includes(q.toLowerCase()) ||
      v.patientCode.toLowerCase().includes(q.toLowerCase());
    const matchWard = wardFilter === "All" || v.ward === wardFilter;
    return matchQ && matchWard;
  });

  const criticalCount = vitalsList.filter((v) => getVitalStatus(v) === "critical").length;
  const cautionCount = vitalsList.filter((v) => getVitalStatus(v) === "caution").length;
  const stableCount = vitalsList.length - criticalCount - cautionCount;

  const handleOpenModal = (v?: VitalRecord) => {
    if (v) {
      setSelectedPat(v);
      setForm({
        patientId: v.patientId,
        bp: v.bp,
        pulse: String(v.pulse),
        temp: String(v.temp),
        spo2: String(v.spo2),
        respRate: v.respRate ? String(v.respRate) : "",
        weight: v.weight ? String(v.weight) : "",
      });
    } else {
      const defaultPat = vitalsList[0];
      setSelectedPat(defaultPat);
      setForm({
        patientId: defaultPat.patientId,
        bp: "",
        pulse: "",
        temp: "",
        spo2: "",
        respRate: "",
        weight: "",
      });
    }
    setOpen(true);
  };

  const handlePatientSelect = (pidStr: string) => {
    const pid = Number(pidStr);
    const found = vitalsList.find(v => v.patientId === pid);
    if (found) {
      setSelectedPat(found);
      setForm(prev => ({
        ...prev,
        patientId: found.patientId,
        bp: found.bp,
        pulse: String(found.pulse),
        temp: String(found.temp),
        spo2: String(found.spo2),
      }));
    }
  };

  const submitVitals = async () => {
    if (!form.bp || !form.pulse || !form.temp || !form.spo2) {
      return toast.error("Please fill in BP, Pulse, Temperature, and SpO₂");
    }

    const pulseNum = Number(form.pulse);
    const tempNum = Number(form.temp);
    const spo2Num = Number(form.spo2);
    const respRateNum = form.respRate ? Number(form.respRate) : undefined;
    const weightNum = form.weight ? Number(form.weight) : undefined;

    let alertMsg: string | undefined = undefined;
    if (spo2Num < 94 || pulseNum > 105 || tempNum > 38.2) {
      alertMsg = `⚠ Critical Alert — SpO₂ ${spo2Num}%, Pulse ${pulseNum} bpm. Priority nursing attention required`;
    } else if (spo2Num < 96 || pulseNum > 95 || tempNum > 37.5) {
      alertMsg = `⚠ Caution — Temperature elevated (${tempNum}°C). Observation check recommended`;
    }

    // Call backend API if possible
    if (selectedPat?.patientId) {
      try {
        await patientAPI.recordVitals({
          patientId: selectedPat.patientId,
          bp: form.bp,
          pulse: pulseNum,
          temp: tempNum,
          spo2: spo2Num,
        });
      } catch {
        // Fallback gracefully to client state
      }
    }

    const updatedRecord: VitalRecord = {
      patientId: selectedPat?.patientId || form.patientId || Date.now(),
      patient: selectedPat?.patient || "Admitted Patient",
      patientCode: selectedPat?.patientCode || `P-${Date.now().toString().slice(-4)}`,
      bed: selectedPat?.bed || "Bed-101",
      ward: selectedPat?.ward || "General Ward",
      bp: form.bp,
      pulse: pulseNum,
      temp: tempNum,
      spo2: spo2Num,
      respRate: respRateNum,
      weight: weightNum,
      recordedAt: new Date().toISOString(),
      recordedBy: "Nurse Emily Watson",
      trend: spo2Num < 94 ? "up" : "stable",
      alert: alertMsg,
    };

    setVitalsList((prev) => {
      const idx = prev.findIndex((v) => v.patientId === updatedRecord.patientId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updatedRecord;
        return next;
      }
      return [updatedRecord, ...prev];
    });

    toast.success(`Vitals recorded for ${updatedRecord.patient}`, {
      description: `BP ${form.bp} · HR ${pulseNum} bpm · Temp ${tempNum}°C · SpO₂ ${spo2Num}%`,
    });

    setOpen(false);
  };

  return (
    <AppShell role="nurse" title="Nurse" nav={nurseNav}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient Vitals</h1>
          <p className="text-muted-foreground">Live telemetry and clinical signs for all admitted patients</p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-gradient-red text-white shadow-glow-red font-semibold cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4 mr-2" /> Record New Vitals
        </Button>
      </div>

      {/* Alert banner for critical patients */}
      {criticalCount > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-4 shadow-sm">
          <AlertCircle className="h-6 w-6 text-rose-600 flex-shrink-0 animate-pulse" />
          <div>
            <div className="font-bold text-rose-800 dark:text-rose-300">{criticalCount} Critical Patient{criticalCount > 1 ? "s" : ""} Requiring Priority Nursing Attention</div>
            <div className="text-xs text-rose-600 dark:text-rose-400">SpO₂ below 94% or elevated heart rate. Continuous bedside monitoring recommended.</div>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
          className="rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white p-5 shadow-elevated">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-90">Critical Watch</span>
            <AlertCircle className="h-5 w-5 opacity-90" />
          </div>
          <div className="text-3xl font-extrabold mt-2">{criticalCount}</div>
          <div className="text-xs opacity-90 mt-1">Priority bedside telemetry</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white p-5 shadow-elevated">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-90">Observation</span>
            <Activity className="h-5 w-5 opacity-90" />
          </div>
          <div className="text-3xl font-extrabold mt-2">{cautionCount}</div>
          <div className="text-xs opacity-90 mt-1">Scheduled routine 2h rounds</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-5 shadow-elevated">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-90">Stable</span>
            <HeartPulse className="h-5 w-5 opacity-90" />
          </div>
          <div className="text-3xl font-extrabold mt-2">{stableCount}</div>
          <div className="text-xs opacity-90 mt-1">Within normal clinical limits</div>
        </motion.div>
      </div>

      {/* Search and Ward Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patient by name, code, bed number..." className="pl-9" />
        </div>
      </div>
      <div className="flex gap-2 flex-wrap mb-6">
        {WARDS.map((w) => (
          <button key={w} onClick={() => setWardFilter(w)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
              wardFilter === w ? "bg-rose-600 text-white border-rose-600 shadow-md" : "bg-secondary text-muted-foreground border-border hover:border-rose-400 hover:text-rose-600"
            }`}>{w}</button>
        ))}
      </div>

      {/* Vitals cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((v, i) => {
          const status = getVitalStatus(v);
          const borderCls = status === "critical"
            ? "border-rose-300 dark:border-rose-800 shadow-rose-100/50"
            : status === "caution"
            ? "border-amber-200 dark:border-amber-900"
            : "border-border";

          return (
            <motion.div key={v.patientId}
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              whileHover={{ y: -4 }}
              className={`bg-card border rounded-2xl p-5 shadow-card hover:shadow-xl transition-all flex flex-col justify-between ${borderCls}`}>
              <div>
                {/* Alert message if any */}
                {v.alert && (
                  <div className={`mb-3 text-xs px-3 py-2 rounded-xl font-semibold flex items-center gap-1.5 ${
                    status === "critical" ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900" : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900"
                  }`}>
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{v.alert}</span>
                  </div>
                )}

                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-base leading-tight text-card-foreground">{v.patient}</h3>
                    <span className="font-mono text-xs text-rose-600 dark:text-rose-400 font-semibold">{v.patientCode}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendIcon trend={v.trend} />
                    <Badge className={
                      status === "critical" ? "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 animate-pulse font-bold" :
                      status === "caution" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 font-semibold" :
                      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 font-semibold"
                    }>{status === "critical" ? "Critical" : status === "caution" ? "Caution" : "Stable"}</Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                  <span className="inline-flex items-center gap-1 font-semibold text-foreground bg-secondary/80 px-2 py-0.5 rounded-md">
                    <BedDouble className="h-3.5 w-3.5 text-rose-500" />{v.bed}
                  </span>
                  <span>•</span>
                  <span>{v.ward}</span>
                </div>

                {/* Vitals Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-secondary/60 dark:bg-secondary/40 rounded-xl p-3 flex flex-col border border-border/50">
                    <div className="flex items-center gap-1.5 text-rose-500 mb-1">
                      <Droplets className="h-3.5 w-3.5" />
                      <span className="text-[11px] font-medium text-muted-foreground">Blood Pressure</span>
                    </div>
                    <div className="font-bold text-sm text-foreground font-mono">{v.bp} <span className="text-[10px] text-muted-foreground font-normal">mmHg</span></div>
                  </div>

                  <div className="bg-secondary/60 dark:bg-secondary/40 rounded-xl p-3 flex flex-col border border-border/50">
                    <div className={`flex items-center gap-1.5 mb-1 ${v.pulse > 100 ? "text-rose-500" : "text-violet-500"}`}>
                      <HeartPulse className="h-3.5 w-3.5" />
                      <span className="text-[11px] font-medium text-muted-foreground">Pulse (HR)</span>
                    </div>
                    <div className="font-bold text-sm text-foreground font-mono">{v.pulse} <span className="text-[10px] text-muted-foreground font-normal">bpm</span></div>
                  </div>

                  <div className="bg-secondary/60 dark:bg-secondary/40 rounded-xl p-3 flex flex-col border border-border/50">
                    <div className={`flex items-center gap-1.5 mb-1 ${v.temp > 37.5 ? "text-amber-500" : "text-teal-500"}`}>
                      <Thermometer className="h-3.5 w-3.5" />
                      <span className="text-[11px] font-medium text-muted-foreground">Temperature</span>
                    </div>
                    <div className="font-bold text-sm text-foreground font-mono">{v.temp}°C</div>
                  </div>

                  <div className="bg-secondary/60 dark:bg-secondary/40 rounded-xl p-3 flex flex-col border border-border/50">
                    <div className={`flex items-center gap-1.5 mb-1 ${v.spo2 < 94 ? "text-rose-500" : "text-emerald-500"}`}>
                      <Activity className="h-3.5 w-3.5" />
                      <span className="text-[11px] font-medium text-muted-foreground">Oxygen (SpO₂)</span>
                    </div>
                    <div className="font-bold text-sm text-foreground font-mono">{v.spo2}%</div>
                  </div>

                  {v.respRate && (
                    <div className="bg-secondary/60 dark:bg-secondary/40 rounded-xl p-3 flex flex-col border border-border/50">
                      <div className="flex items-center gap-1.5 text-blue-500 mb-1">
                        <Wind className="h-3.5 w-3.5" />
                        <span className="text-[11px] font-medium text-muted-foreground">Resp. Rate</span>
                      </div>
                      <div className="font-bold text-sm text-foreground font-mono">{v.respRate}/min</div>
                    </div>
                  )}

                  {v.weight && (
                    <div className="bg-secondary/60 dark:bg-secondary/40 rounded-xl p-3 flex flex-col border border-border/50">
                      <div className="flex items-center gap-1.5 text-indigo-500 mb-1">
                        <Activity className="h-3.5 w-3.5" />
                        <span className="text-[11px] font-medium text-muted-foreground">Body Weight</span>
                      </div>
                      <div className="font-bold text-sm text-foreground font-mono">{v.weight} kg</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="border-t border-border pt-3.5 mt-4 flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />{timeAgo(v.recordedAt)}
                </span>
                <Button size="sm" variant="outline" className="h-8 text-xs font-semibold text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                  onClick={() => handleOpenModal(v)}>
                  <Plus className="h-3.5 w-3.5 mr-1" />New Reading
                </Button>
              </div>
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-muted-foreground bg-secondary/20 rounded-2xl border">
            No patient vitals found matching the query.
          </div>
        )}
      </div>

      {/* Record Vitals Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-rose-500" />
              Record Patient Vitals
            </DialogTitle>
            <DialogDescription>
              Log fresh clinical telemetry and parameters for bedside monitoring.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label>Select Patient / Bed *</Label>
              <Select
                value={form.patientId ? String(form.patientId) : undefined}
                onValueChange={handlePatientSelect}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Choose admitted patient" />
                </SelectTrigger>
                <SelectContent>
                  {vitalsList.map((p) => (
                    <SelectItem key={p.patientId} value={String(p.patientId)}>
                      {p.patient} ({p.patientCode}) — {p.bed} · {p.ward}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>BP (mmHg) *</Label>
                <Input
                  value={form.bp}
                  onChange={(e) => setForm({ ...form, bp: e.target.value })}
                  placeholder="120/80"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Pulse (bpm) *</Label>
                <Input
                  type="number"
                  value={form.pulse}
                  onChange={(e) => setForm({ ...form, pulse: e.target.value })}
                  placeholder="72"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Temp (°C) *</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.temp}
                  onChange={(e) => setForm({ ...form, temp: e.target.value })}
                  placeholder="36.8"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>SpO₂ (%) *</Label>
                <Input
                  type="number"
                  value={form.spo2}
                  onChange={(e) => setForm({ ...form, spo2: e.target.value })}
                  placeholder="98"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Resp. Rate (/min)</Label>
                <Input
                  type="number"
                  value={form.respRate}
                  onChange={(e) => setForm({ ...form, respRate: e.target.value })}
                  placeholder="16"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Weight (kg)</Label>
                <Input
                  type="number"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  placeholder="70"
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button onClick={submitVitals} className="bg-gradient-red text-white shadow-glow-red font-semibold cursor-pointer">
              Save Readings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
