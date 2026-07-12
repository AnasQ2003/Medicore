import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { superAdminNav } from "@/lib/roleNav";
import { motion } from "framer-motion";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, AreaChart, Area, CartesianGrid, LineChart, Line } from "recharts";
import { adminAPI } from "@/lib/api/client";
import useApi from "@/hooks/useApi";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, TrendingUp, Users, DollarSign, Activity } from "lucide-react";

export const Route = createFileRoute("/super-admin/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Super Admin" }] }),
  component: SuperAdminAnalyticsScreen,
});

const monthlyStats = [
  { month: "Jan", revenue: 45000, patients: 1200, appointments: 800 },
  { month: "Feb", revenue: 52000, patients: 1400, appointments: 950 },
  { month: "Mar", revenue: 49000, patients: 1350, appointments: 900 },
  { month: "Apr", revenue: 63000, patients: 1700, appointments: 1200 },
  { month: "May", revenue: 78000, patients: 2100, appointments: 1500 },
  { month: "Jun", revenue: 71000, patients: 1950, appointments: 1400 },
  { month: "Jul", revenue: 85000, patients: 2300, appointments: 1750 },
];

const departmentUsage = [
  { name: "Emergency", visits: 840, revenue: 32000 },
  { name: "Cardiology", visits: 410, revenue: 54000 },
  { name: "Pediatrics", visits: 620, revenue: 21000 },
  { name: "Neurology", visits: 230, revenue: 41000 },
  { name: "Orthopedics", visits: 380, revenue: 38000 },
];

function SuperAdminAnalyticsScreen() {
  const { data: rawAnalytics, loading } = useApi(() => adminAPI.getAnalytics());
  const analytics = rawAnalytics as unknown as {
    totalAppointments: number; activePatients: number; totalStaff: number; totalRevenue: number;
  } | null;

  return (
    <AppShell role="super-admin" title="Super Admin" nav={superAdminNav}>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Analytics</h1>
          <p className="text-muted-foreground">Deep dive performance metrics, demographics, and operations.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-card border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Registered Patients</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.activePatients ?? "—"}</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                <Activity className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalAppointments ?? "—"}</div>
                <p className="text-xs text-muted-foreground">+8.2% from last week</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.totalRevenue ? `$${analytics.totalRevenue.toLocaleString()}` : "—"}
                </div>
                <p className="text-xs text-muted-foreground">Across all branches</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Staff Members</CardTitle>
                <Users className="h-4 w-4 text-violet-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalStaff ?? "—"}</div>
                <p className="text-xs text-muted-foreground">Doctors, Nurses, Receptionists</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-card border border-border rounded-2xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">Hospital Revenue Growth</h3>
                  <p className="text-xs text-muted-foreground">Monthly performance trajectory</p>
                </div>
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyStats}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.627 0.265 303.9)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="oklch(0.627 0.265 303.9)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.32 0.03 235 / 40%)" />
                  <XAxis dataKey="month" stroke="oklch(0.7 0.02 230)" fontSize={12} />
                  <YAxis stroke="oklch(0.7 0.02 230)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "oklch(0.23 0.035 235)", border: "1px solid oklch(0.32 0.03 235)", borderRadius: 12 }} />
                  <Area type="monotone" dataKey="revenue" stroke="oklch(0.627 0.265 303.9)" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gradient-card border border-border rounded-2xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">Patient & Appointment Inflow</h3>
                  <p className="text-xs text-muted-foreground">Year-to-date monthly comparison</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.32 0.03 235 / 40%)" />
                  <XAxis dataKey="month" stroke="oklch(0.7 0.02 230)" fontSize={12} />
                  <YAxis stroke="oklch(0.7 0.02 230)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "oklch(0.23 0.035 235)", border: "1px solid oklch(0.32 0.03 235)", borderRadius: 12 }} />
                  <Line type="monotone" dataKey="patients" stroke="oklch(0.78 0.15 200)" strokeWidth={2.5} />
                  <Line type="monotone" dataKey="appointments" stroke="oklch(0.72 0.17 165)" strokeWidth={2.5} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gradient-card border border-border rounded-2xl p-6 shadow-card">
            <h3 className="font-semibold text-lg mb-2">Departmental Visits & Revenue</h3>
            <p className="text-xs text-muted-foreground mb-4">Breakdown of operational volume and efficiency</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={departmentUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.32 0.03 235 / 40%)" />
                <XAxis dataKey="name" stroke="oklch(0.7 0.02 230)" fontSize={12} />
                <YAxis stroke="oklch(0.7 0.02 230)" fontSize={12} />
                <Tooltip contentStyle={{ background: "oklch(0.23 0.035 235)", border: "1px solid oklch(0.32 0.03 235)", borderRadius: 12 }} />
                <Bar dataKey="visits" name="Visits" fill="oklch(0.627 0.265 303.9)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="revenue" name="Revenue ($)" fill="oklch(0.72 0.17 165)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      )}
    </AppShell>
  );
}
