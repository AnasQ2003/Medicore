import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { superAdminNav } from "@/lib/roleNav";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2, Plus, Settings, Users, Phone, MapPin, Search, Filter,
  Trash2, Edit3, ShieldAlert, CheckCircle2, AlertTriangle, Eye, Activity, UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/super-admin/hospitals")({
  head: () => ({ meta: [{ title: "Hospital Branches — Super Admin" }] }),
  component: SuperAdminHospitalsScreen,
});

export interface Branch {
  id: number;
  name: string;
  code: string;
  address: string;
  phone: string;
  beds: number;
  doctors: number;
  patients: number;
  status: "Active" | "Maintenance" | "Busy" | "Inactive";
  manager: string;
  emergencyPhone: string;
}

const initialBranches: Branch[] = [
  {
    id: 1,
    name: "MediCore Islamabad (HQ)",
    code: "ISB-01",
    address: "House 12, Street 5, F-7, Islamabad",
    phone: "+92 51 111 222 333",
    beds: 120,
    doctors: 35,
    patients: 480,
    status: "Active",
    manager: "Dr. Arshad Mahmood",
    emergencyPhone: "+92 51 111 911 001",
  },
  {
    id: 2,
    name: "MediCore Lahore Branch",
    code: "LHR-02",
    address: "88-C, Main Boulevard, Gulberg III, Lahore",
    phone: "+92 42 111 222 333",
    beds: 80,
    doctors: 22,
    patients: 290,
    status: "Active",
    manager: "Dr. Fatima Zahra",
    emergencyPhone: "+92 42 111 911 002",
  },
  {
    id: 3,
    name: "MediCore Karachi Branch",
    code: "KHI-03",
    address: "Plot 42, Block 6, PECHS, Shahrah-e-Faisal, Karachi",
    phone: "+92 21 111 222 333",
    beds: 150,
    doctors: 42,
    patients: 610,
    status: "Active",
    manager: "Dr. Tariq Jameel",
    emergencyPhone: "+92 21 111 911 003",
  },
  {
    id: 4,
    name: "MediCore Rawalpindi Unit",
    code: "RWP-04",
    address: "Peshawar Road, near Westridge, Rawalpindi",
    phone: "+92 51 555 444 333",
    beds: 60,
    doctors: 18,
    patients: 195,
    status: "Busy",
    manager: "Dr. Usman Ali",
    emergencyPhone: "+92 51 555 911 004",
  },
  {
    id: 5,
    name: "MediCore Peshawar Care",
    code: "PEW-05",
    address: "University Road, Phase 3, Hayatabad, Peshawar",
    phone: "+92 91 111 777 888",
    beds: 50,
    doctors: 15,
    patients: 140,
    status: "Maintenance",
    manager: "Dr. Bilal Khan",
    emergencyPhone: "+92 91 111 911 005",
  },
];

const mockStaffPerBranch: Record<number, { name: string; role: string; dept: string; status: string }[]> = {
  1: [
    { name: "Dr. Sarah Khan", role: "Senior Cardiologist", dept: "Cardiology", status: "On Duty" },
    { name: "Dr. Ahmed Hassan", role: "Neurologist", dept: "Neurology", status: "On Duty" },
    { name: "Nurse Maya Lin", role: "Head Nurse", dept: "ICU", status: "On Shift" },
    { name: "Tariq Aziz", role: "Chief Pharmacist", dept: "Pharmacy", status: "Available" },
  ],
  2: [
    { name: "Dr. Hamza Shah", role: "Pediatrician", dept: "Pediatrics", status: "On Duty" },
    { name: "Nurse Sara Ali", role: "Staff Nurse", dept: "Emergency", status: "On Shift" },
    { name: "Zainab Bibi", role: "Reception Lead", dept: "Front Desk", status: "Available" },
  ],
  3: [
    { name: "Dr. Usman Qureshi", role: "General Surgeon", dept: "Surgery", status: "In OR" },
    { name: "Dr. Ayesha Noor", role: "Oncologist", dept: "Oncology", status: "On Duty" },
    { name: "Nurse Kamran", role: "ICU Specialist", dept: "ICU", status: "On Shift" },
  ],
  4: [
    { name: "Dr. Bilal Ahmad", role: "Orthopedic", dept: "Orthopedics", status: "On Duty" },
    { name: "Nurse Hina", role: "Ward Nurse", dept: "General Ward", status: "On Shift" },
  ],
  5: [
    { name: "Dr. Rehan Malik", role: "ENT Specialist", dept: "ENT", status: "On Duty" },
    { name: "Nurse Maryam", role: "Clinic Nurse", dept: "OPD", status: "On Shift" },
  ]
};

