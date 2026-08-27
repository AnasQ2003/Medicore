import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BedDouble,
  Building2,
  Layers,
  User,
  Activity,
  HeartPulse,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  DollarSign,
  Receipt,
  Edit3,
  TrendingUp,
  Search,
  Plus,
  Stethoscope,
  X,
  Zap,
  Filter,
  Check,
  Calendar,
  Thermometer,
  Gauge,
  ShieldCheck,
  BarChart3,
  Users,
  AlertTriangle,
  Star,
  Info,
} from "lucide-react";

export type BedStatus = "Occupied" | "Available" | "Reserved" | "Maintenance";

export interface BedInfo {
  bedId: string;
  roomNo: string;
  floorNo: string;
  ward: string;
  status: BedStatus;
  bedType?: string;
  patient?: string;
  patientCode?: string;
  gender?: "Male" | "Female";
  age?: number;
  admittedAt?: string;
  admittedDays?: number;
  condition?: string;
  attendingDoctor?: string;
  dailyRate?: number;
  nursingCharges?: number;
  medsCharges?: number;
  vitals?: {
    bp: string;
    hr: number;
    temp: string;
    spo2: number;
  };
  nextReview?: string;
  notes?: string;
  reservedFor?: string;
  reservedEta?: string;
  equipment?: string[];
}

interface CinemaFloorBedMapProps {
  beds: BedInfo[];
  selectedFloor?: string;
  onFloorChange?: (floor: string) => void;
  onSelectBed: (bed: BedInfo) => void;
  onEditBed?: (bed: BedInfo) => void;
  readOnly?: boolean;
}

const FLOORS = [
  { id: "Floor 1", label: "Floor 1", wing: "Emergency & General Medical", emoji: "🚑", desc: "Trauma Bay, Obs Rooms 101–115", color: "from-orange-500 to-red-500" },
  { id: "Floor 2", label: "Floor 2", wing: "ICU & Surgical Recovery", emoji: "❤️", desc: "ICU Suites 01-03, Rooms 205, 206", color: "from-rose-500 to-pink-500" },
  { id: "Floor 3", label: "Floor 3", wing: "General Ward & Ortho", emoji: "🦴", desc: "Rooms 302, 312 • Post-Op & Rehab", color: "from-blue-500 to-indigo-500" },
  { id: "Floor 4", label: "Floor 4", wing: "Maternity & Neonatal", emoji: "👶", desc: "Rooms 408, 409 • NICU & Labour", color: "from-pink-400 to-rose-400" },
  { id: "Floor 5", label: "Floor 5", wing: "Neurology & VIP Suites", emoji: "🧠", desc: "Rooms 501, 502 • Private VIP", color: "from-violet-500 to-purple-500" },
  { id: "All Floors", label: "All", wing: "Full Hospital Matrix", emoji: "🏥", desc: "42+ beds across all wings", color: "from-slate-600 to-slate-800" },
];

