import { createFileRoute } from "@tanstack/react-router";
import { LayoutDashboard, Users, Stethoscope, Building2, BarChart3, Settings, FileText, Activity, TrendingUp, DollarSign } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { motion } from "framer-motion";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";
import { superAdminNav } from "@/lib/roleNav";
import { adminAPI } from "@/lib/api/client";
import useApi from "@/hooks/useApi";

export const Route = createFileRoute("/super-admin/")({
  head: () => ({ meta: [{ title: "Super Admin — MediCore" }] }),
  component: SuperAdminScreen,
});

const nav = [
  { label: "Dashboard", to: "/super-admin", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Hospitals", to: "/super-admin", icon: <Building2 className="h-4 w-4" /> },
  { label: "Staff", to: "/super-admin", icon: <Users className="h-4 w-4" /> },
  { label: "Doctors", to: "/super-admin", icon: <Stethoscope className="h-4 w-4" /> },
  { label: "Reports", to: "/super-admin", icon: <FileText className="h-4 w-4" /> },
  { label: "Analytics", to: "/super-admin", icon: <BarChart3 className="h-4 w-4" /> },
  { label: "Settings", to: "/super-admin", icon: <Settings className="h-4 w-4" /> },
];

const revenue = [
  { d: "Mon", v: 4200 }, { d: "Tue", v: 5100 }, { d: "Wed", v: 4800 },
  { d: "Thu", v: 6200 }, { d: "Fri", v: 7400 }, { d: "Sat", v: 5900 }, { d: "Sun", v: 6800 },
];
const branches = [
  { b: "Main", patients: 1240 }, { b: "North", patients: 820 },
  { b: "South", patients: 690 }, { b: "East", patients: 540 }, { b: "West", patients: 480 },
];

// SuperAdminScreen — system-wide overview, branches, staff, revenue charts.
function SuperAdminScreen() {
  const { data: rawAnalytics } = useApi(() => adminAPI.getAnalytics());
  const analytics = rawAnalytics as unknown as {
    totalAppointments: number; activePatients: number; totalStaff: number; totalRevenue: number;
    recentAppointments: { appointmentCode: string; patient: string; status: string; date: string; time: string; }[];
    staffList: { id: number; name: string; role: string; }[];
  } | null;
  return (
    <AppShell role="super-admin" title="Super Admin" nav={superAdminNav}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
        <p className="text-muted-foreground">Real-time view across all hospital branches.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Patients" value={analytics ? String(analytics.activePatients) : "—"} change="Registered" icon={Users} delay={0} />
        <StatCard label="Active Staff" value={analytics ? String(analytics.totalStaff) : "—"} change="All roles" icon={Stethoscope} delay={0.05} />
        <StatCard label="Total Appointments" value={analytics ? String(analytics.totalAppointments) : "—"} change="All time" icon={Activity} delay={0.1} />
        <StatCard label="Revenue (Paid)" value={analytics ? `$${analytics.totalRevenue.toLocaleString()}` : "—"} change="Settled invoices" icon={DollarSign} delay={0.15} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}} className="lg:col-span-2 bg-gradient-card border border-border rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Weekly Revenue</h3>
              <p className="text-xs text-muted-foreground">All branches combined</p>
            </div>
            <TrendingUp className="h-4 w-4 text-accent" />
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.32 0.03 235 / 40%)" />
              <XAxis dataKey="d" stroke="oklch(0.7 0.02 230)" fontSize={12} />
              <YAxis stroke="oklch(0.7 0.02 230)" fontSize={12} />
              <Tooltip contentStyle={{ background: "oklch(0.23 0.035 235)", border: "1px solid oklch(0.32 0.03 235)", borderRadius: 12 }} />
              <Line type="monotone" dataKey="v" stroke="oklch(0.78 0.15 200)" strokeWidth={3} dot={{ fill: "oklch(0.78 0.15 200)", r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.25}} className="bg-gradient-card border border-border rounded-2xl p-6 shadow-card">
          <h3 className="font-semibold mb-4">Branches</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={branches}>
              <XAxis dataKey="b" stroke="oklch(0.7 0.02 230)" fontSize={12} />
              <YAxis stroke="oklch(0.7 0.02 230)" fontSize={12} />
              <Tooltip contentStyle={{ background: "oklch(0.23 0.035 235)", border: "1px solid oklch(0.32 0.03 235)", borderRadius: 12 }} />
              <Bar dataKey="patients" fill="oklch(0.72 0.17 165)" radius={[8,8,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3}} className="mt-6 bg-gradient-card border border-border rounded-2xl p-6 shadow-card">
        <h3 className="font-semibold mb-4">Recent Audit Log</h3>
        <div className="space-y-3">
          {[
            ["Dr. Khan", "Created prescription for Ahmed Ali", "2m ago"],
            ["Receptionist Maya", "Booked appointment", "8m ago"],
            ["Admin", "Updated user roles", "1h ago"],
            ["Nurse Sara", "Updated vitals — Bed 14", "2h ago"],
          ].map(([u, a, t]) => (
            <div key={a} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <div className="text-sm font-medium">{u}</div>
                <div className="text-xs text-muted-foreground">{a}</div>
              </div>
              <span className="text-xs text-muted-foreground">{t}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </AppShell>
  );
}
