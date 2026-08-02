import type { Role } from "./auth";
import { toast } from "sonner";

export interface LeaveRequest {
  id: string;
  applicantName: string;
  applicantEmail: string;
  applicantRole: Role;
  department: string;
  requestType: "Annual Leave" | "Sick Leave" | "Emergency Leave" | "Shift Exception" | "Schedule Change" | "Appointment Cancellation";
  fromDate: string; // YYYY-MM-DD
  fromTime?: string; // HH:mm
  toDate: string; // YYYY-MM-DD
  toTime?: string; // HH:mm
  totalDays: number;
  reason: string;
  cancelImpactedAppointments?: boolean;
  impactedCount?: number;

  // Quota & Salary Deduction Logic
  annualQuota: number;
  usedDaysBefore: number;
  remainingDaysBefore: number;
  exceededDays: number;
  estimatedDeduction: number; // exceededDays * $50
  applyDeduction: boolean; // Set by Admin upon approval

  status: "Pending" | "Approved" | "Rejected" | "Cancelled";
  adminRemarks?: string;
  createdAt: string;
  processedAt?: string;
}

const STORAGE_KEY = "medicore_shared_leave_requests";

const defaultQuotaByRole: Record<Role, number> = {
  doctor: 21,
  nurse: 18,
  receptionist: 14,
  patient: 10,
  "super-admin": 30,
};

const initialSeedRequests: LeaveRequest[] = [
  {
    id: "LV-1001",
    applicantName: "Dr. Sarah Khan",
    applicantEmail: "doctor@medicore.app",
    applicantRole: "doctor",
    department: "Cardiology",
    requestType: "Emergency Leave",
    fromDate: "2026-08-05",
    fromTime: "08:00",
    toDate: "2026-08-08",
    toTime: "18:00",
    totalDays: 4,
    reason: "Attending international cardiology conference presentation.",
    cancelImpactedAppointments: true,
    impactedCount: 6,
    annualQuota: 21,
    usedDaysBefore: 19,
    remainingDaysBefore: 2,
    exceededDays: 2,
    estimatedDeduction: 100,
    applyDeduction: true,
    status: "Pending",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: "LV-1002",
    applicantName: "Nurse Maryam",
    applicantEmail: "nurse@medicore.app",
    applicantRole: "nurse",
    department: "ICU Ward",
    requestType: "Sick Leave",
    fromDate: "2026-08-01",
    fromTime: "07:00",
    toDate: "2026-08-02",
    toTime: "19:00",
    totalDays: 2,
    reason: "Severe viral flu and fever.",
    cancelImpactedAppointments: false,
    impactedCount: 0,
    annualQuota: 18,
    usedDaysBefore: 8,
    remainingDaysBefore: 10,
    exceededDays: 0,
    estimatedDeduction: 0,
    applyDeduction: false,
    status: "Approved",
    adminRemarks: "Approved. Emergency nurse sub assigned.",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    processedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "LV-1003",
    applicantName: "Zainab Reception",
    applicantEmail: "receptionist@medicore.app",
    applicantRole: "receptionist",
    department: "Front Desk & Billing",
    requestType: "Annual Leave",
    fromDate: "2026-08-15",
    fromTime: "09:00",
    toDate: "2026-08-20",
    toTime: "17:00",
    totalDays: 6,
    reason: "Family vacation trip.",
    cancelImpactedAppointments: false,
    impactedCount: 0,
    annualQuota: 14,
    usedDaysBefore: 12,
    remainingDaysBefore: 2,
    exceededDays: 4,
    estimatedDeduction: 200,
    applyDeduction: true,
    status: "Pending",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "LV-1004",
    applicantName: "Ahmed Ali (Patient)",
    applicantEmail: "patient@medicore.app",
    applicantRole: "patient",
    department: "OPD Patient Care",
    requestType: "Appointment Cancellation",
    fromDate: "2026-08-10",
    fromTime: "10:00",
    toDate: "2026-08-10",
    toTime: "12:00",
    totalDays: 1,
    reason: "Out of town for business meeting. Need appointment reschedule.",
    cancelImpactedAppointments: true,
    impactedCount: 1,
    annualQuota: 10,
    usedDaysBefore: 2,
    remainingDaysBefore: 8,
    exceededDays: 0,
    estimatedDeduction: 0,
    applyDeduction: false,
    status: "Approved",
    adminRemarks: "Rescheduled OPD slot with Dr. Sarah Khan.",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    processedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export function getLeaveRequests(): LeaveRequest[] {
  if (typeof window === "undefined") return initialSeedRequests;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSeedRequests));
  return initialSeedRequests;
}

export function saveLeaveRequests(requests: LeaveRequest[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    // Trigger custom window event so open pages update live
    window.dispatchEvent(new Event("medicore_leave_requests_updated"));
  }
}

export function calculateUserQuota(userEmail: string, role: Role) {
  const all = getLeaveRequests();
  const userApproved = all.filter(
    (r) => r.applicantEmail === userEmail && r.status === "Approved"
  );
  const usedDays = userApproved.reduce((sum, r) => sum + r.totalDays, 0);
  const annualQuota = defaultQuotaByRole[role] || 15;
  const remainingDays = Math.max(0, annualQuota - usedDays);
  return { annualQuota, usedDays, remainingDays };
}

