import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { doctorNav } from "@/lib/roleNav";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Download, Eye, FlaskConical, Activity, Scan, Search, Filter, Trash2, Send, Share2, Printer, AlertTriangle, Plus, CheckCircle2, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { generateGenericPDF } from "@/lib/pdfGenerator";
import { getUser } from "@/lib/auth";

export const Route = createFileRoute("/doctor/reports")({
  head: () => ({ meta: [{ title: "Reports — Doctor" }] }),
  component: ReportsScreen,
});

type Report = {
  id: string; patient: string; name: string; type: string; date: string; urgent: boolean;
  c: string; summary: string; sharedWithPatient?: boolean;
};

const seed: Report[] = [
  { id: "R-501", patient: "Ahmed Ali", name: "Lipid Profile", type: "Lab", date: "2026-06-12", urgent: true, c: "from-violet-500 to-purple-600", summary: "Total Cholesterol 240 mg/dL (high), LDL 162, HDL 38, TG 210. Recommend statin titration.", sharedWithPatient: false },
  { id: "R-502", patient: "Fatima Noor", name: "Holter Monitor", type: "Cardio", date: "2026-06-11", urgent: false, c: "from-rose-500 to-pink-600", summary: "24h ambulatory ECG. Sinus rhythm with rare PVCs (<1%). No significant arrhythmia.", sharedWithPatient: false },
  { id: "R-503", patient: "Hassan Raza", name: "Echo Report", type: "Cardio", date: "2026-06-10", urgent: true, c: "from-rose-500 to-pink-600", summary: "EF 45% (mildly reduced). LV regional wall motion abnormality inferior wall. Mild MR.", sharedWithPatient: true },
  { id: "R-504", patient: "Bilal Khan", name: "CT Abdomen", type: "Radiology", date: "2026-06-09", urgent: false, c: "from-blue-500 to-cyan-500", summary: "Post-op cholecystectomy. No collection. Mild post-surgical edema. Recovery on track.", sharedWithPatient: false },
  { id: "R-505", patient: "Ayesha Tariq", name: "CBC", type: "Lab", date: "2026-06-08", urgent: false, c: "from-violet-500 to-purple-600", summary: "Hb 12.8, WBC 7.4, Plt 250. All within normal limits.", sharedWithPatient: false },
  { id: "R-506", patient: "Ahmed Ali", name: "ECG", type: "Cardio", date: "2026-06-07", urgent: false, c: "from-rose-500 to-pink-600", summary: "Normal sinus rhythm 78 bpm. Normal axis. No acute ST-T changes.", sharedWithPatient: false },
  { id: "R-507", patient: "Zara Malik", name: "Peripheral Blood Smear", type: "Lab", date: "2026-06-05", urgent: true, c: "from-violet-500 to-purple-600", summary: "Microcytic hypochromic RBCs consistent with severe iron deficiency. Hb 7.2 g/dL.", sharedWithPatient: false },
  { id: "R-508", patient: "Mohammad Usman", name: "Spirometry", type: "Radiology", date: "2026-06-04", urgent: false, c: "from-blue-500 to-cyan-500", summary: "FEV1/FVC 0.58 — Grade 2 COPD (GOLD). Moderate obstructive pattern.", sharedWithPatient: false },
];

const patientEmails: Record<string, string> = {
  "Ahmed Ali": "ahmed.ali@example.com",
  "Fatima Noor": "fatima.noor@example.com",
  "Hassan Raza": "hassan.raza@example.com",
  "Bilal Khan": "bilal.k@example.com",
  "Ayesha Tariq": "ayesha.t@example.com",
  "Zara Malik": "zara.m@example.com",
  "Mohammad Usman": "m.usman@example.com",
};

const PATIENT_CODES: Record<string, string> = {
  "Ahmed Ali": "P-1042",
  "Fatima Noor": "P-1043",
  "Hassan Raza": "P-1044",
  "Bilal Khan": "P-1046",
  "Ayesha Tariq": "P-1045",
  "Zara Malik": "P-1047",
  "Mohammad Usman": "P-1048",
};

function pushPatientNotification(patientName: string, reportName: string, reportId: string) {
  // Save a notification in the patient's notification store so they see it
  const email = patientEmails[patientName] ?? "patient@medicore.app";
  const key = `medicore_user_notifications_${email}`;
  const existing = JSON.parse(localStorage.getItem(key) || "[]");
  const notif = {
    id: `notif-rpt-${Date.now()}`,
    type: "report",
    title: `New Report Available: ${reportName}`,
    body: `Dr. Sarah Khan has shared your ${reportName} report (${reportId}) with you. Please log in to view the full report and findings.`,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    unread: true,
    emailSent: true,
  };
  localStorage.setItem(key, JSON.stringify([notif, ...existing]));
  // Also save to shared reports store
  const reportsKey = `medicore_shared_reports_${PATIENT_CODES[patientName] ?? "P-0000"}`;
  const sharedReports = JSON.parse(localStorage.getItem(reportsKey) || "[]");
  localStorage.setItem(reportsKey, JSON.stringify([{ id: reportId, name: reportName, sharedAt: new Date().toISOString() }, ...sharedReports]));
  // Dispatch storage event so AppShell notification bell updates
  window.dispatchEvent(new StorageEvent("storage", { key }));
}

