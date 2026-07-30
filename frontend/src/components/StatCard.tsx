import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function StatCard({
  label, value, change, icon: Icon, delay = 0, to,
}: { label: string; value: string; change?: string; icon: LucideIcon; delay?: number; to?: string }) {
  const cardContent = (
    <>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="text-3xl font-bold mt-1 tracking-tight">{value}</div>
          {change && <div className="text-xs text-accent mt-1">{change}</div>}
        </div>
        <div className="h-11 w-11 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow ring-1 ring-white/30">
          <Icon className="h-5 w-5 text-primary-foreground" />
        </div>
      </div>
      <div className="absolute -bottom-8 -right-8 h-28 w-28 rounded-full bg-primary/15 blur-2xl" />
    </>
  );

  if (to) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        whileHover={{ y: -4 }}
        className="glass-card relative overflow-hidden rounded-2xl p-5 cursor-pointer hover:shadow-lg transition-shadow"
      >
        <Link to={to as any} className="absolute inset-0 z-10" />
        {cardContent}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4 }}
      className="glass-card relative overflow-hidden rounded-2xl p-5"
    >
      {cardContent}
    </motion.div>
  );
}
