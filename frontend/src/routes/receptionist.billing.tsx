import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { receptionistNav } from "@/lib/roleNav";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Receipt, Plus, Search, Loader2, AlertCircle, CheckCircle2, RefreshCw, Download } from "lucide-react";
import { billAPI, patientAPI } from "@/lib/api/client";
import useApi from "@/hooks/useApi";
import { useState } from "react";
import { toast } from "sonner";
import { generateGenericPDF } from "@/lib/pdfGenerator";

export const Route = createFileRoute("/receptionist/billing")({
  head: () => ({ meta: [{ title: "Billing — Reception" }] }),
  component: ReceptionistBillingScreen,
});

interface Bill { id: string; billCode: string; amount: number; description: string; status: "Paid" | "Unpaid"; patientName: string; createdAt: string; }
interface ApiPatient { id: number; name: string; patientCode: string; }

function ReceptionistBillingScreen() {
  const { data: rawBills, loading, error, refetch } = useApi(() => billAPI.getAll());
  const { data: rawPatients } = useApi(() => patientAPI.getAll());

  const bills = (rawBills as unknown as Bill[]) ?? [];
  const patients = (rawPatients as unknown as ApiPatient[]) ?? [];

  const [q, setQ] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ patientId: "", amount: "", description: "" });

  const filtered = bills.filter((b) => {
    const matchQ = (b.patientName ?? "").toLowerCase().includes(q.toLowerCase()) || (b.billCode ?? "").toLowerCase().includes(q.toLowerCase());
    const matchStatus = filterStatus === "All" || b.status === filterStatus;
    return matchQ && matchStatus;
  });

  const markPaid = async (code: string) => {
    try {
      await billAPI.pay(code);
      toast.success(`Bill ${code} marked as paid`);
      refetch();
    } catch { toast.error("Failed to update bill"); }
  };

  const createBill = async () => {
    if (!form.patientId || !form.amount || !form.description) return toast.error("Fill all fields");
    try {
      await billAPI.create({ patientId: Number(form.patientId), amount: Number(form.amount), description: form.description });
      toast.success("Bill created successfully");
      setCreateOpen(false);
      setForm({ patientId: "", amount: "", description: "" });
      refetch();
    } catch { toast.error("Failed to create bill"); }
  };

  const totals = {
    total: bills.length,
    paid: bills.filter((b) => b.status === "Paid").length,
    unpaid: bills.filter((b) => b.status === "Unpaid").length,
    revenue: bills.filter((b) => b.status === "Paid").reduce((sum, b) => sum + (b.amount ?? 0), 0),
  };

  return (
    <AppShell role="receptionist" title="Reception" nav={receptionistNav}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing Management</h1>
          <p className="text-muted-foreground">{bills.length} invoices on file</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="bg-gradient-primary text-white shadow-glow">
          <Plus className="h-4 w-4 mr-2" />Create Invoice
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Bills", value: totals.total, color: "from-violet-500 to-purple-600" },
          { label: "Paid", value: totals.paid, color: "from-emerald-500 to-teal-600" },
          { label: "Unpaid", value: totals.unpaid, color: "from-rose-500 to-pink-600" },
          { label: "Revenue", value: `$${totals.revenue.toFixed(0)}`, color: "from-blue-500 to-cyan-600" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`rounded-2xl bg-gradient-to-br ${s.color} text-white p-5 shadow-elevated`}>
            <div className="text-3xl font-bold">{s.value}</div>
            <div className="text-sm opacity-90 mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patient or bill code…" className="pl-9" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Unpaid">Unpaid</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={refetch}><RefreshCw className="h-3.5 w-3.5 mr-2" />Refresh</Button>
      </div>

      {loading && <div className="flex items-center justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
      {error && (
        <div className="text-center py-16 text-destructive">
          <AlertCircle className="h-8 w-8 mx-auto mb-3" />
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-gradient-card border border-border rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-6 py-3">Bill Code</th>
                  <th className="text-left px-6 py-3">Patient</th>
                  <th className="text-left px-6 py-3">Description</th>
                  <th className="text-left px-6 py-3">Amount</th>
                  <th className="text-left px-6 py-3">Date</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="text-left px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, i) => (
                  <motion.tr key={b.billCode ?? b.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 + i * 0.03 }}
                    className="border-t border-border hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-primary">{b.billCode}</td>
                    <td className="px-6 py-4 font-medium">{b.patientName ?? "—"}</td>
                    <td className="px-6 py-4 max-w-[180px] truncate">{b.description}</td>
                    <td className="px-6 py-4 font-bold">${b.amount}</td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">
                      {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={b.status === "Paid" ? "bg-emerald-100 text-emerald-700 flex items-center gap-1 w-fit" : "bg-rose-100 text-rose-700 w-fit"}>
                        {b.status === "Paid" && <CheckCircle2 className="h-3 w-3" />}
                        {b.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {b.status === "Unpaid" && (
                        <Button size="sm" className="bg-emerald-500 text-white hover:bg-emerald-600" onClick={() => markPaid(b.billCode)}>
                          Mark Paid
                        </Button>
                      )}
                      {b.status === "Paid" && (
                        <Button size="sm" variant="ghost" className="text-primary gap-1" onClick={() => {
                          toast.success(`Generating invoice PDF for ${b.billCode}...`);
                          generateGenericPDF(
                            `Invoice — ${b.billCode}`,
                            "Hospital Billing Receipt",
                            [
                              {
                                title: "Invoice Summary",
                                subtitle: `Bill Code: ${b.billCode} • Settled`,
                                items: [
                                  { label: "Bill Code", value: b.billCode },
                                  { label: "Patient", value: b.patientName ?? "—" },
                                  { label: "Description", value: b.description },
                                  { label: "Amount", value: `$${b.amount}` },
                                  { label: "Date", value: b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "—" },
                                  { label: "Status", value: "Paid / Settled" },
                                ],
                              },
                              {
                                title: "Receipt Confirmation",
                                notes: [
                                  "Payment has been received and confirmed.",
                                  "This receipt is generated by MediCore HMS.",
                                  "For queries: billing@medicore.com",
                                ],
                              },
                            ],
                            `Invoice_${b.billCode}.pdf`
                          );
                        }}>
                          <Download className="h-3.5 w-3.5" /> PDF
                        </Button>
                      )}
                    </td>
                  </motion.tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-16 text-muted-foreground">No bills found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Create Bill Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Receipt className="h-5 w-5 text-primary" />Create Invoice</DialogTitle>
            <DialogDescription>Generate a new bill for a patient.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Patient *</Label>
              <Select value={form.patientId} onValueChange={(v) => setForm({ ...form, patientId: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select patient…" /></SelectTrigger>
                <SelectContent>
                  {patients.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name} ({p.patientCode})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description *</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Consultation fee, lab tests…" className="mt-1.5" />
            </div>
            <div>
              <Label>Amount ($) *</Label>
              <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="150" className="mt-1.5" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={createBill} className="bg-gradient-primary text-white">Create Invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
