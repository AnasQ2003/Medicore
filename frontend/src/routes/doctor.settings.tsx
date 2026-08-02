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
import { toast } from "sonner";
import {
  Settings, Save, BellRing, Eye, Moon, Sun, Volume2, Globe, Shield,
  Stethoscope, Clock, Mail, Phone, Calendar, Smartphone, Monitor, Palette
} from "lucide-react";

export const Route = createFileRoute("/doctor/settings")({
  head: () => ({ meta: [{ title: "Settings — Doctor" }] }),
  component: DoctorSettingsScreen,
});

const SETTINGS_KEY = "medicore_doctor_settings";

function DoctorSettingsScreen() {
  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return {
      displayName: "Dr. Sarah Khan",
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
      twoFactorAuth: false,
      sessionLock: true,
      autoLogout: "30",
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
      toast.success("Settings saved successfully", {
        description: "Your preferences have been updated.",
      });
    }, 600);
  };

  const updateField = (k: string, v: any) => setSettings({ ...settings, [k]: v });

  return (
    <AppShell role="doctor" title="Doctor" nav={doctorNav}>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="h-7 w-7 text-primary" />
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">Manage your account preferences, notifications, and display options.</p>
        </div>
        <Button onClick={handleSave} disabled={loading} className="bg-gradient-primary text-primary-foreground shadow-glow self-start">
          <Save className="h-4 w-4 mr-2" /> {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted/50 border p-1 rounded-xl">
          <TabsTrigger value="general" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Stethoscope className="h-4 w-4 mr-2" /> General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <BellRing className="h-4 w-4 mr-2" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Palette className="h-4 w-4 mr-2" /> Appearance
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Shield className="h-4 w-4 mr-2" /> Security
          </TabsTrigger>
        </TabsList>

        {/* GENERAL TAB */}
        <TabsContent value="general">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gradient-card border shadow-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-primary" /> Practice Preferences
                </CardTitle>
                <CardDescription>Defaults for your daily workflow.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={settings.displayName}
                    onChange={(e) => updateField("displayName", e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="consultationDuration">Default Consultation Duration (minutes)</Label>
                  <Select value={settings.consultationDuration} onValueChange={(v) => updateField("consultationDuration", v)}>
                    <SelectTrigger id="consultationDuration" className="mt-1.5">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="20">20 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="defaultVisitType">Default Visit Type</Label>
                  <Select value={settings.defaultVisitType} onValueChange={(v) => updateField("defaultVisitType", v)}>
                    <SelectTrigger id="defaultVisitType" className="mt-1.5">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Routine">Routine Check-up</SelectItem>
                      <SelectItem value="Follow-up">Follow-up Visit</SelectItem>
                      <SelectItem value="Consultation">New Consultation</SelectItem>
                      <SelectItem value="Urgent">Urgent Visit</SelectItem>
                      <SelectItem value="Diagnostic">Diagnostic Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border shadow-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4 text-emerald-500" /> Regional Settings
                </CardTitle>
                <CardDescription>Timezone and language preferences.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={settings.timezone} onValueChange={(v) => updateField("timezone", v)}>
                    <SelectTrigger id="timezone" className="mt-1.5">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Karachi">Asia/Karachi (UTC+5)</SelectItem>
                      <SelectItem value="Asia/Dubai">Asia/Dubai (UTC+4)</SelectItem>
                      <SelectItem value="Europe/London">Europe/London (UTC+0)</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (UTC-5)</SelectItem>
                      <SelectItem value="America/Los_Angeles">America/Los_Angeles (UTC-8)</SelectItem>
                      <SelectItem value="Asia/Singapore">Asia/Singapore (UTC+8)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Display Language</Label>
                  <Select value={settings.language} onValueChange={(v) => updateField("language", v)}>
                    <SelectTrigger id="language" className="mt-1.5">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Urdu">Urdu</SelectItem>
                      <SelectItem value="Arabic">Arabic</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 mt-2">
                  <Clock className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <span className="font-semibold text-xs block text-foreground">Clinic Hours</span>
                    <span className="text-[10px] text-muted-foreground">Monday – Friday, 09:00 – 17:00</span>
                  </div>
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
                  <Mail className="h-4 w-4 text-violet-500" /> Channels
                </CardTitle>
                <CardDescription>How you'd like to be contacted.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { k: "emailNotifications", label: "Email Notifications", desc: "Receive updates via email", icon: Mail },
                  { k: "pushNotifications", label: "Push Notifications", desc: "Browser & app push alerts", icon: BellRing },
                  { k: "smsAlerts", label: "SMS Alerts", desc: "Text messages for urgent updates", icon: Smartphone },
                ].map((f) => (
                  <div key={f.k} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                    <div className="flex items-center gap-3">
                      <f.icon className="h-4 w-4 text-primary" />
                      <div>
                        <Label className="block font-semibold cursor-pointer">{f.label}</Label>
                        <span className="text-xs text-muted-foreground">{f.desc}</span>
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
                  <Calendar className="h-4 w-4 text-amber-500" /> Event Triggers
                </CardTitle>
                <CardDescription>Which events should notify you.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { k: "appointmentReminders", label: "Appointment Reminders", desc: "24h before scheduled visits" },
                  { k: "newPatientAlerts", label: "New Patient Assignments", desc: "When you get a new patient" },
                  { k: "labResultAlerts", label: "Lab Result Notifications", desc: "New lab reports ready for review" },
                ].map((f) => (
                  <div key={f.k} className="flex items-center justify-between">
                    <div>
                      <Label className="block font-semibold cursor-pointer">{f.label}</Label>
                      <span className="text-xs text-muted-foreground">{f.desc}</span>
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
                  <Monitor className="h-4 w-4 text-primary" /> Theme
                </CardTitle>
                <CardDescription>Visual settings for the dashboard.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-100 to-amber-200">
                      <Sun className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <Label className="block font-semibold cursor-pointer">Light Mode</Label>
                      <span className="text-xs text-muted-foreground">Bright, clean interface</span>
                    </div>
                  </div>
                  <Switch
                    checked={settings.darkMode}
                    onCheckedChange={(v) => updateField("darkMode", v)}
                  />
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 ml-2">
                    <Moon className="h-5 w-5 text-slate-200" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <Label className="block font-semibold">Compact Layout</Label>
                    <span className="text-xs text-muted-foreground">Denser spacing for more content</span>
                  </div>
                  <Switch
                    checked={settings.compactMode}
                    onCheckedChange={(v) => updateField("compactMode", v)}
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <Label className="block font-semibold">Reduced Motion</Label>
                    <span className="text-xs text-muted-foreground">Minimize animations</span>
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
                  <Eye className="h-4 w-4 text-emerald-500" /> Accessibility
                </CardTitle>
                <CardDescription>Text size and color adjustments.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="fontSize">Font Size</Label>
                  <Select value={settings.fontSize} onValueChange={(v) => updateField("fontSize", v)}>
                    <SelectTrigger id="fontSize" className="mt-1.5">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium (Default)</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="xlarge">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="accentColor">Accent Color Palette</Label>
                  <Select value={settings.accentColor} onValueChange={(v) => updateField("accentColor", v)}>
                    <SelectTrigger id="accentColor" className="mt-1.5">
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default (Medical Blue)</SelectItem>
                      <SelectItem value="teal">Teal</SelectItem>
                      <SelectItem value="emerald">Emerald</SelectItem>
                      <SelectItem value="violet">Violet</SelectItem>
                      <SelectItem value="rose">Rose</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 mt-2">
                  <Volume2 className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <span className="font-semibold text-xs block text-foreground">Sound Effects</span>
                    <span className="text-[10px] text-muted-foreground">Enabled for critical alerts</span>
                  </div>
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
                  <Shield className="h-4 w-4 text-primary" /> Authentication
                </CardTitle>
                <CardDescription>Protect your account access.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="block font-semibold">Two-Factor Authentication</Label>
                    <span className="text-xs text-muted-foreground">Extra layer of security</span>
                  </div>
                  <Switch
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(v) => updateField("twoFactorAuth", v)}
                  />
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <Label className="block font-semibold">Session Lock on Idle</Label>
                    <span className="text-xs text-muted-foreground">Require password after inactivity</span>
                  </div>
                  <Switch
                    checked={settings.sessionLock}
                    onCheckedChange={(v) => updateField("sessionLock", v)}
                  />
                </div>
                <div className="pt-2 border-t">
                  <Label htmlFor="autoLogout">Auto-Logout (minutes)</Label>
                  <Select value={settings.autoLogout} onValueChange={(v) => updateField("autoLogout", v)}>
                    <SelectTrigger id="autoLogout" className="mt-1.5">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="120">Never (2 hours)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border shadow-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Phone className="h-4 w-4 text-violet-500" /> Contact Information
                </CardTitle>
                <CardDescription>Verify your recovery contact details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="recoveryEmail">Recovery Email</Label>
                  <Input
                    id="recoveryEmail"
                    type="email"
                    defaultValue="sarah.khan@medicore.com"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="recoveryPhone">Recovery Phone</Label>
                  <Input
                    id="recoveryPhone"
                    type="tel"
                    defaultValue="+92 300 1234567"
                    className="mt-1.5"
                  />
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 mt-2">
                  <Shield className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-semibold text-xs block text-emerald-800">Account Protected</span>
                    <span className="text-[10px] text-emerald-700">Last password change: 12 days ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
