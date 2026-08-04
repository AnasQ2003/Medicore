import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { nurseNav } from "@/lib/roleNav";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search, Loader2, AlertCircle, RefreshCw, HeartPulse, Plus,
  BedDouble, Building2, Layers, Activity, Thermometer, Droplets
} from "lucide-react";
import { patientAPI } from "@/lib/api/client";
import useApi from "@/hooks/useApi";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/nurse/patients")({
  head: () => ({ meta: [{ title: "Patients — Nurse" }] }),
  component: NursePatientsScreen,
});

interface Patient {
  id: number;
  name: string;
  patientCode: string;
  email: string;
  phone?: string;
  address?: string;
  gender?: string;
  bloodGroup?: string;
  age?: number;
  vitals?: { bp: string; pulse: number; temp: number; spo2: number; recordedAt: string }[];
  // Mock ward info (would come from bed assignment in real system)
  roomNo?: string;
  floorNo?: string;
  bedNo?: string;
  ward?: string;
  admittedDays?: number;
  condition?: string;
}

// Rich mock patient data with ward/bed information
const MOCK_PATIENTS: Patient[] = [
  {
    id: 101, name: "Muhammad Usama Khan", patientCode: "P-1001", email: "usama@example.com",
    gender: "Male", bloodGroup: "O+", age: 34,
    roomNo: "ICU-01", floorNo: "Floor 2", bedNo: "ICU-04", ward: "ICU",
    admittedDays: 3, condition: "Acute Cardiac",
    vitals: [{ bp: "145/90", pulse: 102, temp: 38.1, spo2: 93, recordedAt: new Date().toISOString() }]
  },
  {
    id: 102, name: "Sara Ahmed", patientCode: "P-1002", email: "sara@example.com",
    gender: "Female", bloodGroup: "B+", age: 28,
    roomNo: "302", floorNo: "Floor 3", bedNo: "Bed-302A", ward: "General Ward",
    admittedDays: 1, condition: "Post-op Recovery",
    vitals: [{ bp: "118/76", pulse: 74, temp: 36.6, spo2: 99, recordedAt: new Date().toISOString() }]
  },
  {
    id: 103, name: "Hamza Riaz", patientCode: "P-1003", email: "hamza@example.com",
    gender: "Male", bloodGroup: "A-", age: 52,
    roomNo: "114", floorNo: "Floor 1", bedNo: "Bed-114B", ward: "Medical Ward",
    admittedDays: 5, condition: "Hypertension Management",
    vitals: [{ bp: "128/82", pulse: 82, temp: 37.2, spo2: 97, recordedAt: new Date().toISOString() }]
  },
  {
    id: 104, name: "Fatima Noor", patientCode: "P-1004", email: "fatima@example.com",
    gender: "Female", bloodGroup: "AB+", age: 41,
    roomNo: "205", floorNo: "Floor 2", bedNo: "Bed-205", ward: "Surgical Ward",
    admittedDays: 2, condition: "Appendectomy",
    vitals: [{ bp: "122/78", pulse: 76, temp: 37.0, spo2: 98, recordedAt: new Date().toISOString() }]
  },
  {
    id: 105, name: "Ali Hassan Sheikh", patientCode: "P-1005", email: "ali@example.com",
    gender: "Male", bloodGroup: "O-", age: 67,
    roomNo: "ICU-02", floorNo: "Floor 2", bedNo: "ICU-07", ward: "ICU",
    admittedDays: 8, condition: "Respiratory Failure",
    vitals: [{ bp: "150/95", pulse: 112, temp: 38.5, spo2: 91, recordedAt: new Date().toISOString() }]
  },
  {
    id: 106, name: "Ayesha Malik", patientCode: "P-1006", email: "ayesha@example.com",
    gender: "Female", bloodGroup: "B-", age: 24,
    roomNo: "408", floorNo: "Floor 4", bedNo: "Bed-408A", ward: "Maternity Ward",
    admittedDays: 1, condition: "Routine Delivery",
    vitals: [{ bp: "110/70", pulse: 68, temp: 36.8, spo2: 100, recordedAt: new Date().toISOString() }]
  },
  {
    id: 107, name: "Bilal Chaudhry", patientCode: "P-1007", email: "bilal@example.com",
    gender: "Male", bloodGroup: "A+", age: 45,
    roomNo: "312", floorNo: "Floor 3", bedNo: "Bed-312C", ward: "Orthopedic Ward",
    admittedDays: 6, condition: "Hip Replacement",
    vitals: [{ bp: "130/85", pulse: 80, temp: 37.1, spo2: 97, recordedAt: new Date().toISOString() }]
  },
  {
    id: 108, name: "Zainab Qureshi", patientCode: "P-1008", email: "zainab@example.com",
    gender: "Female", bloodGroup: "O+", age: 35,
    roomNo: "501", floorNo: "Floor 5", bedNo: "Bed-501", ward: "Neurology Ward",
    admittedDays: 4, condition: "Migraine Treatment",
    vitals: [{ bp: "120/80", pulse: 72, temp: 36.9, spo2: 99, recordedAt: new Date().toISOString() }]
  },
];

