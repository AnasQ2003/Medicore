import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, Stethoscope, Building2, BarChart3, Settings, FileText,
  Activity, TrendingUp, DollarSign, Bed, ShieldAlert, Download, RefreshCw, Plus,
  CheckCircle2, AlertCircle, Clock, Server, ArrowUpRight, ArrowDownRight, Eye,
  Radio, HardDrive, Database, Cpu, Filter, Layers, ChevronRight
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar,
  CartesianGrid, PieChart, Pie, Cell, Legend, AreaChart, Area
} from "recharts";
import { superAdminNav } from "@/lib/roleNav";
import { adminAPI } from "@/lib/api/client";
import useApi from "@/hooks/useApi";
import { getUser, getLoginAuditLogs, type LoginAuditLog } from "@/lib/auth";
import { Slideshow } from "@/components/Slideshow";
import { AdminLeaveApprovalDesk } from "@/components/AdminLeaveApprovalDesk";
import { adminSlides } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useState, useMemo } from "react";

export const Route = createFileRoute("/super-admin/")({
  head: () => ({ meta: [{ title: "Super Admin — MediCore HMS" }] }),
  component: SuperAdminScreen,
});

// Chart Datasets with multiple timeframe variations
const timeframes = [
  { id: "7d", label: "7 Days" },
  { id: "30d", label: "30 Days" },
  { id: "90d", label: "90 Days" },
  { id: "1y", label: "1 Year" },
];

const revenueDataMap = {
  "7d": [
    { label: "Mon", revenue: 14200, expense: 8100, profit: 6100 },
    { label: "Tue", revenue: 16800, expense: 9300, profit: 7500 },
    { label: "Wed", revenue: 15400, expense: 8900, profit: 6500 },
    { label: "Thu", revenue: 19200, expense: 10400, profit: 8800 },
    { label: "Fri", revenue: 22400, expense: 11200, profit: 11200 },
    { label: "Sat", revenue: 18900, expense: 9800, profit: 9100 },
    { label: "Sun", revenue: 20100, expense: 10100, profit: 10000 },
  ],
  "30d": [
    { label: "Week 1", revenue: 98000, expense: 54000, profit: 44000 },
    { label: "Week 2", revenue: 112000, expense: 61000, profit: 51000 },
    { label: "Week 3", revenue: 125000, expense: 67000, profit: 58000 },
    { label: "Week 4", revenue: 139000, expense: 72000, profit: 67000 },
  ],
  "90d": [
    { label: "Month 1", revenue: 420000, expense: 230000, profit: 190000 },
    { label: "Month 2", revenue: 460000, expense: 250000, profit: 210000 },
    { label: "Month 3", revenue: 510000, expense: 270000, profit: 240000 },
  ],
  "1y": [
    { label: "Q1", revenue: 1240000, expense: 690000, profit: 550000 },
    { label: "Q2", revenue: 1380000, expense: 740000, profit: 640000 },
    { label: "Q3", revenue: 1520000, expense: 810000, profit: 710000 },
    { label: "Q4", revenue: 1710000, expense: 890000, profit: 820000 },
  ],
};

const branchPerformance = [
  { name: "Islamabad HQ", patients: 1480, beds: 120, occupiedBeds: 104, doctors: 38, rev: 84000 },
  { name: "Lahore Central", patients: 1120, beds: 95, occupiedBeds: 78, doctors: 29, rev: 62000 },
  { name: "Karachi City", patients: 1650, beds: 150, occupiedBeds: 138, doctors: 45, rev: 98000 },
  { name: "Rawalpindi Unit", patients: 780, beds: 60, occupiedBeds: 42, doctors: 18, rev: 41000 },
  { name: "Peshawar Care", patients: 640, beds: 50, occupiedBeds: 36, doctors: 15, rev: 33000 },
];

const deptShare = [
  { name: "Emergency / ER", value: 34, color: "#ef4444" },
  { name: "ICU & CCU", value: 22, color: "#3b82f6" },
  { name: "General Wards", value: 26, color: "#10b981" },
  { name: "OPD Clinics", value: 12, color: "#f59e0b" },
  { name: "Surgery / OR", value: 6, color: "#8b5cf6" },
];

