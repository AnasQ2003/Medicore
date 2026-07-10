import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { nurseNav } from "@/lib/roleNav";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, CheckCircle2, Clock, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { taskAPI } from "@/lib/api/client";
import useApi from "@/hooks/useApi";
import { toast } from "sonner";

export const Route = createFileRoute("/nurse/tasks")({
  head: () => ({ meta: [{ title: "Tasks — Nurse" }] }),
  component: NurseTasksScreen,
});

interface Task {
  id: number;
  title: string;
  description?: string;
  assignedTo: string;
  status: "Pending" | "In Progress" | "Completed";
  priority: "Low" | "Medium" | "High";
  dueTime?: string;
}

const statusConfig = {
  Pending: { badge: "bg-amber-100 text-amber-700", icon: Clock },
  "In Progress": { badge: "bg-blue-100 text-blue-700", icon: RefreshCw },
  Completed: { badge: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
};
const priorityConfig = {
  High: "bg-rose-500",
  Medium: "bg-amber-500",
  Low: "bg-slate-400",
};

function NurseTasksScreen() {
  const { data: rawTasks, loading, error, refetch } = useApi(() => taskAPI.getAll());
  const tasks = (rawTasks as unknown as Task[]) ?? [];

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      await taskAPI.updateStatus(id, newStatus);
      toast.success(`Task marked as ${newStatus}`);
      refetch();
    } catch {
      toast.error("Failed to update task status");
    }
  };

  const nextStatus = (s: string) =>
    s === "Pending" ? "In Progress" : s === "In Progress" ? "Completed" : "Pending";

  const counts = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "Pending").length,
    inProgress: tasks.filter((t) => t.status === "In Progress").length,
    completed: tasks.filter((t) => t.status === "Completed").length,
  };

  return (
    <AppShell role="nurse" title="Nurse" nav={nurseNav}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
        <p className="text-muted-foreground">Clinical task checklist — Shift 08:00–20:00</p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Tasks", value: counts.total, color: "from-violet-500 to-purple-600" },
          { label: "Pending", value: counts.pending, color: "from-amber-500 to-orange-600" },
          { label: "In Progress", value: counts.inProgress, color: "from-blue-500 to-cyan-600" },
          { label: "Completed", value: counts.completed, color: "from-emerald-500 to-teal-600" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`rounded-2xl bg-gradient-to-br ${s.color} text-white p-5 shadow-elevated`}>
            <div className="text-3xl font-bold">{s.value}</div>
            <div className="text-sm opacity-90 mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <div className="text-center py-16 text-destructive">
          <AlertCircle className="h-8 w-8 mx-auto mb-3" />
          <p className="font-semibold">Failed to load tasks</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-gradient-card border border-border rounded-2xl shadow-card overflow-hidden">
          <div className="p-6 flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-primary" />Task List
            </h3>
            <Button variant="outline" size="sm" onClick={refetch}>
              <RefreshCw className="h-3.5 w-3.5 mr-2" />Refresh
            </Button>
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">No tasks assigned to you.</div>
          ) : (
            <div className="divide-y divide-border">
              {tasks.map((task, i) => {
                const cfg = statusConfig[task.status] ?? statusConfig.Pending;
                const Icon = cfg.icon;
                return (
                  <motion.div key={task.id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.04 }}
                    className={`flex items-center gap-4 px-6 py-4 hover:bg-secondary/30 transition-colors ${task.status === "Completed" ? "opacity-60" : ""}`}>
                    {/* Priority dot */}
                    <div className={`h-3 w-3 rounded-full flex-shrink-0 ${priorityConfig[task.priority] ?? "bg-slate-400"}`} title={`${task.priority} priority`} />

                    <div className="flex-1 min-w-0">
                      <div className={`font-medium ${task.status === "Completed" ? "line-through text-muted-foreground" : ""}`}>{task.title}</div>
                      {task.description && <div className="text-xs text-muted-foreground mt-0.5 truncate">{task.description}</div>}
                      {task.dueTime && (
                        <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Clock className="h-3 w-3" />{task.dueTime}
                        </div>
                      )}
                    </div>

                    <Badge className={`flex items-center gap-1 ${cfg.badge}`}>
                      <Icon className="h-3 w-3" />{task.status}
                    </Badge>

                    {task.status !== "Completed" && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(task.id, nextStatus(task.status))}>
                        {task.status === "Pending" ? "Start" : "Complete"}
                      </Button>
                    )}
                    {task.status === "Completed" && (
                      <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => updateStatus(task.id, "Pending")}>
                        Reset
                      </Button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}
    </AppShell>
  );
}
