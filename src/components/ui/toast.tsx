"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { Icon } from "@/components/ui/icon";

const KIND_STYLES: Record<string, { icon: string; ring: string }> = {
  success: { icon: "CircleCheckBig", ring: "text-mint-400 bg-mint-400/15" },
  info: { icon: "Info", ring: "text-electric-300 bg-electric-500/15" },
  warn: { icon: "AlertTriangle", ring: "text-saffron-400 bg-saffron-500/15" },
  error: { icon: "CircleAlert", ring: "text-rose-300 bg-rose-glow/15" },
};

export function ToastViewport() {
  const { toasts, dismissToast } = useStore();
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-full max-w-sm flex-col gap-3">
      <AnimatePresence>
        {toasts.map((t) => {
          const s = KIND_STYLES[t.kind] ?? KIND_STYLES.success;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="glass-strong pointer-events-auto flex items-start gap-3 rounded-xl border border-white/10 p-4 shadow-2xl"
              role="status"
            >
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${s.ring}`}>
                <Icon name={s.icon} size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{t.title}</p>
                {t.message && <p className="mt-0.5 text-xs leading-relaxed text-navy-300">{t.message}</p>}
              </div>
              <button
                onClick={() => dismissToast(t.id)}
                aria-label="Dismiss"
                className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-navy-400 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <Icon name="X" size={13} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
