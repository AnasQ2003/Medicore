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

const patientDatabase: Record<string, any> = {
  "1042": {
    id: 1042, patientCode: "P-1042", name: "Ahmed Ali", age: 54, gender: "Male", bloodGroup: "B+",
    phone: "+92 300 1234567", email: "ahmed.ali@example.com", address: "House 14, St 5, F-7/2 Islamabad",
    condition: "Hypertension, Mild Dyslipidemia",
    allergies: ["Penicillin", "Peanuts"], chronic: ["Hypertension (since 2019)", "Hyperlipidemia"],
    currentMeds: ["Amlodipine 5mg OD", "Atorvastatin 10mg HS", "Aspirin 75mg OD"],
    vitals: [
      { date: "2026-06-12", bp: "138/92", pulse: 82, temp: 36.8, spo2: 97 },
      { date: "2026-05-28", bp: "142/94", pulse: 84, temp: 36.7, spo2: 98 },
      { date: "2026-04-15", bp: "135/88", pulse: 78, temp: 36.6, spo2: 98 },
    ],
    history: [
      { date: "2026-06-12", doctor: "Dr. Sarah Khan", diagnosis: "Hypertension Routine Follow-up", notes: "BP 138/92, advised low sodium diet, titrate statin if LDL remains > 160." },
      { date: "2026-03-12", doctor: "Dr. Sarah Khan", diagnosis: "Occasional Palpitations", notes: "24h Holter requested. Normal sinus rhythm confirmed." },
    ],
    reports: [
      { id: "R-501", name: "Lipid Profile Report", type: "Lab", date: "2026-06-12", summary: "Total Cholesterol 240 mg/dL (high), LDL 162, HDL 38, TG 210." },
      { id: "R-506", name: "Standard 12-Lead ECG", type: "Cardio", date: "2026-06-07", summary: "Normal sinus rhythm 78 bpm. Normal axis." },
    ],
    prescriptions: [
      { id: "RX-101", items: "Amlodipine 5mg OD, Atorvastatin 10mg HS", date: "2026-06-12", status: "Active" },
    ]
  },
  "1043": {
    id: 1043, patientCode: "P-1043", name: "Fatima Noor", age: 28, gender: "Female", bloodGroup: "A+",
    phone: "+92 333 9876543", email: "fatima.noor@example.com", address: "Apt 402, G-9/1 Islamabad",
    condition: "Anxiety with Palpitations, Mild Asthma",
    allergies: ["None known"], chronic: ["Bronchial Asthma"],
    currentMeds: ["Salbutamol Inhaler PRN", "Escitalopram 10mg OD"],
    vitals: [
      { date: "2026-06-11", bp: "115/75", pulse: 96, temp: 36.6, spo2: 99 },
      { date: "2026-05-10", bp: "112/72", pulse: 88, temp: 36.5, spo2: 99 },
    ],
    history: [
      { date: "2026-06-11", doctor: "Dr. Sarah Khan", diagnosis: "Asthma Follow-up", notes: "Chest clear, peak flow 420 L/min. Continue inhaler PRN." },
    ],
    reports: [
      { id: "R-502", name: "24h Holter ECG Monitor", type: "Cardio", date: "2026-06-11", summary: "Sinus rhythm with rare PVCs (<1%). Reassuring." },
    ],
    prescriptions: [
      { id: "RX-104", items: "Salbutamol Inhaler 100mcg 2 puffs PRN", date: "2026-06-11", status: "Active" },
    ]
  },
  "1044": {
    id: 1044, patientCode: "P-1044", name: "Hassan Raza", age: 66, gender: "Male", bloodGroup: "O-",
    phone: "+92 321 2233445", email: "hassan.raza@example.com", address: "Sector H-8/4 Islamabad",
    condition: "Post-CABG Recovery, Critical BP Monitoring",
    allergies: ["Aspirin"], chronic: ["Ischemic Heart Disease", "Hypertension"],
    currentMeds: ["Clopidogrel 75mg OD", "Bisoprolol 5mg OD", "Ramipril 2.5mg OD"],
    vitals: [
      { date: "2026-06-10", bp: "146/96", pulse: 88, temp: 36.9, spo2: 96 },
      { date: "2026-06-01", bp: "150/98", pulse: 92, temp: 37.0, spo2: 95 },
    ],
    history: [
      { date: "2026-06-10", doctor: "Dr. Sarah Khan", diagnosis: "Post-CABG 3 Month Review", notes: "Sternal wound healed. EF 45% on echo. Added Beta-blocker." },
    ],
    reports: [
      { id: "R-503", name: "2D Transthoracic Echo", type: "Cardio", date: "2026-06-10", summary: "EF 45% (mildly reduced). Regional wall motion abnormality inferior wall." },
    ],
    prescriptions: [
      { id: "RX-108", items: "Clopidogrel 75mg OD, Bisoprolol 5mg OD", date: "2026-06-10", status: "Active" },
    ]
  },
  "1045": {
    id: 1045, patientCode: "P-1045", name: "Ayesha Tariq", age: 35, gender: "Female", bloodGroup: "AB+",
    phone: "+92 311 5544332", email: "ayesha.t@example.com", address: "Civic Center, Phase 4 Bahria Town Rawalpindi",
    condition: "Gestational Diabetes Management",
    allergies: ["Sulfa drugs"], chronic: ["Gestational Diabetes"],
    currentMeds: ["Metformin 500mg BD", "Prenatal Vitamins"],
    vitals: [
      { date: "2026-06-08", bp: "120/78", pulse: 74, temp: 36.5, spo2: 98 },
    ],
    history: [
      { date: "2026-06-08", doctor: "Dr. Sarah Khan", diagnosis: "Antenatal Metabolic Review", notes: "Fasting BSR 92 mg/dL, Postprandial 128 mg/dL. Good control." },
    ],
    reports: [
      { id: "R-505", name: "Complete Blood Count (CBC)", type: "Lab", date: "2026-06-08", summary: "Hb 12.8 g/dL, WBC 7.4, Platelets 250k. All normal." },
    ],
    prescriptions: [
      { id: "RX-112", items: "Metformin 500mg BD with meals", date: "2026-06-08", status: "Active" },
    ]
  },
  "1046": {
    id: 1046, patientCode: "P-1046", name: "Bilal Khan", age: 45, gender: "Male", bloodGroup: "O+",
    phone: "+92 300 9988776", email: "bilal.k@example.com", address: "Street 8, Westridge Rawalpindi",
    condition: "Post-op Cholecystectomy Recovery",
    allergies: ["NSAIDS"], chronic: ["Gallstone Disease"],
    currentMeds: ["Paracetamol 1g TID", "Omeprazole 20mg OD"],
    vitals: [
      { date: "2026-06-09", bp: "118/76", pulse: 70, temp: 36.6, spo2: 98 },
    ],
    history: [
      { date: "2026-06-09", doctor: "Dr. Sarah Khan", diagnosis: "Post-laparoscopic Cholecystectomy Day 5", notes: "Laparoscopic ports clean, soft abdomen. Tolerating normal diet." },
    ],
    reports: [
      { id: "R-504", name: "Ultrasound Abdomen Post-Op", type: "Radiology", date: "2026-06-09", summary: "Surgical bed clean, no fluid collection or hematoma." },
    ],
    prescriptions: [
      { id: "RX-115", items: "Paracetamol 1000mg TID PRN pain", date: "2026-06-09", status: "Active" },
    ]
  },
  "1047": {
    id: 1047, patientCode: "P-1047", name: "Zara Malik", age: 22, gender: "Female", bloodGroup: "B-",
    phone: "+92 345 1122334", email: "zara.m@example.com", address: "House 88, Block C Naval Anchorage Islamabad",
    condition: "Severe Anemia — Transfusion & Iron Protocol",
    allergies: ["Iron IV dextran"], chronic: ["Severe Iron Deficiency Anemia"],
    currentMeds: ["Oral Iron Polymaltose 100mg BD", "Folic Acid 5mg OD"],
    vitals: [
      { date: "2026-06-05", bp: "100/60", pulse: 102, temp: 36.8, spo2: 94 },
    ],
    history: [
      { date: "2026-06-05", doctor: "Dr. Sarah Khan", diagnosis: "Microcytic Anemia Workup", notes: "Hb 7.2 g/dL. Commenced sucrose infusion protocol." },
    ],
    reports: [
      { id: "R-507", name: "Peripheral Blood Film", type: "Lab", date: "2026-06-05", summary: "Severe microcytic hypochromic picture. Anisopoikilocytosis." },
    ],
    prescriptions: [
      { id: "RX-119", items: "Iron Polymaltose 100mg BD + Vit C", date: "2026-06-05", status: "Active" },
    ]
  },
  "1048": {
    id: 1048, patientCode: "P-1048", name: "Mohammad Usman", age: 72, gender: "Male", bloodGroup: "A-",
    phone: "+92 300 3456789", email: "m.usman@example.com", address: "G-10/2 Islamabad",
    condition: "COPD Exacerbation — Stable on Oxygen",
    allergies: ["Penicillin"], chronic: ["COPD (GOLD Grade 2)", "Type 2 Diabetes"],
    currentMeds: ["Tiotropium Inhaler 18mcg OD", "Formoterol/Budesonide 200/6 BD", "Metformin 850mg BD"],
    vitals: [
      { date: "2026-06-04", bp: "132/84", pulse: 86, temp: 36.7, spo2: 92 },
    ],
    history: [
      { date: "2026-06-04", doctor: "Dr. Sarah Khan", diagnosis: "COPD Follow-up", notes: "SpO2 92% room air. Exertional dyspnea Grade II. Continue triple inhaler therapy." },
    ],
    reports: [
      { id: "R-508", name: "Spirometry / PFT", type: "Radiology", date: "2026-06-04", summary: "FEV1/FVC 0.58. Moderate obstructive airway disease." },
    ],
    prescriptions: [
      { id: "RX-122", items: "Formoterol/Budesonide 200/6 2 puffs BD", date: "2026-06-04", status: "Active" },
    ]
  },
  "1049": {
    id: 1049, patientCode: "P-1049", name: "Sana Tariq", age: 41, gender: "Female", bloodGroup: "O+",
    phone: "+92 311 7766554", email: "sana.t@example.com", address: "F-11/3 Islamabad",
    condition: "Chronic Migraine with Aura",
    allergies: ["Codeine"], chronic: ["Chronic Migraine"],
    currentMeds: ["Topiramate 50mg BD", "Rizatriptan 10mg PRN"],
    vitals: [
      { date: "2026-06-02", bp: "116/74", pulse: 68, temp: 36.4, spo2: 99 },
    ],
    history: [
      { date: "2026-06-02", doctor: "Dr. Sarah Khan", diagnosis: "Migraine Prophylaxis Review", notes: "Frequency reduced from 8/month to 2/month on Topiramate. Continue current dose." },
    ],
    reports: [
      { id: "R-509", name: "Brain MRI Scan", type: "Radiology", date: "2026-05-15", summary: "Unremarkable brain parenchyma. No acute lesion or mass effect." },
    ],
    prescriptions: [
      { id: "RX-125", items: "Topiramate 50mg BD", date: "2026-06-02", status: "Active" },
    ]
  }
};

