import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { nurseNav } from "@/lib/roleNav";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search, Loader2, AlertCircle, RefreshCw, ClipboardCheck, Clock, CheckCircle2,
  XCircle, AlertTriangle, BedDouble, Calendar, Plus
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import useApi from "@/hooks/useApi";
import { nurseAPI } from "@/lib/api/client";

export const Route = createFileRoute("/nurse/tasks")({
  head: () => ({ meta: [{ title: "Tasks — Nurse" }] }),
  component: NurseTasksScreen,
});

type TaskStatus = "Pending" | "In Progress" | "Completed" | "Overdue" | "Cancelled";
type TaskPriority = "Routine" | "Urgent" | "Critical";

interface NurseTask {
  id: string;
  title: string;
  description: string;
  patient: string;
  bed: string;
  ward: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: string;
  dueAt: string;
  assignedTo: string;
  completedAt?: string;
}

const MOCK_TASKS: NurseTask[] = [
  {
    id: "T-001", title: "Vital Signs Check — Hourly", description: "Record BP, HR, Temperature, SpO₂ for ICU patient per protocol",
    patient: "Muhammad Usama Khan", bed: "ICU-04", ward: "ICU",
    status: "In Progress", priority: "Critical", category: "Vitals",
    dueAt: "Every hour", assignedTo: "Nurse Sara Bibi"
  },
  {
    id: "T-002", title: "IV Line Flush — Heparin Lock", description: "Flush and lock peripheral IV in left antecubital as ordered",
    patient: "Sara Ahmed", bed: "Bed-302A", ward: "General Ward",
    status: "Pending", priority: "Routine", category: "IV Care",
    dueAt: "12:00 PM", assignedTo: "Nurse Rida Noor"
  },
  {
    id: "T-003", title: "Blood Glucose Monitoring", description: "Pre-meal glucose check before lunch, log result in chart",
    patient: "Hamza Riaz", bed: "Bed-114B", ward: "Medical Ward",
    status: "Overdue", priority: "Urgent", category: "Monitoring",
    dueAt: "11:30 AM", assignedTo: "Nurse Sara Bibi"
  },
  {
    id: "T-004", title: "Wound Dressing Change", description: "Post-appendectomy wound dressing change with aseptic technique",
    patient: "Fatima Noor", bed: "Bed-205", ward: "Surgical Ward",
    status: "Pending", priority: "Urgent", category: "Wound Care",
    dueAt: "02:00 PM", assignedTo: "Nurse Rida Noor"
  },
  {
    id: "T-005", title: "Suction & Airway Clearance", description: "Oropharyngeal suctioning as needed — Q2H protocol for ICU patient",
    patient: "Ali Hassan Sheikh", bed: "ICU-07", ward: "ICU",
    status: "In Progress", priority: "Critical", category: "Airway",
    dueAt: "Every 2 hrs", assignedTo: "Nurse Sara Bibi"
  },
  {
    id: "T-006", title: "Patient Education — Breastfeeding", description: "Post-delivery breastfeeding counselling session for new mother",
    patient: "Ayesha Malik", bed: "Bed-408A", ward: "Maternity Ward",
    status: "Completed", priority: "Routine", category: "Education",
    dueAt: "10:00 AM", assignedTo: "Nurse Rida Noor", completedAt: "10:15 AM"
  },
  {
    id: "T-007", title: "Deep Breathing Exercises", description: "Post-op deep breathing exercise session to prevent atelectasis",
    patient: "Bilal Chaudhry", bed: "Bed-312C", ward: "Orthopedic Ward",
    status: "Pending", priority: "Routine", category: "Physiotherapy",
    dueAt: "03:30 PM", assignedTo: "Nurse Amna Siddiqui"
  },
  {
    id: "T-008", title: "Pain Assessment Scale", description: "Numeric rating scale pain assessment Q4H for post-hip replacement",
    patient: "Bilal Chaudhry", bed: "Bed-312C", ward: "Orthopedic Ward",
    status: "Completed", priority: "Routine", category: "Assessment",
    dueAt: "08:00 AM", assignedTo: "Nurse Amna Siddiqui", completedAt: "08:05 AM"
  },
  {
    id: "T-009", title: "Fall Risk Assessment", description: "Morse Fall Scale assessment for elderly patient — update care plan",
    patient: "Ali Hassan Sheikh", bed: "ICU-07", ward: "ICU",
    status: "Pending", priority: "Urgent", category: "Assessment",
    dueAt: "01:00 PM", assignedTo: "Nurse Sara Bibi"
  },
  {
    id: "T-010", title: "Neuro Check — GCS", description: "Glasgow Coma Scale assessment Q2H for neurology patient",
    patient: "Zainab Qureshi", bed: "Bed-501", ward: "Neurology Ward",
    status: "Overdue", priority: "Urgent", category: "Neuro",
    dueAt: "10:00 AM", assignedTo: "Nurse Amna Siddiqui"
  },
];

