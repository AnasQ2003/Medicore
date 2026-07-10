import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { doctorNav } from "@/lib/roleNav";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Plus, Phone, Mail, AlertTriangle, Loader2 } from "lucide-react";
import { patientAPI } from "@/lib/api/client";
import useApi from "@/hooks/useApi";

export const Route = createFileRoute("/doctor/patients")({
  head: () => ({ meta: [{ title: "Patients — Doctor" }] }),
  component: PatientsScreen,
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
  allergies?: string;
  chronic?: string;
  vitals?: { bp: string; pulse: number; spo2: number }[];
}

function PatientsScreen() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const { data: rawPatients, loading, error } = useApi(() => patientAPI.getAll());
  const patients: ApiPatient[] = (rawPatients as unknown as ApiPatient[]) ?? [];

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      (p.patientCode ?? "").toLowerCase().includes(q.toLowerCase())
  );

  const allergyList = (p: ApiPatient) =>
    p.allergies ? p.allergies.split(",").map((a) => a.trim()).filter(Boolean) : [];

  return (
    <AppShell role="doctor" title="Doctor" nav={doctorNav}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Patients</h1>
          <p className="text-muted-foreground">
            {loading ? "Loading…" : `${patients.length} patients under your care`}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patients…" className="pl-9 w-72" />
          </div>
          <Button className="bg-gradient-primary text-white shadow-glow"><Plus className="h-4 w-4 mr-2" />Add</Button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <div className="text-center py-16 text-destructive">
          <p className="font-semibold">Failed to load patients</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate({ to: "/doctor/patients/$id", params: { id: String(p.id) } })}
              whileHover={{ y: -6, scale: 1.01 }}
              className={`group relative overflow-hidden rounded-2xl border p-5 shadow-card hover:shadow-elevated transition-all backdrop-blur-md cursor-pointer ${
                p.gender === "Female"
                  ? "bg-gradient-to-br from-pink-50/90 to-rose-50/90 border-pink-200"
                  : "bg-gradient-to-br from-blue-50/90 to-cyan-50/90 border-blue-200"
              }`}
            >
              <div className={`absolute -top-12 -right-12 h-32 w-32 rounded-full opacity-20 blur-2xl group-hover:opacity-30 transition ${
                p.gender === "Female" ? "bg-pink-400" : "bg-blue-400"
              }`} />

              <div className="flex items-center gap-3 mb-4">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-glow bg-gradient-to-br ${
                  p.gender === "Female" ? "from-pink-500 to-rose-600" : "from-blue-500 to-cyan-500"
                }`}>
                  {p.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {p.patientCode} • {p.age ?? "—"}y {(p.gender?.[0]) ?? ""} • {p.bloodGroup ?? "—"}
                  </div>
                </div>
              </div>

              <div className="text-sm mb-3 line-clamp-2 text-foreground/80">{p.condition || "No condition on record"}</div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {allergyList(p).length > 0 && allergyList(p)[0] !== "None known" && (
                  <Badge className="bg-rose-100 text-rose-700 text-[10px]">
                    <AlertTriangle className="h-2.5 w-2.5 mr-1" />{allergyList(p).length} allergy
                  </Badge>
                )}
                {p.bloodGroup && <Badge variant="secondary" className="text-[10px]">{p.bloodGroup}</Badge>}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center mb-4">
                <div className="rounded-lg bg-blue-50 p-2">
                  <div className="text-[10px] text-blue-700">BP</div>
                  <div className="text-sm font-bold text-blue-900">{p.vitals?.[0]?.bp ?? "—"}</div>
                </div>
                <div className="rounded-lg bg-rose-50 p-2">
                  <div className="text-[10px] text-rose-700">Pulse</div>
                  <div className="text-sm font-bold text-rose-900">{p.vitals?.[0]?.pulse ?? "—"}</div>
                </div>
                <div className="rounded-lg bg-emerald-50 p-2">
                  <div className="text-[10px] text-emerald-700">SpO2</div>
                  <div className="text-sm font-bold text-emerald-900">{p.vitals?.[0]?.spo2 ?? "—"}%</div>
                </div>
              </div>

              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <Button onClick={() => navigate({ to: "/doctor/patients/$id", params: { id: String(p.id) } })} className="flex-1 bg-gradient-primary text-white">
                  Open EMR
                </Button>
                <Button size="icon" variant="outline" title="Call"><Phone className="h-3.5 w-3.5" /></Button>
                <Button size="icon" variant="outline" title="Email"><Mail className="h-3.5 w-3.5" /></Button>
              </div>
            </motion.div>
          ))}

          {!loading && filtered.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              No patients found{q ? ` matching "${q}"` : ""}.
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
