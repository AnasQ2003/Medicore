import { motion } from "framer-motion";

export function MediLogo({ size = 48, animated = true }: { size?: number; animated?: boolean }) {
  return (
    <motion.div
      initial={animated ? { rotateY: -180, opacity: 0 } : false}
      animate={animated ? { rotateY: 0, opacity: 1 } : false}
      transition={{ duration: 1, ease: "easeOut" }}
      style={{ width: size, height: size }}
      className="relative"
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-primary shadow-glow" />
      <svg
        viewBox="0 0 48 48"
        className="absolute inset-0 w-full h-full p-2"
        fill="none"
      >
        <path
          d="M24 8v32M8 24h32"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </svg>
    </motion.div>
  );
}
