import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { nurseNav } from "@/lib/roleNav";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { BedDouble, Layers, Building2, User, Activity, HeartPulse, Clock } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/nurse/beds")({
  head: () => ({ meta: [{ title: "Beds — Nurse" }] }),
  component: NurseBedsScreen,
});

type BedStatus = "Occupied" | "Available" | "Reserved" | "Maintenance";

interface BedInfo {
  bedId: string;
  roomNo: string;
  floorNo: string;
  ward: string;
  status: BedStatus;
  patient?: string;
  patientCode?: string;
  admittedDays?: number;
  condition?: string;
  nextReview?: string;
}

const WARDS = ["All", "ICU", "General Ward", "Medical Ward", "Surgical Ward", "Maternity Ward", "Orthopedic Ward", "Neurology Ward"];

const ALL_BEDS: BedInfo[] = [
  // ICU
  { bedId: "ICU-01", roomNo: "ICU-01", floorNo: "Floor 2", ward: "ICU", status: "Occupied", patient: "Tariq Mehmood", patientCode: "P-1010", admittedDays: 2, condition: "Cardiac Arrest Recovery", nextReview: "12:00 PM" },
  { bedId: "ICU-02", roomNo: "ICU-01", floorNo: "Floor 2", ward: "ICU", status: "Available" },
  { bedId: "ICU-03", roomNo: "ICU-02", floorNo: "Floor 2", ward: "ICU", status: "Reserved", patient: "Incoming from ED", nextReview: "01:00 PM" },
  { bedId: "ICU-04", roomNo: "ICU-02", floorNo: "Floor 2", ward: "ICU", status: "Occupied", patient: "Muhammad Usama Khan", patientCode: "P-1001", admittedDays: 3, condition: "Acute Cardiac", nextReview: "10:00 AM" },
  { bedId: "ICU-05", roomNo: "ICU-03", floorNo: "Floor 2", ward: "ICU", status: "Maintenance" },
  { bedId: "ICU-06", roomNo: "ICU-03", floorNo: "Floor 2", ward: "ICU", status: "Available" },
  { bedId: "ICU-07", roomNo: "ICU-03", floorNo: "Floor 2", ward: "ICU", status: "Occupied", patient: "Ali Hassan Sheikh", patientCode: "P-1005", admittedDays: 8, condition: "Respiratory Failure", nextReview: "Continuous" },
  // General Ward
  { bedId: "Bed-101A", roomNo: "101", floorNo: "Floor 1", ward: "General Ward", status: "Available" },
  { bedId: "Bed-101B", roomNo: "101", floorNo: "Floor 1", ward: "General Ward", status: "Available" },
  { bedId: "Bed-102A", roomNo: "102", floorNo: "Floor 1", ward: "General Ward", status: "Occupied", patient: "Noman Farooq", patientCode: "P-1011", admittedDays: 1, condition: "Fever Observation" },
  { bedId: "Bed-102B", roomNo: "102", floorNo: "Floor 1", ward: "General Ward", status: "Available" },
  { bedId: "Bed-302A", roomNo: "302", floorNo: "Floor 3", ward: "General Ward", status: "Occupied", patient: "Sara Ahmed", patientCode: "P-1002", admittedDays: 1, condition: "Post-op Recovery", nextReview: "02:00 PM" },
  // Medical Ward
  { bedId: "Bed-114A", roomNo: "114", floorNo: "Floor 1", ward: "Medical Ward", status: "Available" },
  { bedId: "Bed-114B", roomNo: "114", floorNo: "Floor 1", ward: "Medical Ward", status: "Occupied", patient: "Hamza Riaz", patientCode: "P-1003", admittedDays: 5, condition: "Hypertension", nextReview: "04:00 PM" },
  { bedId: "Bed-115A", roomNo: "115", floorNo: "Floor 1", ward: "Medical Ward", status: "Reserved" },
  { bedId: "Bed-115B", roomNo: "115", floorNo: "Floor 1", ward: "Medical Ward", status: "Available" },
  // Surgical Ward
  { bedId: "Bed-205", roomNo: "205", floorNo: "Floor 2", ward: "Surgical Ward", status: "Occupied", patient: "Fatima Noor", patientCode: "P-1004", admittedDays: 2, condition: "Appendectomy", nextReview: "03:00 PM" },
  { bedId: "Bed-206A", roomNo: "206", floorNo: "Floor 2", ward: "Surgical Ward", status: "Maintenance" },
  { bedId: "Bed-206B", roomNo: "206", floorNo: "Floor 2", ward: "Surgical Ward", status: "Available" },
  // Maternity Ward
  { bedId: "Bed-408A", roomNo: "408", floorNo: "Floor 4", ward: "Maternity Ward", status: "Occupied", patient: "Ayesha Malik", patientCode: "P-1006", admittedDays: 1, condition: "Post-delivery" },
  { bedId: "Bed-408B", roomNo: "408", floorNo: "Floor 4", ward: "Maternity Ward", status: "Available" },
  { bedId: "Bed-409A", roomNo: "409", floorNo: "Floor 4", ward: "Maternity Ward", status: "Reserved" },
  // Orthopedic
  { bedId: "Bed-312C", roomNo: "312", floorNo: "Floor 3", ward: "Orthopedic Ward", status: "Occupied", patient: "Bilal Chaudhry", patientCode: "P-1007", admittedDays: 6, condition: "Hip Replacement", nextReview: "05:00 PM" },
  { bedId: "Bed-312D", roomNo: "312", floorNo: "Floor 3", ward: "Orthopedic Ward", status: "Available" },
  // Neurology
  { bedId: "Bed-501", roomNo: "501", floorNo: "Floor 5", ward: "Neurology Ward", status: "Occupied", patient: "Zainab Qureshi", patientCode: "P-1008", admittedDays: 4, condition: "Migraine Treatment", nextReview: "06:00 PM" },
  { bedId: "Bed-502A", roomNo: "502", floorNo: "Floor 5", ward: "Neurology Ward", status: "Available" },
  { bedId: "Bed-502B", roomNo: "502", floorNo: "Floor 5", ward: "Neurology Ward", status: "Maintenance" },
];

