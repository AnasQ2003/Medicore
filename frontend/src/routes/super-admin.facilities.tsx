import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { superAdminNav } from "@/lib/roleNav";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Building2, Plus, Settings, MapPin, Clock, CheckCircle2, ShieldAlert, Search, RefreshCw, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getFacilities, saveFacilities, addFacility, updateFacilityStatus, HospitalFacility } from "@/lib/facilityStore";

export const Route = createFileRoute("/super-admin/facilities")({
  head: () => ({ meta: [{ title: "Facilities Setup & Config — Super Admin" }] }),
  component: SuperAdminFacilitiesScreen,
});

function SuperAdminFacilitiesScreen() {
  const [facilities, setFacilities] = useState<HospitalFacility[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    category: "VIP & Comfort" as HospitalFacility["category"],
    description: "",
    accessFee: 15000,
    location: "Floor 1",
    operatingHours: "24/7 Open",
    amenities: "Private Wifi, Lounge, TV"
  });

  const loadData = () => setFacilities(getFacilities());

  useEffect(() => {
    loadData();
    window.addEventListener("medicore_facilities_updated", loadData);
    return () => window.removeEventListener("medicore_facilities_updated", loadData);
  }, []);

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
              Hospital Facilities & Amenities Config Desk
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Configure specialized medical facilities, set pricing access fees, and toggle operational availability.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={() => setCreateOpen(true)} className="bg-purple-600 hover:bg-purple-500 text-white font-bold">
              <Plus className="h-4 w-4 mr-2" /> Add New Facility
            </Button>
          </div>
        </div>

        {/* Filter Search */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search facility name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-slate-900 border-slate-800 text-white"
            />
          </div>

          <p className="text-xs font-mono text-slate-400">{filteredFacilities.length} Facilities Active</p>
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
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs"
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
                  <p className="text-base font-bold text-emerald-400">PKR {fac.accessFee.toLocaleString()}</p>
                </div>

                <Button size="sm" variant="ghost" onClick={() => handleDelete(fac.id)} className="text-rose-400 hover:text-rose-500 hover:bg-rose-500/10">
                  <Trash2 className="h-4 w-4" /> Remove
                </Button>
              </div>
            </Card>
          ))}
        </div>

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
                  className="mt-1 bg-slate-900 border-slate-800 text-white"
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
                    className="mt-1 bg-slate-900 border-slate-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Description</label>
                <Input
                  placeholder="Brief description of amenities and features..."
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="mt-1 bg-slate-900 border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Location / Wing</label>
                  <Input
                    value={form.location}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                    className="mt-1 bg-slate-900 border-slate-800 text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Operating Hours</label>
                  <Input
                    value={form.operatingHours}
                    onChange={(e) => setForm((f) => ({ ...f, operatingHours: e.target.value }))}
                    className="mt-1 bg-slate-900 border-slate-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Amenities (comma separated)</label>
                <Input
                  value={form.amenities}
                  onChange={(e) => setForm((f) => ({ ...f, amenities: e.target.value }))}
                  className="mt-1 bg-slate-900 border-slate-800 text-white"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateFacility} className="bg-purple-600 text-white font-bold">
                Save & Publish Facility
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </AppShell>
  );
}
