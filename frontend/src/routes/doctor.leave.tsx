import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { doctorNav } from "@/lib/roleNav";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  CalendarOff, Plus, CheckCircle2, Clock, XCircle, Plane, Search,
  Filter, AlertTriangle, ShieldAlert, Sparkles, UserCheck, Trash2, ChevronRight
} from "lucide-react";
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
  head: () => ({ meta: [{ title: "Leave & Schedule Exceptions — Doctor" }] }),
  component: DoctorLeaveScreen,
});

function DoctorLeaveScreen() {
  const user = getUser();
  const [modalOpen, setModalOpen] = useState(false);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [q, setQ] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const reloadData = () => {
    const all = getLeaveRequests();
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
  const quotaUsedPct = Math.min(100, Math.round((quota.usedDays / quota.annualQuota) * 100));

  const cancelPending = (id: string) => {
    const all = getLeaveRequests();
    const updated = all.map((r) => (r.id === id ? { ...r, status: "Cancelled" as const } : r));
    saveLeaveRequests(updated);
    toast.success(`Leave request ${id} cancelled.`);
    reloadData();
  };

  const searched = requests.filter(r =>
    r.reason.toLowerCase().includes(q.toLowerCase()) ||
    r.id.toLowerCase().includes(q.toLowerCase()) ||
    r.requestType.toLowerCase().includes(q.toLowerCase()) ||
    (r.fromDate || "").includes(q)
  );

  const filtered = searched.filter(r => {
    if (activeTab === "pending") return r.status === "Pending";
    if (activeTab === "approved") return r.status === "Approved";
    if (activeTab === "rejected") return r.status === "Rejected";
    if (activeTab === "cancelled") return r.status === "Cancelled";
    return true;
  });

  const tabCounts = {
    all: searched.length,
    pending: searched.filter(r => r.status === "Pending").length,
    approved: searched.filter(r => r.status === "Approved").length,
    rejected: searched.filter(r => r.status === "Rejected").length,
    cancelled: searched.filter(r => r.status === "Cancelled").length,
  };

  return (
    <AppShell role="doctor" title="Doctor" nav={doctorNav}>
      {/* Top Banner */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <CalendarOff className="h-7 w-7 text-primary" />
            Leave & Schedule Exception Desk
          </h1>
          <p className="text-muted-foreground mt-1">
            Track live annual leave quotas, schedule exceptions, Super Admin approvals and automated dispatches.
          </p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          className="bg-gradient-primary text-white shadow-glow font-semibold shrink-0"
        >
          <Plus className="h-4 w-4 mr-2" /> Apply for Leave / Exception
        </Button>
      </div>

      {/* Quota & Balance Executive Summary Card */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Metric Cards Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Annual Quota", value: `${quota.annualQuota}d`, icon: Plane, c: "from-blue-500 to-cyan-500" },
            { label: "Approved Used", value: `${quota.usedDays}d`, icon: CheckCircle2, c: "from-emerald-500 to-teal-500" },
            { label: "Pending Review", value: String(requests.filter((r) => r.status === "Pending").length), icon: Clock, c: "from-amber-500 to-orange-500" },
            { label: "Remaining Paid", value: `${quota.remainingDays}d`, icon: CalendarOff, c: "from-violet-500 to-purple-600" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${s.c} text-white p-4 shadow-elevated`}
            >
              <div className="absolute -bottom-6 -right-6 h-20 w-20 rounded-full bg-white/20 blur-2xl" />
              <s.icon className="h-4 w-4 opacity-80" />
              <div className="text-2xl font-bold mt-2">{s.value}</div>
              <div className="text-[11px] uppercase font-semibold tracking-wider opacity-90 mt-0.5">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Quota Progress Meter Box */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border bg-card p-5 shadow-card flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-bold text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Paid Quota Utilization
            </div>
            <Badge variant="outline" className="text-xs font-mono">{quotaUsedPct}% Used</Badge>
          </div>

          <div className="space-y-1.5">
            <div className="h-3 w-full rounded-full bg-secondary/80 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${quotaUsedPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  quotaUsedPct > 80 ? "bg-rose-500" : quotaUsedPct > 50 ? "bg-amber-500" : "bg-emerald-500"
                }`}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground pt-1 font-medium">
              <span>{quota.usedDays} days used</span>
              <span>{quota.remainingDays} days available</span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-xl border border-border/50">
            ℹ️ Requests exceeding remaining paid balance require Super Admin review for payroll deduction.
          </div>
        </motion.div>
      </div>

      {/* Main Leave History Table & Filter Panel */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-lg">Leave Applications & Schedule Exceptions</h3>
            <p className="text-xs text-muted-foreground">Manage your historical leave requests, track status, or cancel pending applications.</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by reason, type, ref ID..."
              className="pl-9 text-xs"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-secondary/40 p-1 rounded-xl">
            <TabsTrigger value="all" className="text-xs">
              All <Badge variant="secondary" className="ml-1 text-[10px] px-1.5">{tabCounts.all}</Badge>
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-xs data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              <Clock className="h-3 w-3 mr-1" /> Pending
              {tabCounts.pending > 0 && <Badge className="ml-1 bg-amber-100 text-amber-800 text-[10px] px-1.5">{tabCounts.pending}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="approved" className="text-xs data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Approved
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5">{tabCounts.approved}</Badge>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="text-xs data-[state=active]:bg-rose-600 data-[state=active]:text-white">
              <XCircle className="h-3 w-3 mr-1" /> Rejected
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5">{tabCounts.rejected}</Badge>
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="text-xs">
              Cancelled
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5">{tabCounts.cancelled}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filtered.map((r, i) => (
                  <motion.div
                    key={r.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.03 }}
                    className="group border border-border hover:border-primary/40 rounded-2xl p-5 bg-background hover:shadow-card transition-all space-y-3"
                  >
                    {/* Header line: Ref ID, Type, Date & Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-11 w-11 rounded-xl flex items-center justify-center text-white font-bold shadow-glow shrink-0 ${
                            r.status === "Approved"
                              ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                              : r.status === "Pending"
                              ? "bg-gradient-to-br from-amber-500 to-orange-600"
                              : r.status === "Rejected"
                              ? "bg-gradient-to-br from-rose-500 to-red-600"
                              : "bg-slate-500"
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
                            <span className="font-extrabold text-base text-foreground">
                              {r.fromDate} ({r.fromTime || "08:00"}) → {r.toDate} ({r.toTime || "17:00"})
                            </span>
                            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">{r.totalDays} Day(s)</Badge>
                            <Badge variant="outline" className="text-xs">{r.requestType}</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                            <span>Reference Code: <b className="font-mono text-foreground">{r.id}</b></span>
                            <span>•</span>
                            <span>Logged {new Date(r.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          className={`text-xs px-3 py-1 font-semibold ${
                            r.status === "Approved"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200"
                              : r.status === "Pending"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 animate-pulse"
                              : r.status === "Rejected"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200"
                              : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          {r.status === "Pending" ? "⏳ Pending Admin Approval" : r.status}
                        </Badge>
                        {r.status === "Pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => cancelPending(r.id)}
                            className="text-xs border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" /> Cancel
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Details & Payroll Audit Section */}
                    <div className="grid md:grid-cols-2 gap-4 text-xs">
                      <div className="bg-secondary/30 p-3.5 rounded-xl border border-border/50 space-y-1">
                        <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Reason & Patient Impact:</span>
                        <p className="text-foreground font-medium italic">"{r.reason}"</p>
                        {r.cancelImpactedAppointments && (
                          <div className="text-amber-600 dark:text-amber-400 font-semibold pt-1 flex items-center gap-1">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                            <span>{r.impactedCount || 3} patient consultations auto-canceled upon approval.</span>
                          </div>
                        )}
                      </div>

                      <div className={`p-3.5 rounded-xl border space-y-1 ${
                        r.exceededDays > 0
                          ? "bg-rose-500/10 border-rose-500/20 text-rose-800 dark:text-rose-200"
                          : "bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-200"
                      }`}>
                        <span className="font-bold uppercase text-[10px] tracking-wider">Quota & Payroll Audit:</span>
                        {r.exceededDays > 0 ? (
                          <div className="font-semibold space-y-0.5">
                            <div>⚠️ Request exceeded remaining quota by {r.exceededDays} day(s).</div>
                            <div>
                              Salary Cut Status:{" "}
                              <b className="underline">
                                {r.status === "Pending"
                                  ? `Estimated -$${r.estimatedDeduction} (Subject to Admin Review)`
                                  : r.applyDeduction
                                  ? `APPLIED (-$${r.estimatedDeduction})`
                                  : "WAIVED BY ADMIN (Paid Exception)"}
                              </b>
                            </div>
                          </div>
                        ) : (
                          <div className="font-semibold">
                            ✅ Covered under annual paid quota ({r.totalDays}d). No salary cut.
                          </div>
                        )}

                        {r.adminRemarks && (
                          <div className="text-foreground pt-1 font-medium border-t border-border/40 mt-1">
                            Admin Note: "{r.adminRemarks}"
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filtered.length === 0 && (
                <div className="text-center py-12 text-muted-foreground border border-dashed rounded-2xl">
                  No leave applications found{q ? ` matching "${q}"` : ""} in this tab.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Leave Application Modal */}
      <LeaveRequestModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        role="doctor"
        onRequestSubmitted={reloadData}
      />
    </AppShell>
  );
}
