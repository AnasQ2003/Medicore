import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Heart, ShieldCheck, Phone, Mail, Globe, Activity,
  CheckCircle2, Zap, Lock, Award, Clock, Shield, FileText, Cookie, X
} from "lucide-react";
import { getUser, type Role } from "@/lib/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const roleQuickLinks: Record<Role, { label: string; to: string }[]> = {
  doctor: [
    { label: "My Appointments", to: "/doctor/appointments" },
    { label: "Patient Directory EMR", to: "/doctor/patients" },
    { label: "Issue Prescriptions", to: "/doctor/prescriptions" },
    { label: "Clinical & Lab Reports", to: "/doctor/reports" },
    { label: "Schedule & Availability", to: "/doctor/schedule" },
  ],
  patient: [
    { label: "My Appointments", to: "/patient/appointments" },
    { label: "Active Prescriptions", to: "/patient/prescriptions" },
    { label: "Diagnostic Lab Reports", to: "/patient/reports" },
    { label: "Billing & Invoices", to: "/patient/bills" },
    { label: "Download Health Records", to: "/patient/downloads" },
  ],
  nurse: [
    { label: "Bed Allocation & Wards", to: "/nurse/beds" },
    { label: "Patient Vitals Tracker", to: "/nurse/vitals" },
    { label: "Medication Dispense Queue", to: "/nurse/medications" },
    { label: "Nursing Tasks", to: "/nurse/tasks" },
    { label: "Injection Queue", to: "/nurse/injections" },
  ],
  receptionist: [
    { label: "OPD Patient Queue", to: "/receptionist/queue" },
    { label: "New Patient Registration", to: "/receptionist/register" },
    { label: "Book Clinic Appointment", to: "/receptionist/appointments" },
    { label: "Hospital Invoicing & Billing", to: "/receptionist/billing" },
    { label: "Doctor Directory", to: "/receptionist/doctors" },
  ],
  "super-admin": [
    { label: "Hospital System Overview", to: "/super-admin" },
    { label: "Doctors & Consultants", to: "/super-admin/doctors" },
    { label: "Hospital Staff Roster", to: "/super-admin/staff" },
    { label: "Network Branches", to: "/super-admin/hospitals" },
    { label: "Audit & System Analytics", to: "/super-admin/analytics" },
  ],
};

const policyContent: Record<string, Record<Role, string>> = {
  "Privacy Policy": {
    doctor: "MediCore HMS strictly adheres to HIPAA and PMDC privacy mandates. As a doctor, all clinical patient records, diagnostic notes, and prescriptions recorded under your account are end-to-end encrypted. Patient EMR data may only be accessed for direct care delivery.",
    patient: "Your personal health information (PHI) is protected with AES-256 encryption. We never sell or share your medical data with third parties. You maintain full rights to access, download, or request deletion of your health records at any time.",
    nurse: "Nurse ward records, vitals logs, and medication dispense confirmations are cryptographically signed to maintain patient confidentiality and nursing audit compliance across all shift rotations.",
    receptionist: "Front-desk patient intake records and contact details are handled with strict privacy controls. Access to detailed clinical diagnoses is restricted to authorized medical officers.",
    "super-admin": "System-wide administrative governance logs strictly monitor all database queries and user session tokens to ensure total compliance with ISO 27001 data protection standards.",
  },
  "Terms of Service": {
    doctor: "By using MediCore HMS EMR, medical staff agree to uphold clinical documentation standards, verify prescription dosages prior to digital signing, and report system anomalies to IT support immediately.",
    patient: "Patient Portal terms govern online appointment booking, digital prescription downloads, and billing payments. Emergency medical situations require calling local helpline 1122 or visiting ER immediately.",
    nurse: "Nursing staff agree to record vitals accurately at scheduled intervals and verify medication administration against barcoded patient IDs.",
    receptionist: "Front desk operators agree to maintain accurate appointment queue data, verify patient identity upon check-in, and collect official receipts for all hospital transactions.",
    "super-admin": "Super Admin credentials carry full infrastructure responsibility including database backups, role privilege enforcement, and security audit log maintenance.",
  },
  "Cookie Policy": {
    doctor: "MediCore HMS uses essential session cookies to keep your clinical workstation securely authenticated without storing sensitive medical records in local browser memory.",
    patient: "Essential cookies ensure seamless authentication across your patient dashboard, prescription downloads, and appointment history views.",
    nurse: "Station cookies maintain active nurse session state across ward tablets without retaining unencrypted patient vitals.",
    receptionist: "Queue management cookies maintain real-time front desk status counters and search filter preferences.",
    "super-admin": "Administrative session cookies employ strict SameSite=Strict and Secure flags to protect system audit logs.",
  },
};

export function Footer() {
  const year = new Date().getFullYear();
  const currentUser = getUser();
  const currentRole: Role = currentUser?.role || "patient";
  const links = roleQuickLinks[currentRole] || roleQuickLinks.patient;
  const [activePolicy, setActivePolicy] = useState<string | null>(null);

  return (
    <footer className="mt-auto border-t border-border/50 bg-gradient-to-b from-transparent to-muted/40">
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

          {/* Role-Specific Quick Links */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-foreground uppercase tracking-widest">Quick Links</div>
              <span className="text-[10px] font-semibold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-md">
                {currentRole}
              </span>
            </div>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              {links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to as any}
                    className="flex items-center gap-1.5 hover:text-primary transition-colors group font-medium"
                  >
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/40 group-hover:bg-primary transition-colors" />
                    {link.label}
                  </Link>
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
                  <div className="font-medium text-foreground">Clinical Support</div>
                  <div className="text-[11px]">care@medicore.app</div>
                </div>
              </a>
              <div className="flex items-center gap-2 pt-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[11px]">Support: 24/7 Clinical Desk</span>
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
          {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
            <button
              key={item}
              onClick={() => setActivePolicy(item)}
              className="hover:text-primary transition-colors cursor-pointer font-medium"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Role-tailored Policy Modal */}
      <Dialog open={!!activePolicy} onOpenChange={() => setActivePolicy(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> {activePolicy}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Role-tailored governance policy for <strong className="uppercase text-primary">{currentRole}</strong>
            </DialogDescription>
          </DialogHeader>
          {activePolicy && (
            <div className="space-y-4 pt-2 text-xs">
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/60 text-foreground leading-relaxed">
                {policyContent[activePolicy]?.[currentRole] || policyContent[activePolicy]?.patient}
              </div>
              <div className="flex justify-between items-center text-[11px] text-muted-foreground pt-2 border-t">
                <span>Effective Date: August 2026</span>
                <span className="font-semibold text-emerald-600">Verified HIPAA & PMDC Compliant</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </footer>
  );
}
