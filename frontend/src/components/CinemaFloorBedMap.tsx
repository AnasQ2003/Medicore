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
  Info,
  DollarSign,
  Receipt,
  Eye,
  Edit3,
  TrendingUp,
  Search,
  Plus,
  ShieldCheck,
  Zap,
  Filter,
  Check,
  UserPlus,
  Stethoscope,
  X,
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
  { id: "Floor 1", label: "Floor 1", wing: "Emergency & General Medical Wing", desc: "Rooms 101, 102, 114, 115 • Trauma & Observation Bays" },
  { id: "Floor 2", label: "Floor 2", wing: "ICU & Surgical Recovery Wing", desc: "ICU Suites 01-03, Rooms 205, 206 • Critical Telemetry" },
  { id: "Floor 3", label: "Floor 3", wing: "General Ward & Orthopedic Surgery", desc: "Rooms 302, 312 • Post-Op Recovery & Rehab" },
  { id: "Floor 4", label: "Floor 4", wing: "Maternity, Labor & Neonatal Care", desc: "Rooms 408, 409 • NICU & Birthing Suites" },
  { id: "Floor 5", label: "Floor 5", wing: "Neurology & Specialized Inpatient", desc: "Rooms 501, 502 • Private VIP Suites" },
  { id: "All Floors", label: "All Floors", wing: "Full Hospital Inpatient Matrix (42+ Beds)", desc: "All wings & medical bays" },
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
  };

  // Filter beds for the active floor
  const floorBeds = useMemo(() => {
    let result = activeFloor === "All Floors" ? beds : beds.filter((b) => b.floorNo === activeFloor);

    if (statusFilter !== "All") {
      result = result.filter((b) => b.status === statusFilter);
    }

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

  // Stats for the active floor (unfiltered by search/status for accuracy)
  const floorStats = useMemo(() => {
    const rawFloorBeds = activeFloor === "All Floors" ? beds : beds.filter((b) => b.floorNo === activeFloor);
    const total = rawFloorBeds.length;
    const occupied = rawFloorBeds.filter((b) => b.status === "Occupied").length;
    const available = rawFloorBeds.filter((b) => b.status === "Available").length;
    const reserved = rawFloorBeds.filter((b) => b.status === "Reserved").length;
    const maintenance = rawFloorBeds.filter((b) => b.status === "Maintenance").length;
    const rate = total > 0 ? Math.round((occupied / total) * 100) : 0;
    return { total, occupied, available, reserved, maintenance, rate };
  }, [beds, activeFloor]);

  const activeFloorMeta = FLOORS.find((f) => f.id === activeFloor) || FLOORS[1];

  return (
    <div className="bg-card text-card-foreground rounded-3xl border border-border shadow-card p-4 sm:p-6 lg:p-8 space-y-6 relative overflow-hidden">
      {/* Background soft ambiance */}
      <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-rose-500/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

      {/* TOP: Floor Navigator Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-widest text-rose-600 dark:text-rose-400 uppercase font-bold flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-rose-500" /> Interactive Floor Bed Matrix
            </span>
            <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800 text-[10px] font-mono font-bold">
              LIVE SEAT BLUEPRINT 🎦
            </Badge>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-card-foreground tracking-tight mt-1">
            {activeFloorMeta.label}: {activeFloorMeta.wing}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">{activeFloorMeta.desc}</p>
        </div>

        {/* Floor Switcher Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap bg-secondary/80 p-1.5 rounded-2xl border border-border">
          {FLOORS.map((f) => {
            const isSelected = activeFloor === f.id;
            const countOnFloor = f.id === "All Floors" ? beds.length : beds.filter((b) => b.floorNo === f.id).length;
            const occOnFloor = f.id === "All Floors" ? beds.filter((b) => b.status === "Occupied").length : beds.filter((b) => b.floorNo === f.id && b.status === "Occupied").length;

            return (
              <button
                key={f.id}
                onClick={() => handleFloorClick(f.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-gradient-red text-white shadow-md scale-105"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/80"
                }`}
              >
                <span>{f.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                    isSelected ? "bg-white/25 text-white" : "bg-secondary text-muted-foreground border border-border/60"
                  }`}
                >
                  {occOnFloor}/{countOnFloor}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-secondary/40 p-3 rounded-2xl border border-border">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs font-semibold">
          <button
            onClick={() => setStatusFilter("All")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              statusFilter === "All"
                ? "bg-primary text-white shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-background/80"
            }`}
          >
            All Beds ({floorStats.total})
          </button>
          <button
            onClick={() => setStatusFilter("Available")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === "Available"
                ? "bg-emerald-600 text-white shadow-xs font-bold"
                : "text-muted-foreground hover:text-emerald-600 hover:bg-background/80"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Available ({floorStats.available})
          </button>
          <button
            onClick={() => setStatusFilter("Occupied")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === "Occupied"
                ? "bg-rose-600 text-white shadow-xs font-bold"
                : "text-muted-foreground hover:text-rose-600 hover:bg-background/80"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            Occupied ({floorStats.occupied})
          </button>
          <button
            onClick={() => setStatusFilter("Reserved")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === "Reserved"
                ? "bg-amber-500 text-slate-950 shadow-xs font-bold"
                : "text-muted-foreground hover:text-amber-600 hover:bg-background/80"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Reserved ({floorStats.reserved})
          </button>
          <button
            onClick={() => setStatusFilter("Maintenance")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === "Maintenance"
                ? "bg-slate-600 text-white shadow-xs font-bold"
                : "text-muted-foreground hover:text-slate-600 hover:bg-background/80"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-slate-400" />
            Maintenance ({floorStats.maintenance})
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search bed, patient, room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs bg-background border-border"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* CINEMA-STYLE SCREEN BANNER: Main Corridor & Nursing Station */}
      <div className="relative my-3 flex flex-col items-center justify-center">
        <div className="w-full max-w-3xl h-2 rounded-full bg-gradient-to-r from-transparent via-rose-500/70 to-transparent opacity-80 blur-[1px]" />
        <div className="w-full max-w-2xl h-0.5 rounded-full bg-gradient-to-r from-transparent via-rose-400 to-transparent opacity-90 -mt-1" />
        <div className="bg-card border border-border px-6 py-1.5 rounded-full mt-2 shadow-sm flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[11px] font-mono font-bold tracking-wider text-card-foreground uppercase">
            🏥 MAIN NURSING STATION & CENTRAL ELEVATOR CORRIDOR — {activeFloor.toUpperCase()}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground font-mono mt-1">
          Beds facing the central telemetry & nursing monitoring bay
        </p>
      </div>

      {/* INTERACTIVE CINEMA-STYLE ROOM & BED SEAT MATRIX */}
      <div className="space-y-6 pt-1">
        {roomGroups.length === 0 ? (
          <div className="text-center py-12 bg-secondary/20 rounded-2xl border border-dashed border-border text-muted-foreground space-y-2">
            <BedDouble className="h-8 w-8 mx-auto opacity-40 text-rose-500" />
            <p className="text-sm font-semibold">No beds matching the active filter or search</p>
            <Button size="sm" variant="outline" onClick={() => { setStatusFilter("All"); setSearchQuery(""); }} className="text-xs">
              Clear Filters
            </Button>
          </div>
        ) : (
          roomGroups.map((group) => {
            const isICU = group.ward.toLowerCase().includes("icu");

            return (
              <div
                key={`${group.floorNo}-${group.roomNo}`}
                className={`rounded-2xl border p-4 sm:p-5 transition-all duration-300 ${
                  isICU
                    ? "bg-rose-50/30 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 shadow-sm"
                    : "bg-card border-border shadow-sm hover:shadow-card"
                }`}
              >
                {/* Room Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-border pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${isICU ? "bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400" : "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"}`}>
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-base text-card-foreground flex items-center gap-2">
                        <span>Room {group.roomNo}</span>
                        <span className="text-xs font-semibold text-muted-foreground font-mono">({group.ward})</span>
                      </h3>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono mt-0.5">
                        <span>{group.floorNo}</span>
                        <span>•</span>
                        <span>{group.beds.length} Bed Stations</span>
                        <span>•</span>
                        <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                          <Check className="h-3 w-3" /> Nurse Station Connected
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono text-muted-foreground">
                      Amenities: AC • O₂ Pipeline • Nurse Call
                    </span>
                    <Badge variant="outline" className="border-border text-foreground font-mono text-[10px] bg-secondary/60">
                      {group.beds.filter((b) => b.status === "Occupied").length}/{group.beds.length} Occupied
                    </Badge>
                  </div>
                </div>

                {/* Bed Seats Matrix (Enhanced Cinema Seat Card Style) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3.5">
                  {group.beds.map((bed) => {
                    const isOccupied = bed.status === "Occupied";
                    const isAvailable = bed.status === "Available";
                    const isReserved = bed.status === "Reserved";
                    const isMaint = bed.status === "Maintenance";

                    // Card style classes
                    const seatCardClass = isOccupied
                      ? "bg-gradient-to-b from-rose-500 via-rose-600 to-rose-700 border-rose-400 text-white shadow-md ring-2 ring-rose-300 dark:ring-rose-500/40"
                      : isAvailable
                      ? "bg-gradient-to-b from-emerald-500 via-emerald-600 to-emerald-700 border-emerald-400 text-white shadow-md ring-2 ring-emerald-300 dark:ring-emerald-500/30"
                      : isReserved
                      ? "bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 border-amber-300 text-amber-950 shadow-md ring-2 ring-amber-300 dark:ring-amber-500/30"
                      : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300";

                    return (
                      <motion.div
                        key={bed.bedId}
                        layout
                        whileHover={{ scale: 1.03, y: -3 }}
                        whileTap={{ scale: 0.97 }}
                        onMouseEnter={() => setHoveredBed(bed)}
                        onMouseLeave={() => setHoveredBed(null)}
                        onClick={() => onSelectBed(bed)}
                        className={`relative rounded-2xl border p-4 flex flex-col justify-between cursor-pointer transition-all duration-200 min-h-[160px] ${seatCardClass}`}
                      >
                        {/* Headrest Accent Bar */}
                        <div className="w-full h-2 rounded-t-lg bg-white/30 mb-2" />

                        {/* Top Header row */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <BedDouble className="h-4 w-4 opacity-95" />
                            <span className="font-mono font-black text-sm tracking-tight drop-shadow-xs">
                              {bed.bedId}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            {isOccupied && (
                              <Badge className="bg-white/20 hover:bg-white/30 text-white text-[9px] font-mono px-1.5 py-0 border-none flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                                BOOKED
                              </Badge>
                            )}
                            {isAvailable && (
                              <Badge className="bg-white/20 hover:bg-white/30 text-white text-[9px] font-mono px-1.5 py-0 border-none">
                                READY
                              </Badge>
                            )}
                            {isReserved && (
                              <Badge className="bg-black/20 text-amber-950 text-[9px] font-mono px-1.5 py-0 border-none font-bold">
                                RESERVED
                              </Badge>
                            )}
                            {isMaint && (
                              <Badge className="bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[9px] font-mono px-1.5 py-0 border-none">
                                SERVICE
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Middle Content Details */}
                        <div className="my-1.5 space-y-1">
                          {isOccupied ? (
                            <>
                              <div className="flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5 opacity-90 shrink-0" />
                                <span className="font-bold text-xs truncate max-w-[140px] drop-shadow-xs">
                                  {bed.patient}
                                </span>
                              </div>
                              <div className="text-[10px] opacity-90 truncate font-mono">
                                {bed.patientCode || "P-1001"} • {bed.condition || "Inpatient Care"}
                              </div>
                              {bed.vitals && (
                                <div className="bg-black/20 px-2 py-0.5 rounded-md text-[10px] font-mono flex items-center justify-between text-white/95">
                                  <span>BP: {bed.vitals.bp}</span>
                                  <span>SpO2: {bed.vitals.spo2}%</span>
                                  <span>HR: {bed.vitals.hr}</span>
                                </div>
                              )}
                            </>
                          ) : isAvailable ? (
                            <>
                              <div className="text-xs font-bold text-emerald-100 flex items-center gap-1">
                                <Sparkles className="h-3.5 w-3.5" /> Cleaned & Sanitized
                              </div>
                              <div className="text-[10px] text-white/90 font-mono">
                                Daily Rate: Rs. {(bed.dailyRate || 3500).toLocaleString()}/day
                              </div>
                              <div className="text-[9px] text-emerald-100/90 font-mono">
                                O₂ Port • Telemetry • IV Ready
                              </div>
                            </>
                          ) : isReserved ? (
                            <>
                              <div className="text-xs font-bold text-amber-950 flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" /> Scheduled Admission
                              </div>
                              <div className="text-[10px] text-amber-950/90 font-mono">
                                Patient Intake: {bed.reservedEta || "01:30 PM Today"}
                              </div>
                              <div className="text-[9px] text-amber-950/80 font-mono">
                                Ward: {bed.ward}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                                <AlertCircle className="h-3.5 w-3.5" /> Equipment Inspection
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                Terminal sterilization in progress
                              </div>
                            </>
                          )}
                        </div>

                        {/* Bottom Action Footer */}
                        <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[10px] font-mono">
                          {isOccupied ? (
                            <>
                              <span className="text-white/90 font-semibold">{bed.admittedDays || 1}d admitted</span>
                              <span className="text-white/90 font-bold underline hover:text-white flex items-center gap-0.5">
                                View Bill ➔
                              </span>
                            </>
                          ) : isAvailable ? (
                            <>
                              <span className="text-emerald-100 font-semibold">Ready for Intake</span>
                              <span className="text-white font-bold bg-white/20 px-2 py-0.5 rounded hover:bg-white/30">
                                Admit ➔
                              </span>
                            </>
                          ) : isReserved ? (
                            <>
                              <span className="text-amber-950 font-semibold">Incoming ER</span>
                              <span className="text-amber-950 font-bold underline">Intake ➔</span>
                            </>
                          ) : (
                            <>
                              <span className="text-slate-500 font-semibold">Maintenance</span>
                              <span className="text-slate-600 dark:text-slate-400">Servicing</span>
                            </>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* FLOATING HOVER PREVIEW CARD */}
      <AnimatePresence>
        {hoveredBed && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-card text-card-foreground border border-rose-300 dark:border-rose-500/50 shadow-2xl rounded-2xl p-4 max-w-sm space-y-2 pointer-events-none backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-border pb-2">
              <div className="flex items-center gap-2">
                <BedDouble className="h-4 w-4 text-rose-500" />
                <span className="font-extrabold text-sm font-mono text-card-foreground">Bed {hoveredBed.bedId}</span>
              </div>
              <Badge
                className={
                  hoveredBed.status === "Occupied"
                    ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200"
                    : hoveredBed.status === "Available"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200"
                    : hoveredBed.status === "Reserved"
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }
              >
                {hoveredBed.status}
              </Badge>
            </div>

            <div className="text-xs space-y-1">
              <p className="text-muted-foreground">
                Location: <strong className="text-card-foreground">{hoveredBed.ward} • Room {hoveredBed.roomNo} ({hoveredBed.floorNo})</strong>
              </p>

              {hoveredBed.status === "Occupied" && hoveredBed.patient && (
                <>
                  <p className="text-card-foreground">
                    Patient: <strong className="text-rose-600 font-bold">{hoveredBed.patient}</strong> ({hoveredBed.patientCode})
                  </p>
                  {hoveredBed.condition && (
                    <p className="text-muted-foreground text-[11px] truncate">
                      Condition: {hoveredBed.condition}
                    </p>
                  )}
                  <div className="flex justify-between text-[11px] pt-1 border-t border-border text-muted-foreground">
                    <span>Admitted: {hoveredBed.admittedAt} ({hoveredBed.admittedDays || 1}d)</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                      Rs. {((hoveredBed.dailyRate || 3500) * (hoveredBed.admittedDays || 1)).toLocaleString()}
                    </span>
                  </div>
                </>
              )}

              {hoveredBed.status === "Available" && (
                <p className="text-emerald-600 font-semibold text-[11px]">
                  ✓ Cleaned, sterilized, and ready for immediate patient admission.
                </p>
              )}
            </div>

            <p className="text-[10px] text-muted-foreground text-center font-mono">
              Click bed to open full details, bills & edit actions ➔
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
