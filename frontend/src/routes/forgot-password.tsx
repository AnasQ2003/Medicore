import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  ArrowLeft, Mail, KeyRound, CheckCircle2, Shield, Stethoscope,
  HeartPulse, UserRound, UserCog, Eye, EyeOff, Lock, Loader2, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MediLogo } from "@/components/MediLogo";
import type { Role } from "@/lib/auth";

export const Route = createFileRoute("/forgot-password")({
  validateSearch: (search: Record<string, unknown>): { role?: Role } => {
    return {
      role: (search.role as Role) || undefined,
    };
  },
  head: () => ({ meta: [{ title: "Reset password — MediCore HMS" }] }),
  component: ForgotPasswordScreen,
});

const roles: { id: Role; label: string; icon: typeof Shield; gradient: string; bgClass: string }[] = [
  { id: "super-admin", label: "Super Admin", icon: Shield, gradient: "from-violet-500 to-fuchsia-600", bgClass: "from-violet-50 via-fuchsia-50 to-rose-50" },
  { id: "doctor", label: "Doctor", icon: Stethoscope, gradient: "from-blue-500 to-cyan-500", bgClass: "from-blue-50 via-sky-50 to-cyan-50" },
  { id: "nurse", label: "Nurse", icon: HeartPulse, gradient: "from-rose-500 to-pink-600", bgClass: "from-rose-50 via-pink-50 to-red-50" },
  { id: "receptionist", label: "Receptionist", icon: UserCog, gradient: "from-emerald-500 to-teal-600", bgClass: "from-emerald-50 via-teal-50 to-green-50" },
  { id: "patient", label: "Patient", icon: UserRound, gradient: "from-amber-500 to-orange-600", bgClass: "from-amber-50 via-orange-50 to-yellow-50" },
];

// Known demo users in the system (for email-matching simulation)
const KNOWN_EMAILS = [
  "anasahmedcp@gmail.com",
  "abdulahadsip@gmail.com",
  "admin@medicore.com",
  "doctor@medicore.com",
  "nurse@medicore.com",
  "reception@medicore.com",
  "patient@medicore.com",
];

