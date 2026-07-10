import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { nurseNav } from "@/lib/roleNav";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { HeartPulse, Loader2, Plus, AlertCircle } from "lucide-react";
import { patientAPI } from "@/lib/api/client";
import useApi from "@/hooks/useApi";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/nurse/vitals")({
  head: () => ({ meta: [{ title: "Vitals — Nurse" }] }),
  component: NurseVitalsScreen,
});

interface ApiPatient { id: number; name: string; patientCode: string; vitals: Vital[]; }
interface Vital { id: number; recordedAt: string; bp: string; pulse: number; temp: number; spo2: number; recordedBy?: string; }

function NurseVitalsScreen() {
  const { data: rawPatients, loading, error, refetch } = useApi(() => patientAPI.getAll());
  const patients = (rawPatients as unknown as ApiPatient[]) ?? [];

  const [open, setOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [form, setForm] = useState({ bp: "", pulse: "", temp: "", spo2: "" });

  const submit = async () => {
    if (!selectedPatientId) return toast.error("Please select a patient");
    if (!form.bp || !form.pulse || !form.temp || !form.spo2) return toast.error("Fill all vital fields");
    try {
      await patientAPI.recordVitals({
        patientId: selectedPatientId,
        bp: form.bp,
        pulse: Number(form.pulse),
        temp: Number(form.temp),
        spo2: Number(form.spo2),
      });
      toast.success("Vitals recorded successfully");
      setOpen(false);
      setForm({ bp: "", pulse: "", temp: "", spo2: "" });
      setSelectedPatientId(null);
      refetch();
    } catch {
      toast.error("Failed to record vitals");
    }
  };

  // Build a flat vitals log across all patients
  const vitalsLog = patients.flatMap((p) =>
    (p.vitals ?? []).map((v) => ({ ...v, patientName: p.name, patientCode: p.patientCode }))
  ).sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());

  return (
    <AppShell role="nurse" title="Nurse" nav={nurseNav}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vitals Log</h1>
          <p className="text-muted-foreground">Patient vitals history across all wards</p>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-gradient-red text-white shadow-glow-red">
          <Plus className="h-4 w-4 mr-2" />Record Vitals
        </Button>
      </div>

      {loading && <div className="flex items-center justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
      {error && (
        <div className="text-center py-16 text-destructive">
          <AlertCircle className="h-8 w-8 mx-auto mb-3" />
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-gradient-card border border-border rounded-2xl shadow-card overflow-hidden">
          <div className="p-6 flex items-center gap-2">
            <HeartPulse className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Vitals History ({vitalsLog.length} entries)</h3>
          </div>

          {vitalsLog.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">No vitals recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="text-left px-6 py-3">Date & Time</th>
                    <th className="text-left px-6 py-3">Patient</th>
                    <th className="text-left px-6 py-3">BP</th>
                    <th className="text-left px-6 py-3">Pulse</th>
                    <th className="text-left px-6 py-3">Temp</th>
                    <th className="text-left px-6 py-3">SpO₂</th>
                    <th className="text-left px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {vitalsLog.map((v, i) => {
                    const spo2Warn = v.spo2 < 94;
                    const pulseWarn = v.pulse > 100 || v.pulse < 55;
                    const tempWarn = v.temp > 38.0;
                    const isAlert = spo2Warn || pulseWarn || tempWarn;
                    return (
                      <motion.tr key={v.id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 + i * 0.03 }}
                        className="border-t border-border hover:bg-secondary/30 transition-colors">
                        <td className="px-6 py-4 text-muted-foreground text-xs">
                          {new Date(v.recordedAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-medium">
                          <div>{v.patientName}</div>
                          <div className="text-xs text-muted-foreground">{v.patientCode}</div>
                        </td>
                        <td className="px-6 py-4 font-mono">{v.bp}</td>
                        <td className={`px-6 py-4 font-mono ${pulseWarn ? "text-rose-600 font-bold" : ""}`}>{v.pulse} bpm</td>
                        <td className={`px-6 py-4 font-mono ${tempWarn ? "text-amber-600 font-bold" : ""}`}>{v.temp}°C</td>
                        <td className={`px-6 py-4 font-mono ${spo2Warn ? "text-rose-600 font-bold" : ""}`}>{v.spo2}%</td>
                        <td className="px-6 py-4">
                          <Badge className={isAlert ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}>
                            {isAlert ? "⚠ Alert" : "Normal"}
                          </Badge>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* Record Vitals Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><HeartPulse className="h-5 w-5 text-rose-500" />Record Vitals</DialogTitle>
            <DialogDescription>Log new vitals for a patient.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Patient</Label>
              <Select onValueChange={(v) => setSelectedPatientId(Number(v))}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select patient…" /></SelectTrigger>
                <SelectContent>
                  {patients.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name} ({p.patientCode})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>BP (mmHg)</Label><Input value={form.bp} onChange={(e) => setForm({ ...form, bp: e.target.value })} placeholder="120/80" className="mt-1.5" /></div>
              <div><Label>Pulse (bpm)</Label><Input type="number" value={form.pulse} onChange={(e) => setForm({ ...form, pulse: e.target.value })} placeholder="72" className="mt-1.5" /></div>
              <div><Label>Temp (°C)</Label><Input type="number" step="0.1" value={form.temp} onChange={(e) => setForm({ ...form, temp: e.target.value })} placeholder="36.8" className="mt-1.5" /></div>
              <div><Label>SpO₂ (%)</Label><Input type="number" value={form.spo2} onChange={(e) => setForm({ ...form, spo2: e.target.value })} placeholder="98" className="mt-1.5" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit} className="bg-gradient-red text-white">Save Vitals</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
