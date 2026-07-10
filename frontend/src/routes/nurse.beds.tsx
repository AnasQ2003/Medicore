import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { nurseNav } from "@/lib/roleNav";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { BedDouble, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { bedAPI, patientAPI } from "@/lib/api/client";
import useApi from "@/hooks/useApi";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/nurse/beds")({
  head: () => ({ meta: [{ title: "Beds — Nurse" }] }),
  component: NurseBedsScreen,
});

interface Bed {
  id: number; bedNumber: string; ward: string; status: "Vacant" | "Occupied" | "Maintenance";
  patientId?: number; patientName?: string;
}
interface ApiPatient { id: number; name: string; patientCode: string; }

const statusConfig = {
  Vacant: "bg-emerald-100 text-emerald-700",
  Occupied: "bg-blue-100 text-blue-700",
  Maintenance: "bg-amber-100 text-amber-700",
};

function NurseBedsScreen() {
  const { data: rawBeds, loading, error, refetch } = useApi(() => bedAPI.getAll());
  const { data: rawPatients } = useApi(() => patientAPI.getAll());
  const beds = (rawBeds as unknown as Bed[]) ?? [];
  const patients = (rawPatients as unknown as ApiPatient[]) ?? [];

  const [editing, setEditing] = useState<Bed | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [newPatientId, setNewPatientId] = useState<string>("");

  const openEdit = (bed: Bed) => {
    setEditing(bed);
    setNewStatus(bed.status);
    setNewPatientId(bed.patientId ? String(bed.patientId) : "");
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      await bedAPI.updateStatus(
        editing.id,
        newStatus,
        newStatus === "Occupied" && newPatientId ? Number(newPatientId) : null
      );
      toast.success(`Bed ${editing.bedNumber} updated to ${newStatus}`);
      setEditing(null);
      refetch();
    } catch {
      toast.error("Failed to update bed status");
    }
  };

  const counts = {
    total: beds.length,
    vacant: beds.filter((b) => b.status === "Vacant").length,
    occupied: beds.filter((b) => b.status === "Occupied").length,
    maintenance: beds.filter((b) => b.status === "Maintenance").length,
  };

  return (
    <AppShell role="nurse" title="Nurse" nav={nurseNav}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Ward Bed Management</h1>
        <p className="text-muted-foreground">Real-time bed availability across all wards</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Beds", value: counts.total, color: "from-violet-500 to-purple-600" },
          { label: "Vacant", value: counts.vacant, color: "from-emerald-500 to-teal-600" },
          { label: "Occupied", value: counts.occupied, color: "from-blue-500 to-cyan-600" },
          { label: "Maintenance", value: counts.maintenance, color: "from-amber-500 to-orange-600" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`rounded-2xl bg-gradient-to-br ${s.color} text-white p-5 shadow-elevated`}>
            <div className="text-3xl font-bold">{s.value}</div>
            <div className="text-sm opacity-90 mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {loading && <div className="flex items-center justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
      {error && (
        <div className="text-center py-16 text-destructive">
          <AlertCircle className="h-8 w-8 mx-auto mb-3" />
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-gradient-card border border-border rounded-2xl shadow-card overflow-hidden">
          <div className="p-6 flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2"><BedDouble className="h-4 w-4 text-primary" />All Beds</h3>
            <Button variant="outline" size="sm" onClick={refetch}><RefreshCw className="h-3.5 w-3.5 mr-2" />Refresh</Button>
          </div>

          {beds.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">No beds found.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-6 pt-0">
              {beds.map((bed, i) => (
                <motion.div key={bed.id}
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.02 }}
                  whileHover={{ y: -4 }}
                  className={`rounded-2xl border p-4 text-center shadow-card cursor-pointer transition-all hover:shadow-elevated ${
                    bed.status === "Vacant" ? "bg-emerald-50 border-emerald-200" :
                    bed.status === "Occupied" ? "bg-blue-50 border-blue-200" :
                    "bg-amber-50 border-amber-200"
                  }`}
                  onClick={() => openEdit(bed)}
                >
                  <BedDouble className={`h-8 w-8 mx-auto mb-2 ${
                    bed.status === "Vacant" ? "text-emerald-500" :
                    bed.status === "Occupied" ? "text-blue-500" : "text-amber-500"
                  }`} />
                  <div className="font-bold text-sm">{bed.bedNumber}</div>
                  {bed.ward && <div className="text-[10px] text-muted-foreground">{bed.ward}</div>}
                  <Badge className={`mt-2 text-[10px] ${statusConfig[bed.status] ?? ""}`}>{bed.status}</Badge>
                  {bed.patientName && <div className="text-[10px] mt-1 text-muted-foreground truncate">{bed.patientName}</div>}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><BedDouble className="h-5 w-5 text-primary" />Edit Bed — {editing?.bedNumber}</DialogTitle>
            <DialogDescription>Update bed status and patient assignment.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Status</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vacant">Vacant</SelectItem>
                  <SelectItem value="Occupied">Occupied</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newStatus === "Occupied" && (
              <div>
                <label className="text-sm font-medium mb-1.5 block">Assign Patient</label>
                <Select value={newPatientId} onValueChange={setNewPatientId}>
                  <SelectTrigger><SelectValue placeholder="Select patient…" /></SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name} ({p.patientCode})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveEdit} className="bg-gradient-primary text-white">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
