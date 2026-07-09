import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Bell, User, Settings, ChevronDown, Menu, X, PanelLeftClose, PanelLeftOpen, Command, Sparkles } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { clearUser, ensureUserForRole, type Role, type MockUser } from "@/lib/mockAuth";
import { MediLogo } from "./MediLogo";
import { Footer } from "./Footer";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { notifications as defaultNotifs } from "@/lib/mockData";

interface NavItem { label: string; to: string; icon: ReactNode }

const roleAccent: Record<Role, string> = {
  "super-admin": "bg-gradient-violet",
  doctor: "bg-gradient-primary",
  nurse: "bg-gradient-red",
  receptionist: "bg-gradient-green",
  patient: "bg-gradient-sunset",
};

// Map a notification type to its destination route under the current role.
function notifTarget(role: Role, type: string): string {
  const r = `/${role}`;
  switch (type) {
    case "appointment": return `${r}/appointments`;
    case "lab":
    case "report": return `${r}/reports`;
    case "rx": return `${r}/prescriptions`;
    case "patient": return `${r}/patients`;
    case "leave": return `${r}/leave`;
    default: return `${r}/notifications`;
  }
}

export function AppShell({
  role, title, nav, children,
}: { role: Role; title: string; nav: NavItem[]; children: ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [user, setUser] = useState<MockUser | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setUser(ensureUserForRole(role));
    if (typeof document !== "undefined") {
      // Radix portals render outside [data-role], so mirror role vars onto :root
      // so dropdowns, popovers, toasts follow the current role's theme.
      const el = document.createElement("div");
      el.setAttribute("data-role", role);
      el.style.display = "none";
      document.body.appendChild(el);
      const styles = getComputedStyle(el);
      const primary = styles.getPropertyValue("--primary").trim();
      const ring = styles.getPropertyValue("--ring").trim();
      const gradPrimary = styles.getPropertyValue("--gradient-primary").trim();
      document.body.removeChild(el);
      if (primary) {
        document.documentElement.style.setProperty("--primary", primary);
        document.documentElement.style.setProperty("--ring", ring || primary);
        document.documentElement.style.setProperty("--accent", primary);
        document.documentElement.style.setProperty("--accent-foreground", "oklch(0.99 0.005 220)");
        if (gradPrimary) document.documentElement.style.setProperty("--gradient-primary", gradPrimary);
      }
    }
    return () => {
      if (typeof document !== "undefined") {
        document.documentElement.style.removeProperty("--primary");
        document.documentElement.style.removeProperty("--ring");
        document.documentElement.style.removeProperty("--accent");
        document.documentElement.style.removeProperty("--accent-foreground");
        document.documentElement.style.removeProperty("--gradient-primary");
      }
    };
  }, [role]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const onLogout = () => { clearUser(); navigate({ to: "/login" }); };
  const unread = defaultNotifs.filter((n) => n.unread).length;
  const accent = roleAccent[role];
  const profileBase = `/${role}/profile`;
  const sidebarWidth = collapsed ? "w-20" : "w-64";

  const Sidebar = (
    <aside className={`flex ${sidebarWidth} flex-col glass-sidebar text-sidebar-foreground border-r border-sidebar-border p-3 gap-1 h-full transition-[width] duration-300`}>
      <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3 px-2"} py-3`}>
        <MediLogo size={collapsed ? 36 : 42} animated={false} />
        {!collapsed && (
          <div className="min-w-0">
            <div className="font-bold text-lg tracking-tight text-white truncate">MediCore</div>
            <div className="text-xs text-sidebar-foreground/70 truncate">{title}</div>
          </div>
        )}
      </div>

      {/* Collapse toggle — pill button that adapts to sidebar state */}
      <div className="px-1 mb-2">
        <button
          onClick={() => setCollapsed((v) => !v)}
          className={`hidden md:flex w-full items-center ${collapsed ? "justify-center" : "justify-between"} gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white/90 bg-white/10 hover:bg-white/20 border border-white/15 hover:border-white/30 backdrop-blur-md transition-all group`}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {!collapsed && <span className="tracking-wide">Collapse</span>}
          <span className={`flex h-6 w-6 items-center justify-center rounded-lg bg-white/10 group-hover:bg-white/25 transition-colors`}>
            {collapsed ? <PanelLeftOpen className="h-3.5 w-3.5" /> : <PanelLeftClose className="h-3.5 w-3.5" />}
          </span>
        </button>
      </div>


      {!collapsed && (
        <div className={`mx-1 mt-1 mb-3 rounded-xl ${accent} p-3 shadow-glow relative overflow-hidden border border-white/20`}>
          <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-white/20 blur-2xl" />
          <div className="relative z-10 flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-white/50">
              <AvatarFallback className="bg-white/20 text-white font-bold">{user?.name?.[0] ?? "U"}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate">{user?.name ?? "User"}</div>
              <div className="text-[10px] uppercase tracking-wider text-white/80">{title}</div>
            </div>
          </div>
        </div>
      )}

      <nav className="flex flex-col gap-1 overflow-y-auto scrollbar-thin pr-1 flex-1 min-h-0">
        {nav.map((item) => {
          const active = pathname === item.to || (item.to !== `/${role}` && pathname.startsWith(item.to));
          return (
            <Link
              key={item.label}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={`group flex items-center ${collapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-white/15 text-white shadow-inner backdrop-blur-sm border border-white/10"
                  : "text-sidebar-foreground/80 hover:bg-white/10 hover:text-white hover:translate-x-1"
              }`}
            >
              <span className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                active ? "bg-white/20" : "bg-white/5 group-hover:bg-white/10"
              }`}>
                {item.icon}
              </span>
              {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
              {!collapsed && active && <motion.div layoutId={`dot-${role}`} className="h-1.5 w-1.5 rounded-full bg-white" />}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="pt-3 border-t border-white/10 text-[10px] text-white/60 px-2 pb-1">
          MediCore v2.6 • © {new Date().getFullYear()}
        </div>
      )}
    </aside>
  );

  return (
    <div data-role={role} className="flex min-h-screen w-full bg-background relative">
      <div className="pointer-events-none fixed inset-0 glass-scene -z-10" aria-hidden="true" />
      {/* Desktop sidebar — sticky to viewport */}
      <div className="hidden md:flex sticky top-0 h-screen z-20">{Sidebar}</div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            <motion.div
              initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed top-0 left-0 h-screen z-50 md:hidden"
            >
              {Sidebar}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border/70 glass-panel flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen((v) => !v)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="hidden sm:flex items-center gap-2 flex-1 group">
              <div className="relative flex-1">
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-[color:var(--primary)]/40 via-[color:var(--primary)]/10 to-[color:var(--primary)]/40 opacity-60 group-focus-within:opacity-100 blur-md transition-opacity pointer-events-none animate-aurora" />
                <div className="relative flex items-center gap-2 rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl px-3 h-11 shadow-sm group-focus-within:shadow-glow group-focus-within:border-primary/60 transition-all">
                  <span className="grid place-items-center h-7 w-7 rounded-lg bg-gradient-to-br from-[color:var(--primary)]/20 to-[color:var(--primary)]/5 border border-[color:var(--primary)]/25">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                  </span>
                  <Input placeholder="Search patients, records, prescriptions…" className="border-0 bg-transparent focus-visible:ring-0 px-0 h-8 text-sm placeholder:text-muted-foreground/70" />
                  <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border bg-white/80 text-[10px] font-mono text-muted-foreground shadow-sm"><Command className="h-2.5 w-2.5"/>K</kbd>
                </div>
              </div>
            </div>

          </div>

          <div className="flex items-center gap-1.5">
            {/* Notifications dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-destructive text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                      {unread}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-white/95 backdrop-blur-xl border-border/70 shadow-elevated">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notifications</span>
                  <span className="text-xs text-muted-foreground">{unread} unread</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-y-auto">
                  {defaultNotifs.slice(0, 6).map((n) => (
                    <DropdownMenuItem key={n.id} asChild>
                      <Link
                        to={notifTarget(role, n.type) as any}
                        className={`flex flex-col items-start gap-0.5 py-2.5 cursor-pointer ${n.unread ? "bg-primary/5" : ""}`}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <div className={`h-2 w-2 rounded-full ${n.unread ? "bg-primary animate-pulse" : "bg-muted-foreground/30"}`} />
                          <span className={`text-sm flex-1 ${n.unread ? "font-semibold" : "font-medium"}`}>{n.title}</span>
                          <span className="text-[10px] text-muted-foreground">{n.time}</span>
                        </div>
                        <span className="text-xs text-muted-foreground line-clamp-2 pl-4">{n.body}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={`/${role}/notifications` as any} className="text-center justify-center text-primary text-sm font-medium">
                    View all notifications
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-white/45 transition-colors">
                  <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                    <AvatarFallback className={`${accent} text-white text-xs font-bold`}>
                      {user?.name?.[0] ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium leading-tight">{user?.name}</div>
                    <div className="text-xs text-muted-foreground capitalize leading-tight">{title}</div>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-xl border-border/70 shadow-elevated">
                <DropdownMenuLabel className="font-normal">
                  <div className="font-semibold">{user?.name}</div>
                  <div className="text-xs text-muted-foreground">{user?.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={profileBase as any}><User className="h-4 w-4 mr-2" /> My profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={`/${role}/notifications` as any}><Bell className="h-4 w-4 mr-2" /> Notifications</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 p-4 md:p-6 relative z-0"
        >
          {children}
        </motion.main>
        <Footer />
      </div>
    </div>
  );
}
