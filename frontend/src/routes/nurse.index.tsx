import { createFileRoute } from "@tanstack/react-router";
import {
  HeartPulse, Pill, Users, ClipboardCheck, Loader2, Monitor, Activity,
  Bed, AlertTriangle, Syringe, Clock, CheckCircle2, BedDouble, RefreshCw
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { nurseNav } from "@/lib/roleNav";
import { useState } from "react";
import { toast } from "sonner";
import { bedAPI, patientAPI } from "@/lib/api/client";
import useApi from "@/hooks/useApi";
import { getUser } from "@/lib/auth";

import { Slideshow } from "@/components/Slideshow";
import { nurseSlides } from "@/lib/mockData";
import { RoleRequestModal } from "@/components/RoleRequestModal";
import { PatientICUMonitorModal, PatientMonitorData } from "@/components/PatientICUMonitorModal";

export const Route = createFileRoute("/nurse/")({
  head: () => ({ meta: [{ title: "Nurse Dashboard — MediCore" }] }),
  component: NurseScreen,
});

interface BedRow {
  id: number;
  bed: string;
  roomNo: string;
  floorNo: string;
  ward: string;
  name: string;
  patientCode: string;
  status: "Stable" | "Observation" | "Critical";
  patientId?: number;
  bp: string;
  hr: number;
  temp: string;
  o2: number;
  condition: string;
}

const DEFAULT_NURSE_PATIENTS: BedRow[] = [
  { id: 101, bed: "ICU-04", roomNo: "ICU-02", floorNo: "Floor 2", ward: "ICU", name: "Muhammad Usama Khan", patientCode: "P-1001", status: "Critical", patientId: 101, bp: "145/90", hr: 102, temp: "38.1°C", o2: 93, condition: "Acute Cardiac Monitoring" },
  { id: 102, bed: "Bed-302A", roomNo: "302", floorNo: "Floor 3", ward: "General Ward", name: "Sara Ahmed", patientCode: "P-1002", status: "Stable", patientId: 102, bp: "118/76", hr: 74, temp: "36.6°C", o2: 99, condition: "Post-op Appendectomy" },
  { id: 103, bed: "Bed-114B", roomNo: "114", floorNo: "Floor 1", ward: "Medical Ward", name: "Hamza Riaz", patientCode: "P-1003", status: "Observation", patientId: 103, bp: "128/82", hr: 82, temp: "37.2°C", o2: 97, condition: "Hypertension Control" },
  { id: 104, bed: "Bed-205", roomNo: "205", floorNo: "Floor 2", ward: "Surgical Ward", name: "Fatima Noor", patientCode: "P-1004", status: "Stable", patientId: 104, bp: "122/78", hr: 76, temp: "37.0°C", o2: 98, condition: "Post-op Care" },
  { id: 105, bed: "ICU-07", roomNo: "ICU-03", floorNo: "Floor 2", ward: "ICU", name: "Ali Hassan Sheikh", patientCode: "P-1005", status: "Critical", patientId: 105, bp: "150/95", hr: 112, temp: "38.5°C", o2: 91, condition: "Respiratory Failure" },
  { id: 106, bed: "Bed-408A", roomNo: "408", floorNo: "Floor 4", ward: "Maternity Ward", name: "Ayesha Malik", patientCode: "P-1006", status: "Stable", patientId: 106, bp: "110/70", hr: 68, temp: "36.8°C", o2: 100, condition: "Routine Post-delivery" },
  { id: 107, bed: "Bed-312C", roomNo: "312", floorNo: "Floor 3", ward: "Orthopedic Ward", name: "Bilal Chaudhry", patientCode: "P-1007", status: "Observation", patientId: 107, bp: "130/85", hr: 80, temp: "37.1°C", o2: 97, condition: "Hip Replacement Post-op" },
  { id: 108, bed: "Bed-501", roomNo: "501", floorNo: "Floor 5", ward: "Neurology Ward", name: "Zainab Qureshi", patientCode: "P-1008", status: "Stable", patientId: 108, bp: "120/80", hr: 72, temp: "36.9°C", o2: 99, condition: "Migraine Protocol" },
];

function NurseScreen() {
  const currentUser = getUser();
  const nurseName = currentUser?.name || "Nurse Staff";
  const [open, setOpen] = useState(false);
  const [monitorPatient, setMonitorPatient] = useState<PatientMonitorData | null>(null);
  const [form, setForm] = useState({ patientId: 0, bp: "", hr: "", temp: "", o2: "", status: "Stable" });

  const { data: apiBeds, loading: loadingBeds, refetch: refetchBeds } = useApi(() => bedAPI.getAll());
  const { data: apiPatients, loading: loadingPatients, refetch: refetchPatients } = useApi(() => patientAPI.getAll());

  // Map beds to display rows
  const list: BedRow[] = (apiBeds && Array.isArray(apiBeds) && apiBeds.length > 0 && apiPatients && Array.isArray(apiPatients) && apiPatients.length > 0)
    ? (apiBeds as any[]).filter((b: any) => b.status === "Occupied").map((b: any, idx: number) => {
      const patient = (apiPatients as any[]).find((p: any) => p.id === b.patientId);
      const latestVital = patient?.vitals && patient.vitals.length > 0
        ? [...patient.vitals].sort((a: any, b: any) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())[0]
        : null;

      let rowStatus: "Stable" | "Observation" | "Critical" = "Stable";
      if (latestVital) {
        if (latestVital.spo2 < 94 || latestVital.temp > 38.0 || latestVital.pulse > 100) {
          rowStatus = "Critical";
        } else if (latestVital.spo2 < 96 || latestVital.temp > 37.5) {
          rowStatus = "Observation";
        }
      }

      const mockFallback = DEFAULT_NURSE_PATIENTS[idx % DEFAULT_NURSE_PATIENTS.length];

      return {
        id: b.id,
        bed: b.bedNumber || mockFallback.bed,
        roomNo: mockFallback.roomNo,
        floorNo: mockFallback.floorNo,
        ward: mockFallback.ward,
        name: patient ? patient.name : mockFallback.name,
        patientCode: patient ? (patient.patientCode || `P-100${idx + 1}`) : mockFallback.patientCode,
        status: rowStatus,
        patientId: b.patientId || mockFallback.patientId,
        bp: latestVital ? latestVital.bp : mockFallback.bp,
        hr: latestVital ? latestVital.pulse : mockFallback.hr,
        temp: latestVital ? `${latestVital.temp}°C` : mockFallback.temp,
        o2: latestVital ? latestVital.spo2 : mockFallback.o2,
        condition: mockFallback.condition,
      };
    })
    : DEFAULT_NURSE_PATIENTS;

  const handleOpenMonitor = (p: BedRow) => {
    setMonitorPatient({
      id: String(p.patientId || p.id),
      name: p.name,
      age: 45,
      gender: "Male",
      bedNo: p.bed,
      roomNo: p.roomNo,
      condition: p.condition,
      attendingDoctor: "Dr. Arshad Mahmood",
      heartRate: p.hr || 78,
      spO2: p.o2 || 98,
      bp: p.bp || "120/80",
      temp: parseFloat(p.temp) || 37.0,
      respRate: p.status === "Critical" ? 24 : 16,
      ivDrip: {
        name: "Normal Saline (0.9%)",
        flowRate: p.status === "Critical" ? 40 : 20,
        remainingPercent: 65,
        status: "Flowing"
      },
      medications: [
        { id: "m1", name: "Cefazolin 1g IV", dosage: "1 Vial", time: "10:00 AM", status: "Pending" },
        { id: "m2", name: "Paracetamol 1000mg IV", dosage: "100ml Infusion", time: "08:00 AM", status: "Given" }
      ],
      stocks: [
        { id: "s1", name: "0.9% Saline Bags", quantity: 12, unit: "Bags", status: "In Stock" },
        { id: "s2", name: "20G IV Cannula", quantity: 5, unit: "Pcs", status: "Low Stock" },
        { id: "s3", name: "Syringes (10ml)", quantity: 40, unit: "Pcs", status: "In Stock" },
        { id: "s4", name: "Paracetamol IV", quantity: 4, unit: "Vials", status: "Low Stock" }
      ]
    });
  };

  const handleRecordVital = async () => {
    if (!form.patientId || !form.bp || !form.hr || !form.temp || !form.o2) {
      return toast.error("Fill all vital fields");
    }
    try {
      await patientAPI.recordVitals({
        patientId: form.patientId,
        bp: form.bp,
        pulse: Number(form.hr),
        temp: Number(form.temp),
        spo2: Number(form.o2),
      });
      toast.success("Vitals recorded successfully");
      refetchBeds();
      refetchPatients();
      setOpen(false);
      setForm({ patientId: 0, bp: "", hr: "", temp: "", o2: "", status: "Stable" });
    } catch {
      toast.error("Failed to record vitals");
    }
  };

  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const loading = loadingBeds && loadingPatients;

  const criticalCount = list.filter((r) => r.status === "Critical").length;
  const observationCount = list.filter((r) => r.status === "Observation").length;

  return (
    <AppShell role="nurse" title="Nurse" nav={nurseNav}>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Good day, <span className="text-gradient">{nurseName}</span> 🧑‍⚕️</h1>
          <p className="text-muted-foreground">Inpatient Ward Roster & Clinical Vitals Overview</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { refetchBeds(); refetchPatients(); }}>
            <RefreshCw className="h-4 w-4 mr-2" />Refresh
          </Button>
          <Button
            onClick={() => setRequestModalOpen(true)}
            className="bg-gradient-red text-white shadow-glow-red font-semibold"
          >
            <Bed className="h-4 w-4 mr-2" /> Request Beds / Equipment
          </Button>
        </div>
      </div>

      {/* Hero Slideshow */}
      <div className="mb-6">
        <Slideshow slides={nurseSlides} />
      </div>

      {/* Critical Alert Banner if critical cases present */}
      {criticalCount > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-rose-600 animate-pulse flex-shrink-0" />
            <div>
              <div className="font-bold text-rose-800 dark:text-rose-300">{criticalCount} Critical Patient{criticalCount > 1 ? "s" : ""} Under ICU Watch</div>
              <div className="text-xs text-rose-600 dark:text-rose-400">SpO₂ below 94% or HR elevated — immediate nursing intervention recommended.</div>
            </div>
          </div>
          <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white shrink-0" onClick={() => setOpen(true)}>
            Record Vitals
          </Button>
        </motion.div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Admitted Patients" value={String(list.length)} icon={Users} delay={0} />
        <StatCard label="Active Injections" value="8 Scheduled" icon={Syringe} delay={0.05} />
        <StatCard label="Critical ICU Watch" value={String(criticalCount)} icon={AlertTriangle} delay={0.1} />
        <StatCard label="Observation Status" value={String(observationCount)} icon={Activity} delay={0.15} />
      </div>

      {/* Live Vitals Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border">
            <div>
              <h3 className="font-bold text-lg text-card-foreground">Inpatient Vitals & Bed Monitor</h3>
              <p className="text-xs text-muted-foreground">Showing {list.length} admitted patients across all hospital wings</p>
            </div>
            <Button onClick={() => setOpen(true)} className="bg-gradient-red text-white shadow-glow-red"><HeartPulse className="h-4 w-4 mr-2" />Record Vitals</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-5 py-3">Ward / Bed</th>
                  <th className="text-left px-5 py-3">Patient</th>
                  <th className="text-left px-5 py-3">Condition</th>
                  <th className="text-left px-5 py-3">BP</th>
                  <th className="text-left px-5 py-3">HR</th>
                  <th className="text-left px-5 py-3">Temp</th>
                  <th className="text-left px-5 py-3">SpO₂</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-left px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {list.map((p, i) => (
                  <motion.tr key={p.bed + i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 + i * 0.03 }}
                    className="hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold font-mono text-primary text-xs">{p.bed}</div>
                      <div className="text-[10px] text-muted-foreground">{p.ward} · {p.roomNo}</div>
                    </td>
                    <td className="px-5 py-3.5 font-medium">
                      <div className="text-card-foreground font-semibold">{p.name}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">{p.patientCode}</div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground max-w-[150px] truncate">{p.condition}</td>
                    <td className="px-5 py-3.5 font-mono text-xs">{p.bp}</td>
                    <td className="px-5 py-3.5 font-mono text-xs">{p.hr > 0 ? `${p.hr} bpm` : "—"}</td>
                    <td className="px-5 py-3.5 font-mono text-xs">{p.temp !== "—" ? `${p.temp}` : "—"}</td>
                    <td className="px-5 py-3.5 font-mono text-xs">{p.o2 > 0 ? `${p.o2}%` : "—"}</td>
                    <td className="px-5 py-3.5">
                      <Badge className={
                        p.status === "Critical" ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300" :
                          p.status === "Observation" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" :
                            "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                      }>{p.status}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1.5">
                        <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white" onClick={() => handleOpenMonitor(p)}>
                          <Monitor className="h-3 w-3 mr-1" /> Live Monitor
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => {
                          setForm({
                            patientId: p.patientId || 0,
                            bp: p.bp === "—" ? "" : p.bp,
                            hr: p.hr > 0 ? String(p.hr) : "",
                            temp: p.temp === "—" ? "" : p.temp,
                            o2: p.o2 > 0 ? String(p.o2) : "",
                            status: p.status,
                          });
                          setOpen(true);
                        }}>Update</Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Record Vitals Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><HeartPulse className="h-5 w-5 text-rose-500" />Record Vitals</DialogTitle>
            <DialogDescription>Log fresh vitals for the selected patient.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Bed / Patient</Label>
              <Select
                value={form.patientId ? String(form.patientId) : undefined}
                onValueChange={(v) => setForm({ ...form, patientId: Number(v) })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select patient..." />
                </SelectTrigger>
                <SelectContent>
                  {list.map(r => (
                    <SelectItem key={r.id} value={String(r.patientId || 0)}>
                      {r.bed} • {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>BP (mmHg)</Label><Input value={form.bp} onChange={(e) => setForm({ ...form, bp: e.target.value })} placeholder="120/80" className="mt-1.5" /></div>
              <div><Label>HR (bpm)</Label><Input type="number" value={form.hr} onChange={(e) => setForm({ ...form, hr: e.target.value })} placeholder="72" className="mt-1.5" /></div>
              <div><Label>Temp (°C)</Label><Input value={form.temp} onChange={(e) => setForm({ ...form, temp: e.target.value })} placeholder="36.8" className="mt-1.5" /></div>
              <div><Label>SpO₂ (%)</Label><Input type="number" value={form.o2} onChange={(e) => setForm({ ...form, o2: e.target.value })} placeholder="98" className="mt-1.5" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleRecordVital} className="bg-gradient-red text-white">Save Vitals</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Live ICU Patient Monitor Screen */}
      <PatientICUMonitorModal
        patient={monitorPatient}
        isOpen={Boolean(monitorPatient)}
        onClose={() => setMonitorPatient(null)}
      />

      {/* Role Request Modal for Admin Equipment Demand */}
      <RoleRequestModal
        open={requestModalOpen}
        onOpenChange={setRequestModalOpen}
        role="nurse"
        defaultCategory="Equipment & Furniture"
      />
    </AppShell>
  );
}
