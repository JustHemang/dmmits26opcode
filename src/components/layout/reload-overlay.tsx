"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/icon";

export function ReloadOverlay({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] grid place-items-center bg-navy-950/85 backdrop-blur-xl"
          aria-live="polite"
        >
          <motion.div
            initial={{ scale: 0.9, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 8 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-5"
          >
            <div className="relative grid h-16 w-16 place-items-center">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-2xl border-2 border-dashed border-electric-400/60"
              />
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-electric-500 to-sky-glow text-white shadow-glow-blue">
                <Icon name="Rocket" size={22} />
              </span>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold tracking-tight text-white">
                Skill India <span className="text-gradient">Hub</span>
              </p>
              <motion.p
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="mt-1 text-xs text-navy-300"
              >
                Loading your dashboard…
              </motion.p>
            </div>
            <div className="h-1 w-40 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
                className="h-full w-1/2 rounded-full bg-gradient-to-r from-electric-400 to-mint-400"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
