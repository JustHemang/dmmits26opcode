"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { PageShell } from "@/components/layout/background";
import { PageHeader } from "@/components/ui/page-header";
import { Button, Badge } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { skillValue } from "@/lib/data/skills";
import { BADGES } from "@/lib/data/meta";
import { careerById } from "@/lib/data/careers";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";

function fmt(str: string, vars: Record<string, string | number>) {
  return str.replace(/\{(\w+)\}/g, (m, k) => String(vars[k] ?? m));
}

const TIER = [
  { min: 0, name: "Rookie", icon: "Footprints", color: "text-navy-300" },
  { min: 400, name: "Builder", icon: "Hammer", color: "text-saffron-300" },
  { min: 1000, name: "Craftsperson", icon: "Wrench", color: "text-electric-300" },
  { min: 1800, name: "Expert", icon: "Trophy", color: "text-mint-300" },
  { min: 2800, name: "Maestro", icon: "Crown", color: "text-violet-300" },
];

export default function SkillPassportPage() {
  const { t } = useLang();
  const { user } = useAuth();
  const { quests, completedCourses } = useStore();

  const earned = useMemo(() => new Set(user?.badges ?? []), [user?.badges]);
  const owned = (user?.badges ?? []).length;
  const level = user?.skillLevel ?? "Beginner";
  const xp = user?.xp ?? 0;
  const tier = TIER.filter((t) => xp >= t.min).at(-1) ?? TIER[0];
  const career = user?.targetCareerId ? careerById(user.targetCareerId) : undefined;
  const coursesDone = completedCourses.length;

  const avgLevel = useMemo(() => {
    const s = user?.skills ?? [];
    if (!s.length) return 0;
    return Math.round(s.reduce((a, sk) => a + skillValue(sk.level), 0) / s.length);
  }, [user?.skills]);

  const progress = Math.min(100, Math.round((xp / 2800) * 100));
  const verified = earned.has("course-complete") ? coursesDone + (owned >= 3 ? 1 : 0) : 0;

  if (!user) return <PageShell />;

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("passport.eyebrow")}
        title={t("passport.title")}
        sub={t("passport.sub")}
        icon="BadgeCheck"
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/12 via-white/6 to-transparent p-6 backdrop-blur-xl">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="avatar-lg h-16 w-16 rounded-2xl bg-gradient-to-br from-saffron-500 via-electric-500 to-violet-500 text-2xl font-black text-white">
                  {user.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{user.name}</p>
                  <p className="text-sm text-navy-200">{user.education}</p>
                  <p className="text-xs text-navy-400">{user.city} · {t("passport.idLabel")}: SIH-{user.id.slice(0, 6).toUpperCase()}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/8 px-4 py-3 text-center">
                <p className={cn("text-xl font-bold", tier.color)}>{tier.name}</p>
                <p className="text-[10px] uppercase tracking-wider text-navy-400">{t("passport.level")} {xp >= 2800 ? 5 : Math.max(1, Math.floor(xp / 700) + 1)}</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { l: t("passport.totalXp"), v: xp, icon: "Zap" },
                { l: t("passport.skillsLogged"), v: user.skills.length, icon: "Terminal" },
                { l: t("passport.badgesEarned"), v: `${owned}/8`, icon: "Award" },
                { l: t("passport.coursesDone"), v: coursesDone, icon: "GraduationCap" },
              ].map((s) => (
                <div key={s.l} className="rounded-xl bg-white/6 p-3">
                  <Icon name={s.icon as never} size={15} className="text-electric-300" />
                  <p className="mt-1 text-lg font-bold text-white">{s.v}</p>
                  <p className="text-[10px] uppercase tracking-wider text-navy-400">{s.l}</p>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between text-xs text-navy-300">
                <span>{t("passport.careerXp")}</span><span>{xp} / 2800</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/8">
                <div className="ring-conic h-full rounded-full" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <p className="mb-4 flex items-center gap-2 font-bold text-white"><Icon name="Terminal" size={17} className="text-electric-300" /> {t("passport.endorsements")}</p>
            <div className="space-y-3">
              {user.skills.map((s) => {
                const v = skillValue(s.level);
                return (
                  <div key={s.name} className="flex items-center gap-3 rounded-xl bg-white/4 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white">{s.name}</p>
                      <div className="mt-1.5 flex gap-1">
                        {[0, 1, 2, 3].map((i) => (
                          <span key={i} className={cn("h-1.5 w-8 rounded-full", i < v ? "bg-gradient-to-r from-saffron-400 to-electric-400" : "bg-white/10")} />
                        ))}
                      </div>
                    </div>
                    <Badge tone={v >= 3 ? "green" : v === 2 ? "warm" : "neutral"}>{s.level}</Badge>
                  </div>
                );
              })}
              {!user.skills.length && (
                <p className="text-sm text-navy-300">{t("passport.noSkills")} <Link href="/skilldna" className="text-electric-300 underline underline-offset-2">SkillDNA</Link> {t("passport.getStarted")}</p>
              )}
            </div>
            {career && (
              <p className="mt-4 text-sm text-navy-300">
                {t("passport.targeting")} <Badge tone="blue">{career.title}</Badge> · {t("passport.avgLevel")} <span className="font-bold text-white">{["", "Beginner", "Intermediate", "Advanced", "Professional"][avgLevel]}</span>
              </p>
            )}
          </div>

          <div className="glass rounded-2xl p-5">
            <p className="mb-4 flex items-center gap-2 font-bold text-white"><Icon name="Award" size={17} className="text-saffron-400" /> {t("passport.badges")}</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {BADGES.map((b) => {
                const has = earned.has(b.id);
                return (
                  <motion.div key={b.id} whileHover={{ y: -3 }} className={cn("rounded-2xl border p-3 text-center", has ? "border-saffron-500/40 bg-gradient-to-b from-saffron-500/15 to-transparent" : "border-white/8 bg-white/3 opacity-40")}>
                    <Icon name={b.icon as never} size={22} className={cn("mx-auto", has ? "text-saffron-400" : "text-navy-500")} />
                    <p className="mt-1.5 text-xs font-bold text-white">{b.name}</p>
                    <p className="mt-0.5 text-[10px] text-navy-400">{has ? `+${b.xp} XP` : b.description}</p>
                  </motion.div>
                );
              })}
            </div>
            <div className="mt-5 rounded-xl border border-mint-400/20 bg-mint-400/5 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-white"><Icon name="ShieldCheck" size={16} className="text-mint-400" /> {t("passport.verification")} <Badge tone="green">{verified > 0 ? (verified > 1 ? fmt(t("passport.verifiedPlural"), { count: verified }) : fmt(t("passport.verified"), { count: verified })) : t("passport.unverified")}</Badge></p>
              <p className="mt-1 text-xs text-navy-300">
                {verified > 0
                  ? t("passport.sealed")
                  : t("passport.sealCta")}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="glass rounded-2xl p-5 text-center">
            <p className="mb-3 text-sm font-semibold text-white">{t("passport.share")}</p>
            <div className="mx-auto grid h-36 w-36 place-items-center rounded-2xl border-2 border-white/15 bg-white p-2">
              <div className="grid h-full w-full grid-cols-5 gap-[3px] opacity-90">
                {Array.from({ length: 25 }).map((_, i) => (
                  <span key={i} className={cn("rounded-[1px]", Math.random() > 0.55 ? "bg-navy-900" : "bg-white")} />
                ))}
              </div>
            </div>
            <p className="mt-3 font-mono text-xs text-navy-300">sih.in/passport/{user.id.slice(0, 8)}</p>
            <Button variant="warm" className="mt-4 w-full" onClick={() => {
              navigator.clipboard?.writeText(`SIH Passport · ${user.name} · ${career?.title ?? t("passport.careerExplorer")} · ${tier.name}`);
            }}>
              <Icon name="Share2" size={15} /> {t("passport.copyLink")}
            </Button>
          </div>

          <div className="glass rounded-2xl p-5">
            <p className="mb-3 flex items-center gap-2 font-bold text-white"><Icon name="ListChecks" size={16} className="text-mint-400" /> {t("passport.milestones")}</p>
            <div className="space-y-2.5">
              {(quests ?? []).slice(0, 4).map((q) => {
                const done = q.completed;
                return (
                  <div key={q.id} className="flex items-center gap-3 rounded-xl bg-white/4 px-3 py-2.5">
                    <span className={cn("grid h-7 w-7 place-items-center rounded-lg", done ? "bg-mint-400/20 text-mint-400" : "bg-white/8 text-navy-300")}>
                      <Icon name={done ? "Check" : (q.icon as never)} size={14} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-sm", done ? "text-navy-300 line-through" : "text-navy-100")}>{q.name}</p>
                      <p className="text-[10px] text-navy-400">+{q.xp} XP</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <Link href="/quests">
              <Button variant="secondary" size="sm" className="mt-4 w-full">{t("passport.viewQuests")} <Icon name="ArrowRight" size={14} /></Button>
            </Link>
          </div>

          <div className="rounded-2xl border border-electric-500/25 bg-gradient-to-br from-electric-500/15 to-transparent p-5">
            <p className="flex items-center gap-2 font-bold text-white"><Icon name="Building2" size={17} className="text-electric-300" /> {t("passport.forEmployers")}</p>
            <p className="mt-2 text-sm text-navy-200">{t("passport.employersSub")}</p>
            <Link href="/hiring"><Button variant="secondary" size="sm" className="mt-4 w-full">{t("passport.learnHiring")} <Icon name="ArrowRight" size={14} /></Button></Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
