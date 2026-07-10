import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { patientNav } from "@/lib/roleNav";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pill, Download, Loader2, AlertCircle } from "lucide-react";
import { prescriptionAPI } from "@/lib/api/client";
import useApi from "@/hooks/useApi";

export const Route = createFileRoute("/patient/prescriptions")({
  head: () => ({ meta: [{ title: "Prescriptions — Patient Portal" }] }),
  component: PatientPrescriptionsScreen,
});

interface Prescription { id: string; items: string; status: string; date: string; patient: string; }

function PatientPrescriptionsScreen() {
  const { data: rawRx, loading, error } = useApi(() => prescriptionAPI.getAll());
  const prescriptions = (rawRx as unknown as Prescription[]) ?? [];

  return (
    <AppShell role="patient" title="Patient Portal" nav={patientNav}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">My Prescriptions</h1>
        <p className="text-muted-foreground">{prescriptions.length} prescriptions on file</p>
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
            <div className="col-span-full text-center py-16 text-muted-foreground">No prescriptions found.</div>
          ) : prescriptions.map((rx, i) => (
            <motion.div key={rx.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="bg-white border rounded-2xl p-5 shadow-card hover:shadow-elevated transition relative overflow-hidden">
              <div className="absolute top-0 right-0 h-24 w-24 rounded-bl-full bg-gradient-red opacity-10" />
              <div className="flex items-center gap-3 mb-3 relative z-10">
                <div className="h-12 w-12 rounded-xl bg-gradient-red text-white flex items-center justify-center shadow-glow-red">
                  <Pill className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{rx.id}</div>
                  <div className="text-xs text-muted-foreground">{rx.date}</div>
                </div>
                <Badge className={rx.status === "Issued" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
                  {rx.status}
                </Badge>
              </div>
              <div className="text-sm bg-muted/50 rounded-lg p-3 mb-3 whitespace-pre-line text-muted-foreground">
                {rx.items}
              </div>
              <Button size="sm" variant="outline" className="w-full" onClick={() => {}}>
                <Download className="h-3.5 w-3.5 mr-1.5" />Download PDF
              </Button>
            </motion.div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
