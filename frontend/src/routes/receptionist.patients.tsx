import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { receptionistNav } from "@/lib/roleNav";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, AlertCircle, RefreshCw, Users, Phone, MapPin, UserPlus } from "lucide-react";
import { patientAPI } from "@/lib/api/client";
import useApi from "@/hooks/useApi";
import { useState } from "react";

export const Route = createFileRoute("/receptionist/patients")({
  head: () => ({ meta: [{ title: "Patient Directory — Reception" }] }),
  component: ReceptionistPatientsScreen,
});

interface Patient {
  id: number;
  name: string;
  patientCode: string;
  email: string;
  phone?: string;
  address?: string;
  gender?: string;
  bloodGroup?: string;
}

function ReceptionistPatientsScreen() {
  const { data: rawPatients, loading, error, refetch } = useApi(() => patientAPI.getAll());
  const patients = (rawPatients as unknown as Patient[]) ?? [];
  
  // Only show patients
  const patientRegistry = patients.filter((u: any) => u.role === "patient" || u.patientCode);

  const [q, setQ] = useState("");

  const filtered = patientRegistry.filter((p) => {
    const matchQ = p.name.toLowerCase().includes(q.toLowerCase()) || 
                   p.patientCode.toLowerCase().includes(q.toLowerCase()) ||
                   (p.phone ?? "").includes(q);
    return matchQ;
  });

  return (
    <AppShell role="receptionist" title="Reception" nav={receptionistNav}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient Directory</h1>
          <p className="text-muted-foreground">{patientRegistry.length} patients registered in database</p>
        </div>
        <Button variant="outline" size="sm" onClick={refetch} className="shrink-0">
          <RefreshCw className="h-3.5 w-3.5 mr-2" />Refresh Directory
        </Button>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, code or phone..." className="pl-9" />
        </div>
      </div>

      {loading && <div className="flex items-center justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
      {error && (
        <div className="text-center py-16 text-destructive">
          <AlertCircle className="h-8 w-8 mx-auto mb-3" />
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p, i) => (
            <motion.div key={p.id}
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              whileHover={{ y: -4 }}
              className="bg-white border rounded-2xl p-5 shadow-card hover:shadow-elevated transition flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start gap-2 mb-3">
                  <div>
                    <h3 className="font-bold text-lg leading-tight">{p.name}</h3>
                    <span className="font-mono text-xs text-primary">{p.patientCode}</span>
                  </div>
                  {p.gender && (
                    <Badge className={p.gender === "Male" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"}>
                      {p.gender}
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-1.5 my-3 text-sm text-muted-foreground">
                  {p.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5" /> <span>{p.phone}</span>
                    </div>
                  )}
                  {p.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5" /> <span className="truncate">{p.address}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-3 flex items-center justify-between mt-2 text-xs">
                <span>Blood: <span className="font-bold text-foreground">{p.bloodGroup || "—"}</span></span>
                <span className="text-muted-foreground">{p.email}</span>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted-foreground bg-secondary/20 rounded-2xl border">
              No patients found matching the query.
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
