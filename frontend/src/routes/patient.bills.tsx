import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { patientNav } from "@/lib/roleNav";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Receipt, CheckCircle, AlertCircle, CreditCard, RefreshCw, Loader2, Download } from "lucide-react";
import { billAPI } from "@/lib/api/client";
import useApi from "@/hooks/useApi";
import { toast } from "sonner";
import { generateGenericPDF } from "@/lib/pdfGenerator";

export const Route = createFileRoute("/patient/bills")({
  head: () => ({ meta: [{ title: "My Bills — Patient Portal" }] }),
  component: PatientBillsScreen,
});

interface Bill {
  id: string;
  billCode: string;
  amount: number;
  description: string;
  status: "Paid" | "Unpaid";
  createdAt: string;
}

function PatientBillsScreen() {
  const { data: rawBills, loading, error, refetch } = useApi(() => billAPI.getAll());
  const bills = (rawBills as unknown as Bill[]) ?? [];

  const handlePay = async (code: string) => {
    try {
      await billAPI.pay(code);
      toast.success("Bill paid successfully");
      refetch();
    } catch {
      toast.error("Failed to process payment");
    }
  };

  const unpaid = bills.filter((b) => b.status === "Unpaid");
  const paid = bills.filter((b) => b.status === "Paid");
  const totalOutstanding = unpaid.reduce((sum, b) => sum + (b.amount ?? 0), 0);

  return (
    <AppShell role="patient" title="Patient Portal" nav={patientNav}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Invoices</h1>
          <p className="text-muted-foreground">Manage your clinic payments and medical ledger</p>
        </div>
        <Button variant="outline" size="sm" onClick={refetch} className="shrink-0">
          <RefreshCw className="h-3.5 w-3.5 mr-2" />Refresh
        </Button>
      </div>

      {/* Summary strips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
          className="rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white p-5 shadow-elevated">
          <div className="text-3xl font-bold">${totalOutstanding.toFixed(2)}</div>
          <div className="text-sm opacity-90 mt-1">Total Outstanding</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-5 shadow-elevated">
          <div className="text-3xl font-bold">{unpaid.length}</div>
          <div className="text-sm opacity-90 mt-1">Pending Invoices</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-5 shadow-elevated">
          <div className="text-3xl font-bold">{paid.length}</div>
          <div className="text-sm opacity-90 mt-1">Settled Invoices</div>
        </motion.div>
      </div>

      {loading && <div className="flex items-center justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
      {error && (
        <div className="text-center py-16 text-destructive">
          <AlertCircle className="h-8 w-8 mx-auto mb-3" />
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-6">
          {/* Outstanding Bills */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-gradient-card border border-border rounded-2xl shadow-card overflow-hidden">
            <div className="p-6 flex items-center gap-2">
              <Receipt className="h-5 w-5 text-rose-500" />
              <h3 className="font-semibold">Pending Payments</h3>
            </div>
            <div className="divide-y divide-border">
              {unpaid.map((b) => (
                <div key={b.id || b.billCode} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4 hover:bg-secondary/20 transition-colors">
                  <div>
                    <div className="font-semibold text-lg">{b.description}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Code: <span className="font-mono text-primary">{b.billCode}</span> • Issued: {new Date(b.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-xl font-bold">${b.amount.toFixed(2)}</div>
                    <Button onClick={() => handlePay(b.billCode)} className="bg-gradient-primary text-white shadow-glow">
                      <CreditCard className="h-4 w-4 mr-2" />Pay Now
                    </Button>
                  </div>
                </div>
              ))}
              {unpaid.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm flex flex-col items-center justify-center gap-2">
                  <CheckCircle className="h-8 w-8 text-emerald-500" />
                  No outstanding bills. You are all caught up!
                </div>
              )}
            </div>
          </motion.div>

          {/* Paid History */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-gradient-card border border-border rounded-2xl shadow-card overflow-hidden">
            <div className="p-6">
              <h3 className="font-semibold flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-500" /> Payment History
              </h3>
            </div>
            <div className="divide-y divide-border">
              {paid.map((b) => (
                <div key={b.id || b.billCode} className="flex items-center justify-between p-6 hover:bg-secondary/10 transition-colors">
                  <div>
                    <div className="font-medium text-muted-foreground line-through">{b.description}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Code: <span className="font-mono">{b.billCode}</span> • Settle Date: {new Date(b.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-muted-foreground">${b.amount.toFixed(2)}</span>
                    <Badge className="bg-emerald-100 text-emerald-700">Paid</Badge>
                    <Button size="sm" variant="ghost" className="h-8 gap-1 text-primary" onClick={() => {
                      toast.success(`Generating invoice PDF for ${b.billCode}...`);
                      generateGenericPDF(
                        `Tax Invoice — ${b.billCode}`,
                        "Hospital Billing Record",
                        [
                          {
                            title: "Invoice Details",
                            subtitle: `Bill Code: ${b.billCode} • Status: Paid`,
                            items: [
                              { label: "Bill Code", value: b.billCode },
                              { label: "Description", value: b.description },
                              { label: "Amount Charged", value: `$${b.amount.toFixed(2)}` },
                              { label: "Date", value: new Date(b.createdAt).toLocaleDateString() },
                              { label: "Payment Status", value: "Settled / Paid" },
                            ],
                          },
                          {
                            title: "Payment Confirmation",
                            notes: [
                              "This invoice has been fully settled.",
                              "Retain this document for your medical records.",
                              "For queries, contact billing@medicore.com",
                            ],
                          },
                        ],
                        `Invoice_${b.billCode}.pdf`
                      );
                    }}>
                      <Download className="h-3.5 w-3.5" /> PDF
                    </Button>
                  </div>
                </div>
              ))}
              {paid.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm">No paid invoices found.</div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AppShell>
  );
}
