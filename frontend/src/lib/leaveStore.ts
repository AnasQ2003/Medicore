import type { Role } from "./auth";
import { toast } from "sonner";

export type RequestCategory =
  | "Leave & Schedule"
  | "Equipment & Furniture"
  | "Doctor Change & Care"
  | "Facility & Accessibility"
  | "Billing & Clearance"
  | "Front Desk & Queue";

export type RequestPriority = "Normal" | "High" | "Emergency";

export interface LeaveRequest {
  id: string;
  applicantName: string;
  applicantEmail: string;
  applicantRole: Role;
  department: string;
  category: RequestCategory;
  requestType: string;
  priority: RequestPriority;
  fromDate?: string;
  fromTime?: string;
  toDate?: string;
  toTime?: string;
  totalDays: number;
  reason: string;

  // Role-specific fields
  requestedItems?: string; // e.g., "5 Extra ICU Beds, 2 Oxygen Cylinders"
  quantity?: number;
  targetDoctor?: string; // e.g. for patient doctor change
  cancelImpactedAppointments?: boolean;
  impactedCount?: number;

  // Quota & Salary Deduction Logic (for Leave requests)
  annualQuota: number;
  usedDaysBefore: number;
  remainingDaysBefore: number;
  exceededDays: number;
  estimatedDeduction: number;
  applyDeduction: boolean;

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
  // 1. Nurse Equipment Demand Request
  {
    id: "REQ-2001",
    applicantName: "Nurse Maryam",
    applicantEmail: "nurse@medicore.app",
    applicantRole: "nurse",
    department: "Emergency & ICU Ward",
    category: "Equipment & Furniture",
    requestType: "Hospital Bed & Equipment Demand",
    priority: "Emergency",
    totalDays: 0,
    reason: "Sudden influx of 8 emergency respiratory patients. Urgent demand for extra ICU beds, oxygen tanks, and vitals monitors.",
    requestedItems: "5 Adjustable Electric Beds, 4 Oxygen Tanks, 3 Cardiac Monitors",
    quantity: 12,
    annualQuota: 18,
    usedDaysBefore: 8,
    remainingDaysBefore: 10,
    exceededDays: 0,
    estimatedDeduction: 0,
    applyDeduction: false,
    status: "Pending",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },

  // 2. Patient Doctor Change & Care Request
  {
    id: "REQ-2002",
    applicantName: "Ahmed Ali (Patient)",
    applicantEmail: "patient@medicore.app",
    applicantRole: "patient",
    department: "OPD Cardiology",
    category: "Doctor Change & Care",
    requestType: "Attending Doctor Re-assignment",
    priority: "High",
    totalDays: 0,
    reason: "Current consultant is out of town. Requesting transfer of care to Dr. Sarah Khan for cardiology follow-up.",
    targetDoctor: "Dr. Sarah Khan (Cardiology Head)",
    annualQuota: 10,
    usedDaysBefore: 2,
    remainingDaysBefore: 8,
    exceededDays: 0,
    estimatedDeduction: 0,
    applyDeduction: false,
    status: "Pending",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },

  // 3. Receptionist Front Desk Override Request
  {
    id: "REQ-2003",
    applicantName: "Zainab Reception",
    applicantEmail: "receptionist@medicore.app",
    applicantRole: "receptionist",
    department: "Front Desk & Billing",
    category: "Front Desk & Queue",
    requestType: "Urgent Patient Billing Clearance Override",
    priority: "High",
    totalDays: 0,
    reason: "Emergency accident patient admitted without immediate cash deposit. Requesting Super Admin approval for immediate treatment clearance.",
    requestedItems: "Emergency Admission Fee Waiver / Credit Authorization",
    annualQuota: 14,
    usedDaysBefore: 12,
    remainingDaysBefore: 2,
    exceededDays: 0,
    estimatedDeduction: 0,
    applyDeduction: false,
    status: "Pending",
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },

  // 4. Doctor Leave Request
  {
    id: "LV-1001",
    applicantName: "Dr. Sarah Khan",
    applicantEmail: "doctor@medicore.app",
    applicantRole: "doctor",
    department: "Cardiology",
    category: "Leave & Schedule",
    requestType: "Emergency Leave",
    priority: "High",
    fromDate: "2026-08-05",
    fromTime: "08:00",
    toDate: "2026-08-08",
    toTime: "18:00",
    totalDays: 4,
    reason: "Attending international cardiology conference presentation in Geneva.",
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

  // 5. Nurse Sick Leave (Approved)
  {
    id: "LV-1002",
    applicantName: "Nurse Maryam",
    applicantEmail: "nurse@medicore.app",
    applicantRole: "nurse",
    department: "ICU Ward",
    category: "Leave & Schedule",
    requestType: "Sick Leave",
    priority: "Normal",
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
];

export function getLeaveRequests(): LeaveRequest[] {
  if (typeof window === "undefined") return initialSeedRequests;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSeedRequests));
  return initialSeedRequests;
}

export function saveLeaveRequests(requests: LeaveRequest[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    window.dispatchEvent(new Event("medicore_leave_requests_updated"));
  }
}

