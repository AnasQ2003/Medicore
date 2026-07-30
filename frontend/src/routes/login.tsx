import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, User, Shield, Stethoscope, HeartPulse, UserRound, UserCog, Apple } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { MediLogo } from "@/components/MediLogo";
import { saveUser, roleMeta, type Role } from "@/lib/auth";
import { authAPI } from "@/lib/api/client";
import hospitalBg from "@/assets/hospital-bg.jpg";


export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { role?: Role } => {
    return {
      role: (search.role as Role) || undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Sign in — MediCore HMS" },
      { name: "description", content: "Sign in to MediCore Hospital Management System." },
    ],
  }),
  component: LoginScreen,
});

const roles: { id: Role; label: string; icon: typeof Shield; desc: string; gradient: string; bgClass: string; welcomeTitle: string; welcomeBody: string; cta: string }[] = [
  { id: "super-admin", label: "Super Admin", icon: Shield, desc: "Orchestrate hospitals, staff & policies from one command center", gradient: "from-violet-500 via-fuchsia-500 to-purple-600", bgClass: "from-violet-50 via-fuchsia-50 to-rose-50", welcomeTitle: "Welcome, Chief.", welcomeBody: "Every branch, every metric, every policy — under one glass roof.", cta: "Operate at scale, in real time." },
  { id: "doctor", label: "Doctor", icon: Stethoscope, desc: "Live schedule, EMR, e-prescriptions and lab results in one place", gradient: "from-blue-500 via-sky-500 to-cyan-500", bgClass: "from-blue-50 via-sky-50 to-cyan-50", welcomeTitle: "Good to see you, Doctor.", welcomeBody: "Your patients, your rounds, your notes — perfectly in sync.", cta: "Care that keeps up with you." },
  { id: "nurse", label: "Nurse", icon: HeartPulse, desc: "Vitals, medications, IPD tasks and bedside rounds tracked live", gradient: "from-rose-500 via-pink-500 to-red-600", bgClass: "from-rose-50 via-pink-50 to-red-50", welcomeTitle: "Compassion in motion.", welcomeBody: "Vitals, tasks and hand-offs — always one tap away.", cta: "The ward, at your fingertips." },
  { id: "receptionist", label: "Receptionist", icon: UserCog, desc: "Smart queues, one-click registration, instant billing", gradient: "from-emerald-500 via-teal-500 to-green-600", bgClass: "from-emerald-50 via-teal-50 to-green-50", welcomeTitle: "The front desk, reimagined.", welcomeBody: "Faster check-ins, cleaner queues, happier patients.", cta: "Zero-wait hospitality." },
  { id: "patient", label: "Patient", icon: UserRound, desc: "Book visits, view reports, pay bills — your health, your hands", gradient: "from-amber-500 via-orange-500 to-rose-500", bgClass: "from-amber-50 via-orange-50 to-yellow-50", welcomeTitle: "Your health, your rhythm.", welcomeBody: "Doctors, prescriptions and reports — always with you.", cta: "Care that travels with you." },
];