const WARDS = ["All", "ICU", "General Ward", "Medical Ward", "Surgical Ward", "Maternity Ward", "Orthopedic Ward", "Neurology Ward"];

function getConditionBadge(vitals?: Patient["vitals"]) {
  if (!vitals || vitals.length === 0) return { label: "No Data", cls: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300" };
  const v = vitals[0];
  if (v.spo2 < 93 || v.pulse > 105 || v.temp > 38.2)
    return { label: "Critical", cls: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300" };
  if (v.spo2 < 96 || v.pulse > 95 || v.temp > 37.5)
    return { label: "Observation", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300" };
  return { label: "Stable", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300" };
}

function NursePatientsScreen() {
  const { data: rawPatients, loading, error, refetch } = useApi(() => patientAPI.getAll());
  const apiPatients = (rawPatients as unknown as Patient[]) ?? [];

  // Merge API patients with mock patients; use mocks if API returns few
  const allPatients: Patient[] = apiPatients.length > 0
    ? apiPatients.map((p, i) => ({
        ...p,
        roomNo: MOCK_PATIENTS[i % MOCK_PATIENTS.length]?.roomNo ?? "101",
        floorNo: MOCK_PATIENTS[i % MOCK_PATIENTS.length]?.floorNo ?? "Floor 1",
        bedNo: MOCK_PATIENTS[i % MOCK_PATIENTS.length]?.bedNo ?? "Bed-101",
        ward: MOCK_PATIENTS[i % MOCK_PATIENTS.length]?.ward ?? "General Ward",
        admittedDays: MOCK_PATIENTS[i % MOCK_PATIENTS.length]?.admittedDays ?? 1,
        condition: MOCK_PATIENTS[i % MOCK_PATIENTS.length]?.condition ?? "Routine",
      }))
    : MOCK_PATIENTS;

  const [q, setQ] = useState("");
  const [wardFilter, setWardFilter] = useState("All");
  const [open, setOpen] = useState(false);
  const [selectedPat, setSelectedPat] = useState<Patient | null>(null);
  const [form, setForm] = useState({ bp: "", pulse: "", temp: "", spo2: "" });

  const filtered = allPatients.filter((p) => {
    const matchQ = p.name.toLowerCase().includes(q.toLowerCase()) ||
      p.patientCode.toLowerCase().includes(q.toLowerCase()) ||
      (p.bedNo ?? "").toLowerCase().includes(q.toLowerCase()) ||
      (p.ward ?? "").toLowerCase().includes(q.toLowerCase());
    const matchWard = wardFilter === "All" || p.ward === wardFilter;
    return matchQ && matchWard;
  });

  const submitVitals = async () => {
    if (!selectedPat) return;
    if (!form.bp || !form.pulse || !form.temp || !form.spo2) return toast.error("All vital fields required");
    try {
      await patientAPI.recordVitals({
        patientId: selectedPat.id,
        bp: form.bp,
        pulse: Number(form.pulse),
        temp: Number(form.temp),
        spo2: Number(form.spo2),
      });
      toast.success("Vitals recorded successfully");
      setOpen(false);
      setForm({ bp: "", pulse: "", temp: "", spo2: "" });
      refetch();
    } catch {
      toast.error("Failed to record vitals");
    }
  };

  return (
    <AppShell role="nurse" title="Nurse" nav={nurseNav}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient Directory</h1>
          <p className="text-muted-foreground">{allPatients.length} patients currently admitted</p>
        </div>
        <Button variant="outline" size="sm" onClick={refetch} className="shrink-0">
          <RefreshCw className="h-3.5 w-3.5 mr-2" />Refresh Registry
        </Button>
      </div>

      {/* Search + Ward filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, code, bed..." className="pl-9" />
        </div>
      </div>

      {/* Ward filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {WARDS.map((w) => (
          <button
            key={w}
            onClick={() => setWardFilter(w)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              wardFilter === w
                ? "bg-rose-600 text-white border-rose-600 shadow-md"
                : "bg-secondary text-muted-foreground border-border hover:border-rose-400 hover:text-rose-600"
            }`}
          >
            {w}
          </button>
        ))}
      </div>

      {loading && <div className="flex items-center justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
      {error && (
        <div className="text-center py-16 text-destructive">
          <AlertCircle className="h-8 w-8 mx-auto mb-3" />
          <p>{error}</p>
        </div>
      )}

      {!loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p, i) => {
            const latestVital = p.vitals && p.vitals.length > 0
              ? [...p.vitals].sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())[0]
              : null;
            const condBadge = getConditionBadge(p.vitals);
            return (
              <motion.div key={p.id}
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                whileHover={{ y: -4 }}
                className="bg-card border border-border rounded-2xl p-5 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between">
                <div>
                  {/* Header */}
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <div>
                      <h3 className="font-bold text-base leading-tight text-card-foreground">{p.name}</h3>
                      <span className="font-mono text-xs text-primary">{p.patientCode}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {p.gender && (
                        <Badge className={p.gender === "Male" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" : "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300"}>
                          {p.gender}
                        </Badge>
                      )}
                      <Badge className={condBadge.cls}>{condBadge.label}</Badge>
                    </div>
                  </div>

                  {/* Ward / Room / Bed info */}
                  <div className="bg-secondary/60 dark:bg-secondary/40 rounded-xl p-3 mb-3 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5 text-rose-500 flex-shrink-0" />
                      <span className="font-semibold text-foreground">{p.ward ?? "General Ward"}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-[11px]">
                      <div className="flex flex-col items-center bg-background/60 rounded-lg py-1.5">
                        <Layers className="h-3 w-3 text-muted-foreground mb-0.5" />
                        <span className="font-bold text-foreground">{p.floorNo?.replace("Floor ", "F") ?? "F1"}</span>
                        <span className="text-muted-foreground text-[9px]">Floor</span>
                      </div>
                      <div className="flex flex-col items-center bg-background/60 rounded-lg py-1.5">
                        <Building2 className="h-3 w-3 text-muted-foreground mb-0.5" />
                        <span className="font-bold text-foreground">Rm {p.roomNo ?? "101"}</span>
                        <span className="text-muted-foreground text-[9px]">Room</span>
                      </div>
                      <div className="flex flex-col items-center bg-background/60 rounded-lg py-1.5">
                        <BedDouble className="h-3 w-3 text-muted-foreground mb-0.5" />
                        <span className="font-bold text-foreground text-[10px] truncate w-full text-center px-1">{p.bedNo?.split("-").slice(-1)[0] ?? "A1"}</span>
                        <span className="text-muted-foreground text-[9px]">Bed</span>
                      </div>
                    </div>
                  </div>

                  {/* Condition + admitted days */}
                  {p.condition && (
                    <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                      <Activity className="h-3 w-3 text-rose-500" />
                      <span>{p.condition}</span>
                      {p.admittedDays && <span className="ml-auto text-[10px] bg-secondary px-1.5 py-0.5 rounded-full">{p.admittedDays}d admitted</span>}
                    </div>
                  )}

                  {/* Latest vitals */}
                  {latestVital ? (
                    <div className="mt-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900 text-xs space-y-1">
                      <div className="font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-1">
                        <HeartPulse className="h-3 w-3" />Latest Vitals:
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-muted-foreground font-mono">
                        <div className="flex items-center gap-1"><Droplets className="h-2.5 w-2.5" />BP: {latestVital.bp}</div>
                        <div className="flex items-center gap-1"><Activity className="h-2.5 w-2.5" />HR: {latestVital.pulse}bpm</div>
                        <div className="flex items-center gap-1"><Thermometer className="h-2.5 w-2.5" />T: {latestVital.temp}°C</div>
                        <div className="flex items-center gap-1"><HeartPulse className="h-2.5 w-2.5" />SpO₂: {latestVital.spo2}%</div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 p-3 rounded-xl bg-secondary/40 border border-dashed text-xs text-muted-foreground text-center">
                      No vitals logged yet
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-3 flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    {p.bloodGroup && <span className="text-xs font-bold text-foreground bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full">{p.bloodGroup}</span>}
                    {p.age && <span className="text-xs text-muted-foreground">{p.age}y</span>}
                  </div>
                  <Button size="sm" variant="outline" className="h-8 text-xs flex items-center gap-1 text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    onClick={() => { setSelectedPat(p); setOpen(true); }}>
                    <Plus className="h-3 w-3" /> Vitals
                  </Button>
                </div>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted-foreground bg-secondary/20 rounded-2xl border">
              No patients found matching the query.
            </div>
          )}
        </div>
      )}

      {/* Record Vitals Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><HeartPulse className="h-5 w-5 text-rose-500" />Record Vitals — {selectedPat?.name}</DialogTitle>
            <DialogDescription>Submit clinical signs for {selectedPat?.patientCode} · {selectedPat?.bedNo}.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div><Label>BP (mmHg)</Label><Input value={form.bp} onChange={(e) => setForm({ ...form, bp: e.target.value })} placeholder="120/80" className="mt-1.5" /></div>
            <div><Label>Pulse (bpm)</Label><Input type="number" value={form.pulse} onChange={(e) => setForm({ ...form, pulse: e.target.value })} placeholder="72" className="mt-1.5" /></div>
            <div><Label>Temp (°C)</Label><Input type="number" step="0.1" value={form.temp} onChange={(e) => setForm({ ...form, temp: e.target.value })} placeholder="36.8" className="mt-1.5" /></div>
            <div><Label>SpO₂ (%)</Label><Input type="number" value={form.spo2} onChange={(e) => setForm({ ...form, spo2: e.target.value })} placeholder="98" className="mt-1.5" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submitVitals} className="bg-gradient-red text-white">Save Vitals</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
