import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { patientNav } from "@/lib/roleNav";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Building2, Sparkles, MapPin, Clock, CheckCircle2, ShieldAlert, Search, Filter, ChevronRight, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getFacilities, HospitalFacility } from "@/lib/facilityStore";
import { submitUniversalRequest } from "@/lib/leaveStore";
import { getUser } from "@/lib/auth";

export const Route = createFileRoute("/patient/facilities")({
  head: () => ({ meta: [{ title: "Hospital Facilities — Patient Portal" }] }),
  component: PatientFacilitiesScreen,
});

function PatientFacilitiesScreen() {
  const currentUser = getUser();
  const [facilities, setFacilities] = useState<HospitalFacility[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedFacility, setSelectedFacility] = useState<HospitalFacility | null>(null);
  const [requestNotes, setRequestNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = () => setFacilities(getFacilities());

  useEffect(() => {
    loadData();
    window.addEventListener("medicore_facilities_updated", loadData);
    return () => window.removeEventListener("medicore_facilities_updated", loadData);
  }, []);

  const categories = ["All", "VIP & Comfort", "Advanced Diagnostics", "Surgical & ICU", "Rehab & Therapy", "Emergency Transport"];

  const filteredFacilities = facilities.filter((f) => {
    const matchCat = selectedCategory === "All" || f.category === selectedCategory;
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) || f.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleRequestFacilityAccess = () => {
    if (!selectedFacility) return;
    setIsSubmitting(true);

    submitUniversalRequest({
      applicantName: currentUser?.name || "Patient",
      applicantEmail: currentUser?.email || "patient@medicore.app",
      applicantRole: "patient",
      department: "Facility Services",
      category: "Facility & Accessibility",
      requestType: `Access Request: ${selectedFacility.name}`,
      priority: "Normal",
      reason: `Patient requested access to ${selectedFacility.name} (PKR ${selectedFacility.accessFee.toLocaleString()}). Notes: ${requestNotes || 'Standard facility booking'}`,
      requestedItems: selectedFacility.name
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setSelectedFacility(null);
      setRequestNotes("");
      toast.success(`Request submitted for ${selectedFacility.name}!`, {
        description: "Super Admin has received your request for verification."
      });
    }, 600);
  };

  return (
    <AppShell role="patient" title="Patient Portal" nav={patientNav}>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-900/40 via-teal-900/30 to-slate-900 border border-emerald-500/20 p-6 rounded-2xl shadow-xl">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Hospital Amenities</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3 mt-1">
              <Building2 className="h-7 w-7 text-emerald-400" />
              Specialized Medical & Comfort Facilities
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Browse world-class diagnostic centers, VIP suites, aquatic therapy pools, and air evacuation units.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search facility name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-slate-900/80 border-slate-700 text-white"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat)}
              className={
                selectedCategory === cat
                  ? "bg-emerald-600 text-white font-bold"
                  : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
              }
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Facilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFacilities.map((fac) => (
            <Card
              key={fac.id}
              className="group bg-slate-900/90 border-slate-800 hover:border-emerald-500/50 transition-all duration-300 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="h-44 w-full relative overflow-hidden">
                  <img
                    src={fac.image}
                    alt={fac.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                  <Badge
                    className={
                      fac.status === "Available"
                        ? "absolute top-3 right-3 bg-emerald-500/90 text-slate-950 font-bold"
                        : "absolute top-3 right-3 bg-amber-500/90 text-slate-950 font-bold"
                    }
                  >
                    {fac.status}
                  </Badge>
                </div>

                <CardContent className="p-5 space-y-3">
                  <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">{fac.category}</span>
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {fac.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{fac.description}</p>

                  <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs text-slate-300">
                    <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-400" /> {fac.location}</p>
                    <p className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-slate-400" /> {fac.operatingHours}</p>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {fac.amenities.map((am) => (
                      <span key={am} className="text-[10px] bg-slate-950 px-2 py-0.5 rounded-md text-slate-300 border border-slate-800">
                        ✓ {am}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </div>

              <div className="p-5 pt-0 border-t border-slate-800/60 mt-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400">Access Fee</span>
                  <p className="text-lg font-extrabold text-emerald-400">PKR {fac.accessFee.toLocaleString()}</p>
                </div>

                <Button
                  onClick={() => setSelectedFacility(fac)}
                  disabled={fac.status === "Maintenance"}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  Select & Request
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Request Dialog */}
        <Dialog open={Boolean(selectedFacility)} onOpenChange={() => setSelectedFacility(null)}>
          <DialogContent className="bg-slate-950 border-emerald-500/30 text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-400" />
                Request Access: {selectedFacility?.name}
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-xs">
                Submit an official facility request to Super Admin for approval.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1 text-xs">
                <p className="text-slate-300">Category: <strong className="text-white">{selectedFacility?.category}</strong></p>
                <p className="text-slate-300">Access Fee: <strong className="text-emerald-400">PKR {selectedFacility?.accessFee.toLocaleString()}</strong></p>
                <p className="text-slate-300">Location: <strong className="text-white">{selectedFacility?.location}</strong></p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Additional Instructions / Special Requirements</label>
                <Input
                  placeholder="e.g., Wheelchair assistance needed, specific date..."
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  className="mt-1.5 bg-slate-900 border-slate-800 text-white"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedFacility(null)}>Cancel</Button>
              <Button onClick={handleRequestFacilityAccess} disabled={isSubmitting} className="bg-emerald-600 text-white font-bold">
                {isSubmitting ? "Submitting Request..." : "Confirm & Send to Admin"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </AppShell>
  );
}