function LoginScreen() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPw, setShowPw] = useState(false);
  const [role, setRole] = useState<Role>("doctor");
  const [email, setEmail] = useState("abdulahadsip@gmail.com");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("password123");
  const [gender, setGender] = useState<"Male" | "Female">("Male");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (search?.role && roles.some(r => r.id === search.role)) {
      setRole(search.role);
      const defaultEmail = search.role === "super-admin" ? "anasahmedcp@gmail.com" : "abdulahadsip@gmail.com";
      setEmail(defaultEmail);
    }
  }, [search?.role]);

  // Load saved credentials on mount if remember me was checked
  useEffect(() => {
    const savedCredentials = localStorage.getItem('medicore_remember_me');
    if (savedCredentials) {
      try {
        const { email: savedEmail, password: savedPassword, role: savedRole } = JSON.parse(savedCredentials);
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRole(savedRole as Role);
        setRememberMe(true);
      } catch (e) {
        console.error('Error loading saved credentials:', e);
      }
    }
  }, []);

  const authenticate = async () => {
    if (!email || !password) return toast.error("Please fill in all fields");
    if (mode === "signup" && !name) return toast.error("Please enter your name");

    setIsLoading(true);
    try {
      if (mode === "login") {
        const res = await authAPI.login(email, password);
        if (res.success && res.data) {
          // Validate the returned role matches the selected role tab
          const userRole = res.data.role as Role;
          saveUser({ id: res.data.id, email: res.data.email, name: res.data.name, role: userRole, patientCode: res.data.patientCode, token: res.data.token });
          
          // Handle remember me functionality
          if (rememberMe) {
            localStorage.setItem('medicore_remember_me', JSON.stringify({ email, password, role }));
          } else {
            localStorage.removeItem('medicore_remember_me');
          }
          
          toast.success(`Welcome back, ${res.data.name}!`);
          navigate({ to: roleMeta[userRole].path });
        } else {
          toast.error(res.message || "Invalid email or password");
        }
      } else {
        const res = await authAPI.register({ name, email, password, role, gender });
        if (res.success && res.data) {
          const userData = res.data as { id: number; name: string; email: string; role: string; patientCode: string | null; token: string };
          const userRole = userData.role as Role;
          saveUser({ id: userData.id, email: userData.email, name: userData.name, role: userRole, patientCode: userData.patientCode, token: userData.token });
          toast.success(`Account created! Welcome, ${userData.name}!`);
          navigate({ to: roleMeta[userRole].path });
        } else {
          toast.error(res.message || "Registration failed. Please try again.");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Cannot connect to server. Please ensure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const submit = (e: React.FormEvent) => { e.preventDefault(); authenticate(); };
  const active = roles.find((r) => r.id === role)!;
  const isLogin = mode === "login";

  // Form panel — reused on both sides depending on mode
  const FormPanel = (
    <div className="w-full max-w-sm mx-auto">
      <h2 className="text-3xl font-bold tracking-tight text-center">
        {isLogin ? "Sign in" : "Create Account"}
      </h2>

      <div className="flex items-center justify-center gap-2 mt-3">
        <button type="button" aria-label="Continue with Google" onClick={() => toast.info("Google sign-in coming soon! For now, use email/password.")}
          className="h-10 w-10 rounded-full border border-border bg-white text-[15px] font-bold hover:scale-110 hover:shadow-glow transition-all flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="h-5 w-5"><path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h5.9c-.3 1.4-1 2.6-2.2 3.4v2.8h3.6c2.1-2 3.2-4.8 3.2-8.4z"/><path fill="#34A853" d="M12 23c2.9 0 5.4-1 7.2-2.6l-3.6-2.8c-1 .7-2.3 1.1-3.6 1.1-2.8 0-5.1-1.9-6-4.4H2.3v2.8C4.1 20.6 7.8 23 12 23z"/><path fill="#FBBC05" d="M6 14.3c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3V6.9H2.3C1.5 8.5 1 10.2 1 12s.5 3.5 1.3 5.1L6 14.3z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.4 2.1 14.9 1 12 1 7.8 1 4.1 3.4 2.3 6.9L6 9.7c.9-2.5 3.2-4.3 6-4.3z"/></svg>
        </button>
        <button type="button" aria-label="Continue with Apple" onClick={() => toast.info("Apple sign-in coming soon! For now, use email/password.")}
          className="h-10 w-10 rounded-full border border-border bg-black text-white hover:scale-110 hover:shadow-glow transition-all flex items-center justify-center">
          <Apple className="h-5 w-5 fill-white" />
        </button>
      </div>


      <p className="text-center text-[11px] text-muted-foreground mt-2">
        or use your email {isLogin ? "account" : "for registration"}
      </p>


      <form onSubmit={submit} className="mt-4 space-y-3">
        <AnimatePresence initial={false}>
          {!isLogin && (
            <motion.div
              key="name"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="pl-10 h-11 bg-white/70" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="pl-10 h-11 bg-white/70" />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="pl-10 pr-10 h-11 bg-white/70" />
          <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {!isLogin && (
          <div className="flex items-center gap-2">
            {(["Male", "Female"] as const).map((g) => (
              <button key={g} type="button" onClick={() => setGender(g)}
                className={`flex-1 h-10 rounded-full text-xs font-semibold border transition-all ${
                  gender === g
                    ? g === "Male"
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-transparent shadow-glow"
                      : "bg-gradient-to-r from-pink-500 to-rose-500 text-white border-transparent shadow-glow"
                    : "bg-white/70 text-muted-foreground border-border hover:border-primary/50"
                }`}>
                {g}
              </button>
            ))}
          </div>
        )}

        {isLogin && (
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground">
              <Checkbox id="remember" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked === true)} /> Remember me
            </label>
            <Link to="/forgot-password" search={{ role }}
              className={`bg-gradient-to-r ${active.gradient} bg-clip-text text-transparent font-semibold hover:underline`}>
              Forgot your password?
            </Link>
          </div>
        )}

        <Button type="button" onClick={authenticate} disabled={isLoading}
          className={`w-full h-11 rounded-full bg-gradient-to-r ${active.gradient} text-white font-bold tracking-wide shadow-glow hover:opacity-90 hover:scale-[1.02] transition disabled:opacity-60`}>
          {isLoading ? (isLogin ? "SIGNING IN..." : "CREATING ACCOUNT...") : (isLogin ? "SIGN IN" : "SIGN UP")}
        </Button>
      </form>
    </div>
  );

  // Welcome panel — colored side
  const WelcomePanel = (
    <div className="w-full max-w-sm mx-auto text-center text-white relative z-10 px-4">
      <motion.div
        key={`wp-${mode}-${role}`}
        initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          {isLogin ? active.welcomeTitle : "Welcome Back!"}
        </h2>
        <p className="mt-3 text-sm text-white/90 leading-relaxed">
          {isLogin
            ? active.welcomeBody
            : "Sign in to pick up right where you left off."}
        </p>
        <p className="mt-2 text-xs text-white/70 italic">{active.cta}</p>

        <button
          type="button"
          onClick={() => setMode(isLogin ? "signup" : "login")}
          className="mt-6 inline-flex items-center justify-center px-9 h-11 rounded-full border-2 border-white text-white font-bold tracking-widest text-sm hover:bg-white/15 transition-all hover:scale-105"
        >
          {isLogin ? "SIGN UP" : "SIGN IN"}
        </button>
      </motion.div>
    </div>
  );

  return (
    <div data-role={role} className="min-h-screen w-full flex transition-colors duration-700 relative overflow-hidden">
      {/* Hospital photo backdrop */}
      <img src={hospitalBg} alt="" aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover" />
      {/* Role-tinted gradient wash */}
      <div className={`absolute inset-0 bg-gradient-to-br ${active.bgClass} opacity-90 mix-blend-lighten`} />
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/20 to-white/60" />
      <div className="pointer-events-none absolute inset-0 glass-scene" aria-hidden="true" />

      {/* Animated blobs */}
      <motion.div
        key={`bg-${role}`}
        className={`pointer-events-none absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-gradient-to-br ${active.gradient} opacity-30 blur-3xl`}
        animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className={`pointer-events-none absolute -bottom-32 -right-32 h-[420px] w-[420px] rounded-full bg-gradient-to-br ${active.gradient} opacity-25 blur-3xl`}
        animate={{ scale: [1.2, 1, 1.2] }} transition={{ duration: 9, repeat: Infinity }}
      />

      <div className="relative z-10 mx-auto w-full max-w-4xl px-4 py-3 md:py-4 flex flex-col min-h-screen">
        {/* Top brand */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <MediLogo size={64} />
          <div>
            <div className={`text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r ${active.gradient} bg-clip-text text-transparent drop-shadow-sm`}>
              MediCore
            </div>
            <div className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground mt-0.5">Hospital Management</div>
          </div>
        </div>


        {/* Role selector */}
        <div className="max-w-xl mx-auto w-full mb-3">
          <div className="grid grid-cols-5 gap-2">
            {roles.map((r) => {
              const Icon = r.icon;
              const a = role === r.id;
              return (
                <motion.button
                  key={r.id} type="button" onClick={() => {
                    setRole(r.id);
                    const defaultEmail = r.id === 'super-admin' ? 'anasahmedcp@gmail.com' : 'abdulahadsip@gmail.com';
                    setEmail(defaultEmail);
                    if (!password) setPassword("password123");
                  }}
                  whileTap={{ scale: 0.93 }} whileHover={{ y: -2 }}
                  className={`relative flex flex-col items-center gap-1 p-2 rounded-xl border overflow-hidden transition-all ${
                    a ? "border-transparent shadow-glow" : "border-white/60 bg-white/45 backdrop-blur-xl hover:border-primary/50"
                  }`}
                >
                  {a && <motion.div layoutId="role-bg" className={`absolute inset-0 bg-gradient-to-br ${r.gradient}`} transition={{ type: "spring", stiffness: 300, damping: 30 }} />}
                  <Icon className={`relative z-10 h-4 w-4 ${a ? "text-white" : "text-muted-foreground"}`} />
                  <span className={`relative z-10 text-[10px] font-medium text-center leading-tight ${a ? "text-white" : "text-muted-foreground"}`}>{r.label}</span>
                </motion.button>
              );
            })}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-1.5 line-clamp-2">{active.desc}</p>
        </div>

        {/* Double card with sliding colored panel — responsive: stacks on mobile */}
        <div className={`relative w-full max-w-3xl mx-auto flex-1 min-h-[440px] max-h-[560px] hidden md:block rounded-3xl overflow-hidden shadow-elevated bg-white/70 backdrop-blur-2xl border border-white/60 ring-1 ring-black/5`}>
          {/* Subtle role tint wash inside the card */}
          <div className={`absolute inset-0 bg-gradient-to-br ${active.gradient} opacity-[0.06] pointer-events-none`} />
          <div className="absolute -top-24 left-1/4 h-56 w-56 rounded-full bg-white/60 blur-3xl pointer-events-none" />
          <div className={`absolute bottom-0 right-1/4 h-40 w-40 rounded-full bg-gradient-to-br ${active.gradient} opacity-20 blur-3xl pointer-events-none`} />

          <motion.div
            initial={false}
            animate={{ x: isLogin ? "100%" : "0%" }}
            transition={{ type: "spring", stiffness: 130, damping: 22 }}
            className={`absolute top-0 left-0 h-full w-1/2 bg-gradient-to-br ${active.gradient} z-20 flex items-center justify-center overflow-hidden`}
            style={{ borderRadius: isLogin ? "120px 24px 24px 120px" : "24px 120px 120px 24px" }}
          >
            <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/15 blur-2xl" />
            <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <motion.div className="absolute top-6 right-6 h-3 w-3 rounded-full bg-white/40"
              animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 2, repeat: Infinity }} />
            <motion.div className="absolute bottom-12 left-10 h-2 w-2 rounded-full bg-white/40"
              animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }} />
            <AnimatePresence mode="wait">
              <motion.div key={`${mode}-${role}`}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.35, delay: 0.1 }}
                className="w-full">
                {WelcomePanel}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <div className="absolute inset-0 flex">
            <div className={`w-1/2 h-full flex items-center justify-center p-5 transition-opacity duration-300 ${isLogin ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
              {isLogin && FormPanel}
            </div>
            <div className={`w-1/2 h-full flex items-center justify-center p-5 transition-opacity duration-300 ${!isLogin ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
              {!isLogin && FormPanel}
            </div>
          </div>
        </div>

        {/* Mobile stacked card */}
        <div className="md:hidden glass-card rounded-3xl overflow-hidden shadow-elevated w-full max-w-md mx-auto">
          <div className={`bg-gradient-to-br ${active.gradient} p-5 text-center text-white`}>
            <h2 className="text-2xl font-bold">{isLogin ? active.welcomeTitle : "Welcome Back!"}</h2>
            <p className="mt-1 text-xs text-white/90">{isLogin ? active.welcomeBody : "Sign in to pick up where you left off."}</p>
            <button type="button" onClick={() => setMode(isLogin ? "signup" : "login")}
              className="mt-3 inline-flex items-center justify-center px-6 h-9 rounded-full border-2 border-white text-white font-bold tracking-widest text-xs hover:bg-white/15 transition-all">
              {isLogin ? "SIGN UP" : "SIGN IN"}
            </button>
          </div>
          <div className="p-5">{FormPanel}</div>
        </div>

        <p className="text-[11px] text-muted-foreground text-center mt-3">
          Demo mode — use any email/password. Your role is set above.
        </p>
      </div>
    </div>
  );
}

