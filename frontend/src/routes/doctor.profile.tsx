import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { doctorNav } from "@/lib/roleNav";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Stethoscope, Award, Users, Calendar, Mail, Phone, MapPin, Edit3, Save, GraduationCap, Briefcase, Clock } from "lucide-react";
import { useState } from "react";
import { getUser } from "@/lib/auth";

export const Route = createFileRoute("/doctor/profile")({
  head: () => ({ meta: [{ title: "My Profile — Doctor" }] }),
  component: ProfileScreen,
});

function ProfileScreen() {
  const user = getUser();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name ?? "Dr. Sarah Khan",
    email: user?.email ?? "sarah.khan@medicore.com",
    phone: "+92 300 1234567",
    specialty: "Cardiology",
    qualification: "MBBS, FCPS (Cardiology), Fellowship UK",
    experience: "12 years",
    license: "PMDC-22341",
    bio: "Consultant Cardiologist with special interest in interventional cardiology and preventive care. 1200+ procedures performed.",
    address: "MediCore Hospital, F-8 Markaz, Islamabad",
  });

  return (
    <AppShell role="doctor" title="Doctor" nav={doctorNav}>
      {/* Hero card */}
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
        className="relative overflow-hidden rounded-2xl bg-gradient-primary text-white p-6 md:p-8 mb-6 shadow-elevated">
        <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/20 blur-3xl"/>
        <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"/>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          <Avatar className="h-24 w-24 ring-4 ring-white/40 shadow-elevated">
            <AvatarFallback className="bg-white/20 text-white text-3xl font-bold">{form.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{form.name}</h1>
            <p className="text-white/90 mt-1">{form.specialty} • {form.experience}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge className="bg-white/20 text-white border border-white/30">{form.qualification.split(",")[0]}</Badge>
              <Badge className="bg-white/20 text-white border border-white/30">{form.license}</Badge>
            </div>
          </div>
          <Button onClick={()=>setEditing(v=>!v)} className="bg-white text-primary hover:bg-white/90">
            {editing ? <><Save className="h-4 w-4 mr-2"/>Save</> : <><Edit3 className="h-4 w-4 mr-2"/>Edit Profile</>}
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Patients", value: "248", icon: Users, c: "from-blue-500 to-cyan-500" },
          { label: "Procedures", value: "1,240", icon: Award, c: "from-rose-500 to-pink-600" },
          { label: "Appointments", value: "3.6k", icon: Calendar, c: "from-emerald-500 to-teal-500" },
          { label: "Years exp.", value: "12", icon: Briefcase, c: "from-violet-500 to-purple-600" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}
            whileHover={{y:-4}}
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
        <div className="bg-gradient-card border rounded-2xl p-6 shadow-card space-y-4">
          <h3 className="font-semibold text-lg">Personal Information</h3>
          {[
            { k: "name", l: "Full name", icon: Stethoscope },
            { k: "email", l: "Email", icon: Mail },
            { k: "phone", l: "Phone", icon: Phone },
            { k: "address", l: "Address", icon: MapPin },
          ].map(f => (
            <div key={f.k}>
              <Label>{f.l}</Label>
              <div className="relative mt-1.5">
                <f.icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                <Input
                  value={form[f.k as keyof typeof form]}
                  onChange={e => setForm({...form, [f.k]: e.target.value})}
                  disabled={!editing}
                  className="pl-9"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-card border rounded-2xl p-6 shadow-card space-y-4">
          <h3 className="font-semibold text-lg">Professional Details</h3>
          {[
            { k: "specialty", l: "Specialty", icon: Stethoscope },
            { k: "qualification", l: "Qualifications", icon: GraduationCap },
            { k: "experience", l: "Experience", icon: Briefcase },
            { k: "license", l: "License #", icon: Award },
          ].map(f => (
            <div key={f.k}>
              <Label>{f.l}</Label>
              <div className="relative mt-1.5">
                <f.icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                <Input
                  value={form[f.k as keyof typeof form]}
                  onChange={e => setForm({...form, [f.k]: e.target.value})}
                  disabled={!editing}
                  className="pl-9"
                />
              </div>
            </div>
          ))}
          <div>
            <Label>Bio</Label>
            <textarea
              value={form.bio}
              onChange={e => setForm({...form, bio: e.target.value})}
              disabled={!editing}
              rows={4}
              className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2 text-sm disabled:opacity-70"
            />
          </div>
        </div>
      </div>

      {/* Weekly availability */}
      <div className="mt-6 bg-gradient-card border rounded-2xl p-6 shadow-card">
        <h3 className="font-semibold text-lg flex items-center gap-2 mb-4"><Clock className="h-5 w-5 text-primary"/>Weekly Availability</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d, i) => {
            const off = d === "Sun";
            return (
              <motion.div key={d} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
                className={`rounded-xl p-4 border ${off ? "bg-muted text-muted-foreground" : "bg-white"} `}>
                <div className="font-bold">{d}</div>
                <div className="text-xs mt-1">{off ? "Off" : "09:00 – 17:00"}</div>
                {!off && <Badge className="mt-2 bg-emerald-100 text-emerald-700 text-[10px]">Available</Badge>}
              </motion.div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
