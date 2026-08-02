import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { doctorNav } from "@/lib/roleNav";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getUser } from "@/lib/auth";
import {
  Settings, Save, BellRing, Eye, Moon, Sun, Volume2, Globe, Shield,
  Stethoscope, Clock, Mail, Phone, Calendar, Smartphone, Monitor, Palette,
  User, CheckCircle2, AlertCircle, Award, Sparkles, RefreshCw, FileSpreadsheet
} from "lucide-react";

export const Route = createFileRoute("/doctor/settings")({
  head: () => ({ meta: [{ title: "Settings — Doctor" }] }),
  component: DoctorSettingsScreen,
});

const SETTINGS_KEY = "medicore_doctor_settings";

function DoctorSettingsScreen() {
  const currentUser = getUser();
  const doctorName = currentUser?.name || "Dr. Sarah Khan";
  const doctorEmail = currentUser?.email || "sarah.khan@medicore.app";

  const [loading, setLoading] = useState(false);
  const [dutyStatus, setDutyStatus] = useState<"Available" | "In Consultation" | "On Leave">("Available");

  const [settings, setSettings] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return {
      displayName: doctorName,
      consultationDuration: "15",
      defaultVisitType: "Routine",
      timezone: "Asia/Karachi",
      language: "English",
      emailNotifications: true,
      pushNotifications: true,
      smsAlerts: false,
      appointmentReminders: true,
      newPatientAlerts: true,
      labResultAlerts: true,
      darkMode: false,
      compactMode: false,
      reducedMotion: false,
      fontSize: "medium",
      accentColor: "default",
      twoFactorAuth: true,
      sessionLock: true,
      autoLogout: "30",
      soundAlerts: true,
    };
  });

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      toast.success("Doctor Settings saved successfully", {
        description: "Your preferences & clinical parameters are active.",
      });
    }, 500);
  };

  const handleReset = () => {
    localStorage.removeItem(SETTINGS_KEY);
    toast.info("Settings reset to hospital defaults");
    window.location.reload();
  };

  const updateField = (k: string, v: any) => setSettings({ ...settings, [k]: v });

  return (
    <AppShell role="doctor" title="Doctor" nav={doctorNav}>
      {/* Header Banner & Clinical Duty Status Card */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2.5">
              <span className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Settings className="h-5 w-5" />
              </span>
              Clinical Settings & Preferences
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Configure your consultation parameters, notification alerts, and security protocols.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleReset} variant="outline" size="sm" className="text-xs">
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Reset Defaults
            </Button>
            <Button onClick={handleSave} disabled={loading} className="bg-gradient-primary text-white shadow-glow font-semibold">
              <Save className="h-4 w-4 mr-2 text-white" /> {loading ? "Saving Preferences..." : "Save Preferences"}
            </Button>
          </div>
        </div>

        {/* Doctor Identity & Status Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-card border border-border rounded-2xl p-5 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
                {doctorName.split(" ").pop()?.[0] || "D"}
              </div>
              <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-foreground">{doctorName}</h3>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                  PMC-89104-CARD
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{doctorEmail} • Senior Consultant Cardiologist</p>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                <Award className="h-3.5 w-3.5 text-amber-500" />
                <span>Department of Cardiology & EMR System Node #12</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-secondary/50 p-2.5 rounded-xl border border-border/60 self-stretch sm:self-auto justify-between">
            <div className="text-xs">
              <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Clinical Availability</span>
              <span className="font-semibold text-foreground">{dutyStatus}</span>
            </div>
            <div className="flex gap-1">
              {(["Available", "In Consultation", "On Leave"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setDutyStatus(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    dutyStatus === st
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted/50 border p-1 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-1">
          <TabsTrigger value="general" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Stethoscope className="h-4 w-4 mr-2 text-primary" /> Practice & EMR
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <BellRing className="h-4 w-4 mr-2 text-violet-500" /> Notifications & Alerts
          </TabsTrigger>
          <TabsTrigger value="appearance" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Palette className="h-4 w-4 mr-2 text-emerald-500" /> Interface & Display
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Shield className="h-4 w-4 mr-2 text-rose-500" /> Security & Privacy
          </TabsTrigger>
        </TabsList>

        {/* PRACTICE & EMR TAB */}
        <TabsContent value="general">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gradient-card border shadow-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-primary" /> OPD Consultation Defaults
                </CardTitle>
                <CardDescription>Configure default duration and appointment booking parameters.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="displayName" className="font-semibold text-xs">Public Doctor Name</Label>
                  <Input
                    id="displayName"
                    value={settings.displayName}
                    onChange={(e) => updateField("displayName", e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="consultationDuration" className="font-semibold text-xs">Default Consultation Slot Duration</Label>
                  <Select value={settings.consultationDuration} onValueChange={(v) => updateField("consultationDuration", v)}>
                    <SelectTrigger id="consultationDuration" className="mt-1.5">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 minutes (Quick Check)</SelectItem>
                      <SelectItem value="15">15 minutes (Standard OPD)</SelectItem>
                      <SelectItem value="20">20 minutes (Detailed Assessment)</SelectItem>
                      <SelectItem value="30">30 minutes (Comprehensive Consult)</SelectItem>
                      <SelectItem value="45">45 minutes (Specialist Review)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="defaultVisitType" className="font-semibold text-xs">Default Visit Classification</Label>
                  <Select value={settings.defaultVisitType} onValueChange={(v) => updateField("defaultVisitType", v)}>
                    <SelectTrigger id="defaultVisitType" className="mt-1.5">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Routine">Routine Check-up</SelectItem>
                      <SelectItem value="Follow-up">Follow-up Consultation</SelectItem>
                      <SelectItem value="Urgent">Urgent Assessment</SelectItem>
                      <SelectItem value="Diagnostic">Diagnostic Result Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border shadow-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4 text-emerald-500" /> Hospital Node & Regional Locale
                </CardTitle>
                <CardDescription>Timezone and locale configuration for electronic health records.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="timezone" className="font-semibold text-xs">Active Timezone</Label>
                  <Select value={settings.timezone} onValueChange={(v) => updateField("timezone", v)}>
                    <SelectTrigger id="timezone" className="mt-1.5">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Karachi">Asia/Karachi (PKT, UTC+5)</SelectItem>
                      <SelectItem value="Asia/Dubai">Asia/Dubai (GST, UTC+4)</SelectItem>
                      <SelectItem value="Europe/London">Europe/London (GMT, UTC+0)</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (EST, UTC-5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language" className="font-semibold text-xs">EMR Interface Language</Label>
                  <Select value={settings.language} onValueChange={(v) => updateField("language", v)}>
                    <SelectTrigger id="language" className="mt-1.5">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English (Primary)</SelectItem>
                      <SelectItem value="Urdu">Urdu (اردو)</SelectItem>
                      <SelectItem value="Arabic">Arabic (العربية)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/15 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <span className="font-bold text-xs block text-foreground">OPD Clinic Schedule</span>
                      <span className="text-[11px] text-muted-foreground">Mon–Fri, 08:30 AM – 04:30 PM (Wing A)</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* NOTIFICATIONS TAB */}
        <TabsContent value="notifications">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gradient-card border shadow-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Mail className="h-4 w-4 text-violet-500" /> Dispatch Channels
                </CardTitle>
                <CardDescription>Select preferred communication channels for clinical alerts.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { k: "emailNotifications", label: "Email Notifications & Summary Digests", desc: "Receive appointment summaries & security logs via email", icon: Mail },
                  { k: "pushNotifications", label: "Instant Web Push Alerts", desc: "Desktop notifications for patient arrivals and status updates", icon: BellRing },
                  { k: "smsAlerts", label: "Emergency SMS Alerts", desc: "Direct text messages for critical vitals and emergency consultations", icon: Smartphone },
                ].map((f) => (
                  <div key={f.k} className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/30 border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <f.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <Label className="block font-semibold text-xs cursor-pointer">{f.label}</Label>
                        <span className="text-[11px] text-muted-foreground">{f.desc}</span>
                      </div>
                    </div>
                    <Switch
                      checked={settings[f.k]}
                      onCheckedChange={(v) => updateField(f.k, v)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border shadow-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-amber-500" /> Clinical Event Triggers
                </CardTitle>
                <CardDescription>Control which patient events generate active notifications.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { k: "appointmentReminders", label: "Appointment Reminders", desc: "Alert 30 minutes before next consultation slot" },
                  { k: "newPatientAlerts", label: "New Patient Registrations", desc: "Notify when a new patient is queued for your clinic" },
                  { k: "labResultAlerts", label: "Critical Diagnostic Lab Reports", desc: "Immediate notification when abnormal lab values arrive" },
                ].map((f) => (
                  <div key={f.k} className="flex items-center justify-between p-3 rounded-xl bg-secondary/20">
                    <div>
                      <Label className="block font-semibold text-xs cursor-pointer">{f.label}</Label>
                      <span className="text-[11px] text-muted-foreground">{f.desc}</span>
                    </div>
                    <Switch
                      checked={settings[f.k]}
                      onCheckedChange={(v) => updateField(f.k, v)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* APPEARANCE TAB */}
        <TabsContent value="appearance">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gradient-card border shadow-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-primary" /> Visual Density & Theme
                </CardTitle>
                <CardDescription>Tailor the layout density and color schemes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <Sun className="h-5 w-5 text-amber-500" />
                    <div>
                      <Label className="block font-semibold text-xs cursor-pointer">Dark Theme Mode</Label>
                      <span className="text-[11px] text-muted-foreground">High-contrast dark clinical theme</span>
                    </div>
                  </div>
                  <Switch
                    checked={settings.darkMode}
                    onCheckedChange={(v) => updateField("darkMode", v)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                  <div>
                    <Label className="block font-semibold text-xs cursor-pointer">Compact Grid Layout</Label>
                    <span className="text-[11px] text-muted-foreground">Increases table row density for busy clinics</span>
                  </div>
                  <Switch
                    checked={settings.compactMode}
                    onCheckedChange={(v) => updateField("compactMode", v)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                  <div>
                    <Label className="block font-semibold text-xs cursor-pointer">Reduced UI Motion</Label>
                    <span className="text-[11px] text-muted-foreground">Disables complex dashboard animations</span>
                  </div>
                  <Switch
                    checked={settings.reducedMotion}
                    onCheckedChange={(v) => updateField("reducedMotion", v)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border shadow-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="h-4 w-4 text-emerald-500" /> EMR Typography & Audio
                </CardTitle>
                <CardDescription>Adjust text sizing and clinical audio alerts.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="fontSize" className="font-semibold text-xs">EMR Text Sizing</Label>
                  <Select value={settings.fontSize} onValueChange={(v) => updateField("fontSize", v)}>
                    <SelectTrigger id="fontSize" className="mt-1.5">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small (Dense View)</SelectItem>
                      <SelectItem value="medium">Medium (Standard Recommended)</SelectItem>
                      <SelectItem value="large">Large (High Legibility)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-3.5 rounded-xl bg-secondary/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Volume2 className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <span className="font-semibold text-xs block text-foreground">Critical Vitals Chime</span>
                      <span className="text-[11px] text-muted-foreground">Plays sound when abnormal vitals arrive</span>
                    </div>
                  </div>
                  <Switch
                    checked={settings.soundAlerts}
                    onCheckedChange={(v) => updateField("soundAlerts", v)}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* SECURITY TAB */}
        <TabsContent value="security">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gradient-card border shadow-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4 text-rose-500" /> Authentication & Session Governance
                </CardTitle>
                <CardDescription>HIPAA-compliant session auto-lock and multi-factor security.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-rose-50/60 border border-rose-200/60">
                  <div>
                    <Label className="block font-semibold text-xs text-rose-900 cursor-pointer">Two-Factor Authentication (2FA)</Label>
                    <span className="text-[11px] text-rose-700">Enforce OTP verification for remote logins</span>
                  </div>
                  <Switch
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(v) => updateField("twoFactorAuth", v)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                  <div>
                    <Label className="block font-semibold text-xs cursor-pointer">Auto Screen Lock on Inactivity</Label>
                    <span className="text-[11px] text-muted-foreground">Protect patient data when leaving station</span>
                  </div>
                  <Switch
                    checked={settings.sessionLock}
                    onCheckedChange={(v) => updateField("sessionLock", v)}
                  />
                </div>
                <div>
                  <Label htmlFor="autoLogout" className="font-semibold text-xs">Auto-Logout Session Timeout</Label>
                  <Select value={settings.autoLogout} onValueChange={(v) => updateField("autoLogout", v)}>
                    <SelectTrigger id="autoLogout" className="mt-1.5">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes (High Security)</SelectItem>
                      <SelectItem value="30">30 minutes (Standard Hospital Policy)</SelectItem>
                      <SelectItem value="60">60 minutes (1 Hour)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border shadow-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Account Security Status
                </CardTitle>
                <CardDescription>Cryptographic verification of your doctor account.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                  <Shield className="h-6 w-6 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-xs block text-emerald-900">Full Cryptographic Audit Compliance</span>
                    <span className="text-[11px] text-emerald-700">Digital signature & EMR audit logging verified active</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Account Role:</span>
                    <span className="font-semibold text-foreground uppercase">Doctor (Clinical)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Last Password Change:</span>
                    <span className="font-semibold text-foreground">14 days ago</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Last Login Verification:</span>
                    <span className="font-semibold text-emerald-600">Verified via Login Email Alert</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => toast.success("Security Audit Log exported to doctor_security_audit.pdf")}
                  className="w-full text-xs mt-2 border-border"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 mr-2" /> Export Security Audit Report
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
