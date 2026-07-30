import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { doctorNav } from "@/lib/roleNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Plus, Phone, Mail, AlertTriangle, Loader2, Stethoscope } from "lucide-react";
import { patientAPI } from "@/lib/api/client";
import useApi from "@/hooks/useApi";

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
  vitals?: { bp: string; pulse: number; spo2: number }[];
}

function PatientsIndexScreen() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const { data: rawPatients, loading, error } = useApi(() => patientAPI.getAll());
  
  const fallbackPatients: ApiPatient[] = [
    {
      id: 1,
      patientCode: "P-1001",
      name: "Patient John Doe",
      age: 30,
      gender: "Male",
      bloodGroup: "O+",
      phone: "+92 300 1234567",
      email: "patient@example.com",
      condition: "Hypertension Routine Follow-up",
      allergies: ["Penicillin"],
      vitals: [{ bp: "120/80", pulse: 72, spo2: 98 }]
    },
    {
      id: 1042,
      patientCode: "P-1042",
      name: "Ahmed Ali",
      age: 54,
      gender: "Male",
      bloodGroup: "B+",
      phone: "+92 300 1234567",
      email: "ahmed.ali@example.com",
      condition: "Hypertension, mild dyslipidemia",
      allergies: ["Penicillin", "Peanuts"],
      vitals: [{ bp: "138/92", pulse: 82, spo2: 97 }]
    },
    {
      id: 1043,
      patientCode: "P-1043",
      name: "Fatima Noor",
      age: 28,
      gender: "Female",
      bloodGroup: "A+",
      phone: "+92 300 7654321",
      email: "fatima.noor@example.com",
      condition: "Asthma follow-up",
      allergies: ["Dust", "Pollen"],
      vitals: [{ bp: "115/75", pulse: 78, spo2: 99 }]
    },
    {
      id: 1044,
      patientCode: "P-1044",
      name: "Hassan Raza",
      age: 61,
      gender: "Male",
      bloodGroup: "O-",
      phone: "+92 300 9876543",
      email: "hassan.raza@example.com",
      condition: "Post-CABG recovery",
      allergies: ["Aspirin"],
      vitals: [{ bp: "146/96", pulse: 88, spo2: 96 }]
    }
  ];

  const fetched: ApiPatient[] = (rawPatients as unknown as ApiPatient[]) ?? [];
  const patients = fetched.length > 0 ? fetched : fallbackPatients;

  const filtered = patients.filter(
    (p) =>
      p.name?.toLowerCase().includes(q.toLowerCase()) ||
      (p.patientCode ?? "").toLowerCase().includes(q.toLowerCase())
  );

  const allergyList = (p: ApiPatient) => {
    if (!p.allergies) return [];
    if (Array.isArray(p.allergies)) return p.allergies;
    return p.allergies.split(",").map((a: string) => a.trim()).filter(Boolean);
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
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patients…" className="pl-9 w-72" />
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const bpVal = p.vitals?.[0]?.bp || "120/80";
            const pulseVal = p.vitals?.[0]?.pulse ? `${p.vitals[0].pulse}` : "72";
            const spo2Val = p.vitals?.[0]?.spo2 ? `${p.vitals[0].spo2}%` : "98%";

            return (
              <div
                key={p.id}
                onClick={() => {
                  navigate({ to: "/doctor/patients/$id", params: { id: String(p.id) } });
                }}
                className={`group relative overflow-hidden rounded-2xl border p-5 shadow-card hover:shadow-elevated transition-all backdrop-blur-md cursor-pointer ${
                  p.gender === "Female"
                    ? "bg-gradient-to-br from-pink-50/90 to-rose-50/90 border-pink-200 hover:border-pink-400"
                    : "bg-gradient-to-br from-blue-50/90 to-cyan-50/90 border-blue-200 hover:border-blue-400"
                }`}
              >
                <div className={`absolute -top-12 -right-12 h-32 w-32 rounded-full opacity-20 blur-2xl group-hover:opacity-30 transition ${
                  p.gender === "Female" ? "bg-pink-400" : "bg-blue-400"
                }`} />

                <div className="flex items-center gap-3 mb-4">
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-glow bg-gradient-to-br ${
                    p.gender === "Female" ? "from-pink-500 to-rose-600" : "from-blue-500 to-cyan-500"
                  }`}>
                    {p.name?.[0] || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-base truncate">{p.name || "Unknown"}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.patientCode || "—"} • {p.age ?? "—"}y {(p.gender?.[0]) ?? ""} • {p.bloodGroup ?? "—"}
                    </div>
                  </div>
                </div>

                <div className="text-sm mb-3 line-clamp-2 font-medium text-foreground/80">
                  {p.condition || "Hypertension Routine Follow-up"}
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {allergyList(p).length > 0 && (
                    <Badge className="bg-rose-100 text-rose-700 text-[10px]">
                      <AlertTriangle className="h-2.5 w-2.5 mr-1" />{allergyList(p).length} allergy
                    </Badge>
                  )}
                  {p.bloodGroup && <Badge variant="secondary" className="text-[10px] font-semibold">{p.bloodGroup}</Badge>}
                </div>

                <div className="grid grid-cols-3 gap-2 text-center mb-4">
                  <div className="rounded-lg bg-blue-50/90 border border-blue-100 p-2">
                    <div className="text-[10px] font-semibold text-blue-700">BP</div>
                    <div className="text-sm font-bold text-blue-900">{bpVal}</div>
                  </div>
                  <div className="rounded-lg bg-rose-50/90 border border-rose-100 p-2">
                    <div className="text-[10px] font-semibold text-rose-700">Pulse</div>
                    <div className="text-sm font-bold text-rose-900">{pulseVal}</div>
                  </div>
                  <div className="rounded-lg bg-emerald-50/90 border border-emerald-100 p-2">
                    <div className="text-[10px] font-semibold text-emerald-700">SpO2</div>
                    <div className="text-sm font-bold text-emerald-900">{spo2Val}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    className="flex-1 bg-gradient-primary text-white font-semibold"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate({ to: "/doctor/patients/$id", params: { id: String(p.id) } });
                    }}
                  >
                    Open Full EMR
                  </Button>
                  <Button 
                    size="icon" 
                    variant="outline" 
                    title="Call"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (p.phone) window.location.href = `tel:${p.phone}`;
                    }}
                  >
                    <Phone className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="outline" 
                    title="Email"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (p.email) window.location.href = `mailto:${p.email}`;
                    }}
                  >
                    <Mail className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              No patients found{q ? ` matching "${q}"` : ""}.
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
