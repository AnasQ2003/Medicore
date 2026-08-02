import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Activity, Sparkles, Cpu } from "lucide-react";
import { useState, useEffect } from "react";
import { MediLogo } from "./MediLogo";

interface MediCoreLoaderProps {
  show: boolean;
  message?: string;
}

export function MediCoreLoader({ show, message }: MediCoreLoaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!show) {
      setProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 4;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [show]);

  const getSubStatus = (p: number) => {
    if (p < 35) return "🔐 Initializing Encrypted MediCore Portal…";
    if (p < 75) return "🩺 Syncing Clinical Telemetry & EMR Database…";
    return "✨ Workspace Ready — Launching Dashboard…";
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-xl"
        >
          {/* Ambient Futuristic Background Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                scale: [1, 1.25, 1],
                opacity: [0.3, 0.6, 0.3],
                rotate: [0, 90, 180],
              }}
              transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
              className="absolute -top-32 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-gradient-to-tr from-cyan-500/20 via-blue-600/30 to-purple-600/20 blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute -bottom-32 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-gradient-to-br from-emerald-500/20 via-teal-600/30 to-blue-600/20 blur-3xl"
            />
          </div>

          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: -20 }}
            transition={{ type: "spring", damping: 22, stiffness: 300 }}
            className="relative flex flex-col items-center p-8 md:p-10 rounded-3xl bg-slate-900/95 border border-cyan-500/30 shadow-[0_0_80px_rgba(6,182,212,0.25)] max-w-md w-full text-center overflow-hidden"
          >
            {/* Holographic Top Laser Border Accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee]" />

            {/* 3D ROTATING ORBITAL SPINNER CONTAINER */}
            <div className="relative h-36 w-36 mb-6 flex items-center justify-center" style={{ perspective: 1000 }}>
              
              {/* Outer 3D Glowing Ring 1 */}
              <motion.div
                animate={{ rotateZ: 360, rotateX: [60, 45, 60], rotateY: [0, 180, 360] }}
                transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-cyan-400/40 border-t-cyan-400 border-r-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.5)]"
                style={{ transformStyle: "preserve-3d" }}
              />

              {/* Inner 3D Counter-Rotating Ring 2 */}
              <motion.div
                animate={{ rotateZ: -360, rotateX: [45, 75, 45], rotateY: [360, 180, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="absolute inset-2 rounded-full border-2 border-purple-500/30 border-b-purple-400 border-l-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                style={{ transformStyle: "preserve-3d" }}
              />

              {/* Third Orbit Ring - Emerald Pulse */}
              <motion.div
                animate={{ rotateZ: 180, scale: [0.9, 1.05, 0.9] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="absolute inset-5 rounded-full border border-dashed border-emerald-400/50"
              />

              {/* Floating 3D Core Glass Sphere & Logo */}
              <motion.div
                animate={{ y: [-4, 4, -4], scale: [1, 1.03, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="relative z-10 flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-700 shadow-[0_0_30px_rgba(6,182,212,0.6)] border border-cyan-300/40"
              >
                <MediLogo size={44} animated={false} />
              </motion.div>
            </div>

            {/* Title & Live Badge */}
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-cyan-400 animate-spin" />
              <span className="font-extrabold text-xl tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">
                MediCore HMS
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                v2.6 3D
              </span>
            </div>

            <p className="text-xs text-slate-300 font-medium mb-4 h-5 flex items-center justify-center">
              {message || getSubStatus(progress)}
            </p>

            {/* Futuristic Progress Bar with Glow */}
            <div className="w-full bg-slate-950/90 h-2.5 rounded-full overflow-hidden p-0.5 border border-cyan-500/30 shadow-inner relative mb-3">
              <motion.div
                style={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 rounded-full shadow-[0_0_15px_#22d3ee] transition-all duration-100"
              />
            </div>

            {/* Progress Percentage & Footer Badges */}
            <div className="w-full flex items-center justify-between text-slate-400 text-[11px] font-mono">
              <span className="flex items-center gap-1 text-cyan-400 font-semibold">
                <Cpu className="h-3.5 w-3.5 animate-pulse" /> Processing...
              </span>
              <span className="font-bold text-white text-xs">{progress}%</span>
            </div>

            {/* Bottom Security Note */}
            <div className="mt-5 pt-3 border-t border-slate-800/80 w-full flex items-center justify-center gap-2 text-[10px] text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>HIPAA Compliant 256-bit Encrypted Pipeline</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
