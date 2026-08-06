import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { doctorNav } from "@/lib/roleNav";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import {
  DollarSign, TrendingUp, CheckCircle2, Clock, Download, Search, Filter,
  ArrowUpRight, Wallet, CreditCard, FileText, Send, ChevronRight, CircleDollarSign, BadgeDollarSign, Sparkles
} from "lucide-react";
import { useState } from "react";
import { getUser } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/doctor/charges")({
  head: () => ({ meta: [{ title: "Charges & Earnings — Doctor" }] }),
  component: DoctorChargesScreen,
});

// Mock monthly earnings breakdown
const MONTHLY_EARNINGS = [
  { month: "Jan", consultations: 42, earnings: 126000, sessions: 42, avg: 3000 },
  { month: "Feb", consultations: 48, earnings: 144000, sessions: 48, avg: 3000 },
  { month: "Mar", consultations: 55, earnings: 169400, sessions: 55, avg: 3080 },
  { month: "Apr", consultations: 50, earnings: 155000, sessions: 50, avg: 3100 },
  { month: "May", consultations: 62, earnings: 198400, sessions: 62, avg: 3200 },
  { month: "Jun", consultations: 68, earnings: 224400, sessions: 68, avg: 3300 },
  { month: "Jul", consultations: 71, earnings: 241400, sessions: 71, avg: 3400 },
];

// Mock transaction ledger
const MOCK_TRANSACTIONS = [
  { id: "TXN-7041", date: "2026-07-28", patient: "Ahmed Ali", type: "Consultation", amount: 3500, status: "Paid", mode: "Cash" },
  { id: "TXN-7042", date: "2026-07-27", patient: "Fatima Noor", type: "Follow-up", amount: 2500, status: "Paid", mode: "Bank Transfer" },
  { id: "TXN-7043", date: "2026-07-25", patient: "Hassan Raza", type: "Tele-consult", amount: 2000, status: "Pending", mode: "Online" },
  { id: "TXN-7044", date: "2026-07-23", patient: "Bilal Khan", type: "Consultation", amount: 3500, status: "Paid", mode: "Credit Card" },
  { id: "TXN-7045", date: "2026-07-22", patient: "Ayesha Tariq", type: "Emergency Review", amount: 5000, status: "Paid", mode: "Cash" },
  { id: "TXN-7046", date: "2026-07-20", patient: "Sara Malik", type: "Lab Review", amount: 2000, status: "Pending", mode: "Online" },
  { id: "TXN-7047", date: "2026-07-19", patient: "Zara Malik", type: "Consultation", amount: 3500, status: "Paid", mode: "Bank Transfer" },
  { id: "TXN-7048", date: "2026-07-18", patient: "Mohammad Usman", type: "Follow-up", amount: 2500, status: "Paid", mode: "Cash" },
  { id: "TXN-7049", date: "2026-07-16", patient: "Sana Tariq", type: "Consultation", amount: 3500, status: "Cancelled", mode: "Online" },
  { id: "TXN-7050", date: "2026-07-15", patient: "Ahmed Ali", type: "ECG Evaluation", amount: 4000, status: "Paid", mode: "Credit Card" },
  { id: "TXN-7051", date: "2026-07-12", patient: "Hassan Raza", type: "Post-Op Review", amount: 3000, status: "Paid", mode: "Bank Transfer" },
  { id: "TXN-7052", date: "2026-07-10", patient: "Bilal Khan", type: "Tele-consult", amount: 2000, status: "Paid", mode: "Online" },
];

const currentFeeStructure = [
  { type: "Standard Consultation", fee: 3500 },
  { type: "Follow-up Visit", fee: 2500 },
  { type: "Tele-consult (Video)", fee: 2000 },
  { type: "Emergency/Critical Review", fee: 5000 },
  { type: "Diagnostic Lab Review", fee: 2000 },
  { type: "Procedure (Minor)", fee: 8000 },
  { type: "Procedure (Major)", fee: 15000 },
];

