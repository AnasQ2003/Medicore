import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Bed, ShieldAlert, FileText, Send, UserCheck, Stethoscope,
  HeartPulse, Receipt, AlertCircle, CalendarOff, PackagePlus, AlertTriangle
} from "lucide-react";
import { getUser, type Role } from "@/lib/auth";
import { submitUniversalRequest, calculateUserQuota, type RequestCategory, type RequestPriority } from "@/lib/leaveStore";
import { toast } from "sonner";

interface RoleRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: Role;
  defaultCategory?: RequestCategory;
  onRequestSubmitted?: () => void;
}

export function RoleRequestModal({
  open,
  onOpenChange,
  role,
  defaultCategory,
  onRequestSubmitted,
}: RoleRequestModalProps) {
  const user = getUser();
  const currentRole: Role = role || user?.role || "nurse";

  const [category, setCategory] = useState<RequestCategory>("Equipment & Furniture");
  const [requestType, setRequestType] = useState("");
  const [priority, setPriority] = useState<RequestPriority>("Normal");
  const [reason, setReason] = useState("");

  // Specific role inputs
  const [requestedItems, setRequestedItems] = useState("");
  const [quantity, setQuantity] = useState(5);
  const [targetDoctor, setTargetDoctor] = useState("Dr. Sarah Khan (Cardiology)");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [cancelAppointments, setCancelAppointments] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Set default values based on role & category when opened
  useEffect(() => {
    if (open) {
      if (currentRole === "nurse") {
        setCategory("Equipment & Furniture");
        setRequestType("Extra ICU Beds & Oxygen Equipment Demand");
        setRequestedItems("5 Adjustable ICU Beds, 3 Oxygen Tanks, 2 Cardiac Monitors");
        setPriority("Emergency");
      } else if (currentRole === "patient") {
        setCategory("Doctor Change & Care");
        setRequestType("Attending Doctor Re-assignment Request");
        setTargetDoctor("Dr. Sarah Khan (Cardiology)");
        setPriority("High");
      } else if (currentRole === "receptionist") {
        setCategory("Front Desk & Queue");
        setRequestType("Emergency Patient Billing Waiver / Clearance Override");
        setRequestedItems("Emergency OPD Registration Deposit Waiver");
        setPriority("High");
      } else {
        setCategory("Leave & Schedule");
        setRequestType("Annual Leave");
        setPriority("Normal");
      }

      const tmrw = new Date(Date.now() + 86400000).toISOString().split("T")[0];
      const threeDaysLater = new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0];
      setFromDate(tmrw);
      setToDate(threeDaysLater);
    }
  }, [open, currentRole]);

  const quota = calculateUserQuota(user?.email || "staff@medicore.app", currentRole);

  const calculateDays = () => {
    if (!fromDate || !toDate) return 1;
    const da = new Date(fromDate).getTime();
    const db = new Date(toDate).getTime();
    if (isNaN(da) || isNaN(db) || db < da) return 1;
    return Math.max(1, Math.round((db - da) / (1000 * 60 * 60 * 24)) + 1);
  };

  const requestedDays = calculateDays();
  const exceededDays = category === "Leave & Schedule" ? Math.max(0, requestedDays - quota.remainingDays) : 0;
  const estimatedDeduction = exceededDays * 50;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return toast.error("Please enter a detailed description for Admin.");

    setSubmitting(true);
    try {
      submitUniversalRequest({
        applicantName: user?.name || `${currentRole.toUpperCase()} Member`,
        applicantEmail: user?.email || `${currentRole}@medicore.app`,
        applicantRole: currentRole,
        department: currentRole === "nurse" ? "Emergency ICU Ward" : currentRole === "doctor" ? "Cardiology" : currentRole === "receptionist" ? "Front Desk" : "Patient Care",
        category,
        requestType: requestType || "General Request",
        priority,
        fromDate: category === "Leave & Schedule" ? fromDate : undefined,
        toDate: category === "Leave & Schedule" ? toDate : undefined,
        reason: reason.trim(),
        requestedItems: category === "Equipment & Furniture" || category === "Front Desk & Queue" ? requestedItems : undefined,
        quantity: category === "Equipment & Furniture" ? Number(quantity) : undefined,
        targetDoctor: category === "Doctor Change & Care" ? targetDoctor : undefined,
        cancelImpactedAppointments: cancelAppointments,
        impactedCount: cancelAppointments && currentRole === "doctor" ? Math.floor(requestedDays * 2.5) : 0,
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
            {currentRole === "nurse" ? (
              <Bed className="h-6 w-6 text-rose-500" />
            ) : currentRole === "patient" ? (
              <UserCheck className="h-6 w-6 text-amber-500" />
            ) : currentRole === "receptionist" ? (
              <Receipt className="h-6 w-6 text-emerald-500" />
            ) : (
              <CalendarOff className="h-6 w-6 text-primary" />
            )}
            Super Admin Request & Exception Desk
          </DialogTitle>
          <DialogDescription>
            Submit official requests, furniture demands, doctor changes, or exceptions to Super Admin with email dispatches.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Role Header Banner */}
          <div className="rounded-2xl border bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold">
                {user?.name?.[0] || "U"}
              </div>
              <div>
                <div className="text-sm font-bold">{user?.name || "User"}</div>
                <div className="text-xs text-muted-foreground capitalize">Role: {currentRole} • Department: {user?.email}</div>
              </div>
            </div>
            <Badge variant="outline" className="bg-white/90 font-mono text-xs">
              Direct Admin Channel
            </Badge>
          </div>

          {/* Category & Priority selector */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Request Category</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as RequestCategory)}
                className="mt-1.5 w-full h-10 rounded-xl border bg-background px-3 text-xs font-medium focus:ring-2 focus:ring-primary"
              >
                <option value="Equipment & Furniture">Equipment & Furniture Demand</option>
                <option value="Doctor Change & Care">Doctor Change / Care Request</option>
                <option value="Front Desk & Queue">Front Desk / Billing Override</option>
                <option value="Facility & Accessibility">Facility & Room Upgrade</option>
                <option value="Leave & Schedule">Leave & Absence Application</option>
              </select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Priority Urgency Level</Label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as RequestPriority)}
                className="mt-1.5 w-full h-10 rounded-xl border bg-background px-3 text-xs font-medium focus:ring-2 focus:ring-primary"
              >
                <option value="Normal">Normal Priority</option>
                <option value="High">High Urgency</option>
                <option value="Emergency">🚨 Emergency Alert</option>
              </select>
            </div>
          </div>

          {/* Dynamic Role Inputs */}
          {category === "Equipment & Furniture" && (
            <div className="space-y-3 p-3.5 rounded-xl bg-rose-50/70 border border-rose-200">
              <div className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                <Bed className="h-4 w-4 text-rose-600" />
                Equipment & Furniture Demand Details
              </div>
              <div>
                <Label className="text-xs font-medium text-rose-900">Requested Items & Units</Label>
                <Input
                  value={requestedItems}
                  onChange={(e) => setRequestedItems(e.target.value)}
                  placeholder="e.g. 5 Extra Beds, 2 Oxygen Tanks, 3 Cardiac Monitors..."
                  className="mt-1 bg-white text-xs"
                />
              </div>
            </div>
          )}

          {category === "Doctor Change & Care" && (
            <div className="space-y-3 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
              <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Stethoscope className="h-4 w-4 text-amber-600" />
                Doctor Re-assignment Preference
              </div>
              <div>
                <Label className="text-xs font-medium text-amber-900">Target Preferred Doctor / Specialist</Label>
                <select
                  value={targetDoctor}
                  onChange={(e) => setTargetDoctor(e.target.value)}
                  className="mt-1 w-full h-9 rounded-lg border bg-white px-3 text-xs"
                >
                  <option value="Dr. Sarah Khan (Cardiology Head)">Dr. Sarah Khan (Cardiology Head)</option>
                  <option value="Dr. Ahmed Hassan (Internal Medicine)">Dr. Ahmed Hassan (Internal Medicine)</option>
                  <option value="Dr. Fatima Ali (Neurology)">Dr. Fatima Ali (Neurology)</option>
                  <option value="Dr. Usman Tariq (Pediatrics)">Dr. Usman Tariq (Pediatrics)</option>
                </select>
              </div>
            </div>
          )}

          {category === "Front Desk & Queue" && (
            <div className="space-y-3 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <Receipt className="h-4 w-4 text-emerald-600" />
                Front Desk & Billing Clearance Override
              </div>
              <div>
                <Label className="text-xs font-medium text-emerald-900">Override Details / Waiver Requested</Label>
                <Input
                  value={requestedItems}
                  onChange={(e) => setRequestedItems(e.target.value)}
                  placeholder="e.g. Emergency Admission Deposit Waiver for Patient Ahmed Ali..."
                  className="mt-1 bg-white text-xs"
                />
              </div>
            </div>
          )}

          {category === "Leave & Schedule" && (
            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold">From Date</Label>
                  <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required className="mt-1 text-xs" />
                </div>
                <div>
                  <Label className="text-xs font-semibold">To Date</Label>
                  <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} required className="mt-1 text-xs" />
                </div>
              </div>

              {exceededDays > 0 ? (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                  <div className="font-bold">⚠️ Leave Quota Exceeded by {exceededDays} Day(s)!</div>
                  <div>Remaining Paid Balance: {quota.remainingDays} days. Requested: {requestedDays} days.</div>
                  <div className="font-semibold text-rose-700">Estimated Salary Deduction: ${estimatedDeduction} ($50/day). Subject to Admin approval.</div>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold">
                  ✅ Covered within paid annual quota ({quota.remainingDays} days remaining).
                </div>
              )}
            </div>
          )}

          {/* Description & Justification */}
          <div>
            <Label className="text-xs font-semibold">Detailed Description & Reason for Super Admin</Label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={`Provide clear justification for this ${category} request...`}
              rows={3}
              required
              className="mt-1.5 w-full rounded-xl border bg-background p-3 text-xs focus:ring-2 focus:ring-primary"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="bg-gradient-primary text-white font-semibold text-xs">
              <Send className="h-4 w-4 mr-2" />
              {submitting ? "Submitting..." : "Send Request & Dispatch Email"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
