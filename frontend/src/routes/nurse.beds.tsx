import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { nurseNav } from "@/lib/roleNav";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BedDouble,
  Layers,
  Building2,
  User,
  Activity,
  HeartPulse,
  Clock,
  Search,
  Receipt,
  Calendar,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  DollarSign,
  Filter,
  RotateCcw,
  Sparkles,
  Info,
  Thermometer,
  Droplets,
  ShieldCheck,
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { CinemaFloorBedMap } from "@/components/CinemaFloorBedMap";
import { LayoutGrid, MapPin as MapIcon } from "lucide-react";

export const Route = createFileRoute("/nurse/beds")({
  head: () => ({ meta: [{ title: "Beds Management — Nurse" }] }),
  component: NurseBedsScreen,
});


type BedStatus = "Occupied" | "Available" | "Reserved" | "Maintenance";

interface BedInfo {
  bedId: string;
  roomNo: string;
  floorNo: string;
  ward: string;
  status: BedStatus;
  patient?: string;
  patientCode?: string;
  gender?: "Male" | "Female";
  age?: number;
  admittedAt?: string; // YYYY-MM-DD
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
}

const BEDS_STORAGE_KEY = "medicore_nurse_beds";

const WARDS = [
  "All Wards",
  "ICU",
  "General Ward",
  "Medical Ward",
  "Surgical Ward",
  "Maternity Ward",
  "Orthopedic Ward",
  "Neurology Ward",
];

const FLOORS = ["All Floors", "Floor 1", "Floor 2", "Floor 3", "Floor 4", "Floor 5"];

