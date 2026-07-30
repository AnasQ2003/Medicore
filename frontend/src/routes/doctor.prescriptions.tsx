import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { doctorNav } from "@/lib/roleNav";
import { prescriptions as seed } from "@/lib/mockData";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pill, Plus, Download, Search, Eye, Pencil, Trash2, Printer, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { prescriptionAPI } from "@/lib/api/client";
import useApi from "@/hooks/useApi";
import { generateGenericPDF } from "@/lib/pdfGenerator";

export const Route = createFileRoute("/doctor/prescriptions")({
  head: () => ({ meta: [{ title: "Prescriptions — Doctor" }] }),
  component: PrescriptionsScreen,
});

type Rx = (typeof seed)[number];

function PrescriptionsScreen() {
  const [q, setQ] = useState("");
  const [view, setView] = useState<Rx | null>(null);
  const [editing, setEditing] = useState<Rx | null>(null);
  const [newRxOpen, setNewRxOpen] = useState(false);

  const { data: apiRx } = useApi(() => prescriptionAPI.getAll());
  
  const [list, setList] = useState<Rx[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("medicore_doctor_prescriptions");
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return seed;
  });

  useEffect(() => {
    if (apiRx && Array.isArray(apiRx) && apiRx.length > 0) {
      setList(apiRx as unknown as Rx[]);
    }
  }, [apiRx]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("medicore_doctor_prescriptions", JSON.stringify(list));
    }
  }, [list]);

  const [newRxForm, setNewRxForm] = useState({
    patient: "Patient John Doe",
    items: "1. Amlodipine 5mg - 1 Tab Daily (Morning)\n2. Atorvastatin 10mg - 1 Tab Night\n3. Aspirin 75mg - 1 Tab Daily",
    status: "Issued"
  });

  const filtered = list.filter(p => p.patient.toLowerCase().includes(q.toLowerCase()) || p.id.toLowerCase().includes(q.toLowerCase()));

  const createRx = async () => {
    if (!newRxForm.items.trim()) return toast.error("Please enter medication items");
    const newId = `RX-${100 + list.length + 1}`;
    const newEntry: Rx = {
      id: newId,
      patient: newRxForm.patient,
      items: newRxForm.items,
      date: new Date().toISOString().split("T")[0],
      status: newRxForm.status
    };
    try {
      await prescriptionAPI.create({ patientId: 1, items: newRxForm.items, status: newRxForm.status });
    } catch {}
    setList([newEntry, ...list]);
    toast.success(`Prescription ${newId} created successfully`);
    setNewRxOpen(false);
    setNewRxForm({
      patient: "Patient John Doe",
      items: "1. Amlodipine 5mg - 1 Tab Daily (Morning)\n2. Atorvastatin 10mg - 1 Tab Night\n3. Aspirin 75mg - 1 Tab Daily",
      status: "Issued"
    });
  };

  const remove = (p: Rx) => {
    setList(list.filter(x => x.id !== p.id));
    toast.success(`${p.id} removed`);
  };

  const saveEdit = () => {
    if (!editing) return;
    setList(list.map(x => x.id === editing.id ? editing : x));
    toast.success(`Prescription ${editing.id} updated! Status: ${editing.status}`);
    setEditing(null);
  };

  const downloadRxPDF = (p: Rx) => {
    toast.success(`Generating PDF for Prescription ${p.id}...`);
    generateGenericPDF(
      `Prescription ${p.id}`,
      "Official Medical Prescription",
      [
        {
          title: "Prescription Details",
          subtitle: `Prescription ID: ${p.id} • Status: ${p.status}`,
          items: [
            { label: "Patient Name", value: p.patient },
            { label: "Prescription Date", value: p.date },
            { label: "Status", value: p.status },
            { label: "Consulting Physician", value: "Dr. Sarah Khan (Cardiology)" },
          ],
        },
        {
          title: "Prescribed Medication Schedule",
          notes: p.items.split(",").map((i) => i.trim()),
        },
        {
          title: "Instructions & Refill Notice",
          notes: [
            "Take all medications after meals as directed.",
            "Contact clinic immediately if adverse reactions occur.",
            "Valid for refills for 30 days from date of issuance.",
          ],
        },
      ],
      `Prescription_${p.id}.pdf`
    );
  };

  return (
    <AppShell role="doctor" title="Doctor" nav={doctorNav}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prescriptions</h1>
          <p className="text-muted-foreground">{list.length} total • {list.filter(p=>p.status==="Draft").length} drafts</p>
        </div>
        <Button onClick={() => setNewRxOpen(true)} className="bg-gradient-red text-white shadow-glow-red font-semibold">
          <Plus className="h-4 w-4 mr-2"/>New Rx
        </Button>
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
              <Badge className={p.status === "Issued" ? "bg-emerald-100 text-emerald-700 font-semibold" : p.status === "Completed" ? "bg-blue-100 text-blue-700 font-semibold" : "bg-amber-100 text-amber-700 font-semibold"}>
                {p.status}
              </Badge>
            </div>
            <div className="text-sm bg-muted/50 rounded-lg p-3 mb-3 line-clamp-2">{p.items}</div>
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" variant="outline" onClick={() => setView(p)}><Eye className="h-3.5 w-3.5 mr-1.5"/>View</Button>
              <Button size="sm" onClick={() => setEditing({ ...p })} className="bg-gradient-primary text-white"><Pencil className="h-3.5 w-3.5 mr-1.5"/>Edit</Button>
              <Button size="sm" variant="outline" onClick={() => downloadRxPDF(p)}><Download className="h-3.5 w-3.5 mr-1.5"/>PDF</Button>
              <Button size="sm" variant="outline" onClick={() => remove(p)} className="text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5 mr-1.5"/>Delete</Button>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && <div className="col-span-full text-center py-12 text-muted-foreground">No prescriptions found.</div>}
      </div>

      {/* CREATE NEW RX DIALOG */}
      <Dialog open={newRxOpen} onOpenChange={setNewRxOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Pill className="h-5 w-5 text-rose-500"/>Issue New Prescription</DialogTitle>
            <DialogDescription>Write prescription items, dosages and instructions for the patient.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Patient Name</Label>
              <Input value={newRxForm.patient} onChange={(e) => setNewRxForm({ ...newRxForm, patient: e.target.value })} className="mt-1"/>
            </div>
            <div>
              <Label>Medication Items & Dosage</Label>
              <textarea value={newRxForm.items} onChange={(e) => setNewRxForm({ ...newRxForm, items: e.target.value })}
                rows={5} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm font-mono" placeholder="Enter medicines, dose and frequency..."/>
            </div>
            <div>
              <Label>Status</Label>
              <select value={newRxForm.status} onChange={(e) => setNewRxForm({ ...newRxForm, status: e.target.value })}
                className="mt-1 w-full h-10 rounded-lg border bg-background px-3 text-sm">
                <option value="Issued">Issued</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewRxOpen(false)}>Cancel</Button>
            <Button onClick={createRx} className="bg-gradient-red text-white font-semibold">Issue Rx</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* VIEW DIALOG */}
      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Pill className="h-5 w-5 text-rose-500"/>Prescription {view?.id}</DialogTitle>
            <DialogDescription>{view?.patient} • {view?.date}</DialogDescription>
          </DialogHeader>
          {view && (
            <div className="space-y-3">
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 rounded-xl p-4">
                <div className="text-xs uppercase tracking-wider font-semibold text-rose-700 mb-2">Medications</div>
                <div className="text-sm whitespace-pre-line font-medium">{view.items}</div>
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
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { if (view) downloadRxPDF(view); }}>
              <Download className="h-4 w-4 mr-2"/>Download PDF
            </Button>
            <Button onClick={() => { setEditing(view); setView(null); }} className="bg-gradient-primary text-white"><Pencil className="h-4 w-4 mr-2"/>Edit Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Prescription {editing?.id}</DialogTitle>
            <DialogDescription>Update status or medication list.</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div>
                <Label>Patient Name</Label>
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
                    <option value="Draft">Draft</option>
                    <option value="Issued">Issued</option>
                    <option value="Dispensed">Dispensed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveEdit} className="bg-gradient-primary text-white">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
