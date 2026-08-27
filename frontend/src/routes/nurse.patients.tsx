import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { nurseNav } from "@/lib/roleNav";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search, HeartPulse, UserPlus,
  BedDouble, Building2, Layers, Activity, Thermometer, Droplets,
  Calendar, Stethoscope, Monitor
} from "lucide-react";
import { patientAPI } from "@/lib/api/client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { PatientICUMonitorModal, PatientMonitorData } from "@/components/PatientICUMonitorModal";

export const Route = createFileRoute("/nurse/patients")({
  head: () => ({ meta: [{ title: "Patients — Nurse" }] }),
  component: NursePatientsScreen,
});

interface Patient {
  id: number;
  name: string;
  patientCode: string;
  email?: string;
  phone?: string;
  gender: string;
  bloodGroup: string;
  age: number;
  ward: string;
  roomNo: string;
  floorNo: string;
  bedNo: string;
  admittedDays: number;
  condition: string;
  status: "Stable" | "Observation" | "Critical";
  vitals: {
    bp: string;
    pulse: number;
    temp: number;
    spo2: number;
    recordedAt: string;
  };
}

const INITIAL_PATIENTS: Patient[] = [
  {
    id: 101, name: "Muhammad Usama Khan", patientCode: "P-1001", email: "usama@example.com",
    gender: "Male", bloodGroup: "O+", age: 34,
    roomNo: "ICU-01", floorNo: "Floor 2", bedNo: "ICU-04", ward: "ICU",
    admittedDays: 3, condition: "Acute Cardiac Monitoring", status: "Critical",
    vitals: { bp: "145/90", pulse: 102, temp: 38.1, spo2: 93, recordedAt: new Date(Date.now() - 25 * 60000).toISOString() }
  },
  {
    id: 105, name: "Ali Hassan Sheikh", patientCode: "P-1005", email: "ali@example.com",
    gender: "Male", bloodGroup: "O-", age: 67,
    roomNo: "ICU-02", floorNo: "Floor 2", bedNo: "ICU-07", ward: "ICU",
    admittedDays: 8, condition: "Respiratory Failure", status: "Critical",
    vitals: { bp: "150/95", pulse: 112, temp: 38.5, spo2: 91, recordedAt: new Date(Date.now() - 15 * 60000).toISOString() }
  },
  {
    id: 102, name: "Sara Ahmed", patientCode: "P-1002", email: "sara@example.com",
    gender: "Female", bloodGroup: "B+", age: 28,
    roomNo: "302", floorNo: "Floor 3", bedNo: "Bed-302A", ward: "General Ward",
    admittedDays: 1, condition: "Post-op Recovery", status: "Stable",
    vitals: { bp: "118/76", pulse: 74, temp: 36.6, spo2: 99, recordedAt: new Date(Date.now() - 45 * 60000).toISOString() }
  },
  {
    id: 109, name: "Tariq Mehmood", patientCode: "P-1009", email: "tariq@example.com",
    gender: "Male", bloodGroup: "A+", age: 55,
    roomNo: "305", floorNo: "Floor 3", bedNo: "Bed-305B", ward: "General Ward",
    admittedDays: 4, condition: "Diabetic Foot Protocol", status: "Stable",
    vitals: { bp: "124/80", pulse: 78, temp: 36.8, spo2: 98, recordedAt: new Date(Date.now() - 80 * 60000).toISOString() }
  },
  {
    id: 103, name: "Hamza Riaz", patientCode: "P-1003", email: "hamza@example.com",
    gender: "Male", bloodGroup: "A-", age: 52,
    roomNo: "114", floorNo: "Floor 1", bedNo: "Bed-114B", ward: "Medical Ward",
    admittedDays: 5, condition: "Hypertension Control", status: "Observation",
    vitals: { bp: "128/82", pulse: 82, temp: 37.2, spo2: 97, recordedAt: new Date(Date.now() - 110 * 60000).toISOString() }
  },
  {
    id: 110, name: "Maryam Bibi", patientCode: "P-1010", email: "maryam@example.com",
    gender: "Female", bloodGroup: "B-", age: 48,
    roomNo: "118", floorNo: "Floor 1", bedNo: "Bed-118", ward: "Medical Ward",
    admittedDays: 2, condition: "Bronchitis & Asthma", status: "Observation",
    vitals: { bp: "135/88", pulse: 94, temp: 37.6, spo2: 96, recordedAt: new Date(Date.now() - 60 * 60000).toISOString() }
  },
  {
    id: 104, name: "Fatima Noor", patientCode: "P-1004", email: "fatima@example.com",
    gender: "Female", bloodGroup: "AB+", age: 41,
    roomNo: "205", floorNo: "Floor 2", bedNo: "Bed-205", ward: "Surgical Ward",
    admittedDays: 2, condition: "Laparoscopic Appendectomy", status: "Stable",
    vitals: { bp: "122/78", pulse: 76, temp: 37.0, spo2: 98, recordedAt: new Date(Date.now() - 35 * 60000).toISOString() }
  },
  {
    id: 111, name: "Kamran Akram", patientCode: "P-1011", email: "kamran@example.com",
    gender: "Male", bloodGroup: "O+", age: 39,
    roomNo: "210", floorNo: "Floor 2", bedNo: "Bed-210A", ward: "Surgical Ward",
    admittedDays: 3, condition: "Hernia Repair Post-op", status: "Stable",
    vitals: { bp: "126/80", pulse: 84, temp: 37.1, spo2: 98, recordedAt: new Date(Date.now() - 95 * 60000).toISOString() }
  },
  {
    id: 106, name: "Ayesha Malik", patientCode: "P-1006", email: "ayesha@example.com",
    gender: "Female", bloodGroup: "B-", age: 24,
    roomNo: "408", floorNo: "Floor 4", bedNo: "Bed-408A", ward: "Maternity Ward",
    admittedDays: 1, condition: "Routine Post-delivery Care", status: "Stable",
    vitals: { bp: "110/70", pulse: 68, temp: 36.8, spo2: 100, recordedAt: new Date(Date.now() - 150 * 60000).toISOString() }
  },
  {
    id: 112, name: "Sadia Rehman", patientCode: "P-1012", email: "sadia@example.com",
    gender: "Female", bloodGroup: "A+", age: 29,
    roomNo: "412", floorNo: "Floor 4", bedNo: "Bed-412B", ward: "Maternity Ward",
    admittedDays: 2, condition: "Ante-natal Observation", status: "Observation",
    vitals: { bp: "120/78", pulse: 80, temp: 37.0, spo2: 98, recordedAt: new Date(Date.now() - 70 * 60000).toISOString() }
  },
  {
    id: 107, name: "Bilal Chaudhry", patientCode: "P-1007", email: "bilal@example.com",
    gender: "Male", bloodGroup: "A+", age: 45,
    roomNo: "312", floorNo: "Floor 3", bedNo: "Bed-312C", ward: "Orthopedic Ward",
    admittedDays: 6, condition: "Total Hip Replacement", status: "Observation",
    vitals: { bp: "130/85", pulse: 80, temp: 37.1, spo2: 97, recordedAt: new Date(Date.now() - 130 * 60000).toISOString() }
  },
  {
    id: 113, name: "Rashid Minhas", patientCode: "P-1013", email: "rashid@example.com",
    gender: "Male", bloodGroup: "O+", age: 62,
    roomNo: "318", floorNo: "Floor 3", bedNo: "Bed-318A", ward: "Orthopedic Ward",
    admittedDays: 4, condition: "Femur Fracture Protocol", status: "Stable",
    vitals: { bp: "125/80", pulse: 74, temp: 36.9, spo2: 99, recordedAt: new Date(Date.now() - 160 * 60000).toISOString() }
  },
  {
    id: 108, name: "Zainab Qureshi", patientCode: "P-1008", email: "zainab@example.com",
    gender: "Female", bloodGroup: "O+", age: 35,
    roomNo: "501", floorNo: "Floor 5", bedNo: "Bed-501", ward: "Neurology Ward",
    admittedDays: 4, condition: "Migraine Protocol", status: "Stable",
    vitals: { bp: "120/80", pulse: 72, temp: 36.9, spo2: 99, recordedAt: new Date(Date.now() - 180 * 60000).toISOString() }
  },
  {
    id: 114, name: "Farhan Ali", patientCode: "P-1014", email: "farhan@example.com",
    gender: "Male", bloodGroup: "AB-", age: 58,
    roomNo: "506", floorNo: "Floor 5", bedNo: "Bed-506B", ward: "Neurology Ward",
    admittedDays: 7, condition: "Post-Stroke Rehabilitation", status: "Observation",
    vitals: { bp: "138/86", pulse: 78, temp: 37.0, spo2: 97, recordedAt: new Date(Date.now() - 90 * 60000).toISOString() }
  },
];