const INITIAL_BEDS: BedInfo[] = [
  // ICU - Floor 2
  {
    bedId: "ICU-04",
    roomNo: "ICU-02",
    floorNo: "Floor 2",
    ward: "ICU",
    status: "Occupied",
    patient: "Muhammad Usama Khan",
    patientCode: "P-1001",
    gender: "Male",
    age: 52,
    admittedAt: "2026-08-24",
    admittedDays: 3,
    condition: "Acute Cardiac Monitoring & Arrhythmia",
    attendingDoctor: "Dr. Arshad Mahmood",
    dailyRate: 8500,
    nursingCharges: 12000,
    medsCharges: 18500,
    vitals: { bp: "145/90", hr: 102, temp: "38.1°C", spo2: 93 },
    nextReview: "10:00 AM",
    notes: "Continuous telemetry ECG and ICU protocol monitoring required.",
  },
  {
    bedId: "ICU-07",
    roomNo: "ICU-03",
    floorNo: "Floor 2",
    ward: "ICU",
    status: "Occupied",
    patient: "Ali Hassan Sheikh",
    patientCode: "P-1005",
    gender: "Male",
    age: 64,
    admittedAt: "2026-08-19",
    admittedDays: 8,
    condition: "Acute Respiratory Failure (Ventilator Support)",
    attendingDoctor: "Dr. Arshad Mahmood",
    dailyRate: 9000,
    nursingCharges: 25000,
    medsCharges: 42000,
    vitals: { bp: "150/95", hr: 112, temp: "38.5°C", spo2: 91 },
    nextReview: "Continuous",
    notes: "Q2H suctioning protocol and Norepinephrine infusion running.",
  },
  {
    bedId: "ICU-01",
    roomNo: "ICU-01",
    floorNo: "Floor 2",
    ward: "ICU",
    status: "Occupied",
    patient: "Tariq Mehmood",
    patientCode: "P-1010",
    gender: "Male",
    age: 48,
    admittedAt: "2026-08-25",
    admittedDays: 2,
    condition: "Cardiac Arrest Post-Resuscitation",
    attendingDoctor: "Dr. Arshad Mahmood",
    dailyRate: 8500,
    nursingCharges: 8000,
    medsCharges: 14000,
    vitals: { bp: "135/85", hr: 88, temp: "37.4°C", spo2: 96 },
    nextReview: "12:00 PM",
  },
  {
    bedId: "ICU-02",
    roomNo: "ICU-01",
    floorNo: "Floor 2",
    ward: "ICU",
    status: "Available",
    dailyRate: 8500,
    notes: "Equipped with Philips IntelliVue Monitor, Ventilator, and 3 Infusion Pumps.",
  },
  {
    bedId: "ICU-03",
    roomNo: "ICU-02",
    floorNo: "Floor 2",
    ward: "ICU",
    status: "Reserved",
    patient: "Incoming Emergency Transfer",
    patientCode: "EMG-902",
    dailyRate: 8500,
    nextReview: "01:00 PM",
    notes: "Reserved by ER for incoming STEMI transfer.",
  },
  {
    bedId: "ICU-05",
    roomNo: "ICU-03",
    floorNo: "Floor 2",
    ward: "ICU",
    status: "Maintenance",
    dailyRate: 8500,
    notes: "Oxygen flow sensor calibration in progress by BioMed engineering.",
  },
  {
    bedId: "ICU-06",
    roomNo: "ICU-03",
    floorNo: "Floor 2",
    ward: "ICU",
    status: "Available",
    dailyRate: 8500,
    notes: "Sterilized and prepared with fresh telemetry lines.",
  },

  // General Ward - Floor 1 & 3
  {
    bedId: "Bed-302A",
    roomNo: "302",
    floorNo: "Floor 3",
    ward: "General Ward",
    status: "Occupied",
    patient: "Sara Ahmed",
    patientCode: "P-1002",
    gender: "Female",
    age: 29,
    admittedAt: "2026-08-26",
    admittedDays: 1,
    condition: "Post-op Appendectomy Recovery",
    attendingDoctor: "Dr. Sarah Khan",
    dailyRate: 3500,
    nursingCharges: 3000,
    medsCharges: 4500,
    vitals: { bp: "118/76", hr: 74, temp: "36.6°C", spo2: 99 },
    nextReview: "02:00 PM",
  },
  {
    bedId: "Bed-101A",
    roomNo: "101",
    floorNo: "Floor 1",
    ward: "General Ward",
    status: "Available",
    dailyRate: 3000,
    notes: "Semi-private room with motorized Fowler bed.",
  },
  {
    bedId: "Bed-101B",
    roomNo: "101",
    floorNo: "Floor 1",
    ward: "General Ward",
    status: "Available",
    dailyRate: 3000,
  },
  {
    bedId: "Bed-102A",
    roomNo: "102",
    floorNo: "Floor 1",
    ward: "General Ward",
    status: "Occupied",
    patient: "Noman Farooq",
    patientCode: "P-1011",
    gender: "Male",
    age: 38,
    admittedAt: "2026-08-26",
    admittedDays: 1,
    condition: "Pyrexia of Unknown Origin (Fever Workup)",
    attendingDoctor: "Dr. Sarah Khan",
    dailyRate: 3000,
    nursingCharges: 2500,
    medsCharges: 3200,
    vitals: { bp: "122/80", hr: 84, temp: "38.2°C", spo2: 98 },
    nextReview: "06:00 PM",
  },
  {
    bedId: "Bed-102B",
    roomNo: "102",
    floorNo: "Floor 1",
    ward: "General Ward",
    status: "Available",
    dailyRate: 3000,
  },

  // Medical Ward - Floor 1
  {
    bedId: "Bed-114B",
    roomNo: "114",
    floorNo: "Floor 1",
    ward: "Medical Ward",
    status: "Occupied",
    patient: "Hamza Riaz",
    patientCode: "P-1003",
    gender: "Male",
    age: 58,
    admittedAt: "2026-08-22",
    admittedDays: 5,
    condition: "Hypertensive Urgency & Renal Monitoring",
    attendingDoctor: "Dr. Sarah Khan",
    dailyRate: 3800,
    nursingCharges: 7500,
    medsCharges: 9800,
    vitals: { bp: "128/82", hr: 82, temp: "37.2°C", spo2: 97 },
    nextReview: "04:00 PM",
  },
  {
    bedId: "Bed-114A",
    roomNo: "114",
    floorNo: "Floor 1",
    ward: "Medical Ward",
    status: "Available",
    dailyRate: 3800,
  },
  {
    bedId: "Bed-115A",
    roomNo: "115",
    floorNo: "Floor 1",
    ward: "Medical Ward",
    status: "Reserved",
    patient: "OPD Admission — Dr. Sarah",
    dailyRate: 3800,
    nextReview: "03:30 PM",
  },
  {
    bedId: "Bed-115B",
    roomNo: "115",
    floorNo: "Floor 1",
    ward: "Medical Ward",
    status: "Available",
    dailyRate: 3800,
  },

  // Surgical Ward - Floor 2
  {
    bedId: "Bed-205",
    roomNo: "205",
    floorNo: "Floor 2",
    ward: "Surgical Ward",
    status: "Occupied",
    patient: "Fatima Noor",
    patientCode: "P-1004",
    gender: "Female",
    age: 34,
    admittedAt: "2026-08-25",
    admittedDays: 2,
    condition: "Laparoscopic Cholecystectomy Post-Op",
    attendingDoctor: "Dr. Arshad Mahmood",
    dailyRate: 4200,
    nursingCharges: 6000,
    medsCharges: 8400,
    vitals: { bp: "122/78", hr: 76, temp: "37.0°C", spo2: 98 },
    nextReview: "03:00 PM",
  },
  {
    bedId: "Bed-206A",
    roomNo: "206",
    floorNo: "Floor 2",
    ward: "Surgical Ward",
    status: "Maintenance",
    dailyRate: 4200,
    notes: "Motorized headrest actuator replacement.",
  },
  {
    bedId: "Bed-206B",
    roomNo: "206",
    floorNo: "Floor 2",
    ward: "Surgical Ward",
    status: "Available",
    dailyRate: 4200,
  },

  // Maternity Ward - Floor 4
  {
    bedId: "Bed-408A",
    roomNo: "408",
    floorNo: "Floor 4",
    ward: "Maternity Ward",
    status: "Occupied",
    patient: "Ayesha Malik",
    patientCode: "P-1006",
    gender: "Female",
    age: 26,
    admittedAt: "2026-08-26",
    admittedDays: 1,
    condition: "Spontaneous Vaginal Delivery (Healthy Baby Girl)",
    attendingDoctor: "Dr. Sana Raza",
    dailyRate: 4500,
    nursingCharges: 4000,
    medsCharges: 5200,
    vitals: { bp: "110/70", hr: 68, temp: "36.8°C", spo2: 100 },
    nextReview: "Tomorrow 09:00 AM",
  },
  {
    bedId: "Bed-408B",
    roomNo: "408",
    floorNo: "Floor 4",
    ward: "Maternity Ward",
    status: "Available",
    dailyRate: 4500,
  },
  {
    bedId: "Bed-409A",
    roomNo: "409",
    floorNo: "Floor 4",
    ward: "Maternity Ward",
    status: "Reserved",
    patient: "Elective C-Section (Admission 4 PM)",
    dailyRate: 4500,
    nextReview: "04:00 PM",
  },

  // Orthopedic Ward - Floor 3
  {
    bedId: "Bed-312C",
    roomNo: "312",
    floorNo: "Floor 3",
    ward: "Orthopedic Ward",
    status: "Occupied",
    patient: "Bilal Chaudhry",
    patientCode: "P-1007",
    gender: "Male",
    age: 62,
    admittedAt: "2026-08-21",
    admittedDays: 6,
    condition: "Total Hip Arthroplasty (Physiotherapy Protocol)",
    attendingDoctor: "Dr. Rizwan Khattak",
    dailyRate: 4000,
    nursingCharges: 9000,
    medsCharges: 11200,
    vitals: { bp: "130/85", hr: 80, temp: "37.1°C", spo2: 97 },
    nextReview: "05:00 PM",
  },
  {
    bedId: "Bed-312D",
    roomNo: "312",
    floorNo: "Floor 3",
    ward: "Orthopedic Ward",
    status: "Available",
    dailyRate: 4000,
  },

  // Neurology Ward - Floor 5
  {
    bedId: "Bed-501",
    roomNo: "501",
    floorNo: "Floor 5",
    ward: "Neurology Ward",
    status: "Occupied",
    patient: "Zainab Qureshi",
    patientCode: "P-1008",
    gender: "Female",
    age: 41,
    admittedAt: "2026-08-23",
    admittedDays: 4,
    condition: "Status Migrainosus & Intractable Headache",
    attendingDoctor: "Dr. Nadia Azeem",
    dailyRate: 4200,
    nursingCharges: 5500,
    medsCharges: 7600,
    vitals: { bp: "120/80", hr: 72, temp: "36.9°C", spo2: 99 },
    nextReview: "06:00 PM",
  },
  {
    bedId: "Bed-502A",
    roomNo: "502",
    floorNo: "Floor 5",
    ward: "Neurology Ward",
    status: "Available",
    dailyRate: 4200,
  },
  {
    bedId: "Bed-502B",
    roomNo: "502",
    floorNo: "Floor 5",
    ward: "Neurology Ward",
    status: "Maintenance",
    dailyRate: 4200,
    notes: "Routine sanitization and UV sterilization.",
  },
];

