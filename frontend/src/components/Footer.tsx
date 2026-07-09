import { Link } from "@tanstack/react-router";
import { Heart, ShieldCheck, Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/70 glass-panel">
      <div className="px-4 md:px-6 py-5 grid gap-4 md:grid-cols-3 items-center text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Heart className="h-4 w-4 text-rose-500" />
          <span><span className="font-semibold text-foreground">MediCore</span> — Hospital Management System</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <a href="#" className="hover:text-primary transition-colors">Privacy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms</a>
          <a href="#" className="hover:text-primary transition-colors">Support</a>
          <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-emerald-500"/>HIPAA</span>
        </div>
        <div className="flex items-center justify-center md:justify-end gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Phone className="h-3 w-3"/>+92 51 111-MEDI</span>
          <span className="flex items-center gap-1"><Mail className="h-3 w-3"/>care@medicore.app</span>
        </div>
      </div>
      <div className="border-t border-border/50 px-4 md:px-6 py-2.5 text-center text-[11px] text-muted-foreground">
        © {new Date().getFullYear()} MediCore Health Systems. All rights reserved.
      </div>
    </footer>
  );
}
