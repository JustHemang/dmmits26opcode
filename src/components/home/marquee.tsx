"use client";

import { motion } from "framer-motion";
import { Icon } from "@/components/ui/icon";

const ITEMS = [
  "AI Career Matching", "Skill Gap Analysis", "6-Month Roadmaps", "AI Resume Builder",
  "Digital Skill Passport", "3,500+ Live Opportunities", "Career Simulator", "Skill Quests",
  "Certified Training", "Career Copilot", "Application Tracker", "2M+ Youth Guided",
];

export function Marquee() {
  return (
    <div className="relative overflow-hidden border-y border-white/8 bg-white/2 py-4" aria-hidden="true">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-navy-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-navy-950 to-transparent" />
      <motion.div
        className="flex w-max animate-marquee gap-8"
        style={{ animationDuration: "34s" }}
      >
        {[...ITEMS, ...ITEMS].map((item, i) => (
          <span key={i} className="flex items-center gap-2 whitespace-nowrap text-sm font-medium text-navy-300">
            <Icon name="Sparkles" size={14} className="text-electric-400" />
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
