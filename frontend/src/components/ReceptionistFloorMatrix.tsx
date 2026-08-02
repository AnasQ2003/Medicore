import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Bed, CheckCircle2, AlertCircle, RefreshCw, User, Calendar, Clock, BarChart3, Layers } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";
import { toast } from "sonner";

export interface RoomData {
  id: string;
  roomNumber: string;
  floor: number;
  type: "ICU" | "General Ward" | "VIP Suite" | "Emergency OPD" | "Private Room";
  status: "Available" | "Occupied" | "Cleaning" | "Maintenance";
  patientName?: string;
  assignedDoctor?: string;
  dailyRate: number;
}

const INITIAL_ROOMS: RoomData[] = [
  // Floor 1: Emergency OPD
  { id: "r101", roomNumber: "101", floor: 1, type: "Emergency OPD", status: "Occupied", patientName: "Ahmad Raza", assignedDoctor: "Dr. Maria Qureshi", dailyRate: 5000 },
  { id: "r102", roomNumber: "102", floor: 1, type: "Emergency OPD", status: "Available", dailyRate: 5000 },
  { id: "r103", roomNumber: "103", floor: 1, type: "Emergency OPD", status: "Cleaning", dailyRate: 5000 },
  { id: "r104", roomNumber: "104", floor: 1, type: "Emergency OPD", status: "Occupied", patientName: "Usman Malik", assignedDoctor: "Dr. Arshad Mahmood", dailyRate: 5000 },
  
  // Floor 2: ICU & Surgery
  { id: "r201", roomNumber: "201", floor: 2, type: "ICU", status: "Occupied", patientName: "Muhammad Usama", assignedDoctor: "Dr. Ayesha Malik", dailyRate: 25000 },
  { id: "r202", roomNumber: "202", floor: 2, type: "ICU", status: "Occupied", patientName: "Sara Ahmed", assignedDoctor: "Dr. Ayesha Malik", dailyRate: 25000 },
  { id: "r203", roomNumber: "203", floor: 2, type: "ICU", status: "Available", dailyRate: 25000 },
  { id: "r204", roomNumber: "204", floor: 2, type: "ICU", status: "Maintenance", dailyRate: 25000 },

  // Floor 3: General Ward
  { id: "r301", roomNumber: "301-A", floor: 3, type: "General Ward", status: "Occupied", patientName: "Kashif Mahmood", assignedDoctor: "Dr. Bilal Khan", dailyRate: 3500 },
  { id: "r302", roomNumber: "301-B", floor: 3, type: "General Ward", status: "Available", dailyRate: 3500 },
  { id: "r303", roomNumber: "302-A", floor: 3, type: "General Ward", status: "Cleaning", dailyRate: 3500 },
  { id: "r304", roomNumber: "302-B", floor: 3, type: "General Ward", status: "Available", dailyRate: 3500 },

  // Floor 4: VIP Suites
  { id: "r401", roomNumber: "VIP-401", floor: 4, type: "VIP Suite", status: "Occupied", patientName: "Zubair Shah", assignedDoctor: "Dr. Usman Gondal", dailyRate: 35000 },
  { id: "r402", roomNumber: "VIP-402", floor: 4, type: "VIP Suite", status: "Available", dailyRate: 35000 },
  { id: "r403", roomNumber: "VIP-403", floor: 4, type: "VIP Suite", status: "Available", dailyRate: 35000 },

  // Floor 5: Maternity & Pediatric
  { id: "r501", roomNumber: "501-M", floor: 5, type: "Private Room", status: "Occupied", patientName: "Noreen Imran", assignedDoctor: "Dr. Fatima Zahra", dailyRate: 12000 },
  { id: "r502", roomNumber: "502-M", floor: 5, type: "Private Room", status: "Available", dailyRate: 12000 },
];

const PEAK_HOURS_DATA = [
  { hour: "08:00 AM", checkIns: 12, waitTime: 8 },
  { hour: "10:00 AM", checkIns: 42, waitTime: 22 },
  { hour: "12:00 PM", checkIns: 35, waitTime: 18 },
  { hour: "02:00 PM", checkIns: 28, waitTime: 14 },
  { hour: "04:00 PM", checkIns: 38, waitTime: 20 },
  { hour: "06:00 PM", checkIns: 20, waitTime: 10 },
];

