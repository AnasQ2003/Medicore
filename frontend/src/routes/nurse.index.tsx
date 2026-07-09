import { createFileRoute } from "@tanstack/react-router";
import { HeartPulse, Pill, Users, ClipboardCheck } from "lucide-react";
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

export const Route = createFileRoute("/nurse/")({
  head: () => ({ meta: [{ title: "Nurse — MediCore" }] }),
  component: NurseScreen,
});

type Row = { bed: string; name: string; bp: string; hr: number; temp: string; o2: number; status: string };

const seed: Row[] = [
  { bed: "ICU-3", name: "Ahmed Ali", bp: "138/92", hr: 88, temp: "37.2", o2: 96, status: "Stable" },
  { bed: "B-12", name: "Fatima Noor", bp: "120/80", hr: 72, temp: "36.8", o2: 99, status: "Stable" },
  { bed: "ICU-1", name: "Hassan Raza", bp: "150/100", hr: 104, temp: "38.4", o2: 92, status: "Critical" },
  { bed: "A-07", name: "Ayesha Tariq", bp: "118/76", hr: 68, temp: "36.6", o2: 98, status: "Observation" },
];

function NurseScreen() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ patientId: 0, bp: "", hr: "0", temp: "", o2: "0", status: "Stable" });

  const { data: apiBeds, refetch: refetchBeds } = useApi(() => bedAPI.getAll());
  const { data: apiPatients } = useApi(() => patientAPI.getAll());

  // Map beds to display rows
  type BedRow = { id: number; bed: string; name: string; status: string; patientId?: number };
  const list: BedRow[] = (apiBeds as unknown as { id: number; bedNumber: string; status: string; patientName?: string; patientId?: number }[]) 
    ? (apiBeds as unknown as { id: number; bedNumber: string; status: string; patientName?: string; patientId?: number }[]).filter(b => b.status === 'Occupied').map(b => ({
        id: b.id, bed: b.bedNumber, name: b.patientName || 'Unknown', status: 'Stable', patientId: b.patientId
      }))
    : seed;

  const recordVitals = async () => {
    if (!form.bp || !form.hr || !form.temp || !form.o2) return toast.error("Please fill all vitals");
    if (!form.patientId) return toast.error("No patient selected");
    try {
      await patientAPI.recordVitals({ patientId: form.patientId, bp: form.bp, pulse: Number(form.hr), temp: Number(form.temp), spo2: Number(form.o2) });
      toast.success("Vitals recorded successfully");
      refetchBeds();
    } catch { toast.error("Failed to record vitals"); }
    setOpen(false);
  };
  const cycleStatus = async (bedId: number, current: string) => {
    const next: Record<string, string> = { Vacant: 'Occupied', Occupied: 'Maintenance', Maintenance: 'Vacant' };
    try { await bedAPI.updateStatus(bedId, next[current] || 'Vacant'); refetchBeds(); }
    catch { toast.error("Failed"); }
  };

  return (
    <AppShell role="nurse" title="Nurse" nav={nurseNav}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Assigned Patients</h1>
        <p className="text-muted-foreground">Ward A, B & ICU — Shift 08:00–20:00</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Assigned" value={String(list.length)} icon={Users} delay={0} />
        <StatCard label="Vitals Due" value="6" change="Next: 11:30" icon={HeartPulse} delay={0.05} />
        <StatCard label="Medications" value="22" change="4 overdue" icon={Pill} delay={0.1} />
        <StatCard label="Critical" value={String(list.filter(r=>r.status==="Critical").length)} change="ICU" icon={ClipboardCheck} delay={0.15} />
      </div>

      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}} className="mt-6 bg-gradient-card border border-border rounded-2xl shadow-card overflow-hidden">
        <div className="p-6 flex items-center justify-between">
          <h3 className="font-semibold">Live Vitals</h3>
          <Button onClick={() => setOpen(true)} className="bg-gradient-red text-white shadow-glow-red"><HeartPulse className="h-4 w-4 mr-2"/>Record Vitals</Button>
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
                  <td className="px-6 py-4">{p.bp}</td>
                  <td className="px-6 py-4">{p.hr} bpm</td>
                  <td className="px-6 py-4">{p.temp}°C</td>
                  <td className="px-6 py-4">{p.o2}%</td>
                  <td className="px-6 py-4">
                    <Badge className={
                      p.status === "Critical" ? "bg-rose-100 text-rose-700" :
                      p.status === "Observation" ? "bg-amber-100 text-amber-700" :
                      "bg-emerald-100 text-emerald-700"
                    }>{p.status}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="outline" onClick={() => { setForm({ ...p }); setOpen(true); }}>Update</Button>
                      <Button size="sm" variant="outline" onClick={() => cycleStatus(p.bed)}>Status</Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><HeartPulse className="h-5 w-5 text-rose-500"/>Record Vitals</DialogTitle>
            <DialogDescription>Log fresh vitals for the selected bed.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Bed / Patient</Label>
              <Select value={form.bed} onValueChange={(v) => { const r = list.find(x => x.bed === v); if (r) setForm({ ...form, bed: r.bed, name: r.name }); }}>
                <SelectTrigger className="mt-1.5"><SelectValue/></SelectTrigger>
                <SelectContent>
                  {list.map(r => <SelectItem key={r.bed} value={r.bed}>{r.bed} • {r.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>BP (mmHg)</Label><Input value={form.bp} onChange={(e) => setForm({ ...form, bp: e.target.value })} placeholder="120/80" className="mt-1.5"/></div>
              <div><Label>HR (bpm)</Label><Input type="number" value={form.hr || ""} onChange={(e) => setForm({ ...form, hr: parseInt(e.target.value) || 0 })} className="mt-1.5"/></div>
              <div><Label>Temp (°C)</Label><Input value={form.temp} onChange={(e) => setForm({ ...form, temp: e.target.value })} placeholder="36.8" className="mt-1.5"/></div>
              <div><Label>SpO₂ (%)</Label><Input type="number" value={form.o2 || ""} onChange={(e) => setForm({ ...form, o2: parseInt(e.target.value) || 0 })} className="mt-1.5"/></div>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Stable">Stable</SelectItem>
                  <SelectItem value="Observation">Observation</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={recordVitals} className="bg-gradient-red text-white">Save vitals</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
