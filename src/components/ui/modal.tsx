"use client";

import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  children,
  title,
  icon,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  icon?: string;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      window.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.button
            aria-label="Close dialog"
            className="absolute inset-0 cursor-default bg-navy-950/80 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className={cn(
              "glass-strong relative z-10 max-h-[88vh] w-full overflow-y-auto rounded-2xl p-6 shadow-2xl sm:p-8",
              wide ? "max-w-2xl" : "max-w-md"
            )}
          >
            {(title || icon) && (
              <div className="mb-5 flex items-center justify-between gap-4">
                <h3 className="flex items-center gap-2.5 text-lg font-bold text-white">
                  {icon && <span className="grid h-9 w-9 place-items-center rounded-xl bg-electric-500/15 text-electric-300"><Icon name={icon} size={18} /></span>}
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="grid h-8 w-8 place-items-center rounded-lg text-navy-300 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
                >
                  <Icon name="X" size={16} />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