export function CinemaFloorBedMap({
  beds,
  selectedFloor: controlledFloor,
  onFloorChange,
  onSelectBed,
  onEditBed,
  readOnly = false,
}: CinemaFloorBedMapProps) {
  const [internalFloor, setInternalFloor] = useState<string>("Floor 2");
  const activeFloor = controlledFloor || internalFloor;

  const [statusFilter, setStatusFilter] = useState<BedStatus | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredBed, setHoveredBed] = useState<BedInfo | null>(null);

  const handleFloorClick = (f: string) => {
    if (onFloorChange) {
      onFloorChange(f);
    } else {
      setInternalFloor(f);
    }
    setStatusFilter("All");
    setSearchQuery("");
  };

  // Filter beds for the active floor
  const floorBeds = useMemo(() => {
    let result = activeFloor === "All Floors" ? beds : beds.filter((b) => b.floorNo === activeFloor);
    if (statusFilter !== "All") result = result.filter((b) => b.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.bedId.toLowerCase().includes(q) ||
          b.roomNo.toLowerCase().includes(q) ||
          b.ward.toLowerCase().includes(q) ||
          (b.patient && b.patient.toLowerCase().includes(q)) ||
          (b.condition && b.condition.toLowerCase().includes(q))
      );
    }
    return result;
  }, [beds, activeFloor, statusFilter, searchQuery]);

  // Group beds by Room
  const roomGroups = useMemo(() => {
    const map = new Map<string, { roomNo: string; ward: string; floorNo: string; beds: BedInfo[] }>();
    floorBeds.forEach((b) => {
      const key = `${b.floorNo}-${b.roomNo}`;
      if (!map.has(key)) {
        map.set(key, { roomNo: b.roomNo, ward: b.ward, floorNo: b.floorNo, beds: [] });
      }
      map.get(key)!.beds.push(b);
    });
    return Array.from(map.values()).sort((a, b) => a.roomNo.localeCompare(b.roomNo));
  }, [floorBeds]);

  // Stats for the active floor
  const floorStats = useMemo(() => {
    const rawFloorBeds = activeFloor === "All Floors" ? beds : beds.filter((b) => b.floorNo === activeFloor);
    const total = rawFloorBeds.length;
    const occupied = rawFloorBeds.filter((b) => b.status === "Occupied").length;
    const available = rawFloorBeds.filter((b) => b.status === "Available").length;
    const reserved = rawFloorBeds.filter((b) => b.status === "Reserved").length;
    const maintenance = rawFloorBeds.filter((b) => b.status === "Maintenance").length;
    const rate = total > 0 ? Math.round((occupied / total) * 100) : 0;
    const revenue = rawFloorBeds
      .filter((b) => b.status === "Occupied")
      .reduce((acc, b) => acc + (b.dailyRate || 3500) * (b.admittedDays || 1) + (b.nursingCharges || 1200) + (b.medsCharges || 800), 0);
    return { total, occupied, available, reserved, maintenance, rate, revenue };
  }, [beds, activeFloor]);

  const activeFloorMeta = FLOORS.find((f) => f.id === activeFloor) || FLOORS[1];

  const getStatusStyle = (status: BedStatus) => {
    switch (status) {
      case "Occupied":
        return {
          card: "bg-gradient-to-b from-rose-500 via-rose-600 to-rose-700 border-rose-400 text-white shadow-lg ring-2 ring-rose-300/60",
          hover: "hover:shadow-rose-300/50 hover:shadow-xl",
          dot: "bg-white animate-ping",
          badgeBg: "bg-white/20 text-white",
          accent: "border-t-2 border-rose-300",
        };
      case "Available":
        return {
          card: "bg-gradient-to-b from-emerald-500 via-emerald-600 to-emerald-700 border-emerald-400 text-white shadow-md ring-2 ring-emerald-300/50",
          hover: "hover:shadow-emerald-300/40 hover:shadow-xl",
          dot: "bg-emerald-300",
          badgeBg: "bg-white/20 text-white",
          accent: "border-t-2 border-emerald-300",
        };
      case "Reserved":
        return {
          card: "bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 border-amber-300 text-amber-950 shadow-md ring-2 ring-amber-300/50",
          hover: "hover:shadow-amber-300/40 hover:shadow-xl",
          dot: "bg-amber-200",
          badgeBg: "bg-amber-950/15 text-amber-950",
          accent: "border-t-2 border-amber-200",
        };
      default:
        return {
          card: "bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-sm",
          hover: "hover:shadow-slate-200/50",
          dot: "bg-slate-400",
          badgeBg: "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
          accent: "border-t-2 border-slate-300",
        };
    }
  };

  return (
    <div className="bg-card text-card-foreground rounded-3xl border border-border shadow-card p-4 sm:p-6 lg:p-8 space-y-6 relative overflow-hidden">
      {/* Background ambiance */}
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-rose-500/4 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-500/4 blur-3xl pointer-events-none" />

      {/* ═══════════════════════════════════════ */}
      {/* HEADER + FLOOR NAVIGATOR               */}
      {/* ═══════════════════════════════════════ */}
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-5 border-b border-border pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono tracking-widest text-rose-600 dark:text-rose-400 uppercase font-bold flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-rose-500" /> Cinema Bed Map
            </span>
            <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 text-[10px] font-mono font-bold">
              🎦 LIVE BLUEPRINT
            </Badge>
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 text-[10px] font-mono animate-pulse">
              ● REAL-TIME
            </Badge>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-card-foreground tracking-tight">
            {activeFloorMeta.emoji} {activeFloorMeta.label}: {activeFloorMeta.wing}
          </h2>
          <p className="text-xs text-muted-foreground">{activeFloorMeta.desc}</p>
        </div>

        {/* Floor Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap bg-secondary/80 p-1.5 rounded-2xl border border-border">
          {FLOORS.map((f) => {
            const isSelected = activeFloor === f.id;
            const countOnFloor = f.id === "All Floors" ? beds.length : beds.filter((b) => b.floorNo === f.id).length;
            const occOnFloor = f.id === "All Floors"
              ? beds.filter((b) => b.status === "Occupied").length
              : beds.filter((b) => b.floorNo === f.id && b.status === "Occupied").length;

            return (
              <button
                key={f.id}
                onClick={() => handleFloorClick(f.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md scale-[1.02]"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/80"
                }`}
              >
                <span>{f.emoji}</span>
                <span>{f.label}</span>
                <span className={`text-[9px] px-1.5 rounded-md font-mono leading-[1.4] ${
                  isSelected ? "bg-white/25 text-white" : "bg-secondary text-muted-foreground border border-border/60"
                }`}>
                  {occOnFloor}/{countOnFloor}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════ */}
      {/* FLOOR STATS DASHBOARD                  */}
      {/* ═══════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total Beds", value: floorStats.total, icon: BedDouble, color: "text-slate-600 dark:text-slate-300", bg: "bg-slate-50 dark:bg-slate-800/60", border: "border-slate-200 dark:border-slate-700" },
          { label: "Occupied", value: floorStats.occupied, icon: Users, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/30", border: "border-rose-200 dark:border-rose-900" },
          { label: "Available", value: floorStats.available, icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-900" },
          { label: "Reserved", value: floorStats.reserved, icon: Clock, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-900" },
          { label: "Maintenance", value: floorStats.maintenance, icon: AlertTriangle, color: "text-slate-500 dark:text-slate-400", bg: "bg-slate-50 dark:bg-slate-800/50", border: "border-slate-200 dark:border-slate-700" },
          { label: "Occupancy Rate", value: `${floorStats.rate}%`, icon: BarChart3, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-900" },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} border ${stat.border} rounded-2xl p-3.5 flex flex-col justify-between`}>
            <div className={`h-7 w-7 rounded-lg bg-white dark:bg-card flex items-center justify-center shadow-sm mb-2 ${stat.color}`}>
              <stat.icon className="h-3.5 w-3.5" />
            </div>
            <div className={`text-xl font-black font-mono ${stat.color}`}>{stat.value}</div>
            <div className="text-[10px] text-muted-foreground font-medium mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Occupancy bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-muted-foreground flex items-center gap-1"><Activity className="h-3.5 w-3.5 text-rose-500" /> Floor Occupancy Progress</span>
          <span className="font-bold text-foreground">{floorStats.rate}% filled • {floorStats.occupied}/{floorStats.total} beds</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-3 overflow-hidden relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${floorStats.rate}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`h-full rounded-full ${
              floorStats.rate > 85 ? "bg-gradient-to-r from-rose-500 to-red-500" :
              floorStats.rate > 60 ? "bg-gradient-to-r from-amber-400 to-orange-400" :
              "bg-gradient-to-r from-emerald-400 to-teal-400"
            }`}
          />
          {/* reserved strip */}
          {floorStats.total > 0 && (
            <div
              className="absolute top-0 h-full bg-amber-400/60 rounded-r-full"
              style={{
                left: `${floorStats.rate}%`,
                width: `${Math.round((floorStats.reserved / floorStats.total) * 100)}%`
              }}
            />
          )}
        </div>
        <div className="flex items-center gap-4 text-[10px] text-muted-foreground flex-wrap font-mono">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" /> Occupied ({floorStats.occupied})</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" /> Reserved ({floorStats.reserved})</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Available ({floorStats.available})</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-400" /> Maintenance ({floorStats.maintenance})</span>
        </div>
      </div>

      {/* ═══════════════════════════════════════ */}
      {/* FILTER & SEARCH TOOLBAR                */}
      {/* ═══════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-secondary/40 p-3 rounded-2xl border border-border">
        <div className="flex items-center gap-1.5 flex-wrap text-xs font-semibold">
          {(["All", "Available", "Occupied", "Reserved", "Maintenance"] as const).map((s) => {
            const counts: Record<string, number> = { All: floorStats.total, Available: floorStats.available, Occupied: floorStats.occupied, Reserved: floorStats.reserved, Maintenance: floorStats.maintenance };
            const colors: Record<string, string> = {
              All: statusFilter === "All" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground hover:bg-background/80",
              Available: statusFilter === "Available" ? "bg-emerald-600 text-white" : "text-muted-foreground hover:text-emerald-600 hover:bg-background/80",
              Occupied: statusFilter === "Occupied" ? "bg-rose-600 text-white" : "text-muted-foreground hover:text-rose-600 hover:bg-background/80",
              Reserved: statusFilter === "Reserved" ? "bg-amber-500 text-slate-950" : "text-muted-foreground hover:text-amber-600 hover:bg-background/80",
              Maintenance: statusFilter === "Maintenance" ? "bg-slate-600 text-white" : "text-muted-foreground hover:text-slate-600 hover:bg-background/80",
            };
            const dotColors: Record<string, string> = { Available: "bg-emerald-500", Occupied: "bg-rose-500 animate-pulse", Reserved: "bg-amber-500", Maintenance: "bg-slate-400", All: "" };
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s as BedStatus | "All")}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${colors[s]}`}
              >
                {s !== "All" && <span className={`h-2 w-2 rounded-full ${dotColors[s]}`} />}
                {s === "All" ? "All Beds" : s} ({counts[s]})
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search bed, patient, room, condition..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 text-xs bg-background border-border"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════ */}
      {/* CINEMA SCREEN BANNER (Nursing Station)  */}
      {/* ═══════════════════════════════════════ */}
      <div className="relative flex flex-col items-center justify-center py-1">
        <div className="w-full max-w-3xl h-2 rounded-full bg-gradient-to-r from-transparent via-rose-500/60 to-transparent opacity-80 blur-[1px]" />
        <div className="w-full max-w-2xl h-0.5 rounded-full bg-gradient-to-r from-transparent via-rose-400 to-transparent opacity-90 -mt-1" />
        <div className="bg-card border border-border px-6 py-2 rounded-full mt-2 shadow-sm flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[11px] font-mono font-bold tracking-wider text-card-foreground uppercase">
            🏥 MAIN NURSING STATION & CENTRAL CORRIDOR — {activeFloor.toUpperCase()}
          </span>
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
        </div>
        <p className="text-[10px] text-muted-foreground font-mono mt-1">Beds facing the central telemetry & nursing monitoring bay</p>
      </div>

      {/* ═══════════════════════════════════════ */}
      {/* BED MATRIX ROOMS                       */}
      {/* ═══════════════════════════════════════ */}
      <div className="space-y-6">
        {roomGroups.length === 0 ? (
          <div className="text-center py-16 bg-secondary/20 rounded-2xl border border-dashed border-border text-muted-foreground space-y-3">
            <BedDouble className="h-10 w-10 mx-auto opacity-30 text-rose-400" />
            <p className="text-sm font-semibold">No beds matching the active filter or search</p>
            <Button size="sm" variant="outline" onClick={() => { setStatusFilter("All"); setSearchQuery(""); }} className="text-xs cursor-pointer">
              <X className="h-3.5 w-3.5 mr-1" /> Clear Filters
            </Button>
          </div>
        ) : (
          roomGroups.map((group) => {
            const isICU = group.ward.toLowerCase().includes("icu");
            const isMaternity = group.ward.toLowerCase().includes("matern") || group.ward.toLowerCase().includes("neonatal");
            const roomOccupied = group.beds.filter((b) => b.status === "Occupied").length;
            const roomOccRate = group.beds.length > 0 ? Math.round((roomOccupied / group.beds.length) * 100) : 0;

            return (
              <motion.div
                key={`${group.floorNo}-${group.roomNo}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
                  isICU
                    ? "bg-rose-50/40 dark:bg-rose-950/15 border-rose-200 dark:border-rose-900/60 shadow-sm"
                    : isMaternity
                    ? "bg-pink-50/40 dark:bg-pink-950/15 border-pink-200 dark:border-pink-900/60 shadow-sm"
                    : "bg-card border-border shadow-sm hover:shadow-card"
                }`}
              >
                {/* Room Header */}
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-border/60 ${
                  isICU ? "bg-rose-100/50 dark:bg-rose-950/30" : isMaternity ? "bg-pink-100/50 dark:bg-pink-950/30" : "bg-secondary/30"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${
                      isICU ? "bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400"
                      : isMaternity ? "bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400"
                      : "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                    }`}>
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-black text-base text-card-foreground">Room {group.roomNo}</h3>
                        {isICU && (
                          <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 text-[9px] px-2 font-bold">ICU</Badge>
                        )}
                        {isMaternity && (
                          <Badge className="bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300 text-[9px] px-2 font-bold">MATERNITY</Badge>
                        )}
                        <span className="text-xs text-muted-foreground font-mono">({group.ward})</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono mt-0.5 flex-wrap">
                        <span>{group.floorNo}</span>
                        <span>•</span>
                        <span>{group.beds.length} bed stations</span>
                        <span>•</span>
                        <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                          <Check className="h-3 w-3" /> Nurse Station Live
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Room occupancy pill */}
                    <div className="flex items-center gap-2 bg-white dark:bg-card border border-border rounded-xl px-3 py-2">
                      <div className="text-xs font-mono text-muted-foreground">Room Occupancy</div>
                      <div className="font-black text-sm text-foreground font-mono">
                        {roomOccupied}/{group.beds.length}
                      </div>
                      <div className="w-12 bg-secondary rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${roomOccRate > 80 ? "bg-rose-500" : roomOccRate > 50 ? "bg-amber-400" : "bg-emerald-500"}`}
                          style={{ width: `${roomOccRate}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="outline" className="border-border text-muted-foreground font-mono text-[9px] bg-secondary/60">
                        AC • O₂ Pipeline
                      </Badge>
                      <Badge variant="outline" className="border-border text-muted-foreground font-mono text-[9px] bg-secondary/60">
                        Nurse Call • IV Stand
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* BED SEAT CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 sm:p-5">
                  {group.beds.map((bed, bedIdx) => {
                    const style = getStatusStyle(bed.status);
                    const isOccupied = bed.status === "Occupied";
                    const isAvailable = bed.status === "Available";
                    const isReserved = bed.status === "Reserved";
                    const isMaint = bed.status === "Maintenance";
                    const totalBill = isOccupied ? ((bed.dailyRate || 3500) * (bed.admittedDays || 1)) + (bed.nursingCharges || 1200) + (bed.medsCharges || 800) : 0;

                    return (
                      <motion.div
                        key={bed.bedId}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: bedIdx * 0.03 }}
                        whileHover={{ scale: 1.03, y: -4 }}
                        whileTap={{ scale: 0.97 }}
                        onMouseEnter={() => setHoveredBed(bed)}
                        onMouseLeave={() => setHoveredBed(null)}
                        onClick={() => onSelectBed(bed)}
                        className={`relative rounded-2xl border cursor-pointer transition-all duration-200 overflow-hidden min-h-[190px] flex flex-col ${style.card} ${style.hover}`}
                      >
                        {/* Headrest accent line */}
                        <div className="h-2 w-full bg-white/30" />

                        <div className="flex flex-col flex-1 p-3.5 gap-2">
                          {/* TOP: Bed ID + Status Badge */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-1.5">
                              <BedDouble className="h-4 w-4 opacity-90 shrink-0" />
                              <span className="font-black text-sm font-mono tracking-tight">{bed.bedId}</span>
                            </div>
                            <div className="flex items-center gap-1 flex-wrap justify-end">
                              {isOccupied && (
                                <Badge className="bg-white/20 text-white text-[8px] font-mono px-1.5 py-0 border-none flex items-center gap-0.5">
                                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" /> BOOKED
                                </Badge>
                              )}
                              {isAvailable && (
                                <Badge className="bg-white/20 text-white text-[8px] font-mono px-1.5 py-0 border-none">✓ READY</Badge>
                              )}
                              {isReserved && (
                                <Badge className="bg-black/10 text-amber-950 text-[8px] font-mono px-1.5 py-0 border-none font-bold">RESERVED</Badge>
                              )}
                              {isMaint && (
                                <Badge className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[8px] font-mono px-1.5 py-0 border-none">SERVICE</Badge>
                              )}
                            </div>
                          </div>

                          {/* Middle: Content */}
                          <div className="flex-1 space-y-1.5">
                            {isOccupied ? (
                              <>
                                {/* Patient info */}
                                <div className="flex items-center gap-1.5">
                                  <div className="h-5 w-5 rounded-full bg-white/25 flex items-center justify-center shrink-0">
                                    <User className="h-3 w-3" />
                                  </div>
                                  <span className="font-bold text-xs truncate max-w-[140px]">{bed.patient}</span>
                                </div>
                                <div className="text-[10px] opacity-85 font-mono truncate">
                                  {bed.patientCode} · {bed.gender ?? "—"} · {bed.age ?? "—"}y
                                </div>
                                <div className="text-[10px] opacity-85 truncate font-medium">
                                  {bed.condition ?? "General Inpatient"}
                                </div>
                                {/* Vitals mini bar */}
                                {bed.vitals && (
                                  <div className="bg-black/20 px-2 py-1 rounded-lg text-[9px] font-mono flex items-center justify-between text-white/90 gap-1 flex-wrap">
                                    <span className="flex items-center gap-0.5"><HeartPulse className="h-2.5 w-2.5" /> {bed.vitals.hr}</span>
                                    <span>BP:{bed.vitals.bp}</span>
                                    <span>SpO2:{bed.vitals.spo2}%</span>
                                    <span>T:{bed.vitals.temp}</span>
                                  </div>
                                )}
                              </>
                            ) : isAvailable ? (
                              <>
                                <div className="text-xs font-bold text-white flex items-center gap-1">
                                  <Sparkles className="h-3.5 w-3.5 text-emerald-200" /> Sanitized & Ready
                                </div>
                                <div className="text-[10px] text-white/85 font-mono">
                                  Rate: Rs.{(bed.dailyRate || 3500).toLocaleString()}/day
                                </div>
                                <div className="text-[10px] text-white/75 font-mono">
                                  O₂ · Telemetry · IV Set Ready
                                </div>
                                <div className="text-[10px] text-white/75 font-mono">
                                  {bed.bedType ?? "Standard Inpatient Bed"}
                                </div>
                              </>
                            ) : isReserved ? (
                              <>
                                <div className="text-xs font-bold text-amber-950 flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" /> Scheduled Intake
                                </div>
                                <div className="text-[10px] text-amber-950/85 font-mono">
                                  ETA: {bed.reservedEta ?? "01:30 PM Today"}
                                </div>
                                {bed.reservedFor && (
                                  <div className="text-[10px] text-amber-950/75 font-mono truncate">
                                    For: {bed.reservedFor}
                                  </div>
                                )}
                                <div className="text-[10px] text-amber-950/75 font-mono">{group.ward}</div>
                              </>
                            ) : (
                              <>
                                <div className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                                  <AlertCircle className="h-3.5 w-3.5" /> Under Maintenance
                                </div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                  Terminal sterilization in progress
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  Est. ready: ~2 hours
                                </div>
                              </>
                            )}
                          </div>

                          {/* Bottom footer */}
                          <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[10px] font-mono">
                            {isOccupied ? (
                              <>
                                <span className="text-white/85">Day {bed.admittedDays ?? 1}</span>
                                <span className="text-white font-bold bg-black/20 px-2 py-0.5 rounded-lg">
                                  Rs.{totalBill.toLocaleString()} ➔
                                </span>
                              </>
                            ) : isAvailable ? (
                              <>
                                <span className="text-emerald-100">Ready for Intake</span>
                                <span className="text-white bg-white/20 px-2 py-0.5 rounded-lg font-bold hover:bg-white/30 transition-colors">
                                  Admit ➔
                                </span>
                              </>
                            ) : isReserved ? (
                              <>
                                <span className="text-amber-950 font-semibold">Incoming</span>
                                <span className="text-amber-950 font-bold underline">Intake ➔</span>
                              </>
                            ) : (
                              <>
                                <span className="text-slate-500">Maintenance</span>
                                <span className="text-slate-500 dark:text-slate-400">Servicing</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Edit button (top-right overlay, only for non-readonly) */}
                        {!readOnly && onEditBed && isOccupied && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onEditBed(bed); }}
                            className="absolute top-3 left-3 h-6 w-6 rounded-lg bg-white/20 hover:bg-white/35 transition-colors flex items-center justify-center cursor-pointer"
                            title="Edit bed details"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* ═══════════════════════════════════════ */}
      {/* FLOATING HOVER PREVIEW CARD            */}
      {/* ═══════════════════════════════════════ */}
      <AnimatePresence>
        {hoveredBed && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed bottom-6 right-6 z-50 bg-card text-card-foreground border border-rose-300 dark:border-rose-500/50 shadow-2xl rounded-2xl p-5 w-80 space-y-3 pointer-events-none backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <div className="flex items-center gap-2">
                <BedDouble className="h-4 w-4 text-rose-500" />
                <span className="font-extrabold text-sm font-mono text-card-foreground">Bed {hoveredBed.bedId}</span>
                <span className="text-[10px] text-muted-foreground font-mono">• Room {hoveredBed.roomNo}</span>
              </div>
              <Badge
                className={
                  hoveredBed.status === "Occupied" ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200"
                  : hoveredBed.status === "Available" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200"
                  : hoveredBed.status === "Reserved" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200"
                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }
              >
                {hoveredBed.status}
              </Badge>
            </div>

            <div className="text-xs space-y-2">
              {/* Location */}
              <div className="flex items-start gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-muted-foreground">
                  <strong className="text-card-foreground">{hoveredBed.ward}</strong> · Room {hoveredBed.roomNo} · {hoveredBed.floorNo}
                </span>
              </div>

              {hoveredBed.status === "Occupied" && hoveredBed.patient && (
                <>
                  {/* Patient identity */}
                  <div className="flex items-start gap-1.5">
                    <User className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-rose-600 dark:text-rose-400">{hoveredBed.patient}</span>
                      <span className="text-muted-foreground ml-1">({hoveredBed.patientCode})</span>
                    </div>
                  </div>
                  {/* Details row */}
                  <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                    <div className="bg-secondary/70 rounded-lg p-1.5 text-center">
                      <div className="text-muted-foreground">Gender</div>
                      <div className="font-bold text-foreground">{hoveredBed.gender ?? "—"}</div>
                    </div>
                    <div className="bg-secondary/70 rounded-lg p-1.5 text-center">
                      <div className="text-muted-foreground">Age</div>
                      <div className="font-bold text-foreground">{hoveredBed.age ? `${hoveredBed.age}y` : "—"}</div>
                    </div>
                    <div className="bg-secondary/70 rounded-lg p-1.5 text-center">
                      <div className="text-muted-foreground">Day</div>
                      <div className="font-bold text-foreground">Day {hoveredBed.admittedDays ?? 1}</div>
                    </div>
                  </div>
                  {/* Condition + Doctor */}
                  {hoveredBed.condition && (
                    <div className="text-muted-foreground">
                      Dx: <strong className="text-foreground">{hoveredBed.condition}</strong>
                    </div>
                  )}
                  {hoveredBed.attendingDoctor && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Stethoscope className="h-3 w-3" />
                      {hoveredBed.attendingDoctor}
                    </div>
                  )}
                  {/* Vitals */}
                  {hoveredBed.vitals && (
                    <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-lg p-2 grid grid-cols-4 gap-1 text-[10px] text-center">
                      <div><div className="text-muted-foreground">HR</div><div className="font-bold text-rose-600">{hoveredBed.vitals.hr}</div></div>
                      <div><div className="text-muted-foreground">BP</div><div className="font-bold text-foreground">{hoveredBed.vitals.bp}</div></div>
                      <div><div className="text-muted-foreground">SpO₂</div><div className="font-bold text-blue-600">{hoveredBed.vitals.spo2}%</div></div>
                      <div><div className="text-muted-foreground">Temp</div><div className="font-bold text-amber-600">{hoveredBed.vitals.temp}</div></div>
                    </div>
                  )}
                  {/* Billing summary */}
                  <div className="border-t border-border pt-2 space-y-1">
                    <div className="font-semibold text-[10px] text-muted-foreground uppercase tracking-wide">Accrued Billing</div>
                    {[
                      { label: "Room & Board", value: (hoveredBed.dailyRate || 3500) * (hoveredBed.admittedDays || 1) },
                      { label: "Nursing Charges", value: hoveredBed.nursingCharges ?? 1200 },
                      { label: "Medications", value: hoveredBed.medsCharges ?? 800 },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between text-[10px]">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-mono font-bold text-foreground">Rs.{item.value.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-[11px] font-black border-t border-border pt-1">
                      <span className="text-foreground">Total</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                        Rs.{(((hoveredBed.dailyRate || 3500) * (hoveredBed.admittedDays || 1)) + (hoveredBed.nursingCharges ?? 1200) + (hoveredBed.medsCharges ?? 800)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {hoveredBed.status === "Available" && (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-lg p-2.5 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px] flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  Cleaned, sterilized & ready for immediate admission.
                </div>
              )}

              {hoveredBed.status === "Reserved" && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 rounded-lg p-2.5 space-y-1">
                  <div className="font-semibold text-amber-800 dark:text-amber-300 text-[11px]">Reserved Intake</div>
                  <div className="text-muted-foreground text-[10px]">ETA: {hoveredBed.reservedEta ?? "01:30 PM"}</div>
                  {hoveredBed.reservedFor && <div className="text-muted-foreground text-[10px]">Patient: {hoveredBed.reservedFor}</div>}
                </div>
              )}
            </div>

            <p className="text-[10px] text-muted-foreground text-center font-mono border-t border-border pt-2">
              Click bed card to open full details, billing & edit options ➔
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
