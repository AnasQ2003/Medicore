import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { doctorNav } from "@/lib/roleNav";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CalendarOff, Plus, CheckCircle2, Clock, XCircle, Plane, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/doctor/leave")({
  head: () => ({ meta: [{ title: "Leave — Doctor" }] }),
  component: LeaveScreen,
});

type Leave = { id: string; from: string; to: string; days: number; type: string; status: "Approved" | "Pending" | "Rejected" | "Cancelled"; reason: string };

const seedLeaves: Leave[] = [
  { id: "L-12", from: "2026-06-22", to: "2026-06-24", days: 3, type: "Casual", status: "Approved", reason: "Family event" },
  { id: "L-11", from: "2026-05-10", to: "2026-05-10", days: 1, type: "Sick", status: "Approved", reason: "Flu" },
  { id: "L-10", from: "2026-04-15", to: "2026-04-18", days: 4, type: "Annual", status: "Approved", reason: "Vacation" },
  { id: "L-09", from: "2026-07-01", to: "2026-07-07", days: 7, type: "Annual", status: "Pending", reason: "Eid holidays" },
];

function LeaveScreen() {
  const [list, setList] = useState<Leave[]>(seedLeaves);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [type, setType] = useState("Casual");
  const [reason, setReason] = useState("");

  const days = (a: string, b: string) => {
    const da = new Date(a).getTime(); const db = new Date(b).getTime();
    return Math.max(1, Math.round((db - da) / 86400000) + 1);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to || !reason) return toast.error("Please fill all fields");
    const id = `L-${13 + list.length}`;
    setList([{ id, from, to, days: days(from, to), type, status: "Pending", reason }, ...list]);
    toast.success("Leave application submitted for approval");
    setFrom(""); setTo(""); setReason("");
  };
  const cancelPending = (l: Leave) => {
    setList(list.map(x => x.id === l.id ? { ...x, status: "Cancelled" } : x));
    toast.success(`${l.id} cancelled`);
  };
  const remove = (l: Leave) => { setList(list.filter(x => x.id !== l.id)); toast.success("Removed"); };

  return (
    <AppShell role="doctor" title="Doctor" nav={doctorNav}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3"><CalendarOff className="h-7 w-7 text-amber-500"/>Leave Management</h1>
        <p className="text-muted-foreground">Apply for leave, track approvals, and cancel pending requests.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Annual quota", value: "21d", icon: Plane, c: "from-blue-500 to-cyan-500" },
          { label: "Used", value: `${list.filter(l=>l.status==="Approved").reduce((s,l)=>s+l.days,0)}d`, icon: CheckCircle2, c: "from-emerald-500 to-teal-500" },
          { label: "Pending", value: String(list.filter(l=>l.status==="Pending").length), icon: Clock, c: "from-amber-500 to-orange-500" },
          { label: "Remaining", value: `${Math.max(0, 21 - list.filter(l=>l.status==="Approved").reduce((s,l)=>s+l.days,0))}d`, icon: CalendarOff, c: "from-violet-500 to-purple-600" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${s.c} text-white p-5 shadow-elevated`}>
            <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-white/20 blur-2xl"/>
            <s.icon className="h-5 w-5 opacity-80"/>
            <div className="text-3xl font-bold mt-3">{s.value}</div>
            <div className="text-xs uppercase tracking-wider opacity-90 mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.form initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} onSubmit={submit}
          className="bg-gradient-card border rounded-2xl p-6 shadow-card space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2"><Plus className="h-5 w-5 text-primary"/>Apply for Leave</h3>
          <div><Label htmlFor="from">From</Label><Input id="from" type="date" value={from} onChange={e=>setFrom(e.target.value)} className="mt-1.5"/></div>
          <div><Label htmlFor="to">To</Label><Input id="to" type="date" value={to} onChange={e=>setTo(e.target.value)} className="mt-1.5"/></div>
          <div>
            <Label>Type</Label>
            <select value={type} onChange={e => setType(e.target.value)} className="mt-1.5 w-full h-10 rounded-lg border bg-background px-3 text-sm">
              <option>Casual</option><option>Sick</option><option>Annual</option><option>Emergency</option><option>Maternity</option><option>Bereavement</option>
            </select>
          </div>
          <div>
            <Label htmlFor="reason">Reason</Label>
            <textarea id="reason" value={reason} onChange={e=>setReason(e.target.value)} rows={3}
              className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2 text-sm" placeholder="Brief reason for leave"/>
          </div>
          {from && to && <div className="text-xs text-muted-foreground">Duration: <b>{days(from, to)} day(s)</b></div>}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => { setFrom(""); setTo(""); setReason(""); }} className="flex-1">Reset</Button>
            <Button type="submit" className="flex-1 bg-gradient-primary text-white">Submit</Button>
          </div>
        </motion.form>

        <div className="lg:col-span-2 space-y-3">
          <h3 className="font-semibold">Leave History</h3>
          <AnimatePresence>
            {list.map((l, i) => (
              <motion.div key={l.id} layout
                initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0, x:-30, height:0}}
                transition={{delay:i*0.05}}
                className="flex items-center gap-4 bg-white border rounded-2xl p-4 shadow-card">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-glow ${
                  l.status === "Approved" ? "bg-gradient-green" : l.status === "Pending" ? "bg-gradient-sunset" : "bg-gradient-red"
                }`}>
                  {l.status === "Approved" ? <CheckCircle2 className="h-5 w-5"/> : l.status === "Pending" ? <Clock className="h-5 w-5"/> : <XCircle className="h-5 w-5"/>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{l.from} → {l.to}</span>
                    <Badge variant="outline">{l.days} day{l.days>1?"s":""}</Badge>
                    <Badge variant="secondary">{l.type}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{l.reason} • {l.id}</div>
                </div>
                <Badge className={
                  l.status === "Approved" ? "bg-emerald-100 text-emerald-700" :
                  l.status === "Pending" ? "bg-amber-100 text-amber-700" :
                  l.status === "Cancelled" ? "bg-slate-100 text-slate-700" :
                  "bg-rose-100 text-rose-700"
                }>{l.status}</Badge>
                <div className="flex gap-1">
                  {l.status === "Pending" && (
                    <Button size="icon" variant="outline" title="Cancel request" onClick={() => cancelPending(l)}><X className="h-3.5 w-3.5"/></Button>
                  )}
                  <Button size="icon" variant="outline" title="Delete" onClick={() => remove(l)} className="text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5"/></Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </AppShell>
  );
}
