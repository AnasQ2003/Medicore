import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { receptionistNav } from "@/lib/roleNav";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Stethoscope, Loader2, AlertCircle, RefreshCw, Search, Heart } from "lucide-react";
import { adminAPI } from "@/lib/api/client";
import useApi from "@/hooks/useApi";
import { useState } from "react";

export const Route = createFileRoute("/receptionist/doctors")({
  head: () => ({ meta: [{ title: "Doctors — Reception" }] }),
  component: ReceptionistDoctorsScreen,
});

interface Doctor {
  id: number;
  name: string;
  email: string;
  phone?: string;
  specialty?: string;
}

function ReceptionistDoctorsScreen() {
  const { data: rawDocs, loading, error, refetch } = useApi(() => adminAPI.getDoctors());
  const doctors = (rawDocs as unknown as Doctor[]) ?? [];

  const [q, setQ] = useState("");

  const filtered = doctors.filter((d) =>
    d.name.toLowerCase().includes(q.toLowerCase()) ||
    (d.specialty ?? "").toLowerCase().includes(q.toLowerCase())
  );

  return (
    <AppShell role="receptionist" title="Reception" nav={receptionistNav}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Doctor Schedules</h1>
          <p className="text-muted-foreground">Verify active doctors and clinical duty hours</p>
        </div>
        <Button variant="outline" size="sm" onClick={refetch} className="shrink-0">
          <RefreshCw className="h-3.5 w-3.5 mr-2" />Refresh List
        </Button>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or department specialty..." className="pl-9" />
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
          {filtered.map((d, i) => (
            <motion.div key={d.id}
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              whileHover={{ y: -4 }}
              className="bg-white border rounded-2xl p-5 shadow-card hover:shadow-elevated transition flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 h-16 w-16 bg-blue-500 opacity-5 rounded-bl-full" />
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Stethoscope className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base leading-tight">{d.name}</h3>
                    <Badge className="bg-blue-550 text-white mt-1 text-[10px] bg-primary">
                      {d.specialty || "General Medicine"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-muted-foreground py-2">
                  <div>Email: <span className="font-medium text-foreground">{d.email}</span></div>
                  {d.phone && <div>Phone: <span className="font-medium text-foreground">{d.phone}</span></div>}
                </div>
              </div>

              <div className="border-t pt-3 flex items-center justify-between mt-2 text-xs">
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <Heart className="h-3 w-3 fill-emerald-600" /> Active Duty
                </span>
                <span className="text-muted-foreground">Shift: 09:00 – 17:00</span>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted-foreground bg-secondary/20 rounded-2xl border">
              No doctors found matching the query.
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
