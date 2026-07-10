import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { superAdminNav } from "@/lib/roleNav";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, CheckCheck, Loader2, AlertCircle } from "lucide-react";
import { notificationAPI } from "@/lib/api/client";
import useApi from "@/hooks/useApi";
import { toast } from "sonner";

export const Route = createFileRoute("/super-admin/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Super Admin" }] }),
  component: SuperAdminNotificationsScreen,
});

interface Notification { id: number; title: string; body: string; type: string; isRead: boolean; createdAt: string; }

function SuperAdminNotificationsScreen() {
  const { data: raw, loading, error, refetch } = useApi(() => notificationAPI.getAll());
  const notifications = (raw as unknown as Notification[]) ?? [];
  const unread = notifications.filter((n) => !n.isRead).length;

  const markRead = async (id: number) => {
    try { await notificationAPI.markRead(id); refetch(); } catch { toast.error("Failed"); }
  };
  const markAll = async () => {
    try { await notificationAPI.markAllRead(); toast.success("All notifications marked as read"); refetch(); } catch { toast.error("Failed"); }
  };

  return (
    <AppShell role="super-admin" title="Super Admin" nav={superAdminNav}>
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
              className={`flex items-start gap-4 p-4 rounded-2xl border transition-colors ${n.isRead ? "bg-white opacity-60" : "bg-gradient-card border-primary/20 shadow-card"}`}>
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${n.isRead ? "bg-secondary" : "bg-gradient-primary text-primary-foreground"}`}>
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">{n.title}</p>
                  {!n.isRead && <Badge className="bg-primary text-primary-foreground text-[10px]">New</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{n.body}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              {!n.isRead && <Button size="sm" variant="ghost" className="shrink-0 text-xs" onClick={() => markRead(n.id)}>Mark read</Button>}
            </motion.div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
