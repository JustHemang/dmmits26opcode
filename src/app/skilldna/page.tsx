"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/layout/background";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/primitives";
import { MatchRing, Bar } from "@/components/ui/visuals";
import { Icon } from "@/components/ui/icon";
import { useLang, type TranslationKey } from "@/lib/i18n";
import type { SkillDNAAnswer, SkillDNAResult } from "@/types";
import { runSkillDNA } from "@/lib/ai/engine";
import { generateRoadmap } from "@/lib/ai/engine";
import { CITIES } from "@/lib/data/cities";

function fmt(str: string, vars: Record<string, string | number>) {
  return str.replace(/\{(\w+)\}/g, (m, k) => String(vars[k] ?? m));
}

const ENJOY_OPTIONS = [
  { id: "creating", icon: "PenTool" },
  { id: "technology", icon: "Cpu" },
  { id: "building", icon: "Hammer" },
  { id: "people", icon: "Users" },
  { id: "numbers", icon: "BarChart3" },
  { id: "content", icon: "Megaphone" },
  { id: "outdoors", icon: "Leaf" },
  { id: "helping", icon: "HeartPulse" },
] as const;

const ANALYSIS_STAGES: TranslationKey[] = [
  "sd.stage.1",
  "sd.stage.2",
  "sd.stage.3",
  "sd.stage.4",
  "sd.stage.5",
  "sd.stage.6",
];

const QUESTIONS = [
  { id: "enjoys", titleKey: "sd.q.enjoys", subKey: "sd.q.enjoysSub" },
  { id: "skillLevel", titleKey: "sd.q.skillLevel", subKey: "sd.q.skillLevelSub" },
  { id: "location", titleKey: "sd.q.location", subKey: "sd.q.locationSub" },
  { id: "education", titleKey: "sd.q.education", subKey: "sd.q.educationSub" },
  { id: "goal", titleKey: "sd.q.goal", subKey: "sd.q.goalSub" },
  { id: "hours", titleKey: "sd.q.hours", subKey: "sd.q.hoursSub" },
] as const;

const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Professional"] as const;
const levelKey = (l: string) => `sd.level.${l.toLowerCase()}` as TranslationKey;
const levelDescKey = (l: string) => `sd.level.${l.toLowerCase()}Desc` as TranslationKey;

const EDUCATIONS = ["Class 10", "Class 12", "ITI / Diploma", "B.Tech / B.E.", "B.Sc", "B.Com / BBA", "BA", "Graduate", "Post Graduate"] as const;
const EDU_KEYS: Record<string, TranslationKey> = {
  "Class 10": "sd.edu.class10",
  "Class 12": "sd.edu.class12",
  "ITI / Diploma": "sd.edu.iti",
  "B.Tech / B.E.": "sd.edu.btech",
  "B.Sc": "sd.edu.bsc",
  "B.Com / BBA": "sd.edu.bcom",
  "BA": "sd.edu.ba",
  "Graduate": "sd.edu.grad",
  "Post Graduate": "sd.edu.postgrad",
};

const GOALS = ["Training", "Internship", "Job", "Career Exploration", "Apprenticeship"] as const;
const GOAL_KEYS: Record<string, { label: TranslationKey; desc: TranslationKey }> = {
  Training: { label: "sd.goal.training", desc: "sd.goal.trainingDesc" },
  Internship: { label: "sd.goal.internship", desc: "sd.goal.internshipDesc" },
  Job: { label: "sd.goal.job", desc: "sd.goal.jobDesc" },
  "Career Exploration": { label: "sd.goal.explore", desc: "sd.goal.exploreDesc" },
  Apprenticeship: { label: "sd.goal.apprenticeship", desc: "sd.goal.apprenticeshipDesc" },
};

