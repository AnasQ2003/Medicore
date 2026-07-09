import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { doctorNav } from "@/lib/doctorNav";
import { appointments as seed, patients } from "@/lib/mockData";
import { appointmentAPI, patientAPI } from "@/lib/api/client";
import useApi from "@/hooks/useApi";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Search, Plus, Video, MapPin, Phone, CheckCircle2, Clock, MoreHorizontal, XCircle, Pencil, Clock4, Trash2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export const Route = createFileRoute("/doctor/appointments")({
  head: () => ({ meta: [{ title: "Appointments — Doctor" }] }),
  component: AppointmentsScreen,
});

type Appt = (typeof seed)[number];

function AppointmentsScreen() {
  const [q, setQ] = useState("");
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<Appt | null>(null);
  const [delaying, setDelaying] = useState<Appt | null>(null);
  const [delayMin, setDelayMin] = useState(15);
  const [form, setForm] = useState({ patientId: patients[0].id, time: "10:00", reason: "", type: "In-person" });

  // Live data from backend; fall back to seed while loading
  const { data: apiAppts, loading, refetch } = useApi(() => appointmentAPI.getAll());
  const { data: apiPatients } = useApi(() => patientAPI.getAll());
  const list: Appt[] = (apiAppts as unknown as Appt[]) ?? seed;
  const patientList = (apiPatients as unknown as typeof patients) ?? patients;

  const filtered = list.filter(a => a.patient.toLowerCase().includes(q.toLowerCase()) || a.reason.toLowerCase().includes(q.toLowerCase()));

  const create = async () => {
    const p = patientList.find((x) => String(x.id) === String(form.patientId)) ?? patients.find((x) => x.id === form.patientId);
    if (!p) return;
    if (!form.reason) return toast.error("Add a reason");
    try {
      await appointmentAPI.book({ patientId: Number(p.id), time: form.time, reason: form.reason, type: form.type });
      toast.success(`Booked ${p.name} at ${form.time}`);
      refetch();
    } catch { toast.error("Failed to book appointment"); }
    setDialog(false);
    setForm({ patientId: patients[0].id, time: "10:00", reason: "", type: "In-person" });
  };

  const cancel = async (a: Appt) => {
    try {
      await appointmentAPI.updateStatus(a.id, "Cancelled");
      toast.success(`Cancelled ${a.patient}'s appointment`, { description: "Patient notified." });
      refetch();
    } catch { toast.error("Failed to cancel"); }
  };
  const remove = async (a: Appt) => {
    try {
      await appointmentAPI.delete(a.id);
      toast.success("Appointment removed");
      refetch();
    } catch { toast.error("Failed to remove"); }
  };
  const complete = async (a: Appt) => {
    try {
      await appointmentAPI.updateStatus(a.id, "Completed");
      toast.success(`Marked ${a.patient} as completed`);
      refetch();
    } catch { toast.error("Failed to update"); }
  };
  const saveEdit = async () => {
    if (!editing) return;
    try {
      await appointmentAPI.updateStatus(editing.id, editing.status);
      toast.success("Appointment updated");
      refetch();
    } catch { toast.error("Failed to update"); }
    setEditing(null);
  };
  const applyDelay = async () => {
    if (!delaying) return;
    const [h, m] = delaying.time.split(":").map(Number);
    const total = h * 60 + m + delayMin;
    const nh = Math.floor((total / 60) % 24).toString().padStart(2, "0");
    const nm = (total % 60).toString().padStart(2, "0");
    const newTime = `${nh}:${nm}`;
    try {
      await appointmentAPI.updateStatus(delaying.id, "Delayed", newTime);
      toast.success(`Delayed by ${delayMin} min`, { description: `${delaying.patient} → ${newTime}` });
      refetch();
    } catch { toast.error("Failed to delay"); }
    setDelaying(null);
  };

  const stats = [
    { label: "Today", value: list.length, c: "from-blue-500 to-cyan-500", icon: Calendar },
    { label: "Confirmed", value: list.filter(a => a.status === "Confirmed").length, c: "from-emerald-500 to-teal-500", icon: CheckCircle2 },
    { label: "Pending", value: list.filter(a => a.status === "Pending").length, c: "from-amber-500 to-orange-500", icon: Clock },
    { label: "Completed", value: list.filter(a => a.status === "Completed").length, c: "from-violet-500 to-purple-500", icon: CheckCircle2 },
  ];

  return (
    <AppShell role="doctor" title="Doctor" nav={doctorNav}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">Manage your schedule — cancel, edit or delay any visit.</p>
        </div>
        <Dialog open={dialog} onOpenChange={setDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary text-white shadow-glow"><Plus className="h-4 w-4 mr-2"/>New Appointment</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Book new appointment</DialogTitle>
              <DialogDescription>Pick a patient and slot. They'll be notified by email & SMS.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Patient</Label>
                <Select value={form.patientId} onValueChange={(v) => setForm({ ...form, patientId: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} • {p.id}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Time</Label>
                  <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="mt-1.5" />
                </div>
                <div>
                  <Label>Mode</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="In-person">In-person</SelectItem>
                      <SelectItem value="Tele-consult">Tele-consult</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Reason</Label>
                <Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="e.g. Follow-up — Hypertension" className="mt-1.5" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialog(false)}>Cancel</Button>
              <Button onClick={create} className="bg-gradient-primary text-white">Book appointment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{opacity:0, y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}
            whileHover={{ y: -4 }}
            className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${s.c} text-white shadow-elevated`}>
            <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-white/20 blur-2xl"/>
            <s.icon className="h-5 w-5 opacity-80"/>
            <div className="text-3xl font-bold mt-3">{s.value}</div>
            <div className="text-xs uppercase tracking-wider opacity-90 mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="bg-gradient-card border border-border rounded-2xl p-5 shadow-card">
        <Tabs defaultValue="today">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <TabsList>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
              <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search patient or reason…" className="pl-9 w-full sm:w-72"/>
            </div>
          </div>

          <TabsContent value="today" className="space-y-3">
            {filtered.map((a, i) => {
              const p = patients.find((x) => x.id === a.patientId);
              const gradient = p?.gender === "Female" ? "from-pink-500 to-rose-600" : "from-blue-500 to-cyan-500";
              const cancelled = a.status === "Cancelled";
              return (
                <motion.div key={a.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
                  whileHover={{x: 4}}
                  className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 rounded-xl border bg-white/70 backdrop-blur-md hover:shadow-md hover:bg-white/90 transition-all ${cancelled ? "opacity-60 line-through" : ""}`}>
                  <div className="text-center sm:w-20">
                    <div className="text-2xl font-bold text-primary">{a.time}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{a.type === "Tele-consult" ? "Video" : "In-person"}</div>
                  </div>
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center font-bold shadow-glow shrink-0`}>{a.patient[0]}</div>
                  <div className="flex-1 min-w-0">
                    <Link to="/doctor/patients/$id" params={{id:a.patientId}} className="font-semibold hover:text-primary no-underline">{a.patient}</Link>
                    <div className="text-sm text-muted-foreground">{a.reason}</div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
                      <span className="flex items-center gap-1">{a.type === "Tele-consult" ? <Video className="h-3 w-3"/> : <MapPin className="h-3 w-3"/>}{a.type}</span>
                      <span>•</span><span>{a.id}</span>
                      {p && <><span>•</span><span>{p.age}y {p.gender}</span></>}
                    </div>
                  </div>
                  <Badge className={
                    a.status === "Confirmed" ? "bg-emerald-100 text-emerald-700" :
                    a.status === "Completed" ? "bg-blue-100 text-blue-700" :
                    a.status === "Cancelled" ? "bg-rose-100 text-rose-700" :
                    a.status === "Delayed" ? "bg-orange-100 text-orange-700" :
                    "bg-amber-100 text-amber-700"
                  }>{a.status}</Badge>
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="outline" title="Call"><Phone className="h-3.5 w-3.5"/></Button>
                    <Button size="sm" asChild className="bg-gradient-primary text-white" disabled={cancelled}>
                      <Link to="/doctor/patients/$id" params={{ id: a.patientId }}>Start</Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline" title="More"><MoreHorizontal className="h-3.5 w-3.5"/></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => setEditing(a)}><Pencil className="h-3.5 w-3.5 mr-2"/>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setDelaying(a); setDelayMin(15); }}><Clock4 className="h-3.5 w-3.5 mr-2"/>Delay…</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => complete(a)}><CheckCircle2 className="h-3.5 w-3.5 mr-2"/>Mark completed</DropdownMenuItem>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem onClick={() => cancel(a)} className="text-amber-600 focus:text-amber-700"><XCircle className="h-3.5 w-3.5 mr-2"/>Cancel</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => remove(a)} className="text-destructive focus:text-destructive"><Trash2 className="h-3.5 w-3.5 mr-2"/>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              );
            })}
            {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground">No appointments match your search.</div>}
          </TabsContent>
          <TabsContent value="upcoming"><div className="text-center py-12 text-muted-foreground">Upcoming appointments will sync here when a slot is &gt; 24h away.</div></TabsContent>
          <TabsContent value="past"><div className="text-center py-12 text-muted-foreground">Completed visits archive here.</div></TabsContent>
        </Tabs>
      </div>

      {/* EDIT dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit appointment</DialogTitle>
            <DialogDescription>Update time, mode, or reason. Patient will be re-notified.</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="text-sm bg-muted/50 rounded-lg p-3"><b>{editing.patient}</b> · {editing.id}</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Time</Label>
                  <Input type="time" value={editing.time} onChange={(e) => setEditing({ ...editing, time: e.target.value })} className="mt-1.5"/>
                </div>
                <div>
                  <Label>Mode</Label>
                  <Select value={editing.type} onValueChange={(v) => setEditing({ ...editing, type: v })}>
                    <SelectTrigger className="mt-1.5"><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="In-person">In-person</SelectItem>
                      <SelectItem value="Tele-consult">Tele-consult</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Reason</Label>
                <Input value={editing.reason} onChange={(e) => setEditing({ ...editing, reason: e.target.value })} className="mt-1.5"/>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={editing.status} onValueChange={(v) => setEditing({ ...editing, status: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue/></SelectTrigger>
                  <SelectContent>
                    {["Confirmed","Pending","Completed","Delayed","Cancelled"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Discard</Button>
            <Button onClick={saveEdit} className="bg-gradient-primary text-white">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELAY dialog */}
      <Dialog open={!!delaying} onOpenChange={(o) => !o && setDelaying(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delay appointment</DialogTitle>
            <DialogDescription>Push the slot forward by a few minutes.</DialogDescription>
          </DialogHeader>
          {delaying && (
            <div className="space-y-3">
              <div className="text-sm bg-muted/50 rounded-lg p-3"><b>{delaying.patient}</b> · currently {delaying.time}</div>
              <div className="grid grid-cols-4 gap-2">
                {[10, 15, 30, 60].map(m => (
                  <Button key={m} variant={delayMin === m ? "default" : "outline"} onClick={() => setDelayMin(m)} className={delayMin === m ? "bg-gradient-primary text-white" : ""}>+{m}m</Button>
                ))}
              </div>
              <div>
                <Label>Custom minutes</Label>
                <Input type="number" min={1} value={delayMin} onChange={(e) => setDelayMin(parseInt(e.target.value) || 0)} className="mt-1.5"/>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDelaying(null)}>Cancel</Button>
            <Button onClick={applyDelay} className="bg-gradient-primary text-white"><Clock4 className="h-4 w-4 mr-2"/>Delay</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
