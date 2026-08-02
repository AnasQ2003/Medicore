import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { superAdminNav } from "@/lib/roleNav";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Settings, Save, Shield, Database, Radio, BellRing, Lock, Key,
  Server, RefreshCw, Layers, CheckCircle2, RotateCcw, AlertTriangle
} from "lucide-react";

export const Route = createFileRoute("/super-admin/settings")({
  head: () => ({ meta: [{ title: "System Settings — Super Admin" }] }),
  component: SuperAdminSettingsScreen,
});

const SETTINGS_KEY = "medicore_superadmin_settings";

function SuperAdminSettingsScreen() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"platform" | "security" | "database" | "gateways">("platform");

  const [config, setConfig] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return {
      systemName: "MediCore HMS Pro Enterprise",
      supportEmail: "sysadmin@medicore.hms",
      sessionTimeout: "30",
      allowRegistration: true,
      maintenanceMode: false,
      auditLogging: true,
      telemetry: true,
      require2FA: true,
      autoBackups: true,
      backupFrequency: "Daily at 02:00 AM",
      maxLoginAttempts: "5",
      ipWhitelist: "192.168.1.0/24, 10.0.0.0/16",
      emailAlerts: true,
      smsGateway: true,
    };
  });

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(config));
      setLoading(false);
      toast.success("System configurations saved successfully", {
        description: "All branch nodes synced with updated security flags.",
      });
    }, 600);
  };

  const handleReset = () => {
    const defaults = {
      systemName: "MediCore HMS Pro Enterprise",
      supportEmail: "sysadmin@medicore.hms",
      sessionTimeout: "30",
      allowRegistration: true,
      maintenanceMode: false,
      auditLogging: true,
      telemetry: true,
      require2FA: true,
      autoBackups: true,
      backupFrequency: "Daily at 02:00 AM",
      maxLoginAttempts: "5",
      ipWhitelist: "192.168.1.0/24, 10.0.0.0/16",
      emailAlerts: true,
      smsGateway: true,
    };
    setConfig(defaults);
    localStorage.removeItem(SETTINGS_KEY);
    toast.info("System settings restored to defaults");
  };

  return (
    <AppShell role="super-admin" title="Super Admin" nav={superAdminNav}>
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-violet text-white p-6 md:p-8 mb-6 shadow-elevated"
      >
        <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-white/20 text-white border border-white/30">System Control Panel</Badge>
              <Badge className="bg-emerald-400/90 text-emerald-950 font-bold border-0 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> All Node Nodes Active
              </Badge>
            </div>
            <h1 className="text-3xl font-bold">System & Platform Configurations</h1>
            <p className="text-white/90 text-sm mt-1">Manage global enterprise policies, authentication thresholds, database backups, and lab integrations.</p>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleReset} variant="ghost" className="bg-white/10 text-white hover:bg-white/20 border border-white/20">
              <RotateCcw className="h-4 w-4 mr-2" /> Reset Defaults
            </Button>
            <Button onClick={handleSave} disabled={loading} className="bg-white text-purple-900 hover:bg-white/90 font-semibold shadow-lg">
              <Save className="h-4 w-4 mr-2" /> {loading ? "Saving..." : "Save Config"}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-border mb-6 pb-2 scrollbar-thin">
        {[
          { id: "platform", label: "Platform & Identity", icon: Settings },
          { id: "security", label: "Security & Access", icon: Shield },
          { id: "database", label: "Database & Backups", icon: Database },
          { id: "gateways", label: "Gateways & Integrations", icon: Radio },
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all shrink-0 ${
                active
                  ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        {activeTab === "platform" && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gradient-card border shadow-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="h-4 w-4 text-primary" /> General Branding & Platform Info
                </CardTitle>
                <CardDescription>Global platform identity and support helpdesk routing.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="sys-name">Platform Title</Label>
                  <Input
                    id="sys-name"
                    value={config.systemName}
                    onChange={(e) => setConfig({ ...config, systemName: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="support-email">Global Helpdesk Email</Label>
                  <Input
                    id="support-email"
                    type="email"
                    value={config.supportEmail}
                    onChange={(e) => setConfig({ ...config, supportEmail: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="timeout">Inactivity Session Timeout (Minutes)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={config.sessionTimeout}
                    onChange={(e) => setConfig({ ...config, sessionTimeout: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border shadow-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="h-4 w-4 text-violet-500" /> Operational Flags
                </CardTitle>
                <CardDescription>Control public patient portal signups and system maintenance windows.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="block font-semibold">Enable Public Self-Registration</Label>
                    <span className="text-xs text-muted-foreground">Allows new patients to register online.</span>
                  </div>
                  <Switch
                    checked={config.allowRegistration}
                    onCheckedChange={(checked) => setConfig({ ...config, allowRegistration: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="block font-semibold">System Maintenance Mode</Label>
                    <span className="text-xs text-muted-foreground">Places all frontend portals into maintenance banner state.</span>
                  </div>
                  <Switch
                    checked={config.maintenanceMode}
                    onCheckedChange={(checked) => setConfig({ ...config, maintenanceMode: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === "security" && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gradient-card border shadow-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-500" /> Authentication & 2FA Enforcement
                </CardTitle>
                <CardDescription>Manage security levels and login failure lockout policies.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="block font-semibold">Enforce Two-Factor Authentication (2FA)</Label>
                    <span className="text-xs text-muted-foreground">Mandatory OTP for all medical staff and admins.</span>
                  </div>
                  <Switch
                    checked={config.require2FA}
                    onCheckedChange={(checked) => setConfig({ ...config, require2FA: checked })}
                  />
                </div>

                <div>
                  <Label htmlFor="max-attempts">Max Password Retries Before Account Lock</Label>
                  <Input
                    id="max-attempts"
                    type="number"
                    value={config.maxLoginAttempts}
                    onChange={(e) => setConfig({ ...config, maxLoginAttempts: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border shadow-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lock className="h-4 w-4 text-rose-500" /> IP Whitelisting & Network Fencing
                </CardTitle>
                <CardDescription>Restrict Super Admin access to trusted subnets.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="ip-list">Allowed Subnets (CIDR notation)</Label>
                  <Input
                    id="ip-list"
                    value={config.ipWhitelist}
                    onChange={(e) => setConfig({ ...config, ipWhitelist: e.target.value })}
                    className="mt-1.5 font-mono text-xs"
                  />
                </div>
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-xs text-amber-800 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>Changes to IP whitelist apply instantly across all active administrator sessions.</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === "database" && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gradient-card border shadow-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Database className="h-4 w-4 text-violet-500" /> Automated Backups & Cloud Snapshots
                </CardTitle>
                <CardDescription>Database persistence and automated S3 backup schedules.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="block font-semibold">Enable Automated Daily Snapshots</Label>
                    <span className="text-xs text-muted-foreground">Encrypts and exports DB to AWS S3.</span>
                  </div>
                  <Switch
                    checked={config.autoBackups}
                    onCheckedChange={(checked) => setConfig({ ...config, autoBackups: checked })}
                  />
                </div>

                <div>
                  <Label htmlFor="backup-freq">Scheduled Cron Timing</Label>
                  <Input
                    id="backup-freq"
                    value={config.backupFrequency}
                    onChange={(e) => setConfig({ ...config, backupFrequency: e.target.value })}
                    className="mt-1.5 font-mono text-xs"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border shadow-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Server className="h-4 w-4 text-blue-500" /> Audit Trail & Telemetry
                </CardTitle>
                <CardDescription>Track user transactions and error reporting telemetry.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="block font-semibold">Detailed Audit Trails</Label>
                    <span className="text-xs text-muted-foreground">Records user logins, IP access, and EMR updates.</span>
                  </div>
                  <Switch
                    checked={config.auditLogging}
                    onCheckedChange={(checked) => setConfig({ ...config, auditLogging: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="block font-semibold">Anonymized Performance Telemetry</Label>
                    <span className="text-xs text-muted-foreground">Send system uptime statistics to HQ monitoring.</span>
                  </div>
                  <Switch
                    checked={config.telemetry}
                    onCheckedChange={(checked) => setConfig({ ...config, telemetry: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === "gateways" && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gradient-card border shadow-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Radio className="h-4 w-4 text-amber-500" /> Communication & SMS Gateways
                </CardTitle>
                <CardDescription>Configure Twilio SMS and SMTP email notifications.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="block font-semibold">Automated Email Dispatch</Label>
                    <span className="text-xs text-muted-foreground">Send login alerts and appointment receipts.</span>
                  </div>
                  <Switch
                    checked={config.emailAlerts}
                    onCheckedChange={(checked) => setConfig({ ...config, emailAlerts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="block font-semibold">SMS Gateway (Twilio / Telephony)</Label>
                    <span className="text-xs text-muted-foreground">Send appointment reminders via SMS.</span>
                  </div>
                  <Switch
                    checked={config.smsGateway}
                    onCheckedChange={(checked) => setConfig({ ...config, smsGateway: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border shadow-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BellRing className="h-4 w-4 text-primary" /> Active API Webhook Connections
                </CardTitle>
                <CardDescription>Integrated laboratory & pharmacy networks.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "LabOne Diagnostic Network", status: "Connected", code: "200 OK" },
                  { name: "MediPharmacy Central API", status: "Connected", code: "200 OK" },
                  { name: "National EMR Health Exchange", status: "Syncing", code: "Active" },
                ].map((gw) => (
                  <div key={gw.name} className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 border border-border/60">
                    <div>
                      <span className="font-semibold text-xs block">{gw.name}</span>
                      <span className="text-[10px] text-muted-foreground">Status: {gw.status}</span>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 text-[10px] font-mono">{gw.code}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </AppShell>
  );
}
