import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles, TrendingUp, ShieldCheck, Zap } from "lucide-react";

export interface Slide {
  title: string;
  subtitle?: string;
  body: string;
  gradient: string; // tailwind classes for bg
  emoji?: string;
  badge?: string;
  stats?: { label: string; value: string; change?: string }[];
}

/** Creative & Animated Slideshow — auto-rotating colorful slides with effects & timer. */
export function Slideshow({ slides, interval = 5000 }: { slides: Slide[]; interval?: number }) {
  const [i, setI] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = () => setI((p) => (p + 1) % slides.length);
  const prev = () => setI((p) => (p - 1 + slides.length) % slides.length);

  useEffect(() => {
    if (isPaused) return;
    const t = setInterval(next, interval);
    return () => clearInterval(t);
  }, [interval, slides.length, isPaused]);

  const s = slides[i];

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative overflow-hidden rounded-2xl h-full min-h-[380px] shadow-elevated group border border-white/20"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 1.08, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.94, filter: "blur(4px)" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className={`absolute inset-0 ${s.gradient} p-7 md:p-8 flex flex-col justify-between text-white overflow-hidden`}
        >
          {/* Animated Background Mesh & Glowing Blobs */}
          <motion.div
            className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/25 blur-3xl pointer-events-none"
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.25, 0.45, 0.25],
              x: [0, -20, 0],
              y: [0, 20, 0],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-black/20 blur-3xl pointer-events-none"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.35, 0.2],
            }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Floating Emoji / Icon Banner */}
          <motion.div
            className="absolute top-4 right-6 text-7xl select-none opacity-25 filter drop-shadow-lg"
            animate={{
              rotate: [0, 10, -10, 0],
              y: [0, -8, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            {s.emoji || "✨"}
          </motion.div>

          {/* Slide Content Header */}
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2">
              {s.subtitle && (
                <span className="text-[11px] uppercase tracking-[0.25em] font-extrabold text-white/90 bg-white/15 px-3 py-1 rounded-full border border-white/20 backdrop-blur-md flex items-center gap-1.5 shadow-sm">
                  <Sparkles className="h-3 w-3 text-amber-300 animate-pulse" />
                  {s.subtitle}
                </span>
              )}
              {s.badge && (
                <span className="text-[10px] uppercase font-bold bg-amber-400 text-amber-950 px-2.5 py-0.5 rounded-full shadow-glow">
                  {s.badge}
                </span>
              )}
            </div>

            <motion.h3
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white drop-shadow-sm max-w-lg"
            >
              {s.title}
            </motion.h3>

            <motion.p
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-sm md:text-base text-white/90 leading-relaxed max-w-xl font-normal drop-shadow-sm"
            >
              {s.body}
            </motion.p>
          </div>

          {/* Dynamic Stats Cards Grid */}
          {s.stats && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="relative z-10 grid grid-cols-3 gap-3 mt-6"
            >
              {s.stats.map((st, idx) => (
                <motion.div
                  key={st.label}
                  whileHover={{ scale: 1.04, y: -2 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-2xl bg-white/15 backdrop-blur-xl p-3.5 border border-white/30 shadow-lg hover:border-white/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xl md:text-2xl font-black text-white tracking-tight">
                      {st.value}
                    </div>
                    {st.change && (
                      <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/40 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                        <TrendingUp className="h-2.5 w-2.5" /> {st.change}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] md:text-[11px] uppercase tracking-wider font-semibold text-white/80 mt-1">
                    {st.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Progress Bar Timer */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-30 overflow-hidden">
        <motion.div
          key={i + (isPaused ? "-paused" : "")}
          initial={{ width: "0%" }}
          animate={{ width: isPaused ? "100%" : "100%" }}
          transition={{ duration: isPaused ? 0 : interval / 1000, ease: "linear" }}
          className="h-full bg-white shadow-glow"
        />
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-30 h-10 w-10 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/20 transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-30 h-10 w-10 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/20 transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === i
                ? "w-7 bg-white shadow-glow"
                : "w-2 bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
