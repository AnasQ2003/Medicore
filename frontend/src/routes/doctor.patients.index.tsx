import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { doctorNav } from "@/lib/roleNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Phone, Mail, AlertTriangle, Loader2, Stethoscope, Activity, Heart, BedDouble, UserCheck } from "lucide-react";
import { patientAPI } from "@/lib/api/client";
import useApi from "@/hooks/useApi";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/doctor/patients/")({
  head: () => ({ meta: [{ title: "Patients — Doctor" }] }),
  component: PatientsIndexScreen,
});

interface ApiPatient {
  id: number;
  patientCode: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  phone: string;
  email: string;
  condition?: string;
  allergies?: string | string[];
  chronic?: string | string[];
  category?: "Inpatient" | "Outpatient" | "Critical";
  vitals?: { bp: string; pulse: number; spo2: number }[];
}

const fallbackPatients: ApiPatient[] = [
  {
    id: 1042, patientCode: "P-1042", name: "Ahmed Ali", age: 54, gender: "Male", bloodGroup: "B+",
    phone: "+92 300 1234567", email: "ahmed.ali@example.com",
    condition: "Hypertension, mild dyslipidemia", category: "Outpatient",
    allergies: ["Penicillin", "Peanuts"], chronic: ["Hypertension", "Hyperlipidemia"],
    vitals: [{ bp: "138/92", pulse: 82, spo2: 97 }]
  },
  {
    id: 1043, patientCode: "P-1043", name: "Fatima Noor", age: 28, gender: "Female", bloodGroup: "A+",
    phone: "+92 333 9876543", email: "fatima.noor@example.com",
    condition: "Anxiety with palpitations, Asthma follow-up", category: "Outpatient",
    allergies: ["None known"], chronic: [],
    vitals: [{ bp: "115/75", pulse: 96, spo2: 99 }]
  },
  {
    id: 1044, patientCode: "P-1044", name: "Hassan Raza", age: 66, gender: "Male", bloodGroup: "O-",
    phone: "+92 321 2233445", email: "hassan.raza@example.com",
    condition: "Post-CABG recovery, critical BP monitoring", category: "Critical",
    allergies: ["Aspirin"], chronic: ["Ischemic Heart Disease", "Hypertension"],
    vitals: [{ bp: "146/96", pulse: 88, spo2: 96 }]
  },
  {
    id: 1045, patientCode: "P-1045", name: "Ayesha Tariq", age: 35, gender: "Female", bloodGroup: "AB+",
    phone: "+92 311 5544332", email: "ayesha.t@example.com",
    condition: "Gestational diabetes management", category: "Inpatient",
    allergies: ["Sulfa drugs"], chronic: ["Gestational Diabetes"],
    vitals: [{ bp: "120/78", pulse: 74, spo2: 98 }]
  },
  {
    id: 1046, patientCode: "P-1046", name: "Bilal Khan", age: 45, gender: "Male", bloodGroup: "O+",
    phone: "+92 300 9988776", email: "bilal.k@example.com",
    condition: "Post-op cholecystectomy, day 5 recovery", category: "Inpatient",
    allergies: ["NSAIDS"], chronic: ["Gallstone Disease"],
    vitals: [{ bp: "118/76", pulse: 70, spo2: 98 }]
  },
  {
    id: 1047, patientCode: "P-1047", name: "Zara Malik", age: 22, gender: "Female", bloodGroup: "B-",
    phone: "+92 345 1122334", email: "zara.m@example.com",
    condition: "Severe anemia — transfusion monitoring", category: "Critical",
    allergies: ["Iron IV"], chronic: ["Iron Deficiency Anemia"],
    vitals: [{ bp: "100/60", pulse: 102, spo2: 94 }]
  },
  {
    id: 1048, patientCode: "P-1048", name: "Mohammad Usman", age: 72, gender: "Male", bloodGroup: "A-",
    phone: "+92 300 3456789", email: "m.usman@example.com",
    condition: "COPD exacerbation — stable on O2 therapy", category: "Inpatient",
    allergies: ["Penicillin"], chronic: ["COPD", "Type 2 Diabetes"],
    vitals: [{ bp: "132/84", pulse: 86, spo2: 92 }]
  },
  {
    id: 1049, patientCode: "P-1049", name: "Sana Tariq", age: 41, gender: "Female", bloodGroup: "O+",
    phone: "+92 311 7766554", email: "sana.t@example.com",
    condition: "Migraine with aura, preventive therapy review", category: "Outpatient",
    allergies: [], chronic: ["Chronic Migraine"],
    vitals: [{ bp: "116/74", pulse: 68, spo2: 99 }]
  },
];

