import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { superAdminNav } from "@/lib/roleNav";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Settings, Save, Shield, Database, Radio, BellRing } from "lucide-react";

export const Route = createFileRoute("/super-admin/settings")({
  head: () => ({ meta: [{ title: "System Settings — Super Admin" }] }),
  component: SuperAdminSettingsScreen,
});

function SuperAdminSettingsScreen() {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    systemName: "MediCore HMS Pro",
    supportEmail: "support@medicore.hms",
    sessionTimeout: "30",
    allowRegistration: true,
    maintenanceMode: false,
    auditLogging: true,
    telemetry: false,
  });

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("System configurations saved successfully");
    }, 800);
  };

  return (
    <AppShell role="super-admin" title="Super Admin" nav={superAdminNav}>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">Adjust system-wide defaults, timeouts, access levels, and logs.</p>
        </div>
        <Button onClick={handleSave} disabled={loading} className="bg-gradient-primary text-primary-foreground shadow-glow self-start">
          <Save className="h-4 w-4 mr-2" /> {loading ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="space-y-6">
          <Card className="bg-gradient-card border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-4 w-4 text-primary" /> General System Identity
              </CardTitle>
              <CardDescription>Customize branding details of this instance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="sys-name">Platform Name</Label>
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
                <Label htmlFor="timeout">Auth Session Timeout (minutes)</Label>
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

          <Card className="bg-gradient-card border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-500" /> Portal Permissions
              </CardTitle>
              <CardDescription>Configure user access flags and verification requirements.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="block font-semibold">Enable Public Self-Registration</Label>
                  <span className="text-xs text-muted-foreground">Allows new patients to sign up online.</span>
                </div>
                <Switch
                  checked={config.allowRegistration}
                  onCheckedChange={(checked) => setConfig({ ...config, allowRegistration: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="block font-semibold">Maintenance Mode</Label>
                  <span className="text-xs text-muted-foreground">Puts frontend routes into staging block.</span>
                </div>
                <Switch
                  checked={config.maintenanceMode}
                  onCheckedChange={(checked) => setConfig({ ...config, maintenanceMode: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
          <Card className="bg-gradient-card border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="h-4 w-4 text-violet-500" /> Database & Auditing
              </CardTitle>
              <CardDescription>Maintain backup tasks and security audit thresholds.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="block font-semibold">Detailed Audit Trails</Label>
                  <span className="text-xs text-muted-foreground">Record every API transaction.</span>
                </div>
                <Switch
                  checked={config.auditLogging}
                  onCheckedChange={(checked) => setConfig({ ...config, auditLogging: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="block font-semibold">Share Diagnostic Telemetry</Label>
                  <span className="text-xs text-muted-foreground">Send anonymized performance statistics to HQ.</span>
                </div>
                <Switch
                  checked={config.telemetry}
                  onCheckedChange={(checked) => setConfig({ ...config, telemetry: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Radio className="h-4 w-4 text-amber-500" /> IoT & Integrations
              </CardTitle>
              <CardDescription>Control connection triggers with external lab networks.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                <BellRing className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <span className="font-semibold text-xs block text-foreground">External Gateway Hook</span>
                  <span className="text-[10px] text-muted-foreground">Status: Connected to LabOne API</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppShell>
  );
}