const statusConfig: Record<BedStatus, { cls: string; cardBg: string; dot: string }> = {
  Occupied: {
    cls: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 font-bold",
    cardBg: "border-rose-200 dark:border-rose-900/60 shadow-rose-500/5",
    dot: "bg-rose-500",
  },
  Available: {
    cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 font-semibold",
    cardBg: "border-emerald-200 dark:border-emerald-900/60 shadow-emerald-500/5",
    dot: "bg-emerald-500",
  },
  Reserved: {
    cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 font-semibold",
    cardBg: "border-amber-200 dark:border-amber-900/60 shadow-amber-500/5",
    dot: "bg-amber-500",
  },
  Maintenance: {
    cls: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 font-semibold",
    cardBg: "border-slate-200 dark:border-slate-700/60",
    dot: "bg-slate-400",
  },
};

function NurseBedsScreen() {
  const [beds, setBeds] = useState<BedInfo[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(BEDS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (err) {
        console.error("Failed to load saved beds", err);
      }
    }
    return INITIAL_BEDS;
  });

  const [q, setQ] = useState("");
  const [wardFilter, setWardFilter] = useState("All Wards");
  const [floorFilter, setFloorFilter] = useState("All Floors");
  const [roomFilter, setRoomFilter] = useState("All Rooms");
  const [statusFilter, setStatusFilter] = useState("All");

  // Selected bed for viewing full details & billing breakdown
  const [viewBed, setViewBed] = useState<BedInfo | null>(null);

  // Edit Bed Modal state
  const [editBed, setEditBed] = useState<BedInfo | null>(null);
  const [editForm, setEditForm] = useState({
    status: "Available" as BedStatus,
    ward: "",
    floorNo: "",
    roomNo: "",
    patient: "",
    patientCode: "",
    gender: "Male" as "Male" | "Female",
    age: 40,
    admittedAt: "",
    condition: "",
    attendingDoctor: "",
    dailyRate: 3500,
    notes: "",
  });

  const saveBedsState = (updated: BedInfo[]) => {
    setBeds(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(BEDS_STORAGE_KEY, JSON.stringify(updated));
    }
  };

  // Derive unique rooms dynamically based on floor/ward filter
  const roomOptions = useMemo(() => {
    const list = Array.from(
      new Set(
        beds
          .filter((b) => {
            const matchW = wardFilter === "All Wards" || b.ward === wardFilter;
            const matchF = floorFilter === "All Floors" || b.floorNo === floorFilter;
            return matchW && matchF;
          })
          .map((b) => b.roomNo)
      )
    ).sort();
    return ["All Rooms", ...list];
  }, [beds, wardFilter, floorFilter]);

  const filtered = beds.filter((b) => {
    const matchQ =
      b.bedId.toLowerCase().includes(q.toLowerCase()) ||
      (b.patient && b.patient.toLowerCase().includes(q.toLowerCase())) ||
      (b.patientCode && b.patientCode.toLowerCase().includes(q.toLowerCase())) ||
      (b.condition && b.condition.toLowerCase().includes(q.toLowerCase())) ||
      b.roomNo.toLowerCase().includes(q.toLowerCase());
    const matchWard = wardFilter === "All Wards" || b.ward === wardFilter;
    const matchFloor = floorFilter === "All Floors" || b.floorNo === floorFilter;
    const matchRoom = roomFilter === "All Rooms" || b.roomNo === roomFilter;
    const matchStatus = statusFilter === "All" || b.status === statusFilter;
    return matchQ && matchWard && matchFloor && matchRoom && matchStatus;
  });

  const stats = {
    total: beds.length,
    occupied: beds.filter((b) => b.status === "Occupied").length,
    available: beds.filter((b) => b.status === "Available").length,
    reserved: beds.filter((b) => b.status === "Reserved").length,
    maintenance: beds.filter((b) => b.status === "Maintenance").length,
  };

  const occupancyRate = stats.total > 0 ? Math.round((stats.occupied / stats.total) * 100) : 0;

  const resetFilters = () => {
    setQ("");
    setWardFilter("All Wards");
    setFloorFilter("All Floors");
    setRoomFilter("All Rooms");
    setStatusFilter("All");
  };

  const hasActiveFilters =
    q !== "" ||
    wardFilter !== "All Wards" ||
    floorFilter !== "All Floors" ||
    roomFilter !== "All Rooms" ||
    statusFilter !== "All";

  const handleOpenEdit = (bed: BedInfo) => {
    setEditBed(bed);
    setEditForm({
      status: bed.status,
      ward: bed.ward,
      floorNo: bed.floorNo,
      roomNo: bed.roomNo,
      patient: bed.patient || "",
      patientCode: bed.patientCode || "",
      gender: bed.gender || "Male",
      age: bed.age || 45,
      admittedAt: bed.admittedAt || new Date().toISOString().split("T")[0],
      condition: bed.condition || "",
      attendingDoctor: bed.attendingDoctor || "Dr. Arshad Mahmood",
      dailyRate: bed.dailyRate || 3500,
      notes: bed.notes || "",
    });
  };

  const handleSaveEdit = () => {
    if (!editBed) return;

    const days = editForm.admittedAt
      ? Math.max(
          1,
          Math.round(
            (Date.now() - new Date(editForm.admittedAt).getTime()) / (1000 * 60 * 60 * 24)
          )
        )
      : editBed.admittedDays || 1;

    const updatedBed: BedInfo = {
      ...editBed,
      status: editForm.status,
      ward: editForm.ward,
      floorNo: editForm.floorNo,
      roomNo: editForm.roomNo,
      patient: editForm.status === "Available" || editForm.status === "Maintenance" ? undefined : editForm.patient || undefined,
      patientCode: editForm.status === "Available" || editForm.status === "Maintenance" ? undefined : editForm.patientCode || undefined,
      gender: editForm.gender,
      age: Number(editForm.age),
      admittedAt: editForm.status === "Occupied" ? editForm.admittedAt : undefined,
      admittedDays: editForm.status === "Occupied" ? days : undefined,
      condition: editForm.status === "Occupied" ? editForm.condition : undefined,
      attendingDoctor: editForm.status === "Occupied" ? editForm.attendingDoctor : undefined,
      dailyRate: Number(editForm.dailyRate),
      notes: editForm.notes,
    };

    const nextList = beds.map((b) => (b.bedId === editBed.bedId ? updatedBed : b));
    saveBedsState(nextList);

    // If currently viewing this bed, sync the modal view
    if (viewBed?.bedId === editBed.bedId) {
      setViewBed(updatedBed);
    }

    setEditBed(null);
    toast.success(`Bed ${editBed.bedId} updated!`, {
      description: `Status changed to ${editForm.status}. All details saved.`,
    });
  };

  // Helper to calculate total inpatient charges
  const calculateBill = (bed: BedInfo) => {
    const days = bed.admittedDays || 1;
    const rate = bed.dailyRate || 3500;
    const roomBill = days * rate;
    const nursing = bed.nursingCharges || Math.round(days * 1800);
    const meds = bed.medsCharges || Math.round(days * 2200);
    const total = roomBill + nursing + meds;
    return {
      days,
      dailyRate: rate,
      roomBill,
      nursing,
      meds,
      total,
    };
  };

  const [viewMode, setViewMode] = useState<"map" | "cards">("map");

  return (
    <AppShell role="nurse" title="Nurse" nav={nurseNav}>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bed Allocation & Ward Map</h1>
          <p className="text-muted-foreground">
            Real-time inpatient occupancy, interactive cinema-style floor matrix, and bed roster
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 bg-secondary/80 p-1 rounded-2xl border border-border">
          <Button
            size="sm"
            variant={viewMode === "map" ? "default" : "ghost"}
            onClick={() => setViewMode("map")}
            className={`h-9 px-3.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              viewMode === "map" ? "bg-gradient-red text-white shadow-md" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5 text-amber-300" />
            Cinema Floor Map 🎦
          </Button>

          <Button
            size="sm"
            variant={viewMode === "cards" ? "default" : "ghost"}
            onClick={() => setViewMode("cards")}
            className={`h-9 px-3.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              viewMode === "cards" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5 mr-1.5" />
            Card Registry 📋
          </Button>
        </div>
      </div>


      {/* Occupancy Stat Cards Header */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="col-span-2 md:col-span-1 rounded-2xl border bg-card p-5 flex flex-col items-center justify-center shadow-card">
          <div className="relative h-20 w-20 mb-2">
            <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-secondary"
              />
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${occupancyRate} ${100 - occupancyRate}`}
                strokeDashoffset="0"
                className="text-rose-500 transition-all duration-500"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-lg font-extrabold text-card-foreground">
              {occupancyRate}%
            </div>
          </div>
          <div className="text-xs text-muted-foreground text-center font-semibold">
            Ward Occupancy ({stats.occupied}/{stats.total})
          </div>
        </div>

        {[
          { label: "Occupied Beds", value: stats.occupied, color: "from-rose-500 to-red-600", desc: "Active admitted patients" },
          { label: "Available Ready", value: stats.available, color: "from-emerald-500 to-teal-600", desc: "Sanitized & ready for intake" },
          { label: "Reserved", value: stats.reserved, color: "from-amber-500 to-orange-600", desc: "ER & OPD scheduled" },
          { label: "Maintenance", value: stats.maintenance, color: "from-slate-600 to-slate-700", desc: "Equipment servicing" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-2xl bg-gradient-to-br ${s.color} text-white p-5 shadow-elevated flex flex-col justify-between`}
          >
            <div>
              <div className="text-xs uppercase tracking-wider font-semibold opacity-90">{s.label}</div>
              <div className="text-3xl font-extrabold mt-1">{s.value}</div>
            </div>
            <div className="text-[11px] opacity-85 mt-2">{s.desc}</div>
          </motion.div>
        ))}
      </div>

            {/* CINEMA-STYLE INTERACTIVE FLOOR MAP VIEW */}
      {viewMode === "map" ? (
        <div className="space-y-6">
          <CinemaFloorBedMap
            beds={beds}
            selectedFloor={floorFilter === "All Floors" ? undefined : floorFilter}
            onFloorChange={(f) => setFloorFilter(f)}
            onSelectBed={(bed) => setViewBed(bed)}
            onEditBed={(bed) => handleOpenEdit(bed)}
          />
        </div>
      ) : (
        <>
          {/* Well-Organized Filter Toolbar */}
          <div className="bg-card border border-border rounded-2xl p-5 mb-6 shadow-card space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-card-foreground">
                <Filter className="h-4 w-4 text-rose-500" />
                <span>Bed Search & Ward Filter Controls</span>
              </div>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3 mr-1.5" /> Reset Filters
                </Button>
              )}
            </div>

            {/* Search + Dropdowns Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search Bed, Patient, Code, Room..."
                  className="pl-9 text-xs"
                />
              </div>

              {/* Ward Select */}
              <div>
                <Select value={wardFilter} onValueChange={setWardFilter}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Select Ward" />
                  </SelectTrigger>
                  <SelectContent>
                    {WARDS.map((w) => (
                      <SelectItem key={w} value={w} className="text-xs">
                        {w}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Floor Select */}
              <div>
                <Select value={floorFilter} onValueChange={setFloorFilter}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Select Floor" />
                  </SelectTrigger>
                  <SelectContent>
                    {FLOORS.map((f) => (
                      <SelectItem key={f} value={f} className="text-xs">
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Room Select */}
              <div>
                <Select value={roomFilter} onValueChange={setRoomFilter}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Select Room" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomOptions.map((r) => (
                      <SelectItem key={r} value={r} className="text-xs">
                        {r === "All Rooms" ? "All Rooms" : `Room ${r}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Status Tab Pills */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-xs font-semibold text-muted-foreground mr-1">Status:</span>
              {["All", "Occupied", "Available", "Reserved", "Maintenance"].map((s) => {
                const count =
                  s === "All"
                    ? stats.total
                    : s === "Occupied"
                    ? stats.occupied
                    : s === "Available"
                    ? stats.available
                    : s === "Reserved"
                    ? stats.reserved
                    : stats.maintenance;

                const isSelected = statusFilter === s;
                return (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-rose-600 text-white border-rose-600 shadow-md"
                        : "bg-secondary text-muted-foreground border-border hover:border-rose-400 hover:text-rose-600"
                    }`}
                  >
                    <span>{s}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-card text-muted-foreground border border-border/50"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Showing count indicator */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
            <span>
              Showing <strong>{filtered.length}</strong> of <strong>{beds.length}</strong> total hospital beds
            </span>
            {hasActiveFilters && (
              <span className="text-rose-600 font-medium">Filtered results</span>
            )}
          </div>

          {/* Bed Grid */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
            {filtered.map((bed, i) => {
              const sc = statusConfig[bed.status];
              const billInfo = bed.status === "Occupied" ? calculateBill(bed) : null;

              return (
                <motion.div
                  key={bed.bedId}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                  whileHover={{ y: -4 }}
                  className={`bg-card border rounded-2xl p-5 shadow-card hover:shadow-xl transition-all flex flex-col justify-between ${sc.cardBg}`}
                >
                  <div>
                    {/* Card Top: Bed ID & Status */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div className="bg-secondary/80 p-2 rounded-xl text-foreground">
                          <BedDouble
                            className={`h-5 w-5 ${
                              bed.status === "Occupied"
                                ? "text-rose-500"
                                : bed.status === "Available"
                                ? "text-emerald-500"
                                : bed.status === "Reserved"
                                ? "text-amber-500"
                                : "text-slate-400"
                            }`}
                          />
                        </div>
                        <div>
                          <div className="font-extrabold text-base text-card-foreground font-mono">
                            {bed.bedId}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-medium">
                            {bed.ward}
                          </div>
                        </div>
                      </div>

                      <Badge className={sc.cls}>
                        <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1.5 ${sc.dot}`} />
                        {bed.status}
                      </Badge>
                    </div>

                    {/* Location Pills */}
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-3 bg-secondary/40 p-2 rounded-lg">
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <Building2 className="h-3 w-3 text-rose-500" />
                        Rm {bed.roomNo}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Layers className="h-3 w-3 text-blue-500" />
                        {bed.floorNo}
                      </span>
                    </div>

                    {/* Status Specific Body */}
                    {bed.status === "Occupied" && bed.patient ? (
                      <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 rounded-xl p-3 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold text-rose-900 dark:text-rose-200 truncate">
                            <User className="h-3.5 w-3.5 text-rose-600 flex-shrink-0" />
                            <span className="truncate">{bed.patient}</span>
                          </div>
                          {bed.patientCode && (
                            <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400 font-semibold bg-white/80 dark:bg-black/30 px-1.5 py-0.5 rounded">
                              {bed.patientCode}
                            </span>
                          )}
                        </div>

                        {bed.condition && (
                          <div className="text-[11px] text-muted-foreground line-clamp-1 flex items-center gap-1">
                            <Activity className="h-3 w-3 text-rose-500 shrink-0" />
                            <span className="truncate">{bed.condition}</span>
                          </div>
                        )}

                        {/* Accrued Bill pill */}
                        {billInfo && (
                          <div className="flex items-center justify-between pt-1 border-t border-rose-200/60 dark:border-rose-900/60 text-[11px]">
                            <span className="text-muted-foreground">
                              {bed.admittedDays || 1}d in bed ({bed.admittedAt ? bed.admittedAt.slice(5) : "Admitted"})
                            </span>
                            <span className="font-bold font-mono text-rose-700 dark:text-rose-300">
                              Rs. {billInfo.total.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : bed.status === "Reserved" ? (
                      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl p-3 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                        <div className="font-bold flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-amber-600" />
                          <span>{bed.patient || "Incoming Patient"}</span>
                        </div>
                        {bed.nextReview && (
                          <div className="text-[11px] text-amber-700/80 dark:text-amber-400">
                            Expected Arrival: {bed.nextReview}
                          </div>
                        )}
                      </div>
                    ) : bed.status === "Maintenance" ? (
                      <div className="bg-slate-100 dark:bg-slate-800/60 rounded-xl p-3 text-xs text-slate-600 dark:text-slate-300 text-center space-y-1">
                        <div className="font-semibold flex items-center justify-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5 text-slate-500" /> Under Maintenance
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {bed.notes || "Servicing & sanitization protocol"}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-xl p-3 text-xs text-emerald-800 dark:text-emerald-300 space-y-1 text-center font-medium">
                        <div className="font-bold flex items-center justify-center gap-1 text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Ready for Admission
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          Rate: Rs. {(bed.dailyRate || 3500).toLocaleString()} / day
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="border-t border-border pt-3 mt-4 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setViewBed(bed)}
                      className="flex-1 h-8 text-xs font-semibold hover:bg-secondary cursor-pointer"
                    >
                      <Info className="h-3.5 w-3.5 mr-1 text-primary" /> Details & Bill
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenEdit(bed)}
                      className="h-8 px-2.5 text-xs text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                      title="Edit Bed Information & Status"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}

            {filtered.length === 0 && (
              <div className="col-span-full text-center py-20 text-muted-foreground bg-secondary/20 rounded-2xl border border-dashed">
                <BedDouble className="h-10 w-10 mx-auto mb-3 opacity-40 text-rose-500" />
                <h3 className="font-bold text-base text-foreground">No beds match your filter criteria</h3>
                <p className="text-xs text-muted-foreground mt-1">Try resetting or modifying your search/filters.</p>
                <Button size="sm" variant="outline" onClick={resetFilters} className="mt-4 text-xs cursor-pointer">
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Reset All Filters
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ------------------------------------------------------------- */}
      {/* BED FULL DETAILS & BILLING BREAKDOWN MODAL */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={Boolean(viewBed)} onOpenChange={(open) => !open && setViewBed(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {viewBed && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between gap-3 pr-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-rose-500/10 p-2.5 rounded-2xl text-rose-600">
                      <BedDouble className="h-6 w-6" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <span>Bed {viewBed.bedId}</span>
                        <Badge className={statusConfig[viewBed.status].cls}>
                          {viewBed.status}
                        </Badge>
                      </DialogTitle>
                      <DialogDescription className="text-xs">
                        {viewBed.ward} • Room {viewBed.roomNo} • {viewBed.floorNo}
                      </DialogDescription>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const cur = viewBed;
                      setViewBed(null);
                      handleOpenEdit(cur);
                    }}
                    className="cursor-pointer text-xs"
                  >
                    <Edit3 className="h-3.5 w-3.5 mr-1.5 text-rose-500" /> Edit Bed
                  </Button>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {/* If Occupied: Full Clinical & Patient Breakdown */}
                {viewBed.status === "Occupied" && (
                  <>
                    {/* Patient Banner */}
                    <div className="bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-transparent border border-rose-200 dark:border-rose-900/60 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-rose-600 dark:text-rose-400">
                            Admitted Patient Details
                          </span>
                          <h3 className="text-lg font-extrabold text-foreground">{viewBed.patient}</h3>
                        </div>
                        <Badge variant="outline" className="font-mono text-xs font-bold text-rose-600 border-rose-300">
                          {viewBed.patientCode || "P-1001"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="bg-card/80 p-2.5 rounded-xl border">
                          <span className="text-[10px] text-muted-foreground block">Age / Gender</span>
                          <span className="font-semibold text-foreground">
                            {viewBed.age || 45} yrs • {viewBed.gender || "Male"}
                          </span>
                        </div>
                        <div className="bg-card/80 p-2.5 rounded-xl border">
                          <span className="text-[10px] text-muted-foreground block">Admission Date</span>
                          <span className="font-semibold text-foreground">
                            {viewBed.admittedAt || "2026-08-22"}
                          </span>
                        </div>
                        <div className="bg-card/80 p-2.5 rounded-xl border">
                          <span className="text-[10px] text-muted-foreground block">Length of Stay</span>
                          <span className="font-semibold text-rose-600">
                            {viewBed.admittedDays || 1} Days Admitted
                          </span>
                        </div>
                        <div className="bg-card/80 p-2.5 rounded-xl border">
                          <span className="text-[10px] text-muted-foreground block">Attending Doctor</span>
                          <span className="font-semibold text-foreground truncate block">
                            {viewBed.attendingDoctor || "Dr. Arshad Mahmood"}
                          </span>
                        </div>
                      </div>

                      {viewBed.condition && (
                        <div className="text-xs bg-card/90 p-2.5 rounded-xl border flex items-start gap-2">
                          <Activity className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-foreground">Primary Diagnosis / Condition:</span>
                            <p className="text-muted-foreground mt-0.5">{viewBed.condition}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Vitals Snapshot */}
                    {viewBed.vitals && (
                      <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-card-foreground flex items-center gap-1.5">
                            <HeartPulse className="h-4 w-4 text-rose-500" /> Bedside Vitals Telemetry
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">Live Sync</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-center text-xs">
                          <div className="bg-secondary/50 p-2 rounded-xl">
                            <span className="text-[10px] text-muted-foreground block">Blood Pressure</span>
                            <span className="font-mono font-bold text-foreground">{viewBed.vitals.bp}</span>
                          </div>
                          <div className="bg-secondary/50 p-2 rounded-xl">
                            <span className="text-[10px] text-muted-foreground block">Heart Rate</span>
                            <span className="font-mono font-bold text-foreground">{viewBed.vitals.hr} bpm</span>
                          </div>
                          <div className="bg-secondary/50 p-2 rounded-xl">
                            <span className="text-[10px] text-muted-foreground block">Temperature</span>
                            <span className="font-mono font-bold text-foreground">{viewBed.vitals.temp}</span>
                          </div>
                          <div className="bg-secondary/50 p-2 rounded-xl">
                            <span className="text-[10px] text-muted-foreground block">SpO₂ Oxygen</span>
                            <span className="font-mono font-bold text-foreground">{viewBed.vitals.spo2}%</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Inpatient Billing Estimation Card */}
                    {(() => {
                      const bill = calculateBill(viewBed);
                      return (
                        <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Receipt className="h-4 w-4 text-emerald-600" />
                              <span className="text-sm font-bold text-foreground">
                                Inpatient Bed Charges & Estimated Bill
                              </span>
                            </div>
                            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 text-[10px]">
                              Current Accrued
                            </Badge>
                          </div>

                          <div className="space-y-2 text-xs divide-y divide-border/60">
                            <div className="flex justify-between items-center pt-1">
                              <span className="text-muted-foreground">
                                Bed Rent ({bill.days} days @ Rs. {bill.dailyRate.toLocaleString()}/day):
                              </span>
                              <span className="font-mono font-semibold text-foreground">
                                Rs. {bill.roomBill.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                              <span className="text-muted-foreground">Nursing Care & Telemetry Protocol:</span>
                              <span className="font-mono font-semibold text-foreground">
                                Rs. {bill.nursing.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                              <span className="text-muted-foreground">Inpatient Pharmacy & Consumables:</span>
                              <span className="font-mono font-semibold text-foreground">
                                Rs. {bill.meds.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center pt-2 text-sm font-bold">
                              <span className="text-foreground">Estimated Total Accrued Bill:</span>
                              <span className="font-mono text-emerald-600 dark:text-emerald-400 text-base font-extrabold">
                                Rs. {bill.total.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-1">
                            <Info className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span>Final bill will be calculated during discharge reconciliation.</span>
                          </div>
                        </div>
                      );
                    })()}
                  </>
                )}

                {/* If Reserved / Maintenance / Available */}
                {viewBed.status !== "Occupied" && (
                  <div className="space-y-3">
                    <div className="bg-secondary/40 border rounded-2xl p-4 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Standard Daily Bed Rate:</span>
                        <span className="font-mono font-bold text-foreground">
                          Rs. {(viewBed.dailyRate || 3500).toLocaleString()} / day
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Room / Ward Wing:</span>
                        <span className="font-semibold text-foreground">
                          {viewBed.ward} (Room {viewBed.roomNo})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Floor Assignment:</span>
                        <span className="font-semibold text-foreground">{viewBed.floorNo}</span>
                      </div>
                    </div>

                    {viewBed.notes && (
                      <div className="bg-card border p-3 rounded-xl text-xs space-y-1">
                        <span className="font-semibold text-foreground">Clinical & Equipment Notes:</span>
                        <p className="text-muted-foreground">{viewBed.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setViewBed(null)} className="cursor-pointer">
                  Close
                </Button>
                <Button
                  onClick={() => {
                    const cur = viewBed;
                    setViewBed(null);
                    handleOpenEdit(cur);
                  }}
                  className="bg-gradient-red text-white font-semibold cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5 mr-1.5" /> Edit Details & Status
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------- */}
      {/* EDIT BED DETAILS & STATUS MODAL */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={Boolean(editBed)} onOpenChange={(open) => !open && setEditBed(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          {editBed && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-rose-500" />
                  Edit Bed {editBed.bedId} Information
                </DialogTitle>
                <DialogDescription>
                  Modify bed allocation status, patient details, and daily charges.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3.5 py-2">
                {/* Status Selection */}
                <div>
                  <Label className="text-xs font-semibold">Bed Allocation Status *</Label>
                  <Select
                    value={editForm.status}
                    onValueChange={(val) => setEditForm({ ...editForm, status: val as BedStatus })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Occupied">Occupied (Patient in Bed)</SelectItem>
                      <SelectItem value="Available">Available (Ready for intake)</SelectItem>
                      <SelectItem value="Reserved">Reserved (Incoming Patient)</SelectItem>
                      <SelectItem value="Maintenance">Maintenance (Out of Service)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Grid */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs font-semibold">Ward *</Label>
                    <Select
                      value={editForm.ward}
                      onValueChange={(val) => setEditForm({ ...editForm, ward: val })}
                    >
                      <SelectTrigger className="mt-1 text-xs">
                        <SelectValue placeholder="Ward" />
                      </SelectTrigger>
                      <SelectContent>
                        {WARDS.filter((w) => w !== "All Wards").map((w) => (
                          <SelectItem key={w} value={w} className="text-xs">
                            {w}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Floor *</Label>
                    <Select
                      value={editForm.floorNo}
                      onValueChange={(val) => setEditForm({ ...editForm, floorNo: val })}
                    >
                      <SelectTrigger className="mt-1 text-xs">
                        <SelectValue placeholder="Floor" />
                      </SelectTrigger>
                      <SelectContent>
                        {FLOORS.filter((f) => f !== "All Floors").map((f) => (
                          <SelectItem key={f} value={f} className="text-xs">
                            {f}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Room No *</Label>
                    <Input
                      value={editForm.roomNo}
                      onChange={(e) => setEditForm({ ...editForm, roomNo: e.target.value })}
                      placeholder="e.g. 101"
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>

                {/* Daily Bed Rate */}
                <div>
                  <Label className="text-xs font-semibold">Daily Room/Bed Rate (PKR) *</Label>
                  <Input
                    type="number"
                    value={editForm.dailyRate}
                    onChange={(e) => setEditForm({ ...editForm, dailyRate: Number(e.target.value) })}
                    placeholder="3500"
                    className="mt-1 text-xs font-mono"
                  />
                </div>

                {/* Patient Information if Occupied or Reserved */}
                {(editForm.status === "Occupied" || editForm.status === "Reserved") && (
                  <div className="bg-secondary/40 p-3 rounded-xl space-y-3 border border-border">
                    <span className="text-xs font-bold text-rose-600 block">
                      {editForm.status === "Occupied" ? "Inpatient Patient Information" : "Reserved Patient Details"}
                    </span>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Patient Full Name</Label>
                        <Input
                          value={editForm.patient}
                          onChange={(e) => setEditForm({ ...editForm, patient: e.target.value })}
                          placeholder="e.g. Sara Ahmed"
                          className="mt-1 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Patient Code / MRN</Label>
                        <Input
                          value={editForm.patientCode}
                          onChange={(e) => setEditForm({ ...editForm, patientCode: e.target.value })}
                          placeholder="P-1002"
                          className="mt-1 text-xs font-mono"
                        />
                      </div>
                    </div>

                    {editForm.status === "Occupied" && (
                      <>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label className="text-xs">Gender</Label>
                            <Select
                              value={editForm.gender}
                              onValueChange={(val) => setEditForm({ ...editForm, gender: val as "Male" | "Female" })}
                            >
                              <SelectTrigger className="mt-1 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Age</Label>
                            <Input
                              type="number"
                              value={editForm.age}
                              onChange={(e) => setEditForm({ ...editForm, age: Number(e.target.value) })}
                              placeholder="45"
                              className="mt-1 text-xs"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Admission Date</Label>
                            <Input
                              type="date"
                              value={editForm.admittedAt}
                              onChange={(e) => setEditForm({ ...editForm, admittedAt: e.target.value })}
                              className="mt-1 text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs">Diagnosis / Clinical Condition</Label>
                          <Input
                            value={editForm.condition}
                            onChange={(e) => setEditForm({ ...editForm, condition: e.target.value })}
                            placeholder="e.g. Post-Op Appendectomy Recovery"
                            className="mt-1 text-xs"
                          />
                        </div>

                        <div>
                          <Label className="text-xs">Attending Physician / Doctor</Label>
                          <Input
                            value={editForm.attendingDoctor}
                            onChange={(e) => setEditForm({ ...editForm, attendingDoctor: e.target.value })}
                            placeholder="Dr. Arshad Mahmood"
                            className="mt-1 text-xs"
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Notes */}
                <div>
                  <Label className="text-xs font-semibold">Bed Amenities & Clinical Notes</Label>
                  <Input
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    placeholder="e.g. Oxygen port, telemetry monitor attached"
                    className="mt-1 text-xs"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setEditBed(null)} className="cursor-pointer">
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  className="bg-gradient-red text-white font-semibold cursor-pointer"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Save Changes
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
