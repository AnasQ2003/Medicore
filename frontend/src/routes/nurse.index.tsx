import { createFileRoute } from "@tanstack/react-router";
import { HeartPulse, Pill, Users, ClipboardCheck, Loader2 } from "lucide-react";
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

export const Route = createFileRoute("/nurse/")({
  head: () => ({ meta: [{ title: "Nurse — MediCore" }] }),
  component: NurseScreen,
});

interface BedRow {
  id: number;
  bed: string;
  name: string;
  status: "Stable" | "Observation" | "Critical";
  patientId?: number;
  bp: string;
  hr: number;
  temp: string;
  o2: number;
}

function NurseScreen() {
  const currentUser = getUser();
  const nurseName = currentUser?.name || "Nurse Staff";
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ patientId: 0, bp: "", hr: "", temp: "", o2: "", status: "Stable" });

  const { data: apiBeds, loading: loadingBeds, refetch: refetchBeds } = useApi(() => bedAPI.getAll());
  const { data: apiPatients, loading: loadingPatients, refetch: refetchPatients } = useApi(() => patientAPI.getAll());

  // Map beds to display rows
  const list: BedRow[] = (apiBeds && apiPatients)
    ? (apiBeds as any[]).filter((b: any) => b.status === "Occupied").map((b: any) => {
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

        return {
          id: b.id,
          bed: b.bedNumber,
          name: patient ? patient.name : "Unassigned",
          status: rowStatus,
          patientId: b.patientId,
          bp: latestVital ? latestVital.bp : "120/80",
          hr: latestVital ? latestVital.pulse : 72,
          temp: latestVital ? `${latestVital.temp}°C` : "36.8°C",
          o2: latestVital ? latestVital.spo2 : 98,
        };
      })
    : [];

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

  const cycleStatus = async (bedId: number, current: string) => {
    const next: Record<string, string> = { Vacant: "Occupied", Occupied: "Maintenance", Maintenance: "Vacant" };
    try {
      await bedAPI.updateStatus(bedId, next[current] || "Vacant");
      refetchBeds();
    } catch {
      toast.error("Failed to update bed status");
    }
  };

  const loading = loadingBeds || loadingPatients;

  return (
    <AppShell role="nurse" title="Nurse" nav={nurseNav}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Good morning, <span className="text-gradient">{nurseName}</span> 👋</h1>
        <p className="text-muted-foreground">Ward Bed & Patient vitals tracking</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Assigned Patients" value={String(list.length)} icon={Users} delay={0} />
        <StatCard label="Vitals Logged" value={String(list.filter(p => p.bp !== "—").length)} icon={HeartPulse} delay={0.05} />
        <StatCard label="Critical Cases" value={String(list.filter((r) => r.status === "Critical").length)} icon={ClipboardCheck} delay={0.1} />
        <StatCard label="Stable Cases" value={String(list.filter((r) => r.status === "Stable").length)} icon={Pill} delay={0.15} />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6 bg-gradient-card border border-border rounded-2xl shadow-card overflow-hidden">
          <div className="p-6 flex items-center justify-between">
            <h3 className="font-semibold">Live Patient Vitals</h3>
            <Button onClick={() => setOpen(true)} className="bg-gradient-red text-white shadow-glow-red"><HeartPulse className="h-4 w-4 mr-2" />Record Vitals</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-6 py-3">Bed</th>
                  <th className="text-left px-6 py-3">Patient</th>
                  <th className="text-left px-6 py-3">BP</th>
                  <th className="text-left px-6 py-3">HR</th>
                  <th className="text-left px-6 py-3">Temp</th>
                  <th className="text-left px-6 py-3">SpO₂</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="text-left px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {list.map((p, i) => (
                  <motion.tr key={p.bed} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 + i * 0.05 }}
                    className="border-t border-border hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-primary">{p.bed}</td>
                    <td className="px-6 py-4 font-medium">{p.name}</td>
                    <td className="px-6 py-4 font-mono">{p.bp}</td>
                    <td className="px-6 py-4 font-mono">{p.hr > 0 ? `${p.hr} bpm` : "—"}</td>
                    <td className="px-6 py-4 font-mono">{p.temp !== "—" ? `${p.temp}°C` : "—"}</td>
                    <td className="px-6 py-4 font-mono">{p.o2 > 0 ? `${p.o2}%` : "—"}</td>
                    <td className="px-6 py-4">
                      <Badge className={
                        p.status === "Critical" ? "bg-rose-100 text-rose-700" :
                        p.status === "Observation" ? "bg-amber-100 text-amber-700" :
                        "bg-emerald-100 text-emerald-700"
                      }>{p.status}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="outline" onClick={() => {
                          setForm({
                            patientId: p.patientId || 0,
                            bp: p.bp === "—" ? "" : p.bp,
                            hr: p.hr > 0 ? String(p.hr) : "",
                            temp: p.temp === "—" ? "" : p.temp,
                            o2: p.o2 > 0 ? String(p.o2) : "",
                            status: p.status,
                          });
                          setOpen(true);
                        }}>Update Vitals</Button>
                        <Button size="sm" variant="outline" onClick={() => cycleStatus(p.id, "Occupied")}>Bed Status</Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {list.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-muted-foreground">No occupied beds at the moment.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

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
    </AppShell>
  );
}
