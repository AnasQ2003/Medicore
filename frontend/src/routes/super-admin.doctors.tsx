import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { superAdminNav } from "@/lib/roleNav";
import { motion } from "framer-motion";
import { adminAPI } from "@/lib/api/client";
import useApi from "@/hooks/useApi";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Stethoscope, Mail, Phone, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/super-admin/doctors")({
  head: () => ({ meta: [{ title: "Doctors Management — Super Admin" }] }),
  component: SuperAdminDoctorsScreen,
});

interface Doctor {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  specialty?: string;
  status?: string;
}

function SuperAdminDoctorsScreen() {
  const { data: rawDoctors, loading, error } = useApi(() => adminAPI.getDoctors());
  const doctors = (rawDoctors as unknown as Doctor[]) ?? [];

  return (
    <AppShell role="super-admin" title="Super Admin" nav={superAdminNav}>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Doctors Directory</h1>
          <p className="text-muted-foreground">Manage hospital medical staff, credentials, and availability.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-destructive border rounded-2xl bg-secondary/10">
          <p>{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-gradient-card border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Physicians</CardTitle>
                <Stethoscope className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{doctors.length}</div>
                <p className="text-xs text-muted-foreground">Active medical practitioners</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Departments</CardTitle>
                <User className="h-4 w-4 text-violet-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">Cardiology, General, etc.</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">On-Duty Today</CardTitle>
                <Calendar className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.ceil(doctors.length * 0.8)}</div>
                <p className="text-xs text-muted-foreground">Currently on rotation</p>
              </CardContent>
            </Card>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-card border border-border rounded-2xl overflow-hidden shadow-card"
          >
            <Table>
              <TableHeader className="bg-secondary/40">
                <TableRow>
                  <TableHead className="font-semibold">Doctor Details</TableHead>
                  <TableHead className="font-semibold">Specialty</TableHead>
                  <TableHead className="font-semibold">Contact Info</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      No doctors registered in the system yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  doctors.map((doc, idx) => (
                    <TableRow key={doc.id || idx} className="hover:bg-secondary/20 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {doc.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-semibold text-foreground text-sm block">{doc.name}</span>
                            <span className="text-xs text-muted-foreground">ID: DOC-00{doc.id}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary text-xs px-2 py-0.5">
                          {doc.specialty || "General Medicine"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs text-muted-foreground space-y-1">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {doc.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {doc.phone || "+92 300 1234567"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <button className="text-xs text-primary hover:underline font-medium">
                          Manage schedule
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </motion.div>
        </div>
      )}
    </AppShell>
  );
}
