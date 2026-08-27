import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Activity, Heart, Thermometer, ShieldAlert, Droplet, Pill,
  Clock, CheckCircle2, AlertCircle, Zap, RefreshCw, Package, Plus, Play, Pause
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, YAxis, XAxis, Tooltip } from "recharts";
import { toast } from "sonner";

export interface PatientMonitorData {
  id: string;
  name: string;
  age: number;
  gender: string;
  bedNo: string;
  roomNo: string;
  condition: string;
  attendingDoctor: string;
  heartRate: number;
  spO2: number;
  bp: string;
  temp: number;
  respRate: number;
  ivDrip: {
    name: string;
    flowRate: number; // drops per min
    remainingPercent: number;
    status: "Flowing" | "Paused" | "Needs Replacement";
  };
  medications: {
    id: string;
    name: string;
    dosage: string;
    time: string;
    status: "Pending" | "Given" | "Overdue";
  }[];
  stocks: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    status: "In Stock" | "Low Stock";
  }[];
}

interface PatientICUMonitorModalProps {
  patient: PatientMonitorData | null;
  isOpen: boolean;
  onClose: () => void;
}

// Simulated ECG Wave Generator Data
const generateECGData = () => {
  const points = [];
  for (let i = 0; i < 30; i++) {
    let val = 50;
    if (i % 6 === 2) val = 85; // R peak
    else if (i % 6 === 3) val = 20; // S wave
    else if (i % 6 === 4) val = 60; // T wave
    else val = 48 + Math.random() * 4;
    points.push({ time: i, ecg: val });
  }
  return points;
};

