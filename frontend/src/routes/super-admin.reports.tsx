import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { superAdminNav } from "@/lib/roleNav";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, TrendingUp, Calendar, AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/super-admin/reports")({
  head: () => ({ meta: [{ title: "System Reports — Super Admin" }] }),
  component: SuperAdminReportsScreen,
});

const reports = [
  {
    id: "REP-029",
    name: "Q2 Financial Performance Summary",
    type: "Financial",
    generatedAt: "2026-07-01",
    size: "2.4 MB",
    status: "Generated",
  },
  {
    id: "REP-028",
    name: "Doctor Inflow & Attendance Log",
    type: "Staffing",
    generatedAt: "2026-06-15",
    size: "1.8 MB",
    status: "Generated",
  },
  {
    id: "REP-027",
    name: "Bed Occupancy & Recovery Rates",
    type: "Operations",
    generatedAt: "2026-06-01",
    size: "940 KB",
    status: "Generated",
  },
  {
    id: "REP-026",
    name: "Emergency Wing Load & Speed Analysis",
    type: "Clinical",
    generatedAt: "2026-05-20",
    size: "3.1 MB",
    status: "Archived",
  },
];

function SuperAdminReportsScreen() {
  return (
    <AppShell role="super-admin" title="Super Admin" nav={superAdminNav}>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Reports</h1>
          <p className="text-muted-foreground">Access system logs, financial statements, and clinical efficiency audits.</p>
        </div>
        <Button className="bg-gradient-primary text-primary-foreground shadow-glow self-start">
          <Calendar className="h-4 w-4 mr-2" /> Generate Custom Report
        </Button>
      </div>

      <div className="space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-gradient-card border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Logs</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">142</div>
              <p className="text-xs text-muted-foreground">Historical records stored</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Export Formats</CardTitle>
              <Download className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">PDF / CSV</div>
              <p className="text-xs text-muted-foreground">Optimized database dumps</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Audit Confidence</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">99.9%</div>
              <p className="text-xs text-muted-foreground">Zero discrepancies identified</p>
            </CardContent>
          </Card>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-card border border-border rounded-2xl overflow-hidden shadow-card"
        >
          <div className="p-4 bg-secondary/20 border-b flex items-center justify-between">
            <h3 className="font-semibold">Recent Generated Reports</h3>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> Auto-purges logs older than 1 year
            </span>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Report Name</TableHead>
                <TableHead className="font-semibold">Classification</TableHead>
                <TableHead className="font-semibold">Generation Date</TableHead>
                <TableHead className="font-semibold">File Size</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((r, idx) => (
                <TableRow key={r.id || idx} className="hover:bg-secondary/20 transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <span className="font-semibold text-foreground text-sm block">{r.name}</span>
                        <span className="text-xs text-muted-foreground">{r.id}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-border">
                      {r.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.generatedAt}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.size}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" className="h-8 text-primary hover:text-primary-hover gap-1">
                      <Download className="h-3.5 w-3.5" /> Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </motion.div>
      </div>
    </AppShell>
  );
}