export function submitFeeIncreaseRequest(data: {
  doctorName: string;
  doctorEmail: string;
  currentFee: number;
  requestedFee: number;
  reason: string;
}): LeaveRequest {
  const request: LeaveRequest = {
    id: `REQ-FEE-${Date.now()}`,
    applicantName: data.doctorName,
    applicantEmail: data.doctorEmail,
    applicantRole: "doctor",
    department: "Clinical Consultation",
    category: "Billing & Clearance",
    requestType: `Consultation Fee Revision (PKR ${data.currentFee} ➔ PKR ${data.requestedFee})`,
    priority: "Normal",
    totalDays: 0,
    reason: `Requested consultation fee increase from PKR ${data.currentFee} to PKR ${data.requestedFee}. Reason: ${data.reason}`,
    annualQuota: 12,
    usedDaysBefore: 0,
    remainingDaysBefore: 12,
    exceededDays: 0,
    estimatedDeduction: 0,
    applyDeduction: false,
    status: "Pending",
    createdAt: new Date().toISOString(),
  };

  const requests = getLeaveRequests();
  requests.unshift(request);
  saveLeaveRequests(requests);

  // Email notifications
  dispatchEmailNotification(
    "admin@medicore.app",
    `💰 Fee Revision Request: ${data.doctorName}`,
    `${data.doctorName} requested consultation fee increase to PKR ${data.requestedFee}. Status: PENDING Admin Approval.`
  );

  return request;
}

export function calculateUserQuota(userEmail: string, role: Role) {
  const all = getLeaveRequests();
  const userApproved = all.filter(
    (r) => r.applicantEmail === userEmail && r.status === "Approved" && r.category === "Leave & Schedule"
  );
  const usedDays = userApproved.reduce((sum, r) => sum + (r.totalDays || 0), 0);
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

export function submitUniversalRequest(data: {
  applicantName: string;
  applicantEmail: string;
  applicantRole: Role;
  department: string;
  category: RequestCategory;
  requestType: string;
  priority?: RequestPriority;
  fromDate?: string;
  fromTime?: string;
  toDate?: string;
  toTime?: string;
  reason: string;
  requestedItems?: string;
  quantity?: number;
  targetDoctor?: string;
  cancelImpactedAppointments?: boolean;
  impactedCount?: number;
}): LeaveRequest {
  const all = getLeaveRequests();
  const { annualQuota, usedDays, remainingDays } = calculateUserQuota(
    data.applicantEmail,
    data.applicantRole
  );

  let totalDays = 0;
  if (data.fromDate && data.toDate) {
    const da = new Date(data.fromDate).getTime();
    const db = new Date(data.toDate).getTime();
    totalDays = Math.max(1, Math.round((db - da) / (1000 * 60 * 60 * 24)) + 1);
  }

  const exceededDays = data.category === "Leave & Schedule" ? Math.max(0, totalDays - remainingDays) : 0;
  const estimatedDeduction = exceededDays * 50;

  const newReq: LeaveRequest = {
    id: `REQ-${Math.floor(2000 + Math.random() * 8000)}`,
    applicantName: data.applicantName,
    applicantEmail: data.applicantEmail,
    applicantRole: data.applicantRole,
    department: data.department,
    category: data.category,
    requestType: data.requestType,
    priority: data.priority || "Normal",
    fromDate: data.fromDate,
    fromTime: data.fromTime,
    toDate: data.toDate,
    toTime: data.toTime,
    totalDays,
    reason: data.reason,
    requestedItems: data.requestedItems,
    quantity: data.quantity,
    targetDoctor: data.targetDoctor,
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
    `New ${data.category} Request from ${data.applicantName} (${data.applicantRole.toUpperCase()})`,
    `A new request (${newReq.id} - ${data.requestType}) has been submitted by ${data.applicantName} [${data.priority} Priority]. Details: "${data.reason}". Requires Super Admin approval.`
  );

  // Dispatch Email Confirmation to Applicant
  dispatchEmailNotification(
    data.applicantEmail,
    `Request Submitted to Admin: ${newReq.id}`,
    `Your request for ${data.requestType} (${data.category}) has been logged and sent to Super Admin. Priority: ${data.priority}. Status: PENDING review.`
  );

  toast.success(`Request ${newReq.id} submitted to Super Admin!`, {
    description: "Email notifications dispatched. You will receive an alert once reviewed.",
  });

  return newReq;
}

/** Legacy helper wrapper for leave requests */
export function submitLeaveRequest(data: Parameters<typeof submitUniversalRequest>[0]) {
  return submitUniversalRequest({
    ...data,
    category: data.category || "Leave & Schedule",
  });
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

  // Notification details
  const decisionText = status === "Approved" ? "APPROVED" : "REJECTED";
  const deductionMessage = req.exceededDays > 0
    ? (applyDeduction
        ? `Salary Deduction: -$${req.estimatedDeduction} applied for ${req.exceededDays} excess days.`
        : `Salary Deduction: WAIVED BY ADMIN (Granted as special paid exception).`)
    : "";

  dispatchEmailNotification(
    req.applicantEmail,
    `Request ${req.id} ${decisionText} by Super Admin`,
    `Hello ${req.applicantName}, your ${req.category} request (${req.requestType} - ${req.id}) has been ${decisionText} by Super Admin.\n\nAdmin Remarks: "${adminRemarks || "Processed by Admin Desk."}"\n${deductionMessage}`
  );

  dispatchEmailNotification(
    "admin@medicore.app",
    `Admin Decision Log: ${req.id} ${decisionText}`,
    `Super Admin ${decisionText.toLowerCase()} request ${req.id} (${req.requestType}) for ${req.applicantName} (${req.applicantRole.toUpperCase()}).`
  );

  toast.success(`Request ${req.id} ${status}!`, {
    description: `Email decision sent to ${req.applicantName} (${req.applicantEmail}).`,
  });
}
