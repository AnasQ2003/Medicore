import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { superAdminNav } from "@/lib/roleNav";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ShieldCheck, Award, Users, Calendar, Mail, Phone, MapPin,
  Edit3, Save, Briefcase, Clock, X, Camera, Server, Activity, Key
} from "lucide-react";
import { useState, useEffect } from "react";
import { getUser, saveUser } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/super-admin/profile")({
  head: () => ({ meta: [{ title: "My Profile — Super Admin" }] }),
  component: SuperAdminProfileScreen,
});

const PROFILE_KEY = "medicore_superadmin_profile";

function SuperAdminProfileScreen() {
  const user = getUser();
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(PROFILE_KEY);
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return {
      name: user?.name ?? "System Administrator",
      email: user?.email ?? "admin@medicore.com",
      phone: "+92 300 9998877",
      title: "Chief Technology Officer & System Director",
      department: "Enterprise Health IT & Operations",
      clearance: "Level 5 — Full Access",
      adminCode: "ADM-9001-HQ",
      bio: "Overseeing MediCore multi-branch infrastructure, data security compliance, and system-wide medical EMR integrations.",
      address: "MediCore HQ, Executive Tower, Islamabad",
    };
  });

  const [draft, setDraft] = useState({ ...form });

  useEffect(() => {
    setDraft({ ...form });
  }, [form]);

  const startEditing = () => {
    setDraft({ ...form });
    setEditing(true);
  };

  const cancelEditing = () => {
    setDraft({ ...form });
    setEditing(false);
  };

  const saveProfile = () => {
    if (!draft.name.trim()) return toast.error("Name cannot be empty");
    if (!draft.email.trim()) return toast.error("Email cannot be empty");

    localStorage.setItem(PROFILE_KEY, JSON.stringify(draft));
    setForm({ ...draft });

    if (user) {
      saveUser({ ...user, name: draft.name, email: draft.email });
    }

    setEditing(false);
    toast.success("Super Admin profile updated successfully!", {
      description: "Changes saved to system configuration.",
    });
  };

  const displayForm = editing ? draft : form;
  const setDraftField = (k: string, v: string) => setDraft({ ...draft, [k]: v });

  return (
    <AppShell role="super-admin" title="Super Admin" nav={superAdminNav}>
      {/* Hero card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-violet text-white p-6 md:p-8 mb-6 shadow-elevated">
        <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/20 blur-3xl"/>
        <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"/>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          <div className="relative group">
            <Avatar className="h-24 w-24 ring-4 ring-white/40 shadow-elevated">
              <AvatarFallback className="bg-white/20 text-white text-3xl font-bold">
                {displayForm.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            {editing && (
              <button className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-white/90 text-primary flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                <Camera className="h-3.5 w-3.5"/>
              </button>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold">{displayForm.name}</h1>
            <p className="text-white/90 mt-1">{displayForm.title} • {displayForm.department}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge className="bg-white/20 text-white border border-white/30">{displayForm.adminCode}</Badge>
              <Badge className="bg-emerald-400/90 text-emerald-950 font-bold border-0">{displayForm.clearance}</Badge>
              {editing && <Badge className="bg-amber-400/80 text-white border-0 animate-pulse">Editing…</Badge>}
            </div>
          </div>

          <div className="flex gap-2">
            {editing ? (
              <>
                <Button onClick={cancelEditing} className="bg-white/20 text-white hover:bg-white/30 border border-white/30">
                  <X className="h-4 w-4 mr-2"/>Cancel
                </Button>
                <Button onClick={saveProfile} className="bg-white text-primary hover:bg-white/90 font-semibold">
                  <Save className="h-4 w-4 mr-2"/>Save Profile
                </Button>
              </>
            ) : (
              <Button onClick={startEditing} className="bg-white text-primary hover:bg-white/90 font-semibold">
                <Edit3 className="h-4 w-4 mr-2"/>Edit Profile
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Branches Controlled", value: "5", icon: Server, c: "from-purple-500 to-indigo-600" },
          { label: "Staff Managed", value: "142", icon: Users, c: "from-blue-500 to-cyan-500" },
          { label: "Audit Logs", value: "100%", icon: ShieldCheck, c: "from-emerald-500 to-teal-500" },
          { label: "Uptime Score", value: "99.99%", icon: Activity, c: "from-rose-500 to-pink-600" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4 }}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${s.c} text-white p-5 shadow-elevated`}>
            <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-white/20 blur-2xl"/>
            <s.icon className="h-5 w-5 opacity-80"/>
            <div className="text-3xl font-bold mt-3">{s.value}</div>
            <div className="text-xs uppercase tracking-wider opacity-90 mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Editable form */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Personal info */}
        <div className="bg-gradient-card border rounded-2xl p-6 shadow-card space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            Personal & Contact Information
            {editing && <Badge className="bg-primary/10 text-primary text-xs">Editable</Badge>}
          </h3>
          {[
            { k: "name", l: "Full Name", icon: ShieldCheck },
            { k: "email", l: "Email Address", icon: Mail },
            { k: "phone", l: "Phone Number", icon: Phone },
            { k: "address", l: "HQ Office Address", icon: MapPin },
          ].map(f => (
            <div key={f.k}>
              <Label className="text-sm font-medium">{f.l}</Label>
              <div className="relative mt-1.5">
                <f.icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                <Input
                  value={displayForm[f.k]}
                  onChange={e => setDraftField(f.k, e.target.value)}
                  disabled={!editing}
                  className={`pl-9 transition-all ${editing ? "border-primary/50 bg-primary/5 focus:border-primary" : "bg-muted/30"}`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* System credentials */}
        <div className="bg-gradient-card border rounded-2xl p-6 shadow-card space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            Executive System Credentials
            {editing && <Badge className="bg-primary/10 text-primary text-xs">Editable</Badge>}
          </h3>
          {[
            { k: "title", l: "Official Designation", icon: Briefcase },
            { k: "department", l: "Department", icon: Server },
            { k: "clearance", l: "Security Clearance Level", icon: Key },
            { k: "adminCode", l: "Admin ID Tag", icon: Award },
          ].map(f => (
            <div key={f.k}>
              <Label className="text-sm font-medium">{f.l}</Label>
              <div className="relative mt-1.5">
                <f.icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                <Input
                  value={displayForm[f.k]}
                  onChange={e => setDraftField(f.k, e.target.value)}
                  disabled={!editing}
                  className={`pl-9 transition-all ${editing ? "border-primary/50 bg-primary/5 focus:border-primary" : "bg-muted/30"}`}
                />
              </div>
            </div>
          ))}
          <div>
            <Label className="text-sm font-medium">Executive Overview & Mandate</Label>
            <textarea
              value={displayForm.bio}
              onChange={e => setDraftField("bio", e.target.value)}
              disabled={!editing}
              rows={4}
              className={`mt-1.5 w-full rounded-lg border px-3 py-2 text-sm transition-all ${
                editing
                  ? "border-primary/50 bg-primary/5 focus:outline-none focus:border-primary"
                  : "bg-muted/30 opacity-70"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Floating save bar while editing */}
      {editing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-white border shadow-elevated rounded-2xl px-6 py-3"
        >
          <span className="text-sm font-medium text-muted-foreground">Unsaved profile edits</span>
          <Button size="sm" variant="ghost" onClick={cancelEditing}>Cancel</Button>
          <Button size="sm" onClick={saveProfile} className="bg-gradient-primary text-white font-semibold">
            <Save className="h-3.5 w-3.5 mr-1.5"/>Save Profile
          </Button>
        </motion.div>
      )}
    </AppShell>
  );
}
