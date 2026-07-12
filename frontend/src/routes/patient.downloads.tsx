import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { patientNav } from "@/lib/roleNav";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Pill, FileText, Calendar, Search, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import useApi from "@/hooks/useApi";
import { prescriptionAPI } from "@/lib/api/client";
import { getUser } from "@/lib/auth";

export const Route = createFileRoute("/patient/downloads")({
  head: () => ({ meta: [{ title: "My Downloads — Patient Portal" }] }),
  component: PatientDownloadsScreen,
});

interface Prescription {
  id: number;
  prescriptionCode: string;
  patientId: number;
  doctorId: number;
  items: string;
  status: string;
  createdAt: string;
  doctorName?: string;
}

function PatientDownloadsScreen() {
  const user = getUser();
  const { data: rawData, loading, error } = useApi(() => prescriptionAPI.getAll());
  const prescriptions = (rawData as unknown as Prescription[]) ?? [];
  const [search, setSearch] = useState("");

  const filtered = prescriptions.filter(p =>
    p.items.toLowerCase().includes(search.toLowerCase()) ||
    (p.doctorName || "").toLowerCase().includes(search.toLowerCase()) ||
    p.prescriptionCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell role="patient" title="Patient Portal" nav={patientNav}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Prescriptions & Downloads</h1>
        <p className="text-muted-foreground">Access your medical prescription papers, clinical guidance sheets, and billing files.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by medicine name, doctor name or code..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
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
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-card border border-border rounded-2xl overflow-hidden shadow-card"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Prescription Code</TableHead>
                    <TableHead className="font-semibold">Medicine Items</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                        No prescriptions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((p, idx) => (
                      <TableRow key={p.id || idx} className="hover:bg-secondary/20 transition-colors">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                              <Pill className="h-4 w-4" />
                            </div>
                            <div>
                              <span className="font-semibold text-foreground text-sm block">{p.prescriptionCode}</span>
                              <span className="text-[10px] text-muted-foreground">Doctor ID: {p.doctorId}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-foreground line-clamp-1 max-w-[240px]">{p.items}</span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" className="h-8 text-primary hover:text-primary-hover gap-1">
                            <Download className="h-3.5 w-3.5" /> PDF
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </motion.div>
          )}
        </div>

        <div>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
            <Card className="bg-gradient-card border">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-primary" /> Active Prescription Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground leading-relaxed space-y-2">
                <p>
                  To download a prescription PDF, select the respective item and click <strong>PDF</strong>.
                </p>
                <p>
                  Please present these downloaded prescription PDFs or codes to the hospital pharmacist to claim your medicines.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}
