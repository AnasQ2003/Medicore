import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarOff, CheckCircle2, XCircle, Clock, AlertTriangle, ShieldAlert,
  User, Mail, FileText, Check, X, DollarSign, Filter, RefreshCw, Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  getLeaveRequests,
  updateLeaveRequestStatus,
  type LeaveRequest
} from "@/lib/leaveStore";
import { toast } from "sonner";

export function AdminLeaveApprovalDesk() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [adminRemarksMap, setAdminRemarksMap] = useState<Record<string, string>>({});
  const [deductionMap, setDeductionMap] = useState<Record<string, boolean>>({});

  const reloadData = () => {
    const data = getLeaveRequests();
    setRequests(data);

    // Initialize deduction toggles
    const initDeductions: Record<string, boolean> = {};
    data.forEach((r) => {
      initDeductions[r.id] = r.applyDeduction;
    });
    setDeductionMap((prev) => ({ ...initDeductions, ...prev }));
  };

  useEffect(() => {
    reloadData();
    const handleUpdate = () => reloadData();
    window.addEventListener("medicore_leave_requests_updated", handleUpdate);
    return () => window.removeEventListener("medicore_leave_requests_updated", handleUpdate);
  }, []);

  const pendingCount = requests.filter((r) => r.status === "Pending").length;
  const approvedCount = requests.filter((r) => r.status === "Approved").length;
  const rejectedCount = requests.filter((r) => r.status === "Rejected").length;

  const filteredRequests = requests.filter((r) => {
    if (filter === "pending") return r.status === "Pending";
    if (filter === "approved") return r.status === "Approved";
    if (filter === "rejected") return r.status === "Rejected";
    return true;
  });

  const handleDecision = (
    requestId: string,
    status: "Approved" | "Rejected"
  ) => {
    const remarks = adminRemarksMap[requestId] || "";
    const applyDeduction = deductionMap[requestId] ?? true;

    updateLeaveRequestStatus(requestId, status, remarks, applyDeduction);
    reloadData();
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Summary Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-card border rounded-2xl p-6 shadow-card">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-violet text-white flex items-center justify-center shadow-glow">
              <CalendarOff className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Staff & User Leave Approval Hub</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Review leave applications, manage excess quota salary deductions, and dispatch automated email decisions.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={reloadData} className="rounded-xl text-xs">
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh List
          </Button>
        </div>
      </div>

      {/* Quick Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Pending Approvals", count: pendingCount, icon: Clock, c: "from-amber-500 to-orange-500", text: "Requires Super Admin Action" },
          { label: "Total Approved", count: approvedCount, icon: CheckCircle2, c: "from-emerald-500 to-teal-500", text: "Active / Granted Leaves" },
          { label: "Total Rejected", count: rejectedCount, icon: XCircle, c: "from-rose-500 to-pink-600", text: "Applications Declined" },
          { label: "Total Received", count: requests.length, icon: FileText, c: "from-violet-500 to-purple-600", text: "Across All Roles" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${s.c} text-white p-5 shadow-elevated`}
          >
            <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-white/20 blur-2xl" />
            <div className="flex items-center justify-between">
              <s.icon className="h-5 w-5 opacity-80" />
              {s.count > 0 && s.label.includes("Pending") && (
                <span className="h-2 w-2 rounded-full bg-white animate-ping" />
              )}
            </div>
            <div className="text-3xl font-bold mt-3">{s.count}</div>
            <div className="text-xs uppercase font-semibold tracking-wider opacity-90 mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Filter Tabs */}
      <Tabs defaultValue="pending" value={filter} onValueChange={(v: any) => setFilter(v)} className="space-y-4">
        <TabsList className="bg-muted/60 border p-1 rounded-xl">
          <TabsTrigger value="pending" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Clock className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
            Pending Action ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="approved" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
            Approved ({approvedCount})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <XCircle className="h-3.5 w-3.5 mr-1.5 text-rose-500" />
            Rejected ({rejectedCount})
          </TabsTrigger>
          <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            All Applications ({requests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="rounded-2xl border bg-white p-12 text-center text-muted-foreground space-y-2">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto opacity-50" />
              <div className="font-semibold text-lg">No leave applications in this view.</div>
              <p className="text-xs text-muted-foreground">Select a different tab or check back later.</p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredRequests.map((req, i) => {
                const isPending = req.status === "Pending";
                const currentRemarks = adminRemarksMap[req.id] ?? req.adminRemarks ?? "";
                const currentDeduction = deductionMap[req.id] ?? req.applyDeduction;

                return (
                  <motion.div
                    key={req.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.04 }}
                    className={`rounded-2xl border bg-white p-6 shadow-card space-y-4 border-l-4 ${
                      req.status === "Approved"
                        ? "border-l-emerald-500"
                        : req.status === "Rejected"
                        ? "border-l-rose-500"
                        : "border-l-amber-500"
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                          {req.applicantName[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-base">{req.applicantName}</span>
                            <Badge className="capitalize bg-primary/10 text-primary border-0">
                              {req.applicantRole}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {req.department}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                            <Mail className="h-3 w-3" /> {req.applicantEmail} • Application Ref: <b>{req.id}</b>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <Badge
                          className={`text-xs px-3 py-1 font-semibold ${
                            req.status === "Approved"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                              : req.status === "Rejected"
                              ? "bg-rose-100 text-rose-800 border-rose-200"
                              : "bg-amber-100 text-amber-800 border-amber-200 animate-pulse"
                          }`}
                        >
                          {req.status === "Pending" ? "⏳ Pending Admin Action" : req.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid md:grid-cols-3 gap-4 text-xs">
                      {/* Column 1: Dates & Request Type */}
                      <div className="space-y-2 bg-muted/20 rounded-xl p-3 border">
                        <div className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
                          Schedule Exception Details
                        </div>
                        <div>
                          <span className="text-muted-foreground">Type:</span>{" "}
                          <span className="font-bold text-primary">{req.requestType}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Duration:</span>{" "}
                          <span className="font-bold text-foreground">
                            {req.fromDate} ({req.fromTime}) → {req.toDate} ({req.toTime})
                          </span>
                        </div>
                        <div className="pt-1">
                          <Badge variant="secondary" className="font-mono">
                            Total: {req.totalDays} Day(s)
                          </Badge>
                        </div>
                        {req.cancelImpactedAppointments && (
                          <div className="text-[11px] text-amber-700 font-semibold bg-amber-50 p-2 rounded-lg border border-amber-200 mt-2">
                            ⚠️ Auto-cancels {req.impactedCount || 3} impacted consultations upon approval.
                          </div>
                        )}
                      </div>

                      {/* Column 2: Reason & Description */}
                      <div className="space-y-2 bg-muted/20 rounded-xl p-3 border">
                        <div className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
                          Applicant Statement
                        </div>
                        <p className="text-muted-foreground italic leading-relaxed">
                          "{req.reason}"
                        </p>
                        <div className="text-[10px] text-muted-foreground pt-2">
                          Submitted on: {new Date(req.createdAt).toLocaleString()}
                        </div>
                      </div>

                      {/* Column 3: Leave Quota & Salary Cut Decision */}
                      <div className={`space-y-2 rounded-xl p-3 border ${
                        req.exceededDays > 0 ? "bg-rose-50/60 border-rose-200" : "bg-emerald-50/60 border-emerald-200"
                      }`}>
                        <div className="font-bold uppercase text-[10px] tracking-wider flex items-center justify-between">
                          <span>Staff Quota & Salary Audit</span>
                          {req.exceededDays > 0 && (
                            <span className="text-rose-600 font-bold">Quota Exceeded!</span>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-1 text-center py-1">
                          <div className="bg-white rounded-lg p-1.5 border">
                            <div className="text-[9px] text-muted-foreground">Annual</div>
                            <div className="font-bold text-blue-600">{req.annualQuota}d</div>
                          </div>
                          <div className="bg-white rounded-lg p-1.5 border">
                            <div className="text-[9px] text-muted-foreground">Used</div>
                            <div className="font-bold text-amber-600">{req.usedDaysBefore}d</div>
                          </div>
                          <div className="bg-white rounded-lg p-1.5 border">
                            <div className="text-[9px] text-muted-foreground">Remaining</div>
                            <div className="font-bold text-emerald-600">{req.remainingDaysBefore}d</div>
                          </div>
                        </div>

                        {req.exceededDays > 0 ? (
                          <div className="space-y-2 pt-1">
                            <div className="text-[11px] font-bold text-rose-800 flex items-center gap-1">
                              <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
                              Exceeds balance by {req.exceededDays} day(s) (${req.estimatedDeduction})
                            </div>

                            {isPending ? (
                              <div className="flex items-center justify-between bg-white p-2 rounded-lg border">
                                <span className="font-semibold text-rose-900 text-[11px]">
                                  Apply Salary Cut (${req.estimatedDeduction}):
                                </span>
                                <Switch
                                  checked={currentDeduction}
                                  onCheckedChange={(val) =>
                                    setDeductionMap((prev) => ({ ...prev, [req.id]: val }))
                                  }
                                />
                              </div>
                            ) : (
                              <div className="text-[11px] font-bold">
                                Deduction Decision:{" "}
                                <span className={req.applyDeduction ? "text-rose-700" : "text-emerald-700"}>
                                  {req.applyDeduction ? `APPLIED (-$${req.estimatedDeduction})` : "WAIVED (Paid Exception)"}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-[11px] text-emerald-700 font-semibold pt-2 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            Fully covered by paid allowance. No salary cut required.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Admin Action Bar & Remarks */}
                    {isPending ? (
                      <div className="pt-3 border-t border-border/50 space-y-3">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                          <Input
                            placeholder="Add Super Admin remarks or instructions for email..."
                            value={currentRemarks}
                            onChange={(e) =>
                              setAdminRemarksMap((prev) => ({ ...prev, [req.id]: e.target.value }))
                            }
                            className="flex-1 text-xs"
                          />
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              onClick={() => handleDecision(req.id, "Rejected")}
                              variant="outline"
                              className="bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200 text-xs font-semibold"
                            >
                              <X className="h-4 w-4 mr-1.5" /> Decline Request
                            </Button>
                            <Button
                              onClick={() => handleDecision(req.id, "Approved")}
                              className="bg-gradient-green text-white shadow-glow text-xs font-semibold"
                            >
                              <Check className="h-4 w-4 mr-1.5" /> Approve & Dispatch Email
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-border/50 flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-2">
                        <div>
                          Admin Remarks: <span className="font-medium text-foreground">{req.adminRemarks || "None"}</span>
                        </div>
                        {req.processedAt && (
                          <div>Processed on: {new Date(req.processedAt).toLocaleString()}</div>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
