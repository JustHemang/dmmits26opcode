"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { PageShell } from "@/components/layout/background";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { ButtonLink, Badge } from "@/components/ui/primitives";
import { Bar, StepProgress, MatchRing } from "@/components/ui/visuals";
import { Icon } from "@/components/ui/icon";
import { initials, avatarGradient } from "@/lib/utils";
import { useLang, type TranslationKey } from "@/lib/i18n";
import { TRAINING, INTERNSHIPS, JOBS } from "@/lib/data/opportunities";
import { recommendNextAction, careerResponse, generateSkillGap } from "@/lib/ai/engine";

const JOURNEY_STEPS: TranslationKey[] = ["how.s1.t", "how.s2.t", "how.s3.t", "how.s4.t", "how.s5.t"];

const QUICK = [
  { href: "/skilldna", labelKey: "nav.skilldna" as const, icon: "Brain", accent: "from-electric-500 to-sky-glow" },
  { href: "/training", labelKey: "nav.training" as const, icon: "GraduationCap", accent: "from-violet-500 to-electric-400" },
  { href: "/internships", labelKey: "nav.internships" as const, icon: "Briefcase", accent: "from-mint-400 to-electric-500" },
  { href: "/jobs", labelKey: "nav.jobs" as const, icon: "Building2", accent: "from-saffron-400 to-brown-500" },
  { href: "/radar", labelKey: "nav.radar" as const, icon: "Radar", accent: "from-rose-glow to-saffron-400" },
  { href: "/copilot", labelKey: "nav.copilot" as const, icon: "Bot", accent: "from-electric-400 to-mint-400" },
];

function fmt(str: string, vars: Record<string, string | number>) {
  return str.replace(/\{(\w+)\}/g, (m, k) => String(vars[k] ?? m));
}

function MiniCard({
  href,
  icon,
  title,
  sub,
  accent,
  children,
}: {
  href: string;
  icon: string;
  title: string;
  sub: string;
  accent: string;
  children?: React.ReactNode;
}) {
  return (
    <Link href={href} className="glass group flex h-full flex-col rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-electric-400/40">
      <div className="flex items-center gap-3">
        <span className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br text-white ${accent}`}>
          <Icon name={icon} size={20} />
        </span>
        <div>
          <p className="font-bold text-white">{title}</p>
          <p className="text-xs text-navy-400">{sub}</p>
        </div>
      </div>
      {children}
    </Link>
  );
}

function HubPanel({
  href,
  icon,
  title,
  sub,
  accent,
  stats,
}: {
  href: string;
  icon: string;
  title: string;
  sub: string;
  accent: string;
  stats: string[];
}) {
  return (
    <Link
      href={href}
      className="glass group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-electric-400/50"
    >
      <div className="flex items-center gap-3">
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white ${accent}`}>
          <Icon name={icon} size={20} />
        </span>
        <div className="min-w-0">
          <p className="font-bold text-white">{title}</p>
          <p className="text-xs text-navy-400">{sub}</p>
        </div>
        <Icon name="ArrowRight" size={16} className="ml-auto shrink-0 text-navy-500 transition-all group-hover:translate-x-1 group-hover:text-electric-300" />
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {stats.map((s) => (
          <span key={s} className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-medium text-navy-200">{s}</span>
        ))}
      </div>
    </Link>
  );
}