const statusConfig: Record<TaskStatus, { cls: string; dot: string; icon: React.ReactNode }> = {
  "Pending":     { cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",       dot: "bg-amber-500",    icon: <Clock className="h-3 w-3" /> },
  "In Progress": { cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",           dot: "bg-blue-500",     icon: <Loader2 className="h-3 w-3 animate-spin" /> },
  "Completed":   { cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300", dot: "bg-emerald-500", icon: <CheckCircle2 className="h-3 w-3" /> },
  "Overdue":     { cls: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",           dot: "bg-rose-500",     icon: <AlertTriangle className="h-3 w-3" /> },
  "Cancelled":   { cls: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",          dot: "bg-slate-400",    icon: <XCircle className="h-3 w-3" /> },
};

const priorityConfig: Record<TaskPriority, string> = {
  Routine:  "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  Urgent:   "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  Critical: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
};

function NurseTasksScreen() {
  const { data: _api, loading: _loading, error: _error, refetch } = useApi(() => nurseAPI.getTasks?.() ?? Promise.resolve([]));

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [tasks, setTasks] = useState(MOCK_TASKS);

  const filtered = tasks.filter((t) => {
    const matchQ = t.title.toLowerCase().includes(q.toLowerCase()) ||
      t.patient.toLowerCase().includes(q.toLowerCase()) ||
      t.category.toLowerCase().includes(q.toLowerCase());
    const matchStatus = statusFilter === "All" || t.status === statusFilter;
    const matchPriority = priorityFilter === "All" || t.priority === priorityFilter;
    return matchQ && matchStatus && matchPriority;
  });

  const toggleComplete = (id: string) => {
    setTasks((prev) => prev.map((t) =>
      t.id === id
        ? { ...t, status: t.status === "Completed" ? "Pending" : "Completed" as TaskStatus, completedAt: t.status !== "Completed" ? new Date().toLocaleTimeString() : undefined }
        : t
    ));
    toast.success("Task status updated");
  };

  const counts = {
    all: tasks.length,
    pending: tasks.filter((t) => t.status === "Pending").length,
    inProgress: tasks.filter((t) => t.status === "In Progress").length,
    overdue: tasks.filter((t) => t.status === "Overdue").length,
    done: tasks.filter((t) => t.status === "Completed").length,
  };

  return (
    <AppShell role="nurse" title="Nurse" nav={nurseNav}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task List</h1>
          <p className="text-muted-foreground">Manage nursing tasks across all wards for this shift</p>
        </div>
        <Button variant="outline" size="sm" onClick={refetch} className="shrink-0">
          <RefreshCw className="h-3.5 w-3.5 mr-2" />Refresh Tasks
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Total", value: counts.all, color: "from-violet-500 to-purple-600" },
          { label: "Pending", value: counts.pending, color: "from-amber-500 to-orange-600" },
          { label: "In Progress", value: counts.inProgress, color: "from-blue-500 to-cyan-600" },
          { label: "Overdue", value: counts.overdue, color: "from-rose-500 to-red-600" },
          { label: "Completed", value: counts.done, color: "from-emerald-500 to-teal-600" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`rounded-2xl bg-gradient-to-br ${s.color} text-white p-4 shadow-elevated`}>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs opacity-90 mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search task, patient, category..." className="pl-9" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["All", "Pending", "In Progress", "Overdue", "Completed"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                statusFilter === s ? "bg-rose-600 text-white border-rose-600" : "bg-secondary text-muted-foreground border-border hover:border-rose-400"
              }`}>{s}</button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mb-5">
        {["All", "Routine", "Urgent", "Critical"].map((p) => (
          <button key={p} onClick={() => setPriorityFilter(p)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              priorityFilter === p ? "bg-violet-600 text-white border-violet-600" : "bg-secondary text-muted-foreground border-border hover:border-violet-400"
            }`}>{p}</button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-16 text-muted-foreground bg-secondary/20 rounded-2xl border">No tasks found.</div>
        ) : (
          filtered.map((task, i) => {
            const sc = statusConfig[task.status];
            return (
              <motion.div key={task.id}
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                whileHover={{ y: -3 }}
                className={`bg-card border rounded-2xl p-5 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between ${
                  task.status === "Overdue" ? "border-rose-200 dark:border-rose-900" : "border-border"
                }`}>
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-sm leading-tight text-card-foreground">{task.title}</h3>
                      <span className="text-[10px] font-mono text-muted-foreground">{task.id} · {task.category}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge className={sc?.cls ?? ""}>{sc?.icon} {task.status}</Badge>
                      <Badge className={priorityConfig[task.priority] ?? ""}>{task.priority}</Badge>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{task.description}</p>

                  <div className="bg-secondary/50 p-2.5 rounded-xl mb-3 text-xs space-y-1">
                    <div className="font-semibold text-foreground truncate">{task.patient}</div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span className="flex items-center gap-1"><BedDouble className="h-3 w-3" />{task.bed}</span>
                      <span>{task.ward}</span>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center gap-1.5"><Clock className="h-3 w-3 text-amber-500" />Due: <span className="font-semibold text-foreground">{task.dueAt}</span></div>
                    <div className="flex items-center gap-1.5"><ClipboardCheck className="h-3 w-3 text-violet-500" />{task.assignedTo}</div>
                    {task.completedAt && <div className="flex items-center gap-1.5 text-emerald-600"><CheckCircle2 className="h-3 w-3" />Done at {task.completedAt}</div>}
                  </div>
                </div>

                <div className="border-t border-border pt-3 mt-3 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />{new Date().toLocaleDateString()}
                  </span>
                  {task.status !== "Completed" && task.status !== "Cancelled" ? (
                    <Button size="sm" onClick={() => toggleComplete(task.id)}
                      className={`h-7 text-xs text-white ${task.status === "Overdue" ? "bg-rose-600 hover:bg-rose-500" : "bg-emerald-600 hover:bg-emerald-500"}`}>
                      <CheckCircle2 className="h-3 w-3 mr-1" />Complete
                    </Button>
                  ) : task.status === "Completed" ? (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />Completed
                    </span>
                  ) : null}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </AppShell>
  );
}
