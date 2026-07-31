import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { doctorNav } from "@/lib/roleNav";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, Phone, Mail, MapPin, Calendar, Pill, FileText, Activity, AlertTriangle, Download, Heart, Plus, Stethoscope, CheckCircle2, FlaskConical, Scan } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { patientAPI } from "@/lib/api/client";
import useApi from "@/hooks/useApi";
import { toast } from "sonner";
import { generateGenericPDF } from "@/lib/pdfGenerator";

export const Route = createFileRoute("/doctor/patients/$id")({
  head: () => ({ meta: [{ title: "Patient EMR — Doctor" }] }),
  component: PatientDetailScreen,
});

interface Vital { id?: number; date: string; bp: string; pulse: number; temp: number; spo2: number; nurse?: string; }

function PatientDetailScreen() {
  const { id } = useParams({ from: "/doctor/patients/$id" });
  const [addVitalOpen, setAddVitalOpen] = useState(false);
  const [vitalForm, setVitalForm] = useState({ bp: "120/80", pulse: "72", temp: "36.5", spo2: "98" });

  const { data: apiData } = useApi(() => patientAPI.getById(id));

  // Fallback patient data for rich demo presentation
  const defaultPatient = {
    id: id,
    name: id === "1042" ? "Ahmed Ali" : id === "1043" ? "Fatima Noor" : id === "1044" ? "Hassan Raza" : "Patient John Doe",
    patientCode: `P-${id}`,
    age: id === "1042" ? 54 : id === "1043" ? 28 : id === "1044" ? 61 : 30,
    gender: id === "1043" ? "Female" : "Male",
    bloodGroup: id === "1042" ? "B+" : id === "1043" ? "A+" : id === "1044" ? "O-" : "O+",
    phone: "+92 300 1234567",
    email: "patient@medicore.com",
    address: "House 12, Street 5, F-7 Islamabad",
    condition: id === "1044" ? "Post-CABG Recovery & Hypertension" : "Hypertension & Routine Follow-up",
    allergies: ["Penicillin", "Peanuts"],
    chronic: ["Hypertension (since 2019)", "Hyperlipidemia"],
    currentMeds: ["Amlodipine 5mg OD", "Atorvastatin 10mg HS", "Aspirin 75mg OD"],
    vitals: [
      { date: "2026-06-01", bp: "138/92", pulse: 82, temp: 36.8, spo2: 97 },
      { date: "2026-05-15", bp: "142/94", pulse: 84, temp: 36.7, spo2: 98 },
      { date: "2026-04-20", bp: "135/88", pulse: 78, temp: 36.6, spo2: 98 },
      { date: "2026-03-10", bp: "140/90", pulse: 80, temp: 36.5, spo2: 99 },
    ],
    history: [
      { date: "2026-05-28", doctor: "Dr. Sarah Khan", diagnosis: "Hypertension Routine follow-up", notes: "BP 138/92, advised lifestyle changes, continue current meds." },
      { date: "2026-03-12", doctor: "Dr. Sarah Khan", diagnosis: "Chest discomfort", notes: "ECG normal sinus rhythm. Trop-I negative. Patient reassured." },
      { date: "2025-11-04", doctor: "Dr. Bilal Iqbal", diagnosis: "Annual Checkup", notes: "Borderline hyperlipidemia. Advised diet and started low-dose statin." },
    ],
    reports: [
      { id: "R-501", name: "Lipid Profile Report", type: "Lab", date: "2026-05-28", summary: "Total Cholesterol 240 mg/dL (high), LDL 162, HDL 38, TG 210." },
      { id: "R-502", name: "24h Holter ECG Monitor", type: "Cardio", date: "2026-03-12", summary: "Sinus rhythm with rare PVCs (<1%). No significant pause or arrhythmia." },
      { id: "R-503", name: "Echocardiogram Report", type: "Cardio", date: "2025-11-04", summary: "EF 55% (normal). Normal LV dimensions and wall motion." },
    ],
    prescriptions: [
      { id: "RX-101", items: "Amlodipine 5mg OD, Atorvastatin 10mg HS", date: "2026-05-28", status: "Issued" },
      { id: "RX-092", items: "Aspirin 75mg OD", date: "2026-03-12", status: "Completed" },
    ]
  };

  const patient = ((apiData as any)?.data as any) || (apiData as any) || defaultPatient;
  const vitalsList: Vital[] = patient.vitals || defaultPatient.vitals;
  const [localVitals, setLocalVitals] = useState<Vital[]>(vitalsList);

  const addVital = () => {
    if (!vitalForm.bp || !vitalForm.pulse) return toast.error("Enter BP and Pulse");
    const newV: Vital = {
      date: new Date().toISOString().split("T")[0],
      bp: vitalForm.bp,
      pulse: Number(vitalForm.pulse),
      temp: Number(vitalForm.temp),
      spo2: Number(vitalForm.spo2),
      nurse: "Dr. Sarah Khan"
    };
    setLocalVitals([newV, ...localVitals]);
    toast.success("Vitals recorded successfully!");
    setAddVitalOpen(false);
  };

  const downloadEMR = () => {
    toast.success(`Generating detailed EMR PDF for ${patient.name}...`);

    const sections = [
      {
        title: "Patient Demographics & Medical Summary",
        subtitle: `Electronic Medical Record ID: ${patient.patientCode || 'P-' + patient.id}`,
        items: [
          { label: "Patient Name", value: patient.name },
          { label: "Patient ID", value: patient.patientCode || `P-${patient.id}` },
          { label: "Age / Gender", value: `${patient.age || 45} Yrs / ${patient.gender || "Male"}` },
          { label: "Blood Group", value: patient.bloodGroup || "O+" },
          { label: "Primary Condition", value: patient.condition || "Hypertension Follow-up" },
          { label: "Attending Doctor", value: "Dr. Sarah Khan (Cardiology)" },
          { label: "Contact Phone", value: patient.phone || "+92 300 1234567" },
          { label: "Email Address", value: patient.email || "abdulahadsip@gmail.com" },
        ],
      },
      {
        title: "Clinical Vitals History",
        subtitle: "Latest vital signs measurements logged by nursing staff",
        table: {
          headers: ["Date", "Blood Pressure", "Pulse Rate", "Body Temp", "SpO2 %", "Logger"],
          rows: localVitals.map(v => [
            v.date,
            v.bp,
            `${v.pulse} bpm`,
            `${v.temp || 36.8} °C`,
            `${v.spo2 || 98} %`,
            v.nurse || "Nurse Staff"
          ])
        },
        charts: [
          {
            title: "Vital Signs & Physiological Metrics",
            bars: [
              { label: "Pulse Rate (BPM)", value: localVitals[0]?.pulse || 72, max: 150 },
              { label: "Oxygen Saturation (SpO2 %)", value: localVitals[0]?.spo2 || 98, max: 100 },
              { label: "Body Temperature (°C x 2.5)", value: Math.round((localVitals[0]?.temp || 36.8) * 2.5), max: 100 },
              { label: "Cardiovascular Health Score", value: 88, max: 100 },
            ]
          }
        ]
      },
      {
        title: "Active Prescriptions & Dosage Plan",
        notes: (patient.currentMeds as string[] || ["Amlodipine 5mg OD", "Atorvastatin 10mg HS"]).map((m: string) => `Prescribed: ${m}`),
      },
      {
        title: "Recent Diagnostics & Lab Reports",
        table: {
          headers: ["Report ID", "Test Name", "Category", "Date", "Summary"],
          rows: (patient.reports || [
            { id: "R-501", name: "Lipid Profile", type: "Lab", date: "2026-06-15", summary: "Total Cholesterol 195 mg/dL. HDL 48 mg/dL. Normal range." }
          ]).map((r: any) => [r.id, r.name, r.type, r.date, r.summary])
        }
      }
    ];

    generateGenericPDF(
      `Electronic Medical Record — ${patient.name}`,
      "EMR Medical Export",
      sections,
      `EMR_${patient.name.replace(/\s+/g, "_")}.pdf`
    );
  };

  return (
    <AppShell role="doctor" title="Doctor" nav={doctorNav}>
      <div className="space-y-6">
        {/* Back Link & Header */}
        <div className="flex items-center justify-between">
          <Button asChild variant="ghost" size="sm">
            <Link to="/doctor/patients">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Patients
            </Link>
          </Button>
          <div className="flex gap-2">
            <Button onClick={() => setAddVitalOpen(true)} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" /> Record Vitals
            </Button>
            <Button onClick={downloadEMR} className="bg-gradient-primary text-white shadow-glow" size="sm">
              <Download className="h-4 w-4 mr-2" /> Export EMR
            </Button>
          </div>
        </div>

        {/* Patient Profile Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white p-6 md:p-8 shadow-elevated"
        >
          <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/20 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
            <div className="h-20 w-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center font-bold text-3xl shadow-glow">
              {patient.name?.[0] || "P"}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-extrabold">{patient.name}</h1>
                <Badge className="bg-white/20 text-white border border-white/30">{patient.patientCode || `P-${patient.id}`}</Badge>
                <Badge className="bg-amber-400 text-amber-950 font-bold">{patient.bloodGroup || "O+"}</Badge>
              </div>
              <div className="text-sm text-white/90 flex flex-wrap gap-4 pt-1">
                <span>{patient.age} years old • {patient.gender}</span>
                <span>📞 {patient.phone}</span>
                <span>✉️ {patient.email}</span>
              </div>
              <div className="text-sm font-medium text-cyan-100 pt-1">
                Primary Condition: <b>{patient.condition}</b>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Vitals Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-blue-50/90 border border-blue-200 p-4 text-center shadow-card">
            <div className="text-xs uppercase font-semibold text-blue-700">Blood Pressure</div>
            <div className="text-2xl font-black text-blue-900 mt-1">{localVitals[0]?.bp || "120/80"}</div>
            <div className="text-[10px] text-blue-600 mt-0.5">mmHg</div>
          </div>
          <div className="rounded-2xl bg-rose-50/90 border border-rose-200 p-4 text-center shadow-card">
            <div className="text-xs uppercase font-semibold text-rose-700">Pulse Rate</div>
            <div className="text-2xl font-black text-rose-900 mt-1">{localVitals[0]?.pulse || 72}</div>
            <div className="text-[10px] text-rose-600 mt-0.5">bpm</div>
          </div>
          <div className="rounded-2xl bg-amber-50/90 border border-amber-200 p-4 text-center shadow-card">
            <div className="text-xs uppercase font-semibold text-amber-700">Body Temp</div>
            <div className="text-2xl font-black text-amber-900 mt-1">{localVitals[0]?.temp || 36.5}°C</div>
            <div className="text-[10px] text-amber-600 mt-0.5">Normal</div>
          </div>
          <div className="rounded-2xl bg-emerald-50/90 border border-emerald-200 p-4 text-center shadow-card">
            <div className="text-xs uppercase font-semibold text-emerald-700">Oxygen Saturation</div>
            <div className="text-2xl font-black text-emerald-900 mt-1">{localVitals[0]?.spo2 || 98}%</div>
            <div className="text-[10px] text-emerald-600 mt-0.5">SpO2</div>
          </div>
        </div>

        {/* Tabs section: Vitals Chart, Clinical Notes, Prescriptions, Lab Reports */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-4 w-full sm:w-auto bg-secondary/60 p-1 rounded-xl">
            <TabsTrigger value="overview">Overview & Vitals</TabsTrigger>
            <TabsTrigger value="history">Consultation Notes</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="reports">Lab & Reports</TabsTrigger>
          </TabsList>

          {/* TAB 1: OVERVIEW & VITALS */}
          <TabsContent value="overview" className="space-y-6 mt-4">
            <div className="bg-white border rounded-2xl p-6 shadow-card">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" /> Vitals History Trend
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={localVitals}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" fontSize={11} />
                  <YAxis fontSize={11} domain={[50, 150]} />
                  <Tooltip contentStyle={{ borderRadius: 12 }} />
                  <Line type="monotone" dataKey="pulse" stroke="#f43f5e" strokeWidth={3} dot={{ r: 5 }} name="Pulse (bpm)" />
                  <Line type="monotone" dataKey="spo2" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="SpO2 (%)" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Allergies & Chronic */}
              <div className="bg-white border rounded-2xl p-6 shadow-card space-y-4">
                <h4 className="font-semibold flex items-center gap-2 text-rose-600">
                  <AlertTriangle className="h-4 w-4" /> Allergies & Precautions
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(patient.allergies || ["Penicillin"]).map((alg: string) => (
                    <Badge key={alg} className="bg-rose-100 text-rose-800 border-rose-200 py-1 px-3">
                      {alg}
                    </Badge>
                  ))}
                </div>

                <h4 className="font-semibold flex items-center gap-2 text-slate-800 pt-2">
                  <Activity className="h-4 w-4 text-primary" /> Chronic Conditions
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(patient.chronic || ["Hypertension"]).map((chr: string) => (
                    <Badge key={chr} variant="secondary" className="py-1 px-3">
                      {chr}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Active Medications */}
              <div className="bg-white border rounded-2xl p-6 shadow-card space-y-3">
                <h4 className="font-semibold flex items-center gap-2 text-indigo-600">
                  <Pill className="h-4 w-4" /> Active Medications
                </h4>
                <ul className="space-y-2 text-sm">
                  {(patient.currentMeds || ["Amlodipine 5mg OD", "Atorvastatin 10mg HS"]).map((med: string) => (
                    <li key={med} className="flex items-center gap-2 p-2.5 rounded-xl bg-secondary/40 font-medium">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>{med}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: CONSULTATION HISTORY */}
          <TabsContent value="history" className="space-y-4 mt-4">
            <div className="bg-white border rounded-2xl p-6 shadow-card space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Clinical History & Consultation Notes
              </h3>
              <div className="space-y-3">
                {(patient.history || defaultPatient.history).map((h: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl border bg-secondary/20 space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-bold text-primary">{h.doctor}</span>
                      <span>{h.date}</span>
                    </div>
                    <div className="font-semibold text-sm">{h.diagnosis}</div>
                    <div className="text-xs text-muted-foreground">{h.notes}</div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: PRESCRIPTIONS */}
          <TabsContent value="prescriptions" className="space-y-4 mt-4">
            <div className="bg-white border rounded-2xl p-6 shadow-card space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Pill className="h-5 w-5 text-rose-500" /> Prescriptions History
              </h3>
              <div className="space-y-3">
                {(patient.prescriptions || defaultPatient.prescriptions).map((rx: any) => (
                  <div key={rx.id} className="p-4 rounded-xl border bg-rose-50/50 border-rose-100 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm">{rx.id} • {rx.date}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{rx.items}</div>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700">{rx.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* TAB 4: LAB REPORTS */}
          <TabsContent value="reports" className="space-y-4 mt-4">
            <div className="bg-white border rounded-2xl p-6 shadow-card space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-violet-500" /> Diagnostic & Lab Reports
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {(patient.reports || defaultPatient.reports).map((rep: any) => (
                  <div key={rep.id} className="p-4 rounded-xl border bg-white shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{rep.type}</Badge>
                      <span className="text-xs text-muted-foreground">{rep.date}</span>
                    </div>
                    <div className="font-bold text-sm">{rep.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">{rep.summary}</div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Record Vitals Dialog Modal */}
      <Dialog open={addVitalOpen} onOpenChange={setAddVitalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Patient Vitals</DialogTitle>
            <DialogDescription>Enter new vitals parameters for {patient.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Blood Pressure (BP)</Label>
              <Input value={vitalForm.bp} onChange={(e) => setVitalForm({ ...vitalForm, bp: e.target.value })} placeholder="120/80" className="mt-1" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Pulse (bpm)</Label>
                <Input value={vitalForm.pulse} onChange={(e) => setVitalForm({ ...vitalForm, pulse: e.target.value })} placeholder="72" className="mt-1" />
              </div>
              <div>
                <Label>Temp (°C)</Label>
                <Input value={vitalForm.temp} onChange={(e) => setVitalForm({ ...vitalForm, temp: e.target.value })} placeholder="36.5" className="mt-1" />
              </div>
              <div>
                <Label>SpO2 (%)</Label>
                <Input value={vitalForm.spo2} onChange={(e) => setVitalForm({ ...vitalForm, spo2: e.target.value })} placeholder="98" className="mt-1" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddVitalOpen(false)}>Cancel</Button>
            <Button onClick={addVital} className="bg-gradient-primary text-white">Save Vitals</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
