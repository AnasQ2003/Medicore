import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ScheduleCalendar } from "@/components/ScheduleCalendar";
import { nurseNav } from "@/lib/roleNav";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
  AlertCircle,
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
}

const UPCOMING_SHIFTS: ShiftCard[] = [
  {
    id: "SH-01",
    day: "Thursday (Today)",
    date: "27 Aug",
    shift: "Morning",
    time: "08:00 AM – 04:00 PM",
    ward: "ICU & Surgical Recovery",
    floor: "Floor 2",
    supervisor: "Dr. Arshad Mahmood",
    patientsCount: 6,
    buddyNurse: "Nurse Sarah Jenkins",
    status: "Active",
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

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const end = new Date();
      end.setHours(16, 0, 0, 0); // 4 PM
      const diff = end.getTime() - now.getTime();
      if (diff > 0) {
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hrs}h ${mins}m`);
      } else {
        setTimeLeft("Shift Ending Soon");
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

  const getShiftIcon = (shift: ShiftCard["shift"]) => {
    switch (shift) {
      case "Morning":
        return <Sun className="h-4 w-4 text-amber-500" />;
      case "Evening":
        return <Sunset className="h-4 w-4 text-orange-500" />;
      case "Night":
        return <Moon className="h-4 w-4 text-indigo-500" />;
      case "Off":
        return <Coffee className="h-4 w-4 text-emerald-500" />;
      default:
        return <Flame className="h-4 w-4 text-rose-500" />;
    }
  };

  const getShiftBadge = (shift: ShiftCard["shift"]) => {
    switch (shift) {
      case "Morning":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200";
      case "Evening":
        return "bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300 border-orange-200";
      case "Night":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200";
      case "Off":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200";
      default:
        return "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200";
    }
  };

  return (
    <AppShell role="nurse" title="Nurse" nav={nurseNav}>
      <div className="space-y-6 max-w-7xl mx-auto pb-10">
        {/* TOP HERO: Active Shift Cockpit */}
        <div className="bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-purple-500/10 border border-rose-200 dark:border-rose-900/60 rounded-3xl p-6 sm:p-8 shadow-card relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold tracking-widest text-rose-600 dark:text-rose-400 uppercase flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-rose-500" /> Live Duty Station & Shift Roster
                </span>
                <Badge className="bg-emerald-500 text-white font-mono text-[10px] px-2 py-0.5 animate-pulse">
                  ON DUTY NOW
                </Badge>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-card-foreground tracking-tight flex items-center gap-3">
                <CalendarClock className="h-8 w-8 text-rose-600 dark:text-rose-400" />
                Morning Shift — Floor 2 ICU
              </h1>

              <p className="text-sm text-muted-foreground max-w-2xl">
                08:00 AM – 04:00 PM • Attending Consultant: <strong className="text-foreground">Dr. Arshad Mahmood</strong> • Handover Partner: <strong className="text-foreground">Nurse Sarah Jenkins</strong>
              </p>
            </div>

            {/* Shift Timer & Action Widget */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="bg-card/90 backdrop-blur-md border border-border px-4 py-3 rounded-2xl shadow-sm text-center min-w-[130px]">
                <div className="text-[10px] text-muted-foreground font-mono flex items-center justify-center gap-1">
                  <Timer className="h-3 w-3 text-rose-500" /> Shift Remaining
                </div>
                <div className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono mt-0.5">
                  {timeLeft}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={() => setHandoverOpen(true)}
                  className="bg-gradient-red text-white text-xs font-bold h-11 px-4 rounded-xl shadow-md hover:scale-[1.02] cursor-pointer"
                >
                  <FileText className="h-4 w-4 mr-1.5" /> Shift Handover Notes ({savedNotes.length})
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleOpenSwap(shifts[1])}
                  className="bg-card border-border hover:bg-secondary text-foreground text-xs font-bold h-11 px-4 rounded-xl cursor-pointer"
                >
                  <ArrowRightLeft className="h-4 w-4 mr-1.5 text-primary" /> Request Shift Swap
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-rose-200/60 dark:border-rose-900/40">
            <div className="bg-card/80 p-3 rounded-xl border border-border/80">
              <span className="text-[10px] text-muted-foreground font-medium block">Admitted Patients Under Care</span>
              <span className="text-lg font-black text-foreground font-mono">6 Patients</span>
            </div>
            <div className="bg-card/80 p-3 rounded-xl border border-border/80">
              <span className="text-[10px] text-muted-foreground font-medium block">Monthly Hours Logged</span>
              <span className="text-lg font-black text-foreground font-mono">168.0 Hrs</span>
            </div>
            <div className="bg-card/80 p-3 rounded-xl border border-border/80">
              <span className="text-[10px] text-muted-foreground font-medium block">Overtime Shift Allowance</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">PKR 21,750</span>
            </div>
            <div className="bg-card/80 p-3 rounded-xl border border-border/80">
              <span className="text-[10px] text-muted-foreground font-medium block">Punctuality Score</span>
              <span className="text-lg font-black text-primary font-mono">98.5% ⭐</span>
            </div>
          </div>
        </div>

        {/* SECTION 2: Upcoming 7-Day Shift Timeline */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-rose-500" />
                Upcoming 7-Day Duty Timeline
              </h2>
              <p className="text-xs text-muted-foreground">Interactive weekly roster & ward rotation</p>
            </div>
            <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
              Week 35 • 2026
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shifts.map((sh, idx) => {
              const isActive = sh.status === "Active";
              const isOff = sh.status === "Off";

              return (
                <motion.div
                  key={sh.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`rounded-2xl border p-4 transition-all duration-200 ${
                    isActive
                      ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800 shadow-md ring-2 ring-rose-500/20"
                      : isOff
                      ? "bg-secondary/40 border-border opacity-85"
                      : "bg-card border-border shadow-sm hover:shadow-card hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-background border shadow-xs">
                        {getShiftIcon(sh.shift)}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-foreground">{sh.day}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{sh.date}</div>
                      </div>
                    </div>

                    <Badge className={`${getShiftBadge(sh.shift)} text-[10px] font-mono`}>
                      {sh.shift}
                    </Badge>
                  </div>

                  {!isOff ? (
                    <div className="space-y-2 mt-3 text-xs">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="h-3 w-3 text-primary" /> {sh.time}
                        </span>
                        <span className="font-semibold text-foreground">{sh.floor}</span>
                      </div>

                      <div className="bg-background/80 p-2.5 rounded-xl border border-border/80 space-y-1">
                        <div className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-rose-500" /> {sh.ward}
                        </div>
                        <div className="text-[10px] text-muted-foreground flex justify-between">
                          <span>Supervisor: {sh.supervisor}</span>
                          <span className="font-mono text-primary">{sh.patientsCount} Beds</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                          Buddy: {sh.buddyNurse}
                        </span>
                        {!isActive && (
                          <button
                            onClick={() => handleOpenSwap(sh)}
                            className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                          >
                            <ArrowRightLeft className="h-3 w-3" /> Swap
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-center space-y-1">
                      <Coffee className="h-6 w-6 mx-auto text-emerald-500 opacity-80" />
                      <div className="text-xs font-bold text-foreground">Scheduled Rest & Recharge Day</div>
                      <p className="text-[10px] text-muted-foreground">Enjoy your time off!</p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: Monthly Attendance & Leave Management */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                Monthly Attendance & Leave Calendar
              </h2>
              <p className="text-xs text-muted-foreground">Track daily check-ins, leaves, and apply for time off</p>
            </div>
          </div>

          <ScheduleCalendar role="nurse" accentClass="bg-gradient-red" />
        </div>

        {/* MODAL 1: Request Shift Swap */}
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
                    <Badge className={getShiftBadge(selectedShiftForSwap.shift)}>{selectedShiftForSwap.shift} Shift</Badge>
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
              <Button variant="ghost" onClick={() => setSwapOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button onClick={handleSendSwap} className="bg-gradient-red text-white text-xs font-bold cursor-pointer">
                <Send className="h-3.5 w-3.5 mr-1.5" /> Submit Swap Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* MODAL 2: Shift Handover Notes */}
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
                <div className="space-y-2 max-h-48 overflow-y-auto">
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
