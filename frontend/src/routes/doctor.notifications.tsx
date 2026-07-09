import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { doctorNav } from "@/lib/doctorNav";
import { notifications as seed } from "@/lib/mockData";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Bell, Calendar, FlaskConical, Pill, User, CalendarOff, Settings, CheckCheck, Trash2, Search, Filter } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { notificationAPI } from "@/lib/api/client";
import useApi from "@/hooks/useApi";

export const Route = createFileRoute("/doctor/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Doctor" }] }),
  component: NotificationsScreen,
});

const iconMap: Record<string, any> = {
  appointment: Calendar, lab: FlaskConical, rx: Pill, patient: User, leave: CalendarOff, system: Settings,
};
const colorMap: Record<string, string> = {
  appointment: "from-blue-500 to-cyan-500",
  lab: "from-violet-500 to-purple-600",
  rx: "from-rose-500 to-pink-600",
  patient: "from-emerald-500 to-teal-500",
  leave: "from-amber-500 to-orange-500",
  system: "from-slate-500 to-slate-700",
};

function NotificationsScreen() {
  const [q, setQ] = useState("");
  const [showUnread, setShowUnread] = useState(false);

  const { data: apiNotifs, refetch } = useApi(() => notificationAPI.getAll());
  const list = (apiNotifs as unknown as typeof seed) ?? seed;
  const unread = list.filter(n => n.unread).length;

  const filtered = list.filter(n => (showUnread ? n.unread : true) && (n.title + n.body).toLowerCase().includes(q.toLowerCase()));

  const markAll = async () => {
    try { await notificationAPI.markAllRead(); toast.success("All marked as read"); refetch(); }
    catch { toast.error("Failed to update"); }
  };
  const toggleRead = async (id: number) => {
    try { await notificationAPI.markRead(id); refetch(); }
    catch { toast.error("Failed to update"); }
  };
  const remove = (id: number) => { toast.success("Notification removed"); refetch(); };
  const clearAll = async () => {
    try { await notificationAPI.markAllRead(); toast.success("All cleared"); refetch(); }
    catch { toast.error("Failed"); }
  };

  return (
    <AppShell role="doctor" title="Doctor" nav={doctorNav}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Bell className="h-7 w-7 text-primary"/>Notifications
            {unread > 0 && <Badge className="bg-destructive text-white">{unread} new</Badge>}
          </h1>
          <p className="text-muted-foreground">Latest activity at the top.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={markAll}><CheckCheck className="h-4 w-4 mr-2"/>Mark all read</Button>
          <Button variant="outline" onClick={clearAll} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4 mr-2"/>Clear all</Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search notifications…" className="pl-9"/>
        </div>
        <Button variant={showUnread ? "default" : "outline"} onClick={() => setShowUnread(v => !v)} className={showUnread ? "bg-gradient-primary text-white" : ""}>
          <Filter className="h-4 w-4 mr-2"/>{showUnread ? "Unread only" : "Show all"}
        </Button>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map((n, i) => {
            const Icon = iconMap[n.type] ?? Bell;
            return (
              <motion.div key={n.id} layout
                initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,x:-30, height:0, marginBottom:0, padding:0}}
                transition={{delay:i*0.03}}
                className={`flex items-start gap-4 p-4 rounded-2xl border bg-white shadow-card hover:shadow-elevated transition ${n.unread ? "ring-2 ring-primary/30" : ""}`}>
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${colorMap[n.type]} text-white flex items-center justify-center shadow-glow shrink-0`}>
                  <Icon className="h-5 w-5"/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="font-semibold flex items-center gap-2">
                      {n.title}
                      {n.unread && <span className="h-2 w-2 rounded-full bg-primary animate-pulse"/>}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{n.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{n.body}</p>
                  <div className="mt-2 flex flex-wrap gap-2 items-center">
                    <Badge variant="outline" className="text-[10px] uppercase">{n.type}</Badge>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => toggleRead(n.id)}>
                      <CheckCheck className="h-3 w-3 mr-1"/>Mark {n.unread ? "read" : "unread"}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => remove(n.id)}>
                      <Trash2 className="h-3 w-3 mr-1"/>Delete
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {filtered.length === 0 && <div className="text-center py-16 text-muted-foreground">You're all caught up.</div>}
      </div>
    </AppShell>
  );
}
