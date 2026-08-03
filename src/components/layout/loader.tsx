"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = ["Discover", "Match", "Learn", "Build", "Prove", "Get Hired"];

const CHIPS = [
  { label: "AI", className: "left-0 top-6 -translate-x-1/2", delay: 0.1 },
  { label: "Design", className: "right-2 top-16", delay: 0.5 },
  { label: "Code", className: "bottom-8 left-4", delay: 0.9 },
  { label: "Data", className: "right-0 top-0 translate-x-1/2", delay: 1.3 },
  { label: "Marketing", className: "bottom-0 left-1/2 -translate-x-1/2", delay: 1.7 },
];

const RING_STYLE = {
  background:
    "conic-gradient(from 0deg, #c99a5f, #e0b15a, #f7ecd7, #a06a35, #8d5a2b, #c99a5f)",
  WebkitMask:
    "radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 4px))",
  mask: "radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 4px))",
} as const;

export function LoadingScreen() {
  const [show, setShow] = useState(true);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const hide = setTimeout(() => setShow(false), 1650);
    const stepTimer = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 280);
    return () => {
      clearTimeout(hide);
      clearInterval(stepTimer);
    };
  }, []);

  const chips = useMemo(() => CHIPS, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="sih-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04, filter: "blur(6px)" }}
          transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-[#1c1712]"
          aria-label="Loading Skill India Hub"
          role="status"
        >
          <div className="absolute inset-0 grid-bg opacity-50" />
          <div className="aurora-orb left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 bg-saffron-500/20" />
          <div className="aurora-orb right-1/4 top-2/3 h-64 w-64 bg-electric-500/20" />

          <div className="relative flex flex-col items-center px-6 text-center">
            <div className="relative">
              <div
                className="absolute -inset-10 animate-conic rounded-full opacity-70"
                style={RING_STYLE}
              />
              <div
                className="absolute -inset-16 animate-conic rounded-full opacity-25 blur-[3px]"
                style={{ ...RING_STYLE, animationDuration: "9s" }}
              />

              <div className="relative grid h-28 w-28 place-items-center rounded-[2rem] bg-gradient-to-br from-[#a06a35] via-[#c99a5f] to-[#e0b15a] shadow-[0_0_70px_-10px_rgba(201,154,95,0.8)]">
                <motion.span
                  className="absolute inset-0 rounded-[2rem] bg-[#1c1712]/20"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                />
                <motion.div
                  initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.1 }}
                  className="relative"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="#1c1712" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className="h-14 w-14">
                    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
                  </svg>
                </motion.div>
              </div>

              {chips.map((c, i) => (
                <motion.span
                  key={c.label}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.12, type: "spring", stiffness: 260, damping: 18 }}
                  className={`absolute ${c.className} animate-float rounded-lg border border-[#c99a5f]/30 bg-[#241e16]/90 px-2.5 py-1 text-[11px] font-bold tracking-wide text-[#e0b15a] shadow-[0_0_18px_-4px_rgba(201,154,95,0.5)]`}
                  style={{ animationDelay: `${c.delay}s` }}
                >
                  {c.label}
                </motion.span>
              ))}
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-9 text-3xl font-bold tracking-tight"
            >
              <span className="text-gradient">
                Skill India <span className="bg-gradient-to-r from-[#c99a5f] to-[#e0b15a] bg-clip-text text-transparent">Hub</span>
              </span>
            </motion.h1>

            <div className="mt-3 flex h-6 items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={step}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#c4b69c]"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#e0b15a]" />
                  {STEPS[step]}
                </motion.span>
              </AnimatePresence>
            </div>

            <div className="mt-8 flex items-center gap-2">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-[#e0b15a]"
                  animate={{ opacity: [0.25, 1, 0.25], scale: [1, 1.5, 1] }}
                  transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
                />
              ))}
              <span className="ml-3 text-sm font-medium text-[#c4b69c]">Preparing your career hub</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
