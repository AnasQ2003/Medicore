import { LayoutDashboard, Building2, Users, Stethoscope, FileText, BarChart3, Settings, Bell, HeartPulse, Pill, ClipboardCheck, Bed, Syringe, CalendarClock, CalendarOff, UserCircle, UserPlus, Calendar, Receipt, CreditCard, FlaskConical, Download, User, Globe, Banknote } from "lucide-react";
import type { ReactNode } from "react";

export interface RoleNavItem { label: string; to: string; icon: ReactNode }

export const doctorNav: RoleNavItem[] = [
  { label: "Dashboard",      to: "/doctor",               icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Appointments",   to: "/doctor/appointments",   icon: <Calendar className="h-4 w-4" /> },
  { label: "Patients",       to: "/doctor/patients",       icon: <Users className="h-4 w-4" /> },
  { label: "Prescriptions",  to: "/doctor/prescriptions",  icon: <Pill className="h-4 w-4" /> },
  { label: "Reports",        to: "/doctor/reports",        icon: <FileText className="h-4 w-4" /> },
  { label: "Schedule",       to: "/doctor/schedule",       icon: <CalendarClock className="h-4 w-4" /> },
  { label: "Leave",          to: "/doctor/leave",          icon: <CalendarOff className="h-4 w-4" /> },
  { label: "Charges",        to: "/doctor/charges",        icon: <Banknote className="h-4 w-4" /> },
  { label: "Notifications",  to: "/doctor/notifications",  icon: <Bell className="h-4 w-4" /> },
  { label: "My Profile",     to: "/doctor/profile",        icon: <User className="h-4 w-4" /> },
  { label: "Settings",       to: "/doctor/settings",       icon: <Settings className="h-4 w-4" /> },
];

export const superAdminNav: RoleNavItem[] = [
  { label: "Dashboard",        to: "/super-admin",               icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Network Directory", to: "/super-admin/network",       icon: <Globe className="h-4 w-4" /> },
  { label: "Facilities",       to: "/super-admin/facilities",    icon: <Building2 className="h-4 w-4" /> },
  { label: "Hospitals",        to: "/super-admin/hospitals",     icon: <Building2 className="h-4 w-4" /> },
  { label: "Staff",            to: "/super-admin/staff",         icon: <Users className="h-4 w-4" /> },
  { label: "Doctors",          to: "/super-admin/doctors",       icon: <Stethoscope className="h-4 w-4" /> },
  { label: "Reports",          to: "/super-admin/reports",       icon: <FileText className="h-4 w-4" /> },
  { label: "Analytics",        to: "/super-admin/analytics",     icon: <BarChart3 className="h-4 w-4" /> },
  { label: "Notifications",    to: "/super-admin/notifications", icon: <Bell className="h-4 w-4" /> },
  { label: "My Profile",       to: "/super-admin/profile",       icon: <UserCircle className="h-4 w-4" /> },
  { label: "Settings",         to: "/super-admin/settings",      icon: <Settings className="h-4 w-4" /> },
];

export const nurseNav: RoleNavItem[] = [
  { label: "Dashboard",     to: "/nurse",               icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Patients",      to: "/nurse/patients",      icon: <Users className="h-4 w-4" /> },
  { label: "Vitals",        to: "/nurse/vitals",        icon: <HeartPulse className="h-4 w-4" /> },
  { label: "Medications",   to: "/nurse/medications",   icon: <Pill className="h-4 w-4" /> },
  { label: "Tasks",         to: "/nurse/tasks",         icon: <ClipboardCheck className="h-4 w-4" /> },
  { label: "Beds",          to: "/nurse/beds",          icon: <Bed className="h-4 w-4" /> },
  { label: "Injections",    to: "/nurse/injections",    icon: <Syringe className="h-4 w-4" /> },
  { label: "Schedule",      to: "/nurse/schedule",      icon: <CalendarClock className="h-4 w-4" /> },
  { label: "Notifications", to: "/nurse/notifications", icon: <Bell className="h-4 w-4" /> },
  { label: "My Profile",    to: "/nurse/profile",       icon: <UserCircle className="h-4 w-4" /> },
  { label: "Settings",      to: "/nurse/settings",      icon: <Settings className="h-4 w-4" /> },
];

export const receptionistNav: RoleNavItem[] = [
  { label: "Dashboard",     to: "/receptionist",              icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Register",      to: "/receptionist/register",     icon: <UserPlus className="h-4 w-4" /> },
  { label: "Appointments",  to: "/receptionist/appointments", icon: <Calendar className="h-4 w-4" /> },
  { label: "Doctors",       to: "/receptionist/doctors",      icon: <Stethoscope className="h-4 w-4" /> },
  { label: "Patients",      to: "/receptionist/patients",     icon: <Users className="h-4 w-4" /> },
  { label: "Billing",       to: "/receptionist/billing",      icon: <Receipt className="h-4 w-4" /> },
  { label: "Token Queue",   to: "/receptionist/queue",        icon: <CalendarClock className="h-4 w-4" /> },
  { label: "Schedule",      to: "/receptionist/schedule",     icon: <CalendarClock className="h-4 w-4" /> },
  { label: "Notifications", to: "/receptionist/notifications",icon: <Bell className="h-4 w-4" /> },
  { label: "My Profile",    to: "/receptionist/profile",      icon: <UserCircle className="h-4 w-4" /> },
  { label: "Settings",      to: "/receptionist/settings",     icon: <Settings className="h-4 w-4" /> },
];

export const patientNav: RoleNavItem[] = [
  { label: "Dashboard",     to: "/patient",               icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Appointments",  to: "/patient/appointments",  icon: <Calendar className="h-4 w-4" /> },
  { label: "Prescriptions", to: "/patient/prescriptions", icon: <Pill className="h-4 w-4" /> },
  { label: "Lab Reports",   to: "/patient/reports",       icon: <FlaskConical className="h-4 w-4" /> },
  { label: "Billing",       to: "/patient/bills",         icon: <CreditCard className="h-4 w-4" /> },
  { label: "Facilities",    to: "/patient/facilities",    icon: <Building2 className="h-4 w-4" /> },
  { label: "Downloads",     to: "/patient/downloads",     icon: <Download className="h-4 w-4" /> },
  { label: "Schedule",      to: "/patient/schedule",      icon: <CalendarClock className="h-4 w-4" /> },
  { label: "My Profile",    to: "/patient/profile",       icon: <UserCircle className="h-4 w-4" /> },
  { label: "Notifications", to: "/patient/notifications", icon: <Bell className="h-4 w-4" /> },
  { label: "Settings",      to: "/patient/settings",      icon: <Settings className="h-4 w-4" /> },
];
