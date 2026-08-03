"use client";

import { motion } from "framer-motion";
import { PageShell } from "@/components/layout/background";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { useStore } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function QuestsPage() {
  const { quests, completeQuest, toast } = useStore();
  const { t } = useLang();
  const done = quests.filter((q) => q.completed).length;
  const pct = Math.round((done / Math.max(1, quests.length)) * 100);

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("quest.eyebrow")}
        title={t("quest.title")}
        sub={t("quest.sub")}
        icon="Trophy"
      >
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-navy-200">
          <Icon name="Sparkles" size={15} className="text-saffron-400" /> {t("quest.done").replace("{done}", String(done)).replace("{total}", String(quests.length))} · {pct}%
        </div>
      </PageHeader>

      <div className="glass mb-6 h-3 overflow-hidden rounded-full">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7 }}
          className="h-full rounded-full bg-gradient-to-r from-electric-500 to-mint-400"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {quests.map((q, i) => {
          const completed = q.completed;
          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={cn(
                "glass flex h-full flex-col rounded-2xl p-6 transition-all duration-300",
                completed ? "border-mint-400/30" : "hover:-translate-y-1 hover:border-electric-400/40"
              )}
            >
              <div className="flex items-start justify-between">
                <span className={cn("grid h-12 w-12 place-items-center rounded-2xl", completed ? "bg-mint-400/15 text-mint-400" : "bg-white/6 text-electric-300")}>
                  <Icon name={q.icon} size={20} />
                </span>
                <Badge tone={completed ? "green" : "blue"}>{completed ? "Completed" : "+" + q.xp + " XP"}</Badge>
              </div>
              <h3 className="mt-4 font-bold text-white">{q.name}</h3>
              <p className="mt-1 flex-1 text-sm leading-relaxed text-navy-300">{q.description}</p>
              <button
                onClick={() => {
                  if (completed) return;
                  completeQuest(q.id);
                  toast("Quest completed! 🎉", { message: `You earned ${q.xp} XP.` });
                }}
                disabled={completed}
                className={cn(
                  "mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer",
                  completed
                    ? "border border-mint-400/30 bg-mint-400/10 text-mint-400"
                    : "bg-gradient-to-r from-electric-500 to-sky-glow text-white shadow-glow-blue hover:brightness-110"
                )}
              >
                <Icon name={completed ? "CheckCircle2" : "Flag"} size={16} />
                {completed ? "Completed" : "Mark as done"}
              </button>
            </motion.div>
          );
        })}
      </div>
    </PageShell>
  );
}
