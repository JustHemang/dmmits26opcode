"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TrainingCard, InternshipCard, JobCard } from "@/components/opportunities/cards";
import { Icon } from "@/components/ui/icon";
import { ButtonLink } from "@/components/ui/primitives";
import { useAuth, GUEST_USER } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { TRAINING, INTERNSHIPS, JOBS } from "@/lib/data/opportunities";
import { careerById } from "@/lib/data/careers";
import { cn, initials, avatarGradient } from "@/lib/utils";

const QUICK = [
  { href: "/skilldna", labelKey: "nav.skilldna", icon: "Brain", accent: "from-electric-500 to-sky-glow" },
  { href: "/training", labelKey: "nav.training", icon: "GraduationCap", accent: "from-violet-500 to-electric-400" },
  { href: "/internships", labelKey: "nav.internships", icon: "Briefcase", accent: "from-mint-400 to-electric-500" },
  { href: "/jobs", labelKey: "nav.jobs", icon: "Building2", accent: "from-saffron-400 to-brown-500" },
  { href: "/radar", labelKey: "nav.radar", icon: "Radar", accent: "from-rose-glow to-saffron-400" },
  { href: "/copilot", labelKey: "nav.copilot", icon: "Bot", accent: "from-electric-400 to-mint-400" },
];

export function HomeLoggedIn() {
  const { t } = useLang();
  const { user } = useAuth();
  const { roadmap } = useStore();
  const profile = user ?? GUEST_USER;

  const topTraining = [...TRAINING].sort((a, b) => b.aiMatch - a.aiMatch).slice(0, 2);
  const topIntern = [...INTERNSHIPS].sort((a, b) => b.aiMatch - a.aiMatch).slice(0, 2);
  const topJob = [...JOBS].sort((a, b) => b.aiMatch - a.aiMatch).slice(0, 2);
  const career = profile.targetCareerId ? careerById(profile.targetCareerId) : undefined;
  const roadmapPct = roadmap && roadmap.totalTasks ? Math.min(100, Math.round((roadmap.completedTasks / Math.max(1, roadmap.totalTasks)) * 100)) : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-7 sm:p-10"
      >
        <div className="aurora-orb -right-16 -top-16 h-64 w-64 bg-electric-500/25" aria-hidden="true" />
        <div className="relative flex flex-wrap items-center gap-6">
          <span className={cn("avatar-lg grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br text-xl font-black text-white", avatarGradient(profile.name))}>
            {initials(profile.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-electric-300">{t("home.welcome")}</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {profile.name.split(" ")[0]} {career ? <span className="text-gradient">→ {career.title}</span> : null}
            </h1>
            <p className="mt-1.5 text-sm text-navy-300">
              {profile.skillLevel} · {profile.xp} XP · {career ? `${career.salary} ${t("dash.demand").replace("{demand}", career.demand)}` : t("home.pickCareer")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{roadmapPct}%</p>
              <p className="text-[10px] uppercase tracking-wider text-navy-400">{t("home.roadmapDone")}</p>
            </div>
            <ButtonLink href="/roadmap" size="sm" className="shine">
              <Icon name="Route" size={14} /> {t("sd.continue")}
            </ButtonLink>
          </div>
        </div>

        <div className="relative mt-6 flex flex-wrap items-center gap-2">
          {QUICK.map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-navy-100 transition-all duration-200 hover:-translate-y-0.5 hover:border-electric-400/40 hover:bg-electric-500/10 hover:text-white"
            >
              <span className={cn("grid h-5 w-5 place-items-center rounded-md bg-gradient-to-br text-white", q.accent)}>
                <Icon name={q.icon} size={12} />
              </span>
              {t(q.labelKey as never)}
            </Link>
          ))}
        </div>
      </motion.div>

      <h2 className="mt-12 mb-4 flex items-center gap-2 text-2xl font-bold text-white">
        <Icon name="Target" size={20} className="text-electric-300" /> {t("home.topMatches")}
      </h2>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-4">
          {topTraining.map((t, i) => <TrainingCard key={t.id} t={t} user={profile} index={i} />)}
        </div>
        <div className="space-y-4">
          {topIntern.map((i, idx) => <InternshipCard key={i.id} i={i} user={profile} index={idx} />)}
        </div>
        <div className="space-y-4">
          {topJob.map((j, idx) => <JobCard key={j.id} j={j} user={profile} index={idx} />)}
        </div>
      </div>
    </div>
  );
}
