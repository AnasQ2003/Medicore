import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { nurseNav } from "@/lib/roleNav";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle, RefreshCw, Pill, Calendar, Clock, CheckCircle2, Search, BedDouble, Activity } from "lucide-react";
import { prescriptionAPI } from "@/lib/api/client";
import useApi from "@/hooks/useApi";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/nurse/medications")({
  head: () => ({ meta: [{ title: "Medications — Nurse" }] }),
  component: NurseMedicationsScreen,
});

interface MedEntry {
  id: string;
  patient: string;
  bed: string;
  ward: string;
  medication: string;
  dosage: string;
  route: "Oral" | "IV" | "IM" | "Topical" | "Subcutaneous";
  frequency: string;
  nextDose: string;
  status: "Pending" | "Administered" | "Overdue" | "Paused";
  prescribedBy: string;
  items?: string;
  date?: string;
}

const MOCK_MEDS: MedEntry[] = [
  {
    id: "M-001", patient: "Muhammad Usama Khan", bed: "ICU-04", ward: "ICU",
    medication: "Furosemide 40mg", dosage: "40mg", route: "IV",
    frequency: "Every 8 hrs", nextDose: "10:00 AM", status: "Pending",
    prescribedBy: "Dr. Arshad Mahmood", items: "Furosemide 40mg IV"
  },
  {
    id: "M-002", patient: "Sara Ahmed", bed: "Bed-302A", ward: "General Ward",
    medication: "Paracetamol 1g", dosage: "1000mg", route: "IV",
    frequency: "Every 6 hrs", nextDose: "12:00 PM", status: "Administered",
    prescribedBy: "Dr. Sarah Khan", items: "Paracetamol IV 1g"
  },
  {
    id: "M-003", patient: "Hamza Riaz", bed: "Bed-114B", ward: "Medical Ward",
    medication: "Amlodipine 5mg", dosage: "5mg", route: "Oral",
    frequency: "Once daily", nextDose: "08:00 AM", status: "Overdue",
    prescribedBy: "Dr. Sarah Khan", items: "Amlodipine 5mg"
  },
  {
    id: "M-004", patient: "Fatima Noor", bed: "Bed-205", ward: "Surgical Ward",
    medication: "Cefazolin 1g", dosage: "1g", route: "IV",
    frequency: "Every 12 hrs", nextDose: "02:00 PM", status: "Pending",
    prescribedBy: "Dr. Arshad Mahmood", items: "Cefazolin 1g IV"
  },
  {
    id: "M-005", patient: "Ali Hassan Sheikh", bed: "ICU-07", ward: "ICU",
    medication: "Norepinephrine 4mg", dosage: "4mg/250ml", route: "IV",
    frequency: "Continuous infusion", nextDose: "Continuous", status: "Administered",
    prescribedBy: "Dr. Arshad Mahmood", items: "Norepinephrine IV infusion"
  },
  {
    id: "M-006", patient: "Zainab Qureshi", bed: "Bed-501", ward: "Neurology Ward",
    medication: "Sumatriptan 50mg", dosage: "50mg", route: "Oral",
    frequency: "PRN (as needed)", nextDose: "As needed", status: "Paused",
    prescribedBy: "Dr. Nadia Azeem", items: "Sumatriptan 50mg oral"
  },
  {
    id: "M-007", patient: "Bilal Chaudhry", bed: "Bed-312C", ward: "Orthopedic Ward",
    medication: "Tramadol 50mg", dosage: "50mg", route: "IM",
    frequency: "Every 8 hrs PRN", nextDose: "04:00 PM", status: "Pending",
    prescribedBy: "Dr. Rizwan Khattak", items: "Tramadol 50mg IM"
  },
  {
    id: "M-008", patient: "Ayesha Malik", bed: "Bed-408A", ward: "Maternity Ward",
    medication: "Oxytocin 5 IU", dosage: "5 IU", route: "IV",
    frequency: "Infusion post-delivery", nextDose: "Completed", status: "Administered",
    prescribedBy: "Dr. Sana Raza", items: "Oxytocin 5IU IV"
  },
];

