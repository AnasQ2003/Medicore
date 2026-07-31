import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar, TrendingDown, Clock, CheckCircle2, XCircle, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface DayRecord {
  date: string; // YYYY-MM-DD
  status: "present" | "absent" | "leave" | "off";
}

interface LeaveApplication {
  id: string;
  from: string;
  to: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function generateMockRecords(year: number, month: number): DayRecord[] {
  const today = new Date();
  const days = getDaysInMonth(year, month);
  const records: DayRecord[] = [];
  for (let d = 1; d <= days; d++) {
    const date = toDateStr(year, month, d);
    const dateObj = new Date(year, month, d);
    // Don't generate future dates beyond today
    if (dateObj > today) continue;
    const dow = dateObj.getDay();
    if (dow === 0 || dow === 6) {
      records.push({ date, status: "off" });
    } else {
      const rand = Math.random();
      if (rand < 0.75) records.push({ date, status: "present" });
      else if (rand < 0.87) records.push({ date, status: "absent" });
      else records.push({ date, status: "leave" });
    }
  }
  return records;
}

interface ScheduleCalendarProps {
  role?: string;
  accentClass?: string;
}

export function ScheduleCalendar({ role = "staff", accentClass = "bg-gradient-primary" }: ScheduleCalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaveFrom, setLeaveFrom] = useState("");
  const [leaveTo, setLeaveTo] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveType, setLeaveType] = useState("Medical");

  // Mock leave applications stored in state
  const [applications, setApplications] = useState<LeaveApplication[]>([
    { id: "LV-001", from: "2026-07-10", to: "2026-07-11", reason: "Medical checkup", status: "approved" },
    { id: "LV-002", from: "2026-06-20", to: "2026-06-21", reason: "Family event", status: "approved" },
    { id: "LV-003", from: "2026-07-25", to: "2026-07-26", reason: "Personal leave", status: "pending" },
  ]);

  // Is the selected month/year in the future (beyond current month)?
  const isFutureMonth = viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  const records = useMemo(() => {
    if (isFutureMonth) return [];
    return generateMockRecords(viewYear, viewMonth);
  }, [viewYear, viewMonth, isFutureMonth]);

  const present = records.filter(r => r.status === "present").length;
  const absent = records.filter(r => r.status === "absent").length;
  const leaveDays = records.filter(r => r.status === "leave").length;
  const totalWorkdays = records.filter(r => r.status !== "off").length;
  const remainingLeave = Math.max(0, 18 - applications.filter(a => a.status === "approved").length * 2);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
    const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
    if (nextY > today.getFullYear() || (nextY === today.getFullYear() && nextM > today.getMonth())) {
      toast.error("Cannot view future months beyond current month");
      return;
    }
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();

  const applyLeave = () => {
    if (!leaveFrom || !leaveTo) return toast.error("Please select from and to dates");
    if (leaveFrom > leaveTo) return toast.error("From date must be before to date");
    const newApp: LeaveApplication = {
      id: `LV-${String(Date.now()).slice(-4)}`,
      from: leaveFrom,
      to: leaveTo,
      reason: leaveReason || leaveType,
      status: "pending",
    };
    setApplications(prev => [newApp, ...prev]);
    toast.success("Leave application submitted successfully!");
    setLeaveOpen(false);
    setLeaveFrom(""); setLeaveTo(""); setLeaveReason("");
  };

  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    present: { bg: "bg-emerald-100 border-emerald-200", text: "text-emerald-700", label: "P" },
    absent: { bg: "bg-rose-100 border-rose-200", text: "text-rose-700", label: "A" },
    leave: { bg: "bg-amber-100 border-amber-200", text: "text-amber-700", label: "L" },
    off: { bg: "bg-slate-100 border-slate-200", text: "text-slate-400", label: "—" },
  };

  const recordMap: Record<string, DayRecord> = {};
  records.forEach(r => { recordMap[r.date] = r; });

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Present Days", value: present, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
          { label: "Absent Days", value: absent, icon: XCircle, color: "text-rose-600", bg: "bg-rose-50 border-rose-100" },
          { label: "Leave Taken", value: leaveDays, icon: FileText, color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
          { label: "Leave Remaining", value: remainingLeave, icon: TrendingDown, color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border p-4 ${bg} flex flex-col gap-1.5`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <div className={`text-3xl font-bold ${color}`}>{isFutureMonth ? "—" : value}</div>
            {!isFutureMonth && totalWorkdays > 0 && (
              <div className="text-[11px] text-muted-foreground">of {totalWorkdays} workdays</div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Calendar card */}
      <div className="rounded-2xl border bg-white shadow-card p-5">
        {/* Month/Year Nav */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`h-9 w-9 rounded-xl ${accentClass} flex items-center justify-center`}>
              <Calendar className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <div className="font-bold text-lg">{MONTHS[viewMonth]} {viewYear}</div>
              {isCurrentMonth && <div className="text-xs text-primary font-medium">Current Month</div>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="outline" onClick={prevMonth} className="h-8 w-8 rounded-xl">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="icon" variant="outline"
              onClick={nextMonth}
              disabled={isCurrentMonth}
              className="h-8 w-8 rounded-xl disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); }}
              className="rounded-xl text-xs"
            >
              Today
            </Button>
          </div>
        </div>

        {isFutureMonth ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
            <Clock className="h-10 w-10 opacity-30" />
            <div className="text-center">
              <div className="font-semibold">Future Schedule Unavailable</div>
              <div className="text-sm mt-1">Only current and past month data can be viewed.</div>
            </div>
          </div>
        ) : (
          <>
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAY_NAMES.map(d => (
                <div key={d} className="text-center text-xs font-bold text-muted-foreground py-2">{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`blank-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = toDateStr(viewYear, viewMonth, day);
                const rec = recordMap[dateStr];
                const isToday = dateStr === toDateStr(today.getFullYear(), today.getMonth(), today.getDate());
                const cfg = rec ? statusConfig[rec.status] : null;
                const isFuture = new Date(viewYear, viewMonth, day) > today;

                return (
                  <motion.div
                    key={day}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.008 }}
                    className={`relative aspect-square flex flex-col items-center justify-center rounded-xl border text-xs font-semibold transition-all cursor-default
                      ${isToday ? "ring-2 ring-primary ring-offset-1" : ""}
                      ${isFuture ? "opacity-30" : ""}
                      ${cfg ? `${cfg.bg} ${cfg.text}` : "bg-gray-50 text-gray-400 border-gray-100"}
                    `}
                    title={rec ? `${dateStr}: ${rec.status}` : dateStr}
                  >
                    <span className="text-[11px] font-bold">{day}</span>
                    {cfg && <span className="text-[8px] font-bold opacity-70 leading-none">{cfg.label}</span>}
                  </motion.div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border/50">
              {[
                { color: "bg-emerald-200", label: "Present" },
                { color: "bg-rose-200", label: "Absent" },
                { color: "bg-amber-200", label: "Leave" },
                { color: "bg-slate-200", label: "Off Day" },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className={`h-3 w-3 rounded-sm ${color}`} />
                  {label}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Leave Applications */}
      <div className="rounded-2xl border bg-white shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Leave Applications
          </h3>
          <Button size="sm" onClick={() => setLeaveOpen(true)} className={`${accentClass} text-white text-xs`}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Apply for Leave
          </Button>
        </div>

        <div className="space-y-2">
          {applications.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-6">No leave applications yet.</div>
          )}
          {applications.map(app => (
            <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl border bg-background hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold
                  ${app.status === "approved" ? "bg-emerald-100 text-emerald-700" :
                    app.status === "rejected" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}
                `}>
                  {app.id.slice(-3)}
                </div>
                <div>
                  <div className="text-sm font-semibold">{app.reason}</div>
                  <div className="text-xs text-muted-foreground">{app.from} → {app.to}</div>
                </div>
              </div>
              <Badge className={
                app.status === "approved" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                app.status === "rejected" ? "bg-rose-100 text-rose-700 border-rose-200" :
                "bg-amber-100 text-amber-700 border-amber-200"
              }>
                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Apply for Leave Dialog */}
      <Dialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Apply for Leave
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>From Date</Label>
                <Input type="date" value={leaveFrom} onChange={e => setLeaveFrom(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label>To Date</Label>
                <Input type="date" value={leaveTo} onChange={e => setLeaveTo(e.target.value)} className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label>Leave Type</Label>
              <select value={leaveType} onChange={e => setLeaveType(e.target.value)}
                className="mt-1.5 h-10 w-full rounded-xl border bg-background px-3 text-sm">
                {["Medical", "Annual", "Emergency", "Maternity/Paternity", "Study", "Unpaid"].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Reason / Notes</Label>
              <Input value={leaveReason} onChange={e => setLeaveReason(e.target.value)}
                placeholder="Brief reason for leave..." className="mt-1.5" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLeaveOpen(false)}>Cancel</Button>
            <Button onClick={applyLeave} className={`${accentClass} text-white`}>Submit Application</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
