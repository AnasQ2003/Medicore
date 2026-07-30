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

export function saveUser(u: AuthUser) {
  if (typeof window !== 'undefined') localStorage.setItem(KEY, JSON.stringify(u));
}

export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = localStorage.getItem(KEY);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
}

export function ensureUserForRole(role: Role): AuthUser {
  const existing = getUser();
  const targetEmail = role === 'super-admin' ? 'anasahmedcp@gmail.com' : 'abdulahadsip@gmail.com';
  const user: AuthUser = existing
    ? { ...existing, role, email: targetEmail }
    : { email: targetEmail, name: roleMeta[role].label, role };
  saveUser(user);
  return user;
}

export function clearUser() {
  if (typeof window !== 'undefined') localStorage.removeItem(KEY);
}
