import { LayoutDashboard, Building2, Users, Stethoscope, FileText, BarChart3, Settings, Bell, HeartPulse, Pill, ClipboardCheck, Bed, Syringe, CalendarClock, UserCircle, UserPlus, Calendar, Receipt, CreditCard, FlaskConical, Download, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

export interface RoleNavItem { label: string; to: string; icon: ReactNode }

export const superAdminNav: RoleNavItem[] = [
  { label: "Super Admin Dashboard", to: "/super-admin", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Super Admin Hospitals", to: "/super-admin/hospitals", icon: <Building2 className="h-4 w-4" /> },
  { label: "Super Admin Staff", to: "/super-admin/staff", icon: <Users className="h-4 w-4" /> },
  { label: "Super Admin Doctors", to: "/super-admin/doctors", icon: <Stethoscope className="h-4 w-4" /> },
  { label: "Super Admin Reports", to: "/super-admin/reports", icon: <FileText className="h-4 w-4" /> },
  { label: "Super Admin Analytics", to: "/super-admin/analytics", icon: <BarChart3 className="h-4 w-4" /> },
  { label: "Super Admin Settings", to: "/super-admin/settings", icon: <Settings className="h-4 w-4" /> },
  { label: "Super Admin Notifications", to: "/super-admin/notifications", icon: <Bell className="h-4 w-4" /> },
];

export const nurseNav: RoleNavItem[] = [
  { label: "Nurse Dashboard", to: "/nurse", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Nurse Patients", to: "/nurse/patients", icon: <Users className="h-4 w-4" /> },
  { label: "Nurse Vitals", to: "/nurse/vitals", icon: <HeartPulse className="h-4 w-4" /> },
  { label: "Nurse Medications", to: "/nurse/medications", icon: <Pill className="h-4 w-4" /> },
  { label: "Nurse Tasks", to: "/nurse/tasks", icon: <ClipboardCheck className="h-4 w-4" /> },
  { label: "Nurse Beds", to: "/nurse/beds", icon: <Bed className="h-4 w-4" /> },
  { label: "Nurse Injections", to: "/nurse/injections", icon: <Syringe className="h-4 w-4" /> },
  { label: "Nurse Notifications", to: "/nurse/notifications", icon: <Bell className="h-4 w-4" /> },
];

export const receptionistNav: RoleNavItem[] = [
  { label: "Receptionist Dashboard", to: "/receptionist", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Receptionist Register", to: "/receptionist/register", icon: <UserPlus className="h-4 w-4" /> },
  { label: "Receptionist Appointments", to: "/receptionist/appointments", icon: <Calendar className="h-4 w-4" /> },
  { label: "Receptionist Doctors", to: "/receptionist/doctors", icon: <Stethoscope className="h-4 w-4" /> },
  { label: "Receptionist Patients", to: "/receptionist/patients", icon: <Users className="h-4 w-4" /> },
  { label: "Receptionist Billing", to: "/receptionist/billing", icon: <Receipt className="h-4 w-4" /> },
  { label: "Receptionist Queue", to: "/receptionist/queue", icon: <CalendarClock className="h-4 w-4" /> },
  { label: "Receptionist Notifications", to: "/receptionist/notifications", icon: <Bell className="h-4 w-4" /> },
];

export const patientNav: RoleNavItem[] = [
  { label: "Patient Dashboard", to: "/patient", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Patient Appointments", to: "/patient/appointments", icon: <Calendar className="h-4 w-4" /> },
  { label: "Patient Prescriptions", to: "/patient/prescriptions", icon: <Pill className="h-4 w-4" /> },
  { label: "Patient Lab Reports", to: "/patient/reports", icon: <FlaskConical className="h-4 w-4" /> },
  { label: "Patient Bills", to: "/patient/bills", icon: <CreditCard className="h-4 w-4" /> },
  { label: "Patient Downloads", to: "/patient/downloads", icon: <Download className="h-4 w-4" /> },
  { label: "Patient Profile", to: "/patient/profile", icon: <UserCircle className="h-4 w-4" /> },
  { label: "Patient Notifications", to: "/patient/notifications", icon: <Bell className="h-4 w-4" /> },
];
