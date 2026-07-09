import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface Slide {
  title: string;
  subtitle?: string;
  body: string;
  gradient: string; // tailwind classes for bg
  emoji?: string;
  stats?: { label: string; value: string }[];
}

/** Slideshow — auto-rotating colorful slides with controls. */
export function Slideshow({ slides, interval = 4500 }: { slides: Slide[]; interval?: number }) {
  const [i, setI] = useState(0);
  const next = () => setI((p) => (p + 1) % slides.length);
  const prev = () => setI((p) => (p - 1 + slides.length) % slides.length);

  useEffect(() => {
    const t = setInterval(next, interval);
    return () => clearInterval(t);
  }, [interval, slides.length]);

  const s = slides[i];

  return (
    <div className="relative overflow-hidden rounded-2xl h-full min-h-[360px] shadow-elevated">
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.6 }}
          className={`absolute inset-0 ${s.gradient} p-7 flex flex-col justify-between text-white`}
        >
          {/* Decorative shapes */}
          <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/20 blur-2xl" />
          <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <motion.div
            className="absolute top-4 right-4 text-6xl opacity-30"
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            {s.emoji}
          </motion.div>

          <div className="relative z-10">
            {s.subtitle && (
              <div className="text-xs uppercase tracking-[0.3em] font-semibold opacity-80">{s.subtitle}</div>
            )}
            <h3 className="text-2xl md:text-3xl font-bold mt-2 leading-tight">{s.title}</h3>
            <p className="mt-3 text-sm opacity-90 leading-relaxed max-w-md">{s.body}</p>
          </div>

          {s.stats && (
            <div className="relative z-10 grid grid-cols-3 gap-3 mt-6">
              {s.stats.map((st) => (
                <motion.div
                  key={st.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-xl bg-white/15 backdrop-blur-md p-3 border border-white/20"
                >
                  <div className="text-2xl font-bold">{st.value}</div>
                  <div className="text-[10px] uppercase tracking-wider opacity-80">{st.label}</div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        aria-label="Previous"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        aria-label="Next"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            className={`h-1.5 rounded-full transition-all ${
              idx === i ? "w-6 bg-white" : "w-1.5 bg-white/50"
            }`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
