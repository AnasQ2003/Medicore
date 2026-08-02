import { motion } from "framer-motion";

export function AmbulanceLoaderIcon() {
  return (
    <div className="relative flex flex-col items-center justify-center select-none" style={{ width: 340, height: 200 }}>

      {/* ── ROAD SURFACE ── */}
      <div
        className="absolute bottom-0 left-0 right-0 overflow-hidden"
        style={{ height: 68, background: "linear-gradient(180deg, #374151 0%, #1f2937 100%)" }}
      >
        {/* Road shoulder / edge line (top white solid line) */}
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: "#fff", opacity: 0.25 }} />

        {/* Moving white center-line dashes */}
        <div className="absolute overflow-hidden" style={{ top: 28, left: 0, right: 0, height: 8 }}>
          <motion.div
            animate={{ x: [0, -120] }}
            transition={{ repeat: Infinity, duration: 0.55, ease: "linear" }}
            className="flex"
            style={{ width: 600 }}
          >
            {[...Array(16)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: 48,
                  height: 7,
                  marginRight: 32,
                  borderRadius: 4,
                  background: "#facc15",
                  opacity: 0.85,
                  flexShrink: 0,
                }}
              />
            ))}
          </motion.div>
        </div>

        {/* Road shoulder / edge line (bottom white solid line) */}
        <div className="absolute bottom-6 left-0 right-0 h-0.5" style={{ background: "#fff", opacity: 0.15 }} />

        {/* Kerb / pavement strip */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{ height: 24, background: "linear-gradient(180deg, #6b7280 0%, #4b5563 100%)" }}
        />
      </div>

      {/* ── REALISTIC MOTION BLUR STREAKS (white/silver, behind ambulance) ── */}
      <div className="absolute flex flex-col gap-2" style={{ left: 20, top: 78 }}>
        {[
          { w: 52, opacity: 0.55, delay: 0 },
          { w: 36, opacity: 0.4, delay: 0.1 },
          { w: 64, opacity: 0.65, delay: 0.05 },
        ].map((s, i) => (
          <motion.div
            key={i}
            animate={{ scaleX: [1, 0.3, 1], opacity: [s.opacity, 0.08, s.opacity], x: [0, -14, 0] }}
            transition={{ repeat: Infinity, duration: 0.5, delay: s.delay, ease: "easeInOut" }}
            style={{
              width: s.w,
              height: 4,
              borderRadius: 4,
              background: "linear-gradient(90deg, transparent 0%, #e2e8f0 60%, transparent 100%)",
              transformOrigin: "right center",
            }}
          />
        ))}
      </div>

      {/* ── BOUNCING AMBULANCE ── */}
      <motion.div
        animate={{ y: [0, -5, 0, -3, 0] }}
        transition={{ repeat: Infinity, duration: 0.65, ease: "easeInOut" }}
        className="absolute"
        style={{ bottom: 54, left: 80 }}
      >
        <svg
          width="180"
          height="110"
          viewBox="0 0 180 110"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_8px_24px_rgba(0,0,0,0.7)]"
        >
          {/* ── SIREN FLASH RAYS ── */}
          <motion.g
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.9, 1.3, 0.9] }}
            transition={{ repeat: Infinity, duration: 0.35, ease: "easeInOut" }}
            style={{ transformOrigin: "126px 14px" }}
          >
            <path d="M126 10L126 3" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M118 16L112 10" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M134 16L140 10" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
          </motion.g>

          {/* ── SIREN DOME ── */}
          <motion.ellipse
            cx="126" cy="20" rx="7" ry="5"
            fill="#ef4444"
            stroke="#0f172a"
            strokeWidth="2.5"
            animate={{ fill: ["#ef4444", "#fca5a5", "#ef4444"] }}
            transition={{ repeat: Infinity, duration: 0.3 }}
          />

          {/* ── MAIN BODY (rear box) ── */}
          <rect x="28" y="22" width="88" height="58" rx="7" fill="white" stroke="#0f172a" strokeWidth="3.5" />

          {/* ── CABIN (front) ── */}
          <path
            d="M116 36H144C149 36 153 40 153 45V72C153 76 149.4 79 145 79H116V36Z"
            fill="white"
            stroke="#0f172a"
            strokeWidth="3.5"
          />

          {/* ── REAR WINDOW ── */}
          <rect x="40" y="30" width="14" height="28" rx="4" fill="#7dd3fc" stroke="#0f172a" strokeWidth="2.5" />
          <line x1="42" y1="34" x2="50" y2="54" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7" />

          {/* ── CAB WINDOW ── */}
          <path
            d="M124 42H140C143 42 146 44.7 146 47.5V63H124V42Z"
            fill="#7dd3fc"
            stroke="#0f172a"
            strokeWidth="2.5"
          />
          <line x1="128" y1="45" x2="140" y2="61" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7" />

          {/* ── RED EMERGENCY STRIPE ── */}
          <rect x="28" y="60" width="125" height="9" fill="#ef4444" />

          {/* ── MEDICAL CROSS ── */}
          <rect x="78" y="37" width="8" height="20" rx="2" fill="#ef4444" stroke="#0f172a" strokeWidth="2" />
          <rect x="71" y="44" width="22" height="8" rx="2" fill="#ef4444" stroke="#0f172a" strokeWidth="2" />

          {/* ── BUMPERS ── */}
          <rect x="20" y="68" width="10" height="10" rx="3" fill="#94a3b8" stroke="#0f172a" strokeWidth="2.5" />
          <rect x="150" y="68" width="10" height="10" rx="3" fill="#94a3b8" stroke="#0f172a" strokeWidth="2.5" />

          {/* ── REAR WHEEL ── */}
          <circle cx="62" cy="80" r="16" fill="#1e293b" />
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.4, ease: "linear" }}
            style={{ transformOrigin: "62px 80px" }}
          >
            <circle cx="62" cy="80" r="16" fill="#1e293b" />
            <circle cx="62" cy="80" r="9" fill="#cbd5e1" />
            <circle cx="62" cy="80" r="4" fill="#1e293b" />
            {/* Spokes */}
            <line x1="62" y1="72" x2="62" y2="88" stroke="#1e293b" strokeWidth="2.5" />
            <line x1="54" y1="80" x2="70" y2="80" stroke="#1e293b" strokeWidth="2.5" />
            <line x1="56.3" y1="74.3" x2="67.7" y2="85.7" stroke="#1e293b" strokeWidth="2.5" />
            <line x1="67.7" y1="74.3" x2="56.3" y2="85.7" stroke="#1e293b" strokeWidth="2.5" />
          </motion.g>
          <circle cx="62" cy="80" r="16" fill="none" stroke="#0f172a" strokeWidth="3" />

          {/* ── FRONT WHEEL ── */}
          <circle cx="128" cy="80" r="16" fill="#1e293b" />
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.4, ease: "linear" }}
            style={{ transformOrigin: "128px 80px" }}
          >
            <circle cx="128" cy="80" r="9" fill="#cbd5e1" />
            <circle cx="128" cy="80" r="4" fill="#1e293b" />
            {/* Spokes */}
            <line x1="128" y1="72" x2="128" y2="88" stroke="#1e293b" strokeWidth="2.5" />
            <line x1="120" y1="80" x2="136" y2="80" stroke="#1e293b" strokeWidth="2.5" />
            <line x1="122.3" y1="74.3" x2="133.7" y2="85.7" stroke="#1e293b" strokeWidth="2.5" />
            <line x1="133.7" y1="74.3" x2="122.3" y2="85.7" stroke="#1e293b" strokeWidth="2.5" />
          </motion.g>
          <circle cx="128" cy="80" r="16" fill="none" stroke="#0f172a" strokeWidth="3" />

          {/* ── WHEEL ARCHES ── */}
          <path d="M46 80 A16 16 0 0 1 78 80" fill="none" stroke="#0f172a" strokeWidth="4" />
          <path d="M112 80 A16 16 0 0 1 144 80" fill="none" stroke="#0f172a" strokeWidth="4" />
        </svg>
      </motion.div>
    </div>
  );
}
