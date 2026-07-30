import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { doctorNav } from "@/lib/roleNav";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FileText, Download, Eye, FlaskConical, Activity, Scan, Search, Filter, Trash2, Send, Share2, Printer, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { generateGenericPDF } from "@/lib/pdfGenerator";

export const Route = createFileRoute("/doctor/reports")({
  head: () => ({ meta: [{ title: "Reports — Doctor" }] }),
  component: ReportsScreen,
});

type Report = {
  id: string; patient: string; name: string; type: string; date: string; urgent: boolean;
  c: string; summary: string;
};

const seed: Report[] = [
  { id: "R-501", patient: "Ahmed Ali", name: "Lipid Profile", type: "Lab", date: "2026-06-12", urgent: true, c: "from-violet-500 to-purple-600", summary: "Total Cholesterol 240 mg/dL (high), LDL 162, HDL 38, TG 210. Recommend statin titration." },
  { id: "R-502", patient: "Fatima Noor", name: "Holter Monitor", type: "Cardio", date: "2026-06-11", urgent: false, c: "from-rose-500 to-pink-600", summary: "24h ambulatory ECG. Sinus rhythm with rare PVCs (<1%). No significant arrhythmia." },
  { id: "R-503", patient: "Hassan Raza", name: "Echo Report", type: "Cardio", date: "2026-06-10", urgent: true, c: "from-rose-500 to-pink-600", summary: "EF 45% (mildly reduced). LV regional wall motion abnormality inferior wall. Mild MR." },
  { id: "R-504", patient: "Bilal Khan", name: "CT Abdomen", type: "Radiology", date: "2026-06-09", urgent: false, c: "from-blue-500 to-cyan-500", summary: "Post-op cholecystectomy. No collection. Mild post-surgical edema. Recovery on track." },
  { id: "R-505", patient: "Ayesha Tariq", name: "CBC", type: "Lab", date: "2026-06-08", urgent: false, c: "from-violet-500 to-purple-600", summary: "Hb 12.8, WBC 7.4, Plt 250. All within normal limits." },
  { id: "R-506", patient: "Ahmed Ali", name: "ECG", type: "Cardio", date: "2026-06-07", urgent: false, c: "from-rose-500 to-pink-600", summary: "Normal sinus rhythm 78 bpm. Normal axis. No acute ST-T changes." },
];