function DoctorChargesScreen() {
  const user = getUser();
  const doctorName = user?.name || "Dr. Sarah Ali";

  const [searchQ, setSearchQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [chartPeriod, setChartPeriod] = useState<"3m" | "6m" | "ytd">("6m");
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({
    requestedFee: "4000",
    reason: "",
    effectiveDate: "",
    additionalNotes: "",
  });

  // Metrics
  const totalEarnings = MONTHLY_EARNINGS.reduce((s, m) => s + m.earnings, 0);
  const thisMonthEarnings = MONTHLY_EARNINGS[MONTHLY_EARNINGS.length - 1].earnings;
  const prevMonthEarnings = MONTHLY_EARNINGS[MONTHLY_EARNINGS.length - 2].earnings;
  const monthlyGrowth = (((thisMonthEarnings - prevMonthEarnings) / prevMonthEarnings) * 100).toFixed(1);
  const totalConsultations = MONTHLY_EARNINGS.reduce((s, m) => s + m.consultations, 0);
  const pendingAmt = MOCK_TRANSACTIONS.filter(t => t.status === "Pending").reduce((s, t) => s + t.amount, 0);
  const avgFeePerSession = Math.round(totalEarnings / totalConsultations);

  // Chart data based on period
  const chartData = chartPeriod === "3m" ? MONTHLY_EARNINGS.slice(-3) :
                    chartPeriod === "6m" ? MONTHLY_EARNINGS.slice(-6) :
                    MONTHLY_EARNINGS;

  // Filtered transaction list
  const filteredTxns = MOCK_TRANSACTIONS.filter(t => {
    const matchSearch = t.patient.toLowerCase().includes(searchQ.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQ.toLowerCase()) ||
      t.type.toLowerCase().includes(searchQ.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status.toLowerCase() === statusFilter;
    const matchType = typeFilter === "all" || t.type.toLowerCase().includes(typeFilter.toLowerCase());
    return matchSearch && matchStatus && matchType;
  });

  const handlePayRaiseSubmit = () => {
    if (!requestForm.reason.trim()) return toast.error("Please provide a reason for the request.");
    if (!requestForm.effectiveDate) return toast.error("Please specify a requested effective date.");

    // Save notification to admin (simulated)
    const key = `medicore_user_notifications_admin@medicore.app`;
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    localStorage.setItem(key, JSON.stringify([
      {
        id: `notif-${Date.now()}`,
        type: "pay-raise",
        title: `Fee Revision Request — ${doctorName}`,
        body: `${doctorName} has requested a consultation fee revision from PKR 3,500 to PKR ${Number(requestForm.requestedFee).toLocaleString()} effective ${requestForm.effectiveDate}. Reason: ${requestForm.reason}`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        unread: true,
      },
      ...existing,
    ]));

    toast.success("Fee Revision Request Submitted!", {
      description: "Your request has been forwarded to Super Admin for review. You will be notified upon approval.",
    });
    setRequestOpen(false);
    setRequestForm({ requestedFee: "4000", reason: "", effectiveDate: "", additionalNotes: "" });
  };

  const downloadStatement = () => {
    toast.success("Generating Earnings Statement PDF...", {
      description: `Detailed statement for ${doctorName} is being prepared.`,
    });
  };

  return (
    <AppShell role="doctor" title="Doctor" nav={doctorNav}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <CircleDollarSign className="h-7 w-7 text-primary" />
            Charges & Earnings Statement
          </h1>
          <p className="text-muted-foreground mt-1">Your personal consultation fee ledger, monthly income breakdown, and payment records.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadStatement}>
            <Download className="h-4 w-4 mr-2" /> Export PDF
          </Button>
          <Button onClick={() => setRequestOpen(true)} className="bg-gradient-primary text-white shadow-glow font-semibold">
            <ArrowUpRight className="h-4 w-4 mr-2" /> Request Fee Revision
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "YTD Earnings", value: `PKR ${(totalEarnings / 1000).toFixed(0)}K`, icon: Wallet, c: "from-emerald-500 to-teal-600", sub: `${totalConsultations} consultations` },
          { label: "This Month", value: `PKR ${(thisMonthEarnings / 1000).toFixed(0)}K`, icon: TrendingUp, c: "from-blue-500 to-cyan-600", sub: `+${monthlyGrowth}% vs last month` },
          { label: "Avg Per Session", value: `PKR ${avgFeePerSession.toLocaleString()}`, icon: BadgeDollarSign, c: "from-violet-500 to-purple-600", sub: "Standard consultation" },
          { label: "Pending Clearance", value: `PKR ${pendingAmt.toLocaleString()}`, icon: Clock, c: "from-amber-500 to-orange-600", sub: `${MOCK_TRANSACTIONS.filter(t => t.status === "Pending").length} transactions` },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4 }}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${kpi.c} text-white p-5 shadow-elevated`}
          >
            <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-white/20 blur-2xl" />
            <kpi.icon className="h-5 w-5 opacity-80" />
            <div className="text-2xl font-black mt-3">{kpi.value}</div>
            <div className="text-xs font-bold uppercase tracking-wider opacity-90 mt-0.5">{kpi.label}</div>
            <div className="text-[11px] opacity-75 mt-1">{kpi.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts + Fee Structure */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Monthly Earnings Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-gradient-card border border-border rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" /> Monthly Income Trend
              </h3>
              <p className="text-xs text-muted-foreground">Consultation earnings over time</p>
            </div>
            <div className="flex gap-1 bg-secondary/60 p-1 rounded-xl text-xs">
              {(["3m", "6m", "ytd"] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setChartPeriod(p)}
                  className={`px-3 py-1 rounded-lg font-semibold capitalize transition-all ${chartPeriod === p ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="month" fontSize={11} />
              <YAxis fontSize={11} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", backgroundColor: "var(--popover)", color: "var(--popover-foreground)" }}
                formatter={(val: any) => [`PKR ${Number(val).toLocaleString()}`, "Earnings"]}
              />
              <Bar dataKey="earnings" fill="url(#earningsGrad)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#0d9488" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Current Fee Structure */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-gradient-card border border-border rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" /> Fee Structure
            </h3>
            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs">Approved</Badge>
          </div>
          <div className="space-y-2">
            {currentFeeStructure.map(f => (
              <div key={f.type} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                <span className="text-xs font-medium text-muted-foreground">{f.type}</span>
                <span className="font-bold text-sm text-foreground">PKR {f.fee.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <Button
            onClick={() => setRequestOpen(true)}
            variant="outline"
            className="w-full mt-4 text-xs border-primary/30 text-primary hover:bg-primary/5"
          >
            <ArrowUpRight className="h-3.5 w-3.5 mr-1.5" /> Request Fee Revision
          </Button>
        </motion.div>
      </div>

      {/* Transaction Ledger */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-gradient-card border border-border rounded-2xl p-6 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Transaction Ledger
          </h3>
          <div className="flex flex-wrap gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="Search patient, ID, type..."
                className="pl-8 h-8 text-xs w-48"
              />
            </div>
            {/* Status filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 text-xs w-32">
                <Filter className="h-3 w-3 mr-1.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-border/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/40 text-left border-b border-border">
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ref ID</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Patient</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Service</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mode</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Amount</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredTxns.map((txn, i) => (
                  <motion.tr
                    key={txn.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-border/30 hover:bg-secondary/20 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{txn.id}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{txn.date}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-gradient-primary text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {txn.patient[0]}
                        </div>
                        <span className="font-medium text-sm">{txn.patient}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{txn.type}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs">{txn.mode}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-sm">
                      PKR {txn.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={`text-xs ${
                        txn.status === "Paid" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" :
                        txn.status === "Pending" ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse" :
                        "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                      }`}>
                        {txn.status === "Paid" && <CheckCircle2 className="h-3 w-3 mr-1 inline" />}
                        {txn.status}
                      </Badge>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filteredTxns.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground text-sm">
                    No transactions found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Ledger summary footer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            Showing {filteredTxns.length} of {MOCK_TRANSACTIONS.length} transactions
          </p>
          <div className="flex items-center gap-4 text-sm font-semibold">
            <span className="text-muted-foreground">Filtered Total:</span>
            <span className="text-emerald-600 dark:text-emerald-400">
              PKR {filteredTxns.filter(t => t.status === "Paid").reduce((s, t) => s + t.amount, 0).toLocaleString()}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Fee Revision Request Modal */}
      <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
        <DialogContent className="max-w-md w-full mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Request Fee Revision
            </DialogTitle>
            <DialogDescription>
              Submit a formal request to Super Admin for a consultation fee revision. All changes are subject to approval.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
            {/* Current vs Requested */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-secondary/40 rounded-xl border border-border/50">
              <div className="text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Current Fee</div>
                <div className="text-2xl font-black text-muted-foreground mt-1">PKR 3,500</div>
                <div className="text-xs text-muted-foreground">Per consultation</div>
              </div>
              <div className="text-center border-l border-border/60">
                <div className="text-xs text-primary uppercase tracking-wider font-bold">Requesting</div>
                <div className="text-2xl font-black text-primary mt-1">
                  PKR {Number(requestForm.requestedFee || 0).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Per consultation</div>
              </div>
            </div>

            <div>
              <Label>Requested Consultation Fee (PKR)</Label>
              <Input
                type="number"
                min={3500}
                value={requestForm.requestedFee}
                onChange={e => setRequestForm({ ...requestForm, requestedFee: e.target.value })}
                placeholder="e.g. 4000"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Effective From Date</Label>
              <Input
                type="date"
                value={requestForm.effectiveDate}
                onChange={e => setRequestForm({ ...requestForm, effectiveDate: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Reason for Revision <span className="text-rose-500">*</span></Label>
              <textarea
                rows={3}
                value={requestForm.reason}
                onChange={e => setRequestForm({ ...requestForm, reason: e.target.value })}
                placeholder="e.g. Increased patient load, inflation adjustment, additional certifications..."
                className="mt-1.5 w-full rounded-lg border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div>
              <Label>Additional Supporting Notes</Label>
              <textarea
                rows={2}
                value={requestForm.additionalNotes}
                onChange={e => setRequestForm({ ...requestForm, additionalNotes: e.target.value })}
                placeholder="Any supporting context or documentation references..."
                className="mt-1.5 w-full rounded-lg border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="text-xs text-muted-foreground bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 p-3 rounded-xl">
              ℹ️ Your request will be reviewed by Super Admin within 3–5 working days. You will receive a notification upon decision.
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestOpen(false)}>Cancel</Button>
            <Button onClick={handlePayRaiseSubmit} className="bg-gradient-primary text-white font-semibold">
              <Send className="h-4 w-4 mr-2" /> Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