function PatientDetailScreen() {
  const { id } = useParams({ from: "/doctor/patients/$id" });
  const [addVitalOpen, setAddVitalOpen] = useState(false);
  const [vitalForm, setVitalForm] = useState({ bp: "120/80", pulse: "72", temp: "36.5", spo2: "98" });

  const { data: apiData } = useApi(() => patientAPI.getById(id));

  // Determine patient data by ID lookup or API data
  const fallback = patientDatabase[id] || patientDatabase["1042"];
  const apiObj = (apiData as any)?.data || apiData;
  const patient = (apiObj && apiObj.name) ? { ...fallback, ...apiObj } : fallback;

  const vitalsList: Vital[] = patient.vitals || fallback.vitals;
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
          { label: "Primary Condition", value: patient.condition || "Routine Follow-up" },
          { label: "Attending Doctor", value: "Dr. Sarah Khan (Cardiology)" },
          { label: "Contact Phone", value: patient.phone || "+92 300 1234567" },
          { label: "Email Address", value: patient.email || "patient@example.com" },
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
      },
      {
        title: "Active Prescriptions & Dosage Plan",
        notes: (patient.currentMeds as string[] || []).map((m: string) => `Prescribed: ${m}`),
      },
      {
        title: "Recent Diagnostics & Lab Reports",
        table: {
          headers: ["Report ID", "Test Name", "Category", "Date", "Summary"],
          rows: (patient.reports || []).map((r: any) => [r.id, r.name, r.type, r.date, r.summary])
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
          <div className="rounded-2xl bg-blue-50/90 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 p-4 text-center shadow-card">
            <div className="text-xs uppercase font-semibold text-blue-700 dark:text-blue-300">Blood Pressure</div>
            <div className="text-2xl font-black text-blue-900 dark:text-blue-100 mt-1">{localVitals[0]?.bp || "120/80"}</div>
            <div className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">mmHg</div>
          </div>
          <div className="rounded-2xl bg-rose-50/90 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 p-4 text-center shadow-card">
            <div className="text-xs uppercase font-semibold text-rose-700 dark:text-rose-300">Pulse Rate</div>
            <div className="text-2xl font-black text-rose-900 dark:text-rose-100 mt-1">{localVitals[0]?.pulse || 72}</div>
            <div className="text-[10px] text-rose-600 dark:text-rose-400 mt-0.5">bpm</div>
          </div>
          <div className="rounded-2xl bg-amber-50/90 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 p-4 text-center shadow-card">
            <div className="text-xs uppercase font-semibold text-amber-700 dark:text-amber-300">Body Temp</div>
            <div className="text-2xl font-black text-amber-900 dark:text-amber-100 mt-1">{localVitals[0]?.temp || 36.5}°C</div>
            <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">Normal</div>
          </div>
          <div className="rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-4 text-center shadow-card">
            <div className="text-xs uppercase font-semibold text-emerald-700 dark:text-emerald-300">Oxygen Saturation</div>
            <div className="text-2xl font-black text-emerald-900 dark:text-emerald-100 mt-1">{localVitals[0]?.spo2 || 98}%</div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">SpO2</div>
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
            <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
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
              <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
                <h4 className="font-semibold flex items-center gap-2 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="h-4 w-4" /> Allergies & Precautions
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(patient.allergies || []).map((alg: string) => (
                    <Badge key={alg} className="bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800 py-1 px-3">
                      {alg}
                    </Badge>
                  ))}
                </div>

                <h4 className="font-semibold flex items-center gap-2 text-foreground pt-2">
                  <Activity className="h-4 w-4 text-primary" /> Chronic Conditions
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(patient.chronic || []).map((chr: string) => (
                    <Badge key={chr} variant="secondary" className="py-1 px-3">
                      {chr}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Active Medications */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-3">
                <h4 className="font-semibold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <Pill className="h-4 w-4" /> Active Medications
                </h4>
                <ul className="space-y-2 text-sm">
                  {(patient.currentMeds || []).map((med: string) => (
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
            <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Clinical History & Consultation Notes
              </h3>
              <div className="space-y-3">
                {(patient.history || []).map((h: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl border border-border bg-secondary/20 space-y-1">
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
            <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Pill className="h-5 w-5 text-rose-500" /> Prescriptions History
              </h3>
              <div className="space-y-3">
                {(patient.prescriptions || []).map((rx: any) => (
                  <div key={rx.id} className="p-4 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/30 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm">{rx.id} • {rx.date}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{rx.items}</div>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">{rx.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* TAB 4: LAB REPORTS */}
          <TabsContent value="reports" className="space-y-4 mt-4">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-violet-500" /> Diagnostic & Lab Reports
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {(patient.reports || []).map((rep: any) => (
                  <div key={rep.id} className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-2">
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
