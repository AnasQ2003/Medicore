import { LayoutDashboard, Calendar, FileText, Users, Pill, ClipboardList, User, Bell, CalendarOff, CalendarClock } from "lucide-react";
import type { ReactNode } from "react";

export interface NavItem { label: string; to: string; icon: ReactNode }

export const doctorNav: NavItem[] = [
  { label: "Dashboard", to: "/doctor", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Appointments", to: "/doctor/appointments", icon: <Calendar className="h-4 w-4" /> },
  { label: "Patients", to: "/doctor/patients", icon: <Users className="h-4 w-4" /> },
  { label: "Prescriptions", to: "/doctor/prescriptions", icon: <Pill className="h-4 w-4" /> },
  { label: "Reports", to: "/doctor/reports", icon: <FileText className="h-4 w-4" /> },
  { label: "Schedule", to: "/doctor/schedule", icon: <CalendarClock className="h-4 w-4" /> },
  { label: "Leave", to: "/doctor/leave", icon: <CalendarOff className="h-4 w-4" /> },
  { label: "Notifications", to: "/doctor/notifications", icon: <Bell className="h-4 w-4" /> },
  { label: "My Profile", to: "/doctor/profile", icon: <User className="h-4 w-4" /> },
];