function ReportsScreen() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "Lab" | "Cardio" | "Radiology" | "urgent">("all");
  
  // Persist reports list in localStorage so deleted reports stay deleted!
  const [list, setList] = useState<Report[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("medicore_doctor_reports");
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return seed;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("medicore_doctor_reports", JSON.stringify(list));
    }
  }, [list]);

  const [view, setView] = useState<Report | null>(null);

  const filtered = list.filter(r => {
    const matchesQ = (r.name + r.patient + r.id).toLowerCase().includes(q.toLowerCase());
    const matchesF = filter === "all" ? true : filter === "urgent" ? r.urgent : r.type === filter;
    return matchesQ && matchesF;
  });

  const remove = (r: Report) => {
    const updated = list.filter(x => x.id !== r.id);
    setList(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("medicore_doctor_reports", JSON.stringify(updated));
    }
    toast.success(`Report ${r.id} permanently deleted`);
  };

  const downloadReportPDF = (r: Report) => {
    toast.success(`Generating PDF for Report ${r.id}...`);
    generateGenericPDF(
      `Clinical Report — ${r.name}`,
      `${r.type} Investigation`,
      [
        {
          title: "Report Overview & Demographics",
          subtitle: `Report Reference: ${r.id} • ${r.urgent ? "CRITICAL / URGENT" : "ROUTINE"}`,
          items: [
            { label: "Patient Name", value: r.patient },
            { label: "Report ID", value: r.id },
            { label: "Test / Procedure", value: r.name },
            { label: "Department Category", value: r.type },
            { label: "Date Executed", value: r.date },
            { label: "Priority", value: r.urgent ? "High Urgency" : "Normal" },
          ],
        },
        {
          title: "Clinical Summary & Diagnostic Findings",
          notes: [r.summary],
        },
        {
          title: "Consultant Authorization",
          notes: [
            "Reviewed & Verified by: Dr. Sarah Khan (FCPS Cardiology)",
            "Department of Clinical Diagnostics, MediCore HMS",
          ],
        },
      ],
      `Report_${r.id}_${r.name.replace(/\s+/g, "_")}.pdf`
    );
  };

  const getIcon = (type: string) => {
    if (type === "Lab") return FlaskConical;
    if (type === "Cardio") return Activity;
    return Scan;
  };

  return (
    <AppShell role="doctor" title="Doctor" nav={doctorNav}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3"><FileText className="h-7 w-7 text-primary"/>Reports</h1>
        <p className="text-muted-foreground">{list.length} reports • {list.filter(r=>r.urgent).length} marked urgent</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search reports, patients…" className="pl-9"/>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all","Lab","Cardio","Radiology","urgent"] as const).map(f => (
            <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}
              className={filter === f ? "bg-gradient-primary text-white capitalize" : "capitalize"}>
              {f === "urgent" && <AlertTriangle className="h-3.5 w-3.5 mr-1"/>}
              {f === "all" && <Filter className="h-3.5 w-3.5 mr-1"/>}
              {f}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((r, i) => {
          const Icon = getIcon(r.type);
          return (
            <motion.div key={r.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}
              whileHover={{y:-6}}
              className="bg-white border rounded-2xl p-5 shadow-card hover:shadow-elevated transition relative overflow-hidden">
              {r.urgent && <Badge className="absolute top-3 right-3 bg-destructive text-white font-semibold">Urgent</Badge>}
              <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${r.c} text-white flex items-center justify-center mb-3 shadow-glow`}>
                <Icon className="h-6 w-6"/>
              </div>
              <div className="font-bold text-base">{r.name}</div>
              <div className="text-sm text-muted-foreground mt-0.5">{r.patient}</div>
              <div className="flex items-center gap-2 mt-3 text-xs">
                <Badge variant="outline">{r.type}</Badge>
                <span className="text-muted-foreground">{r.date}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <Button size="sm" variant="outline" onClick={() => setView(r)}><Eye className="h-3.5 w-3.5 mr-1.5"/>View</Button>
                <Button size="sm" onClick={() => downloadReportPDF(r)} className="bg-gradient-primary text-white"><Download className="h-3.5 w-3.5 mr-1.5"/>PDF</Button>
                <Button size="sm" variant="outline" onClick={() => toast.success("Shared with patient")}><Share2 className="h-3.5 w-3.5 mr-1.5"/>Share</Button>
                <Button size="sm" variant="outline" onClick={() => remove(r)} className="text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5 mr-1.5"/>Delete</Button>
              </div>
            </motion.div>
          );
        })}
        {filtered.length === 0 && <div className="col-span-full text-center py-12 text-muted-foreground">No reports match your filters.</div>}
      </div>

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">{view && <FileText className="h-5 w-5 text-primary"/>}{view?.name}</DialogTitle>
            <DialogDescription>{view?.patient} · {view?.id} · {view?.date}</DialogDescription>
          </DialogHeader>
          {view && (
            <div className="space-y-3">
              {view.urgent && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-sm text-rose-700 flex items-center gap-2 font-medium">
                  <AlertTriangle className="h-4 w-4"/> Flagged urgent — review at earliest.
                </div>
              )}
              <div className="bg-muted/40 rounded-xl p-4">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-semibold">Findings Summary</div>
                <p className="text-sm leading-relaxed">{view.summary}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="bg-muted/40 rounded-lg p-3"><div className="text-xs text-muted-foreground">Type</div><div className="font-semibold">{view.type}</div></div>
                <div className="bg-muted/40 rounded-lg p-3"><div className="text-xs text-muted-foreground">Date</div><div className="font-semibold">{view.date}</div></div>
                <div className="bg-muted/40 rounded-lg p-3"><div className="text-xs text-muted-foreground">ID</div><div className="font-semibold">{view.id}</div></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => toast.success("Sent to patient")}><Send className="h-4 w-4 mr-2"/>Send</Button>
            <Button onClick={() => view && downloadReportPDF(view)} className="bg-gradient-primary text-white"><Download className="h-4 w-4 mr-2"/>Download PDF</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