const WARDS = ["All", "ICU", "General Ward", "Medical Ward", "Surgical Ward", "Maternity Ward", "Orthopedic Ward", "Neurology Ward"];

function NursePatientsScreen() {
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [q, setQ] = useState("");
  const [wardFilter, setWardFilter] = useState("All");

  // Vitals Dialog State
  const [vitalsOpen, setVitalsOpen] = useState(false);
  const [selectedPat, setSelectedPat] = useState<Patient | null>(null);
  const [vitalsForm, setVitalsForm] = useState({ bp: "", pulse: "", temp: "", spo2: "" });

  // Add Patient Dialog State
  const [addOpen, setAddOpen] = useState(false);
  const [newPat, setNewPat] = useState({
    name: "",
    gender: "Male",
    age: "",
    bloodGroup: "O+",
    ward: "General Ward",
    roomNo: "301",
    floorNo: "Floor 3",
    bedNo: "Bed-301",
    condition: "",
    bp: "120/80",
    pulse: "75",
    temp: "36.8",
    spo2: "98",
  });

  // ICU Monitor Modal
  const [monitorPatient, setMonitorPatient] = useState<PatientMonitorData | null>(null);

  const filtered = patients.filter((p) => {
    const matchQ = p.name.toLowerCase().includes(q.toLowerCase()) ||
      p.patientCode.toLowerCase().includes(q.toLowerCase()) ||
      p.bedNo.toLowerCase().includes(q.toLowerCase()) ||
      p.ward.toLowerCase().includes(q.toLowerCase()) ||
      p.condition.toLowerCase().includes(q.toLowerCase());
    const matchWard = wardFilter === "All" || p.ward === wardFilter;
    return matchQ && matchWard;
  });

  const handleOpenVitalsModal = (p: Patient) => {
    setSelectedPat(p);
    setVitalsForm({
      bp: p.vitals.bp,
      pulse: String(p.vitals.pulse),
      temp: String(p.vitals.temp),
      spo2: String(p.vitals.spo2),
    });
    setVitalsOpen(true);
  };

  const handleSaveVitals = async () => {
    if (!selectedPat) return;
    if (!vitalsForm.bp || !vitalsForm.pulse || !vitalsForm.temp || !vitalsForm.spo2) {
      return toast.error("All vital sign fields are required");
    }

    const pulseNum = Number(vitalsForm.pulse);
    const tempNum = Number(vitalsForm.temp);
    const spo2Num = Number(vitalsForm.spo2);

    let newStatus: "Stable" | "Observation" | "Critical" = "Stable";
    if (spo2Num < 94 || pulseNum > 105 || tempNum > 38.2) {
      newStatus = "Critical";
    } else if (spo2Num < 96 || pulseNum > 95 || tempNum > 37.5) {
      newStatus = "Observation";
    }

    try {
      if (selectedPat.id) {
        await patientAPI.recordVitals({
          patientId: selectedPat.id,
          bp: vitalsForm.bp,
          pulse: pulseNum,
          temp: tempNum,
          spo2: spo2Num,
        }).catch(() => {});
      }
    } catch {
      // Continue locally
    }

    setPatients((prev) =>
      prev.map((item) => {
        if (item.id === selectedPat.id) {
          return {
            ...item,
            status: newStatus,
            vitals: {
              bp: vitalsForm.bp,
              pulse: pulseNum,
              temp: tempNum,
              spo2: spo2Num,
              recordedAt: new Date().toISOString(),
            },
          };
        }
        return item;
      })
    );

    toast.success(`Updated vitals for ${selectedPat.name}`, {
      description: `BP ${vitalsForm.bp} · HR ${pulseNum} bpm · Temp ${tempNum}°C · SpO₂ ${spo2Num}%`,
    });
    setVitalsOpen(false);
  };

  const handleAddPatient = () => {
    if (!newPat.name.trim()) return toast.error("Please enter patient full name");
    if (!newPat.age || isNaN(Number(newPat.age))) return toast.error("Please enter a valid age");
    if (!newPat.condition.trim()) return toast.error("Please enter clinical condition / diagnosis");

    const pulseNum = Number(newPat.pulse) || 75;
    const tempNum = Number(newPat.temp) || 36.8;
    const spo2Num = Number(newPat.spo2) || 98;

    let status: "Stable" | "Observation" | "Critical" = "Stable";
    if (spo2Num < 94 || pulseNum > 105 || tempNum > 38.2) {
      status = "Critical";
    } else if (spo2Num < 96 || pulseNum > 95 || tempNum > 37.5) {
      status = "Observation";
    }

    const created: Patient = {
      id: Date.now(),
      name: newPat.name.trim(),
      patientCode: `P-${Math.floor(1000 + Math.random() * 9000)}`,
      gender: newPat.gender,
      bloodGroup: newPat.bloodGroup,
      age: Number(newPat.age),
      ward: newPat.ward,
      roomNo: newPat.roomNo,
      floorNo: newPat.floorNo,
      bedNo: newPat.bedNo,
      admittedDays: 1,
      condition: newPat.condition.trim(),
      status,
      vitals: {
        bp: newPat.bp || "120/80",
        pulse: pulseNum,
        temp: tempNum,
        spo2: spo2Num,
        recordedAt: new Date().toISOString(),
      },
    };

    setPatients((prev) => [created, ...prev]);
    toast.success(`Admitted ${created.name} to ${created.ward}`, {
      description: `Assigned ${created.bedNo} (Room ${created.roomNo}) · Status: ${created.status}`,
    });

    setAddOpen(false);
    setNewPat({
      name: "",
      gender: "Male",
      age: "",
      bloodGroup: "O+",
      ward: "General Ward",
      roomNo: "301",
      floorNo: "Floor 3",
      bedNo: "Bed-301",
      condition: "",
      bp: "120/80",
      pulse: "75",
      temp: "36.8",
      spo2: "98",
    });
  };

  const handleOpenMonitor = (p: Patient) => {
    setMonitorPatient({
      id: String(p.id),
      name: p.name,
      age: p.age,
      gender: p.gender,
      bedNo: p.bedNo,
      roomNo: p.roomNo,
      condition: p.condition,
      attendingDoctor: "Dr. Arshad Mahmood",
      heartRate: p.vitals.pulse,
      spO2: p.vitals.spo2,
      bp: p.vitals.bp,
      temp: p.vitals.temp,
      respRate: p.status === "Critical" ? 24 : 16,
      ivDrip: {
        name: "Normal Saline (0.9%)",
        flowRate: p.status === "Critical" ? 40 : 20,
        remainingPercent: 70,
        status: "Flowing",
      },
      medications: [
        { id: "m1", name: "Cefazolin 1g IV", dosage: "1 Vial", time: "10:00 AM", status: "Pending" },
        { id: "m2", name: "Paracetamol 1000mg IV", dosage: "100ml Infusion", time: "08:00 AM", status: "Given" },
      ],
      stocks: [
        { id: "s1", name: "0.9% Saline Bags", quantity: 12, unit: "Bags", status: "In Stock" },
        { id: "s2", name: "20G IV Cannula", quantity: 5, unit: "Pcs", status: "Low Stock" },
        { id: "s3", name: "Syringes (10ml)", quantity: 40, unit: "Pcs", status: "In Stock" },
        { id: "s4", name: "Paracetamol IV", quantity: 4, unit: "Vials", status: "Low Stock" },
      ],
    });
  };

  return (
    <AppShell role="nurse" title="Nurse" nav={nurseNav}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient Directory</h1>
          <p className="text-muted-foreground">{patients.length} patients currently admitted across all active wings</p>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          className="bg-gradient-red text-white shadow-glow-red font-semibold cursor-pointer shrink-0"
        >
          <UserPlus className="h-4 w-4 mr-2" /> Add Patient
        </Button>
      </div>

      {/* Search and Ward Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, code, bed number, or condition..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Ward filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {WARDS.map((w) => (
          <button
            key={w}
            onClick={() => setWardFilter(w)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
              wardFilter === w
                ? "bg-rose-600 text-white border-rose-600 shadow-md"
                : "bg-secondary text-muted-foreground border-border hover:border-rose-400 hover:text-rose-600"
            }`}
          >
            {w}
          </button>
        ))}
      </div>

      {/* Modern High-End Patient Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((p, i) => {
          const isCritical = p.status === "Critical";
          const isObservation = p.status === "Observation";

          const cardBorder = isCritical
            ? "border-rose-300 dark:border-rose-800 shadow-rose-100/50 dark:shadow-rose-950/30 ring-1 ring-rose-500/20"
            : isObservation
            ? "border-amber-200 dark:border-amber-900"
            : "border-border";

          const initials = p.name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("");

          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ y: -4 }}
              className={`bg-card border rounded-2xl p-5 shadow-card hover:shadow-xl transition-all duration-300 flex flex-col justify-between ${cardBorder}`}
            >
              <div>
                {/* Header: Avatar, Name, Code, Badges */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold text-base text-white shadow-md ${
                        isCritical
                          ? "bg-gradient-to-br from-rose-600 to-red-700"
                          : isObservation
                          ? "bg-gradient-to-br from-amber-500 to-orange-600"
                          : "bg-gradient-to-br from-emerald-500 to-teal-600"
                      }`}
                    >
                      {initials}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-card-foreground leading-snug">{p.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-xs font-semibold text-rose-600 dark:text-rose-400">
                          {p.patientCode}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {p.gender}, {p.age}y
                        </span>
                      </div>
                    </div>
                  </div>

                  <Badge
                    className={
                      isCritical
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 animate-pulse font-bold"
                        : isObservation
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 font-semibold"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 font-semibold"
                    }
                  >
                    {p.status}
                  </Badge>
                </div>

                {/* Ward & Location Strip */}
                <div className="bg-secondary/60 dark:bg-secondary/40 rounded-xl p-3 mb-3 border border-border/50">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                      <Building2 className="h-3.5 w-3.5 text-rose-500" />
                      <span>{p.ward}</span>
                    </div>
                    <span className="text-[11px] bg-background/80 px-2 py-0.5 rounded-full text-muted-foreground border border-border/50">
                      {p.admittedDays}d admitted
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-background/80 dark:bg-background/50 rounded-lg py-1.5 px-2 border border-border/40">
                      <div className="text-[10px] text-muted-foreground">Floor</div>
                      <div className="font-bold text-foreground truncate">{p.floorNo.replace("Floor ", "F")}</div>
                    </div>
                    <div className="bg-background/80 dark:bg-background/50 rounded-lg py-1.5 px-2 border border-border/40">
                      <div className="text-[10px] text-muted-foreground">Room</div>
                      <div className="font-bold text-foreground truncate">{p.roomNo}</div>
                    </div>
                    <div className="bg-background/80 dark:bg-background/50 rounded-lg py-1.5 px-2 border border-border/40">
                      <div className="text-[10px] text-muted-foreground">Bed</div>
                      <div className="font-bold text-rose-600 dark:text-rose-400 truncate">{p.bedNo}</div>
                    </div>
                  </div>
                </div>

                {/* Diagnosis / Condition Tag */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3 px-1">
                  <Stethoscope className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                  <span className="font-medium truncate text-foreground/90">{p.condition}</span>
                </div>

                {/* Clinical Vitals Readout Grid */}
                <div className="grid grid-cols-4 gap-2 mb-2">
                  <div className="bg-secondary/40 dark:bg-secondary/20 rounded-xl p-2 text-center border border-border/40">
                    <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-0.5">
                      <Droplets className="h-2.5 w-2.5 text-rose-500" /> BP
                    </div>
                    <div className="font-bold text-xs font-mono mt-0.5 text-foreground">{p.vitals.bp}</div>
                  </div>

                  <div className="bg-secondary/40 dark:bg-secondary/20 rounded-xl p-2 text-center border border-border/40">
                    <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-0.5">
                      <HeartPulse className="h-2.5 w-2.5 text-rose-500" /> HR
                    </div>
                    <div className={`font-bold text-xs font-mono mt-0.5 ${p.vitals.pulse > 100 ? "text-rose-600 font-extrabold" : "text-foreground"}`}>
                      {p.vitals.pulse}
                    </div>
                  </div>

                  <div className="bg-secondary/40 dark:bg-secondary/20 rounded-xl p-2 text-center border border-border/40">
                    <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-0.5">
                      <Thermometer className="h-2.5 w-2.5 text-amber-500" /> Temp
                    </div>
                    <div className="font-bold text-xs font-mono mt-0.5 text-foreground">{p.vitals.temp}°C</div>
                  </div>

                  <div className="bg-secondary/40 dark:bg-secondary/20 rounded-xl p-2 text-center border border-border/40">
                    <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-0.5">
                      <Activity className="h-2.5 w-2.5 text-emerald-500" /> SpO₂
                    </div>
                    <div className={`font-bold text-xs font-mono mt-0.5 ${p.vitals.spo2 < 94 ? "text-rose-600 font-extrabold" : "text-foreground"}`}>
                      {p.vitals.spo2}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer: Blood Group & Actions */}
              <div className="border-t border-border pt-3.5 mt-3 flex items-center justify-between gap-2">
                <Badge variant="outline" className="bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 font-bold text-xs">
                  {p.bloodGroup}
                </Badge>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 cursor-pointer"
                    onClick={() => handleOpenMonitor(p)}
                  >
                    <Monitor className="h-3 w-3 mr-1" /> Monitor
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 text-xs font-semibold bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white cursor-pointer"
                    onClick={() => handleOpenVitalsModal(p)}
                  >
                    <HeartPulse className="h-3 w-3 mr-1" /> Log Vitals
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-20 bg-secondary/20 rounded-2xl border border-dashed text-muted-foreground">
            <p className="text-base font-semibold">No patients found</p>
            <p className="text-xs mt-1">Try adjusting your search query or ward filter tabs.</p>
          </div>
        )}
      </div>

      {/* Record Vitals Modal */}
      <Dialog open={vitalsOpen} onOpenChange={setVitalsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-rose-500" />
              Record Vitals — {selectedPat?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedPat?.patientCode} · {selectedPat?.bedNo} · {selectedPat?.ward}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 py-3">
            <div>
              <Label>Blood Pressure (mmHg) *</Label>
              <Input
                value={vitalsForm.bp}
                onChange={(e) => setVitalsForm({ ...vitalsForm, bp: e.target.value })}
                placeholder="120/80"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Pulse (bpm) *</Label>
              <Input
                type="number"
                value={vitalsForm.pulse}
                onChange={(e) => setVitalsForm({ ...vitalsForm, pulse: e.target.value })}
                placeholder="72"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Body Temp (°C) *</Label>
              <Input
                type="number"
                step="0.1"
                value={vitalsForm.temp}
                onChange={(e) => setVitalsForm({ ...vitalsForm, temp: e.target.value })}
                placeholder="36.8"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Oxygen Saturation (SpO₂ %) *</Label>
              <Input
                type="number"
                value={vitalsForm.spo2}
                onChange={(e) => setVitalsForm({ ...vitalsForm, spo2: e.target.value })}
                placeholder="98"
                className="mt-1.5"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setVitalsOpen(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button onClick={handleSaveVitals} className="bg-gradient-red text-white shadow-glow-red font-semibold cursor-pointer">
              Update Vitals
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Patient Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-rose-500" />
              Admit New Patient
            </DialogTitle>
            <DialogDescription>
              Assign ward, room, bed, and initial clinical baseline.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto px-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <Label>Full Patient Name *</Label>
                <Input
                  value={newPat.name}
                  onChange={(e) => setNewPat({ ...newPat, name: e.target.value })}
                  placeholder="e.g. Farhan Akhtar"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Gender *</Label>
                <Select
                  value={newPat.gender}
                  onValueChange={(val) => setNewPat({ ...newPat, gender: val })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Age *</Label>
                <Input
                  type="number"
                  value={newPat.age}
                  onChange={(e) => setNewPat({ ...newPat, age: e.target.value })}
                  placeholder="45"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Blood Group</Label>
                <Select
                  value={newPat.bloodGroup}
                  onValueChange={(val) => setNewPat({ ...newPat, bloodGroup: val })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((bg) => (
                      <SelectItem key={bg} value={bg}>
                        {bg}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Assigned Ward *</Label>
                <Select
                  value={newPat.ward}
                  onValueChange={(val) => setNewPat({ ...newPat, ward: val })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WARDS.filter((w) => w !== "All").map((w) => (
                      <SelectItem key={w} value={w}>
                        {w}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Room Number</Label>
                <Input
                  value={newPat.roomNo}
                  onChange={(e) => setNewPat({ ...newPat, roomNo: e.target.value })}
                  placeholder="301"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Bed Identifier</Label>
                <Input
                  value={newPat.bedNo}
                  onChange={(e) => setNewPat({ ...newPat, bedNo: e.target.value })}
                  placeholder="Bed-301A"
                  className="mt-1.5"
                />
              </div>

              <div className="sm:col-span-2">
                <Label>Clinical Condition / Diagnosis *</Label>
                <Input
                  value={newPat.condition}
                  onChange={(e) => setNewPat({ ...newPat, condition: e.target.value })}
                  placeholder="e.g. Acute Coronary Syndrome, Post-Op Care"
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="pt-2 border-t">
              <Label className="text-xs font-bold uppercase text-muted-foreground">Initial Baseline Vitals</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                <div>
                  <Label className="text-xs">BP</Label>
                  <Input
                    value={newPat.bp}
                    onChange={(e) => setNewPat({ ...newPat, bp: e.target.value })}
                    placeholder="120/80"
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Pulse (bpm)</Label>
                  <Input
                    type="number"
                    value={newPat.pulse}
                    onChange={(e) => setNewPat({ ...newPat, pulse: e.target.value })}
                    placeholder="75"
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Temp (°C)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={newPat.temp}
                    onChange={(e) => setNewPat({ ...newPat, temp: e.target.value })}
                    placeholder="36.8"
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">SpO₂ (%)</Label>
                  <Input
                    type="number"
                    value={newPat.spo2}
                    onChange={(e) => setNewPat({ ...newPat, spo2: e.target.value })}
                    placeholder="98"
                    className="mt-1 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button onClick={handleAddPatient} className="bg-gradient-red text-white shadow-glow-red font-semibold cursor-pointer">
              Admit Patient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ICU Monitor Modal */}
      <PatientICUMonitorModal
        patient={monitorPatient}
        isOpen={Boolean(monitorPatient)}
        onClose={() => setMonitorPatient(null)}
      />
    </AppShell>
  );
}
