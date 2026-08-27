import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ScheduleCalendar } from "@/components/ScheduleCalendar";
import { nurseNav } from "@/lib/roleNav";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  CalendarClock,
  Clock,
  Sun,
  Sunset,
  Moon,
  Coffee,
  CheckCircle2,
  ArrowRightLeft,
  UserCheck,
  Building2,
  HeartPulse,
  Sparkles,
  TrendingUp,
  FileText,
  Send,
  Plus,
  CalendarDays,
  ShieldCheck,
  Timer,
  ChevronRight,
  Flame,
  Award,
  Users,
  Star,
  Zap,
  ClipboardList,
  Stethoscope,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Activity,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/nurse/schedule")({
  head: () => ({ meta: [{ title: "My Shift Schedule & Roster — Nurse" }] }),
  component: NurseScheduleScreen,
});

interface ShiftCard {
  id: string;
  day: string;
  date: string;
  shift: "Morning" | "Evening" | "Night" | "Off" | "On-Call";
  time: string;
  ward: string;
  floor: string;
  supervisor: string;
  patientsCount: number;
  buddyNurse: string;
  status: "Active" | "Upcoming" | "Completed" | "Off";
  tasksCompleted?: number;
  tasksTotal?: number;
  emergencies?: number;
}

const UPCOMING_SHIFTS: ShiftCard[] = [
  {
    id: "SH-01",
    day: "Today",
    date: "27 Aug",
    shift: "Morning",
    time: "08:00 AM – 04:00 PM",
    ward: "ICU & Surgical Recovery",
    floor: "Floor 2",
    supervisor: "Dr. Arshad Mahmood",
    patientsCount: 6,
    buddyNurse: "Nurse Sarah Jenkins",
    status: "Active",
    tasksCompleted: 9,
    tasksTotal: 14,
    emergencies: 1,
  },
  {
    id: "SH-02",
    day: "Friday",
    date: "28 Aug",
    shift: "Morning",
    time: "08:00 AM – 04:00 PM",
    ward: "Emergency & Trauma Bay",
    floor: "Floor 1",
    supervisor: "Dr. Bilal Khan",
    patientsCount: 8,
    buddyNurse: "Nurse Fatima Zahra",
    status: "Upcoming",
  },
  {
    id: "SH-03",
    day: "Saturday",
    date: "29 Aug",
    shift: "Evening",
    time: "04:00 PM – 12:00 AM",
    ward: "General Medical Ward",
    floor: "Floor 3",
    supervisor: "Dr. Hina Tariq",
    patientsCount: 7,
    buddyNurse: "Nurse Ayesha Siddiqui",
    status: "Upcoming",
  },
  {
    id: "SH-04",
    day: "Sunday",
    date: "30 Aug",
    shift: "Off",
    time: "Rest Day",
    ward: "N/A",
    floor: "N/A",
    supervisor: "N/A",
    patientsCount: 0,
    buddyNurse: "N/A",
    status: "Off",
  },
  {
    id: "SH-05",
    day: "Monday",
    date: "31 Aug",
    shift: "Night",
    time: "12:00 AM – 08:00 AM",
    ward: "ICU Night Telemetry",
    floor: "Floor 2",
    supervisor: "Dr. Usman Farooq",
    patientsCount: 5,
    buddyNurse: "Nurse Mariam Ali",
    status: "Upcoming",
  },
  {
    id: "SH-06",
    day: "Tuesday",
    date: "01 Sep",
    shift: "Morning",
    time: "08:00 AM – 04:00 PM",
    ward: "Maternity & Neonatal",
    floor: "Floor 4",
    supervisor: "Dr. Sadia Noor",
    patientsCount: 6,
    buddyNurse: "Nurse Rabia Basri",
    status: "Upcoming",
  },
];

