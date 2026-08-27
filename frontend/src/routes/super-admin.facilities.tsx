import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { superAdminNav } from "@/lib/roleNav";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  Building2,
  Plus,
  Settings,
  MapPin,
  Clock,
  CheckCircle2,
  ShieldAlert,
  Search,
  RefreshCw,
  Trash2,
  Sparkles,
  BedDouble,
  Receipt,
  User,
  Activity,
  HeartPulse,
  Info,
  Edit3,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getFacilities, saveFacilities, addFacility, updateFacilityStatus, HospitalFacility } from "@/lib/facilityStore";
import { CinemaFloorBedMap, BedInfo, BedStatus } from "@/components/CinemaFloorBedMap";

const BEDS_STORAGE_KEY = "medicore_nurse_beds";

export const Route = createFileRoute("/super-admin/facilities")({
  head: () => ({ meta: [{ title: "Facilities & Ward Bed Matrix — Super Admin" }] }),
  component: SuperAdminFacilitiesScreen,
});

function SuperAdminFacilitiesScreen() {
  const [activeTab, setActiveTab] = useState<"beds" | "amenities">("beds");
  const [facilities, setFacilities] = useState<HospitalFacility[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Bed state for Super Admin overview
  const [beds, setBeds] = useState<BedInfo[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(BEDS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return [];
  });

  const [viewBed, setViewBed] = useState<BedInfo | null>(null);

  const loadData = () => {
    setFacilities(getFacilities());
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(BEDS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) setBeds(parsed);
        }
      } catch {}
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener("medicore_facilities_updated", loadData);
    return () => window.removeEventListener("medicore_facilities_updated", loadData);
  }, []);

  const [form, setForm] = useState({
    name: "",
    category: "VIP & Comfort" as HospitalFacility["category"],
    description: "",
    accessFee: 15000,
    location: "Floor 1",
    operatingHours: "24/7 Open",
    amenities: "Private Wifi, Lounge, TV"
  });


  const handleStatusToggle = (id: string, currentStatus: HospitalFacility["status"]) => {
    const next: HospitalFacility["status"] =
      currentStatus === "Available" ? "Maintenance" : currentStatus === "Maintenance" ? "Fully Booked" : "Available";
    updateFacilityStatus(id, next);
    toast.success(`Facility status updated to ${next}`);
  };

  const handleCreateFacility = () => {
    if (!form.name || !form.description) return toast.error("Name and description are required");

    addFacility({
      name: form.name,
      category: form.category,
      description: form.description,
      status: "Available",
      accessFee: Number(form.accessFee) || 15000,
      location: form.location,
      operatingHours: form.operatingHours,
      amenities: form.amenities.split(",").map((s) => s.trim()),
      image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=600&q=80"
    });

    setCreateOpen(false);
    setForm({
      name: "",
      category: "VIP & Comfort",
      description: "",
      accessFee: 15000,
      location: "Floor 1",
      operatingHours: "24/7 Open",
      amenities: "Private Wifi, Lounge, TV"
    });
    toast.success("New hospital facility configured successfully!");
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to remove this facility?")) return;
    const updated = facilities.filter((f) => f.id !== id);
    saveFacilities(updated);
    toast.info("Facility configuration removed.");
  };

  const filteredFacilities = facilities.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()) || f.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell role="super-admin" title="Super Admin" nav={superAdminNav}>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-slate-900 border border-purple-500/20 p-6 rounded-2xl shadow-xl">
          <div>
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Super Admin Management</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3 mt-1">
              <Building2 className="h-7 w-7 text-purple-400" />
              Hospital Ward Bed Matrix & Facilities Desk
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Live hospital floor occupancy matrix, cinema-style bed booking status, and specialized amenities configuration.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
            <Button
              size="sm"
              variant={activeTab === "beds" ? "default" : "ghost"}
              onClick={() => setActiveTab("beds")}
              className={`h-9 px-4 text-xs font-bold rounded-xl cursor-pointer ${
                activeTab === "beds" ? "bg-purple-600 hover:bg-purple-500 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-amber-300" />
              Cinema Floor Map 🎦
            </Button>
            <Button
              size="sm"
              variant={activeTab === "amenities" ? "default" : "ghost"}
              onClick={() => setActiveTab("amenities")}
              className={`h-9 px-4 text-xs font-bold rounded-xl cursor-pointer ${
                activeTab === "amenities" ? "bg-purple-600 hover:bg-purple-500 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              <Building2 className="h-3.5 w-3.5 mr-1.5" />
              Facilities Config 🏢
            </Button>
          </div>
        </div>

        {/* TAB 1: CINEMA-STYLE FLOOR MAP & BED MATRIX */}
        {activeTab === "beds" ? (
          <div className="space-y-6">
            <CinemaFloorBedMap
              beds={beds}
              onSelectBed={(bed) => setViewBed(bed)}
            />
          </div>
        ) : (
          /* TAB 2: SPECIALIZED AMENITIES CONFIG */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search facility name or category..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-slate-900 border-slate-800 text-white text-xs"
                />
              </div>

              <div className="flex items-center gap-3">
                <p className="text-xs font-mono text-slate-400">{filteredFacilities.length} Facilities Active</p>
                <Button onClick={() => setCreateOpen(true)} className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold">
                  <Plus className="h-4 w-4 mr-1.5" /> Add Facility
                </Button>
              </div>
            </div>

            {/* Grid of Facilities */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFacilities.map((fac) => (
                <Card key={fac.id} className="bg-slate-900/90 border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider">{fac.category}</span>
                        <h3 className="text-lg font-bold text-white mt-0.5">{fac.name}</h3>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusToggle(fac.id, fac.status)}
                        className={
                          fac.status === "Available"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs cursor-pointer"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs cursor-pointer"
                        }
                      >
                        {fac.status}
                      </Button>
                    </div>

                    <p className="text-xs text-slate-400 mt-2">{fac.description}</p>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1 text-xs text-slate-300">
                      <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-400" /> {fac.location}</p>
                      <p className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-slate-400" /> {fac.operatingHours}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400">Access Fee</span>
                      <p className="text-base font-bold text-emerald-400 font-mono">PKR {fac.accessFee.toLocaleString()}</p>
                    </div>

                    <Button size="sm" variant="ghost" onClick={() => handleDelete(fac.id)} className="text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer">
                      <Trash2 className="h-4 w-4" /> Remove
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Configure Facility Modal */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="bg-slate-950 border-purple-500/30 text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-400" />
                Configure New Hospital Facility
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-xs">
                Add a specialized amenity or high-tech medical wing.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 my-2">
              <div>
                <label className="text-xs font-semibold text-slate-300">Facility Name *</label>
                <Input
                  placeholder="e.g. Neonatal Intensive Care Suite"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="mt-1 bg-slate-900 border-slate-800 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as any }))}
                    className="mt-1 w-full bg-slate-900 border border-slate-800 text-white rounded-md h-9 px-3 text-xs"
                  >
                    <option value="VIP & Comfort">VIP & Comfort</option>
                    <option value="Advanced Diagnostics">Advanced Diagnostics</option>
                    <option value="Surgical & ICU">Surgical & ICU</option>
                    <option value="Rehab & Therapy">Rehab & Therapy</option>
                    <option value="Emergency Transport">Emergency Transport</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Access Fee (PKR)</label>
                  <Input
                    type="number"
                    value={form.accessFee}
                    onChange={(e) => setForm((f) => ({ ...f, accessFee: Number(e.target.value) }))}
                    className="mt-1 bg-slate-900 border-slate-800 text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Description</label>
                <Input
                  placeholder="Brief description of amenities and features..."
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="mt-1 bg-slate-900 border-slate-800 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Location / Wing</label>
                  <Input
                    value={form.location}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                    className="mt-1 bg-slate-900 border-slate-800 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Operating Hours</label>
                  <Input
                    value={form.operatingHours}
                    onChange={(e) => setForm((f) => ({ ...f, operatingHours: e.target.value }))}
                    className="mt-1 bg-slate-900 border-slate-800 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Amenities (Comma separated)</label>
                <Input
                  placeholder="WiFi, AC, Medical Gas, Sofa"
                  value={form.amenities}
                  onChange={(e) => setForm((f) => ({ ...f, amenities: e.target.value }))}
                  className="mt-1 bg-slate-900 border-slate-800 text-white text-xs"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setCreateOpen(false)} className="text-slate-400 text-xs">
                Cancel
              </Button>
              <Button onClick={handleCreateFacility} className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold">
                Create Facility
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Super Admin Bed Full Details & Billing Modal */}
        <Dialog open={Boolean(viewBed)} onOpenChange={(open) => !open && setViewBed(null)}>
          <DialogContent className="bg-slate-950 border-purple-500/40 text-white sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            {viewBed && (
              <>
                <DialogHeader>
                  <div className="flex items-center justify-between gap-3 pr-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-500/20 p-2.5 rounded-2xl text-purple-400">
                        <BedDouble className="h-6 w-6" />
                      </div>
                      <div>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
                          <span>Bed {viewBed.bedId}</span>
                          <Badge className={viewBed.status === "Occupied" ? "bg-rose-500/20 text-rose-300 border-rose-500/40" : viewBed.status === "Available" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-amber-500/20 text-amber-300 border-amber-500/40"}>
                            {viewBed.status}
                          </Badge>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-400">
                          {viewBed.ward} • Room {viewBed.roomNo} • {viewBed.floorNo}
                        </DialogDescription>
                      </div>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-4 py-2 text-xs">
                  {viewBed.status === "Occupied" && (
                    <>
                      {/* Patient Details */}
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-sm text-white flex items-center gap-2">
                            <User className="h-4 w-4 text-purple-400" />
                            {viewBed.patient}
                          </h4>
                          <Badge variant="outline" className="font-mono text-purple-400 border-purple-500/40">
                            {viewBed.patientCode || "P-1001"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-slate-300 pt-2">
                          <div>
                            <span className="text-[10px] text-slate-500 block">Length of Stay</span>
                            <span className="font-bold text-white">{viewBed.admittedDays || 1} Days Admitted</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block">Admission Date</span>
                            <span className="font-semibold text-white">{viewBed.admittedAt || "2026-08-22"}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block">Attending Doctor</span>
                            <span className="font-semibold text-white truncate block">{viewBed.attendingDoctor || "Dr. Arshad Mahmood"}</span>
                          </div>
                        </div>
                        {viewBed.condition && (
                          <div className="text-slate-400 pt-2 border-t border-slate-800">
                            Diagnosis: <strong className="text-slate-200">{viewBed.condition}</strong>
                          </div>
                        )}
                      </div>

                      {/* Billing Breakdown */}
                      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-white flex items-center gap-2">
                            <Receipt className="h-4 w-4 text-emerald-400" />
                            Inpatient Hospital Revenue & Charges
                          </h4>
                          <span className="text-[10px] text-emerald-400 font-mono">Current Accrued</span>
                        </div>

                        <div className="space-y-1.5 text-slate-300 divide-y divide-slate-800">
                          <div className="flex justify-between pt-1">
                            <span className="text-slate-400">Bed Rent ({viewBed.admittedDays || 1}d @ Rs. {(viewBed.dailyRate || 3500).toLocaleString()}/day):</span>
                            <span className="font-mono font-bold text-white">Rs. {((viewBed.admittedDays || 1) * (viewBed.dailyRate || 3500)).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between pt-1.5">
                            <span className="text-slate-400">Nursing & Telemetry Care:</span>
                            <span className="font-mono font-bold text-white">Rs. {(viewBed.nursingCharges || 6000).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between pt-1.5">
                            <span className="text-slate-400">Pharmacy & Medical Consumables:</span>
                            <span className="font-mono font-bold text-white">Rs. {(viewBed.medsCharges || 8500).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between pt-2 text-sm font-bold">
                            <span className="text-white">Estimated Total Bill:</span>
                            <span className="font-mono text-emerald-400 font-black text-base">
                              Rs. {(
                                (viewBed.admittedDays || 1) * (viewBed.dailyRate || 3500) +
                                (viewBed.nursingCharges || 6000) +
                                (viewBed.medsCharges || 8500)
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {viewBed.status !== "Occupied" && (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Daily Bed Rate:</span>
                        <span className="font-mono font-bold text-white">Rs. {(viewBed.dailyRate || 3500).toLocaleString()} / day</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Location:</span>
                        <span className="text-white font-semibold">{viewBed.ward} • Room {viewBed.roomNo} ({viewBed.floorNo})</span>
                      </div>
                      {viewBed.notes && (
                        <p className="text-slate-400 pt-2 border-t border-slate-800">{viewBed.notes}</p>
                      )}
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setViewBed(null)} className="bg-slate-900 border-slate-800 text-white text-xs cursor-pointer">
                    Close Details
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
