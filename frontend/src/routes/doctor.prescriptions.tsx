import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { doctorNav } from "@/lib/doctorNav";
import { prescriptions as seed } from "@/lib/mockData";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pill, Plus, Download, Search, Eye, Pencil, Trash2, Printer, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { prescriptionAPI } from "@/lib/api/client";
import useApi from "@/hooks/useApi";

export const Route = createFileRoute("/doctor/prescriptions")({
  head: () => ({ meta: [{ title: "Prescriptions — Doctor" }] }),
  component: PrescriptionsScreen,
});

type Rx = (typeof seed)[number];

function PrescriptionsScreen() {
  const [q, setQ] = useState("");
  const [view, setView] = useState<Rx | null>(null);
  const [editing, setEditing] = useState<Rx | null>(null);

  const { data: apiRx, refetch } = useApi(() => prescriptionAPI.getAll());
  const list: Rx[] = (apiRx as unknown as Rx[]) ?? seed;

  const filtered = list.filter(p => p.patient.toLowerCase().includes(q.toLowerCase()) || p.id.toLowerCase().includes(q.toLowerCase()));

  const saveEdit = () => {
    if (!editing) return;
    toast.success(`${editing.id} updated`);
    setEditing(null);
    refetch();
  };

  return (
    <AppShell role="doctor" title="Doctor" nav={doctorNav}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prescriptions</h1>
          <p className="text-muted-foreground">{list.length} total • {list.filter(p=>p.status==="Draft").length} drafts</p>
        </div>
        <Button onClick={() => toast.info("Open the patient EMR to draft a new Rx") } className="bg-gradient-red text-white shadow-glow-red"><Plus className="h-4 w-4 mr-2"/>New Rx</Button>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
          <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search by patient or Rx ID…" className="pl-9"/>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p, i) => (
          <motion.div key={p.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}
            whileHover={{y:-4}}
            className="bg-white border rounded-2xl p-5 shadow-card hover:shadow-elevated transition relative overflow-hidden">
            <div className="absolute top-0 right-0 h-24 w-24 rounded-bl-full bg-gradient-red opacity-10"/>
            <div className="flex items-center gap-3 mb-3 relative z-10">
              <div className="h-12 w-12 rounded-xl bg-gradient-red text-white flex items-center justify-center shadow-glow-red">
                <Pill className="h-5 w-5"/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{p.patient}</div>
                <div className="text-xs text-muted-foreground">{p.id} • {p.date}</div>
              </div>
              <Badge className={p.status === "Issued" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>{p.status}</Badge>
            </div>
            <div className="text-sm bg-muted/50 rounded-lg p-3 mb-3 line-clamp-2">{p.items}</div>
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" variant="outline" onClick={() => setView(p)}><Eye className="h-3.5 w-3.5 mr-1.5"/>View</Button>
              <Button size="sm" onClick={() => setEditing({ ...p })} className="bg-gradient-primary text-white"><Pencil className="h-3.5 w-3.5 mr-1.5"/>Edit</Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("PDF downloading…")}><Download className="h-3.5 w-3.5 mr-1.5"/>PDF</Button>
              <Button size="sm" variant="outline" onClick={() => remove(p)} className="text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5 mr-1.5"/>Delete</Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* VIEW dialog */}
      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Pill className="h-5 w-5 text-rose-500"/>Prescription {view?.id}</DialogTitle>
            <DialogDescription>{view?.patient} • {view?.date}</DialogDescription>
          </DialogHeader>
          {view && (
            <div className="space-y-3">
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 rounded-xl p-4">
                <div className="text-xs uppercase tracking-wider text-rose-700 mb-2">Medications</div>
                <div className="text-sm whitespace-pre-line">{view.items}</div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-muted/40 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground">Status</div>
                  <div className="font-semibold">{view.status}</div>
                </div>
                <div className="bg-muted/40 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground">Prescribed by</div>
                  <div className="font-semibold">Dr. Sarah Khan</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground italic">Take medications as prescribed. Report any adverse effects immediately.</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => toast.success("Sent to patient")}>
              <Send className="h-4 w-4 mr-2"/>Send to patient
            </Button>
            <Button variant="outline" onClick={() => toast.success("Printing…")}><Printer className="h-4 w-4 mr-2"/>Print</Button>
            <Button onClick={() => { setEditing(view); setView(null); }} className="bg-gradient-primary text-white"><Pencil className="h-4 w-4 mr-2"/>Edit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit prescription {editing?.id}</DialogTitle>
            <DialogDescription>Update medications, dosing or status.</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div>
                <Label>Patient</Label>
                <Input value={editing.patient} onChange={(e) => setEditing({ ...editing, patient: e.target.value })} className="mt-1.5"/>
              </div>
              <div>
                <Label>Medications</Label>
                <textarea value={editing.items} onChange={(e) => setEditing({ ...editing, items: e.target.value })}
                  rows={5} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2 text-sm font-mono"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} className="mt-1.5"/>
                </div>
                <div>
                  <Label>Status</Label>
                  <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                    className="mt-1.5 w-full h-10 rounded-lg border bg-background px-3 text-sm">
                    <option>Draft</option><option>Issued</option><option>Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveEdit} className="bg-gradient-primary text-white">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
