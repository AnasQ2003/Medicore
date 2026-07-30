import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { doctorNav } from "@/lib/roleNav";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, CheckCheck, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { notificationAPI } from "@/lib/api/client";
import useApi from "@/hooks/useApi";
import { toast } from "sonner";

export const Route = createFileRoute("/doctor/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Doctor" }] }),
  component: DoctorNotificationsScreen,
});

interface Notification { id: number; title: string; body: string; type: string; isRead: boolean; createdAt: string; }

function DoctorNotificationsScreen() {
  const navigate = useNavigate();
  const { data: raw, loading, error, refetch } = useApi(() => notificationAPI.getAll());
  
  const seedNotifs: Notification[] = [
    { id: 101, title: "New Appointment Booked", body: "Patient John Doe booked a 10:00 AM slot for Routine Checkup.", type: "appointment", isRead: false, createdAt: new Date().toISOString() },
    { id: 102, title: "Lab Report Available", body: "Ahmed Ali's Lipid Profile report is ready for doctor review.", type: "report", isRead: false, createdAt: new Date().toISOString() },
    { id: 103, title: "Prescription Refill Request", body: "Hassan Raza requested a refill for Clopidogrel 75mg.", type: "rx", isRead: true, createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 104, title: "Leave Status Approved", body: "Your leave application L-12 has been approved by admin.", type: "leave", isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() }
  ];

  const fetched: Notification[] = (raw as unknown as Notification[]) ?? [];
  const notifications = fetched.length > 0 ? fetched : seedNotifs;
  const unread = notifications.filter((n) => !n.isRead).length;

  const getTargetRoute = (n: Notification): string => {
    const t = (n.type || "").toLowerCase();
    const text = (n.title + " " + n.body).toLowerCase();
    if (t.includes("appointment") || text.includes("appointment") || text.includes("booked")) return "/doctor/appointments";
    if (t.includes("rx") || t.includes("prescription") || text.includes("refill") || text.includes("medication")) return "/doctor/prescriptions";
    if (t.includes("report") || t.includes("lab") || text.includes("lipid") || text.includes("ecg")) return "/doctor/reports";
    if (t.includes("patient") || text.includes("patient")) return "/doctor/patients";
    if (t.includes("leave") || text.includes("leave")) return "/doctor/leave";
    return "/doctor/appointments";
  };

  const handleNotificationClick = async (n: Notification) => {
    if (!n.isRead) {
      try { await notificationAPI.markRead(n.id); } catch {}
    }
    const route = getTargetRoute(n);
    toast.info(`Opening ${n.title}...`);
    navigate({ to: route as any });
  };

  const markRead = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try { await notificationAPI.markRead(id); refetch(); } catch { toast.error("Failed"); }
  };
  const markAll = async () => {
    try { await notificationAPI.markAllRead(); toast.success("All notifications marked as read"); refetch(); } catch { toast.error("Failed"); }
  };

  return (
    <AppShell role="doctor" title="Doctor" nav={doctorNav}>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">{unread} unread notification{unread !== 1 ? "s" : ""}</p>
        </div>
        {unread > 0 && <Button variant="outline" size="sm" onClick={markAll}><CheckCheck className="h-3.5 w-3.5 mr-2" />Mark all read</Button>}
      </div>

      {loading && <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
      {error && <div className="text-center py-16 text-destructive"><AlertCircle className="h-8 w-8 mx-auto mb-2" /><p>{error}</p></div>}

      {!loading && !error && (
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground bg-secondary/20 rounded-2xl border">
              <BellOff className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No notifications yet.</p>
            </div>
          ) : notifications.map((n, i) => (
            <motion.div key={n.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              onClick={() => handleNotificationClick(n)}
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md hover:translate-x-1 ${n.isRead ? "bg-white opacity-70" : "bg-gradient-card border-primary/30 shadow-card"}`}>
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${n.isRead ? "bg-secondary" : "bg-gradient-primary text-primary-foreground shadow-glow"}`}>
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm">{n.title}</p>
                  {!n.isRead && <Badge className="bg-primary text-primary-foreground text-[10px]">New</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{n.body}</p>
                <p className="text-xs text-muted-foreground mt-1 font-mono">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                {!n.isRead && <Button size="sm" variant="ghost" className="shrink-0 text-xs" onClick={(e) => markRead(n.id, e)}>Mark read</Button>}
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
