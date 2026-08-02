import { motion, AnimatePresence } from "framer-motion";
import { AmbulanceLoaderIcon } from "./AmbulanceLoaderIcon";

interface MediCoreLoaderProps {
  show: boolean;
}

export function MediCoreLoader({ show }: MediCoreLoaderProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md"
        >
          {/* PURE AMBULANCE MOVING ANIMATION ONLY */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="flex items-center justify-center"
          >
            <AmbulanceLoaderIcon />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
