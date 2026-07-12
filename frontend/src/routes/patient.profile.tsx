import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { patientNav } from "@/lib/roleNav";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authAPI } from "@/lib/api/client";
import { toast } from "sonner";
import { Loader2, User, Save, Shield, ShieldCheck, Mail, Phone, MapPin } from "lucide-react";

export const Route = createFileRoute("/patient/profile")({
  head: () => ({ meta: [{ title: "My Profile — Patient Portal" }] }),
  component: PatientProfileScreen,
});

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
  patientCode?: string;
}

function PatientProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ phone: "", address: "" });

  useEffect(() => {
    authAPI.getMe()
      .then(res => {
        if (res.success && res.data) {
          const user = res.data as UserProfile;
          setProfile(user);
          setForm({
            phone: user.phone || "",
            address: user.address || "",
          });
        }
      })
      .catch(() => toast.error("Failed to load profile details"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await authAPI.updateProfile(form);
      if (res.success) {
        toast.success("Profile updated successfully");
      } else {
        toast.error(res.message || "Failed to update profile");
      }
    } catch {
      toast.error("Error communicating with the database server");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell role="patient" title="Patient Portal" nav={patientNav}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Personal Profile</h1>
        <p className="text-muted-foreground">Manage your contact information and view your medical registration records.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-gradient-card border">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" /> Contact Details
                  </CardTitle>
                  <CardDescription>Keep your record updated so hospital staff can contact you.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="prof-name">Full Name</Label>
                      <Input id="prof-name" value={profile?.name || ""} disabled className="bg-secondary/40" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="prof-email">Email Address</Label>
                      <Input id="prof-email" value={profile?.email || ""} disabled className="bg-secondary/40" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="prof-phone">Mobile Phone</Label>
                    <Input
                      id="prof-phone"
                      placeholder="+92 300 1234567"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="prof-address">Residential Address</Label>
                    <Input
                      id="prof-address"
                      placeholder="Street address, City"
                      value={form.address}
                      onChange={e => setForm({ ...form, address: e.target.value })}
                    />
                  </div>

                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-gradient-primary text-primary-foreground shadow-glow font-semibold mt-4"
                  >
                    <Save className="h-4 w-4 mr-2" /> {saving ? "Saving Changes..." : "Save Changes"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div>
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
              <Card className="bg-gradient-card border">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" /> Account Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-xs text-muted-foreground leading-relaxed">
                  <div className="flex justify-between items-center py-1 border-b border-border">
                    <span>Patient Identifier:</span>
                    <span className="font-bold text-foreground font-mono">{profile?.patientCode || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-border">
                    <span>Account Status:</span>
                    <span className="text-emerald-500 font-semibold">Active & Verified</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-border">
                    <span>Database ID:</span>
                    <span className="font-semibold text-foreground">UID-{profile?.id}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex gap-3 text-xs">
                    <Shield className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <span className="font-semibold block text-foreground">Strict Privacy Rules</span>
                      <span className="text-muted-foreground">Your records are only visible to authorized hospital personnel.</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