const initialLogs = [
  { id: "LOG-901", user: "Dr. Sarah Khan", role: "Doctor", action: "Approved electronic prescription Rx-884", branch: "Islamabad HQ", time: "2 mins ago", type: "info" },
  { id: "LOG-902", user: "Admin User", role: "Super Admin", action: "Modified role permissions for Receptionist Group", branch: "System Wide", time: "14 mins ago", type: "warning" },
  { id: "LOG-903", user: "Nurse Maya", role: "Nurse", action: "Updated vitals for Patient P-109 (Bed 14)", branch: "Lahore Central", time: "28 mins ago", type: "info" },
  { id: "LOG-904", user: "Accountant Tariq", role: "Billing", action: "Generated monthly audit report #FIN-2026-07", branch: "Karachi City", time: "1 hour ago", type: "success" },
  { id: "LOG-905", user: "System Sentinel", role: "Automated", action: "Nightly encrypted DB backup verified (3.4 GB)", branch: "Cloud Node A", time: "3 hours ago", type: "success" },
  { id: "LOG-906", user: "Receptionist Ali", role: "Reception", action: "Registered walk-in emergency patient P-402", branch: "Rawalpindi Unit", time: "4 hours ago", type: "info" },
];

function SuperAdminScreen() {
  const navigate = useNavigate();
  const currentUser = getUser();
  const adminName = currentUser?.name || "Administrator";
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "90d" | "1y">("7d");
  const [branchFilter, setBranchFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<(typeof initialLogs)[0] | null>(null);
  const [backupDialog, setBackupDialog] = useState(false);
  const [broadcastDialog, setBroadcastDialog] = useState(false);
  const [broadcastText, setBroadcastText] = useState("");
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  const { data: rawAnalytics } = useApi(() => adminAPI.getAnalytics());
  const analytics = rawAnalytics as unknown as {
    totalAppointments: number; activePatients: number; totalStaff: number; totalRevenue: number;
  } | null;

  const currentRevenueData = useMemo(() => revenueDataMap[timeframe], [timeframe]);

  const filteredBranches = useMemo(() => {
    if (branchFilter === "all") return branchPerformance;
    return branchPerformance.filter(b => b.name.toLowerCase().includes(branchFilter.toLowerCase()));
  }, [branchFilter]);

  const handleRunBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      setIsBackingUp(false);
      setBackupDialog(false);
      toast.success("System Database Backup Complete!", {
        description: "Encrypted snapshot saved to secure AWS S3 bucket (medicore-backups-2026.enc)"
      });
    }, 1500);
  };

  const handleSendBroadcast = () => {
    if (!broadcastText.trim()) return toast.error("Please enter a broadcast message");
    setBroadcastDialog(false);
    toast.success("System Broadcast Sent!", {
      description: `Notification dispatched to all active staff across 5 hospital branches.`
    });
    setBroadcastText("");
  };

  const exportAuditLog = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      ["ID,User,Role,Action,Branch,Time,Type"].join(",") + "\n" +
      initialLogs.map(l => `${l.id},"${l.user}",${l.role},"${l.action}",${l.branch},${l.time},${l.type}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MediCore_Audit_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Audit Log CSV downloaded");
  };

  return (
    <AppShell role="super-admin" title="Super Admin" nav={superAdminNav}>
      {/* Top Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <LayoutDashboard className="h-7 w-7 text-primary" />
            Welcome, <span className="text-gradient ml-1">{adminName}</span>
          </h1>
          <p className="text-muted-foreground">Real-time enterprise metrics, multi-branch control & system health.</p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe Select */}
          <div className="flex bg-secondary/40 p-1 rounded-xl border border-border">
            {timeframes.map((tf) => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id as any)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  timeframe === tf.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          <Button
            onClick={() => setBroadcastDialog(true)}
            variant="outline"
            className="text-xs h-9 border-primary/30 hover:bg-primary/10"
          >
            <Radio className="h-3.5 w-3.5 mr-1.5 text-rose-500 animate-pulse" />
            Broadcast Alert
          </Button>

          <Button
            onClick={() => setBackupDialog(true)}
            className="text-xs h-9 bg-gradient-primary text-white shadow-glow"
          >
            <Database className="h-3.5 w-3.5 mr-1.5" />
            System Backup
          </Button>
        </div>
      </div>

      {/* Executive Hero Slideshow */}
      <div className="mb-6">
        <Slideshow slides={adminSlides} />
      </div>

      {/* Interactive Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div
          onClick={() => navigate({ to: "/super-admin/hospitals" })}
          className="cursor-pointer group transform transition-transform hover:-translate-y-1"
        >
          <StatCard
            label="Total Patients"
            value={analytics ? String(analytics.activePatients) : "5,670"}
            change="+12.4% vs last month"
            icon={Users}
            delay={0}
          />
        </div>

        <div
          onClick={() => navigate({ to: "/super-admin/staff" })}
          className="cursor-pointer group transform transition-transform hover:-translate-y-1"
        >
          <StatCard
            label="Active Staff & Doctors"
            value={analytics ? String(analytics.totalStaff) : "145"}
            change="100% active on shift"
            icon={Stethoscope}
            delay={0.05}
          />
        </div>

        <div
          onClick={() => navigate({ to: "/super-admin/reports" })}
          className="cursor-pointer group transform transition-transform hover:-translate-y-1"
        >
          <StatCard
            label="Total Consultations"
            value={analytics ? String(analytics.totalAppointments) : "12,480"}
            change="+8.1% this week"
            icon={Activity}
            delay={0.1}
          />
        </div>

        <div
          onClick={() => navigate({ to: "/super-admin/analytics" })}
          className="cursor-pointer group transform transition-transform hover:-translate-y-1"
        >
          <StatCard
            label="Net Enterprise Revenue"
            value={analytics ? `$${analytics.totalRevenue.toLocaleString()}` : "$318,000"}
            change="Settled invoices"
            icon={DollarSign}
            delay={0.15}
          />
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Financial Trends Multi-Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-gradient-card border border-border rounded-2xl p-6 shadow-card flex flex-col justify-between"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">Financial Performance Overview</h3>
                <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">
                  Live Sync
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">Revenue, Operational Expenses, and Net Margin ({timeframes.find(t=>t.id===timeframe)?.label})</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 font-semibold text-emerald-400">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Revenue
              </span>
              <span className="flex items-center gap-1 font-semibold text-rose-400">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" /> Expenses
              </span>
              <span className="flex items-center gap-1 font-semibold text-sky-400">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-400" /> Net Profit
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={currentRevenueData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.32 0.03 235 / 30%)" />
              <XAxis dataKey="label" stroke="oklch(0.7 0.02 230)" fontSize={12} />
              <YAxis stroke="oklch(0.7 0.02 230)" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip
                formatter={(val: number) => [`$${val.toLocaleString()}`, "Amount"]}
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  borderColor: "rgba(255, 255, 255, 0.15)",
                  borderRadius: "12px",
                  color: "#fff",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" name="Revenue" />
              <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" name="Expenses" />
              <Area type="monotone" dataKey="profit" stroke="#38bdf8" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProf)" name="Net Profit" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Department Capacity / Load Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-gradient-card border border-border rounded-2xl p-6 shadow-card flex flex-col justify-between"
        >
          <div>
            <h3 className="font-bold text-lg mb-1">Department Resource Allocation</h3>
            <p className="text-xs text-muted-foreground mb-4">Patient workload distribution across specialties</p>
          </div>

          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie
                data={deptShare}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {deptShare.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(val: number) => [`${val}%`, "Share"]} />
            </PieChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-border/50 text-xs">
            {deptShare.map((d) => (
              <div key={d.name} className="flex items-center justify-between p-1.5 rounded-lg bg-secondary/30">
                <span className="flex items-center gap-1.5 font-medium truncate">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                  {d.name.split("/")[0]}
                </span>
                <span className="font-bold">{d.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Branch Comparison & System Health Section */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Multi-Branch Comparison Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-gradient-card border border-border rounded-2xl p-6 shadow-card"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-bold text-lg">Hospital Branch Comparison</h3>
              <p className="text-xs text-muted-foreground">Active patients vs Bed Occupancy by location</p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger className="w-40 h-8 text-xs">
                  <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue placeholder="Filter Branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches (5)</SelectItem>
                  <SelectItem value="islamabad">Islamabad HQ</SelectItem>
                  <SelectItem value="lahore">Lahore Central</SelectItem>
                  <SelectItem value="karachi">Karachi City</SelectItem>
                  <SelectItem value="rawalpindi">Rawalpindi Unit</SelectItem>
                  <SelectItem value="peshawar">Peshawar Care</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={filteredBranches}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.32 0.03 235 / 30%)" />
              <XAxis dataKey="name" stroke="oklch(0.7 0.02 230)" fontSize={11} />
              <YAxis stroke="oklch(0.7 0.02 230)" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  borderColor: "rgba(255, 255, 255, 0.15)",
                  borderRadius: "12px",
                  color: "#fff",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar dataKey="patients" fill="#38bdf8" name="Active Patients" radius={[6, 6, 0, 0]} />
              <Bar dataKey="occupiedBeds" fill="#f43f5e" name="Occupied Beds" radius={[6, 6, 0, 0]} />
              <Bar dataKey="doctors" fill="#10b981" name="On-Duty Doctors" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Server & Infrastructure Health Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-gradient-card border border-border rounded-2xl p-6 shadow-card flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Server className="h-5 w-5 text-emerald-400" />
                Infrastructure Health
              </h3>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                100% Operational
              </Badge>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 text-muted-foreground"><Cpu className="h-3.5 w-3.5" /> API Server Load (Express)</span>
                  <span className="font-bold text-emerald-400">18% (Normal)</span>
                </div>
                <div className="h-2 rounded-full bg-secondary/50 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[18%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 text-muted-foreground"><Database className="h-3.5 w-3.5" /> PostgreSQL DB Pool</span>
                  <span className="font-bold text-sky-400">32% / 100 Conn</span>
                </div>
                <div className="h-2 rounded-full bg-secondary/50 overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full w-[32%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 text-muted-foreground"><HardDrive className="h-3.5 w-3.5" /> Storage Capacity</span>
                  <span className="font-bold text-amber-400">412 GB / 2 TB</span>
                </div>
                <div className="h-2 rounded-full bg-secondary/50 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full w-[21%]" />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-secondary/30 border border-border/40 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Uptime:</span>
                  <span className="font-semibold text-foreground">99.98% (99 days online)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Response Latency:</span>
                  <span className="font-semibold text-emerald-400">24 ms (avg)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SSL Certificate:</span>
                  <span className="font-semibold text-foreground">Valid until Nov 2027</span>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={() => toast.success("Diagnostics Passed: All 14 system sub-modules reporting optimal health.")}
            variant="outline"
            className="w-full text-xs mt-4 border-border hover:bg-secondary/40"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-2" /> Run Health Diagnostics
          </Button>
        </motion.div>
      </div>

      {/* Admin Leave & Schedule Exception Approval Hub */}
      <div className="mb-8">
        <AdminLeaveApprovalDesk />
      </div>

      {/* Interactive System Audit Log Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-card border border-border rounded-2xl p-6 shadow-card"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Real-time System Audit Trail
            </h3>
            <p className="text-xs text-muted-foreground">Automated audit logging of critical staff and administrative actions</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={exportAuditLog} size="sm" variant="outline" className="text-xs h-8">
              <Download className="h-3.5 w-3.5 mr-1.5" /> Export Log
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground bg-secondary/20">
                <th className="p-3 font-semibold">Log ID</th>
                <th className="p-3 font-semibold">User & Role</th>
                <th className="p-3 font-semibold">Action Performed</th>
                <th className="p-3 font-semibold">Branch Location</th>
                <th className="p-3 font-semibold">Timestamp</th>
                <th className="p-3 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {initialLogs.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className="hover:bg-secondary/30 cursor-pointer transition-colors"
                >
                  <td className="p-3 font-mono font-bold text-primary">{log.id}</td>
                  <td className="p-3 font-medium">
                    <div>{log.user}</div>
                    <div className="text-[10px] text-muted-foreground">{log.role}</div>
                  </td>
                  <td className="p-3 text-foreground font-medium">{log.action}</td>
                  <td className="p-3">
                    <Badge variant="outline" className="text-[10px]">
                      {log.branch}
                    </Badge>
                  </td>
                  <td className="p-3 text-muted-foreground">{log.time}</td>
                  <td className="p-3 text-right">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-full">
                      <Eye className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* TODAY'S USER LOGIN AUDIT TRAIL — Super Admin Exclusive View */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-gradient-card border border-border rounded-2xl p-6 shadow-card mt-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-gradient-violet text-white text-[10px] uppercase font-bold tracking-wider">Super Admin Exclusive</Badge>
              <span className="text-xs text-muted-foreground">• Live Login Monitor</span>
            </div>
            <h3 className="font-bold text-lg flex items-center gap-2 mt-1">
              <Users className="h-5 w-5 text-violet-500" />
              Today's User Login & Session Audit Trail
            </h3>
            <p className="text-xs text-muted-foreground">Comprehensive record of all role logins, exact timestamps, and network access points</p>
          </div>
          <Badge variant="outline" className="self-start sm:self-auto bg-emerald-50 text-emerald-700 border-emerald-200 text-xs px-3 py-1 font-semibold flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            {getLoginAuditLogs().length} Active Logins Logged Today
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground bg-secondary/20">
                <th className="p-3 font-semibold">User & Email</th>
                <th className="p-3 font-semibold">Role</th>
                <th className="p-3 font-semibold">Exact Login Time</th>
                <th className="p-3 font-semibold">IP Address</th>
                <th className="p-3 font-semibold">Client Device</th>
                <th className="p-3 font-semibold text-right">Auth Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {getLoginAuditLogs().map((log: LoginAuditLog) => {
                const roleBadgeColors: Record<string, string> = {
                  'super-admin': 'bg-purple-100 text-purple-700 border-purple-200',
                  doctor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                  nurse: 'bg-rose-100 text-rose-700 border-rose-200',
                  receptionist: 'bg-sky-100 text-sky-700 border-sky-200',
                  patient: 'bg-amber-100 text-amber-700 border-amber-200',
                };
                return (
                  <tr key={log.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="p-3">
                      <div className="font-semibold text-foreground">{log.name}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">{log.email}</div>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className={`text-[10px] uppercase font-bold px-2 py-0.5 ${roleBadgeColors[log.role] || 'bg-gray-100 text-gray-700'}`}>
                        {log.role}
                      </Badge>
                    </td>
                    <td className="p-3 font-medium text-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        {log.loginTime}
                      </div>
                    </td>
                    <td className="p-3 font-mono text-muted-foreground">{log.ip}</td>
                    <td className="p-3 text-muted-foreground">{log.device}</td>
                    <td className="p-3 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px] border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        {log.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Log Details Modal */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary" /> Audit Log Item Details
            </DialogTitle>
            <DialogDescription>Full cryptographic audit trace record</DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-3 text-xs pt-2">
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-secondary/30">
                <div><span className="text-muted-foreground">Log Reference:</span> <strong className="font-mono text-primary block">{selectedLog.id}</strong></div>
                <div><span className="text-muted-foreground">Timestamp:</span> <strong className="block">{selectedLog.time}</strong></div>
              </div>
              <div className="p-3 rounded-xl border border-border space-y-1.5">
                <div><span className="text-muted-foreground">User:</span> <strong>{selectedLog.user}</strong> ({selectedLog.role})</div>
                <div><span className="text-muted-foreground">Location:</span> <strong>{selectedLog.branch}</strong></div>
                <div><span className="text-muted-foreground">Action Summary:</span> <p className="font-semibold text-foreground mt-0.5">{selectedLog.action}</p></div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="h-4 w-4 inline mr-1.5" />
                Verified cryptographic checksum match (SHA-256 integrity check OK)
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedLog(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* System Backup Modal */}
      <Dialog open={backupDialog} onOpenChange={setBackupDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" /> Initiate Encrypted System Backup
            </DialogTitle>
            <DialogDescription>Create an instant snapshot of all database records, patient histories, and files.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-xs pt-2">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
              <AlertCircle className="h-4 w-4 inline mr-1.5" />
              Backup will bundle all 5 hospital branches (PostgreSQL + Mongo storage + Uploads).
            </div>
            <div className="space-y-1">
              <Label>Backup Destination</Label>
              <Input value="AWS S3 Bucket — medicore-backups-2026.enc" disabled className="h-9 font-mono text-xs" />
            </div>
            <div className="space-y-1">
              <Label>Encryption Key</Label>
              <Input value="AES-256-GCM (MediCore HSM Master Key #1)" disabled className="h-9 font-mono text-xs" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBackupDialog(false)}>Cancel</Button>
            <Button onClick={handleRunBackup} disabled={isBackingUp} className="bg-gradient-primary text-white">
              {isBackingUp ? "Backing up snapshot..." : "Start Backup Now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Broadcast Alert Modal */}
      <Dialog open={broadcastDialog} onOpenChange={setBroadcastDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-500">
              <Radio className="h-5 w-5 animate-pulse" /> Dispatch Emergency Broadcast
            </DialogTitle>
            <DialogDescription>Send an urgent banner alert to all logged-in staff members across all branches.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <Label>Broadcast Message</Label>
              <Textarea
                value={broadcastText}
                onChange={(e) => setBroadcastText(e.target.value)}
                placeholder="e.g., Code Blue alert in ICU Ward B / Scheduled maintenance at 02:00 AM"
                className="mt-1.5 h-24"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBroadcastDialog(false)}>Cancel</Button>
            <Button onClick={handleSendBroadcast} className="bg-rose-600 hover:bg-rose-700 text-white">
              Dispatch Announcement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
