import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { patientNav } from "@/lib/roleNav";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Receipt, CheckCircle, AlertCircle, CreditCard, RefreshCw, Loader2, Download,
  Plus, Trash2, ShieldCheck, MapPin, Navigation, Clock, Calendar, Car, Sparkles, Smartphone
} from "lucide-react";
import { billAPI } from "@/lib/api/client";
import useApi from "@/hooks/useApi";
import { useState } from "react";
import { toast } from "sonner";
import { generateGenericPDF } from "@/lib/pdfGenerator";

export const Route = createFileRoute("/patient/bills")({
  head: () => ({ meta: [{ title: "Billing & Payment Portal — Patient" }] }),
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

interface SavedCard {
  id: string;
  cardHolder: string;
  cardNumber: string; // masked
  expiry: string;
  type: "Visa" | "MasterCard" | "JazzCash" | "EasyPaisa";
  isDefault: boolean;
}

function PatientBillsScreen() {
  const { data: rawBills, loading, error, refetch } = useApi(() => billAPI.getAll());
  const bills = (rawBills as unknown as Bill[]) ?? [
    { id: "b1", billCode: "INV-8921", amount: 2500, description: "Cardiology Specialist Consultation", status: "Unpaid", createdAt: "2026-08-01" },
    { id: "b2", billCode: "INV-7814", amount: 4200, description: "Full Blood Panel & Cholesterol Lab Test", status: "Paid", createdAt: "2026-07-28" }
  ];

  // Payment Plan Mode
  const [billingPlan, setBillingPlan] = useState<"Prepaid" | "Postpaid">("Postpaid");
  
  // Saved Cards state
  const [cards, setCards] = useState<SavedCard[]>([
    { id: "c1", cardHolder: "Muhammad Usama", cardNumber: "•••• •••• •••• 4242", expiry: "09/28", type: "Visa", isDefault: true },
    { id: "c2", cardHolder: "Muhammad Usama", cardNumber: "+92 300 •••• 889", expiry: "N/A", type: "JazzCash", isDefault: false }
  ]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({ cardHolder: "", cardNumber: "", expiry: "", type: "Visa" as SavedCard["type"] });

  // Home Visit Appointment State
  const [homeVisitForm, setHomeVisitForm] = useState({
    address: "House 45, Street 12, F-8/2, Islamabad",
    serviceType: "Doctor Home Consultation",
    date: "2026-08-05",
    time: "10:00 AM",
    notes: ""
  });
  const [isBookingHome, setIsBookingHome] = useState(false);

  const handleAddCard = () => {
    if (!newCard.cardHolder || !newCard.cardNumber) return toast.error("Enter card details");
    const card: SavedCard = {
      id: `c-${Date.now()}`,
      cardHolder: newCard.cardHolder,
      cardNumber: `•••• •••• •••• ${newCard.cardNumber.slice(-4) || '9999'}`,
      expiry: newCard.expiry || "12/29",
      type: newCard.type,
      isDefault: false
    };
    setCards((prev) => [...prev, card]);
    setShowAddCard(false);
    setNewCard({ cardHolder: "", cardNumber: "", expiry: "", type: "Visa" });
    toast.success("Payment card saved securely!");
  };

  const handleRemoveCard = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
    toast.info("Payment method removed");
  };

  const handleBookHomeVisit = () => {
    setIsBookingHome(true);
    setTimeout(() => {
      setIsBookingHome(false);
      toast.success("Home visit requested!", {
        description: `Doctor dispatched to ${homeVisitForm.address} for ${homeVisitForm.date} at ${homeVisitForm.time}. ETA: 25 mins.`
      });
    }, 1200);
  };

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
          <h1 className="text-3xl font-bold tracking-tight">Billing & Payment Hub</h1>
          <p className="text-muted-foreground">Manage your invoices, cards, prepaid plans, and home visits</p>
        </div>
        <Button variant="outline" size="sm" onClick={refetch} className="shrink-0">
          <RefreshCw className="h-3.5 w-3.5 mr-2" />Refresh Ledger
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
          className="rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white p-5 shadow-elevated">
          <div className="text-3xl font-extrabold">PKR {totalOutstanding.toLocaleString()}</div>
          <div className="text-sm opacity-90 mt-1">Total Outstanding Balance</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-5 shadow-elevated">
          <div className="text-3xl font-extrabold">{unpaid.length} Invoices</div>
          <div className="text-sm opacity-90 mt-1">Pending Due Payments</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-5 shadow-elevated">
          <div className="text-3xl font-extrabold">{billingPlan} Plan</div>
          <div className="text-sm opacity-90 mt-1 flex items-center justify-between">
            <span>Active Payment Account</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setBillingPlan(billingPlan === "Prepaid" ? "Postpaid" : "Prepaid")}
              className="h-6 text-[10px] bg-white/20 hover:bg-white/30 border-white/40 text-white px-2"
            >
              Switch to {billingPlan === "Prepaid" ? "Postpaid" : "Prepaid"}
            </Button>
          </div>
        </motion.div>
      </div>

      {/* MAIN BILLING TABS */}
      <Tabs defaultValue="invoices" className="w-full space-y-6">
        <TabsList className="bg-slate-900 border border-slate-800 p-1 rounded-xl w-full justify-start">
          <TabsTrigger value="invoices" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            Invoices & Payment History
          </TabsTrigger>
          <TabsTrigger value="cards" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            Saved Cards & Wallets
          </TabsTrigger>
          <TabsTrigger value="home-visit" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white flex items-center gap-1.5">
            <Car className="h-4 w-4 text-emerald-400" /> Book Home Visit & GPS Map
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: INVOICES LIST */}
        <TabsContent value="invoices" className="space-y-6">
          {/* Pending Invoices */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-gradient-card border border-border rounded-2xl shadow-card overflow-hidden">
            <div className="p-6 flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2 text-rose-500">
                <Receipt className="h-5 w-5" /> Pending Unpaid Invoices ({unpaid.length})
              </h3>
            </div>
            <div className="divide-y divide-border">
              {unpaid.map((b) => (
                <div key={b.id || b.billCode} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4 hover:bg-secondary/20 transition-colors">
                  <div>
                    <div className="font-semibold text-lg">{b.description}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Code: <span className="font-mono text-primary">{b.billCode}</span> • Issued: {b.createdAt}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-xl font-bold text-rose-400">PKR {b.amount.toLocaleString()}</div>
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

          {/* Settled Invoices */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-gradient-card border border-border rounded-2xl shadow-card overflow-hidden">
            <div className="p-6">
              <h3 className="font-semibold flex items-center gap-2 text-emerald-500">
                <CheckCircle className="h-5 w-5" /> Settled Payment Ledger
              </h3>
            </div>
            <div className="divide-y divide-border">
              {paid.map((b) => (
                <div key={b.id || b.billCode} className="flex items-center justify-between p-6 hover:bg-secondary/10 transition-colors">
                  <div>
                    <div className="font-medium text-muted-foreground">{b.description}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Code: <span className="font-mono">{b.billCode}</span> • Settle Date: {b.createdAt}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-emerald-400">PKR {b.amount.toLocaleString()}</span>
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
                              { label: "Amount Charged", value: `PKR ${b.amount.toLocaleString()}` },
                              { label: "Date", value: b.createdAt },
                              { label: "Payment Status", value: "Settled / Paid" },
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
            </div>
          </motion.div>
        </TabsContent>

        {/* TAB 2: SAVED CARDS & WALLETS */}
        <TabsContent value="cards" className="space-y-6">
          <div className="bg-gradient-card border border-border p-6 rounded-2xl shadow-card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-emerald-500" />
                  Saved Payment Methods & Cards
                </h3>
                <p className="text-xs text-muted-foreground">Manage your credit cards and mobile wallets for quick one-click payments.</p>
              </div>

              <Button onClick={() => setShowAddCard(!showAddCard)} className="bg-gradient-primary text-white">
                <Plus className="h-4 w-4 mr-1" /> Add Payment Method
              </Button>
            </div>

            {/* Add Card Form */}
            {showAddCard && (
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3 mb-6">
                <h4 className="text-sm font-bold text-white">Add New Card or Mobile Wallet</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs text-slate-400">Account Holder Name</Label>
                    <Input
                      placeholder="e.g. Muhammad Usama"
                      value={newCard.cardHolder}
                      onChange={(e) => setNewCard((f) => ({ ...f, cardHolder: e.target.value }))}
                      className="mt-1 bg-slate-950 border-slate-800 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400">Card / Account Number</Label>
                    <Input
                      placeholder="4242 •••• •••• 4242"
                      value={newCard.cardNumber}
                      onChange={(e) => setNewCard((f) => ({ ...f, cardNumber: e.target.value }))}
                      className="mt-1 bg-slate-950 border-slate-800 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400">Payment Type</Label>
                    <select
                      value={newCard.type}
                      onChange={(e) => setNewCard((f) => ({ ...f, type: e.target.value as any }))}
                      className="mt-1 w-full bg-slate-950 border border-slate-800 text-white rounded-md h-9 px-3 text-sm"
                    >
                      <option value="Visa">Visa Credit/Debit</option>
                      <option value="MasterCard">MasterCard</option>
                      <option value="JazzCash">JazzCash Wallet</option>
                      <option value="EasyPaisa">EasyPaisa Wallet</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={() => setShowAddCard(false)}>Cancel</Button>
                  <Button size="sm" onClick={handleAddCard} className="bg-emerald-600 text-white">Save Method</Button>
                </div>
              </div>
            )}

            {/* Saved Cards Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cards.map((c) => (
                <div key={c.id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between hover:border-emerald-500/40 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                      {c.type === "JazzCash" || c.type === "EasyPaisa" ? <Smartphone className="h-6 w-6" /> : <CreditCard className="h-6 w-6" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">{c.type}</span>
                        {c.isDefault && <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">Default</Badge>}
                      </div>
                      <p className="font-mono text-sm text-slate-300 mt-0.5">{c.cardNumber}</p>
                      <p className="text-xs text-slate-500">{c.cardHolder} • Exp: {c.expiry}</p>
                    </div>
                  </div>

                  <Button size="sm" variant="ghost" onClick={() => handleRemoveCard(c.id)} className="text-rose-400 hover:text-rose-500 hover:bg-rose-500/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: HOME VISIT BOOKING & LOCATION MAP */}
        <TabsContent value="home-visit" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Form */}
            <div className="bg-gradient-card border border-border p-6 rounded-2xl shadow-card space-y-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Navigation className="h-5 w-5 text-emerald-500" />
                Book Doctor / Nurse Home Consultation
              </h3>
              <p className="text-xs text-muted-foreground">Request a specialist visit directly to your home address.</p>

              <div className="space-y-3">
                <div>
                  <Label>Saved Home Address</Label>
                  <Input
                    value={homeVisitForm.address}
                    onChange={(e) => setHomeVisitForm((f) => ({ ...f, address: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Preferred Date</Label>
                    <Input
                      type="date"
                      value={homeVisitForm.date}
                      onChange={(e) => setHomeVisitForm((f) => ({ ...f, date: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Time Slot</Label>
                    <Input
                      value={homeVisitForm.time}
                      onChange={(e) => setHomeVisitForm((f) => ({ ...f, time: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Clinical Notes for Visiting Doctor</Label>
                  <Input
                    placeholder="e.g. High fever, difficulty traveling..."
                    value={homeVisitForm.notes}
                    onChange={(e) => setHomeVisitForm((f) => ({ ...f, notes: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                <Button
                  onClick={handleBookHomeVisit}
                  disabled={isBookingHome}
                  className="w-full bg-gradient-primary text-white shadow-glow font-bold mt-2"
                >
                  {isBookingHome ? "Dispatching Medical Unit..." : "Confirm & Dispatch Visiting Doctor"}
                </Button>
              </div>
            </div>

            {/* Simulated Live Location Map Visualizer */}
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-400" />
                    Live Route & GPS Destination Map
                  </h4>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    GPS TRACKER 📍
                  </Badge>
                </div>

                {/* Simulated Map Visualizer Box */}
                <div className="h-48 w-full bg-slate-900 rounded-xl border border-slate-800 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
                  <div className="relative z-10 text-center space-y-2 p-4">
                    <div className="h-10 w-10 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-bounce">
                      <Car className="h-6 w-6" />
                    </div>
                    <p className="text-xs font-mono text-emerald-400 font-bold">DISPATCHED MEDICAL UNIT #4</p>
                    <p className="text-[11px] text-slate-400">Destination: {homeVisitForm.address}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-3 text-center">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400">Distance</span>
                  <p className="text-lg font-extrabold text-white">4.8 km</p>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400">Est. Arrival (ETA)</span>
                  <p className="text-lg font-extrabold text-emerald-400">22 mins</p>
                </div>
              </div>
            </div>

          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