function ReportsScreen() {
  const user = getUser();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "Lab" | "Cardio" | "Radiology" | "urgent">("all");
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
  const [shareDialog, setShareDialog] = useState<Report | null>(null);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [genForm, setGenForm] = useState({
    patient: "Ahmed Ali",
    name: "",
    type: "Lab",
    summary: "",
    urgent: false,
  });

  const filtered = list.filter(r => {
    const matchesQ = (r.name + r.patient + r.id).toLowerCase().includes(q.toLowerCase());
    const matchesF = filter === "all" ? true : filter === "urgent" ? r.urgent : r.type === filter;
    return matchesQ && matchesF;
  });

  const remove = (r: Report) => {
    const updated = list.filter(x => x.id !== r.id);
    setList(updated);
    toast.success(`Report ${r.id} permanently deleted`);
  };

  const shareReport = (r: Report) => {
    const updated = list.map(x => x.id === r.id ? { ...x, sharedWithPatient: true } : x);
    setList(updated);
    pushPatientNotification(r.patient, r.name, r.id);
    toast.success(`Report shared with ${r.patient}`, {
      description: `Email notification dispatched to ${patientEmails[r.patient] ?? r.patient}`,
    });
    setShareDialog(null);
    setView(null);
  };

  const generateReport = () => {
    if (!genForm.name.trim()) return toast.error("Please enter a report name");
    if (!genForm.summary.trim()) return toast.error("Please enter report summary / findings");
    const newReport: Report = {
      id: `R-${String(Date.now()).slice(-4)}`,
      patient: genForm.patient,
      name: genForm.name,
      type: genForm.type,
      date: new Date().toISOString().split("T")[0],
      urgent: genForm.urgent,
      c: genForm.type === "Lab" ? "from-violet-500 to-purple-600" : genForm.type === "Cardio" ? "from-rose-500 to-pink-600" : "from-blue-500 to-cyan-500",
      summary: genForm.summary,
      sharedWithPatient: false,
    };
    setList(prev => [newReport, ...prev]);
    toast.success("Report generated successfully!", { description: `${genForm.name} for ${genForm.patient}` });
    setGenerateOpen(false);
    setGenForm({ patient: "Ahmed Ali", name: "", type: "Lab", summary: "", urgent: false });
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
            { label: "Shared with Patient", value: r.sharedWithPatient ? "Yes" : "Not yet" },
          ],
        },
        {
          title: "Clinical Summary & Diagnostic Findings",
          notes: [r.summary],
        },
        {
          title: "Consultant Authorization",
          notes: [
            `Reviewed & Verified by: ${user?.name ?? "Dr. Sarah Khan"}`,
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
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3"><FileText className="h-7 w-7 text-primary"/>Reports</h1>
          <p className="text-muted-foreground">{list.length} reports • {list.filter(r=>r.urgent).length} urgent • {list.filter(r=>r.sharedWithPatient).length} shared</p>
        </div>
        <Button
          onClick={() => setGenerateOpen(true)}
          className="bg-gradient-primary text-white shadow-glow font-semibold shrink-0"
        >
          <Plus className="h-4 w-4 mr-2" /> Generate Report
        </Button>
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
              className="bg-white dark:bg-slate-900/70 border border-border rounded-2xl p-5 shadow-card hover:shadow-elevated transition relative overflow-hidden">
              {r.urgent && <Badge className="absolute top-3 right-3 bg-destructive text-white font-semibold">Urgent</Badge>}
              {r.sharedWithPatient && <span title="Shared with patient" className="absolute top-3 left-3"><CheckCircle2 className="h-4 w-4 text-emerald-500" /></span>}
              <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${r.c} text-white flex items-center justify-center mb-3 shadow-glow`}>
                <Icon className="h-6 w-6"/>
              </div>
              <div className="font-bold text-base">{r.name}</div>
              <div className="text-sm text-muted-foreground mt-0.5">{r.patient}</div>
              <div className="flex items-center gap-2 mt-3 text-xs">
                <Badge variant="outline">{r.type}</Badge>
                <span className="text-muted-foreground">{r.date}</span>
                {r.sharedWithPatient && <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 text-[10px]">Shared</Badge>}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <Button size="sm" variant="outline" onClick={() => setView(r)}><Eye className="h-3.5 w-3.5 mr-1.5"/>View</Button>
                <Button size="sm" onClick={() => downloadReportPDF(r)} className="bg-gradient-primary text-white"><Download className="h-3.5 w-3.5 mr-1.5"/>PDF</Button>
                <Button
                  size="sm" variant="outline"
                  onClick={() => setShareDialog(r)}
                  className={r.sharedWithPatient ? "text-emerald-600 border-emerald-200" : ""}
                >
                  <Share2 className="h-3.5 w-3.5 mr-1.5"/>
                  {r.sharedWithPatient ? "Shared" : "Share"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => remove(r)} className="text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5 mr-1.5"/>Delete</Button>
              </div>
            </motion.div>
          );
        })}
        {filtered.length === 0 && <div className="col-span-full text-center py-12 text-muted-foreground">No reports match your filters.</div>}
      </div>

      {/* VIEW dialog */}
      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">{view && <FileText className="h-5 w-5 text-primary"/>}{view?.name}</DialogTitle>
            <DialogDescription>{view?.patient} · {view?.id} · {view?.date}</DialogDescription>
          </DialogHeader>
          {view && (
            <div className="space-y-3">
              {view.urgent && (
                <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl p-3 text-sm text-rose-700 dark:text-rose-300 flex items-center gap-2 font-medium">
                  <AlertTriangle className="h-4 w-4"/> Flagged urgent — review at earliest.
                </div>
              )}
              {view.sharedWithPatient && (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 rounded-xl p-3 text-sm text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4"/> Already shared with patient. Patient has been notified.
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
            {view && !view.sharedWithPatient && (
              <Button variant="outline" onClick={() => { if (view) shareReport(view); }}>
                <Send className="h-4 w-4 mr-2"/>Share with Patient
              </Button>
            )}
            <Button onClick={() => view && downloadReportPDF(view)} className="bg-gradient-primary text-white">
              <Download className="h-4 w-4 mr-2"/>Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SHARE confirmation dialog */}
      <Dialog open={!!shareDialog} onOpenChange={(o) => !o && setShareDialog(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Send className="h-5 w-5 text-primary"/>Share Report with Patient</DialogTitle>
            <DialogDescription>This report will be shared with the patient and they will be notified via email.</DialogDescription>
          </DialogHeader>
          {shareDialog && (
            <div className="space-y-3">
              <div className="bg-muted/40 rounded-xl p-4 text-sm space-y-1">
                <div><span className="text-muted-foreground">Report:</span> <b>{shareDialog.name}</b></div>
                <div><span className="text-muted-foreground">Patient:</span> <b>{shareDialog.patient}</b></div>
                <div><span className="text-muted-foreground">Email:</span> <b>{patientEmails[shareDialog.patient] ?? "patient@example.com"}</b></div>
              </div>
              <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                ℹ️ The patient will receive an in-app notification and an email alert once you confirm.
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialog(null)}><X className="h-4 w-4 mr-2"/>Cancel</Button>
            <Button onClick={() => shareDialog && shareReport(shareDialog)} className="bg-gradient-primary text-white">
              <Send className="h-4 w-4 mr-2"/>Confirm & Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* GENERATE REPORT dialog */}
      <Dialog open={generateOpen} onOpenChange={(o) => !o && setGenerateOpen(false)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-primary"/>Generate New Report</DialogTitle>
            <DialogDescription>Create a new clinical report and optionally share it with the patient immediately.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Patient</Label>
                <Select value={genForm.patient} onValueChange={(v) => setGenForm({ ...genForm, patient: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue/></SelectTrigger>
                  <SelectContent>
                    {Object.keys(patientEmails).map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Department / Type</Label>
                <Select value={genForm.type} onValueChange={(v) => setGenForm({ ...genForm, type: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lab">Lab</SelectItem>
                    <SelectItem value="Cardio">Cardio</SelectItem>
                    <SelectItem value="Radiology">Radiology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Report Name / Test</Label>
              <Input value={genForm.name} onChange={(e) => setGenForm({ ...genForm, name: e.target.value })} placeholder="e.g. Lipid Profile, Chest X-Ray…" className="mt-1.5"/>
            </div>
            <div>
              <Label>Clinical Findings / Summary</Label>
              <Textarea
                value={genForm.summary}
                onChange={(e) => setGenForm({ ...genForm, summary: e.target.value })}
                placeholder="Enter diagnostic findings, interpretation and clinical notes…"
                className="mt-1.5 min-h-[100px] resize-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="urgent-check"
                checked={genForm.urgent}
                onChange={(e) => setGenForm({ ...genForm, urgent: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="urgent-check" className="cursor-pointer flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-rose-500"/> Mark as Urgent
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateOpen(false)}>Cancel</Button>
            <Button onClick={generateReport} className="bg-gradient-primary text-white">
              <FileText className="h-4 w-4 mr-2"/>Generate Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
