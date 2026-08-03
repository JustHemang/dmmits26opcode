"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

export function MatchRing({
  value,
  size = 64,
  stroke = 6,
  label,
  className,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const mv = useMotionValue(c);
  const spring = useSpring(mv, { stiffness: 80, damping: 20 });
  const targetOffset = c * (1 - value / 100);
  const color = value >= 85 ? "#2dd4a7" : value >= 70 ? "#4f8dff" : "#ff9933";

  useEffect(() => {
    if (inView) mv.set(targetOffset);
  }, [inView, targetOffset, mv]);

  useEffect(() => {
    const unsub = spring.on("change", (v) => setDisplay(Math.round((1 - v / c) * 100)));
    return unsub;
  }, [spring, c]);

  return (
    <div ref={ref} className={cn("relative inline-grid place-items-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          style={{ strokeDashoffset: spring }}
          initial={false}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="text-sm font-bold text-white">{display}%</span>
      </div>
      {label && <span className="absolute -bottom-5 text-[10px] font-medium uppercase tracking-wider text-navy-400">{label}</span>}
    </div>
  );
}

export function Bar({
  value,
  color,
  label,
  suffix = "%",
  delay = 0,
}: {
  value: number;
  color?: string;
  label?: string;
  suffix?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [w, setW] = useState(0);

  useEffect(() => {
    if (inView) {
      const t = setTimeout(() => setW(value), 80 + delay);
      return () => clearTimeout(t);
    }
  }, [inView, value, delay]);

  return (
    <div ref={ref}>
      {label && (
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="font-medium text-navy-200">{label}</span>
          <span className="text-white">{Math.round(value)}{suffix}</span>
        </div>
      )}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${w}%`,
            background: color ?? "linear-gradient(90deg, #3d7bff, #00b4ff)",
            boxShadow: "0 0 12px rgba(61,123,255,0.5)",
          }}
        />
      </div>
    </div>
  );
}

export function StatBar({ value, color, height = "h-2" }: { value: number; color: string; height?: string }) {
  return (
    <div className={cn("w-full overflow-hidden rounded-full bg-white/8", height)}>
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${value}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="h-full rounded-full"
        style={{ background: color, boxShadow: `0 0 12px ${color}` }}
      />
    </div>
  );
}

export function StepProgress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-white/8", className)}>
      <motion.div
        animate={{ width: `${Math.max(2, Math.min(100, value))}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="ring-conic h-full rounded-full"
        style={{ boxShadow: "0 0 16px rgba(61,123,255,0.6)" }}
      />
    </div>
  );
}