export function ReceptionistFloorMatrix() {
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [rooms, setRooms] = useState<RoomData[]>(INITIAL_ROOMS);

  const filteredRooms = rooms.filter(
    (r) => r.floor === selectedFloor && (statusFilter === "All" || r.status === statusFilter)
  );

  const handleRoomAction = (roomId: string, currentStatus: RoomData["status"]) => {
    if (currentStatus === "Available") {
      const pName = prompt("Enter patient name to assign room:");
      if (!pName) return;
      setRooms((prev) =>
        prev.map((r) => (r.id === roomId ? { ...r, status: "Occupied", patientName: pName, assignedDoctor: "Dr. On Duty" } : r))
      );
      toast.success(`Room assigned to ${pName}!`);
    } else if (currentStatus === "Occupied") {
      if (confirm("Discharge patient and mark room for cleaning?")) {
        setRooms((prev) =>
          prev.map((r) => (r.id === roomId ? { ...r, status: "Cleaning", patientName: undefined, assignedDoctor: undefined } : r))
        );
        toast.info("Room marked for housekeeping & sanitization");
      }
    } else if (currentStatus === "Cleaning") {
      setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, status: "Available" } : r)));
      toast.success("Room sanitized and ready for new patient!");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* SECTION 1: INTERACTIVE MULTI-FLOOR ROOM MATRIX */}
      <Card className="bg-slate-900/90 border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Building2 className="h-6 w-6 text-emerald-400" />
              Multi-Floor Room & Ward Directory Matrix
            </h3>
            <p className="text-xs text-slate-400">
              Live room status, occupancy, and room assignment across Floors 1 to 5.
            </p>
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {["All", "Available", "Occupied", "Cleaning", "Maintenance"].map((st) => (
              <Button
                key={st}
                size="sm"
                variant={statusFilter === st ? "default" : "outline"}
                onClick={() => setStatusFilter(st)}
                className={
                  statusFilter === st
                    ? "bg-emerald-600 text-white font-bold"
                    : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800"
                }
              >
                {st}
              </Button>
            ))}
          </div>
        </div>

        {/* Floor Selection Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-3 overflow-x-auto">
          {[1, 2, 3, 4, 5].map((fl) => (
            <Button
              key={fl}
              onClick={() => setSelectedFloor(fl)}
              className={
                selectedFloor === fl
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold px-5"
                  : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
              }
            >
              <Layers className="h-4 w-4 mr-2" /> Floor {fl} {fl === 1 ? "(Emergency)" : fl === 2 ? "(ICU)" : fl === 3 ? "(Wards)" : fl === 4 ? "(VIP)" : "(Maternity)"}
            </Button>
          ))}
        </div>

        {/* Room Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between hover:border-emerald-500/40 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-400">ROOM {room.roomNumber}</span>
                  <Badge
                    className={
                      room.status === "Available"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : room.status === "Occupied"
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                        : room.status === "Cleaning"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }
                  >
                    {room.status}
                  </Badge>
                </div>

                <h4 className="text-base font-bold text-white mt-2">{room.type}</h4>
                {room.patientName ? (
                  <div className="mt-2 text-xs text-slate-300 space-y-0.5">
                    <p className="font-semibold text-emerald-400">Patient: {room.patientName}</p>
                    <p className="text-slate-400">{room.assignedDoctor}</p>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-slate-500 italic">No patient assigned</p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">PKR {room.dailyRate.toLocaleString()}/day</span>
                <Button
                  size="sm"
                  onClick={() => handleRoomAction(room.id, room.status)}
                  className="bg-slate-900 hover:bg-emerald-600 text-white text-xs h-7 px-2.5"
                >
                  {room.status === "Available" ? "Assign Room" : room.status === "Occupied" ? "Discharge" : "Ready"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* SECTION 2: FRONT DESK PEAK HOURS & QUEUE WAIT TIME ANALYTICS */}
      <Card className="bg-slate-900/90 border-slate-800 p-6 rounded-2xl shadow-xl">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-blue-400" />
          Front Desk Registration Peak Hours & Queue Wait Times
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase mb-3">Hourly Check-ins Trend</h4>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={PEAK_HOURS_DATA}>
                  <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff" }} />
                  <Area type="monotone" dataKey="checkIns" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase mb-3">Average Queue Wait Time (Minutes)</h4>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={PEAK_HOURS_DATA}>
                  <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff" }} />
                  <Bar dataKey="waitTime" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </Card>

    </div>
  );
}