const PERF_STATS = [
  { label: "Shifts This Month", value: "18", icon: CalendarDays, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/30" },
  { label: "Hours Logged", value: "168h", icon: Timer, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
  { label: "Punctuality Score", value: "98.5%", icon: Star, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30" },
  { label: "Patients Cared For", value: "124", icon: HeartPulse, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
  { label: "Overtime Earned", value: "₨21,750", icon: TrendingUp, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/30" },
  { label: "Commendations", value: "3 ⭐", icon: Award, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/30" },
];

function NurseScheduleScreen() {
  const [shifts, setShifts] = useState<ShiftCard[]>(UPCOMING_SHIFTS);
  const [swapOpen, setSwapOpen] = useState(false);
  const [selectedShiftForSwap, setSelectedShiftForSwap] = useState<ShiftCard | null>(null);
  const [swapTargetNurse, setSwapTargetNurse] = useState("Nurse Sarah Jenkins");
  const [swapReason, setSwapReason] = useState("");

  const [handoverOpen, setHandoverOpen] = useState(false);
  const [handoverNote, setHandoverNote] = useState("");
  const [savedNotes, setSavedNotes] = useState<string[]>([
    "ICU-07 Ali Hassan: SpO2 stable on 4L O2. Next arterial blood gas due at 02:00 PM.",
    "Bed-114B Hamza Riaz: Glucose checked 140 mg/dL. Enoxaparin dose given at 11:00 AM.",
  ]);

  const [timeLeft, setTimeLeft] = useState("4h 28m");
  const [progress, setProgress] = useState(44); // % of shift done

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const start = new Date(); start.setHours(8, 0, 0, 0);
      const end = new Date(); end.setHours(16, 0, 0, 0);
      const diff = end.getTime() - now.getTime();
      const total = end.getTime() - start.getTime();
      const elapsed = now.getTime() - start.getTime();
      if (diff > 0) {
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hrs}h ${mins}m`);
        setProgress(Math.min(100, Math.round((elapsed / total) * 100)));
      } else {
        setTimeLeft("Shift Complete");
        setProgress(100);
      }
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleOpenSwap = (shift: ShiftCard) => {
    setSelectedShiftForSwap(shift);
    setSwapOpen(true);
  };

  const handleSendSwap = () => {
    if (!swapReason.trim()) {
      toast.error("Please provide a reason for the shift swap request.");
      return;
    }
    toast.success(`Shift swap request sent to ${swapTargetNurse} for ${selectedShiftForSwap?.day}!`);
    setSwapOpen(false);
    setSwapReason("");
  };

  const handleAddHandover = () => {
    if (!handoverNote.trim()) return toast.error("Please write a handover note.");
    setSavedNotes((prev) => [handoverNote, ...prev]);
    setHandoverNote("");
    setHandoverOpen(false);
    toast.success("Handover note logged for incoming shift team!");
  };

  const getShiftConfig = (shift: ShiftCard["shift"]) => {
    switch (shift) {
      case "Morning":
        return { icon: <Sun className="h-5 w-5" />, label: "Morning Shift", gradient: "from-amber-400 to-orange-400", textColor: "text-amber-700 dark:text-amber-300", bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-900", badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300", emoji: "🌅" };
      case "Evening":
        return { icon: <Sunset className="h-5 w-5" />, label: "Evening Shift", gradient: "from-orange-400 to-rose-400", textColor: "text-orange-700 dark:text-orange-300", bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-900", badge: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300", emoji: "🌆" };
      case "Night":
        return { icon: <Moon className="h-5 w-5" />, label: "Night Shift", gradient: "from-indigo-500 to-violet-500", textColor: "text-indigo-700 dark:text-indigo-300", bg: "bg-indigo-50 dark:bg-indigo-950/30", border: "border-indigo-200 dark:border-indigo-900", badge: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300", emoji: "🌙" };
      case "Off":
        return { icon: <Coffee className="h-5 w-5" />, label: "Rest Day", gradient: "from-emerald-400 to-teal-400", textColor: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50 dark:bg-emerald-950/20", border: "border-emerald-200 dark:border-emerald-900", badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300", emoji: "☕" };
      default:
        return { icon: <Flame className="h-5 w-5" />, label: "On-Call", gradient: "from-rose-500 to-pink-500", textColor: "text-rose-700 dark:text-rose-300", bg: "bg-rose-50 dark:bg-rose-950/30", border: "border-rose-200 dark:border-rose-900", badge: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300", emoji: "🔔" };
    }
  };

  const activeShift = shifts[0];

  return (
    <AppShell role="nurse" title="Nurse" nav={nurseNav}>
      <div className="space-y-8 max-w-7xl mx-auto pb-12">

        {/* ══════════════════════════════════════════════ */}
        {/* HERO: Active Shift Command Center              */}
        {/* ══════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative rounded-3xl overflow-hidden border border-rose-200 dark:border-rose-900/50 shadow-xl"
        >
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 opacity-90" />
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
          
          <div className="relative p-6 sm:p-8 text-white">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div className="space-y-4 flex-1">
                {/* Label row */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-mono font-bold tracking-widest text-white/80 uppercase flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-yellow-300" /> Live Duty Station
                  </span>
                  <Badge className="bg-emerald-400/30 text-white border-emerald-300/40 font-mono text-[10px] px-2 py-0.5 animate-pulse font-bold">
                    🟢 ON DUTY NOW
                  </Badge>
                  <Badge className="bg-white/15 text-white border-white/20 font-mono text-[10px] px-2 py-0.5">
                    SH-01 • ICU & Surgical Recovery
                  </Badge>
                </div>

                <div>
                  <h1 className="text-2xl sm:text-4xl font-black tracking-tight flex items-center gap-3 drop-shadow-md">
                    <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">
                      🌅
                    </div>
                    <div>
                      Morning Shift
                      <span className="text-white/70 font-light text-xl sm:text-2xl"> — Floor 2 ICU</span>
                    </div>
                  </h1>
                  <p className="mt-2 text-sm text-white/80 flex items-center gap-2 flex-wrap">
                    <Clock className="h-3.5 w-3.5" />
                    08:00 AM – 04:00 PM
                    <span className="text-white/50">•</span>
                    <Stethoscope className="h-3.5 w-3.5" />
                    Consultant: <strong className="text-white">Dr. Arshad Mahmood</strong>
                    <span className="text-white/50">•</span>
                    <Users className="h-3.5 w-3.5" />
                    Partner: <strong className="text-white">Nurse Sarah Jenkins</strong>
                  </p>
                </div>

                {/* Shift Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-white/80 font-mono">
                    <span className="flex items-center gap-1"><Activity className="h-3.5 w-3.5" /> Shift Progress</span>
                    <span className="font-bold text-white">{progress}% Complete</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-300 rounded-full shadow-sm"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-white/60 font-mono">
                    <span>08:00 AM Start</span>
                    <span>Remaining: <span className="text-yellow-300 font-bold">{timeLeft}</span></span>
                    <span>04:00 PM End</span>
                  </div>
                </div>

                {/* Quick Task Status */}
                {activeShift?.tasksCompleted !== undefined && (
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-2.5 flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-yellow-300" />
                      <span className="text-sm font-bold">Tasks: <span className="text-yellow-300">{activeShift.tasksCompleted}/{activeShift.tasksTotal}</span> done</span>
                    </div>
                    <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-2.5 flex items-center gap-2">
                      <HeartPulse className="h-4 w-4 text-red-300" />
                      <span className="text-sm font-bold">Patients: <span className="text-emerald-300">6</span> under care</span>
                    </div>
                    {(activeShift.emergencies ?? 0) > 0 && (
                      <div className="bg-red-500/30 border border-red-300/40 rounded-2xl px-4 py-2.5 flex items-center gap-2 animate-pulse">
                        <AlertCircle className="h-4 w-4 text-red-300" />
                        <span className="text-sm font-bold text-red-200">{activeShift.emergencies} Active Emergency</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right: Timer + Actions */}
              <div className="flex flex-col gap-3 items-start lg:items-end">
                {/* Countdown clock */}
                <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-3xl p-5 text-center min-w-[160px] shadow-xl">
                  <div className="text-[10px] text-white/70 font-mono flex items-center justify-center gap-1 mb-1">
                    <Timer className="h-3 w-3" /> TIME REMAINING
                  </div>
                  <div className="text-3xl font-black text-white font-mono tracking-tight drop-shadow">
                    {timeLeft}
                  </div>
                  <div className="text-[10px] text-white/60 font-mono mt-1">Shift ends at 04:00 PM</div>
                </div>

                <div className="flex flex-col gap-2 w-full lg:w-auto">
                  <Button
                    onClick={() => setHandoverOpen(true)}
                    className="bg-white/20 hover:bg-white/30 border border-white/30 text-white font-bold px-4 h-11 rounded-2xl backdrop-blur-sm transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <FileText className="h-4 w-4 mr-2" /> Handover Notes ({savedNotes.length})
                  </Button>
                  <Button
                    onClick={() => handleOpenSwap(shifts[1])}
                    className="bg-white text-rose-600 font-bold px-4 h-11 rounded-2xl hover:bg-white/90 transition-all hover:scale-[1.02] cursor-pointer shadow-lg"
                  >
                    <ArrowRightLeft className="h-4 w-4 mr-2" /> Request Shift Swap
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════ */}
        {/* PERFORMANCE STATS GRID                        */}
        {/* ══════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {PERF_STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 + 0.2 }}
              className={`${stat.bg} border border-border rounded-2xl p-4 text-center space-y-2 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}
            >
              <div className={`mx-auto h-9 w-9 rounded-xl bg-white dark:bg-card flex items-center justify-center shadow-sm ${stat.color}`}>
                <stat.icon className="h-4.5 w-4.5" />
              </div>
              <div className={`text-xl font-black font-mono ${stat.color}`}>{stat.value}</div>
              <div className="text-[10px] font-medium text-muted-foreground leading-tight">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* ══════════════════════════════════════════════ */}
        {/* WEEKLY TIMELINE VIEW                          */}
        {/* ══════════════════════════════════════════════ */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-rose-500" />
                7-Day Duty Timeline
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Interactive weekly roster & ward rotation view</p>
            </div>
            <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30 hidden sm:flex">
              Week 35 • Aug 2026
            </Badge>
          </div>

          {/* Horizontal visual timeline bar */}
          <div className="flex items-center gap-1 bg-secondary/60 p-2 rounded-2xl border border-border overflow-x-auto">
            {shifts.map((sh) => {
              const cfg = getShiftConfig(sh.shift);
              const isActive = sh.status === "Active";
              const isOff = sh.status === "Off";
              return (
                <div
                  key={sh.id}
                  className={`flex-1 min-w-[80px] flex flex-col items-center gap-1 py-2 px-2 rounded-xl transition-all duration-200 cursor-pointer hover:bg-card/80 ${
                    isActive ? "bg-card shadow-md ring-2 ring-rose-400/40" : ""
                  }`}
                  onClick={() => !isOff && handleOpenSwap(sh)}
                >
                  <span className="text-[10px] font-bold text-muted-foreground font-mono">{sh.date}</span>
                  <div className={`h-8 w-8 rounded-xl bg-gradient-to-br ${cfg.gradient} text-white flex items-center justify-center text-base shadow-sm`}>
                    {cfg.emoji}
                  </div>
                  <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-md ${cfg.badge}`}>
                    {isOff ? "OFF" : sh.shift.slice(0, 3).toUpperCase()}
                  </span>
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Detailed Shift Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shifts.map((sh, idx) => {
              const cfg = getShiftConfig(sh.shift);
              const isActive = sh.status === "Active";
              const isOff = sh.status === "Off";

              return (
                <motion.div
                  key={sh.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 + 0.1 }}
                  className={`rounded-2xl border overflow-hidden transition-all duration-200 ${
                    isActive
                      ? "border-rose-300 dark:border-rose-800 shadow-lg ring-2 ring-rose-400/20"
                      : isOff
                      ? "border-border opacity-80 bg-secondary/20"
                      : "border-border bg-card shadow-sm hover:shadow-card hover:border-primary/30 hover:-translate-y-0.5"
                  }`}
                >
                  {/* Coloured accent top bar */}
                  <div className={`h-1.5 w-full bg-gradient-to-r ${cfg.gradient}`} />

                  <div className="p-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${cfg.gradient} text-white flex items-center justify-center text-lg shadow-sm`}>
                          {cfg.emoji}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-foreground">{sh.day}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{sh.date}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isActive && (
                          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 text-[9px] px-2 py-0.5 font-bold animate-pulse">
                            ACTIVE
                          </Badge>
                        )}
                        <Badge className={`${cfg.badge} text-[9px] font-mono border-0`}>
                          {sh.shift}
                        </Badge>
                      </div>
                    </div>

                    {isOff ? (
                      <div className="py-6 text-center space-y-2">
                        <div className="text-4xl">☕</div>
                        <div className="text-sm font-bold text-foreground">Scheduled Rest Day</div>
                        <p className="text-xs text-muted-foreground">You've earned it — enjoy your time off!</p>
                        <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 text-[10px] mt-2">
                          <CheckCircle className="h-3 w-3 mr-1" /> Rest & Recharge
                        </Badge>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Time & Floor Row */}
                        <div className={`flex items-center justify-between p-2.5 rounded-xl ${cfg.bg} border ${cfg.border}`}>
                          <div className="flex items-center gap-1.5 text-xs font-mono">
                            <Clock className={`h-3.5 w-3.5 ${cfg.textColor}`} />
                            <span className="font-semibold text-foreground">{sh.time}</span>
                          </div>
                          <Badge variant="outline" className={`text-[9px] font-mono border-0 ${cfg.bg} ${cfg.textColor}`}>
                            {sh.floor}
                          </Badge>
                        </div>

                        {/* Ward & Supervisor */}
                        <div className="bg-secondary/50 rounded-xl p-2.5 border border-border/60 space-y-1.5 text-xs">
                          <div className="font-semibold text-foreground flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                            {sh.ward}
                          </div>
                          <div className="flex items-center justify-between text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Stethoscope className="h-3 w-3" />
                              {sh.supervisor}
                            </span>
                            <span className="font-mono font-bold text-primary flex items-center gap-1">
                              <HeartPulse className="h-3 w-3" />
                              {sh.patientsCount} pts
                            </span>
                          </div>
                        </div>

                        {/* Buddy nurse */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground flex items-center gap-1 truncate max-w-[60%]">
                            <Users className="h-3 w-3 shrink-0" />
                            <span className="truncate">Buddy: {sh.buddyNurse}</span>
                          </span>
                          {!isActive && (
                            <button
                              onClick={() => handleOpenSwap(sh)}
                              className="text-rose-600 dark:text-rose-400 font-bold text-[11px] flex items-center gap-0.5 hover:underline cursor-pointer"
                            >
                              <ArrowRightLeft className="h-3 w-3" /> Swap
                            </button>
                          )}
                        </div>

                        {/* Active shift tasks */}
                        {isActive && sh.tasksCompleted !== undefined && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                              <span>Today's Tasks</span>
                              <span className="font-bold text-foreground">{sh.tasksCompleted}/{sh.tasksTotal}</span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-rose-500 to-pink-400 rounded-full transition-all duration-700"
                                style={{ width: `${Math.round(((sh.tasksCompleted || 0) / (sh.tasksTotal || 1)) * 100)}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ══════════════════════════════════════════════ */}
        {/* QUICK ACTIONS STRIP                           */}
        {/* ══════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: FileText, label: "Handover Notes", sub: `${savedNotes.length} logged`, onClick: () => setHandoverOpen(true), color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/50" },
            { icon: ArrowRightLeft, label: "Shift Swap", sub: "Request exchange", onClick: () => handleOpenSwap(shifts[1]), color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50" },
            { icon: BarChart3, label: "Performance", sub: "View my stats", onClick: () => toast.info("Performance report coming soon!"), color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-950/50" },
            { icon: UserCheck, label: "Leave Request", sub: "Apply for time off", onClick: () => toast.info("Leave request form opening…"), color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/30 hover:bg-violet-100 dark:hover:bg-violet-950/50" },
          ].map((action, i) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 + 0.3 }}
              onClick={action.onClick}
              className={`${action.bg} border border-border rounded-2xl p-4 text-left transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer group`}
            >
              <div className={`h-9 w-9 rounded-xl bg-white dark:bg-card flex items-center justify-center shadow-sm mb-3 ${action.color} group-hover:scale-110 transition-transform`}>
                <action.icon className="h-4.5 w-4.5" />
              </div>
              <div className="font-bold text-sm text-foreground">{action.label}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{action.sub}</div>
            </motion.button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════ */}
        {/* MONTHLY ATTENDANCE CALENDAR                    */}
        {/* ══════════════════════════════════════════════ */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                Monthly Attendance & Leave Calendar
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Track daily check-ins, leaves, and apply for time off</p>
            </div>
          </div>
          <ScheduleCalendar role="nurse" accentClass="bg-gradient-red" />
        </div>

        {/* ══════════════════════════════════════════════ */}
        {/* HANDOVER NOTES STRIP (always visible)          */}
        {/* ══════════════════════════════════════════════ */}
        <AnimatePresence>
          {savedNotes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <ClipboardList className="h-4.5 w-4.5 text-rose-500" />
                  Logged Handover Notes — This Shift
                  <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-[10px]">{savedNotes.length}</Badge>
                </h2>
                <Button
                  size="sm"
                  onClick={() => setHandoverOpen(true)}
                  className="bg-gradient-red text-white text-xs font-bold h-8 px-3 rounded-xl cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Note
                </Button>
              </div>
              <div className="space-y-2">
                {savedNotes.map((n, i) => (
                  <div key={i} className="flex items-start gap-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-3.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-foreground leading-relaxed">{n}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════════ */}
        {/* SHIFT SWAP MODAL                              */}
        {/* ══════════════════════════════════════════════ */}
        <Dialog open={swapOpen} onOpenChange={setSwapOpen}>
          <DialogContent className="bg-card text-card-foreground border-border sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-rose-500" />
                Request Duty Shift Swap
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Propose a shift exchange with another staff nurse on duty.
              </DialogDescription>
            </DialogHeader>

            {selectedShiftForSwap && (
              <div className="space-y-3 my-2 text-xs">
                <div className="bg-secondary/60 p-3 rounded-xl border space-y-1">
                  <div className="font-bold text-foreground flex justify-between">
                    <span>{selectedShiftForSwap.day} ({selectedShiftForSwap.date})</span>
                    <Badge className={`${getShiftConfig(selectedShiftForSwap.shift).badge} text-[9px] border-0`}>
                      {selectedShiftForSwap.shift} Shift
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{selectedShiftForSwap.ward} • {selectedShiftForSwap.time}</p>
                </div>

                <div>
                  <label className="font-semibold text-foreground">Select Replacement Nurse *</label>
                  <select
                    value={swapTargetNurse}
                    onChange={(e) => setSwapTargetNurse(e.target.value)}
                    className="mt-1 w-full bg-background border border-border rounded-xl h-9 px-3 text-xs text-foreground"
                  >
                    <option value="Nurse Sarah Jenkins">Nurse Sarah Jenkins (Floor 2 ICU)</option>
                    <option value="Nurse Fatima Zahra">Nurse Fatima Zahra (Floor 1 ER)</option>
                    <option value="Nurse Ayesha Siddiqui">Nurse Ayesha Siddiqui (Floor 3 General)</option>
                    <option value="Nurse Rabia Basri">Nurse Rabia Basri (Floor 4 Maternity)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-foreground">Reason for Shift Swap *</label>
                  <Input
                    placeholder="e.g. Medical appointment, family emergency..."
                    value={swapReason}
                    onChange={(e) => setSwapReason(e.target.value)}
                    className="mt-1 bg-background border-border text-xs"
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="ghost" onClick={() => setSwapOpen(false)} className="text-xs cursor-pointer">
                Cancel
              </Button>
              <Button onClick={handleSendSwap} className="bg-gradient-red text-white text-xs font-bold cursor-pointer">
                <Send className="h-3.5 w-3.5 mr-1.5" /> Submit Swap Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ══════════════════════════════════════════════ */}
        {/* HANDOVER NOTES MODAL                          */}
        {/* ══════════════════════════════════════════════ */}
        <Dialog open={handoverOpen} onOpenChange={setHandoverOpen}>
          <DialogContent className="bg-card text-card-foreground border-border sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-rose-500" />
                Shift Handover & Patient Clinical Notes
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Log critical care instructions for the incoming evening shift nurse.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2 text-xs">
              <div>
                <label className="font-semibold text-foreground">Add New Handover Note</label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="e.g. Bed-205 dressing changed. Drain output 50ml clear..."
                    value={handoverNote}
                    onChange={(e) => setHandoverNote(e.target.value)}
                    className="bg-background border-border text-xs"
                    onKeyDown={(e) => e.key === "Enter" && handleAddHandover()}
                  />
                  <Button onClick={handleAddHandover} className="bg-gradient-red text-white text-xs font-bold shrink-0 cursor-pointer">
                    <Plus className="h-4 w-4" /> Add
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider block">
                  Logged Handover Notes for This Shift ({savedNotes.length})
                </span>
                <div className="space-y-2 max-h-52 overflow-y-auto">
                  {savedNotes.map((n, i) => (
                    <div key={i} className="bg-secondary/60 p-3 rounded-xl border border-border flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <p className="text-foreground text-xs leading-relaxed">{n}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setHandoverOpen(false)} className="text-xs cursor-pointer">
                Close Handover
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </AppShell>
  );
}
