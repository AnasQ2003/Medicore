import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { patientNav } from "@/lib/roleNav";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Search, Sparkles, CheckCircle2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { getUser } from "@/lib/auth";
import { toast } from "sonner";
import { generateGenericPDF } from "@/lib/pdfGenerator";

export const Route = createFileRoute("/patient/reports")({
  head: () => ({ meta: [{ title: "Lab Reports — Patient Portal" }] }),
  component: PatientReportsScreen,
});

const defaultReports = [
  { id: "REP-992", name: "Complete Blood Count (CBC)", category: "Hematology", date: "2026-07-02", status: "Released", doctor: "Dr. Bilal Iqbal", summary: "Hb 13.5 g/dL, WBC 6.8, Platelets 260k. All normal." },
  { id: "REP-881", name: "Lipid Profile & Cholesterol Panel", category: "Biochemistry", date: "2026-06-15", status: "Released", doctor: "Dr. Sarah Khan", summary: "Total Cholesterol 240 mg/dL (high), LDL 162, HDL 38." },
  { id: "REP-431", name: "Liver Function Test (LFT)", category: "Biochemistry", date: "2026-05-10", status: "Released", doctor: "Dr. Sarah Khan", summary: "ALT 28, AST 24, Bilirubin 0.8. Normal LFT." },
];

export function PatientReportsScreen() {
  const user = getUser();
  const [search, setSearch] = useState("");
  const [reports, setReports] = useState<any[]>(defaultReports);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedDoctorReports = localStorage.getItem("medicore_doctor_reports");
        let sharedFromDoctor: any[] = [];
        if (savedDoctorReports) {
          const parsed = JSON.parse(savedDoctorReports);
          sharedFromDoctor = parsed
            .filter((r: any) => r.sharedWithPatient)
            .map((r: any) => ({
              id: r.id,
              name: r.name,
              category: r.type || "Diagnostics",
              date: r.date,
              status: "Shared by Doctor",
              doctor: "Dr. Sarah Khan",
              summary: r.summary,
              isShared: true,
            }));
        }

        // Also check patient specific storage
        const code = user?.patientCode || "P-1042";
        const patientShared = localStorage.getItem(`medicore_shared_reports_${code}`);
        let extraShared: any[] = [];
        if (patientShared) {
          extraShared = JSON.parse(patientShared).map((r: any) => ({
            id: r.id,
            name: r.name,
            category: "Clinical Report",
            date: r.sharedAt ? r.sharedAt.split("T")[0] : new Date().toISOString().split("T")[0],
            status: "Shared by Doctor",
            doctor: "Dr. Sarah Khan",
            summary: "Shared by your attending physician via MediCore HMS.",
            isShared: true,
          }));
        }

        // Combine unique
        const map = new Map<string, any>();
        [...sharedFromDoctor, ...extraShared, ...defaultReports].forEach(r => {
          if (!map.has(r.id)) map.set(r.id, r);
        });
        setReports(Array.from(map.values()));
      } catch (e) {
        console.error(e);
      }
    }
  }, [user]);

  const filtered = reports.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.category.toLowerCase().includes(search.toLowerCase()) ||
    r.doctor.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell role="patient" title="Patient Portal" nav={patientNav}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Lab & Diagnostics Reports</h1>
        <p className="text-muted-foreground">View and download files related to your lab diagnostics and reports shared by your doctor.</p>
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
            className="bg-card border border-border rounded-2xl overflow-hidden shadow-card"
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
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${r.isShared ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-primary/10 text-primary'}`}>
                            {r.isShared ? <CheckCircle2 className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-foreground text-sm block">{r.name}</span>
                              {r.isShared && <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[9px] px-1.5">New Shared</Badge>}
                            </div>
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
                                    r.summary || "All measured parameters are within standard clinical ranges.",
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
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" /> Automatic Doctor Sync
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground leading-relaxed space-y-2">
                <p>
                  Reports shared by your doctor automatically appear in your portal and trigger email notifications.
                </p>
                <p>
                  You can download high-resolution medical PDFs for any report listed here at any time.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}
