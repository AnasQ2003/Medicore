import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { nurseNav } from "@/lib/roleNav";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, AlertCircle, RefreshCw, Phone, MapPin, HeartPulse, Plus } from "lucide-react";
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
  vitals?: { bp: string; pulse: number; temp: number; spo2: number; recordedAt: string }[];
}

function NursePatientsScreen() {
  const { data: rawPatients, loading, error, refetch } = useApi(() => patientAPI.getAll());
  const patients = (rawPatients as unknown as Patient[]) ?? [];
  const patientRegistry = patients.filter((u: any) => u.role === "patient" || u.patientCode);

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedPat, setSelectedPat] = useState<Patient | null>(null);
  const [form, setForm] = useState({ bp: "", pulse: "", temp: "", spo2: "" });

  const filtered = patientRegistry.filter((p) =>
    p.name.toLowerCase().includes(q.toLowerCase()) || 
    p.patientCode.toLowerCase().includes(q.toLowerCase())
  );

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
          <p className="text-muted-foreground">{patientRegistry.length} patients registered</p>
        </div>
        <Button variant="outline" size="sm" onClick={refetch} className="shrink-0">
          <RefreshCw className="h-3.5 w-3.5 mr-2" />Refresh Registry
        </Button>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patients..." className="pl-9" />
        </div>
      </div>

      {loading && <div className="flex items-center justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
      {error && (
        <div className="text-center py-16 text-destructive">
          <AlertCircle className="h-8 w-8 mx-auto mb-3" />
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p, i) => {
            const latestVital = p.vitals && p.vitals.length > 0
              ? [...p.vitals].sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())[0]
              : null;
            return (
              <motion.div key={p.id}
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                whileHover={{ y: -4 }}
                className="bg-white border rounded-2xl p-5 shadow-card hover:shadow-elevated transition flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <div>
                      <h3 className="font-bold text-lg leading-tight">{p.name}</h3>
                      <span className="font-mono text-xs text-primary">{p.patientCode}</span>
                    </div>
                    {p.gender && (
                      <Badge className={p.gender === "Male" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"}>
                        {p.gender}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-1.5 my-3 text-sm text-muted-foreground">
                    {p.phone && <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /><span>{p.phone}</span></div>}
                    {p.address && <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /><span className="truncate">{p.address}</span></div>}
                  </div>

                  {latestVital ? (
                    <div className="mt-3 p-3 rounded-xl bg-rose-50/50 border border-rose-100 text-xs space-y-1">
                      <div className="font-semibold text-rose-700 flex items-center gap-1"><HeartPulse className="h-3 w-3" />Latest Vitals:</div>
                      <div className="grid grid-cols-2 gap-1 text-muted-foreground font-mono">
                        <div>BP: {latestVital.bp}</div>
                        <div>HR: {latestVital.pulse} bpm</div>
                        <div>Temp: {latestVital.temp}°C</div>
                        <div>SpO₂: {latestVital.spo2}%</div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-dashed text-xs text-muted-foreground text-center">
                      No vitals logged yet
                    </div>
                  )}
                </div>

                <div className="border-t pt-3 flex items-center justify-between mt-4">
                  <span className="text-xs">Blood: <span className="font-bold">{p.bloodGroup || "—"}</span></span>
                  <Button size="sm" variant="outline" className="h-8 text-xs flex items-center gap-1 text-rose-600 border-rose-200 hover:bg-rose-50"
                    onClick={() => { setSelectedPat(p); setOpen(true); }}>
                    <Plus className="h-3 w-3" /> Record Vitals
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
            <DialogDescription>Submit clinical signs for {selectedPat?.patientCode}.</DialogDescription>
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
