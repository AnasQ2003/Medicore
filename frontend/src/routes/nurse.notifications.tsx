import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { nurseNav } from "@/lib/roleNav";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell, HeartPulse, Pill, ClipboardCheck, AlertCircle, CheckCheck,
  BedDouble, Calendar, Clock, Info, AlertTriangle, Syringe
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/nurse/notifications")({
  head: () => ({ meta: [{ title: "Notifications - Nurse" }] }),
  component: NurseNotificationsScreen,
});

type NotifType = "critical" | "medication" | "task" | "vital" | "bed" | "injection" | "general";

interface NurseNotif {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  patient?: string;
  bed?: string;
  time: Date;
  read: boolean;
}

const INITIAL_NOTIFS: NurseNotif[] = [
  { id: "N-001", type: "critical", title: "CRITICAL - SpO2 Alert", body: "Ali Hassan Sheikh (ICU-07) SpO2 dropped to 91%. Escalate to intensivist immediately. High-flow O2 therapy initiated.", patient: "Ali Hassan Sheikh", bed: "ICU-07", time: new Date(Date.now() - 5 * 60000), read: false },
  { id: "N-002", type: "vital", title: "Vitals Alert - Elevated Temperature", body: "Muhammad Usama Khan (ICU-04) recorded Temp 38.5C and Pulse 102 bpm. Initiate fever protocol and notify physician.", patient: "Muhammad Usama Khan", bed: "ICU-04", time: new Date(Date.now() - 18 * 60000), read: false },
  { id: "N-003", type: "medication", title: "Medication Overdue - Enoxaparin", body: "Hamza Riaz (Bed-114B) missed Enoxaparin 40mg SC dose at 08:00 AM. DVT prophylaxis at risk. Administer immediately.", patient: "Hamza Riaz", bed: "Bed-114B", time: new Date(Date.now() - 35 * 60000), read: false },
  { id: "N-004", type: "task", title: "Task Overdue - Neuro Check", body: "GCS assessment for Zainab Qureshi (Bed-501) was due at 10:00 AM. Perform now and update care plan.", patient: "Zainab Qureshi", bed: "Bed-501", time: new Date(Date.now() - 62 * 60000), read: true },
  { id: "N-005", type: "injection", title: "IV Infusion Running - Norepinephrine", body: "Norepinephrine infusion for Ali Hassan Sheikh (ICU-07) active. Titrate to MAP >65 mmHg. Check every 30 minutes.", patient: "Ali Hassan Sheikh", bed: "ICU-07", time: new Date(Date.now() - 80 * 60000), read: true },
  { id: "N-006", type: "bed", title: "Bed Reservation - ICU-03", body: "ICU-03 reserved for incoming ED patient. Expected arrival 01:00 PM. Prepare bed and notify charge nurse.", time: new Date(Date.now() - 110 * 60000), read: false },
  { id: "N-007", type: "medication", title: "Medication Due - Furosemide 40mg IV", body: "Muhammad Usama Khan (ICU-04) due for Furosemide 40mg IV at 10:00 AM. Monitor urine output per ICU protocol.", patient: "Muhammad Usama Khan", bed: "ICU-04", time: new Date(Date.now() - 140 * 60000), read: true },
  { id: "N-008", type: "task", title: "Wound Dressing Scheduled - 02:00 PM", body: "Post-appendectomy dressing change for Fatima Noor (Bed-205) at 02:00 PM. Prepare aseptic trolley.", patient: "Fatima Noor", bed: "Bed-205", time: new Date(Date.now() - 180 * 60000), read: true },
  { id: "N-009", type: "general", title: "Shift Handover Reminder", body: "Evening shift handover at 03:00 PM. Prepare handover notes including vitals, medications and outstanding tasks.", time: new Date(Date.now() - 240 * 60000), read: true },
  { id: "N-010", type: "vital", title: "Blood Glucose Check Pending", body: "Pre-lunch glucose check for Hamza Riaz (Bed-114B) overdue since 11:30 AM. Notify if reading >250 mg/dL.", patient: "Hamza Riaz", bed: "Bed-114B", time: new Date(Date.now() - 30 * 60000), read: false },
];

