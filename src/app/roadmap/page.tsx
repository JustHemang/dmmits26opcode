"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { PageShell } from "@/components/layout/background";
import { PageHeader } from "@/components/ui/page-header";
import { Button, Select, Badge } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { CAREER_DEFS } from "@/lib/data/careers";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { generateRoadmap } from "@/lib/ai/engine";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";

function fmt(str: string, vars: Record<string, string | number>) {
  return str.replace(/\{(\w+)\}/g, (m, k) => String(vars[k] ?? m));
}

const TYPE_TONE: Record<string, "blue" | "warm" | "green" | "red" | "neutral"> = {
  Learn: "blue",
  Project: "warm",
  Certification: "green",
  Internship: "blue",
  Application: "neutral",
};

export default function RoadmapPage() {
  const { t, isHindi } = useLang();
  const TYPE_LABEL: Record<string, string> = {
    Learn: t("roadmap.type.Learn"),
    Build: t("roadmap.type.Build"),
    Project: t("roadmap.type.Project"),
    Certification: t("roadmap.type.Certification"),
    Internship: t("roadmap.type.Internship"),
    Application: t("roadmap.type.Application"),
  };
  const { user } = useAuth();
  const { roadmap, setRoadmap, toggleTask } = useStore();
  const [careerId, setCareerId] = useState(user?.targetCareerId || "ui-ux-designer");
  const [open, setOpen] = useState(0);

  const career = CAREER_DEFS.find((c) => c.id === careerId);
  const generated = useMemo(() => {
    if (!user) return null;
    return generateRoadmap(careerId, user.skills, user.skillLevel, isHindi);
  }, [careerId, user, isHindi]);

  const active = roadmap?.career === career?.title ? roadmap : generated;

  const toggleOpen = (i: number) => setOpen(open === i ? -1 : i);
  const done = active ? active.completedTasks : 0;
  const total = active ? active.totalTasks : 0;
  const pct = total ? Math.min(100, Math.round((done / total) * 100)) : 0;

  const startRoadmap = () => {
    if (!generated) return;
    setRoadmap(generated);
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("roadmap.eyebrow")}
        title={t("roadmap.title")}
        sub={t("roadmap.sub")}
        icon="Route"
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <div className="glass flex flex-wrap items-center gap-3 rounded-2xl p-4">
            <Select value={careerId} onChange={(e) => setCareerId(e.target.value)} className="w-full sm:w-72" aria-label={t("roadmap.careerLabel")}>
              {CAREER_DEFS.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </Select>
            {user?.targetCareerId === careerId && <Badge tone="green">{t("roadmap.yourMatch")}</Badge>}
            <div className="ml-auto flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={startRoadmap} disabled={!generated}>
                <Icon name="Sparkles" size={14} /> {roadmap?.career === career?.title ? t("roadmap.regenerate") : t("roadmap.generate")}
              </Button>
            </div>
          </div>

          {!active && (
            <div className="glass rounded-2xl p-10 text-center">
              <Icon name="Route" size={36} className="mx-auto text-electric-300" />
              <p className="mt-4 font-semibold text-white">{t("roadmap.pickCareer")}</p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-navy-300">
                {t("roadmap.pickSub")}
              </p>
            </div>
          )}

          {active && (
            <>
              <div className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{fmt(t("roadmap.for"), { career: active.career })}</p>
                    <p className="text-xs text-navy-400">{t("roadmap.generatedFrom")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gradient">{pct}%</p>
                    <p className="text-[10px] uppercase tracking-wider text-navy-400">{fmt(t("roadmap.tasks"), { done, total })}</p>
                  </div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
                  <div className="ring-conic h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, boxShadow: "0 0 16px rgba(61,123,255,0.6)" }} />
                </div>
              </div>

              {active.months.map((m, mi) => {
                const monthDone = m.tasks.filter((t) => t.done).length;
                const isOpen = open === mi;
                return (
                  <motion.div key={m.month} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: mi * 0.05 }} className="glass overflow-hidden rounded-2xl">
                    <button onClick={() => toggleOpen(mi)} className="flex w-full items-center gap-4 p-5 text-left cursor-pointer">
                      <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl text-sm font-bold", monthDone === m.tasks.length ? "bg-mint-400/20 text-mint-400" : "bg-gradient-to-br from-electric-500 to-sky-glow text-white")}>
                        {monthDone === m.tasks.length ? <Icon name="Check" size={18} /> : `M${m.month}`}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-white">{fmt(t("roadmap.month"), { month: m.month, title: m.title })}</p>
                        <p className="truncate text-xs text-navy-300">{m.goal}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white">{monthDone}/{m.tasks.length}</p>
                        <Icon name={isOpen ? "ChevronDown" : "ChevronRight"} size={16} className="mt-0.5 ml-auto text-navy-400" />
                      </div>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                          <div className="space-y-1.5 border-t border-white/10 p-4">
                            {m.tasks.map((task) => (
                              <button
                                key={task.id}
                                onClick={() => toggleTask(mi, task.id)}
                                className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors cursor-pointer", task.done ? "bg-mint-400/10" : "hover:bg-white/5")}
                              >
                                <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-lg border", task.done ? "border-mint-400/60 bg-mint-400/20 text-mint-400" : "border-white/15 text-transparent")}>
                                  <Icon name="Check" size={13} />
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className={cn("text-sm", task.done ? "text-navy-300 line-through" : "text-navy-100")}>{task.label}</p>
                                </div>
                                <Badge tone={TYPE_TONE[task.type] ?? "neutral"}>{TYPE_LABEL[task.type] ?? task.type}</Badge>
                                {task.link && (
                                  <Link href={task.link} onClick={(e) => e.stopPropagation()} className="text-electric-300 hover:text-white" aria-label={t("roadmap.openLink")}>
                                    <Icon name="ExternalLink" size={14} />
                                  </Link>
                                )}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </>
          )}
        </div>

        <div className="space-y-5">
          <div className="glass rounded-2xl p-5">
            <p className="flex items-center gap-2 font-bold text-white"><Icon name="Lightbulb" size={18} className="text-saffron-400" /> {t("roadmap.howTitle")}</p>
            <ul className="mt-3 space-y-2.5 text-sm text-navy-200">
              {[
                t("roadmap.how.1"),
                t("roadmap.how.2"),
                t("roadmap.how.3"),
                t("roadmap.how.4"),
              ].map((t) => (
                <li key={t} className="flex gap-2.5"><Icon name="CircleCheckBig" size={16} className="mt-0.5 shrink-0 text-mint-400" /> {t}</li>
              ))}
            </ul>
          </div>
          <div className="glass rounded-2xl p-5">
            <p className="flex items-center gap-2 font-bold text-white"><Icon name="TrendingUp" size={18} className="text-mint-400" /> {t("roadmap.outcomeTitle")}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center">
              {[
                { l: t("roadmap.skillsClosed"), v: career ? career.skills.length : 8 },
                { l: t("roadmap.portfolio"), v: 3 },
                { l: t("roadmap.certs"), v: 2 },
                { l: t("roadmap.applications"), v: 10 },
              ].map((s) => (
                <div key={s.l} className="rounded-xl bg-white/4 p-3">
                  <p className="text-xl font-bold text-white">{s.v}</p>
                  <p className="text-[10px] uppercase tracking-wider text-navy-400">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