export function HomeDashboard() {
  const { user } = useAuth();
  const { roadmap, applications, resume, saved } = useStore();
  const { t, isHindi } = useLang();
  const [typed, setTyped] = useState("");
  const [copilotReply, setCopilotReply] = useState<string | null>(null);
  const [copilotLoading, setCopilotLoading] = useState(false);

  if (!user) return null;
  const first = user.name.split(" ")[0];
  const dna = user.skilldna;
  const hour = new Date().getHours();
  const greetKey: TranslationKey = hour < 12 ? "dash.greetMorning" : hour < 17 ? "dash.greetAfternoon" : "dash.greetEvening";

  const journeyDone = [
    !!dna,
    !!dna,
    roadmap ? Math.round((roadmap.completedTasks / Math.max(1, roadmap.totalTasks)) * 100) > 30 : false,
    resume ? resume.projects.length > 0 : false,
    applications.length > 0,
  ].filter(Boolean).length;

  const nextAction = recommendNextAction(user, isHindi);
  const gap = generateSkillGap(user.targetCareerId, user.skills, isHindi);
  const topGap = gap.find((g) => g.status !== "met");
  const gapPct = gap.length ? Math.round((gap.filter((g) => g.status === "met").length / gap.length) * 100) : 0;

  const topInternships = [...INTERNSHIPS].sort((a, b) => b.aiMatch - a.aiMatch).slice(0, 3);
  const topJobs = [...JOBS].sort((a, b) => b.aiMatch - a.aiMatch).slice(0, 2);
  const topTraining = [...TRAINING].sort((a, b) => b.aiMatch - a.aiMatch).slice(0, 3);

  const askCopilot = (q: string) => {
    setCopilotLoading(true);
    setCopilotReply(null);
    setTimeout(() => {
      setCopilotReply(careerResponse(user, q, isHindi));
      setCopilotLoading(false);
    }, 900);
  };

  return (
    <PageShell>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-electric-300">{t("dash.eyebrow")}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t(greetKey)}, {first} 👋
          </h1>
          <p className="mt-2 text-navy-300">
            {user.targetCareer
              ? fmt(t("dash.greet"), { career: user.targetCareer })
              : t("dash.greetNone")}
          </p>
        </motion.div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5">
            <span className={`grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br text-sm font-bold text-white ${avatarGradient(user.name)}`}>
              {initials(user.name)}
            </span>
            <div>
              <p className="text-sm font-semibold text-white">{fmt(t("dash.level"), { level: user.level, xp: user.xp })}</p>
              <StepProgress value={((user.xp % 500) / 500) * 100} className="h-1.5 w-32" />
            </div>
          </div>
          <ButtonLink href="/skilldna" variant="primary">
            {t("dash.retake")}
          </ButtonLink>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {QUICK.map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-navy-100 transition-all duration-200 hover:-translate-y-0.5 hover:border-electric-400/40 hover:bg-electric-500/10 hover:text-white"
          >
            <span className={`grid h-5 w-5 place-items-center rounded-md bg-gradient-to-br text-white ${q.accent}`}>
              <Icon name={q.icon} size={12} />
            </span>
            {t(q.labelKey)}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <HubPanel
          href="/training"
          icon="GraduationCap"
          title={t("dash.hub.training")}
          sub={t("dash.hub.trainingSub")}
          accent="from-electric-500 to-sky-glow"
          stats={[
            fmt(t("dash.hub.programs"), { count: TRAINING.length }),
            fmt(t("dash.hub.bestMatch"), { pct: Math.max(...TRAINING.map((x) => x.aiMatch)) }),
            fmt(t("dash.hub.free"), { count: TRAINING.filter((x) => x.cost === "Free").length }),
          ]}
        />
        <HubPanel
          href="/internships"
          icon="Briefcase"
          title={t("dash.hub.internships")}
          sub={t("dash.hub.internshipsSub")}
          accent="from-mint-400 to-electric-500"
          stats={[
            fmt(t("dash.hub.openings"), { count: INTERNSHIPS.length }),
            fmt(t("dash.hub.bestMatch"), { pct: Math.max(...INTERNSHIPS.map((x) => x.aiMatch)) }),
            t("dash.hub.stipendPaid"),
          ]}
        />
        <HubPanel
          href="/jobs"
          icon="Building2"
          title={t("dash.hub.jobs")}
          sub={t("dash.hub.jobsSub")}
          accent="from-saffron-400 to-rose-glow"
          stats={[
            fmt(t("dash.hub.openings"), { count: JOBS.length }),
            fmt(t("dash.hub.bestMatch"), { pct: Math.max(...JOBS.map((x) => x.aiMatch)) }),
            t("dash.hub.panIndia"),
          ]}
        />
        <HubPanel
          href="/opportunities"
          icon="Target"
          title={t("dash.hub.opp")}
          sub={t("dash.hub.oppSub")}
          accent="from-violet-400 to-electric-500"
          stats={[
            fmt(t("dash.hub.total"), { count: TRAINING.length + INTERNSHIPS.length + JOBS.length }),
            t("dash.hub.unifiedSearch"),
            t("dash.hub.aiRanked"),
          ]}
        />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-navy-400">{t("dash.journey")}</p>
              <p className="mt-1 text-lg font-bold text-white">{t("dash.journeyPath")}</p>
            </div>
            <span className="text-2xl font-bold text-gradient">{journeyDone}/5</span>
          </div>
          <StepProgress value={(journeyDone / 5) * 100} className="mt-4" />
          <div className="mt-4 grid grid-cols-5 gap-2">
            {JOURNEY_STEPS.map((s, i) => {
              const done = journeyDone > i;
              return (
                <div key={s} className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all ${done ? "border-mint-400/30 bg-mint-400/8" : "border-white/8 bg-white/3"}`}>
                  <span className={`grid h-8 w-8 place-items-center rounded-full ${done ? "bg-mint-400/20 text-mint-400" : "bg-white/8 text-navy-400"}`}>
                    <Icon name={done ? "Check" : "Circle"} size={15} />
                  </span>
                  <p className={`text-[11px] font-semibold ${done ? "text-white" : "text-navy-400"}`}>{t(s)}</p>
                </div>
              );
            })}
          </div>
          <Link href="/roadmap" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-electric-300 hover:text-white">
            <Icon name="Route" size={15} /> {t("dash.openRoadmap")} <Icon name="ArrowRight" size={14} />
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="glass relative overflow-hidden rounded-2xl p-6">
          <div className="absolute inset-0" aria-hidden="true">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-saffron-500/15 blur-3xl" />
          </div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-navy-400">{t("dash.targetCareer")}</p>
              {dna?.topCareer ? (
                <>
                  <p className="mt-1 text-xl font-bold text-white">{dna.topCareer.title}</p>
                  <p className="text-xs text-navy-300">{dna.topCareer.salary} · {fmt(t("dash.demand"), { demand: dna.topCareer.demand })}</p>
                </>
              ) : (
                <p className="mt-1 text-lg font-bold text-white">{t("dash.notSet")}</p>
              )}
            </div>
            {dna?.topCareer ? (
              <MatchRing value={dna.topCareer.match} size={72} stroke={7} />
            ) : (
              <span className="grid h-16 w-16 place-items-center rounded-full bg-white/5 text-navy-400"><Icon name="Question" size={26} /></span>
            )}
          </div>
          <div className="relative mt-5 rounded-xl border border-saffron-500/30 bg-saffron-500/10 p-3.5">
            <p className="flex items-center gap-1.5 text-xs font-bold text-saffron-400"><Icon name="Lightbulb" size={13} /> {t("dash.nextAction")}</p>
            <p className="mt-1 text-sm font-semibold text-white">{nextAction.title}</p>
            <p className="mt-0.5 text-xs text-navy-300">{nextAction.detail}</p>
          </div>
          <Link href={nextAction.link} className="relative mt-4 inline-flex items-center gap-2 text-sm font-medium text-electric-300 hover:text-white">
            {t("dash.doNow")} <Icon name="ArrowRight" size={14} />
          </Link>
        </motion.div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6">
          <div className="mb-5 flex items-center justify-between">
            <p className="flex items-center gap-2 font-bold text-white"><Icon name="BrainCircuit" size={18} className="text-electric-300" /> {t("dash.scores")}</p>
            <Link href="/skilldna" className="text-xs text-electric-300 hover:text-white">{t("dash.details")}</Link>
          </div>
          <div className="space-y-4">
            {(dna?.scores ?? [
              { label: t("dash.score.creativity"), score: 0 },
              { label: t("dash.score.technology"), score: 0 },
              { label: t("dash.score.problemSolving"), score: 0 },
            ]).map((s) => (
              <Bar key={s.label} label={s.label} value={s.score} color={s.score >= 80 ? "#2dd4a7" : s.score >= 65 ? "#4f8dff" : "#ff9933"} />
            ))}
          </div>
          {!dna && (
            <Link href="/skilldna" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-electric-300 hover:text-white">
              <Icon name="Sparkles" size={15} /> {t("dash.takeQuiz")}
            </Link>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }} className="glass rounded-2xl p-6">
          <div className="mb-5 flex items-center justify-between">
            <p className="flex items-center gap-2 font-bold text-white"><Icon name="SlidersHorizontal" size={18} className="text-saffron-400" /> {t("dash.gap")}</p>
            <Link href="/skill-gap" className="text-xs text-electric-300 hover:text-white">{t("dash.analyzer")}</Link>
          </div>
          {gap.length ? (
            <>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-white">{gapPct}%</span>
                <div className="flex-1"><Bar value={gapPct} color="#2dd4a7" /></div>
              </div>
              <div className="mt-4 space-y-2">
                {gap.slice(0, 4).map((g) => (
                  <div key={g.skill} className="flex items-center justify-between rounded-lg bg-white/4 px-3 py-2">
                    <span className="text-sm text-navy-200">{g.skill}</span>
                    {g.status === "met" ? (
                      <Badge tone="green">{t("dash.met")}</Badge>
                    ) : g.status === "partial" ? (
                      <Badge tone="warm">{t("dash.partial")}</Badge>
                    ) : (
                      <Badge tone="red">{t("dash.gapTag")}</Badge>
                    )}
                  </div>
                ))}
              </div>
              {topGap && (
                <p className="mt-4 text-xs text-navy-300">
                  {fmt(t("dash.gapNext"), { skill: topGap.skill, resource: topGap.learningResource ?? "" })}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-navy-300">{t("dash.gapNone")}</p>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }} className="glass rounded-2xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="flex items-center gap-2 font-bold text-white"><Icon name="Bot" size={18} className="text-mint-400" /> {t("dash.copilot")}</p>
            <Link href="/copilot" className="text-xs text-electric-300 hover:text-white">{t("dash.openChat")}</Link>
          </div>
          <p className="text-sm text-navy-300">{fmt(t("dash.copilotAsk"), { career: user.targetCareer || "career" })}</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (typed.trim()) askCopilot(typed.trim());
            }}
            className="mt-3 flex gap-2"
          >
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={t("dash.copilotPlaceholder")}
              className="h-10 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-navy-400 focus:border-electric-400 focus:outline-none"
              aria-label={t("dash.copilot")}
            />
            <button type="submit" aria-label={t("dash.sendMessage")} className="grid h-10 w-10 place-items-center rounded-xl bg-electric-500 text-white transition-colors hover:bg-electric-400 cursor-pointer">
              <Icon name="Send" size={16} />
            </button>
          </form>
          {copilotLoading && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/4 p-3 text-xs text-navy-300">
              <Icon name="LoaderCircle" size={14} className="animate-spin text-electric-300" /> {t("dash.copilotThinking")}
            </div>
          )}
          {copilotReply && (
            <div className="mt-3 rounded-xl border border-mint-400/20 bg-mint-400/8 p-3 text-xs leading-relaxed text-navy-100">
              {copilotReply}
            </div>
          )}
        </motion.div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <MiniCard href="/resume-builder" icon="FileText" title={t("dash.resume")} sub={t("dash.resumeSub")} accent="from-mint-400 to-electric-400">
          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-bold text-white">{user.resumeHealth || resume ? (resume?.certifications.length ? 94 : user.resumeHealth || 87) : 0}<span className="text-sm text-navy-400">/100</span></span>
            <div className="flex-1"><Bar value={user.resumeHealth || 0} color="#2dd4a7" /></div>
          </div>
          <p className="mt-2 text-xs text-navy-300">{t("dash.resumeHealth")}</p>
        </MiniCard>
        <MiniCard href="/skill-passport" icon="BadgeCheck" title={t("dash.passport")} sub={t("dash.passportSub")} accent="from-electric-500 to-sky-glow">
          <div className="mt-4 flex flex-wrap gap-2">
            {["HTML", "CSS", "Figma", "Canva"].map((s) => (
              <span key={s} className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-navy-200">{s}</span>
            ))}
            <Badge tone="green">{t("dash.active")}</Badge>
          </div>
        </MiniCard>
        <MiniCard href="/applications" icon="ClipboardCheck" title={t("dash.applications")} sub={fmt(t("dash.applicationsSub"), { count: applications.length })} accent="from-saffron-400 to-rose-glow">
          <div className="mt-4 grid grid-cols-2 gap-2 text-center">
            {[[t("dash.applied"), applications.filter((a) => a.status === "Applied").length], [t("dash.interview"), applications.filter((a) => a.status === "Interview").length], [t("dash.saved"), saved.length], [t("dash.selected"), applications.filter((a) => a.status === "Selected").length]].map(([l, n]) => (
              <div key={l as string} className="rounded-xl bg-white/4 p-2.5">
                <p className="text-lg font-bold text-white">{n as number}</p>
                <p className="text-[10px] uppercase tracking-wider text-navy-400">{l}</p>
              </div>
            ))}
          </div>
        </MiniCard>
      </div>

      <section className="mt-10">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">{t("dash.matched")}</h2>
          <Link href="/internships" className="text-sm text-electric-300 hover:text-white">{t("dash.viewInternships")}</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {topInternships.map((i, idx) => (
            <motion.div key={i.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + idx * 0.08 }} className="glass rounded-2xl p-5 transition-all hover:-translate-y-1 hover:border-electric-400/40">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge tone="blue">{i.category}</Badge>
                  <p className="mt-2 font-bold text-white">{i.title}</p>
                  <p className="text-xs text-navy-300">{i.company}</p>
                </div>
                <MatchRing value={i.aiMatch} size={52} stroke={5} />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-navy-300">
                <span className="inline-flex items-center gap-1"><Icon name="MapPin" size={12} /> {i.location}</span>
                <span className="inline-flex items-center gap-1 text-mint-400"><Icon name="IndianRupee" size={12} /> {i.stipend}</span>
              </div>
              <Link href={`/internships?highlight=${i.id}`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-electric-300 hover:text-white">
                {t("dash.viewDetails")} <Icon name="ArrowRight" size={14} />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-2">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">{t("dash.training")}</h2>
            <Link href="/training" className="text-sm text-electric-300 hover:text-white">{t("dash.allTraining")}</Link>
          </div>
          <div className="space-y-3">
            {topTraining.map((x, idx) => (
              <motion.div key={x.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + idx * 0.07 }} className="glass flex items-center gap-4 rounded-2xl p-4 transition-all hover:border-electric-400/40">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-electric-500/15 text-electric-300">
                  <Icon name="GraduationCap" size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-white">{x.title}</p>
                  <p className="truncate text-xs text-navy-300">{x.provider} · {x.duration} · <span className={x.cost === "Free" ? "text-mint-400" : "text-saffron-400"}>{x.cost}</span></p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-mint-400">{x.aiMatch}%</p>
                  <p className="text-[10px] text-navy-400">{t("dash.match")}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">{t("dash.topJobs")}</h2>
            <Link href="/jobs" className="text-sm text-electric-300 hover:text-white">{t("dash.allJobs")}</Link>
          </div>
          <div className="space-y-3">
            {topJobs.map((j, idx) => (
              <motion.div key={j.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + idx * 0.07 }} className="glass flex items-center gap-4 rounded-2xl p-4 transition-all hover:border-electric-400/40">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-saffron-500/15 text-saffron-400">
                  <Icon name="Briefcase" size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-white">{j.title}</p>
                  <p className="truncate text-xs text-navy-300">{j.company} · {j.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-mint-400">{j.aiMatch}%</p>
                  <p className="text-xs text-navy-400">{j.salary}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <Link href="/jobs" className="mt-5 flex items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 p-4 text-sm font-medium text-navy-300 transition-colors hover:border-electric-400/40 hover:text-white">
            <Icon name="Building2" size={16} /> {fmt(t("dash.browseJobs"), { count: JOBS.length })}
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
