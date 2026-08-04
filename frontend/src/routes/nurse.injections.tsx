import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { nurseNav } from "@/lib/roleNav";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle, RefreshCw, Syringe, Calendar, Clock, CheckCircle2, Search, BedDouble, Droplets, Timer } from "lucide-react";
import { prescriptionAPI } from "@/lib/api/client";
import useApi from "@/hooks/useApi";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/nurse/injections")({
  head: () => ({ meta: [{ title: "Injections — Nurse" }] }),
  component: NurseInjectionsScreen,
});

interface InjEntry {
  id: string;
  patient: string;
  bed: string;
  ward: string;
  drug: string;
  dosage: string;
  type: "IV" | "IM" | "SC" | "Infusion" | "IV Push";
  site?: string;
  volume?: string;
  rate?: string;
  dueAt: string;
  status: "Pending" | "Administered" | "Running" | "Overdue";
  prescribedBy: string;
  notes?: string;
}

const MOCK_INJECTIONS: InjEntry[] = [
  {
    id: "INJ-001", patient: "Muhammad Usama Khan", bed: "ICU-04", ward: "ICU",
    drug: "Furosemide", dosage: "40mg", type: "IV Push",
    site: "Left Antecubital", volume: "40ml NS", dueAt: "10:00 AM",
    status: "Pending", prescribedBy: "Dr. Arshad Mahmood",
    notes: "Push slowly over 2 mins"
  },
  {
    id: "INJ-002", patient: "Ali Hassan Sheikh", bed: "ICU-07", ward: "ICU",
    drug: "Norepinephrine", dosage: "4mg/250ml NS", type: "Infusion",
    site: "Central Line", volume: "250ml NS", rate: "8 mcg/min",
    dueAt: "Continuous", status: "Running",
    prescribedBy: "Dr. Arshad Mahmood",
    notes: "Titrate to MAP >65 mmHg"
  },
  {
    id: "INJ-003", patient: "Fatima Noor", bed: "Bed-205", ward: "Surgical Ward",
    drug: "Cefazolin", dosage: "1g", type: "IV",
    site: "Right Forearm", volume: "100ml NS", rate: "30 min",
    dueAt: "02:00 PM", status: "Pending",
    prescribedBy: "Dr. Arshad Mahmood"
  },
  {
    id: "INJ-004", patient: "Hamza Riaz", bed: "Bed-114B", ward: "Medical Ward",
    drug: "Enoxaparin", dosage: "40mg", type: "SC",
    site: "Abdomen", volume: "0.4ml", dueAt: "08:00 AM",
    status: "Overdue", prescribedBy: "Dr. Sarah Khan",
    notes: "DVT prophylaxis"
  },
  {
    id: "INJ-005", patient: "Sara Ahmed", bed: "Bed-302A", ward: "General Ward",
    drug: "Paracetamol", dosage: "1g/100ml", type: "Infusion",
    site: "Right Antecubital", volume: "100ml", rate: "15 min",
    dueAt: "12:00 PM", status: "Administered",
    prescribedBy: "Dr. Sarah Khan"
  },
  {
    id: "INJ-006", patient: "Bilal Chaudhry", bed: "Bed-312C", ward: "Orthopedic Ward",
    drug: "Tramadol", dosage: "50mg", type: "IM",
    site: "Deltoid (L)", volume: "2ml", dueAt: "04:00 PM",
    status: "Pending", prescribedBy: "Dr. Rizwan Khattak",
    notes: "PRN for pain VAS >6"
  },
  {
    id: "INJ-007", patient: "Zainab Qureshi", bed: "Bed-501", ward: "Neurology Ward",
    drug: "Metoclopramide", dosage: "10mg", type: "IV",
    site: "Left Forearm", volume: "50ml NS", rate: "10 min",
    dueAt: "06:00 PM", status: "Pending",
    prescribedBy: "Dr. Nadia Azeem"
  },
  {
    id: "INJ-008", patient: "Ayesha Malik", bed: "Bed-408A", ward: "Maternity Ward",
    drug: "Oxytocin", dosage: "5 IU/500ml", type: "Infusion",
    site: "Right Antecubital", volume: "500ml RL", rate: "20 mU/min",
    dueAt: "Completed", status: "Administered",
    prescribedBy: "Dr. Sana Raza"
  },
];