function PatientsIndexScreen() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { data: rawPatients, loading } = useApi(() => patientAPI.getAll());

  const fetched: ApiPatient[] = (rawPatients as unknown as ApiPatient[]) ?? [];
  const patients = fetched.length > 0 ? fetched : fallbackPatients;

  const allergyList = (p: ApiPatient) => {
    if (!p.allergies) return [];
    if (Array.isArray(p.allergies)) return p.allergies;
    return (p.allergies as string).split(",").map((a: string) => a.trim()).filter(Boolean);
  };

  const hasAllergies = (p: ApiPatient) => allergyList(p).some(a => a && a !== "None known" && a !== "none");

  const filterByTab = (list: ApiPatient[]) => {
    if (activeTab === "critical") return list.filter(p => p.category === "Critical");
    if (activeTab === "chronic") return list.filter(p => Array.isArray(p.chronic) ? p.chronic.length > 0 : !!p.chronic);
    if (activeTab === "inpatient") return list.filter(p => p.category === "Inpatient");
    if (activeTab === "outpatient") return list.filter(p => p.category === "Outpatient");
    return list;
  };

  const searched = patients.filter(
    (p) =>
      p.name?.toLowerCase().includes(q.toLowerCase()) ||
      (p.patientCode ?? "").toLowerCase().includes(q.toLowerCase()) ||
      (p.condition ?? "").toLowerCase().includes(q.toLowerCase())
  );

  const filtered = filterByTab(searched);

  const counts = {
    all: searched.length,
    critical: searched.filter(p => p.category === "Critical").length,
    chronic: searched.filter(p => Array.isArray(p.chronic) ? p.chronic.length > 0 : !!p.chronic).length,
    inpatient: searched.filter(p => p.category === "Inpatient").length,
    outpatient: searched.filter(p => p.category === "Outpatient").length,
  };

  const PatientCard = ({ p }: { p: ApiPatient }) => {
    const bpVal = p.vitals?.[0]?.bp || "120/80";
    const pulseVal = p.vitals?.[0]?.pulse ? `${p.vitals[0].pulse}` : "72";
    const spo2Val = p.vitals?.[0]?.spo2 ? `${p.vitals[0].spo2}%` : "98%";
    const isCritical = p.category === "Critical";

    return (
      <motion.div
        key={p.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ duration: 0.18 }}
        onClick={() => navigate({ to: "/doctor/patients/$id", params: { id: String(p.id) } })}
        className={`group relative overflow-hidden rounded-2xl border p-5 shadow-card hover:shadow-elevated transition-all backdrop-blur-md cursor-pointer ${
          isCritical
            ? "bg-gradient-to-br from-rose-50/90 to-red-50/90 dark:from-rose-950/40 dark:to-red-950/40 border-rose-300 dark:border-rose-700"
            : p.gender === "Female"
            ? "bg-gradient-to-br from-pink-50/90 to-rose-50/90 dark:from-pink-950/40 dark:to-rose-950/40 border-pink-200 dark:border-pink-800/60 hover:border-pink-400"
            : "bg-gradient-to-br from-blue-50/90 to-cyan-50/90 dark:from-blue-950/40 dark:to-cyan-950/40 border-blue-200 dark:border-blue-800/60 hover:border-blue-400"
        }`}
      >
        {/* Background glow */}
        <div className={`absolute -top-12 -right-12 h-32 w-32 rounded-full opacity-20 blur-2xl group-hover:opacity-30 transition ${
          isCritical ? "bg-rose-400" : p.gender === "Female" ? "bg-pink-400" : "bg-blue-400"
        }`} />

        {/* Critical badge */}
        {isCritical && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-rose-600 text-white text-[10px] font-bold animate-pulse">CRITICAL</Badge>
          </div>
        )}

        <div className="flex items-center gap-3 mb-4">
          <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-glow bg-gradient-to-br ${
            isCritical ? "from-rose-500 to-red-600" : p.gender === "Female" ? "from-pink-500 to-rose-600" : "from-blue-500 to-cyan-500"
          }`}>
            {p.name?.[0] || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-base truncate text-foreground">{p.name || "Unknown"}</div>
            <div className="text-xs text-muted-foreground">
              {p.patientCode || "—"} • {p.age ?? "—"}y {(p.gender?.[0]) ?? ""} • {p.bloodGroup ?? "—"}
            </div>
            {p.category && (
              <Badge className={`text-[10px] mt-0.5 ${
                p.category === "Critical" ? "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300" :
                p.category === "Inpatient" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300" :
                "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300"
              }`}>{p.category}</Badge>
            )}
          </div>
        </div>

        <div className="text-sm mb-3 line-clamp-2 font-medium text-foreground/80">
          {p.condition || "Routine Follow-up"}
        </div>

        {/* Chronic conditions */}
        {Array.isArray(p.chronic) && p.chronic.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {p.chronic.slice(0, 2).map((c, i) => (
              <Badge key={i} variant="secondary" className="text-[10px] font-medium">{c}</Badge>
            ))}
            {p.chronic.length > 2 && (
              <Badge variant="secondary" className="text-[10px]">+{p.chronic.length - 2} more</Badge>
            )}
          </div>
        )}

        {/* Allergy badge */}
        {hasAllergies(p) && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300 text-[10px]">
              <AlertTriangle className="h-2.5 w-2.5 mr-1" />{allergyList(p).length} allergy
            </Badge>
            {p.bloodGroup && <Badge variant="secondary" className="text-[10px] font-semibold">{p.bloodGroup}</Badge>}
          </div>
        )}

        {/* Vitals */}
        <div className="grid grid-cols-3 gap-2 text-center mb-4">
          <div className={`rounded-lg border p-2 ${isCritical ? "bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800" : "bg-blue-50/90 dark:bg-blue-950/60 border-blue-100 dark:border-blue-800/60"}`}>
            <div className={`text-[10px] font-semibold ${isCritical ? "text-rose-700 dark:text-rose-300" : "text-blue-700 dark:text-blue-300"}`}>BP</div>
            <div className={`text-sm font-bold ${isCritical ? "text-rose-900 dark:text-rose-100" : "text-blue-900 dark:text-blue-100"}`}>{bpVal}</div>
          </div>
          <div className="rounded-lg bg-rose-50/90 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-800/60 p-2">
            <div className="text-[10px] font-semibold text-rose-700 dark:text-rose-300">Pulse</div>
            <div className="text-sm font-bold text-rose-900 dark:text-rose-100">{pulseVal}</div>
          </div>
          <div className={`rounded-lg border p-2 ${Number(spo2Val.replace('%','')) < 95 ? "bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800" : "bg-emerald-50/90 dark:bg-emerald-950/60 border-emerald-100 dark:border-emerald-800/60"}`}>
            <div className={`text-[10px] font-semibold ${Number(spo2Val.replace('%','')) < 95 ? "text-amber-700 dark:text-amber-300" : "text-emerald-700 dark:text-emerald-300"}`}>SpO2</div>
            <div className={`text-sm font-bold ${Number(spo2Val.replace('%','')) < 95 ? "text-amber-900 dark:text-amber-100" : "text-emerald-900 dark:text-emerald-100"}`}>{spo2Val}</div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            className={`flex-1 text-white font-semibold ${isCritical ? "bg-gradient-to-r from-rose-500 to-red-600" : "bg-gradient-primary"}`}
            onClick={(e) => {
              e.stopPropagation();
              navigate({ to: "/doctor/patients/$id", params: { id: String(p.id) } });
            }}
          >
            Open Full EMR
          </Button>
          <Button size="icon" variant="outline" title="Call"
            onClick={(e) => { e.stopPropagation(); if (p.phone) window.location.href = `tel:${p.phone}`; }}>
            <Phone className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="outline" title="Email"
            onClick={(e) => { e.stopPropagation(); if (p.email) window.location.href = `mailto:${p.email}`; }}>
            <Mail className="h-3.5 w-3.5" />
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <AppShell role="doctor" title="Doctor" nav={doctorNav}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Stethoscope className="h-7 w-7 text-primary" /> My Patients
          </h1>
          <p className="text-muted-foreground">
            {loading ? "Loading…" : `${patients.length} patients registered under your care`}
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patients…" className="pl-9 w-full sm:w-72" />
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total", value: patients.length, icon: UserCheck, c: "from-blue-500 to-cyan-500" },
          { label: "Critical", value: patients.filter(p => p.category === "Critical").length, icon: Activity, c: "from-rose-500 to-red-600" },
          { label: "Inpatient", value: patients.filter(p => p.category === "Inpatient").length, icon: BedDouble, c: "from-amber-500 to-orange-500" },
          { label: "Chronic", value: patients.filter(p => Array.isArray(p.chronic) ? p.chronic.length > 0 : !!p.chronic).length, icon: Heart, c: "from-violet-500 to-purple-600" },
        ].map((stat) => (
          <motion.div key={stat.label} whileHover={{ y: -3 }}
            className={`relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br ${stat.c} text-white shadow-elevated`}>
            <div className="absolute -bottom-4 -right-4 h-16 w-16 rounded-full bg-white/20 blur-xl" />
            <stat.icon className="h-4 w-4 opacity-80" />
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <div className="text-xs uppercase tracking-wider opacity-90">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!loading && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 flex-wrap h-auto gap-1">
            <TabsTrigger value="all" className="flex items-center gap-1.5">
              All <Badge variant="secondary" className="ml-1 text-[10px] px-1.5">{counts.all}</Badge>
            </TabsTrigger>
            <TabsTrigger value="critical" className="flex items-center gap-1.5 data-[state=active]:bg-rose-600 data-[state=active]:text-white">
              <Activity className="h-3.5 w-3.5" /> Critical
              {counts.critical > 0 && <Badge className="ml-1 bg-rose-100 text-rose-700 text-[10px] px-1.5">{counts.critical}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="inpatient" className="flex items-center gap-1.5">
              <BedDouble className="h-3.5 w-3.5" /> Inpatient
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5">{counts.inpatient}</Badge>
            </TabsTrigger>
            <TabsTrigger value="outpatient" className="flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5" /> Outpatient
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5">{counts.outpatient}</Badge>
            </TabsTrigger>
            <TabsTrigger value="chronic" className="flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5" /> Chronic
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5">{counts.chronic}</Badge>
            </TabsTrigger>
          </TabsList>

          {["all","critical","inpatient","outpatient","chronic"].map(tab => (
            <TabsContent key={tab} value={tab}>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((p) => <PatientCard key={p.id} p={p} />)}
                {filtered.length === 0 && (
                  <div className="col-span-full text-center py-16 text-muted-foreground">
                    No patients found{q ? ` matching "${q}"` : ""} in this category.
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </AppShell>
  );
}
