import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { superAdminNav } from "@/lib/roleNav";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  MapPin, Building2, Users, Stethoscope, Bed, Heart, Baby, Skull, Activity,
  Zap, Droplets, Flame, Wifi, Trash2, Fuel, Plus, Minus, ChevronRight,
  ArrowLeft, Search, Filter, ShieldCheck, CheckCircle2, AlertTriangle, Clock, Receipt, RefreshCw
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { INITIAL_CITIES_DATA, CityData, BranchDetailData, AccessoryItem } from "@/lib/networkData";

export const Route = createFileRoute("/super-admin/network")({
  head: () => ({ meta: [{ title: "City & Branch Network Management — Super Admin" }] }),
  component: SuperAdminNetworkScreen,
});

function SuperAdminNetworkScreen() {
  const [cities, setCities] = useState<CityData[]>(INITIAL_CITIES_DATA);
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Derived selected city and branch
  const currentCity = useMemo(
    () => cities.find((c) => c.id === selectedCityId) || null,
    [cities, selectedCityId]
  );

  const currentBranch = useMemo(() => {
    if (!currentCity) return null;
    return currentCity.branches.find((b) => b.id === selectedBranchId) || null;
  }, [currentCity, selectedBranchId]);

  // Inventory adjustment handler (+ / -)
  const handleQuantityChange = (accId: string, delta: number) => {
    if (!selectedCityId || !selectedBranchId) return;

    setCities((prevCities) =>
      prevCities.map((city) => {
        if (city.id !== selectedCityId) return city;
        return {
          ...city,
          branches: city.branches.map((branch) => {
            if (branch.id !== selectedBranchId) return branch;
            return {
              ...branch,
              accessories: branch.accessories.map((acc) => {
                if (acc.id !== accId) return acc;
                const newQty = Math.max(0, acc.quantity + delta);
                let newStatus: AccessoryItem["status"] = "In Stock";
                if (newQty === 0) newStatus = "Critical";
                else if (newQty < 15) newStatus = "Low Stock";

                toast.info(`${acc.name} quantity updated to ${newQty} ${acc.unit}`);
                return { ...acc, quantity: newQty, status: newStatus };
              }),
            };
          }),
        };
      })
    );
  };

  // Add new accessory item
  const handleAddAccessory = () => {
    if (!selectedCityId || !selectedBranchId) return;
    const name = prompt("Enter item/accessory name:");
    if (!name) return;
    const qtyStr = prompt("Enter initial quantity:", "10");
    const qty = parseInt(qtyStr || "10", 10);

    const newItem: AccessoryItem = {
      id: `acc-custom-${Date.now()}`,
      name,
      category: "Emergency",
      quantity: isNaN(qty) ? 10 : qty,
      status: qty < 5 ? "Critical" : qty < 15 ? "Low Stock" : "In Stock",
      unit: "Units",
    };

    setCities((prevCities) =>
      prevCities.map((city) => {
        if (city.id !== selectedCityId) return city;
        return {
          ...city,
          branches: city.branches.map((branch) => {
            if (branch.id !== selectedBranchId) return branch;
            return {
              ...branch,
              accessories: [newItem, ...branch.accessories],
            };
          }),
        };
      })
    );
    toast.success(`Added ${name} to inventory!`);
  };

  return (
    <AppShell role="super-admin" title="Super Admin" nav={superAdminNav}>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        
        {/* Navigation Breadcrumb Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-teal-900/40 via-emerald-900/30 to-slate-900 border border-emerald-500/20 p-5 rounded-2xl backdrop-blur-md shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
              <span className="cursor-pointer hover:underline" onClick={() => { setSelectedCityId(null); setSelectedBranchId(null); }}>
                Network Cities
              </span>
              {currentCity && (
                <>
                  <ChevronRight className="h-3 w-3 text-slate-500" />
                  <span className="cursor-pointer hover:underline" onClick={() => setSelectedBranchId(null)}>
                    {currentCity.name}
                  </span>
                </>
              )}
              {currentBranch && (
                <>
                  <ChevronRight className="h-3 w-3 text-slate-500" />
                  <span className="text-white font-bold">{currentBranch.name}</span>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Building2 className="h-7 w-7 text-emerald-400" />
              {currentBranch
                ? currentBranch.name
                : currentCity
                ? `${currentCity.name} Hospital Branches`
                : "National Healthcare Network Directory"}
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              {currentBranch
                ? `Branch Code: ${currentBranch.code} • Manager: ${currentBranch.manager}`
                : currentCity
                ? `Manage all medical facilities in ${currentCity.name}, ${currentCity.province}`
                : "Select a city to inspect branch facilities, staff, accessories, vital metrics, and utility bills"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {(selectedCityId || selectedBranchId) && (
              <Button
                variant="outline"
                onClick={() => {
                  if (selectedBranchId) setSelectedBranchId(null);
                  else setSelectedCityId(null);
                }}
                className="bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
            )}

            {!selectedCityId && (
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search city or branch..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-slate-900/80 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* ================= LEVEL 1: CITY SELECTION GRID ================= */}
        {!selectedCityId && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {cities
                .filter(
                  (c) =>
                    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    c.province.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((city) => (
                  <Card
                    key={city.id}
                    onClick={() => setSelectedCityId(city.id)}
                    className="group relative overflow-hidden bg-slate-900/60 border-slate-800 hover:border-emerald-500/50 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1 rounded-2xl"
                  >
                    <div className="h-44 w-full relative overflow-hidden">
                      <img
                        src={city.image}
                        alt={city.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-70 group-hover:opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                      <Badge className="absolute top-3 right-3 bg-emerald-500/90 text-slate-950 font-bold px-3 py-1">
                        {city.totalBranches} Branches
                      </Badge>
                      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                            {city.name}
                          </h3>
                          <p className="text-xs text-slate-300 flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-emerald-400" /> {city.province}
                          </p>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-5 space-y-4">
                      <div className="grid grid-cols-3 gap-2 py-2 bg-slate-950/50 rounded-xl border border-slate-800/80 text-center">
                        <div>
                          <p className="text-xs text-slate-400 font-medium">Total Beds</p>
                          <p className="text-base font-bold text-emerald-400">{city.totalBeds}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-medium">Doctors</p>
                          <p className="text-base font-bold text-blue-400">{city.totalDoctors}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-medium">Patients</p>
                          <p className="text-base font-bold text-purple-400">{city.totalPatients}</p>
                        </div>
                      </div>

                      <Button className="w-full bg-slate-800 group-hover:bg-emerald-600 text-white font-medium justify-between transition-colors">
                        Explore Branches
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </motion.div>
        )}

        {/* ================= LEVEL 2: BRANCH LISTING (CITY SELECTED) ================= */}
        {currentCity && !selectedBranchId && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-400" />
                Available Medical Branches in {currentCity.name} ({currentCity.branches.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentCity.branches.map((branch) => (
                <Card
                  key={branch.id}
                  onClick={() => setSelectedBranchId(branch.id)}
                  className="group bg-slate-900/80 border-slate-800 hover:border-emerald-500/60 transition-all duration-300 cursor-pointer p-6 rounded-2xl shadow-xl hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-slate-800 text-emerald-400 border border-emerald-500/30">
                          {branch.code}
                        </Badge>
                        <Badge
                          className={
                            branch.status === "Active"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          }
                        >
                          {branch.status}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {branch.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-500" /> {branch.address}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-800 text-center">
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                      <p className="text-[11px] text-slate-400">Total Beds</p>
                      <p className="text-base font-bold text-white">{branch.totalBeds}</p>
                    </div>
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                      <p className="text-[11px] text-slate-400">Available</p>
                      <p className="text-base font-bold text-emerald-400">{branch.availableBeds}</p>
                    </div>
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                      <p className="text-[11px] text-slate-400">Doctors</p>
                      <p className="text-base font-bold text-blue-400">{branch.totalDoctors}</p>
                    </div>
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                      <p className="text-[11px] text-slate-400">Patients</p>
                      <p className="text-base font-bold text-purple-400">{branch.totalPatients}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-slate-400 pt-2">
                    <span>Medical Director: <strong className="text-slate-200">{branch.manager}</strong></span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Inspect Branch Dashboard <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* ================= LEVEL 3: DETAILED BRANCH DASHBOARD ================= */}
        {currentBranch && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Quick KPI Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-slate-900/80 border-slate-800 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
                    <Bed className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Beds Occupancy</p>
                    <p className="text-lg font-bold text-white">
                      {currentBranch.occupiedBeds} / {currentBranch.totalBeds}
                      <span className="text-xs font-normal text-emerald-400 ml-1">
                        ({Math.round((currentBranch.occupiedBeds / currentBranch.totalBeds) * 100)}%)
                      </span>
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="bg-slate-900/80 border-slate-800 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                    <Stethoscope className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Active Doctors</p>
                    <p className="text-lg font-bold text-white">{currentBranch.totalDoctors}</p>
                  </div>
                </div>
              </Card>

              <Card className="bg-slate-900/80 border-slate-800 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-rose-500/10 rounded-lg text-rose-400">
                    <Heart className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Lives Saved</p>
                    <p className="text-lg font-bold text-rose-400">{currentBranch.livesSaved}</p>
                  </div>
                </div>
              </Card>

              <Card className="bg-slate-900/80 border-slate-800 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
                    <Baby className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Births Registered</p>
                    <p className="text-lg font-bold text-purple-400">{currentBranch.birthsCount}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* TABBED BRANCH MANAGEMENT INTERFACE */}
            <Tabs defaultValue="accessories" className="w-full">
              <TabsList className="bg-slate-900 border border-slate-800 p-1 rounded-xl w-full justify-start overflow-x-auto">
                <TabsTrigger value="accessories" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                  Inventory & Accessories (+/-)
                </TabsTrigger>
                <TabsTrigger value="vitals" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                  Medical Vitals & Operations
                </TabsTrigger>
                <TabsTrigger value="staff" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                  Doctors & Patients List
                </TabsTrigger>
                <TabsTrigger value="utilities" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                  Utility Bills & Expenses
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: ACCESSORIES & INVENTORY WITH INCREASE / DECREASE */}
              <TabsContent value="accessories" className="mt-4 space-y-4">
                <Card className="bg-slate-900/90 border-slate-800 p-6 rounded-2xl">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Bed className="h-5 w-5 text-emerald-400" />
                        Branch Equipment, Beds & Accessories Inventory
                      </h3>
                      <p className="text-xs text-slate-400">
                        Real-time quantity control for hospital assets in {currentBranch.name}.
                      </p>
                    </div>

                    <Button onClick={handleAddAccessory} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                      <Plus className="h-4 w-4 mr-2" /> Add New Item
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentBranch.accessories.map((item) => (
                      <div
                        key={item.id}
                        className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
                              {item.category}
                            </span>
                            <h4 className="text-base font-bold text-white">{item.name}</h4>
                          </div>
                          <Badge
                            className={
                              item.status === "In Stock"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : item.status === "Low Stock"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                            }
                          >
                            {item.status}
                          </Badge>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                          <div>
                            <span className="text-xs text-slate-400">Quantity</span>
                            <p className="text-xl font-extrabold text-white">
                              {item.quantity} <span className="text-xs text-slate-400 font-normal">{item.unit}</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleQuantityChange(item.id, -1)}
                              className="h-8 w-8 p-0 bg-slate-900 border-slate-700 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/40"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleQuantityChange(item.id, 1)}
                              className="h-8 w-8 p-0 bg-slate-900 border-slate-700 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/40"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              {/* TAB 2: VITAL STATS & OPERATIONS */}
              <TabsContent value="vitals" className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="bg-gradient-to-br from-emerald-950/40 to-slate-900 border-emerald-500/30 p-5 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
                        <Heart className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-300 font-medium">Lives Saved</p>
                        <p className="text-2xl font-extrabold text-emerald-400">{currentBranch.livesSaved}</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-950/40 to-slate-900 border-purple-500/30 p-5 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
                        <Baby className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-300 font-medium">Births Recorded</p>
                        <p className="text-2xl font-extrabold text-purple-400">{currentBranch.birthsCount}</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-gradient-to-br from-rose-950/40 to-slate-900 border-rose-500/30 p-5 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-rose-500/20 text-rose-400 rounded-xl">
                        <Skull className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-300 font-medium">Mortality Count</p>
                        <p className="text-2xl font-extrabold text-rose-400">{currentBranch.deathsCount}</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-950/40 to-slate-900 border-blue-500/30 p-5 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
                        <Activity className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-300 font-medium">Total Surgeries</p>
                        <p className="text-2xl font-extrabold text-blue-400">{currentBranch.surgeriesTotal}</p>
                      </div>
                    </div>
                  </Card>
                </div>

                <Card className="bg-slate-900/90 border-slate-800 p-6 rounded-2xl space-y-4">
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-emerald-400" />
                    Surgical & Emergency Operational Metrics
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <p className="text-xs text-slate-400">Emergency Trauma Surgeries</p>
                      <p className="text-xl font-bold text-amber-400 mt-1">{currentBranch.emergencyOps} Cases</p>
                      <p className="text-xs text-slate-500 mt-1">Handled with 98.4% success rate</p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <p className="text-xs text-slate-400">Successful Patient Discharges</p>
                      <p className="text-xl font-bold text-emerald-400 mt-1">{currentBranch.successfulDischarges} Patients</p>
                      <p className="text-xs text-slate-500 mt-1">This current quarter</p>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* TAB 3: DOCTORS AND PATIENTS */}
              <TabsContent value="staff" className="mt-4 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Doctors */}
                  <Card className="bg-slate-900/90 border-slate-800 p-5 rounded-2xl">
                    <h4 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                      <Stethoscope className="h-5 w-5 text-blue-400" />
                      Assigned Doctors ({currentBranch.doctors.length})
                    </h4>
                    <div className="space-y-3">
                      {currentBranch.doctors.map((doc) => (
                        <div key={doc.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                          <div>
                            <h5 className="text-sm font-bold text-white">{doc.name}</h5>
                            <p className="text-xs text-slate-400">{doc.specialty} • {doc.experience}</p>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                              {doc.status}
                            </Badge>
                            <p className="text-[11px] text-slate-500 mt-1">{doc.patientsCount} Active Patients</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Patients */}
                  <Card className="bg-slate-900/90 border-slate-800 p-5 rounded-2xl">
                    <h4 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5 text-purple-400" />
                      Admitted Patients Overview
                    </h4>
                    <div className="space-y-3">
                      {currentBranch.patients.map((pat) => (
                        <div key={pat.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                          <div>
                            <h5 className="text-sm font-bold text-white">{pat.name} ({pat.age} yrs, {pat.gender})</h5>
                            <p className="text-xs text-slate-400">Condition: <span className="text-slate-200">{pat.condition}</span></p>
                            <p className="text-[11px] text-slate-500">Bed: {pat.bedNo} • Dr. {pat.assignedDoctor}</p>
                          </div>
                          <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30">
                            {pat.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {/* TAB 4: UTILITY BILLS & EXPENSES */}
              <TabsContent value="utilities" className="mt-4 space-y-4">
                <Card className="bg-slate-900/90 border-slate-800 p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-amber-400" />
                        Branch Utility Bills & Operational Invoices
                      </h4>
                      <p className="text-xs text-slate-400">Electricity, Water, Gas, Fuel, and Maintenance accounts for {currentBranch.name}.</p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-400">Total Monthly Utilities</p>
                      <p className="text-lg font-extrabold text-amber-400">
                        PKR {currentBranch.utilityBills.reduce((acc, b) => acc + b.amount, 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentBranch.utilityBills.map((bill) => (
                      <div key={bill.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{bill.category}</span>
                          <Badge
                            className={
                              bill.status === "Paid"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : bill.status === "Pending"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                            }
                          >
                            {bill.status}
                          </Badge>
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-white">{bill.title}</h5>
                          <p className="text-xs text-slate-400">Consumption: {bill.consumption}</p>
                        </div>
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                          <span className="text-xs text-slate-500">Due: {bill.dueDate}</span>
                          <span className="text-base font-bold text-amber-400">PKR {bill.amount.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </div>
    </AppShell>
  );
}