export function dispatchEmailNotification(
  recipientEmail: string,
  title: string,
  body: string
) {
  if (typeof window === "undefined") return;
  try {
    const key = `medicore_user_notifications_${recipientEmail}`;
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    const notif = {
      id: `email-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: "leave",
      title,
      body,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      unread: true,
      emailSent: true,
    };
    localStorage.setItem(key, JSON.stringify([notif, ...existing]));
  } catch (e) {
    console.error("Failed to dispatch notification email", e);
  }
}

export function submitLeaveRequest(data: {
  applicantName: string;
  applicantEmail: string;
  applicantRole: Role;
  department: string;
  requestType: LeaveRequest["requestType"];
  fromDate: string;
  fromTime?: string;
  toDate: string;
  toTime?: string;
  reason: string;
  cancelImpactedAppointments?: boolean;
  impactedCount?: number;
}): LeaveRequest {
  const all = getLeaveRequests();
  const { annualQuota, usedDays, remainingDays } = calculateUserQuota(
    data.applicantEmail,
    data.applicantRole
  );

  // Calculate days difference
  const da = new Date(data.fromDate).getTime();
  const db = new Date(data.toDate).getTime();
  const totalDays = Math.max(1, Math.round((db - da) / (1000 * 60 * 60 * 24)) + 1);

  const exceededDays = Math.max(0, totalDays - remainingDays);
  const estimatedDeduction = exceededDays * 50;

  const newReq: LeaveRequest = {
    id: `LV-${Math.floor(1000 + Math.random() * 9000)}`,
    applicantName: data.applicantName,
    applicantEmail: data.applicantEmail,
    applicantRole: data.applicantRole,
    department: data.department,
    requestType: data.requestType,
    fromDate: data.fromDate,
    fromTime: data.fromTime || "09:00",
    toDate: data.toDate,
    toTime: data.toTime || "17:00",
    totalDays,
    reason: data.reason,
    cancelImpactedAppointments: data.cancelImpactedAppointments || false,
    impactedCount: data.impactedCount || 0,
    annualQuota,
    usedDaysBefore: usedDays,
    remainingDaysBefore: remainingDays,
    exceededDays,
    estimatedDeduction,
    applyDeduction: exceededDays > 0,
    status: "Pending",
    createdAt: new Date().toISOString(),
  };

  const updated = [newReq, ...all];
  saveLeaveRequests(updated);

  // Dispatch Email Notification to Super Admin
  dispatchEmailNotification(
    "admin@medicore.app",
    `New Leave Request: ${data.applicantName} (${data.applicantRole.toUpperCase()})`,
    `A new leave application (${newReq.id}) has been submitted by ${data.applicantName} for ${data.fromDate} to ${data.toDate} (${totalDays} day/s). Quota Exceeded: ${exceededDays} days. Requires Super Admin approval.`
  );

  // Dispatch Email Confirmation to Applicant
  dispatchEmailNotification(
    data.applicantEmail,
    `Leave Application Submitted: ${newReq.id}`,
    `Your request for ${data.requestType} (${data.fromDate} ${data.fromTime || ""} to ${data.toDate} ${data.toTime || ""}) has been submitted and is currently PENDING Super Admin review. ${
      exceededDays > 0
        ? `Note: Request exceeds your remaining quota by ${exceededDays} day(s). Estimated salary deduction: $${estimatedDeduction}.`
        : ""
    }`
  );

  toast.success(`Leave request ${newReq.id} submitted!`, {
    description: "Sent to Super Admin for approval. Email notifications dispatched.",
  });

  return newReq;
}

export function updateLeaveRequestStatus(
  requestId: string,
  status: "Approved" | "Rejected",
  adminRemarks: string,
  applyDeduction: boolean
) {
  const all = getLeaveRequests();
  let targetReq: LeaveRequest | null = null;

  const updated = all.map((r) => {
    if (r.id === requestId) {
      targetReq = {
        ...r,
        status,
        adminRemarks,
        applyDeduction,
        processedAt: new Date().toISOString(),
      };
      return targetReq;
    }
    return r;
  });

  if (!targetReq) return;
  const req = targetReq as LeaveRequest;

  saveLeaveRequests(updated);

  // Dispatch Email Notification to Applicant
  const deductionMessage = req.exceededDays > 0
    ? (applyDeduction
        ? `An excess leave deduction of $${req.estimatedDeduction} (${req.exceededDays} days @ $50/day) has been applied to your monthly payroll.`
        : `Super Admin has WAIVED your excess leave deduction ($${req.estimatedDeduction} value granted as special paid leave).`)
    : "No salary deduction applied (within annual paid leave quota).";

  dispatchEmailNotification(
    req.applicantEmail,
    `Leave Application ${req.id} ${status.toUpperCase()} by Super Admin`,
    `Hello ${req.applicantName}, your leave request (${req.id}) for ${req.fromDate} to ${req.toDate} has been ${status.toUpperCase()} by Super Admin.\n\nAdmin Remarks: "${adminRemarks || "No remarks provided."}"\nSalary Deduction Status: ${deductionMessage}`
  );

  // Dispatch Email Notification to Admin confirmation log
  dispatchEmailNotification(
    "admin@medicore.app",
    `Leave Decision Log: ${req.id} ${status}`,
    `Super Admin ${status.toLowerCase()} leave request ${req.id} for ${req.applicantName}. Deduction status: ${applyDeduction ? `Applied ($${req.estimatedDeduction})` : "Waived/None"}.`
  );

  toast.success(`Request ${req.id} ${status}!`, {
    description: `Email alert sent to ${req.applicantName} (${req.applicantEmail}).`,
  });
}
