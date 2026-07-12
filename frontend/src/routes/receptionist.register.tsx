import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { receptionistNav } from "@/lib/roleNav";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { authAPI } from "@/lib/api/client";
import { toast } from "sonner";
import { UserPlus, Sparkles, Clipboard, Lock } from "lucide-react";

export const Route = createFileRoute("/receptionist/register")({
  head: () => ({ meta: [{ title: "Register Patient — Reception" }] }),
  component: ReceptionistRegisterScreen,
});

function ReceptionistRegisterScreen() {
  const [form, setForm] = useState({
    name: "",
    gender: "Male",
    bloodGroup: "",
    phone: "",
    address: "",
    age: "",
  });
  const [registering, setRegistering] = useState(false);

  const handleRegister = async () => {
    if (!form.name || !form.phone) {
      return toast.error("Full Name and Phone number are required");
    }

    setRegistering(true);
    const email = `${form.name.toLowerCase().replace(/\s/g, ".")}.${Date.now()}@patient.medicore`;

    try {
      const res = await authAPI.register({
        name: form.name,
        email,
        password: "Patient@1234",
        role: "patient",
        phone: form.phone,
        address: form.address,
        gender: form.gender,
        age: form.age ? parseInt(form.age) : undefined,
        bloodGroup: form.bloodGroup,
      });

      if (res.success) {
        const data = res.data as { patientCode?: string; name: string };
        toast.success(`Patient registered successfully!`, {
          description: `ID: ${data?.patientCode || "Generated"} | Password: Patient@1234`,
        });
        setForm({ name: "", gender: "Male", bloodGroup: "", phone: "", address: "", age: "" });
      } else {
        toast.error(res.message || "Registration failed");
      }
    } catch {
      toast.error("Failed to connect to the backend API");
    } finally {
      setRegistering(false);
    }
  };

  return (
    <AppShell role="receptionist" title="Reception" nav={receptionistNav}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Patient Admission</h1>
        <p className="text-muted-foreground">Register new patients to MediCore HMS and generate system credentials.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-gradient-card border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary" /> Full Registration Form
                </CardTitle>
                <CardDescription>All fields will automatically link to the clinical registry database.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-name">Full Name *</Label>
                    <Input
                      id="reg-name"
                      placeholder="e.g. Hassan Raza"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-phone">Contact Phone *</Label>
                    <Input
                      id="reg-phone"
                      placeholder="e.g. +92 300 1234567"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label>Gender</Label>
                    <Select value={form.gender} onValueChange={(val) => setForm({ ...form, gender: val })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-age">Age</Label>
                    <Input
                      id="reg-age"
                      type="number"
                      placeholder="e.g. 34"
                      value={form.age}
                      onChange={(e) => setForm({ ...form, age: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-blood">Blood Group</Label>
                    <Input
                      id="reg-blood"
                      placeholder="e.g. O+"
                      value={form.bloodGroup}
                      onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-address">Residential Address</Label>
                  <Input
                    id="reg-address"
                    placeholder="Street No, Area, Sector, City"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </div>

                <Button
                  onClick={handleRegister}
                  disabled={registering}
                  className="w-full bg-gradient-primary text-primary-foreground shadow-glow font-semibold mt-4"
                >
                  {registering ? "Validating & Submitting..." : "Generate Registry & Credentials"}
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
                  <Sparkles className="h-4 w-4 text-amber-500" /> Patient Registry Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-muted-foreground leading-relaxed">
                <p>
                  1. <strong>Verification:</strong> Ask for standard government-issued identification before registry to prevent duplication.
                </p>
                <p>
                  2. <strong>Auto-Passcodes:</strong> Every registry automatically sets a temporary passcode: <code className="bg-secondary px-1 py-0.5 rounded text-foreground font-mono">Patient@1234</code>. Instruct the patient to modify this on first login.
                </p>
                <p>
                  3. <strong>Card Generation:</strong> Patient records sync in real-time, allowing ward nurses to check vitals under the generated code instantly.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border">
              <CardContent className="pt-6 space-y-3">
                <div className="flex gap-3 text-xs">
                  <Clipboard className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <span className="font-semibold block text-foreground">Immediate Sync</span>
                    <span className="text-muted-foreground">Linked directly into ward occupancy matrices.</span>
                  </div>
                </div>
                <div className="flex gap-3 text-xs">
                  <Lock className="h-5 w-5 text-emerald-500 shrink-0" />
                  <div>
                    <span className="font-semibold block text-foreground">Secure Passwords</span>
                    <span className="text-muted-foreground">All details encrypted using bcrypt on database write.</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}
