import { Link } from "@tanstack/react-router";
import {
  Heart, ShieldCheck, Phone, Mail, Globe, Activity,
  CheckCircle2, Zap, Lock, Award, Clock
} from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border/50" style={{ background: "linear-gradient(to bottom, transparent, oklch(0.97 0.01 220 / 80%))" }}>
      {/* Main footer grid */}
      <div className="px-4 md:px-8 pt-8 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand column */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-sm">
                <Heart className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="font-bold text-base text-foreground tracking-tight">MediCore HMS</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Healthcare Platform</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Pakistan's most advanced hospital management system — powering smarter, safer, and faster healthcare delivery across multiple branches.
            </p>
            {/* System Status */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-700">All Systems Operational</span>
              <span className="ml-auto text-[10px] text-emerald-600 font-mono">99.98%</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-foreground uppercase tracking-widest">Quick Links</div>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              {[
                { label: "Patient Portal", href: "/patient" },
                { label: "Doctor Dashboard", href: "/doctor" },
                { label: "Appointments", href: "#" },
                { label: "Lab Reports", href: "#" },
                { label: "Billing & Invoices", href: "#" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="flex items-center gap-1.5 hover:text-primary transition-colors group"
                  >
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/40 group-hover:bg-primary transition-colors" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Compliance & Security */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-foreground uppercase tracking-widest">Compliance</div>
            <div className="space-y-2">
              {[
                { icon: ShieldCheck, label: "HIPAA Compliant", color: "text-emerald-600", bg: "bg-emerald-50" },
                { icon: Lock, label: "ISO 27001 Certified", color: "text-blue-600", bg: "bg-blue-50" },
                { icon: Award, label: "HL7 FHIR Ready", color: "text-violet-600", bg: "bg-violet-50" },
                { icon: Zap, label: "256-bit AES Encrypted", color: "text-amber-600", bg: "bg-amber-50" },
              ].map(({ icon: Icon, label, color, bg }) => (
                <div key={label} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${bg}`}>
                  <Icon className={`h-3.5 w-3.5 ${color} flex-shrink-0`} />
                  <span className={`text-xs font-medium ${color}`}>{label}</span>
                  <CheckCircle2 className={`h-3 w-3 ${color} ml-auto`} />
                </div>
              ))}
            </div>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-foreground uppercase tracking-widest">Contact & Support</div>
            <div className="space-y-2.5 text-xs text-muted-foreground">
              <a href="tel:+925111163000" className="flex items-center gap-2.5 hover:text-primary transition-colors group">
                <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-foreground">Emergency Helpline</div>
                  <div className="text-[11px]">+92 51 111-MEDI (6334)</div>
                </div>
              </a>
              <a href="mailto:care@medicore.app" className="flex items-center gap-2.5 hover:text-primary transition-colors group">
                <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Mail className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-foreground">Patient Support</div>
                  <div className="text-[11px]">care@medicore.app</div>
                </div>
              </a>
              <a href="#" className="flex items-center gap-2.5 hover:text-primary transition-colors group">
                <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Globe className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-foreground">Web Portal</div>
                  <div className="text-[11px]">www.medicore.app</div>
                </div>
              </a>
              <div className="flex items-center gap-2 pt-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[11px]">Support: Mon–Sat, 8AM–10PM PKT</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border/40 px-4 md:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span>© {year} MediCore Health Systems Pvt. Ltd. All rights reserved.</span>
          <span className="mx-1.5 opacity-40">•</span>
          <Activity className="h-3 w-3 text-primary" />
          <span className="text-primary font-medium">v2.6.0</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
          {["Privacy Policy", "Terms of Service", "Cookie Policy", "Sitemap"].map((item) => (
            <a key={item} href="#" className="hover:text-primary transition-colors">{item}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}
