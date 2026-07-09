import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { doctorNav } from "@/lib/doctorNav";
import { patients } from "@/lib/mockData";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Plus, Users, Phone, Mail, Heart, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/doctor/patients")({
  head: () => ({ meta: [{ title: "Patients — Doctor" }] }),
  component: PatientsScreen,
});

function PatientsScreen() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const filtered = patients.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || p.id.toLowerCase().includes(q.toLowerCase()));

  return (
    <AppShell role="doctor" title="Doctor" nav={doctorNav}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Patients</h1>
          <p className="text-muted-foreground">{patients.length} patients under your care</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
            <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search patients…" className="pl-9 w-72"/>
          </div>
          <Button className="bg-gradient-primary text-white shadow-glow"><Plus className="h-4 w-4 mr-2"/>Add</Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p, i) => (
          <motion.div key={p.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}
            onClick={() => navigate({ to: "/doctor/patients/$id", params: { id: p.id } })}
            whileHover={{y:-6, scale: 1.01}}
            className={`group relative overflow-hidden rounded-2xl border p-5 shadow-card hover:shadow-elevated transition-all backdrop-blur-md cursor-pointer ${
              p.gender === "Female"
                ? "bg-gradient-to-br from-pink-50/90 to-rose-50/90 border-pink-200"
                : "bg-gradient-to-br from-blue-50/90 to-cyan-50/90 border-blue-200"
            }`}>
            <div className={`absolute -top-12 -right-12 h-32 w-32 rounded-full opacity-20 blur-2xl group-hover:opacity-30 transition ${
              p.gender === "Female" ? "bg-pink-400" : "bg-blue-400"
            }`}/>
            <div className="flex items-center gap-3 mb-4">
              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-glow bg-gradient-to-br ${
                p.gender === "Female" ? "from-pink-500 to-rose-600" : "from-blue-500 to-cyan-500"
              }`}>
                {p.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold truncate">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.id} • {p.age}y {p.gender[0]} • {p.bloodGroup}</div>
              </div>
            </div>

            <div className="text-sm mb-3 line-clamp-2 text-foreground/80">{p.condition}</div>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {p.chronic.slice(0,2).map(c => (
                <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>
              ))}
              {p.allergies.length > 0 && p.allergies[0] !== "None known" && (
                <Badge className="bg-rose-100 text-rose-700 text-[10px]"><AlertTriangle className="h-2.5 w-2.5 mr-1"/>{p.allergies.length} allergy</Badge>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center mb-4">
              <div className="rounded-lg bg-blue-50 p-2">
                <div className="text-[10px] text-blue-700">BP</div>
                <div className="text-sm font-bold text-blue-900">{p.vitals[0]?.bp ?? "—"}</div>
              </div>
              <div className="rounded-lg bg-rose-50 p-2">
                <div className="text-[10px] text-rose-700">Pulse</div>
                <div className="text-sm font-bold text-rose-900">{p.vitals[0]?.pulse ?? "—"}</div>
              </div>
              <div className="rounded-lg bg-emerald-50 p-2">
                <div className="text-[10px] text-emerald-700">SpO2</div>
                <div className="text-sm font-bold text-emerald-900">{p.vitals[0]?.spo2 ?? "—"}%</div>
              </div>
            </div>

            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <Button onClick={() => navigate({ to: "/doctor/patients/$id", params: { id: p.id } })} className="flex-1 bg-gradient-primary text-white">
                Open EMR
              </Button>
              <Button size="icon" variant="outline" title="Call"><Phone className="h-3.5 w-3.5"/></Button>
              <Button size="icon" variant="outline" title="Email"><Mail className="h-3.5 w-3.5"/></Button>
            </div>
          </motion.div>
        ))}
      </div>
    </AppShell>
  );
}
