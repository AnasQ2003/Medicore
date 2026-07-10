import { createFileRoute } from "@tanstack/react-router";
import { LayoutDashboard, UserPlus, Calendar, Receipt, Stethoscope, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { receptionistNav } from "@/lib/roleNav";
import { useState } from "react";
import { toast } from "sonner";
import { authAPI } from "@/lib/api/client";
import useApi from "@/hooks/useApi";
import { adminAPI } from "@/lib/api/client";

export const Route = createFileRoute("/receptionist/")({
  head: () => ({ meta: [{ title: "Receptionist — MediCore" }] }),
  component: ReceptionistScreen,
});

const nav = [
  { label: "Dashboard", to: "/receptionist", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Register Patient", to: "/receptionist", icon: <UserPlus className="h-4 w-4" /> },
  { label: "Appointments", to: "/receptionist", icon: <Calendar className="h-4 w-4" /> },
  { label: "Doctor Schedule", to: "/receptionist", icon: <Stethoscope className="h-4 w-4" /> },
  { label: "Patients", to: "/receptionist", icon: <Users className="h-4 w-4" /> },
  { label: "Billing", to: "/receptionist", icon: <Receipt className="h-4 w-4" /> },
];

const doctors = [
  { name: "Dr. Sarah Khan", spec: "Cardiologist", avail: "09:00 – 14:00", slots: 4 },
  { name: "Dr. Imran Ali", spec: "Dermatologist", avail: "10:00 – 16:00", slots: 7 },
  { name: "Dr. Nadia Hassan", spec: "Neurologist", avail: "11:00 – 17:00", slots: 2 },
  { name: "Dr. Faisal Tariq", spec: "Orthopedic", avail: "08:00 – 13:00", slots: 0 },
];

// ReceptionistScreen — patient registration, appointment booking, doctor availability.
function ReceptionistScreen() {
  const [regForm, setRegForm] = useState({ name: "", gender: "Male", blood: "", phone: "", address: "" });
  const [registering, setRegistering] = useState(false);
  const { data: analytics } = useApi(() => adminAPI.getAnalytics());
  const { data: apiDoctors } = useApi(() => adminAPI.getDoctors());

  const stats = analytics as unknown as { totalPatients: number; todayAppointments: number; totalBeds: number; occupiedBeds: number; revenue: number } | null;
  const doctorList = (apiDoctors as unknown as { id: number; name: string; specialty?: string }[]) ?? doctors;

  const handleRegister = async () => {
    if (!regForm.name || !regForm.phone) return toast.error("Name and phone are required");
    setRegistering(true);
    const email = `${regForm.name.toLowerCase().replace(/\s/g,".")}.${Date.now()}@patient.medicore`;
    try {
      const res = await authAPI.register({ name: regForm.name, email, password: "Patient@1234", role: "patient", phone: regForm.phone, address: regForm.address, gender: regForm.gender, bloodGroup: regForm.blood });
      if (res.success) {
        const data = res.data as { patientCode?: string; name: string };
        toast.success(`Patient registered! ID: ${data?.patientCode || 'P-auto'}`, { description: `Temp password: Patient@1234` });
        setRegForm({ name: "", gender: "Male", blood: "", phone: "", address: "" });
      } else { toast.error(res.message || "Registration failed"); }
    } catch { toast.error("Failed to register patient"); }
    setRegistering(false);
  };

  return (
    <AppShell role="receptionist" title="Reception" nav={receptionistNav}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Front Desk</h1>
        <p className="text-muted-foreground">Register patients & manage appointments.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Patients Today" value={stats ? String(stats.totalPatients) : "38"} change="+5 vs yesterday" icon={Users} delay={0} />
        <StatCard label="Appointments" value={stats ? String(stats.todayAppointments) : "74"} change="62 confirmed" icon={Calendar} delay={0.05} />
        <StatCard label="Occupied Beds" value={stats ? String(stats.occupiedBeds) : "12"} icon={UserPlus} delay={0.1} />
        <StatCard label="Available Beds" value={stats ? String(stats.totalBeds - (stats.occupiedBeds || 0)) : "9"} change="of total" icon={Receipt} delay={0.15} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}} className="bg-gradient-card border border-border rounded-2xl p-6 shadow-card">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><UserPlus className="h-4 w-4 text-primary"/> Quick Register Patient</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Full Name</Label><Input value={regForm.name} onChange={e => setRegForm(f => ({...f, name: e.target.value}))} placeholder="John Doe" className="mt-1.5"/></div>
                <div><Label>Gender</Label><Input value={regForm.gender} onChange={e => setRegForm(f => ({...f, gender: e.target.value}))} placeholder="Male" className="mt-1.5"/></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Phone</Label><Input value={regForm.phone} onChange={e => setRegForm(f => ({...f, phone: e.target.value}))} placeholder="+92 300 0000000" className="mt-1.5"/></div>
                <div><Label>Blood Group</Label><Input value={regForm.blood} onChange={e => setRegForm(f => ({...f, blood: e.target.value}))} placeholder="O+" className="mt-1.5"/></div>
              </div>
              <div><Label>Address</Label><Input value={regForm.address} onChange={e => setRegForm(f => ({...f, address: e.target.value}))} placeholder="Street, City" className="mt-1.5"/></div>
              <Button onClick={handleRegister} disabled={registering} className="w-full bg-gradient-primary text-primary-foreground shadow-glow">
                {registering ? "Registering..." : "Register & Generate Patient ID"}
              </Button>
            </div>
        </motion.div>

        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.25}} className="bg-gradient-card border border-border rounded-2xl p-6 shadow-card">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Stethoscope className="h-4 w-4 text-primary"/> Doctor Availability</h3>
          <div className="space-y-3">
            {doctors.map((d, i) => (
              <motion.div
                key={d.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40"
              >
                <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {d.name.split(" ")[1][0]}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{d.name}</div>
                  <div className="text-xs text-muted-foreground">{d.spec} · {d.avail}</div>
                </div>
                <Button size="sm" variant={d.slots === 0 ? "secondary" : "default"} disabled={d.slots === 0} className={d.slots > 0 ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}>
                  {d.slots === 0 ? "Full" : `${d.slots} slots`}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </AppShell>
  );
}