function SuperAdminHospitalsScreen() {
  const [branches, setBranches] = useState<Branch[]>(() => {
    try {
      const saved = localStorage.getItem("medicore_hospitals");
      return saved ? JSON.parse(saved) : initialBranches;
    } catch {
      return initialBranches;
    }
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals state
  const [addDialog, setAddDialog] = useState(false);
  const [configDialog, setConfigDialog] = useState<Branch | null>(null);
  const [staffDialog, setStaffDialog] = useState<Branch | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Branch | null>(null);

  // New Branch Form
  const [newBranch, setNewBranch] = useState({
    name: "",
    code: "",
    address: "",
    phone: "",
    beds: 50,
    doctors: 10,
    status: "Active" as Branch["status"],
    manager: "",
    emergencyPhone: "",
  });

  // Save to localStorage whenever branches update
  useEffect(() => {
    try {
      localStorage.setItem("medicore_hospitals", JSON.stringify(branches));
    } catch (e) {
      console.error("Failed to save hospitals to localStorage", e);
    }
  }, [branches]);

  const filteredBranches = useMemo(() => {
    return branches.filter((b) => {
      const matchesSearch =
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.address.toLowerCase().includes(search.toLowerCase()) ||
        b.code.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || b.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [branches, search, statusFilter]);

  // Create Branch Handler
  const handleAddBranch = () => {
    if (!newBranch.name.trim() || !newBranch.address.trim()) {
      return toast.error("Please provide at least a name and address for the branch");
    }

    const created: Branch = {
      id: Date.now(),
      name: newBranch.name,
      code: newBranch.code.trim().toUpperCase() || `BR-${Math.floor(100 + Math.random() * 900)}`,
      address: newBranch.address,
      phone: newBranch.phone || "+92 51 111 000 000",
      beds: Number(newBranch.beds) || 50,
      doctors: Number(newBranch.doctors) || 10,
      patients: 0,
      status: newBranch.status,
      manager: newBranch.manager || "Dr. Unassigned Manager",
      emergencyPhone: newBranch.emergencyPhone || "+92 51 111 911 000",
    };

    setBranches((prev) => [created, ...prev]);
    setAddDialog(false);
    setNewBranch({
      name: "",
      code: "",
      address: "",
      phone: "",
      beds: 50,
      doctors: 10,
      status: "Active",
      manager: "",
      emergencyPhone: "",
    });
    toast.success(`Hospital Branch "${created.name}" created successfully!`);
  };

  // Save Config Handler
  const handleSaveConfig = () => {
    if (!configDialog) return;
    setBranches((prev) => prev.map((b) => (b.id === configDialog.id ? configDialog : b)));
    toast.success(`Branch "${configDialog.name}" configuration updated.`);
    setConfigDialog(null);
  };

  // Delete Branch Handler
  const handleDeleteBranch = () => {
    if (!deleteConfirm) return;
    setBranches((prev) => prev.filter((b) => b.id !== deleteConfirm.id));
    toast.success(`Branch "${deleteConfirm.name}" removed from system.`);
    setDeleteConfirm(null);
  };

  return (
    <AppShell role="super-admin" title="Super Admin" nav={superAdminNav}>
      {/* Top Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-7 w-7 text-primary" />
            Hospital Branch Management
          </h1>
          <p className="text-muted-foreground">Monitor multi-tenant hospital locations, emergency lines, capacity & staff rosters.</p>
        </div>
        <Button
          onClick={() => setAddDialog(true)}
          className="bg-gradient-primary text-primary-foreground shadow-glow self-start"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Location
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-gradient-card border border-border flex items-center gap-3 shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-bold">{branches.length}</div>
            <div className="text-xs text-muted-foreground uppercase font-semibold">Total Branches</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-card border border-border flex items-center gap-3 shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-bold">{branches.filter((b) => b.status === "Active").length}</div>
            <div className="text-xs text-muted-foreground uppercase font-semibold">Active Units</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-card border border-border flex items-center gap-3 shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-bold">{branches.reduce((acc, b) => acc + b.beds, 0)}</div>
            <div className="text-xs text-muted-foreground uppercase font-semibold">Total Bed Capacity</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-card border border-border flex items-center gap-3 shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center shrink-0">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-bold">{branches.reduce((acc, b) => acc + b.doctors, 0)}</div>
            <div className="text-xs text-muted-foreground uppercase font-semibold">Assigned Doctors</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 bg-secondary/20 p-3 rounded-2xl border border-border">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search branch by name, code or city..."
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-9 text-xs">
              <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Status Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="busy">Busy Only</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Hospital Branches Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredBranches.map((b, idx) => {
            const badgeColor =
              b.status === "Active"
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                : b.status === "Busy"
                ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                : b.status === "Maintenance"
                ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                : "bg-slate-500/10 text-slate-400 border-slate-500/20";

            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="bg-gradient-card border overflow-hidden h-full flex flex-col justify-between shadow-card hover:border-primary/40 transition-colors">
                  <div>
                    <CardHeader className="pb-3 border-b border-border/40">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-2">
                          <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <CardTitle className="text-base font-bold">{b.name}</CardTitle>
                              <Badge variant="outline" className="text-[9px] font-mono">{b.code}</Badge>
                            </div>
                            <CardDescription className="text-xs flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3" /> {b.address.split(",").slice(-2).join(",")}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className={badgeColor}>{b.status}</Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-4 space-y-4">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 rounded-xl bg-secondary/30">
                          <span className="block text-lg font-bold text-foreground">{b.beds}</span>
                          <span className="text-[10px] text-muted-foreground uppercase font-semibold">Beds</span>
                        </div>
                        <div className="p-2 rounded-xl bg-secondary/30">
                          <span className="block text-lg font-bold text-foreground">{b.doctors}</span>
                          <span className="text-[10px] text-muted-foreground uppercase font-semibold">Doctors</span>
                        </div>
                        <div className="p-2 rounded-xl bg-secondary/30">
                          <span className="block text-lg font-bold text-foreground">{b.patients}</span>
                          <span className="text-[10px] text-muted-foreground uppercase font-semibold">Patients</span>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs text-muted-foreground pt-1 border-t border-border/40">
                        <p className="flex items-center gap-2 truncate">
                          <MapPin className="h-3.5 w-3.5 text-primary shrink-0" /> {b.address}
                        </p>
                        <p className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-primary shrink-0" /> {b.phone}
                        </p>
                        <p className="flex items-center gap-2">
                          <UserCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Mgr: <strong className="text-foreground">{b.manager}</strong>
                        </p>
                      </div>
                    </CardContent>
                  </div>

                  <div className="p-3 bg-secondary/20 border-t border-border flex items-center justify-between gap-2">
                    <Button
                      onClick={() => setDeleteConfirm(b)}
                      size="sm"
                      variant="ghost"
                      className="text-xs h-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 p-2"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setConfigDialog({ ...b })}
                        size="sm"
                        variant="outline"
                        className="text-xs h-8"
                      >
                        <Settings className="h-3.5 w-3.5 mr-1" /> Config
                      </Button>
                      <Button
                        onClick={() => setStaffDialog(b)}
                        size="sm"
                        className="text-xs h-8 bg-gradient-primary text-white"
                      >
                        <Users className="h-3.5 w-3.5 mr-1" /> View Roster
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ADD LOCATION MODAL */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> Register New Hospital Branch
            </DialogTitle>
            <DialogDescription>Add a new hospital facility node into MediCore multi-tenant network.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="col-span-2">
              <Label>Hospital / Facility Name</Label>
              <Input
                value={newBranch.name}
                onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                placeholder="e.g. MediCore Multan Specialty Care"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Branch Code</Label>
              <Input
                value={newBranch.code}
                onChange={(e) => setNewBranch({ ...newBranch, code: e.target.value })}
                placeholder="e.g. MLT-06"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={newBranch.status}
                onValueChange={(val: any) => setNewBranch({ ...newBranch, status: val })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Busy">Busy</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label>Address Location</Label>
              <Input
                value={newBranch.address}
                onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })}
                placeholder="Full street address & city"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Main Contact Phone</Label>
              <Input
                value={newBranch.phone}
                onChange={(e) => setNewBranch({ ...newBranch, phone: e.target.value })}
                placeholder="+92 61 111 222 333"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Emergency Helpline</Label>
              <Input
                value={newBranch.emergencyPhone}
                onChange={(e) => setNewBranch({ ...newBranch, emergencyPhone: e.target.value })}
                placeholder="+92 61 111 911 000"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Total Beds Capacity</Label>
              <Input
                type="number"
                value={newBranch.beds}
                onChange={(e) => setNewBranch({ ...newBranch, beds: Number(e.target.value) })}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Doctor Allocation</Label>
              <Input
                type="number"
                value={newBranch.doctors}
                onChange={(e) => setNewBranch({ ...newBranch, doctors: Number(e.target.value) })}
                className="mt-1"
              />
            </div>

            <div className="col-span-2">
              <Label>Medical Superintendent / Manager</Label>
              <Input
                value={newBranch.manager}
                onChange={(e) => setNewBranch({ ...newBranch, manager: e.target.value })}
                placeholder="e.g. Dr. Shahzad Munir"
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddBranch} className="bg-gradient-primary text-white">Save & Activate Location</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CONFIG MODAL */}
      <Dialog open={!!configDialog} onOpenChange={() => setConfigDialog(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" /> Branch Configuration: {configDialog?.name}
            </DialogTitle>
            <DialogDescription>Modify capacity limits, status, contact channels and branch management.</DialogDescription>
          </DialogHeader>

          {configDialog && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="col-span-2">
                <Label>Facility Name</Label>
                <Input
                  value={configDialog.name}
                  onChange={(e) => setConfigDialog({ ...configDialog, name: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Operational Status</Label>
                <Select
                  value={configDialog.status}
                  onValueChange={(val: any) => setConfigDialog({ ...configDialog, status: val })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Busy">Busy</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Manager Name</Label>
                <Input
                  value={configDialog.manager}
                  onChange={(e) => setConfigDialog({ ...configDialog, manager: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div className="col-span-2">
                <Label>Street Address</Label>
                <Input
                  value={configDialog.address}
                  onChange={(e) => setConfigDialog({ ...configDialog, address: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Phone Line</Label>
                <Input
                  value={configDialog.phone}
                  onChange={(e) => setConfigDialog({ ...configDialog, phone: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Emergency Line</Label>
                <Input
                  value={configDialog.emergencyPhone}
                  onChange={(e) => setConfigDialog({ ...configDialog, emergencyPhone: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Beds Capacity</Label>
                <Input
                  type="number"
                  value={configDialog.beds}
                  onChange={(e) => setConfigDialog({ ...configDialog, beds: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Doctors Count</Label>
                <Input
                  type="number"
                  value={configDialog.doctors}
                  onChange={(e) => setConfigDialog({ ...configDialog, doctors: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setConfigDialog(null)}>Cancel</Button>
            <Button onClick={handleSaveConfig} className="bg-gradient-primary text-white">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* VIEW STAFF ROSTER MODAL */}
      <Dialog open={!!staffDialog} onOpenChange={() => setStaffDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Staff Roster — {staffDialog?.name}
            </DialogTitle>
            <DialogDescription>Assigned clinical personnel and doctors on shift</DialogDescription>
          </DialogHeader>

          {staffDialog && (
            <div className="space-y-3 pt-2">
              {(mockStaffPerBranch[staffDialog.id] || [
                { name: "Dr. Generic Staff", role: "Medical Officer", dept: "General", status: "On Duty" }
              ]).map((staff, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50">
                  <div>
                    <div className="font-bold text-sm text-foreground">{staff.name}</div>
                    <div className="text-xs text-muted-foreground">{staff.role} • {staff.dept}</div>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    {staff.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setStaffDialog(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRM MODAL */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-500">
              <AlertTriangle className="h-5 w-5" /> Confirm Location Deletion
            </DialogTitle>
            <DialogDescription>Are you sure you want to remove this hospital branch from the MediCore network?</DialogDescription>
          </DialogHeader>

          {deleteConfirm && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs space-y-1">
              <div>Facility Name: <strong>{deleteConfirm.name}</strong></div>
              <div>Branch Code: <strong className="font-mono">{deleteConfirm.code}</strong></div>
              <div>Location: {deleteConfirm.address}</div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button onClick={handleDeleteBranch} className="bg-rose-600 hover:bg-rose-700 text-white">Delete Location</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
