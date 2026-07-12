import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { superAdminNav } from "@/lib/roleNav";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, Settings, Users, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/super-admin/hospitals")({
  head: () => ({ meta: [{ title: "Hospitals Management — Super Admin" }] }),
  component: SuperAdminHospitalsScreen,
});

const branches = [
  {
    id: 1,
    name: "MediCore Islamabad (HQ)",
    address: "House 12, Street 5, F-7 Islamabad",
    phone: "+92 51 111 222 333",
    beds: 120,
    doctors: 35,
    patients: 480,
    status: "Active",
  },
  {
    id: 2,
    name: "MediCore Lahore Branch",
    address: "88-C, Gulberg III, Lahore",
    phone: "+92 42 111 222 333",
    beds: 80,
    doctors: 22,
    patients: 290,
    status: "Active",
  },
  {
    id: 3,
    name: "MediCore Karachi Branch",
    address: "Plot 42, Block 6, PECHS, Karachi",
    phone: "+92 21 111 222 333",
    beds: 150,
    doctors: 42,
    patients: 610,
    status: "Active",
  },
];

function SuperAdminHospitalsScreen() {
  return (
    <AppShell role="super-admin" title="Super Admin" nav={superAdminNav}>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hospital Branches</h1>
          <p className="text-muted-foreground">Monitor and manage multi-tenant hospital locations, capacity, and status.</p>
        </div>
        <Button className="bg-gradient-primary text-primary-foreground shadow-glow self-start">
          <Plus className="h-4 w-4 mr-2" /> Add Location
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((b, idx) => (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="bg-gradient-card border overflow-hidden h-full flex flex-col justify-between">
              <div>
                <CardHeader className="pb-3 border-b border-border/40">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold">{b.name}</CardTitle>
                        <CardDescription className="text-xs flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" /> {b.address.split(",")[1] || b.address}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">{b.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-secondary/30">
                      <span className="block text-lg font-bold text-foreground">{b.beds}</span>
                      <span className="text-[10px] text-muted-foreground uppercase">Beds</span>
                    </div>
                    <div className="p-2 rounded-xl bg-secondary/30">
                      <span className="block text-lg font-bold text-foreground">{b.doctors}</span>
                      <span className="text-[10px] text-muted-foreground uppercase">Doctors</span>
                    </div>
                    <div className="p-2 rounded-xl bg-secondary/30">
                      <span className="block text-lg font-bold text-foreground">{b.patients}</span>
                      <span className="text-[10px] text-muted-foreground uppercase">Patients</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-muted-foreground pt-2">
                    <p className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-primary" /> {b.address}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-primary" /> {b.phone}
                    </p>
                  </div>
                </CardContent>
              </div>

              <div className="p-4 bg-secondary/20 border-t flex justify-end gap-2">
                <Button size="sm" variant="ghost" className="text-xs h-8">
                  <Settings className="h-3.5 w-3.5 mr-1" /> Config
                </Button>
                <Button size="sm" variant="outline" className="text-xs h-8">
                  View staff
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </AppShell>
  );
}
