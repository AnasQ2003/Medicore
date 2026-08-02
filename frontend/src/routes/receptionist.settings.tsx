import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { receptionistNav } from "@/lib/roleNav";
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
  UserPlus, Clock, Mail, Phone, Calendar, Smartphone, Monitor, Palette, Receipt, CreditCard
} from "lucide-react";

export const Route = createFileRoute("/receptionist/settings")({
  head: () => ({ meta: [{ title: "Settings — Receptionist" }] }),
  component: ReceptionistSettingsScreen,
});

const SETTINGS_KEY = "medicore_receptionist_settings";

function ReceptionistSettingsScreen() {
  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return {
      displayName: "Receptionist Ali",
      defaultDepartment: "Front Desk",
      appointmentReminderLead: "24",
      timezone: "Asia/Karachi",
      language: "English",
      emailNotifications: true,
      pushNotifications: true,
      smsAlerts: true,
      appointmentConfirmations: true,
      billingAlerts: true,
      queueUpdates: true,
      darkMode: false,
      compactMode: false,
      reducedMotion: false,
      fontSize: "medium",
      accentColor: "default",
      twoFactorAuth: false,
      sessionLock: true,
      autoLogout: "20",
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
      toast.success("Settings saved successfully");
    }, 600);
  };

  const updateField = (k: string, v: any) => setSettings({ ...settings, [k]: v });

  return (
    <AppShell role="receptionist" title="Receptionist" nav={receptionistNav}>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="h-7 w-7 text-primary" />
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">Manage your account preferences, notifications, and display options.</p>
        </div>
        <Button onClick={handleSave} disabled={loading} className="bg-gradient-green text-white shadow-glow self-start">
          <Save className="h-4 w-4 mr-2" /> {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted/50 border p-1 rounded-xl">
          <TabsTrigger value="general" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <UserPlus className="h-4 w-4 mr-2" /> General
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

        <TabsContent value="general">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gradient-card border shadow-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-primary" /> Desk Preferences
                </CardTitle>
                <CardDescription>Front desk workflow settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input id="displayName" value={settings.displayName} onChange={(e) => updateField("displayName", e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="defaultDepartment">Default Department</Label>
                  <Select value={settings.defaultDepartment} onValueChange={(v) => updateField("defaultDepartment", v)}>
                    <SelectTrigger id="defaultDepartment" className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Front Desk">Front Desk</SelectItem>
                      <SelectItem value="OPD Registration">OPD Registration</SelectItem>
                      <SelectItem value="Billing Counter">Billing Counter</SelectItem>
                      <SelectItem value="Patient Admissions">Patient Admissions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="appointmentReminderLead">Appointment Reminder Lead Time (hours)</Label>
                  <Select value={settings.appointmentReminderLead} onValueChange={(v) => updateField("appointmentReminderLead", v)}>
                    <SelectTrigger id="appointmentReminderLead" className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hour before</SelectItem>
                      <SelectItem value="4">4 hours before</SelectItem>
                      <SelectItem value="12">12 hours before</SelectItem>
                      <SelectItem value="24">24 hours before</SelectItem>
                      <SelectItem value="48">48 hours before</SelectItem>
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
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={settings.timezone} onValueChange={(v) => updateField("timezone", v)}>
                    <SelectTrigger id="timezone" className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Karachi">Asia/Karachi (UTC+5)</SelectItem>
                      <SelectItem value="Asia/Dubai">Asia/Dubai (UTC+4)</SelectItem>
                      <SelectItem value="Europe/London">Europe/London (UTC+0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Display Language</Label>
                  <Select value={settings.language} onValueChange={(v) => updateField("language", v)}>
                    <SelectTrigger id="language" className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Urdu">Urdu</SelectItem>
                      <SelectItem value="Arabic">Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 mt-2">
                  <Calendar className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <span className="font-semibold text-xs block text-foreground">Operating Hours</span>
                    <span className="text-[10px] text-muted-foreground">Monday – Saturday, 08:00 – 20:00</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="notifications">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gradient-card border shadow-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Mail className="h-4 w-4 text-violet-500" /> Channels
                </CardTitle>
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
                    <Switch checked={settings[f.k]} onCheckedChange={(v) => updateField(f.k, v)} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border shadow-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-amber-500" /> Event Triggers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { k: "appointmentConfirmations", label: "New Appointment Bookings", desc: "When patients schedule visits" },
                  { k: "billingAlerts", label: "Billing & Payment Alerts", desc: "Invoice generation and payments" },
                  { k: "queueUpdates", label: "Waiting Queue Updates", desc: "Patient queue status changes" },
                ].map((f) => (
                  <div key={f.k} className="flex items-center justify-between">
                    <div>
                      <Label className="block font-semibold cursor-pointer">{f.label}</Label>
                      <span className="text-xs text-muted-foreground">{f.desc}</span>
                    </div>
                    <Switch checked={settings[f.k]} onCheckedChange={(v) => updateField(f.k, v)} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="appearance">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gradient-card border shadow-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-primary" /> Theme
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sun className="h-5 w-5 text-amber-600" />
                    <div>
                      <Label className="block font-semibold cursor-pointer">Light Mode</Label>
                      <span className="text-xs text-muted-foreground">Bright, clean interface</span>
                    </div>
                  </div>
                  <Switch checked={settings.darkMode} onCheckedChange={(v) => updateField("darkMode", v)} />
                  <Moon className="h-5 w-5 text-slate-500 ml-2" />
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <Label className="block font-semibold">Compact Layout</Label>
                    <span className="text-xs text-muted-foreground">Denser spacing for more content</span>
                  </div>
                  <Switch checked={settings.compactMode} onCheckedChange={(v) => updateField("compactMode", v)} />
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <Label className="block font-semibold">Reduced Motion</Label>
                    <span className="text-xs text-muted-foreground">Minimize animations</span>
                  </div>
                  <Switch checked={settings.reducedMotion} onCheckedChange={(v) => updateField("reducedMotion", v)} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border shadow-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="h-4 w-4 text-emerald-500" /> Accessibility
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="fontSize">Font Size</Label>
                  <Select value={settings.fontSize} onValueChange={(v) => updateField("fontSize", v)}>
                    <SelectTrigger id="fontSize" className="mt-1.5"><SelectValue /></SelectTrigger>
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
                    <SelectTrigger id="accentColor" className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default (Medical Green)</SelectItem>
                      <SelectItem value="teal">Teal</SelectItem>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="violet">Violet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 mt-2">
                  <Volume2 className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <span className="font-semibold text-xs block text-foreground">Sound Effects</span>
                    <span className="text-[10px] text-muted-foreground">Enabled for queue alerts</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="security">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gradient-card border shadow-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" /> Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="block font-semibold">Two-Factor Authentication</Label>
                    <span className="text-xs text-muted-foreground">Extra layer of security</span>
                  </div>
                  <Switch checked={settings.twoFactorAuth} onCheckedChange={(v) => updateField("twoFactorAuth", v)} />
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <Label className="block font-semibold">Session Lock on Idle</Label>
                    <span className="text-xs text-muted-foreground">Require password after inactivity</span>
                  </div>
                  <Switch checked={settings.sessionLock} onCheckedChange={(v) => updateField("sessionLock", v)} />
                </div>
                <div className="pt-2 border-t">
                  <Label htmlFor="autoLogout">Auto-Logout (minutes)</Label>
                  <Select value={settings.autoLogout} onValueChange={(v) => updateField("autoLogout", v)}>
                    <SelectTrigger id="autoLogout" className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="20">20 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
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
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="recoveryEmail">Recovery Email</Label>
                  <Input id="recoveryEmail" type="email" defaultValue="ali.recep@medicore.com" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="recoveryPhone">Recovery Phone</Label>
                  <Input id="recoveryPhone" type="tel" defaultValue="+92 300 5551234" className="mt-1.5" />
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 mt-2">
                  <Shield className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-semibold text-xs block text-emerald-800">Account Protected</span>
                    <span className="text-[10px] text-emerald-700">Last password change: 15 days ago</span>
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
