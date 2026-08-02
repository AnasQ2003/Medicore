import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { doctorNav } from "@/lib/roleNav";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarClock, Clock, Save, Plus, Copy, Trash2, X, Coffee } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScheduleCalendar } from "@/components/ScheduleCalendar";

export const Route = createFileRoute("/doctor/schedule")({
  head: () => ({ meta: [{ title: "Schedule — Doctor" }] }),
  component: ScheduleScreen,
});

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const colors = ["from-blue-500 to-cyan-500", "from-emerald-500 to-teal-500", "from-rose-500 to-pink-600", "from-amber-500 to-orange-500", "from-violet-500 to-purple-600", "from-indigo-500 to-blue-600", "from-slate-500 to-slate-700"];

function ScheduleScreen() {
  const [schedule, setSchedule] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("medicore_doctor_schedule");
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return days.map((d, i) => ({
      day: d, enabled: i < 6, from: "09:00",
      to: i === 5 ? "13:00" : "17:00",
      slot: 20, breakFrom: "13:00", breakTo: "14:00",
      slots: i === 5 ? 8 : 16,
    }));
  });

  const [blocked, setBlocked] = useState<{ date: string; reason: string }[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("medicore_doctor_blocked_dates");
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return [
      { date: "2026-06-22", reason: "Family event" },
      { date: "2026-07-04", reason: "Conference" },
    ];
  });

  const [blockOpen, setBlockOpen] = useState(false);
  const [bDate, setBDate] = useState("");
  const [bReason, setBReason] = useState("");

  const saveSchedule = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("medicore_doctor_schedule", JSON.stringify(schedule));
      localStorage.setItem("medicore_doctor_blocked_dates", JSON.stringify(blocked));
    }
    toast.success("Schedule & availability saved successfully!");
  };

  const copyMonday = () => {
    const mon = schedule[0];
    const updated = schedule.map((s: any, i: number) => i === 0 ? s : { ...s, from: mon.from, to: mon.to, slot: mon.slot, breakFrom: mon.breakFrom, breakTo: mon.breakTo, enabled: true });
    setSchedule(updated);
    toast.success("Monday copied to all weekdays");
  };
  const addBlocked = () => {
    if (!bDate) return toast.error("Pick a date");
    const updated = [{ date: bDate, reason: bReason || "Unavailable" }, ...blocked];
    setBlocked(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("medicore_doctor_blocked_dates", JSON.stringify(updated));
    }
    toast.success("Date blocked successfully");
    setBlockOpen(false); setBDate(""); setBReason("");
  };

  return (
    <AppShell role="doctor" title="Doctor" nav={doctorNav}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3"><CalendarClock className="h-7 w-7 text-primary"/>My Schedule</h1>
          <p className="text-muted-foreground">Set weekly availability, slot length, lunch breaks, and blocked dates.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={copyMonday}><Copy className="h-4 w-4 mr-2"/>Copy Mon → All</Button>
          <Button onClick={saveSchedule} className="bg-gradient-primary text-white font-semibold"><Save className="h-4 w-4 mr-2"/>Save Schedule</Button>
        </div>
      </div>

      <div className="grid gap-4">
        {schedule.map((s: any, i: number) => (
          <motion.div key={s.day} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}
            className={`relative overflow-hidden rounded-2xl border bg-gradient-card border-border p-5 shadow-card transition-all ${!s.enabled ? "opacity-60" : ""}`}>
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${colors[i]}`}/>
            <div className="flex flex-col md:flex-row md:items-center gap-4 pl-3">
              <div className="md:w-28">
                <div className="font-bold text-lg">{s.day}</div>
                <Badge className={s.enabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}>
                  {s.enabled ? "Available" : "Off"}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-2 flex-1">
                <span className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3"/>Hours</span>
                <input type="time" value={s.from} disabled={!s.enabled}
                  onChange={e => setSchedule((p: any[]) => p.map((x: any, idx: number) => idx===i ? {...x, from: e.target.value} : x))}
                  className="h-9 w-28 rounded-lg border bg-background px-2 text-sm"/>
                <span className="text-muted-foreground">→</span>
                <input type="time" value={s.to} disabled={!s.enabled}
                  onChange={e => setSchedule((p: any[]) => p.map((x: any, idx: number) => idx===i ? {...x, to: e.target.value} : x))}
                  className="h-9 w-28 rounded-lg border bg-background px-2 text-sm"/>

                <span className="text-xs uppercase tracking-wide text-muted-foreground ml-2">Slot</span>
                <select value={s.slot} disabled={!s.enabled}
                  onChange={e => setSchedule((p: any[]) => p.map((x: any, idx: number) => idx===i ? {...x, slot: parseInt(e.target.value)} : x))}
                  className="h-9 rounded-lg border bg-background px-2 text-sm">
                  {[10,15,20,30,45,60].map(v => <option key={v} value={v}>{v} min</option>)}
                </select>

                <span className="text-xs uppercase tracking-wide text-muted-foreground ml-2 flex items-center gap-1"><Coffee className="h-3 w-3"/>Break</span>
                <input type="time" value={s.breakFrom} disabled={!s.enabled}
                  onChange={e => setSchedule((p: any[]) => p.map((x: any, idx: number) => idx===i ? {...x, breakFrom: e.target.value} : x))}
                  className="h-9 w-24 rounded-lg border bg-background px-2 text-sm"/>
                <span className="text-muted-foreground">→</span>
                <input type="time" value={s.breakTo} disabled={!s.enabled}
                  onChange={e => setSchedule((p: any[]) => p.map((x: any, idx: number) => idx===i ? {...x, breakTo: e.target.value} : x))}
                  className="h-9 w-24 rounded-lg border bg-background px-2 text-sm"/>

                <Badge variant="outline" className="ml-1">{s.slots} slots</Badge>
              </div>

              <label className="flex items-center gap-2 cursor-pointer shrink-0">
                <input type="checkbox" checked={s.enabled}
                  onChange={e => setSchedule((p: any[]) => p.map((x: any, idx: number) => idx===i ? {...x, enabled: e.target.checked} : x))}
                  className="h-4 w-4 accent-primary"/>
                <span className="text-sm">Enabled</span>
              </label>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ─── Monthly Calendar & Leave Metrics ─── */}
      <div className="mt-8">
        <h2 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-primary" />
          Monthly Attendance & Leave Tracker
        </h2>
        <ScheduleCalendar role="doctor" accentClass="bg-gradient-primary" />
      </div>

      <div className="mt-8 bg-gradient-card border rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2"><CalendarClock className="h-4 w-4 text-primary"/>Blocked Dates</h3>
          <Button size="sm" onClick={() => setBlockOpen(true)} className="bg-gradient-primary text-white"><Plus className="h-4 w-4 mr-1.5"/>Block date</Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {blocked.map((b, i) => (
            <motion.div key={i} initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}}
              className="flex items-center justify-between gap-3 bg-rose-50 border border-rose-100 rounded-xl p-3">
              <div>
                <div className="font-semibold text-rose-900">{b.date}</div>
                <div className="text-xs text-rose-700">{b.reason}</div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => { setBlocked(blocked.filter((_, j) => j !== i)); toast.success("Date unblocked"); }} className="text-rose-700 hover:text-rose-900">
                <X className="h-4 w-4"/>
              </Button>
            </motion.div>
          ))}
          {blocked.length === 0 && <div className="col-span-full text-sm text-muted-foreground text-center py-6">No blocked dates yet.</div>}
        </div>
      </div>

      <Dialog open={blockOpen} onOpenChange={setBlockOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Block a date</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Date</Label><Input type="date" value={bDate} onChange={(e) => setBDate(e.target.value)} className="mt-1.5"/></div>
            <div><Label>Reason</Label><Input value={bReason} onChange={(e) => setBReason(e.target.value)} placeholder="e.g. Conference" className="mt-1.5"/></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockOpen(false)}>Cancel</Button>
            <Button onClick={addBlocked} className="bg-gradient-primary text-white">Block</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