const statusConfig = {
  Pending:      { cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",       dot: "bg-amber-500" },
  Administered: { cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300", dot: "bg-emerald-500" },
  Running:      { cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",           dot: "bg-blue-500 animate-pulse" },
  Overdue:      { cls: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",           dot: "bg-rose-500" },
};

const typeConfig = {
  "IV":       "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "IM":       "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  "SC":       "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  "Infusion": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  "IV Push":  "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
};

function NurseInjectionsScreen() {
  const { data: raw, loading, error, refetch } = useApi(() => prescriptionAPI.getAll());
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const injections = MOCK_INJECTIONS; // Use mock data; would filter API for real IV/IM items

  const filtered = injections.filter((m) => {
    const matchQ = m.patient.toLowerCase().includes(q.toLowerCase()) ||
      m.drug.toLowerCase().includes(q.toLowerCase()) ||
      m.bed.toLowerCase().includes(q.toLowerCase());
    const matchStatus = statusFilter === "All" || m.status === statusFilter;
    return matchQ && matchStatus;
  });

  const counts = {
    all: injections.length,
    pending: injections.filter((i) => i.status === "Pending").length,
    running: injections.filter((i) => i.status === "Running").length,
    overdue: injections.filter((i) => i.status === "Overdue").length,
    done: injections.filter((i) => i.status === "Administered").length,
  };

  const markDone = (id: string) => toast.success(`INJ ${id} marked as administered`);

  return (
    <AppShell role="nurse" title="Nurse" nav={nurseNav}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Injection Administration</h1>
          <p className="text-muted-foreground">Monitor and sign off on IV, IM, SC and infusion administrations</p>
        </div>
        <Button variant="outline" size="sm" onClick={refetch} className="shrink-0">
          <RefreshCw className="h-3.5 w-3.5 mr-2" />Refresh
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Total", value: counts.all, color: "from-violet-500 to-purple-600" },
          { label: "Pending", value: counts.pending, color: "from-amber-500 to-orange-600" },
          { label: "Running", value: counts.running, color: "from-blue-500 to-cyan-600" },
          { label: "Overdue", value: counts.overdue, color: "from-rose-500 to-red-600" },
          { label: "Done", value: counts.done, color: "from-emerald-500 to-teal-600" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`rounded-2xl bg-gradient-to-br ${s.color} text-white p-4 shadow-elevated`}>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs opacity-90 mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patient, drug, bed..." className="pl-9" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["All", "Pending", "Running", "Overdue", "Administered"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                statusFilter === s ? "bg-rose-600 text-white border-rose-600" : "bg-secondary text-muted-foreground border-border hover:border-rose-400"
              }`}>{s}</button>
          ))}
        </div>
      </div>

      {loading && <div className="flex items-center justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
      {error && <div className="text-center py-16 text-destructive"><AlertCircle className="h-8 w-8 mx-auto mb-3" /><p>{error}</p></div>}

      {!loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-16 text-muted-foreground bg-secondary/20 rounded-2xl border">
              No injections found.
            </div>
          ) : filtered.map((inj, i) => (
            <motion.div key={inj.id}
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              whileHover={{ y: -3 }}
              className="bg-card border border-border rounded-2xl p-5 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-sm leading-tight text-card-foreground">{inj.patient}</h3>
                    <span className="text-[10px] text-muted-foreground font-mono">{inj.id}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={statusConfig[inj.status]?.cls ?? ""}>
                      <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1.5 ${statusConfig[inj.status]?.dot ?? ""}`} />
                      {inj.status}
                    </Badge>
                    <Badge className={typeConfig[inj.type] ?? ""}>{inj.type}</Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><BedDouble className="h-3 w-3" />{inj.bed}</span>
                  <span className="text-muted-foreground/50">·</span>
                  <span>{inj.ward}</span>
                </div>

                <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900 p-3 rounded-xl mb-3">
                  <div className="font-bold text-rose-800 dark:text-rose-300">{inj.drug} {inj.dosage}</div>
                  <div className="text-xs text-rose-700 dark:text-rose-400 mt-1 space-y-0.5">
                    {inj.site && <div className="flex items-center gap-1"><Syringe className="h-3 w-3" />Site: {inj.site}</div>}
                    {inj.volume && <div className="flex items-center gap-1"><Droplets className="h-3 w-3" />Volume: {inj.volume}</div>}
                    {inj.rate && <div className="flex items-center gap-1"><Timer className="h-3 w-3" />Rate: {inj.rate}</div>}
                  </div>
                </div>

                {inj.notes && (
                  <div className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900 rounded-lg px-3 py-2 mb-2">
                    ⚠ {inj.notes}
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 text-amber-500" />
                  <span>Due: <span className="font-semibold text-foreground">{inj.dueAt}</span></span>
                  <span className="ml-auto">By {inj.prescribedBy}</span>
                </div>
              </div>

              <div className="border-t border-border pt-3 mt-3 flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />{new Date().toLocaleDateString()}
                </span>
                {(inj.status === "Pending" || inj.status === "Overdue") ? (
                  <Button size="sm" onClick={() => markDone(inj.id)}
                    className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white">
                    <CheckCircle2 className="h-3 w-3 mr-1" />Administered
                  </Button>
                ) : inj.status === "Running" ? (
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 animate-pulse">
                    ● Running
                  </span>
                ) : (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />Done
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
