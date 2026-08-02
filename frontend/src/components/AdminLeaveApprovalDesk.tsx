import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarOff, CheckCircle2, XCircle, Clock, AlertTriangle, ShieldAlert,
  User, Mail, FileText, Check, X, DollarSign, Filter, RefreshCw, Send,
  Bed, Stethoscope, Receipt, Package, Layers, ShieldCheck
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
  type LeaveRequest,
  type RequestCategory
} from "@/lib/leaveStore";
import { toast } from "sonner";

export function AdminLeaveApprovalDesk() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [adminRemarksMap, setAdminRemarksMap] = useState<Record<string, string>>({});
  const [deductionMap, setDeductionMap] = useState<Record<string, boolean>>({});

  const reloadData = () => {
    const data = getLeaveRequests();
    setRequests(data);

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
    if (statusFilter === "pending" && r.status !== "Pending") return false;
    if (statusFilter === "approved" && r.status !== "Approved") return false;
    if (statusFilter === "rejected" && r.status !== "Rejected") return false;

    if (roleFilter !== "all" && r.applicantRole !== roleFilter) return false;
    if (categoryFilter !== "all" && r.category !== categoryFilter) return false;

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

  const getCategoryIcon = (cat?: RequestCategory) => {
    switch (cat) {
      case "Equipment & Furniture": return <Bed className="h-4 w-4 text-rose-500" />;
      case "Doctor Change & Care": return <Stethoscope className="h-4 w-4 text-amber-500" />;
      case "Front Desk & Queue": return <Receipt className="h-4 w-4 text-emerald-500" />;
      default: return <CalendarOff className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-card border rounded-2xl p-6 shadow-card">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-violet text-white flex items-center justify-center shadow-glow">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Super Admin Universal Request & Exception Hub</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage leave approvals, nurse furniture/equipment demands, patient doctor change requests, and front desk overrides.
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
          { label: "Pending Approvals", count: pendingCount, icon: Clock, c: "from-amber-500 to-orange-500" },
          { label: "Total Approved", count: approvedCount, icon: CheckCircle2, c: "from-emerald-500 to-teal-500" },
          { label: "Total Rejected", count: rejectedCount, icon: XCircle, c: "from-rose-500 to-pink-600" },
          { label: "Total Requests", count: requests.length, icon: FileText, c: "from-violet-500 to-purple-600" },
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
                <span className="h-2.5 w-2.5 rounded-full bg-white animate-ping" />
              )}
            </div>
            <div className="text-3xl font-bold mt-3">{s.count}</div>
            <div className="text-xs uppercase font-semibold tracking-wider opacity-90 mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Filter Bar: Status, Role, Category */}
      <div className="bg-white border rounded-2xl p-4 shadow-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Tabs */}
          <Tabs defaultValue="pending" value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
            <TabsList className="bg-muted/60 border p-1 rounded-xl">
              <TabsTrigger value="pending" className="rounded-lg text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Clock className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                Pending ({pendingCount})
              </TabsTrigger>
              <TabsTrigger value="approved" className="rounded-lg text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
                Approved ({approvedCount})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="rounded-lg text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <XCircle className="h-3.5 w-3.5 mr-1.5 text-rose-500" />
                Rejected ({rejectedCount})
              </TabsTrigger>
              <TabsTrigger value="all" className="rounded-lg text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
                All ({requests.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Role & Category Selectors */}
          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-9 rounded-xl border bg-background px-3 text-xs font-medium"
            >
              <option value="all">All Roles</option>
              <option value="doctor">Doctors</option>
              <option value="nurse">Nurses</option>
              <option value="receptionist">Receptionists</option>
              <option value="patient">Patients</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 rounded-xl border bg-background px-3 text-xs font-medium"
            >
              <option value="all">All Categories</option>
              <option value="Equipment & Furniture">Equipment & Furniture</option>
              <option value="Doctor Change & Care">Doctor Change</option>
              <option value="Front Desk & Queue">Front Desk & Queue</option>
              <option value="Leave & Schedule">Leave & Absence</option>
            </select>
          </div>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground space-y-2">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto opacity-50" />
            <div className="font-semibold text-base">No requests match the selected filters.</div>
            <p className="text-xs">Adjust your role or category filter above.</p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-4">
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
                    className={`rounded-2xl border bg-white p-5 shadow-card space-y-4 border-l-4 ${
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
                        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                          {req.applicantName[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm">{req.applicantName}</span>
                            <Badge className="capitalize bg-primary/10 text-primary border-0 text-[11px]">
                              {req.applicantRole}
                            </Badge>
                            <Badge variant="outline" className="text-[11px]">
                              {req.department}
                            </Badge>
                            {req.priority === "Emergency" && (
                              <Badge className="bg-rose-600 text-white border-0 text-[10px] animate-pulse">
                                🚨 Emergency Alert
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                            <Mail className="h-3 w-3" /> {req.applicantEmail} • Ref: <b>{req.id}</b>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          className={`text-xs px-3 py-1 font-semibold ${
                            req.status === "Approved"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                              : req.status === "Rejected"
                              ? "bg-rose-100 text-rose-800 border-rose-200"
                              : "bg-amber-100 text-amber-800 border-amber-200 animate-pulse"
                          }`}
                        >
                          {req.status === "Pending" ? "⏳ Action Required" : req.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid md:grid-cols-3 gap-4 text-xs">
                      {/* Column 1: Category & Specific Details */}
                      <div className="space-y-2 bg-muted/20 rounded-xl p-3 border">
                        <div className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                          {getCategoryIcon(req.category)}
                          {req.category || "General Request"}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Request Type:</span>{" "}
                          <span className="font-bold text-primary">{req.requestType}</span>
                        </div>

                        {req.requestedItems && (
                          <div className="bg-white p-2 rounded-lg border font-medium text-rose-900 border-rose-200">
                            📦 Items Requested: <b>{req.requestedItems}</b>
                          </div>
                        )}

                        {req.targetDoctor && (
                          <div className="bg-white p-2 rounded-lg border font-medium text-amber-900 border-amber-200">
                            🩺 Doctor Preferred: <b>{req.targetDoctor}</b>
                          </div>
                        )}

                        {req.fromDate && req.toDate && (
                          <div className="text-muted-foreground">
                            Dates: <b>{req.fromDate} → {req.toDate}</b> ({req.totalDays}d)
                          </div>
                        )}
                      </div>

                      {/* Column 2: Statement / Description */}
                      <div className="space-y-2 bg-muted/20 rounded-xl p-3 border">
                        <div className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
                          Statement & Justification
                        </div>
                        <p className="text-muted-foreground italic leading-relaxed">
                          "{req.reason}"
                        </p>
                        <div className="text-[10px] text-muted-foreground pt-2">
                          Submitted on: {new Date(req.createdAt).toLocaleString()}
                        </div>
                      </div>

                      {/* Column 3: Audit & Decision Details */}
                      <div className="space-y-2 bg-muted/20 rounded-xl p-3 border">
                        <div className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider flex items-center gap-1">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                          Admin Audit & Action Plan
                        </div>

                        {req.exceededDays > 0 ? (
                          <div className="space-y-1.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-900">
                            <div className="font-bold">⚠️ Leave Quota Exceeded by {req.exceededDays}d (${req.estimatedDeduction})</div>
                            {isPending ? (
                              <div className="flex items-center justify-between pt-1">
                                <span>Apply Salary Cut (${req.estimatedDeduction}):</span>
                                <Switch
                                  checked={currentDeduction}
                                  onCheckedChange={(val) =>
                                    setDeductionMap((prev) => ({ ...prev, [req.id]: val }))
                                  }
                                />
                              </div>
                            ) : (
                              <div>
                                Deduction Status: <b>{req.applyDeduction ? `APPLIED (-$${req.estimatedDeduction})` : "WAIVED (Paid Exception)"}</b>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-[11px] text-emerald-700 font-semibold p-2 bg-white rounded-lg border">
                            ✅ Standard Request — No Payroll Penalty.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Admin Action Bar */}
                    {isPending ? (
                      <div className="pt-3 border-t border-border/50 space-y-2">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                          <Input
                            placeholder="Add Super Admin instructions, allocation notes, or email response..."
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
                          Admin Action Remarks: <span className="font-medium text-foreground">{req.adminRemarks || "Processed by Super Admin Desk."}</span>
                        </div>
                        {req.processedAt && (
                          <div>Processed on: {new Date(req.processedAt).toLocaleString()}</div>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