function QuizInner() {
  const router = useRouter();
  const { user, setSkillDNA, addXp, awardBadge } = useAuth();
  const { setRoadmap, toast, pushNotification } = useStore();
  const { t, isHindi } = useLang();

  const [stage, setStage] = useState<"intro" | "quiz" | "analyzing" | "result">("intro");
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<SkillDNAAnswer>>({ enjoys: [] as string[] });
  const [analysisStep, setAnalysisStep] = useState(0);
  const [result, setResult] = useState<SkillDNAResult | null>(null);
  const [startedAt, setStartedAt] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [qIndex, stage]);

  const start = () => {
    setStage("quiz");
    setStartedAt(Date.now());
  };

  const selectEnjoys = (id: string) => {
    const list = (answers.enjoys ?? []) as string[];
    setAnswers((a) => ({
      ...a,
      enjoys: list.includes(id) ? list.filter((x) => x !== id) : [...list, id],
    }));
  };

  const next = () => {
    if (qIndex < QUESTIONS.length - 1) {
      setQIndex(qIndex + 1);
      return;
    }
    runAnalysis();
  };

  const runAnalysis = () => {
    setStage("analyzing");
    const full: SkillDNAAnswer = {
      enjoys: (answers.enjoys ?? []) as string[],
      skillLevel: (answers.skillLevel as string) || "Beginner",
      location: (answers.location as string) || "Delhi",
      education: (answers.education as string) || "Class 12",
      goal: (answers.goal as string) || "Internship",
      hours: (answers.hours as number) || 10,
      interest: (answers.interest as string) || "General",
    };
    setAnswers(full);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setAnalysisStep(step);
      if (step >= ANALYSIS_STAGES.length) {
        clearInterval(interval);
        setTimeout(() => {
          const res = runSkillDNA(full, user?.skills ?? [], isHindi);
          setResult(res);
          setSkillDNA(res);
          setRoadmap(generateRoadmap(res.topCareer.id, user?.skills ?? [], full.skillLevel, isHindi));
          addXp(150);
          awardBadge("first-step");
          pushNotification({
            title: t("sd.notifTitle"),
            body: fmt(t("sd.notifBody"), { career: res.topCareer.title, pct: res.topCareer.match }),
            time: "just now",
            kind: "milestone",
          });
          toast(t("sd.toastTitle"), { message: fmt(t("sd.toastMsg"), { career: res.topCareer.title, pct: res.topCareer.match }) });
          setStage("result");
        }, 400);
      }
    }, 800);
  };

  const q = QUESTIONS[qIndex];
  const hrsUnit = t("sd.hours.unit");
  const hrsWeek = t("sd.hours.week");

  return (
    <PageShell>
      <AnimatePresence mode="wait">
        {stage === "intro" && (
          <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mx-auto max-w-2xl">
            <div className="glass overflow-hidden rounded-3xl">
              <div className="relative border-b border-white/10 bg-gradient-to-br from-electric-500/15 to-sky-glow/10 p-8 sm:p-10">
                <div className="dot-bg absolute inset-0 opacity-30" aria-hidden="true" />
                <div className="relative">
                  <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-electric-400/30 bg-electric-500/10 px-3.5 py-1 text-xs font-semibold text-electric-300">
                    <Icon name="Brain" size={14} /> {t("sd.eyebrow")}
                  </span>
                  <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{t("sd.title1")} <span className="text-gradient">{t("sd.title2")}</span></h1>
                  <p className="mt-4 text-navy-300">{t("sd.sub")}</p>
                </div>
              </div>
              <div className="p-8 sm:p-10">
                <div className="mb-8 grid grid-cols-3 gap-3 text-center">
                  {[
                    { icon: "Brain", l: t("sd.analyze") },
                    { icon: "Target", l: t("sd.score") },
                    { icon: "Route", l: t("sd.plan") },
                  ].map((c) => (
                    <div key={c.l} className="glass rounded-2xl p-4">
                      <Icon name={c.icon} size={22} className="mx-auto text-electric-300" />
                      <p className="mt-2 text-xs font-medium text-navy-200">{c.l}</p>
                    </div>
                  ))}
                </div>
                <Button onClick={start} size="lg" className="w-full">
                  <Icon name="Sparkles" size={18} /> {t("sd.start")}
                </Button>
                <p className="mt-4 text-center text-xs text-navy-400">
                  {t("sd.note")}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {stage === "quiz" && q && (
          <motion.div key={`quiz-${qIndex}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="mx-auto max-w-2xl">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-navy-400">
                {fmt(t("sd.question"), { current: qIndex + 1, total: QUESTIONS.length })}
              </span>
              <span className="text-xs font-semibold text-electric-300">{Math.round(((qIndex + 1) / QUESTIONS.length) * 100)}%</span>
            </div>
            <div className="mb-8 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
              <motion.div
                className="ring-conic h-full rounded-full"
                animate={{ width: `${((qIndex + 1) / QUESTIONS.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <div className="glass rounded-3xl p-8 sm:p-10">
              <h2 className="text-2xl font-bold text-white">{t(q.titleKey)}</h2>
              <p className="mt-2 text-navy-300">{t(q.subKey)}</p>

              <div className="mt-7">
                {q.id === "enjoys" && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {ENJOY_OPTIONS.map((o) => {
                      const active = (answers.enjoys as string[]).includes(o.id);
                      return (
                        <button
                          key={o.id}
                          onClick={() => selectEnjoys(o.id)}
                          aria-pressed={active}
                          className={`flex items-center gap-3.5 rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                            active
                              ? "border-electric-400/60 bg-electric-500/15 shadow-glow-soft"
                              : "border-white/10 bg-white/4 hover:border-white/25"
                          }`}
                        >
                          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${active ? "bg-electric-500 text-white" : "bg-white/6 text-navy-300"}`}>
                            <Icon name={o.icon} size={18} />
                          </span>
                          <span>
                            <span className="block text-sm font-semibold text-white">{t(`sd.enjoy.${o.id}` as TranslationKey)}</span>
                            <span className="block text-xs text-navy-400">{t(`sd.enjoy.${o.id}Desc` as TranslationKey)}</span>
                          </span>
                          <span className={`ml-auto grid h-5 w-5 place-items-center rounded-full border ${active ? "border-electric-400 bg-electric-500 text-white" : "border-white/20 text-transparent"}`}>
                            <Icon name="Check" size={12} />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {q.id === "skillLevel" && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {SKILL_LEVELS.map((l) => (
                      <button
                        key={l}
                        onClick={() => setAnswers((a) => ({ ...a, skillLevel: l }))}
                        className={`rounded-2xl border p-5 text-left transition-all cursor-pointer ${
                          answers.skillLevel === l ? "border-electric-400/60 bg-electric-500/15 shadow-glow-soft" : "border-white/10 bg-white/4 hover:border-white/25"
                        }`}
                      >
                        <span className="text-lg font-bold text-white">{t(levelKey(l))}</span>
                        <span className="mt-1 block text-xs text-navy-400">
                          {t(levelDescKey(l))}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {q.id === "location" && (
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {CITIES.slice(0, 12).map((c) => (
                      <button
                        key={c.name}
                        onClick={() => setAnswers((a) => ({ ...a, location: c.name }))}
                        className={`flex items-center gap-2 rounded-xl border px-3.5 py-3 text-sm transition-all cursor-pointer ${
                          answers.location === c.name ? "border-electric-400/60 bg-electric-500/15 text-white" : "border-white/10 bg-white/4 text-navy-200 hover:border-white/25"
                        }`}
                      >
                        <Icon name="MapPin" size={15} className={answers.location === c.name ? "text-electric-300" : "text-navy-400"} />
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}

                {q.id === "education" && (
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {EDUCATIONS.map((e) => (
                      <button
                        key={e}
                        onClick={() => setAnswers((a) => ({ ...a, education: e }))}
                        className={`rounded-xl border px-4 py-3 text-left text-sm transition-all cursor-pointer ${
                          answers.education === e ? "border-electric-400/60 bg-electric-500/15 text-white" : "border-white/10 bg-white/4 text-navy-200 hover:border-white/25"
                        }`}
                      >
                        <Icon name="GraduationCap" size={15} className={answers.education === e ? "inline text-electric-300" : "inline text-navy-400"} /> {t(EDU_KEYS[e])}
                      </button>
                    ))}
                  </div>
                )}

                {q.id === "goal" && (
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {GOALS.map((g) => (
                      <button
                        key={g}
                        onClick={() => setAnswers((a) => ({ ...a, goal: g }))}
                        className={`rounded-xl border px-4 py-3.5 text-left transition-all cursor-pointer ${
                          answers.goal === g ? "border-electric-400/60 bg-electric-500/15" : "border-white/10 bg-white/4 hover:border-white/25"
                        }`}
                      >
                        <span className="block text-sm font-semibold text-white">{t(GOAL_KEYS[g].label)}</span>
                        <span className="mt-0.5 block text-xs text-navy-400">
                          {t(GOAL_KEYS[g].desc)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {q.id === "hours" && (
                  <div>
                    <input
                      type="range"
                      min={2}
                      max={40}
                      step={1}
                      value={(answers.hours as number) ?? 10}
                      onChange={(e) => setAnswers((a) => ({ ...a, hours: Number(e.target.value) }))}
                      className="w-full accent-[#3d7bff]"
                      aria-label={t("sd.q.hours")}
                    />
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm text-navy-400">2 {hrsUnit}</span>
                      <span className="text-3xl font-bold text-gradient">{answers.hours ?? 10} {hrsUnit}<span className="text-sm text-navy-300"> {hrsWeek}</span></span>
                      <span className="text-sm text-navy-400">40 {hrsUnit}</span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {[5, 10, 15, 20, 25].map((h) => (
                        <button key={h} onClick={() => setAnswers((a) => ({ ...a, hours: h }))} className={`rounded-full border px-3.5 py-1.5 text-xs transition-all cursor-pointer ${answers.hours === h ? "border-electric-400 bg-electric-500/20 text-white" : "border-white/10 text-navy-300 hover:border-white/25"}`}>
                          {h} {hrsUnit}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 flex items-center justify-between">
                <Button variant="ghost" onClick={() => (qIndex > 0 ? setQIndex(qIndex - 1) : setStage("intro"))}>
                  <Icon name="ChevronLeft" size={16} /> {t("sd.back")}
                </Button>
                <Button
                  onClick={next}
                  disabled={q.id === "enjoys" ? (answers.enjoys ?? []).length === 0 : !answers[q.id]}
                >
                  {qIndex === QUESTIONS.length - 1 ? t("sd.analyzeMe") : t("sd.continue")} <Icon name="ArrowRight" size={16} />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {stage === "analyzing" && (
          <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mx-auto flex max-w-xl flex-col items-center py-16 text-center">
            <div className="relative">
              <span className="absolute inset-0 animate-ping rounded-full bg-electric-500/20" />
              <div className="relative grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-electric-500 to-sky-glow text-white shadow-glow-blue">
                <Icon name="Brain" size={40} className="animate-pulse" />
              </div>
            </div>
            <h2 className="mt-8 text-2xl font-bold text-white">{t("sd.building")}</h2>
            <p className="mt-2 text-sm text-navy-300">{t("sd.analyzing")}</p>
            <div className="mt-8 w-full space-y-3">
              {ANALYSIS_STAGES.map((s, i) => (
                <div key={s} className="flex items-center gap-3 transition-all duration-300">
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs ${i < analysisStep ? "bg-mint-400/20 text-mint-400" : i === analysisStep ? "bg-electric-500/20 text-electric-300" : "bg-white/6 text-navy-500"}`}>
                    {i < analysisStep ? <Icon name="Check" size={13} /> : i === analysisStep ? <Icon name="LoaderCircle" size={13} className="animate-spin" /> : <Icon name="Circle" size={11} />}
                  </span>
                  <span className={`text-sm ${i <= analysisStep ? "text-white" : "text-navy-500"}`}>{t(s)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {stage === "result" && result && (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-electric-300">{t("sd.resultEyebrow")}</span>
                <h1 className="mt-1 text-3xl font-bold text-white">
                  {t("sd.topMatch")} <span className="text-gradient">{result.topCareer.title}</span> · {result.topCareer.match}%
                </h1>
              </div>
              <Button variant="warm" onClick={() => router.push("/roadmap")}>
                <Icon name="Route" size={17} /> {t("sd.viewRoadmap")}
              </Button>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6">
                <p className="mb-5 font-bold text-white">{t("sd.scores")}</p>
                <div className="space-y-4">
                  {result.scores.map((s) => (
                    <Bar key={s.label} label={s.label} value={s.score} color={s.score >= 80 ? "#2dd4a7" : s.score >= 65 ? "#4f8dff" : "#ff9933"} />
                  ))}
                </div>
                <div className="mt-6 rounded-xl border border-white/10 bg-white/4 p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold text-electric-300"><Icon name="Sparkles" size={14} /> {t("sd.aiSummary")}</p>
                  <p className="mt-2 text-xs leading-relaxed text-navy-200">{result.summary}</p>
                </div>
              </motion.div>

              <div className="space-y-4 lg:col-span-2">
                {result.matches.map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.1 }}
                    className={`glass rounded-2xl p-6 transition-all ${i === 0 ? "border-saffron-500/40 shadow-[0_0_30px_-10px_rgba(255,153,51,0.35)]" : ""}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          {i === 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-saffron-500/15 px-2.5 py-0.5 text-xs font-semibold text-saffron-400">
                              <Icon name="Crown" size={13} /> {t("sd.bestMatch")}
                            </span>
                          )}
                          <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-navy-300">{m.category}</span>
                          <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-navy-300">{m.salary}</span>
                          <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-navy-300">{fmt(t("dash.demand"), { demand: m.demand })}</span>
                        </div>
                        <h3 className="mt-3 text-xl font-bold text-white">{m.title}</h3>
                        <p className="mt-2 text-sm text-navy-300">{t("sd.whyMatched")}</p>
                        <ul className="mt-2 space-y-1.5">
                          {m.reasons.map((r) => (
                            <li key={r} className="flex items-start gap-2 text-sm text-navy-200">
                              <Icon name="Check" size={15} className="mt-0.5 shrink-0 text-mint-400" /> {r}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
                          {[
                            [t("sd.why.interests"), m.why.interests],
                            [t("sd.why.skills"), m.why.skills],
                            [t("sd.why.location"), m.why.location],
                            [t("sd.why.experience"), m.why.experience],
                            [t("sd.why.problemSolving"), m.why.problemSolving],
                          ].map(([l, v]) => (
                            <div key={l as string} className="rounded-xl bg-white/4 p-2.5 text-center">
                              <p className="text-base font-bold text-white">{v}%</p>
                              <p className="text-[10px] text-navy-400">{l}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <MatchRing value={m.match} size={76} stroke={7} />
                    </div>
                    {m.missingSkills.length > 0 && (
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="text-xs text-navy-400">{t("sd.skillsToBuild")}</span>
                        {m.missingSkills.map((s) => (
                          <span key={s} className="rounded-full border border-rose-glow/30 bg-rose-glow/10 px-2.5 py-0.5 text-[11px] text-rose-300">{s}</span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-6 flex flex-wrap justify-center gap-4">
              <Button onClick={() => router.push("/skill-gap")}><Icon name="SlidersHorizontal" size={16} /> {t("sd.analyzeGaps")}</Button>
              <Button variant="outline" onClick={() => router.push("/roadmap")}><Icon name="Route" size={16} /> {t("sd.openRoadmap")}</Button>
              <Button variant="secondary" onClick={() => router.push("/dashboard")}><Icon name="Home" size={16} /> {t("sd.goHub")}</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div ref={bottomRef} />
    </PageShell>
  );
}

export default function SkillDNAPage() {
  return <QuizInner />;
}
