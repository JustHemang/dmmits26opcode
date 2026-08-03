"use client";

import { motion } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  sub,
  icon,
  accent = "from-electric-500 to-sky-glow",
  children,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  icon: string;
  accent?: string;
  children?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8 flex flex-wrap items-end justify-between gap-6"
    >
      <div className="max-w-2xl">
        <span className={cn("mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em]")}>
          <Icon name={icon} size={13} className="text-electric-300" /> {eyebrow}
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h1>
        {sub && <p className="mt-3 leading-relaxed text-navy-300">{sub}</p>}
      </div>
      {children}
    </motion.div>
  );
}
