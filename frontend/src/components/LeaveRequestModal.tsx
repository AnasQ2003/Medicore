import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarOff, ShieldAlert, CheckCircle2, Send } from "lucide-react";
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
  const [requestType, setRequestType] = useState("Annual Leave");
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
      if (!reason) setReason("Annual personal leave / clinical coverage requested.");
    }
  }, [open]);

  // Quota calculation
  const quota = calculateUserQuota(user?.email || "doctor@medicore.app", currentRole);

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
        applicantName: user?.name || (currentRole === "doctor" ? "Dr. Sarah Khan" : "Medical Staff"),
        applicantEmail: user?.email || (currentRole === "doctor" ? "doctor@medicore.app" : "staff@medicore.app"),
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
      if (onRequestSubmitted) {
        try { onRequestSubmitted(); } catch (e) { console.error(e); }
      }
    } catch (err: any) {
      console.error("Leave submission error:", err);
      toast.error(err?.message || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 text-foreground border-border shadow-elevated">
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
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
                  {user?.name?.[0] || "D"}
                </div>
                <div>
                  <div className="text-sm font-bold">{user?.name || "Dr. Sarah Khan"}</div>
                  <div className="text-xs text-muted-foreground capitalize">{currentRole} • Annual Quota: {quota.annualQuota} Days</div>
                </div>
              </div>
              <Badge variant="outline" className="bg-background font-mono text-xs">
                Status: Pending Admin Review
              </Badge>
            </div>

            {/* Leave Balance Meters */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="bg-background rounded-xl p-2.5 border text-center">
                <div className="text-[10px] uppercase font-bold text-muted-foreground">Annual Quota</div>
                <div className="text-lg font-extrabold text-blue-600 dark:text-blue-400">{quota.annualQuota}d</div>
              </div>
              <div className="bg-background rounded-xl p-2.5 border text-center">
                <div className="text-[10px] uppercase font-bold text-muted-foreground">Used Days</div>
                <div className="text-lg font-extrabold text-amber-600 dark:text-amber-400">{quota.usedDays}d</div>
              </div>
              <div className="bg-background rounded-xl p-2.5 border text-center">
                <div className="text-[10px] uppercase font-bold text-muted-foreground">Remaining Paid</div>
                <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{quota.remainingDays}d</div>
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
              onChange={(e) => setRequestType(e.target.value)}
              className="mt-1.5 w-full h-10 rounded-xl border border-input bg-background px-3 text-sm font-medium focus:ring-2 focus:ring-primary text-foreground"
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
              className="mt-1.5 w-full rounded-xl border border-input bg-background p-3 text-sm focus:ring-2 focus:ring-primary text-foreground"
            />
          </div>

          {/* Patient Cancellation Checkbox */}
          {(currentRole === "doctor" || currentRole === "nurse" || currentRole === "receptionist") && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
              <Checkbox
                id="cancelAppts"
                checked={cancelAppointments}
                onCheckedChange={(c) => setCancelAppointments(!!c)}
                className="mt-0.5"
              />
              <div className="text-xs">
                <label htmlFor="cancelAppts" className="font-bold text-amber-900 dark:text-amber-200 cursor-pointer">
                  Automatically cancel impacted patient consultations during this period ({Math.floor(requestedDays * 2.5)} estimated)
                </label>
                <p className="text-amber-700 dark:text-amber-400 mt-0.5">
                  Sends automated notification emails to affected patients if Super Admin approves this request.
                </p>
              </div>
            </div>
          )}

          {/* Quota Exceeded Warning Box */}
          {exceededDays > 0 ? (
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200">
              <ShieldAlert className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <div className="font-bold text-rose-800 dark:text-rose-300">
                  ⚠️ Leave Quota Exceeded by {exceededDays} Day(s)!
                </div>
                <div>
                  Your requested duration of <b>{requestedDays} days</b> exceeds your remaining paid leave balance of <b>{quota.remainingDays} days</b>.
                </div>
                <div className="font-semibold text-rose-700 dark:text-rose-400">
                  Estimated Salary Deduction: ${estimatedDeduction} (${50}/day extra). Admin will review whether to apply or waive deduction.
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
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
