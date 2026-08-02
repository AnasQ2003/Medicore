import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, HeartPulse } from "lucide-react";
import { MediLogo } from "./MediLogo";

interface MediCoreLoaderProps {
  show: boolean;
  message?: string;
}

export function MediCoreLoader({ show, message = "Loading MediCore Clinical Engine…" }: MediCoreLoaderProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.88, opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="flex flex-col items-center p-8 rounded-3xl bg-popover/98 border border-border/80 shadow-2xl max-w-sm w-full text-center relative overflow-hidden"
          >
            {/* Ambient Background Glow */}
            <div className="absolute -top-16 -right-16 h-36 w-36 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 h-36 w-36 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />

            {/* Glowing Logo Circle */}
            <div className="relative mb-5">
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                className="absolute -inset-3 rounded-3xl bg-primary/30 blur-xl"
              />
              <div className="relative flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-primary shadow-glow">
                <MediLogo size={44} animated={false} />
              </div>
            </div>

            {/* Title & Pulse Line */}
            <div className="flex items-center gap-2 mb-1">
              <HeartPulse className="h-4 w-4 text-rose-500 animate-pulse" />
              <span className="font-bold text-lg tracking-tight text-foreground">MediCore HMS</span>
            </div>
            <p className="text-xs text-muted-foreground mb-5 px-2">{message}</p>

            {/* Animated Loading Bar */}
            <div className="w-full bg-muted/60 h-1.5 rounded-full overflow-hidden relative mb-4">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                className="h-full w-2/3 bg-gradient-to-r from-primary via-cyan-400 to-emerald-400 rounded-full shadow-glow"
              />
            </div>

            {/* Security Badge Footnote */}
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground/80 font-mono">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>AES-256 Encrypted Session</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
