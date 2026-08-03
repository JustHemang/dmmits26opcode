"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang, LANGS, type Lang } from "@/lib/i18n";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({
  align = "right",
  showShort = false,
  compact = false,
  className,
}: {
  align?: "left" | "right";
  showShort?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const { lang, setLang, t } = useLang();
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t("nav.language")}
        aria-expanded={open}
        className={cn(
          "flex items-center gap-1.5 rounded-xl text-sm font-semibold text-navy-200 transition-colors hover:bg-white/5 hover:text-white cursor-pointer",
          compact ? "h-9 px-2" : "h-10 px-2.5"
        )}
      >
        <Icon name="Languages" size={18} />
        {showShort && <span className="hidden md:block">{LANGS[lang].short}</span>}
        <Icon name="ChevronDown" size={14} className="text-navy-400" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "glass-strong absolute top-12 w-44 overflow-hidden rounded-2xl p-2 z-50",
              align === "right" ? "right-0" : "left-0"
            )}
          >
            {(Object.keys(LANGS) as Lang[]).map((code) => (
              <button
                key={code}
                onClick={() => {
                  setLang(code);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer",
                  lang === code ? "bg-electric-500/15 text-white" : "text-navy-200 hover:bg-white/5"
                )}
              >
                <span className="flex items-center gap-2.5">
                  <Icon name="Languages" size={14} /> {LANGS[code].label}
                </span>
                {lang === code && <Icon name="Check" size={14} className="text-mint-400" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
