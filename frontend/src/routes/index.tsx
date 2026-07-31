import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useMemo } from "react";
import hospitalSplashBg from "@/assets/hospital-splash-bg.jpg";
import { getUser, roleMeta } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MediCore — Hospital Management System" },
      { name: "description", content: "All-in-one HMS for hospitals: patients, doctors, appointments, pharmacy, IPD and more." },
      { property: "og:title", content: "MediCore — Hospital Management System" },
      { property: "og:description", content: "All-in-one HMS for hospitals: patients, doctors, appointments, pharmacy, IPD and more." },
    ],
  }),
  component: SplashScreen,
});

function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = getUser();
    if (user && roleMeta[user.role]) {
      navigate({ to: roleMeta[user.role].path });
      return;
    }
    const t = setTimeout(() => {
      navigate({ to: "/login" });
    }, 600);
    return () => clearTimeout(t);
  }, [navigate]);

  const monitorBars = useMemo(
    () => [42, 58, 34, 72, 49, 66, 38, 82, 54, 61, 45, 76],
    []
  );

  const careNodes = useMemo(
    () => [
      { left: "18%", top: "41%", label: "ER", delay: 0 },
      { left: "33%", top: "35%", label: "NURSE", delay: 0.35 },
      { left: "70%", top: "42%", label: "ICU", delay: 0.7 },
      { left: "82%", top: "54%", label: "BED", delay: 1.05 },
    ],
    []
  );

  const floorLines = useMemo(() => Array.from({ length: 9 }, (_, i) => i), []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-[#06131b]">
      <img
        src={hospitalSplashBg}
        alt="Modern hospital corridor with nurse station and patient rooms"
        width={1920}
        height={1088}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <motion.div
        className="absolute inset-0 scale-105"
        style={{
          backgroundImage: `url(${hospitalSplashBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(18px)",
          opacity: 0.22,
        }}
        animate={{ scale: [1.05, 1.1, 1.05], opacity: [0.18, 0.28, 0.18] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(1,14,22,0.72)_0%,rgba(5,32,42,0.34)_43%,rgba(1,12,18,0.58)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.13)_0%,rgba(8,47,73,0.16)_36%,rgba(2,6,23,0.62)_82%)]" />
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_160px_54px_rgba(0,0,0,0.66)]" />

      <svg className="absolute inset-0 h-full w-full opacity-[0.08] pointer-events-none" aria-hidden="true">
        <filter id="hospital-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" />
        </filter>
        <rect width="100%" height="100%" filter="url(#hospital-noise)" />
      </svg>

      <motion.div
        className="absolute inset-x-0 top-0 h-1/3 bg-[linear-gradient(180deg,rgba(125,211,252,0.22),transparent)]"
        animate={{ opacity: [0.35, 0.65, 0.35] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Hospital scan sweep */}
      <motion.div
        className="absolute inset-y-0 w-20 bg-[linear-gradient(90deg,transparent,rgba(103,232,249,0.16),rgba(255,255,255,0.09),transparent)] blur-sm"
        initial={{ x: "-20vw" }}
        animate={{ x: "120vw" }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Clinical perspective floor grid */}
      <div className="absolute bottom-[-12%] left-1/2 h-[38vh] w-[118vw] -translate-x-1/2 opacity-38" style={{ perspective: "900px" }}>
        <div
          className="relative h-full w-full origin-bottom border-t border-cyan-200/20"
          style={{ transform: "rotateX(66deg)", transformStyle: "preserve-3d" }}
        >
          {floorLines.map((line) => (
            <motion.span
              key={`floor-h-${line}`}
              className="absolute left-0 h-px w-full bg-cyan-100/18"
              style={{ bottom: `${line * 12}%` }}
              animate={{ opacity: [0.08, 0.32, 0.08] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: line * 0.12 }}
            />
          ))}
          {floorLines.map((line) => (
            <span
              key={`floor-v-${line}`}
              className="absolute bottom-0 h-full w-px bg-cyan-100/14"
              style={{ left: `${line * 12.5}%`, transform: `skewX(${line < 4 ? 12 : -12}deg)` }}
            />
          ))}
        </div>
      </div>

      {/* Connected care points attached to hospital spaces */}
      <svg className="absolute inset-0 h-full w-full pointer-events-none" aria-hidden="true">
        <motion.path
          d="M292 498 C520 375, 682 430, 820 515 S1160 650, 1340 505"
          stroke="rgba(103,232,249,0.42)"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="7 10"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0, 1], opacity: [0.2, 0.75, 0.2] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
          style={{ filter: "drop-shadow(0 0 8px rgba(34,211,238,0.7))" }}
        />
      </svg>

      {careNodes.map((node) => (
        <motion.div
          key={node.label}
          className="absolute hidden md:flex items-center gap-2 rounded-full border border-cyan-100/20 bg-slate-950/32 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-50/80 backdrop-blur-md"
          style={{ left: node.left, top: node.top }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: [0.42, 0.92, 0.42], y: [0, -6, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, delay: node.delay, ease: "easeInOut" }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.9)]" />
          {node.label}
        </motion.div>
      ))}

      {/* Left vitals monitor glass */}
      <motion.div
        className="absolute left-6 top-1/2 hidden w-80 -translate-y-1/2 overflow-hidden rounded-2xl border border-cyan-100/20 bg-slate-950/32 p-5 shadow-[0_24px_80px_rgba(8,47,73,0.28)] backdrop-blur-md lg:block"
        initial={{ opacity: 0, x: -40, rotateY: -10 }}
        animate={{ opacity: 1, x: 0, rotateY: [-7, -2, -7] }}
        transition={{ duration: 1.2, rotateY: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="mb-4 flex items-center justify-between text-[10px] uppercase tracking-[0.28em] text-cyan-100/64">
          <div className="flex items-center gap-2">
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-rose-400"
              animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.4, 1] }}
              transition={{ duration: 0.85, repeat: Infinity }}
            />
            <span>Patient · Bed 12</span>
          </div>
          <span className="text-emerald-300/90">STABLE</span>
        </div>

        {/* Big BPM readout with pulsing heart */}
        <div className="mb-3 flex items-end justify-between">
          <div>
            <div className="text-[9px] uppercase tracking-[0.28em] text-cyan-100/60">Heart Rate</div>
            <div className="flex items-baseline gap-1.5">
              <motion.span
                className="text-4xl font-bold text-rose-300 tabular-nums drop-shadow-[0_0_12px_rgba(251,113,133,0.55)]"
                animate={{ opacity: [1, 0.75, 1] }}
                transition={{ duration: 0.85, repeat: Infinity }}
              >
                72
              </motion.span>
              <span className="text-[10px] uppercase tracking-widest text-cyan-100/60">bpm</span>
            </div>
          </div>
          <motion.svg
            width="42" height="42" viewBox="0 0 32 32"
            animate={{ scale: [1, 1.18, 1, 1.22, 1] }}
            transition={{ duration: 0.85, repeat: Infinity, times: [0, 0.15, 0.35, 0.5, 1] }}
          >
            <path
              d="M16 28 C 6 20, 2 12, 8 8 C 12 5.5, 16 10, 16 13 C 16 10, 20 5.5, 24 8 C 30 12, 26 20, 16 28 Z"
              fill="#f43f5e"
              style={{ filter: "drop-shadow(0 0 6px rgba(244,63,94,0.85))" }}
            />
          </motion.svg>
        </div>

        <svg width="278" height="72" viewBox="0 0 278 72" className="mb-4 overflow-visible">
          <defs>
            <linearGradient id="vital-glow" x1="0" x2="1">
              <stop offset="0%" stopColor="#67e8f9" />
              <stop offset="50%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3].map((r) => (
            <line key={`h${r}`} x1="0" x2="278" y1={12 + r * 16} y2={12 + r * 16} stroke="rgba(103,232,249,0.08)" strokeWidth="1" />
          ))}
          {[0, 1, 2, 3, 4, 5].map((c) => (
            <line key={`v${c}`} y1="0" y2="72" x1={c * 46} x2={c * 46} stroke="rgba(103,232,249,0.08)" strokeWidth="1" />
          ))}
          <motion.path
            d="M0 38 L22 38 L32 38 L40 14 L50 62 L60 38 L96 38 L108 38 L118 6 L129 66 L140 38 L176 38 L188 38 L197 20 L206 56 L216 38 L278 38"
            stroke="url(#vital-glow)"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: [0, 1] }}
            transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
            style={{ filter: "drop-shadow(0 0 8px rgba(244,63,94,0.7))" }}
          />
          <motion.circle
            r="3"
            fill="#fecdd3"
            animate={{ cx: [0, 278] }}
            transition={{ duration: 1.7, repeat: Infinity, ease: "linear" }}
            style={{ filter: "drop-shadow(0 0 6px #f43f5e)" }}
          />
        </svg>

        {/* Additional vitals grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[
            { label: "SpO₂", value: "98", unit: "%", color: "text-cyan-200", glow: "rgba(103,232,249,0.5)", path: "M0 12 L14 12 L20 4 L26 20 L32 12 L60 12" },
            { label: "BP", value: "118/76", unit: "mmHg", color: "text-violet-200", glow: "rgba(196,181,253,0.5)", path: "M0 12 L18 12 L24 6 L30 18 L36 12 L60 12" },
            { label: "Resp", value: "16", unit: "/min", color: "text-emerald-200", glow: "rgba(110,231,183,0.5)", path: "M0 12 Q15 4 30 12 T60 12" },
            { label: "Temp", value: "36.8", unit: "°C", color: "text-amber-200", glow: "rgba(253,230,138,0.5)", path: "M0 14 L20 14 L25 8 L35 16 L40 14 L60 14" },
          ].map((v, i) => (
            <motion.div
              key={v.label}
              className="rounded-lg border border-white/8 bg-slate-950/40 px-2.5 py-2"
              animate={{ opacity: [0.75, 1, 0.75] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.3 }}
            >
              <div className="flex items-baseline justify-between">
                <span className="text-[9px] uppercase tracking-wider text-cyan-100/55">{v.label}</span>
                <span className="text-[8px] text-cyan-100/45">{v.unit}</span>
              </div>
              <div className={`text-lg font-semibold tabular-nums ${v.color}`} style={{ textShadow: `0 0 10px ${v.glow}` }}>
                {v.value}
              </div>
              <svg width="60" height="20" viewBox="0 0 60 24" className={`mt-0.5 opacity-80 ${v.color}`}>
                <motion.path
                  d={v.path}
                  stroke="currentColor"
                  strokeWidth="1.4"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: [0, 1] }}
                  transition={{ duration: 1.6 + i * 0.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
                />
              </svg>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-12 items-end gap-1 border-t border-cyan-100/12 pt-3">
          {monitorBars.map((bar, index) => (
            <motion.span
              key={index}
              className="rounded-t bg-gradient-to-t from-cyan-400/30 to-cyan-200/80 shadow-[0_0_10px_rgba(103,232,249,0.35)]"
              style={{ height: `${bar * 0.55}px` }}
              animate={{ scaleY: [0.5, 1, 0.65, 1.1, 0.7] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: index * 0.06, ease: "easeInOut" }}
            />
          ))}
        </div>
      </motion.div>

      {/* Right hospital operations panel */}
      <motion.div
        className="absolute right-6 top-1/2 hidden w-72 -translate-y-1/2 rounded-2xl border border-emerald-100/20 bg-slate-950/22 p-5 shadow-[0_24px_80px_rgba(6,78,59,0.26)] backdrop-blur-md xl:block"
        initial={{ opacity: 0, x: 40, rotateY: 10 }}
        animate={{ opacity: 1, x: 0, rotateY: [6, 1, 6] }}
        transition={{ duration: 1.2, rotateY: { duration: 6.5, repeat: Infinity, ease: "easeInOut" } }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="mb-4 flex items-center justify-between text-[10px] uppercase tracking-[0.28em] text-emerald-100/64">
          <span>Care Flow</span>
          <span className="flex items-center gap-1 text-emerald-300/80">
            <motion.span className="h-1.5 w-1.5 rounded-full bg-emerald-300" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }} />
            LIVE
          </span>
        </div>
        {[
          ["Appointments", "91%"],
          ["Pharmacy", "Synced"],
          ["Diagnostics", "Ready"],
          ["Beds", "24 Free"],
        ].map(([label, value], index) => (
          <motion.div
            key={label}
            className="mb-3 flex items-center justify-between rounded-xl border border-white/8 bg-white/7 px-3 py-3 text-sm text-cyan-50/84"
            animate={{ x: [0, index % 2 === 0 ? 4 : -4, 0], opacity: [0.72, 1, 0.72] }}
            transition={{ duration: 3, repeat: Infinity, delay: index * 0.25 }}
          >
            <span>{label}</span>
            <span className="font-semibold text-emerald-200">{value}</span>
          </motion.div>
        ))}

        {/* Admissions trend mini-chart */}
        <div className="mt-4 rounded-xl border border-white/8 bg-slate-950/40 p-3">
          <div className="mb-1 flex items-baseline justify-between">
            <span className="text-[9px] uppercase tracking-widest text-emerald-100/60">Admissions · 24h</span>
            <span className="text-xs font-semibold text-emerald-200 tabular-nums">+128</span>
          </div>
          <svg width="240" height="46" viewBox="0 0 240 46" className="overflow-visible">
            <defs>
              <linearGradient id="adm-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(52,211,153,0.55)" />
                <stop offset="100%" stopColor="rgba(52,211,153,0)" />
              </linearGradient>
            </defs>
            <motion.path
              d="M0 34 L24 28 L48 30 L72 20 L96 24 L120 14 L144 22 L168 10 L192 16 L216 6 L240 12 L240 46 L0 46 Z"
              fill="url(#adm-fill)"
              initial={{ opacity: 0 }} animate={{ opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 3.4, repeat: Infinity }}
            />
            <motion.path
              d="M0 34 L24 28 L48 30 L72 20 L96 24 L120 14 L144 22 L168 10 L192 16 L216 6 L240 12"
              stroke="#34d399" strokeWidth="1.6" fill="none" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              style={{ filter: "drop-shadow(0 0 6px rgba(52,211,153,0.7))" }}
            />
          </svg>
        </div>

        {/* Department load bars */}
        <div className="mt-3 space-y-2">
          {[
            { label: "ER", pct: 78, color: "bg-rose-400" },
            { label: "ICU", pct: 62, color: "bg-cyan-300" },
            { label: "OR", pct: 44, color: "bg-emerald-300" },
          ].map((d, i) => (
            <div key={d.label} className="flex items-center gap-2">
              <span className="w-6 text-[9px] uppercase tracking-widest text-cyan-100/55">{d.label}</span>
              <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
                <motion.div
                  className={`absolute inset-y-0 left-0 ${d.color} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: [`${d.pct - 8}%`, `${d.pct}%`, `${d.pct - 6}%`] }}
                  transition={{ duration: 2.6, repeat: Infinity, delay: i * 0.25, ease: "easeInOut" }}
                />
              </div>
              <span className="w-8 text-right text-[10px] font-semibold text-cyan-50/85 tabular-nums">{d.pct}%</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Ambient floating particles (soft light motes) */}
      {Array.from({ length: 22 }).map((_, i) => {
        const left = (i * 47) % 100;
        const top = (i * 73) % 100;
        const dur = 6 + (i % 5) * 1.4;
        const size = 2 + (i % 3);
        return (
          <motion.span
            key={`mote-${i}`}
            className="pointer-events-none absolute rounded-full bg-cyan-100/50"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              boxShadow: `0 0 ${6 + size * 2}px rgba(103,232,249,0.7)`,
            }}
            animate={{ y: [0, -40, 0], opacity: [0, 0.9, 0] }}
            transition={{ duration: dur, repeat: Infinity, delay: (i % 7) * 0.6, ease: "easeInOut" }}
          />
        );
      })}

      {/* DNA helix strand (left) */}
      <svg
        className="pointer-events-none absolute left-[3%] top-1/2 hidden h-[62vh] w-16 -translate-y-1/2 opacity-70 lg:block"
        viewBox="0 0 60 600"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="dna-a" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#67e8f9" stopOpacity="0" />
            <stop offset="50%" stopColor="#67e8f9" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#67e8f9" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="dna-b" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0" />
            <stop offset="50%" stopColor="#34d399" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d="M10 0 Q50 75 10 150 Q-30 225 10 300 Q50 375 10 450 Q-30 525 10 600"
          stroke="url(#dna-a)" strokeWidth="2" fill="none"
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M50 0 Q10 75 50 150 Q90 225 50 300 Q10 375 50 450 Q90 525 50 600"
          stroke="url(#dna-b)" strokeWidth="2" fill="none"
          animate={{ opacity: [0.9, 0.4, 0.9] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        />
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.line
            key={`rung-l-${i}`}
            x1="10" x2="50"
            y1={25 + i * 50} y2={25 + i * 50}
            stroke="#a5f3fc" strokeWidth="1.2" strokeOpacity="0.55"
            animate={{ opacity: [0.2, 0.85, 0.2] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </svg>

      {/* DNA helix strand (right) */}
      <svg
        className="pointer-events-none absolute right-[3%] top-1/2 hidden h-[62vh] w-16 -translate-y-1/2 opacity-70 lg:block"
        viewBox="0 0 60 600"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <motion.path
          d="M10 0 Q50 75 10 150 Q-30 225 10 300 Q50 375 10 450 Q-30 525 10 600"
          stroke="url(#dna-a)" strokeWidth="2" fill="none"
          animate={{ opacity: [0.9, 0.4, 0.9] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M50 0 Q10 75 50 150 Q90 225 50 300 Q10 375 50 450 Q90 525 50 600"
          stroke="url(#dna-b)" strokeWidth="2" fill="none"
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        />
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.line
            key={`rung-r-${i}`}
            x1="10" x2="50"
            y1={25 + i * 50} y2={25 + i * 50}
            stroke="#bbf7d0" strokeWidth="1.2" strokeOpacity="0.55"
            animate={{ opacity: [0.2, 0.85, 0.2] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 + 0.4 }}
          />
        ))}
      </svg>

      {/* Radar sweep behind scanner */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 opacity-45">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(103,232,249,0) 0deg, rgba(103,232,249,0.35) 40deg, rgba(103,232,249,0) 90deg)",
            maskImage: "radial-gradient(circle, black 55%, transparent 72%)",
            WebkitMaskImage: "radial-gradient(circle, black 55%, transparent 72%)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Bottom live metrics ticker */}
      <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-5 rounded-full border border-cyan-100/14 bg-slate-950/40 px-6 py-2 text-[10px] uppercase tracking-[0.28em] text-cyan-50/70 backdrop-blur-md md:flex">
        {[
          ["Active Staff", "482", "#34d399"],
          ["Patients Today", "1,204", "#67e8f9"],
          ["Avg. Wait", "4m 12s", "#fbbf24"],
          ["Uptime", "99.98%", "#a5b4fc"],
        ].map(([label, value, color], i) => (
          <div key={i} className="flex items-center gap-2">
            <motion.span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: color as string, boxShadow: `0 0 10px ${color}` }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.2 }}
            />
            <span>{label}</span>
            <span className="font-semibold text-cyan-50/95 tabular-nums" style={{ textShadow: `0 0 8px ${color}` }}>
              {value}
            </span>
            {i < 3 && <span className="ml-3 h-3 w-px bg-cyan-50/18" />}
          </div>
        ))}
      </div>

      {/* Center clinical 3D scanner */}
      <div className="absolute left-1/2 top-1/2 h-[540px] w-[540px] -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-75" style={{ perspective: "1300px" }}>
        <motion.div
          className="absolute inset-0 rounded-full border border-cyan-100/18"
          animate={{ rotateX: [64, 64], rotateZ: [0, 360] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          style={{ transformStyle: "preserve-3d", boxShadow: "0 0 80px rgba(34,211,238,0.12), inset 0 0 70px rgba(14,165,233,0.1)" }}
        />
        <motion.div
          className="absolute inset-10 rounded-full border border-emerald-100/18"
          animate={{ rotateX: [72, 72], rotateZ: [360, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
          style={{ transformStyle: "preserve-3d", boxShadow: "0 0 70px rgba(52,211,153,0.14)" }}
        />
        <motion.div
          className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-50/16 bg-cyan-50/5 backdrop-blur-[1px]"
          animate={{ scale: [0.96, 1.04, 0.96], opacity: [0.18, 0.34, 0.18] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          style={{ boxShadow: "0 0 70px rgba(125,211,252,0.24), inset 0 0 46px rgba(255,255,255,0.12)" }}
        />
        {[0, 1, 2].map((ring) => (
          <motion.div
            key={`scan-ring-${ring}`}
            className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100/22"
            animate={{ scale: [1, 2.35], opacity: [0.46, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, delay: ring * 0.72, ease: "easeOut" }}
          />
        ))}
      </div>

      <div className="absolute top-6 left-1/2 hidden -translate-x-1/2 items-center gap-6 rounded-full border border-cyan-100/12 bg-slate-950/24 px-5 py-2 text-[10px] uppercase tracking-[0.32em] text-cyan-50/55 backdrop-blur-md md:flex">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse shadow-[0_0_14px_rgba(110,231,183,0.9)]" />
          Hospital Network Online
        </div>
        <span className="h-3 w-px bg-cyan-50/18" />
        <div>Secure Care Channel</div>
        <span className="h-3 w-px bg-cyan-50/18" />
        <div>v4.2.1</div>
      </div>

      {/* ======= KEPT CENTER CONTENT ======= */}
      <div className="relative z-20 flex flex-col items-center gap-6 rounded-[2rem] border border-cyan-100/22 bg-slate-950/38 px-8 py-8 shadow-[0_30px_120px_rgba(2,132,199,0.34)] backdrop-blur-md sm:px-12">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0 }}
          className="flex items-center gap-2"
        >
          <motion.div
            className="h-2.5 w-2.5 rounded-full bg-rose-500"
            animate={{ scale: [1, 1.6, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.05, repeat: Infinity }}
          />
          <span className="text-[10px] uppercase tracking-[0.35em] text-cyan-50/90">Initializing • Sinus Rhythm • 72 BPM</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0, duration: 0.4 }}
          className="text-center"
        >
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-cyan-50 drop-shadow-[0_0_26px_rgba(103,232,249,0.55)]">
            MediCore
          </h1>
          <p className="text-cyan-50/82 mt-2 tracking-[0.25em] text-xs uppercase">Hospital Management System</p>
        </motion.div>

        <svg width="360" height="70" viewBox="0 0 360 70" className="opacity-90">
          <motion.path
            d="M0 35 L60 35 L75 35 L85 12 L95 58 L105 35 L170 35 L185 35 L195 5 L205 65 L215 35 L280 35 L295 35 L305 15 L315 55 L325 35 L360 35"
            stroke="#22d3ee"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: [0, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            style={{ filter: "drop-shadow(0 0 8px #22d3ee)" }}
          />
        </svg>

        <motion.div className="h-1 w-64 bg-cyan-50/18 rounded-full overflow-hidden shadow-[0_0_18px_rgba(103,232,249,0.16)]">
          <motion.div
            className="h-full bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-300"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </div>
  );
}
