import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { nurseNav } from "@/lib/roleNav";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, RefreshCw, Pill, Calendar } from "lucide-react";
import { prescriptionAPI } from "@/lib/api/client";
import useApi from "@/hooks/useApi";

export const Route = createFileRoute("/nurse/medications")({
  head: () => ({ meta: [{ title: "Medications — Nurse" }] }),
  component: NurseMedicationsScreen,
});

interface Prescription {
  id: string;
  items: string;
  status: string;
  date: string;
  patient: string;
}

function NurseMedicationsScreen() {
  const { data: rawPrescriptions, loading, error, refetch } = useApi(() => prescriptionAPI.getAll());
  const prescriptions = (rawPrescriptions as unknown as Prescription[]) ?? [];

  return (
    <AppShell role="nurse" title="Nurse" nav={nurseNav}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Active Medications</h1>
          <p className="text-muted-foreground">Monitor prescribed medications and drug schedules for patients</p>
        </div>
        <Button variant="outline" size="sm" onClick={refetch} className="shrink-0">
          <RefreshCw className="h-3.5 w-3.5 mr-2" />Refresh List
        </Button>
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
          {prescriptions.length === 0 ? (
            <div className="col-span-full text-center py-16 text-muted-foreground bg-secondary/20 rounded-2xl border">
              No active prescriptions on record.
            </div>
          ) : (
            prescriptions.map((p, i) => (
              <motion.div key={p.id}
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-white border rounded-2xl p-5 shadow-card hover:shadow-elevated transition flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <div>
                      <h3 className="font-bold text-base leading-tight">{p.patient}</h3>
                      <span className="text-[10px] text-muted-foreground font-mono">RX: {p.id}</span>
                    </div>
                    <Badge className={p.status === "Issued" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
                      {p.status}
                    </Badge>
                  </div>
                  
                  <div className="bg-secondary/40 p-3 rounded-xl text-sm font-mono text-muted-foreground mt-2 line-clamp-3">
                    {p.items}
                  </div>
                </div>

                <div className="border-t pt-3 flex items-center justify-between mt-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {p.date}</span>
                  <span className="flex items-center gap-1"><Pill className="h-3 w-3" /> Medication Plan</span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </AppShell>
  );
}
