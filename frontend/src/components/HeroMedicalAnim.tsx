import { motion } from "framer-motion";

/** HeroMedicalAnim — animated medical visual: pulsing heart, orbiting molecules, EKG line, DNA helix. */
export function HeroMedicalAnim() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Orbiting molecules */}
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="absolute top-1/2 left-1/2 h-3 w-3 rounded-full"
          style={{
            background: ["#3b82f6", "#10b981", "#ef4444", "#f59e0b", "#a855f7"][i],
            boxShadow: `0 0 20px ${["#3b82f6", "#10b981", "#ef4444", "#f59e0b", "#a855f7"][i]}`,
          }}
          animate={{
            x: [
              Math.cos((i / 5) * Math.PI * 2) * 140,
              Math.cos((i / 5) * Math.PI * 2 + Math.PI * 2) * 140,
            ],
            y: [
              Math.sin((i / 5) * Math.PI * 2) * 140,
              Math.sin((i / 5) * Math.PI * 2 + Math.PI * 2) * 140,
            ],
          }}
          transition={{ duration: 8 + i, repeat: Infinity, ease: "linear" }}
        />
      ))}

      {/* Central pulsing heart */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.svg
          width="180" height="180" viewBox="0 0 100 100"
          animate={{ scale: [1, 1.08, 1, 1.12, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        >
          <defs>
            <linearGradient id="heartGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            <filter id="heartGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d="M50 85 C 20 60, 10 35, 30 25 C 40 20, 50 30, 50 40 C 50 30, 60 20, 70 25 C 90 35, 80 60, 50 85 Z"
            fill="url(#heartGrad)"
            filter="url(#heartGlow)"
            opacity="0.9"
          />
        </motion.svg>
      </div>

      {/* EKG line */}
      <svg
        className="absolute bottom-20 left-0 w-full"
        height="80"
        viewBox="0 0 800 80"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M0 40 L150 40 L170 40 L180 15 L195 65 L210 40 L380 40 L395 40 L405 5 L420 75 L435 40 L600 40 L615 40 L625 20 L640 60 L655 40 L800 40"
          stroke="#10b981"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: [0, 1, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ filter: "drop-shadow(0 0 6px #10b981)" }}
        />
      </svg>

      {/* DNA helix dots */}
      <svg className="absolute top-10 right-10 opacity-60" width="120" height="220" viewBox="0 0 120 220">
        {Array.from({ length: 12 }).map((_, i) => {
          const y = 10 + i * 18;
          const phase = (i / 12) * Math.PI * 2;
          const x1 = Math.round((60 + Math.sin(phase) * 35) * 1000) / 1000;
          const x2 = Math.round((60 + Math.sin(phase + Math.PI) * 35) * 1000) / 1000;
          return (
            <g key={i}>
              <motion.circle
                cx={x1}
                cy={y}
                r="4"
                fill="#3b82f6"
                animate={{ x: [0, x2 - x1] }}
                transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
              />
              <motion.circle
                cx={x2}
                cy={y}
                r="4"
                fill="#ef4444"
                animate={{ x: [0, x1 - x2] }}
                transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
              />
            </g>
          );
        })}
      </svg>

      {/* Floating plus icons */}
      {[
        { top: "15%", left: "10%", delay: 0, color: "#ef4444" },
        { top: "70%", left: "15%", delay: 1, color: "#10b981" },
        { top: "25%", right: "20%", delay: 2, color: "#3b82f6" },
        { top: "60%", right: "8%", delay: 0.5, color: "#f59e0b" },
      ].map((p, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl font-bold"
          style={{ ...p, color: p.color }}
          animate={{ y: [0, -20, 0], rotate: [0, 180, 360], opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 5, repeat: Infinity, delay: p.delay }}
        >
          +
        </motion.div>
      ))}
    </div>
  );
}
