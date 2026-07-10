import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Mail, KeyRound, CheckCircle2, Shield, Stethoscope, HeartPulse, UserRound, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MediLogo } from "@/components/MediLogo";
import type { Role } from "@/lib/auth";

export const Route = createFileRoute("/forgot-password")({
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

function ForgotPasswordScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "otp" | "reset" | "done">("email");
  const [role, setRole] = useState<Role>("doctor");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [pw, setPw] = useState("");
  const active = roles.find((r) => r.id === role)!;

  const submit = () => {
    if (step === "email") {
      if (!email) return toast.error("Enter your email");
      toast.success("OTP sent to " + email);
      setStep("otp");
    } else if (step === "otp") {
      if (otp.length < 4) return toast.error("Enter the 6-digit code");
      setStep("reset");
    } else if (step === "reset") {
      if (pw.length < 6) return toast.error("Password too short");
      setStep("done");
      toast.success("Password reset successfully");
    } else {
      navigate({ to: "/login" });
    }
  };

  return (
    <div data-role={role} className={`min-h-screen w-full flex items-center justify-center transition-colors duration-700 bg-gradient-to-br ${active.bgClass} relative overflow-hidden p-6`}>
      <div className="pointer-events-none absolute inset-0 glass-scene" aria-hidden="true" />

      {/* floating accent blobs */}
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
        transition={{ duration: 0.5 }}
        className="relative z-10 glass-card w-full max-w-md rounded-3xl p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to sign in
          </Link>
          <MediLogo size={44} animated={false} />
        </div>

        <h1 className="text-3xl font-bold tracking-tight">
          {step === "email" && "Forgot password?"}
          {step === "otp" && "Check your inbox"}
          {step === "reset" && "Set a new password"}
          {step === "done" && "All set!"}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {step === "email" && "Enter the email associated with your MediCore account and we'll send a 6-digit code."}
          {step === "otp" && `We sent a verification code to ${email}. Enter it below.`}
          {step === "reset" && "Pick a strong password you haven't used before."}
          {step === "done" && "Your password has been updated. You can now sign in."}
        </p>

        {/* role selector — keeps theme consistent */}
        {step === "email" && (
          <div className="mt-6">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Account type</Label>
            <div className="mt-2 grid grid-cols-5 gap-2">
              {roles.map((r) => {
                const Icon = r.icon;
                const a = role === r.id;
                return (
                  <button key={r.id} type="button" onClick={() => setRole(r.id)}
                    className={`relative flex flex-col items-center gap-1 p-2 rounded-xl border overflow-hidden transition-all ${
                      a ? "border-transparent shadow-glow" : "border-white/60 bg-white/45 hover:border-primary/50"
                    }`}>
                    {a && <div className={`absolute inset-0 bg-gradient-to-br ${r.gradient}`} />}
                    <Icon className={`relative z-10 h-4 w-4 ${a ? "text-white" : "text-muted-foreground"}`} />
                    <span className={`relative z-10 text-[9px] font-medium ${a ? "text-white" : "text-muted-foreground"}`}>{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="mt-6 space-y-4"
          >
            {step === "email" && (
              <div>
                <Label>Email</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@hospital.com" className="pl-10 h-11" />
                </div>
              </div>
            )}
            {step === "otp" && (
              <div>
                <Label>6-digit code</Label>
                <Input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="••••••" className="h-12 text-center text-2xl tracking-[0.5em] font-mono" maxLength={6} />
                <button type="button" onClick={() => toast.success("Code resent")} className="text-xs text-primary hover:underline mt-2">
                  Didn't get it? Resend code
                </button>
              </div>
            )}
            {step === "reset" && (
              <div>
                <Label>New password</Label>
                <div className="relative mt-1.5">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="At least 6 characters" className="pl-10 h-11" />
                </div>
              </div>
            )}
            {step === "done" && (
              <div className="flex flex-col items-center py-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
                  className={`h-20 w-20 rounded-full bg-gradient-to-br ${active.gradient} flex items-center justify-center shadow-glow`}>
                  <CheckCircle2 className="h-10 w-10 text-white" />
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <Button onClick={submit} className={`mt-6 w-full h-11 bg-gradient-to-r ${active.gradient} text-white font-semibold shadow-glow hover:opacity-90`}>
          {step === "email" && "Send reset code"}
          {step === "otp" && "Verify code"}
          {step === "reset" && "Reset password"}
          {step === "done" && "Continue to sign in"}
        </Button>

        {step !== "done" && (
          <div className="mt-4 text-center text-xs text-muted-foreground">
            Remembered it?{" "}
            <Link to="/login" className={`bg-gradient-to-r ${active.gradient} bg-clip-text text-transparent font-semibold hover:underline`}>
              Sign in instead
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