export function PatientICUMonitorModal({ patient, isOpen, onClose }: PatientICUMonitorModalProps) {
  const [ecgData, setEcgData] = useState(generateECGData());
  const [isAlarmSilenced, setIsAlarmSilenced] = useState(false);
  const [dripState, setDripState] = useState(patient?.ivDrip || {
    name: "Normal Saline (0.9%)",
    flowRate: 20,
    remainingPercent: 65,
    status: "Flowing",
  });
  const [meds, setMeds] = useState(patient?.medications || []);

  useEffect(() => {
    if (patient) {
      setDripState(patient.ivDrip);
      setMeds(patient.medications);
    }
  }, [patient]);

  // Live ECG wave animation tick
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setEcgData((prev) => {
        const nextTime = (prev[prev.length - 1]?.time || 0) + 1;
        const index = nextTime % 6;
        let val = 50;
        if (index === 2) val = 85;
        else if (index === 3) val = 20;
        else if (index === 4) val = 60;
        else val = 48 + Math.random() * 5;

        const updated = [...prev.slice(1), { time: nextTime, ecg: val }];
        return updated;
      });
    }, 300);
    return () => clearInterval(interval);
  }, [isOpen]);

  const handleAdministerMed = (medId: string) => {
    setMeds((prev) =>
      prev.map((m) =>
        m.id === medId ? { ...m, status: "Given", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : m
      )
    );
    toast.success("Medication administered successfully!");
  };

  const handleToggleDrip = () => {
    const nextStatus = dripState.status === "Flowing" ? "Paused" : "Flowing";
    setDripState((prev) => ({ ...prev, status: nextStatus }));
    toast.info(`IV Drip status changed to ${nextStatus}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl bg-slate-950 text-white border-emerald-500/40 p-0 overflow-hidden shadow-2xl rounded-2xl">
        {patient && (
          <>
        {/* Futuristic Monitor Header */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950/60 to-slate-900 border-b border-emerald-500/30 p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-4 w-4 rounded-full bg-emerald-500 animate-ping absolute inset-0" />
              <div className="h-4 w-4 rounded-full bg-emerald-500 relative flex items-center justify-center">
                <Activity className="h-2.5 w-2.5 text-slate-950" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight text-white">{patient.name}</h2>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-mono">
                  BED {patient.bedNo} • ROOM {patient.roomNo}
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                {patient.age} yrs • {patient.gender} • Condition: <span className="text-emerald-400 font-semibold">{patient.condition}</span> • Attending: Dr. {patient.attendingDoctor}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsAlarmSilenced(!isAlarmSilenced);
                toast.info(isAlarmSilenced ? "Monitor alarms reactivated" : "Monitor alarms silenced");
              }}
              className={isAlarmSilenced ? "bg-amber-500/20 text-amber-400 border-amber-500/40" : "bg-slate-800 border-slate-700 text-slate-300"}
            >
              <ShieldAlert className="h-4 w-4 mr-2" />
              {isAlarmSilenced ? "Alarms Silenced" : "Silence Alarms"}
            </Button>
            <Badge className="bg-slate-900 border border-emerald-500/30 text-emerald-400 font-mono text-xs px-3 py-1.5">
              LIVE ICU FEED 🟢
            </Badge>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">

          {/* TOP SECTION: ECG WAVEFORM + VITAL READOUT CARDS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* ECG Visualizer (2 Cols) */}
            <div className="lg:col-span-2 bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-semibold text-emerald-400 flex items-center gap-1.5">
                  <Activity className="h-4 w-4 animate-pulse text-emerald-400" /> LEAD II ECG WAVEFORM (1mV/cm)
                </span>
                <span className="text-xs font-mono text-slate-500">SPEED: 25mm/s</span>
              </div>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ecgData}>
                    <YAxis domain={[0, 100]} hide />
                    <XAxis dataKey="time" hide />
                    <Line
                      type="monotone"
                      dataKey="ecg"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
                <span>ST SEGMENT: +0.02mV</span>
                <span>QTc: 412ms</span>
                <span>ARRHYTHMIA FILTER: ACTIVE</span>
              </div>
            </div>

            {/* Vital Readouts Grid (1 Col) */}
            <div className="grid grid-cols-2 gap-3">
              {/* Heart Rate */}
              <div className="bg-slate-900/90 border border-emerald-500/30 p-4 rounded-xl flex flex-col justify-between">
                <div className="flex items-center justify-between text-rose-400">
                  <span className="text-xs font-bold font-mono">HR (BPM)</span>
                  <Heart className="h-4 w-4 animate-ping" />
                </div>
                <div className="my-1">
                  <span className="text-3xl font-black text-rose-400 font-mono">{patient.heartRate}</span>
                </div>
                <span className="text-[10px] text-slate-400">Normal Range: 60-100</span>
              </div>

              {/* SpO2 */}
              <div className="bg-slate-900/90 border border-emerald-500/30 p-4 rounded-xl flex flex-col justify-between">
                <div className="flex items-center justify-between text-cyan-400">
                  <span className="text-xs font-bold font-mono">SpO2 (%)</span>
                  <Activity className="h-4 w-4" />
                </div>
                <div className="my-1">
                  <span className="text-3xl font-black text-cyan-400 font-mono">{patient.spO2}%</span>
                </div>
                <span className="text-[10px] text-slate-400">Target: &gt;95%</span>
              </div>

              {/* BP */}
              <div className="bg-slate-900/90 border border-emerald-500/30 p-4 rounded-xl flex flex-col justify-between">
                <div className="flex items-center justify-between text-amber-400">
                  <span className="text-xs font-bold font-mono">NIBP (mmHg)</span>
                  <Zap className="h-4 w-4" />
                </div>
                <div className="my-1">
                  <span className="text-2xl font-black text-amber-400 font-mono">{patient.bp}</span>
                </div>
                <span className="text-[10px] text-slate-400">Mean: 93 mmHg</span>
              </div>

              {/* Temp */}
              <div className="bg-slate-900/90 border border-emerald-500/30 p-4 rounded-xl flex flex-col justify-between">
                <div className="flex items-center justify-between text-purple-400">
                  <span className="text-xs font-bold font-mono">TEMP (°F)</span>
                  <Thermometer className="h-4 w-4" />
                </div>
                <div className="my-1">
                  <span className="text-2xl font-black text-purple-400 font-mono">{patient.temp}°F</span>
                </div>
                <span className="text-[10px] text-slate-400">Normal Range: 97-99</span>
              </div>
            </div>

          </div>

          {/* MIDDLE SECTION: IV DRIP & MEDICATIONS CONTROL */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* IV Drip Monitor */}
            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Droplet className="h-4 w-4 text-cyan-400" />
                  Active IV Drip Infusion Pump
                </h4>
                <Badge
                  className={
                    dripState.status === "Flowing"
                      ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                      : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  }
                >
                  {dripState.status}
                </Badge>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-bold text-white">{dripState.name}</h5>
                    <p className="text-xs text-slate-400">Infusion Rate: <strong className="text-cyan-400">{dripState.flowRate} drops/min</strong></p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleToggleDrip}
                    className="bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800"
                  >
                    {dripState.status === "Flowing" ? <Pause className="h-3.5 w-3.5 mr-1" /> : <Play className="h-3.5 w-3.5 mr-1" />}
                    {dripState.status === "Flowing" ? "Pause Drip" : "Resume Drip"}
                  </Button>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Fluid Remaining</span>
                    <span className="text-cyan-400 font-bold">{dripState.remainingPercent}%</span>
                  </div>
                  <Progress value={dripState.remainingPercent} className="h-2 bg-slate-800" />
                </div>
              </div>
            </div>

            {/* Scheduled Medications */}
            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Pill className="h-4 w-4 text-purple-400" />
                Scheduled Medications & Doses
              </h4>

              <div className="space-y-2.5">
                {meds.map((med) => (
                  <div key={med.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-white">{med.name} ({med.dosage})</h5>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3 text-slate-500" /> Scheduled: {med.time}
                      </p>
                    </div>
                    {med.status === "Given" ? (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Given
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleAdministerMed(med.id)}
                        className="bg-purple-600 hover:bg-purple-500 text-white text-xs h-7 px-3"
                      >
                        Administer Dose
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* BOTTOM SECTION: WARD PHARMACY STOCKS */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Package className="h-4 w-4 text-emerald-400" />
                Ward Medical Supplies & Stock Availability
              </h4>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.success("Stock reorder request submitted to central pharmacy!")}
                className="bg-slate-900 border-slate-700 text-emerald-400 hover:bg-slate-800 text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Request Stock Reorder
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(patient.stocks || [
                { id: "s1", name: "0.9% Saline Bags", quantity: 14, unit: "Bags", status: "In Stock" },
                { id: "s2", name: "20G IV Cannula", quantity: 8, unit: "Pcs", status: "Low Stock" },
                { id: "s3", name: "Syringes (10ml)", quantity: 45, unit: "Pcs", status: "In Stock" },
                { id: "s4", name: "Paracetamol IV", quantity: 5, unit: "Vials", status: "Low Stock" },
              ]).map((stock) => (
                <div key={stock.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">{stock.name}</p>
                    <p className="text-base font-extrabold text-emerald-400 mt-0.5">
                      {stock.quantity} <span className="text-[10px] text-slate-500 font-normal">{stock.unit}</span>
                    </p>
                  </div>
                  <Badge
                    className={
                      stock.status === "In Stock"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px]"
                    }
                  >
                    {stock.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

        </div>

          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
