import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { patientNav } from "@/lib/roleNav";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Calendar, Search, Loader2, Sparkles } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import useApi from "@/hooks/useApi";
import { patientAPI } from "@/lib/api/client";
import { getUser } from "@/lib/auth";
import { toast } from "sonner";
import { generateGenericPDF } from "@/lib/pdfGenerator";

export const Route = createFileRoute("/patient/reports")({
  head: () => ({ meta: [{ title: "Lab Reports — Patient Portal" }] }),
  component: PatientReportsScreen,
});

const defaultReports = [
  { id: "REP-992", name: "Complete Blood Count (CBC)", category: "Hematology", date: "2026-07-02", status: "Released", doctor: "Dr. Bilal Iqbal" },
  { id: "REP-881", name: "Lipid Profile & Cholesterol Panel", category: "Biochemistry", date: "2026-06-15", status: "Released", doctor: "Dr. Sarah Khan" },
  { id: "REP-431", name: "Liver Function Test (LFT)", category: "Biochemistry", date: "2026-05-10", status: "Released", doctor: "Dr. Sarah Khan" },
];

function PatientReportsScreen() {
  const user = getUser();
  const [search, setSearch] = useState("");

  const filtered = defaultReports.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell role="patient" title="Patient Portal" nav={patientNav}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Lab & Diagnostics Reports</h1>
        <p className="text-muted-foreground">View and download files related to your lab diagnostics and clinical history.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports by title or category..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-card border border-border rounded-2xl overflow-hidden shadow-card"
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Report Info</TableHead>
                  <TableHead className="font-semibold">Ordering Doctor</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                      No reports found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((r, idx) => (
                    <TableRow key={r.id || idx} className="hover:bg-secondary/20 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="font-semibold text-foreground text-sm block">{r.name}</span>
                            <span className="text-[10px] text-muted-foreground uppercase">{r.category}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-foreground">{r.doctor}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{r.date}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            toast.success(`Generating PDF for ${r.name}...`);
                            generateGenericPDF(
                              `Diagnostic Report — ${r.name}`,
                              r.category,
                              [
                                {
                                  title: "Report Identification",
                                  subtitle: `Report ID: ${r.id}`,
                                  items: [
                                    { label: "Patient", value: user?.name || "Patient" },
                                    { label: "Test / Procedure", value: r.name },
                                    { label: "Category", value: r.category },
                                    { label: "Date Issued", value: r.date },
                                    { label: "Ordering Physician", value: r.doctor },
                                    { label: "Status", value: r.status },
                                  ],
                                },
                                {
                                  title: "Diagnostic Summary & Observations",
                                  notes: [
                                    "All measured parameters are within standard clinical ranges.",
                                    "No urgent intervention indicated at this time.",
                                    "Follow up with ordering doctor during next routine visit."
                                  ],
                                },
                              ],
                              `Report_${r.id}_${r.name.replace(/\s+/g, "_")}.pdf`
                            );
                          }}
                          className="h-8 text-primary hover:text-primary-hover gap-1"
                        >
                          <Download className="h-3.5 w-3.5" /> PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </motion.div>
        </div>

        <div>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
            <Card className="bg-gradient-card border">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" /> Automatic Sync
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground leading-relaxed space-y-2">
                <p>
                  Diagnostic files are uploaded directly by the laboratory team as soon as reports are authenticated.
                </p>
                <p>
                  If you do not see a report, please verify with reception if the doctor has cleared the diagnostics release flag.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}