function NurseNotificationsScreen() {
  const [notifs, setNotifs] = useState(INITIAL_NOTIFS);
  const [typeFilter, setTypeFilter] = useState<NotifType | "all">("all");
  const filtered = notifs.filter((n) => typeFilter === "all" || n.type === typeFilter);
  const unreadCount = notifs.filter((n) => !n.read).length;
  const markAllRead = () => { setNotifs((prev) => prev.map((n) => ({ ...n, read: true }))); toast.success("All notifications marked as read"); };
  const markRead = (id: string) => setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  const timeAgo = (date: Date) => { const mins = Math.round((Date.now() - date.getTime()) / 60000); if (mins < 60) return mins + "m ago"; return Math.round(mins / 60) + "h ago"; };
  const typeColors: Record<string, string> = { critical: "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900", vital: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900", medication: "bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-900", task: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900", bed: "bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-900", injection: "bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-900", general: "bg-secondary border-border" };
  const typeBadge: Record<string, string> = { critical: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300", vital: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300", medication: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300", task: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300", bed: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300", injection: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300", general: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300" };

  return (
    <AppShell role="nurse" title="Nurse" nav={nurseNav}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Notifications
            {unreadCount > 0 && <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-white text-xs font-bold">{unreadCount}</span>}
          </h1>
          <p className="text-muted-foreground">{unreadCount} unread of {notifs.length} total</p>
        </div>
        {unreadCount > 0 && <Button variant="outline" size="sm" onClick={markAllRead}><CheckCheck className="h-3.5 w-3.5 mr-2" />Mark All Read</Button>}
      </div>
      <div className="flex gap-2 flex-wrap mb-6">
        {(["all", "critical", "vital", "medication", "injection", "task", "bed", "general"] as const).map((t) => (
          <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all border ${typeFilter === t ? "bg-rose-600 text-white border-rose-600" : "bg-secondary text-muted-foreground border-border hover:border-rose-400"}`}>{t}</button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground bg-secondary/20 rounded-2xl border"><Bell className="h-10 w-10 mx-auto mb-3 opacity-30" />No notifications.</div>
        ) : filtered.map((n, i) => (
          <motion.div key={n.id} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} onClick={() => markRead(n.id)}
            className={`border rounded-2xl p-4 cursor-pointer transition-all hover:shadow-elevated ${typeColors[n.type] ?? ""} ${n.read ? "opacity-70" : "shadow-card"}`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 p-2 rounded-xl bg-background/60">
                {n.type === "critical" ? <AlertCircle className="h-5 w-5 text-rose-500" /> : n.type === "vital" ? <AlertTriangle className="h-5 w-5 text-amber-500" /> : n.type === "medication" ? <Pill className="h-5 w-5 text-violet-500" /> : n.type === "task" ? <ClipboardCheck className="h-5 w-5 text-blue-500" /> : n.type === "bed" ? <BedDouble className="h-5 w-5 text-teal-500" /> : n.type === "injection" ? <Syringe className="h-5 w-5 text-pink-500" /> : <Info className="h-5 w-5 text-slate-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`font-bold text-sm ${n.read ? "text-muted-foreground" : "text-foreground"}`}>{n.title}</h3>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-rose-500 flex-shrink-0" />}
                  </div>
                  <Badge className={`${typeBadge[n.type] ?? ""} flex-shrink-0 capitalize text-[10px]`}>{n.type}</Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">{n.body}</p>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(n.time)}</span>
                  {n.patient && <span className="flex items-center gap-1"><HeartPulse className="h-3 w-3" />{n.patient}</span>}
                  {n.bed && <span className="flex items-center gap-1"><BedDouble className="h-3 w-3" />{n.bed}</span>}
                  <span className="ml-auto flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </AppShell>
  );
}