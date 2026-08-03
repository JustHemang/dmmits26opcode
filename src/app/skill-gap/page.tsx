"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/layout/background";
import { PageHeader } from "@/components/ui/page-header";
import { Badge, Button, Select } from "@/components/ui/primitives";
import { Bar } from "@/components/ui/visuals";
import { Icon } from "@/components/ui/icon";
import { CAREER_DEFS } from "@/lib/data/careers";
import { SKILL_CATALOG } from "@/lib/data/skills";
import { useAuth } from "@/lib/auth";
import { generateSkillGap } from "@/lib/ai/engine";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";

function fmt(str: string, vars: Record<string, string | number>) {
  return str.replace(/\{(\w+)\}/g, (m, k) => String(vars[k] ?? m));
}

const LEVELS = ["Beginner", "Intermediate", "Advanced", "Professional"] as const;

export default function SkillGapPage() {
  const { t, isHindi } = useLang();
  const { user, updateProfile } = useAuth();
  const [careerId, setCareerId] = useState(user?.targetCareerId || "ui-ux-designer");

  const career = CAREER_DEFS.find((c) => c.id === careerId) ?? CAREER_DEFS[0];
  const skills = user?.skills ?? [];
  const gap = useMemo(() => generateSkillGap(career.id, skills, isHindi), [career.id, skills, isHindi]);
  const met = gap.filter((g) => g.status === "met").length;
  const pct = gap.length ? Math.min(100, Math.round((met / gap.length) * 100)) : 0;

  const setLevel = (name: string, level: (typeof LEVELS)[number]) => {
    const next = skills.some((s) => s.name === name)
      ? skills.map((s) => (s.name === name ? { ...s, level } : s))
      : [...skills, { name, level }];
    updateProfile({ skills: next });
  };

  const addSkill = (name: string) => {
    if (skills.some((s) => s.name === name)) return;
    updateProfile({ skills: [...skills, { name, level: "Beginner" as const }] });
  };

  const missing = SKILL_CATALOG.filter((s) => !skills.some((k) => k.name === s));

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("gap.eyebrow")}
        title={t("gap.title")}
        sub={t("gap.sub")}
        icon="SlidersHorizontal"
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-5">
          <div className="glass rounded-2xl p-5">
            <label className="mb-2 block text-sm font-medium text-navy-200">{t("gap.targetCareer")}</label>
            <Select value={careerId} onChange={(e) => setCareerId(e.target.value)}>
              {CAREER_DEFS.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </Select>
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/4 p-3.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-electric-500/15 text-electric-300">
                <Icon name="Target" size={18} />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{career.title}</p>
                <p className="text-xs text-navy-300">{career.salary} · {fmt(t("gap.demand"), { demand: career.demand })} · {fmt(t("gap.growth"), { growth: career.growth })}</p>
              </div>
              <span className="text-2xl font-bold text-gradient">{pct}%</span>
            </div>
            <div className="mt-3">
              <Bar value={pct} color="#2dd4a7" />
              <p className="mt-1.5 text-xs text-navy-400">{fmt(t("gap.covered"), { met, total: gap.length })}</p>
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <p className="mb-4 flex items-center gap-2 font-bold text-white">
              <Icon name="Gauge" size={18} className="text-electric-300" /> {t("gap.yourLevels")}
            </p>
            {skills.length ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {skills.map((s) => (
                  <div key={s.name} className="flex items-center justify-between gap-2 rounded-xl bg-white/4 px-3 py-2">
                    <span className="text-sm text-navy-100">{s.name}</span>
                    <select
                      value={s.level}
                      onChange={(e) => setLevel(s.name, e.target.value as (typeof LEVELS)[number])}
                      className="h-8 rounded-lg border border-white/10 bg-navy-900 px-2 text-xs text-white focus:border-electric-400 focus:outline-none cursor-pointer"
                      aria-label={fmt(t("gap.skillLevelLabel"), { skill: s.name })}
                    >
                      {LEVELS.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-navy-300">{t("gap.noSkills")}</p>
            )}
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-navy-400">{t("gap.addSkill")}</p>
              <div className="flex flex-wrap gap-1.5">
                {missing.slice(0, 24).map((s) => (
                  <button
                    key={s}
                    onClick={() => addSkill(s)}
                    className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-navy-200 transition-colors hover:border-electric-400/40 hover:text-white cursor-pointer"
                  >
                    <Icon name="Plus" size={11} /> {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <p className="mb-4 flex items-center gap-2 font-bold text-white">
            <Icon name="ClipboardCheck" size={18} className="text-saffron-400" /> {fmt(t("gap.report"), { career: career.title })}
          </p>
          <div className="space-y-2.5">
            {gap.map((g) => (
              <div key={g.skill} className={cn("rounded-xl border p-3.5 transition-colors", g.status === "met" ? "border-mint-400/25 bg-mint-400/8" : g.status === "partial" ? "border-saffron-500/30 bg-saffron-500/8" : "border-rose-glow/30 bg-rose-glow/8")}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-white">{g.skill}</p>
                  {g.status === "met" ? (
                    <Badge tone="green">{t("gap.met")}</Badge>
                  ) : g.status === "partial" ? (
                    <Badge tone="warm">{t("gap.partial")}</Badge>
                  ) : (
                    <Badge tone="red">{t("gap.gap")}</Badge>
                  )}
                </div>
                <div className="mt-2.5 flex items-center gap-3">
                  <div className="flex-1">
                    <div className="mb-1 flex justify-between text-[11px] text-navy-400">
                      <span>{fmt(t("gap.you"), { level: g.currentLevel || "—" })}</span>
                      <span>{fmt(t("gap.needed"), { level: g.requiredLevel })}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, (g.currentLevel / g.requiredLevel) * 100)}%`,
                          background: g.status === "met" ? "#2dd4a7" : g.status === "partial" ? "#ffad4d" : "#ff4d6d",
                        }}
                      />
                    </div>
                  </div>
                </div>
                {g.status !== "met" && g.learningResource && (
                  <Link href="/training" className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-electric-300 hover:text-white">
                    <Icon name="GraduationCap" size={13} /> {t("gap.learnVia")} “{g.learningResource}” <Icon name="ArrowRight" size={12} />
                  </Link>
                )}
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => updateProfile({})}>
              <Icon name="RefreshCcw" size={14} /> {t("gap.refresh")}
            </Button>
            <Link href="/roadmap" className="inline-flex items-center gap-1.5 rounded-xl border border-electric-400/50 px-4 py-2 text-sm font-medium text-electric-300 transition-colors hover:bg-electric-500/10 hover:text-white">
              <Icon name="Route" size={14} /> {t("gap.buildRoadmap")}
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
