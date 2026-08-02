import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, CalendarOff, Clock, ShieldAlert, FileText, CheckCircle2, User, Send } from "lucide-react";
import { getUser, type Role } from "@/lib/auth";
import { submitLeaveRequest, calculateUserQuota } from "@/lib/leaveStore";
import { toast } from "sonner";

interface LeaveRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: Role;
  onRequestSubmitted?: () => void;
}

export function LeaveRequestModal({
  open,
  onOpenChange,
  role,
  onRequestSubmitted,
}: LeaveRequestModalProps) {
  const user = getUser();
  const currentRole: Role = role || user?.role || "doctor";

  const [fromDate, setFromDate] = useState("");
  const [fromTime, setFromTime] = useState("08:00");
  const [toDate, setToDate] = useState("");
  const [toTime, setToTime] = useState("17:00");
  const [requestType, setRequestType] = useState<
    "Annual Leave" | "Sick Leave" | "Emergency Leave" | "Shift Exception" | "Schedule Change" | "Appointment Cancellation"
  >("Casual Leave" as any);
  const [reason, setReason] = useState("");
  const [cancelAppointments, setCancelAppointments] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Set default dates on open
  useEffect(() => {
    if (open) {
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
      const threeDaysLater = new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0];
      setFromDate(tomorrow);
      setToDate(threeDaysLater);
      setRequestType("Annual Leave");
    }
  }, [open]);

  // Quota calculation
  const quota = calculateUserQuota(user?.email || "user@medicore.app", currentRole);

  const calculateDays = () => {
    if (!fromDate || !toDate) return 1;
    const da = new Date(fromDate).getTime();
    const db = new Date(toDate).getTime();
    if (isNaN(da) || isNaN(db) || db < da) return 1;
    return Math.max(1, Math.round((db - da) / (1000 * 60 * 60 * 24)) + 1);
  };

  const requestedDays = calculateDays();
  const exceededDays = Math.max(0, requestedDays - quota.remainingDays);
  const estimatedDeduction = exceededDays * 50;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate) return toast.error("Please select valid From and To dates.");
    if (!reason.trim()) return toast.error("Please enter a reason or description for this request.");
    if (fromDate > toDate) return toast.error("From date must be on or before To date.");

    setSubmitting(true);
    try {
      submitLeaveRequest({
        applicantName: user?.name || "Medical Staff",
        applicantEmail: user?.email || "staff@medicore.app",
        applicantRole: currentRole,
        department: currentRole === "doctor" ? "Cardiology" : currentRole === "nurse" ? "Ward Care" : "Administration",
        category: "Leave & Schedule",
        requestType,
        fromDate,
        fromTime,
        toDate,
        toTime,
        reason: reason.trim(),
        cancelImpactedAppointments: cancelAppointments,
        impactedCount: cancelAppointments ? Math.floor(requestedDays * 2.5) : 0,
      });

      onOpenChange(false);
      setReason("");
      if (onRequestSubmitted) onRequestSubmitted();
    } catch (err) {
      toast.error("Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl border-border/80 shadow-elevated">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <CalendarOff className="h-6 w-6 text-primary" />
            Apply for Leave & Schedule Exception
          </DialogTitle>
          <DialogDescription>
            All leave and schedule exception requests are sent to Super Admin for approval and email dispatch.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* User & Leave Quota Summary Card */}
          <div className="rounded-2xl border bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
                  {user?.name?.[0] || "U"}
                </div>
                <div>
                  <div className="text-sm font-bold">{user?.name || "Staff Member"}</div>
                  <div className="text-xs text-muted-foreground capitalize">{currentRole} • Annual Quota: {quota.annualQuota} Days</div>
                </div>
              </div>
              <Badge variant="outline" className="bg-white/80 font-mono text-xs">
                Status: Pending Admin Review
              </Badge>
            </div>

            {/* Leave Balance Meters */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="bg-white/90 rounded-xl p-2.5 border text-center">
                <div className="text-[10px] uppercase font-bold text-muted-foreground">Annual Quota</div>
                <div className="text-lg font-extrabold text-blue-600">{quota.annualQuota}d</div>
              </div>
              <div className="bg-white/90 rounded-xl p-2.5 border text-center">
                <div className="text-[10px] uppercase font-bold text-muted-foreground">Used Days</div>
                <div className="text-lg font-extrabold text-amber-600">{quota.usedDays}d</div>
              </div>
              <div className="bg-white/90 rounded-xl p-2.5 border text-center">
                <div className="text-[10px] uppercase font-bold text-muted-foreground">Remaining Paid</div>
                <div className="text-lg font-extrabold text-emerald-600">{quota.remainingDays}d</div>
              </div>
            </div>
          </div>

          {/* Form Inputs: Dates & Times */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">From Date & Start Time</Label>
              <div className="flex gap-2 mt-1.5">
                <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required className="text-xs" />
                <Input type="time" value={fromTime} onChange={(e) => setFromTime(e.target.value)} className="w-28 text-xs" />
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold">To Date & End Time</Label>
              <div className="flex gap-2 mt-1.5">
                <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} required className="text-xs" />
                <Input type="time" value={toTime} onChange={(e) => setToTime(e.target.value)} className="w-28 text-xs" />
              </div>
            </div>
          </div>

          {/* Request Type Selection */}
          <div>
            <Label className="text-xs font-semibold">Request Type</Label>
            <select
              value={requestType}
              onChange={(e) => setRequestType(e.target.value as any)}
              className="mt-1.5 w-full h-10 rounded-xl border bg-background px-3 text-sm font-medium focus:ring-2 focus:ring-primary"
            >
              <option value="Annual Leave">Annual Leave</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Emergency Leave">Emergency Leave</option>
              <option value="Shift Exception">Shift Exception / Swap</option>
              <option value="Schedule Change">Schedule Change Request</option>
              <option value="Appointment Cancellation">Emergency Appointment Cancellation</option>
            </select>
          </div>

          {/* Reason / Description */}
          <div>
            <Label className="text-xs font-semibold">Reason & Description for Admin</Label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide clear details for your leave or exception request..."
              rows={3}
              required
              className="mt-1.5 w-full rounded-xl border bg-background p-3 text-sm focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Patient Cancellation Checkbox (for Doctors/Nurses/Staff) */}
          {(currentRole === "doctor" || currentRole === "nurse" || currentRole === "receptionist") && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200">
              <Checkbox
                id="cancelAppts"
                checked={cancelAppointments}
                onCheckedChange={(c) => setCancelAppointments(!!c)}
                className="mt-0.5"
              />
              <div className="text-xs">
                <label htmlFor="cancelAppts" className="font-bold text-amber-900 cursor-pointer">
                  Automatically cancel impacted patient consultations during this period ({Math.floor(requestedDays * 2.5)} estimated)
                </label>
                <p className="text-amber-700 mt-0.5">
                  Sends automated notification emails to affected patients if Super Admin approves this request.
                </p>
              </div>
            </div>
          )}

          {/* Quota Exceeded Warning Box */}
          {exceededDays > 0 ? (
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 animate-pulse">
              <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <div className="font-bold text-rose-800">
                  ⚠️ Leave Quota Exceeded by {exceededDays} Day(s)!
                </div>
                <div>
                  Your requested duration of <b>{requestedDays} days</b> exceeds your remaining paid leave balance of <b>{quota.remainingDays} days</b>.
                </div>
                <div className="font-semibold text-rose-700">
                  Estimated Salary Deduction: ${estimatedDeduction} (${50}/day extra). Admin will review whether to apply or waive deduction.
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                <b>Within Paid Leave Quota:</b> Request of {requestedDays} day(s) is covered by your {quota.remainingDays} remaining paid days.
              </span>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="bg-gradient-primary text-white font-semibold">
              <Send className="h-4 w-4 mr-2" />
              {submitting ? "Submitting..." : "Submit to Admin"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
