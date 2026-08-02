import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { patientNav } from "@/lib/roleNav";
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
  User, Clock, Mail, Phone, Calendar, Smartphone, Monitor, Palette, Download, CreditCard, FileText
} from "lucide-react";

export const Route = createFileRoute("/patient/settings")({
  head: () => ({ meta: [{ title: "Settings — Patient" }] }),
  component: PatientSettingsScreen,
});

const SETTINGS_KEY = "medicore_patient_settings";

function PatientSettingsScreen() {
  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return {
      displayName: "John Doe",
      preferredDoctor: "Dr. Sarah Khan",
      preferredContactMethod: "email",
      timezone: "Asia/Karachi",
      language: "English",
      emailNotifications: true,
      pushNotifications: false,
      smsAlerts: true,
      appointmentReminders: true,
      labResultReady: true,
      billReadyAlerts: true,
      darkMode: false,
      compactMode: false,
      reducedMotion: false,
      fontSize: "medium",
      accentColor: "default",
      twoFactorAuth: true,
      sessionLock: false,
      autoLogout: "60",
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
    <AppShell role="patient" title="Patient" nav={patientNav}>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="h-7 w-7 text-primary" />
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">Manage your personal preferences, notification settings, and privacy options.</p>
        </div>
        <Button onClick={handleSave} disabled={loading} className="bg-gradient-sunset text-white shadow-glow self-start">
          <Save className="h-4 w-4 mr-2" /> {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted/50 border p-1 rounded-xl">
          <TabsTrigger value="general" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <User className="h-4 w-4 mr-2" /> Personal
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <BellRing className="h-4 w-4 mr-2" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Palette className="h-4 w-4 mr-2" /> Appearance
          </TabsTrigger>
          <TabsTrigger value="privacy" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Shield className="h-4 w-4 mr-2" /> Privacy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gradient-card border shadow-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" /> Personal Preferences
                </CardTitle>
                <CardDescription>Customize your patient portal experience.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input id="displayName" value={settings.displayName} onChange={(e) => updateField("displayName", e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="preferredDoctor">Preferred Doctor</Label>
                  <Select value={settings.preferredDoctor} onValueChange={(v) => updateField("preferredDoctor", v)}>
                    <SelectTrigger id="preferredDoctor" className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dr. Sarah Khan">Dr. Sarah Khan — Cardiology</SelectItem>
                      <SelectItem value="Dr. Ahmed Raza">Dr. Ahmed Raza — General Medicine</SelectItem>
                      <SelectItem value="Dr. Fatima Noor">Dr. Fatima Noor — Pediatrics</SelectItem>
                      <SelectItem value="Dr. Hassan Ali">Dr. Hassan Ali — Orthopedics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="preferredContactMethod">Preferred Contact Method</Label>
                  <Select value={settings.preferredContactMethod} onValueChange={(v) => updateField("preferredContactMethod", v)}>
                    <SelectTrigger id="preferredContactMethod" className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS / Text Message</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="call">Phone Call</SelectItem>
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
                      <SelectItem value="America/New_York">America/New_York (UTC-5)</SelectItem>
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
                      <SelectItem value="Spanish">Spanish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 mt-2">
                  <Calendar className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <span className="font-semibold text-xs block text-foreground">Next Appointment</span>
                    <span className="text-[10px] text-muted-foreground">August 5, 2026 • 10:00 AM — Dr. Sarah Khan</span>
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
                  <Mail className="h-4 w-4 text-violet-500" /> Notification Channels
                </CardTitle>
                <CardDescription>How you'd like to receive updates.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { k: "emailNotifications", label: "Email Notifications", desc: "Updates delivered to your inbox", icon: Mail },
                  { k: "pushNotifications", label: "Push Notifications", desc: "Browser & mobile app alerts", icon: BellRing },
                  { k: "smsAlerts", label: "SMS Text Alerts", desc: "Text messages to your phone", icon: Smartphone },
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
                  <FileText className="h-4 w-4 text-amber-500" /> What to Notify You About
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { k: "appointmentReminders", label: "Appointment Reminders", desc: "Reminders before your scheduled visits" },
                  { k: "labResultReady", label: "Lab Results Ready", desc: "When test results are available to view" },
                  { k: "billReadyAlerts", label: "New Bills & Invoices", desc: "When new billing statements are ready" },
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
                  <Monitor className="h-4 w-4 text-primary" /> Theme Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sun className="h-5 w-5 text-amber-600" />
                    <div>
                      <Label className="block font-semibold cursor-pointer">Light Mode</Label>
                      <span className="text-xs text-muted-foreground">Easy on the eyes</span>
                    </div>
                  </div>
                  <Switch checked={settings.darkMode} onCheckedChange={(v) => updateField("darkMode", v)} />
                  <Moon className="h-5 w-5 text-slate-500 ml-2" />
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <Label className="block font-semibold">Comfortable Spacing</Label>
                    <span className="text-xs text-muted-foreground">Larger touch targets</span>
                  </div>
                  <Switch checked={!settings.compactMode} onCheckedChange={(v) => updateField("compactMode", !v)} />
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <Label className="block font-semibold">Smooth Animations</Label>
                    <span className="text-xs text-muted-foreground">Nice transition effects</span>
                  </div>
                  <Switch checked={!settings.reducedMotion} onCheckedChange={(v) => updateField("reducedMotion", !v)} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border shadow-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="h-4 w-4 text-emerald-500" /> Accessibility Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="fontSize">Text Size</Label>
                  <Select value={settings.fontSize} onValueChange={(v) => updateField("fontSize", v)}>
                    <SelectTrigger id="fontSize" className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Smaller Text</SelectItem>
                      <SelectItem value="medium">Default Size</SelectItem>
                      <SelectItem value="large">Larger Text</SelectItem>
                      <SelectItem value="xlarge">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="accentColor">Theme Color</Label>
                  <Select value={settings.accentColor} onValueChange={(v) => updateField("accentColor", v)}>
                    <SelectTrigger id="accentColor" className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default (Sunset Orange)</SelectItem>
                      <SelectItem value="blue">Calming Blue</SelectItem>
                      <SelectItem value="emerald">Fresh Green</SelectItem>
                      <SelectItem value="violet">Soft Violet</SelectItem>
                      <SelectItem value="rose">Gentle Rose</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 mt-2">
                  <Volume2 className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <span className="font-semibold text-xs block text-foreground">Sound Effects</span>
                    <span className="text-[10px] text-muted-foreground">Soft tones for friendly reminders</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="privacy">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gradient-card border shadow-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" /> Account Security
                </CardTitle>
                <CardDescription>Keep your health data safe.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="block font-semibold">Two-Factor Authentication</Label>
                    <span className="text-xs text-muted-foreground">Recommended for medical data</span>
                  </div>
                  <Switch checked={settings.twoFactorAuth} onCheckedChange={(v) => updateField("twoFactorAuth", v)} />
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <Label className="block font-semibold">Auto-Lock on Idle</Label>
                    <span className="text-xs text-muted-foreground">Protect your data when AFK</span>
                  </div>
                  <Switch checked={settings.sessionLock} onCheckedChange={(v) => updateField("sessionLock", v)} />
                </div>
                <div className="pt-2 border-t">
                  <Label htmlFor="autoLogout">Sign me out after (minutes)</Label>
                  <Select value={settings.autoLogout} onValueChange={(v) => updateField("autoLogout", v)}>
                    <SelectTrigger id="autoLogout" className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border shadow-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Download className="h-4 w-4 text-violet-500" /> Data & Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" /> Download My Health Records
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" /> View Data Usage Policy
                </Button>
                <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
                  <CreditCard className="h-4 w-4 mr-2" /> Manage Payment Methods
                </Button>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 mt-2">
                  <Shield className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-semibold text-xs block text-emerald-800">HIPAA Compliant</span>
                    <span className="text-[10px] text-emerald-700">Your data is encrypted and protected</span>
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