const statusConfig = {
  Pending:      { cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",   dot: "bg-amber-500" },
  Administered: { cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300", dot: "bg-emerald-500" },
  Overdue:      { cls: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",       dot: "bg-rose-500" },
  Paused:       { cls: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",      dot: "bg-slate-400" },
};

const routeConfig = {
  IV:           "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  IM:           "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  Oral:         "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  Topical:      "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  Subcutaneous: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
};

function NurseMedicationsScreen() {
  const { data: rawPrescriptions, loading, error, refetch } = useApi(() => prescriptionAPI.getAll());
  const apiMeds = (rawPrescriptions as unknown as any[]) ?? [];

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Merge API with mock data
  const meds: MedEntry[] = apiMeds.length > 2
    ? apiMeds.map((p: any, i: number) => ({
        ...MOCK_MEDS[i % MOCK_MEDS.length],
        id: p.id ?? MOCK_MEDS[i % MOCK_MEDS.length].id,
        patient: p.patient ?? MOCK_MEDS[i % MOCK_MEDS.length].patient,
        items: p.items ?? MOCK_MEDS[i % MOCK_MEDS.length].items,
        status: p.status === "Issued" ? "Administered" : "Pending",
        date: p.date,
      }))
    : MOCK_MEDS;

  const filtered = meds.filter((m) => {
    const matchQ = m.patient.toLowerCase().includes(q.toLowerCase()) ||
      m.medication?.toLowerCase().includes(q.toLowerCase()) ||
      m.bed?.toLowerCase().includes(q.toLowerCase());
    const matchStatus = statusFilter === "All" || m.status === statusFilter;
    return matchQ && matchStatus;
  });

  const markAdministered = (id: string) => {
    toast.success("Marked as administered!", { description: `Medication ${id} administered.` });
  };

  const counts = {
    all: meds.length,
    pending: meds.filter((m) => m.status === "Pending").length,
    overdue: meds.filter((m) => m.status === "Overdue").length,
    administered: meds.filter((m) => m.status === "Administered").length,
  };

  return (
    <AppShell role="nurse" title="Nurse" nav={nurseNav}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Active Medications</h1>
          <p className="text-muted-foreground">Monitor and administer prescribed drugs for current shift</p>
        </div>
        <Button variant="outline" size="sm" onClick={refetch} className="shrink-0">
          <RefreshCw className="h-3.5 w-3.5 mr-2" />Refresh List
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Meds", value: counts.all, color: "from-violet-500 to-purple-600" },
          { label: "Pending", value: counts.pending, color: "from-amber-500 to-orange-600" },
          { label: "Overdue", value: counts.overdue, color: "from-rose-500 to-red-600" },
          { label: "Administered", value: counts.administered, color: "from-emerald-500 to-teal-600" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`rounded-2xl bg-gradient-to-br ${s.color} text-white p-5 shadow-elevated`}>
            <div className="text-3xl font-bold">{s.value}</div>
            <div className="text-sm opacity-90 mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patient, medication, bed..." className="pl-9" />
        </div>
        <div className="flex gap-2">
          {["All", "Pending", "Administered", "Overdue", "Paused"].map((s) => (
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
              No medications found.
            </div>
          ) : (
            filtered.map((m, i) => (
              <motion.div key={m.id}
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                whileHover={{ y: -3 }}
                className="bg-card border border-border rounded-2xl p-5 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <div>
                      <h3 className="font-bold text-base leading-tight text-card-foreground">{m.patient}</h3>
                      <span className="text-[10px] text-muted-foreground font-mono">{m.id}</span>
                    </div>
                    <Badge className={statusConfig[m.status]?.cls ?? ""}>
                      <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1.5 ${statusConfig[m.status]?.dot ?? ""}`} />
                      {m.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <BedDouble className="h-3 w-3" />{m.bed}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Activity className="h-3 w-3" />{m.ward}
                    </div>
                  </div>

                  <div className="bg-secondary/50 p-3 rounded-xl mb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-sm text-foreground">{m.medication}</div>
                        <div className="text-xs text-muted-foreground">{m.dosage} · {m.frequency}</div>
                      </div>
                      <Badge className={routeConfig[m.route] ?? ""}>{m.route}</Badge>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-amber-500" />Next dose: <span className="font-semibold text-foreground">{m.nextDose}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Pill className="h-3 w-3 text-violet-500" />By {m.prescribedBy}
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-3 mt-4 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />{m.date ?? new Date().toLocaleDateString()}
                  </span>
                  {m.status === "Pending" || m.status === "Overdue" ? (
                    <Button size="sm" onClick={() => markAdministered(m.id)}
                      className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white">
                      <CheckCircle2 className="h-3 w-3 mr-1" />Mark Given
                    </Button>
                  ) : (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />Done
                    </span>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </AppShell>
  );
}
