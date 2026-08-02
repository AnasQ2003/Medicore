import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Bell, User, Settings, ChevronDown, Menu, X, PanelLeftClose, PanelLeftOpen, Command, Search, ChevronRight, Sun, Moon } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { clearUser, ensureUserForRole, type Role, type MockUser } from "@/lib/auth";
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

import { MediCoreLoader } from "./MediCoreLoader";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [userNotifs, setUserNotifs] = useState<any[]>([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("Loading MediCore Module…");

  // Route transition loader trigger — stays ~3 seconds for smooth 3D animation telemetry
  useEffect(() => {
    setPageLoading(true);
    const timer = setTimeout(() => setPageLoading(false), 2600);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Theme state: Default Light Mode for all users
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("medicore_theme") === "dark";
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("medicore_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("medicore_theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    if (!user?.email) return;
    const loadNotifs = () => {
      const key = `medicore_user_notifications_${user.email}`;
      const saved = JSON.parse(localStorage.getItem(key) || "[]");
      setUserNotifs(saved);
    };
    loadNotifs();
    window.addEventListener("storage", loadNotifs);
    window.addEventListener("medicore_leave_requests_updated", loadNotifs);
    return () => {
      window.removeEventListener("storage", loadNotifs);
      window.removeEventListener("medicore_leave_requests_updated", loadNotifs);
    };
  }, [user?.email]);

  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`sidebar_collapsed_${role}`);
      return saved === "true";
    }
    return false;
  });
  const [searchOpen, setSearchOpen] = useState(false);

  const handleLogout = () => {
    setLoadingMsg("Signing out safely…");
    setPageLoading(true);
    setTimeout(() => {
      clearUser();
      navigate({ to: "/login", search: { role } as any });
    }, 450);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const resolved = ensureUserForRole(role);
    // Redirect to login if user is not authenticated or role doesn't match
    if (!resolved) {
      navigate({ to: "/login", search: { role } as any });
      return;
    }
    setUser(resolved);
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
  }, [role, navigate]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Persist collapsed state to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`sidebar_collapsed_${role}`, String(collapsed));
    }
  }, [collapsed, role]);

  const allNotifs = [...userNotifs, ...defaultNotifs];
  const unread = allNotifs.filter((n) => n.unread).length;
  const accent = roleAccent[role];
  const profileBase = `/${role}/profile`;
  const sidebarWidth = collapsed ? "w-16" : "w-64";

  const Sidebar = (
    <aside className={`flex ${sidebarWidth} flex-col glass-sidebar text-sidebar-foreground border-r border-sidebar-border p-3 gap-1 h-full transition-[width] duration-200 ease-out`}>
      <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3 px-2"} py-3`}>
        <MediLogo size={collapsed ? 36 : 42} animated={false} />
        {!collapsed && (
          <div className="min-w-0">
            <div className="font-bold text-lg tracking-tight text-white truncate">MediCore</div>
            <div className="text-xs text-sidebar-foreground/70 truncate">{title}</div>
          </div>
        )}
      </div>

      {/* Collapse toggle — enhanced design with better highlight */}
      <div className="px-1 mb-2">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setCollapsed((v) => !v);
          }}
          className={`hidden md:flex items-center ${collapsed ? "justify-center" : "justify-between"} w-full h-11 rounded-xl text-white/90 hover:text-white bg-gradient-to-r from-white/15 to-white/5 hover:from-white/25 hover:to-white/10 border border-white/20 hover:border-white/40 backdrop-blur-md transition-all duration-200 px-3 shadow-lg hover:shadow-xl`}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {!collapsed && <span className="text-xs font-semibold tracking-wide">Collapse</span>}
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 transition-all duration-200 ${collapsed ? "scale-110" : ""}`}>
            <ChevronRight className={`h-5 w-5 transition-transform duration-200 ${collapsed ? "" : "rotate-180"}`} />
          </div>
        </button>
      </div>

      <nav className="sidebar-nav flex flex-col gap-1 overflow-y-auto overflow-x-hidden flex-1 min-h-0" style={{ overscrollBehavior: "contain" }}>
        {nav.map((item, index) => {
          const active = pathname === item.to || (item.to !== `/${role}` && pathname.startsWith(item.to));
          return (
            <motion.div
              key={item.label}
              initial={collapsed ? false : { opacity: 0, x: -20 }}
              animate={collapsed ? false : { opacity: 1, x: 0 }}
              transition={{ duration: 0.15, delay: collapsed ? 0 : index * 0.03 }}
            >
              <Link
                to={item.to}
                title={collapsed ? item.label : undefined}
                onClick={(e) => {
                  // Prevent any state changes when clicking nav items
                  if (collapsed) {
                    // Just navigate, don't change sidebar state
                  }
                }}
                className={`group flex items-center ${collapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-white/18 text-white shadow-inner backdrop-blur-sm border border-white/15"
                    : "text-sidebar-foreground hover:bg-white/18 hover:text-white hover:translate-x-1"
                }`}
              >
                <span className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors duration-200 ${
                  active ? "bg-white/25" : "bg-white/8 group-hover:bg-white/20"
                }`}>
                  {item.icon}
                </span>
                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex-1 truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {!collapsed && active && <motion.div layoutId={`dot-${role}`} className="h-1.5 w-1.5 rounded-full bg-white" />}
              </Link>
            </motion.div>
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

  // Auth guard: if no authenticated user, render nothing while redirecting
  if (!user) return null;

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
              style={{ overscrollBehavior: "contain" }}
            >
              {Sidebar}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border/70 glass-panel flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-2xl">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen((v) => !v)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="hidden sm:flex items-center gap-2 flex-1 group relative">
              <div className="relative flex-1">
                {/* Premium Command Bar */}
                <div className={`relative flex items-center gap-2.5 rounded-xl border transition-all duration-300 h-10 px-3 overflow-hidden ${
                  searchOpen && searchQuery.trim() ? "search-bar-active" : "search-bar-idle"
                }`}>
                  {/* Icon bubble */}
                  <div className={`shrink-0 h-6 w-6 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    searchOpen && searchQuery.trim() ? "bg-primary text-white scale-105" : "bg-primary/15 text-primary"
                  }`}>
                    <Search className="h-3.5 w-3.5" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSearchOpen(true);
                    }}
                    onFocus={() => setSearchOpen(true)}
                    placeholder="Search patients, records, prescriptions…"
                    className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-sm text-foreground placeholder:text-muted-foreground/60 flex-1 min-w-0"
                  />
                  {searchQuery ? (
                    <button
                      onClick={() => { setSearchQuery(""); setSearchOpen(false); }}
                      className="grid place-items-center h-5 w-5 rounded-md bg-muted/60 hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-all shrink-0"
                      aria-label="Clear search"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  ) : (
                    <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted/80 px-1.5 font-mono text-[10px] font-medium text-muted-foreground shrink-0 select-none">
                      ⌘K
                    </kbd>
                  )}
                </div>


                {/* Live Search Results Dropdown Overlay */}
                <AnimatePresence>


                  {searchOpen && searchQuery.trim().length > 0 && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setSearchOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 right-0 top-14 z-50 rounded-2xl border border-border bg-popover/98 backdrop-blur-xl shadow-2xl p-4 max-h-[420px] overflow-y-auto space-y-3"
                      >
                        <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
                          Search Results for "{searchQuery}"
                        </div>

                        {/* Search Matches */}
                        {(() => {
                          const q = searchQuery.toLowerCase();
                          const matchesNav = nav.filter(n => n.label.toLowerCase().includes(q));
                          const samplePatients = [
                            { id: "1", name: "Patient John Doe", code: "P-1001", rolePath: `/${role}/patients` },
                            { id: "1042", name: "Ahmed Ali", code: "P-1042", rolePath: `/${role}/patients` },
                            { id: "1043", name: "Fatima Noor", code: "P-1043", rolePath: `/${role}/patients` },
                            { id: "1044", name: "Hassan Raza", code: "P-1044", rolePath: `/${role}/patients` },
                          ].filter(p => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q));

                          const samplePrescriptions = [
                            { id: "RX-001", name: "Multivitamin & Amlodipine", patient: "John Doe", rolePath: `/${role}/prescriptions` },
                            { id: "RX-102", name: "Atorvastatin 10mg", patient: "Ahmed Ali", rolePath: `/${role}/prescriptions` },
                            { id: "RX-103", name: "Metformin 500mg", patient: "Fatima Noor", rolePath: `/${role}/prescriptions` },
                          ].filter(r => r.id.toLowerCase().includes(q) || r.name.toLowerCase().includes(q) || r.patient.toLowerCase().includes(q));

                          const sampleReports = [
                            { id: "R-501", name: "Lipid Profile Report", patient: "Ahmed Ali", rolePath: `/${role}/reports` },
                            { id: "R-502", name: "24h Holter ECG", patient: "Fatima Noor", rolePath: `/${role}/reports` },
                            { id: "R-503", name: "Echocardiogram Report", patient: "Hassan Raza", rolePath: `/${role}/reports` },
                          ].filter(rep => rep.id.toLowerCase().includes(q) || rep.name.toLowerCase().includes(q) || rep.patient.toLowerCase().includes(q));

                          const totalMatches = matchesNav.length + samplePatients.length + samplePrescriptions.length + sampleReports.length;

                          if (totalMatches === 0) {
                            return (
                              <div className="py-8 text-center text-sm text-muted-foreground">
                                No records or pages found matching "{searchQuery}"
                              </div>
                            );
                          }

                          return (
                            <div className="space-y-3 divide-y divide-border/40">
                              {/* Navigation pages */}
                              {matchesNav.length > 0 && (
                                <div className="space-y-1 pt-1">
                                  <div className="text-[10px] font-bold text-primary uppercase tracking-wider px-2">Navigation Pages</div>
                                  {matchesNav.map(n => (
                                    <div
                                      key={n.to}
                                      onClick={() => {
                                        setSearchOpen(false);
                                        setSearchQuery("");
                                        navigate({ to: n.to as any });
                                      }}
                                      className="flex items-center justify-between p-2 rounded-xl hover:bg-primary/10 cursor-pointer transition-colors"
                                    >
                                      <div className="flex items-center gap-2 text-sm font-medium">
                                        <span className="h-6 w-6 rounded-lg bg-primary/15 text-primary flex items-center justify-center">{n.icon}</span>
                                        {n.label}
                                      </div>
                                      <span className="text-xs text-muted-foreground font-mono">{n.to}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Patients */}
                              {samplePatients.length > 0 && (
                                <div className="space-y-1 pt-2">
                                  <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider px-2">Patients EMR</div>
                                  {samplePatients.map(p => (
                                    <div
                                      key={p.id}
                                      onClick={() => {
                                        setSearchOpen(false);
                                        setSearchQuery("");
                                        navigate({ to: `/${role}/patients/$id`, params: { id: p.id } } as any);
                                      }}
                                      className="flex items-center justify-between p-2 rounded-xl hover:bg-primary/10 cursor-pointer transition-colors"
                                    >
                                      <div className="flex items-center gap-2 text-sm font-medium">
                                        <div className="h-6 w-6 rounded-full bg-blue-500 text-white font-bold text-xs flex items-center justify-center">{p.name[0]}</div>
                                        {p.name}
                                      </div>
                                      <span className="text-xs text-muted-foreground font-mono">{p.code}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Prescriptions */}
                              {samplePrescriptions.length > 0 && (
                                <div className="space-y-1 pt-2">
                                  <div className="text-[10px] font-bold text-rose-600 uppercase tracking-wider px-2">Prescriptions</div>
                                  {samplePrescriptions.map(rx => (
                                    <div
                                      key={rx.id}
                                      onClick={() => {
                                        setSearchOpen(false);
                                        setSearchQuery("");
                                        navigate({ to: rx.rolePath as any });
                                      }}
                                      className="flex items-center justify-between p-2 rounded-xl hover:bg-primary/10 cursor-pointer transition-colors"
                                    >
                                      <div className="text-sm font-medium">
                                        <div>{rx.name}</div>
                                        <div className="text-xs text-muted-foreground">Patient: {rx.patient}</div>
                                      </div>
                                      <span className="text-xs text-muted-foreground font-mono">{rx.id}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Reports */}
                              {sampleReports.length > 0 && (
                                <div className="space-y-1 pt-2">
                                  <div className="text-[10px] font-bold text-violet-600 uppercase tracking-wider px-2">Lab & Clinical Reports</div>
                                  {sampleReports.map(rep => (
                                    <div
                                      key={rep.id}
                                      onClick={() => {
                                        setSearchOpen(false);
                                        setSearchQuery("");
                                        navigate({ to: rep.rolePath as any });
                                      }}
                                      className="flex items-center justify-between p-2 rounded-xl hover:bg-primary/10 cursor-pointer transition-colors"
                                    >
                                      <div className="text-sm font-medium">
                                        <div>{rep.name}</div>
                                        <div className="text-xs text-muted-foreground">Patient: {rep.patient}</div>
                                      </div>
                                      <span className="text-xs text-muted-foreground font-mono">{rep.id}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>

          <div className="flex items-center gap-3">
            {/* Futuristic Animated Theme Switcher Pill */}
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="relative flex items-center justify-between w-14 h-8 p-1 rounded-full bg-secondary/60 hover:bg-secondary border border-border/80 cursor-pointer shadow-inner transition-colors duration-300 select-none group"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              <Sun className={`h-3.5 w-3.5 z-10 ml-0.5 transition-transform duration-300 ${!darkMode ? "text-amber-500 scale-110" : "text-muted-foreground/60"}`} />
              <Moon className={`h-3.5 w-3.5 z-10 mr-0.5 transition-transform duration-300 ${darkMode ? "text-cyan-400 scale-110" : "text-muted-foreground/60"}`} />
              
              {/* Sliding Glow Pill Knob */}
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`absolute top-1 bottom-1 w-6 rounded-full shadow-md ${
                  darkMode
                    ? "right-1 bg-gradient-to-r from-slate-800 to-cyan-950 border border-cyan-500/50 shadow-cyan-500/30"
                    : "left-1 bg-gradient-to-r from-amber-400 to-yellow-300 border border-amber-300 shadow-amber-500/30"
                }`}
              />
            </button>

            {/* Notifications dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="h-9 w-9 rounded-xl border border-border/70 bg-secondary/40 hover:bg-secondary text-foreground transition-all flex items-center justify-center relative group"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-destructive text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-background animate-pulse">
                      {unread}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-popover/98 backdrop-blur-xl border-border/70 shadow-elevated">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notifications</span>
                  <span className="text-xs text-muted-foreground">{unread} unread</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-y-auto">
                  {allNotifs.slice(0, 6).map((n) => (
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

            {/* Vertical Separator */}
            <div className="h-6 w-px bg-border/60 mx-0.5 hidden sm:block" />

            {/* Profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 pl-2 pr-3 py-1 rounded-xl bg-secondary/30 hover:bg-secondary/70 border border-border/50 transition-all group">
                  <div className="relative">
                    <Avatar className="h-8 w-8 ring-2 ring-primary/20 transition-transform group-hover:scale-105">
                      <AvatarFallback className={`${accent} text-white text-xs font-bold`}>
                        {user?.name?.[0] ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-semibold leading-tight text-foreground">{user?.name}</div>
                    <div className="text-[10px] text-muted-foreground capitalize leading-tight font-medium">{title}</div>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors hidden sm:block ml-0.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover/98 backdrop-blur-xl border-border/70 shadow-elevated">
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
                <DropdownMenuItem asChild>
                  <Link to={`/${role}/settings` as any}><Settings className="h-4 w-4 mr-2" /> Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
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

      {/* Centered Route Transition & Action Loader */}
      <MediCoreLoader show={pageLoading} message={loadingMsg} />
    </div>
  );
}
