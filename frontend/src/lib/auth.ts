// Auth store for MediCore HMS
// Stores the authenticated user (with JWT token) in localStorage.
// The API client (src/lib/api/client.ts) reads the token from here automatically.

export type Role = 'super-admin' | 'receptionist' | 'doctor' | 'nurse' | 'patient';

export interface AuthUser {
  id?: number;
  email: string;
  name: string;
  role: Role;
  patientCode?: string | null;
  token?: string; // JWT token from the backend — read by the API client
}

/** @deprecated Use AuthUser instead */
export type MockUser = AuthUser;

const KEY = 'medicore_user';

export const roleMeta: Record<Role, { label: string; path: string; color: string }> = {
  'super-admin': { label: 'Super Admin', path: '/super-admin', color: 'from-fuchsia-500 to-purple-600' },
  receptionist:  { label: 'Receptionist', path: '/receptionist', color: 'from-sky-400 to-cyan-500' },
  doctor:        { label: 'Doctor',        path: '/doctor',       color: 'from-emerald-400 to-teal-500' },
  nurse:         { label: 'Nurse',         path: '/nurse',        color: 'from-pink-400 to-rose-500' },
  patient:       { label: 'Patient',       path: '/patient',      color: 'from-amber-400 to-orange-500' },
};

export interface LoginAuditLog {
  id: string;
  name: string;
  email: string;
  role: Role;
  loginTime: string;
  dateStr: string;
  ip: string;
  device: string;
  status: 'Successful' | 'MFA Verified';
}

const AUDIT_KEY = 'medicore_login_audit_logs';

export function recordLoginAudit(u: AuthUser) {
  if (typeof window === 'undefined') return;
  try {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const formattedDate = now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

    const newLog: LoginAuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: u.name,
      email: u.email,
      role: u.role,
      loginTime: `${formattedDate} at ${formattedTime}`,
      dateStr: formattedDate,
      ip: '192.168.1.45 (Local Subnet)',
      device: typeof navigator !== 'undefined' ? (navigator.userAgent.includes('Windows') ? 'Windows Web Workstation' : 'Mobile Web Client') : 'Web Browser',
      status: 'Successful',
    };

    const existingLogs = getLoginAuditLogs();
    // Keep max 50 recent login logs
    const updated = [newLog, ...existingLogs.filter(l => l.id !== newLog.id)].slice(0, 50);
    localStorage.setItem(AUDIT_KEY, JSON.stringify(updated));

    // Also trigger email notification alert in local user notifications
    const userNotifsKey = `medicore_user_notifications_${u.email}`;
    const userNotifs = JSON.parse(localStorage.getItem(userNotifsKey) || '[]');
    const emailNotif = {
      id: `notif-email-${Date.now()}`,
      type: 'security',
      title: 'Security Alert: Account Login Confirmation',
      body: `Hello ${u.name}, your MediCore account (${u.role.toUpperCase()}) was accessed on ${newLog.loginTime} from ${newLog.device}. An automated notification email has been dispatched to ${u.email}. If this was not you, lock your account immediately.`,
      time: formattedTime,
      unread: true,
      emailSent: true,
    };
    localStorage.setItem(userNotifsKey, JSON.stringify([emailNotif, ...userNotifs]));
  } catch (err) {
    console.error('Failed to log login audit:', err);
  }
}

export function getLoginAuditLogs(): LoginAuditLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // Default seed audit logs if empty
  return [
    { id: 'log-1', name: 'Dr. Sarah Khan', email: 'doctor@medicore.app', role: 'doctor', loginTime: 'Today at 08:15:02 AM', dateStr: 'Today', ip: '192.168.1.12', device: 'Windows Desktop (Clinic 1)', status: 'Successful' },
    { id: 'log-2', name: 'Ahmed Ali (Patient)', email: 'patient@medicore.app', role: 'patient', loginTime: 'Today at 09:30:45 AM', dateStr: 'Today', ip: '110.39.42.18', device: 'iOS Mobile App', status: 'MFA Verified' },
    { id: 'log-3', name: 'Nurse Maryam', email: 'nurse@medicore.app', role: 'nurse', loginTime: 'Today at 07:45:10 AM', dateStr: 'Today', ip: '192.168.1.88', device: 'Hospital Station Tablet', status: 'Successful' },
    { id: 'log-4', name: 'Zainab Reception', email: 'receptionist@medicore.app', role: 'receptionist', loginTime: 'Today at 08:00:00 AM', dateStr: 'Today', ip: '192.168.1.101', device: 'Front Desk PC', status: 'Successful' },
  ];
}

export function saveUser(u: AuthUser) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEY, JSON.stringify(u));

    // Keep medicore_doctor_profile in sync so login alerts & emails always use the latest name
    if (u.role === 'doctor') {
      try {
        const existing = JSON.parse(localStorage.getItem('medicore_doctor_profile') || '{}');
        localStorage.setItem('medicore_doctor_profile', JSON.stringify({ ...existing, name: u.name, email: u.email }));
      } catch {}
    }

    window.dispatchEvent(new Event('medicore_user_updated'));
    recordLoginAudit(u);
  }
}

export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = localStorage.getItem(KEY);
    if (!v) return null;
    const u: AuthUser = JSON.parse(v);
    if (u && u.role === 'doctor') {
      const docProfile = localStorage.getItem('medicore_doctor_profile');
      if (docProfile) {
        try {
          const parsed = JSON.parse(docProfile);
          if (parsed.name) u.name = parsed.name;
          if (parsed.email) u.email = parsed.email;
        } catch {}
      }
    }
    return u;
  } catch {
    return null;
  }
}

export function ensureUserForRole(role: Role): AuthUser | null {
  const existing = getUser();
  if (!existing) {
    return null;
  }
  if (existing.role !== role) {
    return null;
  }
  return existing;
}

export function clearUser() {
  if (typeof window !== 'undefined') localStorage.removeItem(KEY);
}
