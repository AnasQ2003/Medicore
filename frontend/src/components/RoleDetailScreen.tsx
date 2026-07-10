import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import type { Role } from "@/lib/auth";
import type { RoleNavItem } from "@/lib/roleNav";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, CheckCircle2, Clock, FileText, Plus, Search, Trash2, Users, Pencil, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Variant = "violet" | "red" | "green" | "sunset";

const variantGradient: Record<Variant, string> = {
  violet: "bg-gradient-violet",
  red: "bg-gradient-red",
  green: "bg-gradient-green",
  sunset: "bg-gradient-sunset",
};

const variantText: Record<Variant, string> = {
  violet: "text-violet-600",
  red: "text-rose-600",
  green: "text-emerald-600",
  sunset: "text-amber-600",
};

const STATUSES = ["Active", "Scheduled", "Pending", "Done"] as const;
type Status = typeof STATUSES[number];

const statusClass: Record<Status, string> = {
  Active: "bg-rose-100 text-rose-700",
  Scheduled: "bg-blue-100 text-blue-700",
  Pending: "bg-amber-100 text-amber-700",
  Done: "bg-emerald-100 text-emerald-700",
};

type Item = { id: number; title: string; priority: string; time: string; status: Status };

export function RoleDetailScreen({
  role, title, nav, screen, description, variant,
}: {
  role: Role; title: string; nav: RoleNavItem[]; screen: string; description: string; variant: Variant;
}) {
  const [rows, setRows] = useState<Item[]>([
    { id: 1, title: `${screen} intake`, priority: "High priority", time: "08:45", status: "Active" },
    { id: 2, title: `${screen} review`, priority: "Normal", time: "10:15", status: "Scheduled" },
    { id: 3, title: `${screen} approval`, priority: "Waiting", time: "12:30", status: "Pending" },
    { id: 4, title: `${screen} follow-up`, priority: "Completed", time: "14:00", status: "Done" },
  ]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [form, setForm] = useState<Omit<Item, "id">>({ title: "", priority: "Normal", time: "09:00", status: "Active" });

  const filtered = rows.filter(r => (r.title + r.priority).toLowerCase().includes(q.toLowerCase()));
  const nextStatus = (s: Status): Status => STATUSES[(STATUSES.indexOf(s) + 1) % STATUSES.length];

  const setStatus = (id: number, s: Status) => {
    setRows(rows.map(r => r.id === id ? { ...r, status: s } : r));
    toast.success(`Marked as ${s}`);
  };
  const remove = (id: number) => { setRows(rows.filter(r => r.id !== id)); toast.success("Removed"); };
  const create = () => {
    if (!form.title) return toast.error("Enter a title");
    const id = Math.max(0, ...rows.map(r => r.id)) + 1;
    if (editing) {
      setRows(rows.map(r => r.id === editing.id ? { ...editing, ...form } : r));
      toast.success("Updated");
    } else {
      setRows([{ id, ...form }, ...rows]);
      toast.success("Added");
    }
    setOpen(false); setEditing(null); setForm({ title: "", priority: "Normal", time: "09:00", status: "Active" });
  };
  const openEdit = (r: Item) => { setEditing(r); setForm({ title: r.title, priority: r.priority, time: r.time, status: r.status }); setOpen(true); };

  const stats = {
    total: rows.length,
    done: rows.filter(r => r.status === "Done").length,
    active: rows.filter(r => r.status === "Active").length,
    pending: rows.filter(r => r.status === "Pending").length,
  };

  return (
    <AppShell role={role} title={title} nav={nav}>
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className={`${variantGradient[variant]} relative overflow-hidden rounded-2xl p-6 text-white shadow-elevated mb-6 border border-white/25`}>
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{screen}</h1>
            <p className="text-white/85 mt-2 max-w-2xl">{description}</p>
          </div>
          <Button onClick={() => { setEditing(null); setForm({ title: "", priority: "Normal", time: "09:00", status: "Active" }); setOpen(true); }} className="bg-white text-foreground hover:bg-white/90"><Plus className="h-4 w-4 mr-2" />New Entry</Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Open Items" value={String(stats.total)} change={`${stats.active} active`} icon={Activity} delay={0} />
        <StatCard label="Done" value={String(stats.done)} change="This shift" icon={CheckCircle2} delay={0.05} />
        <StatCard label="Pending" value={String(stats.pending)} change="Awaiting" icon={Clock} delay={0.1} />
        <StatCard label="People" value="148" change="+12 today" icon={Users} delay={0.15} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="lg:col-span-2 glass-card rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="font-semibold text-lg">{screen} Records</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search records…" className="pl-9 sm:w-72" />
            </div>
          </div>
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map((r, i) => (
                <motion.div key={r.id} layout
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40, height: 0, padding: 0, marginBottom: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 rounded-xl border border-white/55 bg-white/55 backdrop-blur-xl p-4 hover:shadow-md transition">
                  <div className={`${variantGradient[variant]} h-11 w-11 rounded-xl flex items-center justify-center text-white font-bold`}>{r.id}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate capitalize">{r.title}</div>
                    <div className="text-xs text-muted-foreground">{r.priority} • {r.time}</div>
                  </div>
                  <Badge className={statusClass[r.status]}>{r.status}</Badge>
                  <div className="flex gap-1.5">
                    <Button size="icon" variant="ghost" title="Cycle status" onClick={() => setStatus(r.id, nextStatus(r.status))}><RotateCcw className="h-3.5 w-3.5"/></Button>
                    <Button size="icon" variant="ghost" title="Mark done" onClick={() => setStatus(r.id, "Done")} className="text-emerald-600"><CheckCircle2 className="h-4 w-4"/></Button>
                    <Button size="icon" variant="ghost" title="Edit" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5"/></Button>
                    <Button size="icon" variant="ghost" title="Delete" onClick={() => remove(r.id)} className="text-destructive"><Trash2 className="h-3.5 w-3.5"/></Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {filtered.length === 0 && <div className="text-center text-sm text-muted-foreground py-6">No records.</div>}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-5 space-y-4">
          <h2 className="font-semibold text-lg">Quick Status</h2>
          <p className="text-xs text-muted-foreground">Tap a status to bulk-set the first matching record — fast updates between tasks.</p>
          <div className="grid grid-cols-2 gap-2">
            {STATUSES.map(s => (
              <Button key={s} variant="outline" onClick={() => { const first = rows.find(r => r.status !== s); if (first) setStatus(first.id, s); }}
                className="justify-start gap-2">
                <span className={`h-2 w-2 rounded-full ${s === "Done" ? "bg-emerald-500" : s === "Active" ? "bg-rose-500" : s === "Pending" ? "bg-amber-500" : "bg-blue-500"}`}/>
                {s}
              </Button>
            ))}
          </div>
          <Button onClick={() => { setRows(rows.map(r => ({ ...r, status: "Done" as Status }))); toast.success("All marked done"); }}
            className={`${variantGradient[variant]} w-full text-white`}><CheckCircle2 className="h-4 w-4 mr-2" />Mark all done</Button>
          <div className="rounded-xl bg-secondary/60 p-4">
            <div className={`text-sm font-semibold ${variantText[variant]}`}>Live module</div>
            <p className="text-xs text-muted-foreground mt-1">All actions update locally — fully interactive workflow demo.</p>
          </div>
        </motion.div>
      </div>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "New"} {screen} record</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Bed 12 — vitals round" className="mt-1.5"/></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Priority</Label>
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="mt-1.5 w-full h-10 rounded-lg border bg-background px-3 text-sm">
                  <option>High priority</option><option>Normal</option><option>Waiting</option><option>Completed</option>
                </select>
              </div>
              <div><Label>Time</Label><Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="mt-1.5"/></div>
            </div>
            <div><Label>Status</Label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Status })} className="mt-1.5 w-full h-10 rounded-lg border bg-background px-3 text-sm">
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={create} className={`${variantGradient[variant]} text-white`}>{editing ? "Save" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
