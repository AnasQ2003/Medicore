import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export function AmbulanceLoaderIcon() {
  const [isDark, setIsDark] = useState(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Color palettes
  const c = isDark
    ? {
        // NIGHT MODE
        body: "#1e293b",          // dark navy body
        bodyStroke: "#0f172a",
        stripe: "#7f1d1d",        // dark red stripe
        cross: "#991b1b",         // dark red cross
        crossStroke: "#0f172a",
        window: "#0c4a6e",        // dark teal windows
        windowStroke: "#0f172a",
        windowShine: "#1e40af",
        bumper: "#475569",
        bumperStroke: "#0f172a",
        wheelOuter: "#0f172a",
        wheelHub: "#334155",
        wheelCenter: "#0f172a",
        wheelSpoke: "#475569",
        wheelRim: "#0f172a",
        sirenColor: ["#dc2626", "#450a0a", "#dc2626"],
        sirenRay: "#dc2626",
        roadBg: "linear-gradient(180deg, #111827 0%, #0f172a 100%)",
        roadEdge: "rgba(255,255,255,0.12)",
        dashColor: "#ca8a04",
        kerbBg: "linear-gradient(180deg, #1f2937 0%, #111827 100%)",
        streakColor: "linear-gradient(90deg, transparent 0%, #94a3b8 60%, transparent 100%)",
      }
    : {
        // DAY MODE
        body: "#ffffff",
        bodyStroke: "#0f172a",
        stripe: "#ef4444",
        cross: "#ef4444",
        crossStroke: "#0f172a",
        window: "#7dd3fc",
        windowStroke: "#0f172a",
        windowShine: "#ffffff",
        bumper: "#94a3b8",
        bumperStroke: "#0f172a",
        wheelOuter: "#1e293b",
        wheelHub: "#cbd5e1",
        wheelCenter: "#1e293b",
        wheelSpoke: "#1e293b",
        wheelRim: "#0f172a",
        sirenColor: ["#ef4444", "#fca5a5", "#ef4444"],
        sirenRay: "#ef4444",
        roadBg: "linear-gradient(180deg, #374151 0%, #1f2937 100%)",
        roadEdge: "rgba(255,255,255,0.25)",
        dashColor: "#facc15",
        kerbBg: "linear-gradient(180deg, #6b7280 0%, #4b5563 100%)",
        streakColor: "linear-gradient(90deg, transparent 0%, #e2e8f0 60%, transparent 100%)",
      };

  return (
    <div
      className="relative flex flex-col items-center justify-center select-none"
      style={{ width: 340, height: 200 }}
    >
      {/* ── ROAD SURFACE ── */}
      <div
        className="absolute bottom-0 left-0 right-0 overflow-hidden"
        style={{ height: 68, background: c.roadBg }}
      >
        {/* Top edge line */}
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: c.roadEdge }} />

        {/* Moving center-line dashes */}
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
                  background: c.dashColor,
                  opacity: isDark ? 0.65 : 0.85,
                  flexShrink: 0,
                }}
              />
            ))}
          </motion.div>
        </div>

        {/* Bottom edge line */}
        <div className="absolute bottom-6 left-0 right-0 h-0.5" style={{ background: c.roadEdge, opacity: 0.6 }} />

        {/* Kerb strip */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{ height: 24, background: c.kerbBg }}
        />
      </div>

      {/* ── MOTION BLUR STREAKS ── */}
      <div className="absolute flex flex-col gap-2" style={{ left: 20, top: 78 }}>
        {[
          { w: 52, opacity: isDark ? 0.45 : 0.55, delay: 0 },
          { w: 36, opacity: isDark ? 0.3 : 0.4, delay: 0.1 },
          { w: 64, opacity: isDark ? 0.55 : 0.65, delay: 0.05 },
        ].map((s, i) => (
          <motion.div
            key={i}
            animate={{ scaleX: [1, 0.3, 1], opacity: [s.opacity, 0.06, s.opacity], x: [0, -14, 0] }}
            transition={{ repeat: Infinity, duration: 0.5, delay: s.delay, ease: "easeInOut" }}
            style={{
              width: s.w,
              height: 4,
              borderRadius: 4,
              background: c.streakColor,
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
          {/* SIREN RAYS */}
          <motion.g
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.9, 1.3, 0.9] }}
            transition={{ repeat: Infinity, duration: 0.35, ease: "easeInOut" }}
            style={{ transformOrigin: "126px 14px" }}
          >
            <path d="M126 10L126 3" stroke={c.sirenRay} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M118 16L112 10" stroke={c.sirenRay} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M134 16L140 10" stroke={c.sirenRay} strokeWidth="2.5" strokeLinecap="round" />
          </motion.g>

          {/* SIREN DOME */}
          <motion.ellipse
            cx="126" cy="20" rx="7" ry="5"
            fill={c.sirenColor[0]}
            stroke={c.bodyStroke}
            strokeWidth="2.5"
            animate={{ fill: c.sirenColor }}
            transition={{ repeat: Infinity, duration: 0.3 }}
          />

          {/* MAIN BODY */}
          <rect x="28" y="22" width="88" height="58" rx="7" fill={c.body} stroke={c.bodyStroke} strokeWidth="3.5" />

          {/* CABIN */}
          <path
            d="M116 36H144C149 36 153 40 153 45V72C153 76 149.4 79 145 79H116V36Z"
            fill={c.body}
            stroke={c.bodyStroke}
            strokeWidth="3.5"
          />

          {/* REAR WINDOW */}
          <rect x="40" y="30" width="14" height="28" rx="4" fill={c.window} stroke={c.windowStroke} strokeWidth="2.5" />
          <line x1="42" y1="34" x2="50" y2="54" stroke={c.windowShine} strokeWidth="2" strokeLinecap="round" opacity="0.5" />

          {/* CAB WINDOW */}
          <path
            d="M124 42H140C143 42 146 44.7 146 47.5V63H124V42Z"
            fill={c.window}
            stroke={c.windowStroke}
            strokeWidth="2.5"
          />
          <line x1="128" y1="45" x2="140" y2="61" stroke={c.windowShine} strokeWidth="2" strokeLinecap="round" opacity="0.5" />

          {/* EMERGENCY STRIPE */}
          <rect x="28" y="60" width="125" height="9" fill={c.stripe} />

          {/* MEDICAL CROSS */}
          <rect x="78" y="37" width="8" height="20" rx="2" fill={c.cross} stroke={c.crossStroke} strokeWidth="2" />
          <rect x="71" y="44" width="22" height="8" rx="2" fill={c.cross} stroke={c.crossStroke} strokeWidth="2" />

          {/* BUMPERS */}
          <rect x="20" y="68" width="10" height="10" rx="3" fill={c.bumper} stroke={c.bumperStroke} strokeWidth="2.5" />
          <rect x="150" y="68" width="10" height="10" rx="3" fill={c.bumper} stroke={c.bumperStroke} strokeWidth="2.5" />

          {/* REAR WHEEL */}
          <circle cx="62" cy="80" r="16" fill={c.wheelOuter} />
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.4, ease: "linear" }}
            style={{ transformOrigin: "62px 80px" }}
          >
            <circle cx="62" cy="80" r="9" fill={c.wheelHub} />
            <circle cx="62" cy="80" r="4" fill={c.wheelCenter} />
            <line x1="62" y1="72" x2="62" y2="88" stroke={c.wheelSpoke} strokeWidth="2.5" />
            <line x1="54" y1="80" x2="70" y2="80" stroke={c.wheelSpoke} strokeWidth="2.5" />
            <line x1="56.3" y1="74.3" x2="67.7" y2="85.7" stroke={c.wheelSpoke} strokeWidth="2.5" />
            <line x1="67.7" y1="74.3" x2="56.3" y2="85.7" stroke={c.wheelSpoke} strokeWidth="2.5" />
          </motion.g>
          <circle cx="62" cy="80" r="16" fill="none" stroke={c.wheelRim} strokeWidth="3" />

          {/* FRONT WHEEL */}
          <circle cx="128" cy="80" r="16" fill={c.wheelOuter} />
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.4, ease: "linear" }}
            style={{ transformOrigin: "128px 80px" }}
          >
            <circle cx="128" cy="80" r="9" fill={c.wheelHub} />
            <circle cx="128" cy="80" r="4" fill={c.wheelCenter} />
            <line x1="128" y1="72" x2="128" y2="88" stroke={c.wheelSpoke} strokeWidth="2.5" />
            <line x1="120" y1="80" x2="136" y2="80" stroke={c.wheelSpoke} strokeWidth="2.5" />
            <line x1="122.3" y1="74.3" x2="133.7" y2="85.7" stroke={c.wheelSpoke} strokeWidth="2.5" />
            <line x1="133.7" y1="74.3" x2="122.3" y2="85.7" stroke={c.wheelSpoke} strokeWidth="2.5" />
          </motion.g>
          <circle cx="128" cy="80" r="16" fill="none" stroke={c.wheelRim} strokeWidth="3" />

          {/* WHEEL ARCHES */}
          <path d="M46 80 A16 16 0 0 1 78 80" fill="none" stroke={c.bodyStroke} strokeWidth="4" />
          <path d="M112 80 A16 16 0 0 1 144 80" fill="none" stroke={c.bodyStroke} strokeWidth="4" />
        </svg>
      </motion.div>
    </div>
  );
}
