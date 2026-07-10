import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { superAdminNav } from "@/lib/roleNav";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Users, Plus, Search, Loader2, AlertCircle, Stethoscope, UserCheck, UserCog, ShieldCheck } from "lucide-react";
import { authAPI, patientAPI } from "@/lib/api/client";
import useApi from "@/hooks/useApi";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/super-admin/staff")({
  head: () => ({ meta: [{ title: "Staff — Super Admin" }] }),
  component: SuperAdminStaffScreen,
});

interface StaffMember { id: number; name: string; email: string; role: string; phone?: string; }

const roleConfig: Record<string, { icon: React.ElementType; color: string; badge: string }> = {
  doctor: { icon: Stethoscope, color: "from-blue-500 to-cyan-500", badge: "bg-blue-100 text-blue-700" },
  nurse: { icon: UserCheck, color: "from-rose-500 to-pink-500", badge: "bg-rose-100 text-rose-700" },
  receptionist: { icon: UserCog, color: "from-emerald-500 to-teal-500", badge: "bg-emerald-100 text-emerald-700" },
  "super-admin": { icon: ShieldCheck, color: "from-violet-500 to-purple-500", badge: "bg-violet-100 text-violet-700" },
  patient: { icon: Users, color: "from-slate-400 to-slate-500", badge: "bg-slate-100 text-slate-700" },
};

function SuperAdminStaffScreen() {
  // Fetch all users (staff) from patients API — in the backend this returns all registered users
  const { data: rawAll, loading, error, refetch } = useApi(() => patientAPI.getAll());
  const allUsers = (rawAll as unknown as StaffMember[]) ?? [];
  // Filter out patients — show staff only
  const staff = allUsers.filter((u) => u.role !== "patient");

  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "password123", role: "doctor", phone: "" });

  const filtered = staff.filter((s) => {
    const matchQ = s.name.toLowerCase().includes(q.toLowerCase()) || s.email.toLowerCase().includes(q.toLowerCase());
    const matchRole = roleFilter === "All" || s.role === roleFilter;
    return matchQ && matchRole;
  });

  const createStaff = async () => {
    if (!form.name || !form.email || !form.password || !form.role) return toast.error("All fields required");
    try {
      await authAPI.register({ name: form.name, email: form.email, password: form.password, role: form.role, phone: form.phone || undefined });
      toast.success(`${form.role} account created for ${form.name}`);
      setCreateOpen(false);
      setForm({ name: "", email: "", password: "password123", role: "doctor", phone: "" });
      refetch();
    } catch { toast.error("Failed to create staff account"); }
  };

  const roleCounts = staff.reduce<Record<string, number>>((acc, s) => {
    acc[s.role] = (acc[s.role] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <AppShell role="super-admin" title="Super Admin" nav={superAdminNav}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Directory</h1>
          <p className="text-muted-foreground">{staff.length} staff members registered</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="bg-gradient-primary text-white shadow-glow">
          <Plus className="h-4 w-4 mr-2" />Add Staff Member
        </Button>
      </div>

      {/* Role Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {["doctor", "nurse", "receptionist", "super-admin"].map((role, i) => {
          const cfg = roleConfig[role];
          const Icon = cfg?.icon ?? Users;
          return (
            <motion.div key={role} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`rounded-2xl bg-gradient-to-br ${cfg?.color} text-white p-5 shadow-elevated`}>
              <Icon className="h-6 w-6 mb-2 opacity-80" />
              <div className="text-3xl font-bold">{roleCounts[role] ?? 0}</div>
              <div className="text-sm opacity-90 mt-1 capitalize">{role === "super-admin" ? "Admins" : `${role}s`}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email…" className="pl-9" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Roles</SelectItem>
            <SelectItem value="doctor">Doctor</SelectItem>
            <SelectItem value="nurse">Nurse</SelectItem>
            <SelectItem value="receptionist">Receptionist</SelectItem>
            <SelectItem value="super-admin">Super Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading && <div className="flex items-center justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
      {error && (
        <div className="text-center py-16 text-destructive">
          <AlertCircle className="h-8 w-8 mx-auto mb-3" />
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s, i) => {
            const cfg = roleConfig[s.role] ?? roleConfig.patient;
            const Icon = cfg.icon;
            return (
              <motion.div key={s.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className="bg-gradient-card border rounded-2xl p-5 shadow-card hover:shadow-elevated transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${cfg.color} flex items-center justify-center text-white shadow-md`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate">{s.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{s.email}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge className={`text-[10px] capitalize ${cfg.badge}`}>{s.role}</Badge>
                  {s.phone && <span className="text-xs text-muted-foreground">{s.phone}</span>}
                </div>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              No staff found{q ? ` matching "${q}"` : ""}.
            </div>
          )}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" />Add Staff Member</DialogTitle>
            <DialogDescription>Create a new staff account in the system.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Full Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Dr. Sarah Khan" className="mt-1.5" /></div>
            <div><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="sarah.khan@medicore.com" className="mt-1.5" /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+92 300 0000000" className="mt-1.5" /></div>
            <div>
              <Label>Role *</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="nurse">Nurse</SelectItem>
                  <SelectItem value="receptionist">Receptionist</SelectItem>
                  <SelectItem value="super-admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Password *</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-1.5" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={createStaff} className="bg-gradient-primary text-white">Create Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
