import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { doctorNav } from "@/lib/roleNav";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarOff, Plus, CheckCircle2, Clock, XCircle, Plane, AlertTriangle, ShieldAlert } from "lucide-react";
import { useState, useEffect } from "react";
import { getUser } from "@/lib/auth";
import {
  getLeaveRequests,
  calculateUserQuota,
  saveLeaveRequests,
  type LeaveRequest
} from "@/lib/leaveStore";
import { LeaveRequestModal } from "@/components/LeaveRequestModal";
import { toast } from "sonner";

export const Route = createFileRoute("/doctor/leave")({
  head: () => ({ meta: [{ title: "Leave & Exception Management — Doctor" }] }),
  component: DoctorLeaveScreen,
});

function DoctorLeaveScreen() {
  const user = getUser();
  const [modalOpen, setModalOpen] = useState(false);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);

  const reloadData = () => {
    const all = getLeaveRequests();
    // Filter for current doctor or doctor role
    const docRequests = all.filter(
      (r) => r.applicantEmail === (user?.email || "doctor@medicore.app") || r.applicantRole === "doctor"
    );
    setRequests(docRequests);
  };

  useEffect(() => {
    reloadData();
    const handleUpdate = () => reloadData();
    window.addEventListener("medicore_leave_requests_updated", handleUpdate);
    return () => window.removeEventListener("medicore_leave_requests_updated", handleUpdate);
  }, []);

  const quota = calculateUserQuota(user?.email || "doctor@medicore.app", "doctor");

  const cancelPending = (id: string) => {
    const all = getLeaveRequests();
    const updated = all.map((r) => (r.id === id ? { ...r, status: "Cancelled" as const } : r));
    saveLeaveRequests(updated);
    toast.success(`Leave request ${id} cancelled.`);
    reloadData();
  };

  return (
    <AppShell role="doctor" title="Doctor" nav={doctorNav}>
      {/* Top Banner */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <CalendarOff className="h-7 w-7 text-amber-500" />
            Leave & Schedule Exception Desk
          </h1>
          <p className="text-muted-foreground mt-1">
            Apply for leave, request appointment cancellations, track live Super Admin approvals and email dispatches.
          </p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          className="bg-gradient-primary text-white shadow-glow font-semibold self-start"
        >
          <Plus className="h-4 w-4 mr-2" /> Apply for Leave / Exception
        </Button>
      </div>

      {/* Quota Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Annual Paid Quota", value: `${quota.annualQuota}d`, icon: Plane, c: "from-blue-500 to-cyan-500" },
          { label: "Approved Used", value: `${quota.usedDays}d`, icon: CheckCircle2, c: "from-emerald-500 to-teal-500" },
          { label: "Pending Admin", value: String(requests.filter((r) => r.status === "Pending").length), icon: Clock, c: "from-amber-500 to-orange-500" },
          { label: "Remaining Paid", value: `${quota.remainingDays}d`, icon: CalendarOff, c: "from-violet-500 to-purple-600" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${s.c} text-white p-5 shadow-elevated`}
          >
            <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-white/20 blur-2xl" />
            <s.icon className="h-5 w-5 opacity-80" />
            <div className="text-3xl font-bold mt-3">{s.value}</div>
            <div className="text-xs uppercase font-semibold tracking-wider opacity-90 mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Leave Applications History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">My Leave Applications & Exception Log</h3>
          <span className="text-xs text-muted-foreground">Showing {requests.length} records</span>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {requests.map((r, i) => (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white border rounded-2xl p-5 shadow-card space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/40">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-11 w-11 rounded-xl flex items-center justify-center text-white font-bold shadow-glow ${
                        r.status === "Approved"
                          ? "bg-gradient-green"
                          : r.status === "Pending"
                          ? "bg-gradient-sunset"
                          : "bg-gradient-red"
                      }`}
                    >
                      {r.status === "Approved" ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : r.status === "Pending" ? (
                        <Clock className="h-5 w-5" />
                      ) : (
                        <XCircle className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-base">
                          {r.fromDate} ({r.fromTime}) → {r.toDate} ({r.toTime})
                        </span>
                        <Badge variant="outline">{r.totalDays} Day(s)</Badge>
                        <Badge variant="secondary">{r.requestType}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Ref: <b>{r.id}</b> • Submitted {new Date(r.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      className={`text-xs px-3 py-1 font-semibold ${
                        r.status === "Approved"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : r.status === "Pending"
                          ? "bg-amber-100 text-amber-800 border-amber-200 animate-pulse"
                          : "bg-rose-100 text-rose-800 border-rose-200"
                      }`}
                    >
                      {r.status === "Pending" ? "⏳ Pending Admin Approval" : r.status}
                    </Badge>
                    {r.status === "Pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => cancelPending(r.id)}
                        className="text-xs border-rose-200 text-rose-700 hover:bg-rose-50"
                      >
                        Cancel Request
                      </Button>
                    )}
                  </div>
                </div>

                {/* Details & Admin decision feedback */}
                <div className="grid md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-muted/30 p-3 rounded-xl border space-y-1">
                    <span className="font-bold text-muted-foreground uppercase text-[10px]">Reason & Impact:</span>
                    <p className="text-foreground italic">"{r.reason}"</p>
                    {r.cancelImpactedAppointments && (
                      <div className="text-amber-700 font-semibold pt-1">
                        • {r.impactedCount || 3} patient consultations auto-canceled upon approval.
                      </div>
                    )}
                  </div>

                  <div className={`p-3 rounded-xl border space-y-1 ${
                    r.exceededDays > 0 ? "bg-rose-50/70 border-rose-200" : "bg-emerald-50/70 border-emerald-200"
                  }`}>
                    <span className="font-bold uppercase text-[10px]">Quota & Payroll Audit:</span>
                    {r.exceededDays > 0 ? (
                      <div className="text-rose-800 font-semibold space-y-0.5">
                        <div>⚠️ Request exceeded remaining quota by {r.exceededDays} day(s).</div>
                        <div>
                          Salary Cut Status:{" "}
                          <b>
                            {r.status === "Pending"
                              ? `Estimated -$${r.estimatedDeduction} (Subject to Admin Decision)`
                              : r.applyDeduction
                              ? `APPLIED (-$${r.estimatedDeduction})`
                              : "WAIVED BY ADMIN (Paid Exception)"}
                          </b>
                        </div>
                      </div>
                    ) : (
                      <div className="text-emerald-800 font-semibold">
                        ✅ Within annual paid quota. No salary cut applied.
                      </div>
                    )}

                    {r.adminRemarks && (
                      <div className="text-foreground pt-1 font-medium">
                        Admin Note: "{r.adminRemarks}"
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Modal */}
      <LeaveRequestModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        role="doctor"
        onRequestSubmitted={reloadData}
      />
    </AppShell>
  );
}