function ForgotPasswordScreen() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [step, setStep] = useState<"email" | "email_sent" | "reset" | "done">("email");
  const [role, setRole] = useState<Role>("doctor");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [pw, setPw] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [checking, setChecking] = useState(false);
  const [emailMatched, setEmailMatched] = useState(false);

  useEffect(() => {
    if (search?.role && roles.some(r => r.id === search.role)) {
      setRole(search.role);
      const defaultEmail = search.role === "super-admin" ? "anasahmedcp@gmail.com" : "abdulahadsip@gmail.com";
      setEmail(defaultEmail);
    }
  }, [search?.role]);

  const active = roles.find((r) => r.id === role)!;

  const sentTime = new Date().toLocaleString("en-PK", {
    weekday: "long", year: "numeric", month: "long",
    day: "numeric", hour: "2-digit", minute: "2-digit"
  });

  const checkEmail = async () => {
    if (!email.trim()) { setEmailError("Please enter your email address"); return; }
    if (!email.includes("@")) { setEmailError("Enter a valid email address"); return; }
    setEmailError("");
    setChecking(true);


    // Try backend API first
    let matched = false;
    try {
      const res = await fetch("http://localhost:5000/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), role }),
      });
      const data = await res.json();
      matched = data.exists === true;
    } catch {
      // Backend not available — will fall through to KNOWN_EMAILS
    }

    // Always also check the local demo list (covers seeded demo accounts
    // that may not exist in the backend DB yet)
    if (!matched) {
      matched = KNOWN_EMAILS.map(e => e.toLowerCase()).includes(email.trim().toLowerCase());
    }

    await new Promise(r => setTimeout(r, 800));
    setChecking(false);

    if (matched) {
      setEmailMatched(true);
      toast.success(`Password reset instructions sent to ${email}!`, {
        description: `Check your inbox. Redirecting to ${active.label} login...`,
      });
      navigate({ to: "/login", search: { role } });
    } else {
      setEmailError("No account found with this email address. Please check and try again.");
    }
  };

  const resetPassword = () => {
    if (pw.length < 6) return toast.error("Password must be at least 6 characters");
    if (pw !== pwConfirm) return toast.error("Passwords do not match");
    setStep("done");
    toast.success("Password reset successfully!", {
      description: "You can now sign in with your new credentials."
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (step === "email") checkEmail();
      else if (step === "reset") resetPassword();
    }
  };

  return (
    <div
      data-role={role}
      className={`min-h-screen w-full flex items-center justify-center transition-colors duration-700 bg-gradient-to-br ${active.bgClass} relative overflow-hidden p-6`}
      onKeyDown={handleKeyDown}
    >
      <div className="pointer-events-none absolute inset-0 glass-scene" aria-hidden="true" />

      <motion.div
        key={`fp-bg-${role}`}
        className={`absolute -top-32 -left-32 h-[400px] w-[400px] rounded-full bg-gradient-to-br ${active.gradient} opacity-25 blur-3xl`}
        animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 7, repeat: Infinity }}
      />
      <motion.div
        className={`absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-gradient-to-br ${active.gradient} opacity-20 blur-3xl`}
        animate={{ scale: [1.15, 1, 1.15] }} transition={{ duration: 8, repeat: Infinity }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 glass-card w-full max-w-lg rounded-3xl p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <Link to="/login" search={{ role }} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Back to sign in
          </Link>
          <MediLogo size={44} animated={false} />
        </div>

        {/* Step header */}
        <AnimatePresence mode="wait">
          <motion.div key={`header-${step}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
            <h1 className="text-3xl font-bold tracking-tight">
              {step === "email" && "Forgot password?"}
              {step === "email_sent" && "Check your email"}
              {step === "reset" && "Create new password"}
              {step === "done" && "All done!"}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              {step === "email" && "Enter the email linked to your MediCore account to receive password reset instructions."}
              {step === "email_sent" && `A password reset link has been sent to ${email}. Review the email preview below, then set your new password.`}
              {step === "reset" && "Choose a strong new password for your account."}
              {step === "done" && "Your password has been updated. You can now sign in."}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Role selector */}
        {step === "email" && (
          <div className="mt-5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Account type</Label>
            <div className="mt-2 grid grid-cols-5 gap-2">
              {roles.map((r) => {
                const Icon = r.icon;
                const a = role === r.id;
                return (
                  <button key={r.id} type="button" onClick={() => {
                    setRole(r.id);
                    const defaultEmail = r.id === "super-admin" ? "anasahmedcp@gmail.com" : "abdulahadsip@gmail.com";
                    setEmail(defaultEmail);
                    setEmailError("");
                  }}
                    className={`relative flex flex-col items-center gap-1 p-2 rounded-xl border overflow-hidden transition-all ${
                      a ? "border-transparent shadow-glow" : "border-white/60 bg-white/45 hover:border-primary/50"
                    }`}>
                    {a && <div className={`absolute inset-0 bg-gradient-to-br ${r.gradient}`} />}
                    <Icon className={`relative z-10 h-4 w-4 ${a ? "text-white" : "text-muted-foreground"}`} />
                    <span className={`relative z-10 text-[9px] font-medium leading-tight text-center ${a ? "text-white" : "text-muted-foreground"}`}>{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="mt-6 space-y-4"
          >
            {/* EMAIL STEP */}
            {step === "email" && (
              <div className="space-y-4">
                <div>
                  <Label>Email address</Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                      placeholder="you@hospital.com"
                      className={`pl-10 h-11 ${emailError ? "border-destructive" : ""}`}
                      type="email"
                      autoComplete="email"
                    />
                  </div>
                  {emailError && (
                    <div className="flex items-center gap-1.5 mt-2 text-sm text-destructive">
                      <AlertTriangle className="h-4 w-4 shrink-0"/>
                      {emailError}
                    </div>
                  )}
                </div>
                <Button
                  onClick={checkEmail}
                  disabled={checking}
                  className={`w-full h-11 bg-gradient-to-r ${active.gradient} text-white font-semibold shadow-glow hover:opacity-90`}
                >
                  {checking ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin"/>Checking your account…</>
                  ) : "Send reset instructions"}
                </Button>
              </div>
            )}

            {/* EMAIL SENT STEP */}
            {step === "email_sent" && (
              <div className="space-y-4">
                {/* Professional Email Preview */}
                <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-lg bg-white text-slate-800">
                  {/* Email client chrome */}
                  <div className="bg-slate-100 px-4 py-3 flex items-center gap-3 border-b">
                    <div className="flex gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-rose-400"/>
                      <div className="h-3 w-3 rounded-full bg-amber-400"/>
                      <div className="h-3 w-3 rounded-full bg-emerald-400"/>
                    </div>
                    <div className="flex-1 bg-white rounded-lg px-3 py-1 text-xs text-slate-500 truncate font-mono">
                      📧 Reset Your MediCore Password
                    </div>
                  </div>
                  {/* Email meta */}
                  <div className="px-4 py-2.5 border-b bg-slate-50 text-xs text-slate-500 space-y-0.5">
                    <div><span className="font-semibold text-slate-700">From:</span> no-reply@medicore-hms.com</div>
                    <div><span className="font-semibold text-slate-700">To:</span> {email}</div>
                    <div><span className="font-semibold text-slate-700">Date:</span> {sentTime}</div>
                  </div>
                  {/* Email body */}
                  <div className="p-5 text-sm space-y-4">
                    {/* Banner */}
                    <div className={`rounded-xl bg-gradient-to-r ${active.gradient} text-white px-5 py-4 text-center`}>
                      <div className="text-lg font-bold tracking-tight">🏥 MediCore HMS</div>
                      <div className="text-white/80 text-xs">Hospital Management System</div>
                    </div>
                    <p className="text-slate-700">Hello,</p>
                    <p className="text-slate-600 leading-relaxed">
                      We received a request to reset the password for your <strong>MediCore HMS</strong> account
                      ({active.label}) registered under <span className="font-mono text-primary font-semibold">{email}</span>.
                    </p>
                    <div className="rounded-xl bg-slate-50 border-2 border-slate-100 p-4 text-center">
                      <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-2">Action Required</p>
                      <p className="text-slate-700 text-sm font-medium">
                        Use the form below to set your new password directly in the app.
                      </p>
                      <div className={`mt-3 inline-block rounded-lg bg-gradient-to-r ${active.gradient} text-white px-5 py-2 text-sm font-semibold`}>
                        Reset Password ↓
                      </div>
                    </div>
                    <p className="text-slate-500 text-xs">
                      If you did not request this reset, please ignore this message. Your account remains secure.
                    </p>
                    <div className="border-t pt-3 text-xs text-slate-400 flex items-center gap-1.5">
                      <Lock className="h-3 w-3"/>
                      © 2026 MediCore HMS · F-8 Markaz, Islamabad
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => setStep("reset")}
                  className={`w-full h-11 bg-gradient-to-r ${active.gradient} text-white font-semibold shadow-glow hover:opacity-90`}
                >
                  Proceed to reset password →
                </Button>
              </div>
            )}

            {/* RESET PASSWORD STEP */}
            {step === "reset" && (
              <div className="space-y-4">
                <div>
                  <Label>New password</Label>
                  <div className="relative mt-1.5">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showPw ? "text" : "password"}
                      value={pw}
                      onChange={(e) => setPw(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="pl-10 pr-10 h-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPw ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                    </button>
                  </div>
                  {pw && (
                    <div className="mt-1.5 flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${pw.length >= (i + 1) * 2 ? (pw.length >= 8 ? "bg-emerald-500" : pw.length >= 6 ? "bg-amber-400" : "bg-rose-400") : "bg-slate-200"}`}/>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <Label>Confirm new password</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      value={pwConfirm}
                      onChange={(e) => setPwConfirm(e.target.value)}
                      placeholder="Repeat password"
                      className="pl-10 h-11"
                    />
                  </div>
                  {pwConfirm && pw !== pwConfirm && (
                    <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3"/>Passwords do not match</p>
                  )}
                  {pwConfirm && pw === pwConfirm && pw.length >= 6 && (
                    <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
                      <CheckCircle2 className="h-3 w-3"/>Passwords match
                    </p>
                  )}
                </div>
                <Button
                  onClick={resetPassword}
                  className={`w-full h-11 bg-gradient-to-r ${active.gradient} text-white font-semibold shadow-glow hover:opacity-90`}
                >
                  Reset my password
                </Button>
              </div>
            )}

            {/* DONE STEP */}
            {step === "done" && (
              <div className="flex flex-col items-center py-6 gap-4">
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className={`h-24 w-24 rounded-full bg-gradient-to-br ${active.gradient} flex items-center justify-center shadow-glow`}
                >
                  <CheckCircle2 className="h-12 w-12 text-white" />
                </motion.div>
                <p className="text-sm text-center text-muted-foreground max-w-xs">
                  Your password has been reset successfully. You can now sign in with your new credentials.
                </p>
                <Button
                  onClick={() => navigate({ to: "/login" })}
                  className={`w-full h-11 bg-gradient-to-r ${active.gradient} text-white font-semibold shadow-glow hover:opacity-90`}
                >
                  Continue to sign in
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {step !== "done" && step !== "reset" && step !== "email_sent" && (
          <div className="mt-4 text-center text-xs text-muted-foreground">
            Remembered it?{" "}
            <Link
              to="/login"
              search={{ role }}
              className={`bg-gradient-to-r ${active.gradient} bg-clip-text text-transparent font-semibold hover:underline`}
            >
              Sign in instead
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