const statusConfig: Record<BedStatus, { cls: string; cardBg: string; dot: string }> = {
  Occupied:    { cls: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",         cardBg: "border-rose-200 dark:border-rose-900",   dot: "bg-rose-500" },
  Available:   { cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300", cardBg: "border-emerald-200 dark:border-emerald-900", dot: "bg-emerald-500" },
  Reserved:    { cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",     cardBg: "border-amber-200 dark:border-amber-900",  dot: "bg-amber-500" },
  Maintenance: { cls: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",        cardBg: "border-slate-200 dark:border-slate-700",   dot: "bg-slate-400" },
};

function NurseBedsScreen() {
  const [wardFilter, setWardFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = ALL_BEDS.filter((b) => {
    const matchWard = wardFilter === "All" || b.ward === wardFilter;
    const matchStatus = statusFilter === "All" || b.status === statusFilter;
    return matchWard && matchStatus;
  });

  const stats = {
    total: ALL_BEDS.length,
    occupied: ALL_BEDS.filter((b) => b.status === "Occupied").length,
    available: ALL_BEDS.filter((b) => b.status === "Available").length,
    reserved: ALL_BEDS.filter((b) => b.status === "Reserved").length,
    maintenance: ALL_BEDS.filter((b) => b.status === "Maintenance").length,
  };

  const occupancyRate = Math.round((stats.occupied / stats.total) * 100);

  return (
    <AppShell role="nurse" title="Nurse" nav={nurseNav}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Bed Management</h1>
        <p className="text-muted-foreground">Real-time bed occupancy across all wards — {stats.total} total beds</p>
      </div>

      {/* Occupancy ring + stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="col-span-2 md:col-span-1 rounded-2xl border bg-card p-5 flex flex-col items-center justify-center shadow-card">
          <div className="relative h-20 w-20 mb-2">
            <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-secondary" />
              <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray={`${occupancyRate} ${100 - occupancyRate}`}
                strokeDashoffset="0" className="text-rose-500" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-lg font-bold">{occupancyRate}%</div>
          </div>
          <div className="text-xs text-muted-foreground text-center font-medium">Occupancy Rate</div>
        </div>
        {[
          { label: "Occupied", value: stats.occupied, color: "from-rose-500 to-red-600" },
          { label: "Available", value: stats.available, color: "from-emerald-500 to-teal-600" },
          { label: "Reserved", value: stats.reserved, color: "from-amber-500 to-orange-600" },
          { label: "Maintenance", value: stats.maintenance, color: "from-slate-500 to-slate-600" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`rounded-2xl bg-gradient-to-br ${s.color} text-white p-5 shadow-elevated`}>
            <div className="text-3xl font-bold">{s.value}</div>
            <div className="text-sm opacity-90 mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Ward + Status filters */}
      <div className="flex flex-wrap gap-2 mb-3">
        {WARDS.map((w) => (
          <button key={w} onClick={() => setWardFilter(w)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              wardFilter === w ? "bg-rose-600 text-white border-rose-600" : "bg-secondary text-muted-foreground border-border hover:border-rose-400"
            }`}>{w}</button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {["All", "Occupied", "Available", "Reserved", "Maintenance"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              statusFilter === s ? "bg-violet-600 text-white border-violet-600" : "bg-secondary text-muted-foreground border-border hover:border-violet-400"
            }`}>{s}</button>
        ))}
      </div>

      {/* Bed grid */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {filtered.map((bed, i) => {
          const sc = statusConfig[bed.status];
          return (
            <motion.div key={bed.bedId}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.025 }}
              whileHover={{ y: -3 }}
              className={`bg-card border rounded-2xl p-4 shadow-card hover:shadow-elevated transition-all ${sc.cardBg}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="bg-secondary/60 p-2 rounded-xl">
                  <BedDouble className={`h-5 w-5 ${bed.status === "Occupied" ? "text-rose-500" : bed.status === "Available" ? "text-emerald-500" : bed.status === "Reserved" ? "text-amber-500" : "text-slate-400"}`} />
                </div>
                <Badge className={sc.cls}>
                  <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1.5 ${sc.dot}`} />
                  {bed.status}
                </Badge>
              </div>

              <div className="font-bold text-sm text-foreground mb-1">{bed.bedId}</div>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-3">
                <span className="flex items-center gap-0.5"><Building2 className="h-2.5 w-2.5" />Rm {bed.roomNo}</span>
                <span className="flex items-center gap-0.5"><Layers className="h-2.5 w-2.5" />{bed.floorNo}</span>
              </div>

              {bed.status === "Occupied" && bed.patient ? (
                <div className="bg-rose-50 dark:bg-rose-950/30 rounded-xl p-2.5 space-y-1.5 text-[11px]">
                  <div className="flex items-center gap-1 text-rose-800 dark:text-rose-300 font-semibold">
                    <User className="h-3 w-3" />{bed.patient}
                  </div>
                  {bed.patientCode && <div className="font-mono text-muted-foreground">{bed.patientCode}</div>}
                  {bed.condition && <div className="flex items-center gap-1 text-muted-foreground"><Activity className="h-2.5 w-2.5" />{bed.condition}</div>}
                  <div className="flex items-center justify-between">
                    {bed.admittedDays && <span className="text-muted-foreground">{bed.admittedDays}d admitted</span>}
                    {bed.nextReview && <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400"><Clock className="h-2.5 w-2.5" />{bed.nextReview}</span>}
                  </div>
                </div>
              ) : bed.status === "Reserved" ? (
                <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-2.5 text-[11px] text-amber-700 dark:text-amber-400">
                  <div className="font-semibold">{bed.patient ?? "Reserved for incoming patient"}</div>
                  {bed.nextReview && <div className="mt-1 flex items-center gap-1"><Clock className="h-2.5 w-2.5" />Expected {bed.nextReview}</div>}
                </div>
              ) : bed.status === "Maintenance" ? (
                <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-2.5 text-[11px] text-slate-500 dark:text-slate-400 text-center">
                  Under maintenance
                </div>
              ) : (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-2.5 text-[11px] text-emerald-700 dark:text-emerald-400 text-center font-semibold">
                  ✓ Ready for admission
                </div>
              )}

              <div className="mt-2 text-[10px] text-muted-foreground text-center">{bed.ward}</div>
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-muted-foreground bg-secondary/20 rounded-2xl border">
            No beds found for the selected filters.
          </div>
        )}
      </div>
    </AppShell>
  );
}
