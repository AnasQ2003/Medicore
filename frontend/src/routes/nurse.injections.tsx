import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { nurseNav } from "@/lib/roleNav";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, RefreshCw, Syringe, Calendar } from "lucide-react";
import { prescriptionAPI } from "@/lib/api/client";
import useApi from "@/hooks/useApi";

export const Route = createFileRoute("/nurse/injections")({
  head: () => ({ meta: [{ title: "Injections — Nurse" }] }),
  component: NurseInjectionsScreen,
});

interface Prescription {
  id: string;
  items: string;
  status: string;
  date: string;
  patient: string;
}

function NurseInjectionsScreen() {
  const { data: rawPrescriptions, loading, error, refetch } = useApi(() => prescriptionAPI.getAll());
  const prescriptions = (rawPrescriptions as unknown as Prescription[]) ?? [];

  // Filter items that might contain IV/IM/Injection keywords
  const injections = prescriptions.filter(
    (p) =>
      p.items.toLowerCase().includes("inj") ||
      p.items.toLowerCase().includes("iv") ||
      p.items.toLowerCase().includes("im") ||
      p.items.toLowerCase().includes("infusion")
  );

  return (
    <AppShell role="nurse" title="Nurse" nav={nurseNav}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Injection Administration</h1>
          <p className="text-muted-foreground">Monitor and sign off on IV, IM, and infusion administrations</p>
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
          {injections.length === 0 ? (
            <div className="col-span-full text-center py-16 text-muted-foreground bg-secondary/20 rounded-2xl border">
              No active injection or IV/IM prescriptions detected.
            </div>
          ) : (
            injections.map((p, i) => (
              <motion.div key={p.id}
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-white border rounded-2xl p-5 shadow-card hover:shadow-elevated transition flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <div>
                      <h3 className="font-bold text-base leading-tight">{p.patient}</h3>
                      <span className="text-[10px] text-muted-foreground font-mono">RX ID: {p.id}</span>
                    </div>
                    <Badge className="bg-rose-100 text-rose-700">IV/IM/Inj</Badge>
                  </div>
                  
                  <div className="bg-rose-50/30 border border-rose-150 p-3 rounded-xl text-sm font-mono text-rose-900 mt-2">
                    {p.items}
                  </div>
                </div>

                <div className="border-t pt-3 flex items-center justify-between mt-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {p.date}</span>
                  <span className="flex items-center gap-1"><Syringe className="h-3 w-3" /> Injection Duty</span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </AppShell>
  );
}
