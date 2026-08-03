"use client";

import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/layout/background";
import { PageHeader } from "@/components/ui/page-header";
import { Button, Input, Textarea, Field, Badge } from "@/components/ui/primitives";
import { Bar } from "@/components/ui/visuals";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { emptyResume, generateResumeSummary, improveBullet, resumeHealthScore } from "@/lib/ai/engine";
import { SKILL_LEVELS } from "@/lib/data/skills";
import { uid } from "@/lib/utils";
import { downloadResumePdf } from "@/lib/pdf";
import type { ResumeData } from "@/types";
import { useLang } from "@/lib/i18n";

function fmt(str: string, vars: Record<string, string | number>) {
  return str.replace(/\{(\w+)\}/g, (m, k) => String(vars[k] ?? m));
}

export default function ResumeBuilderPage() {
  const { t, isHindi } = useLang();
  const { user, updateProfile } = useAuth();
  const { resume, setResume, toast } = useStore();
  const [draft, setDraft] = useState<ResumeData | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!draft && user) setDraft(resume ?? emptyResume(user));
  }, [resume, user, draft]);

  const r = draft;
  const health = useMemo(() => (r ? resumeHealthScore(r, isHindi) : null), [r, isHindi]);

  if (!r || !health) return <PageShell />;

  const patch = (p: Partial<ResumeData>) => {
    setDraft({ ...r, ...p });
    setSaved(false);
  };

  const save = () => {
    setResume(r);
    updateProfile({ resumeHealth: health.score });
    toast(t("resume.savedToast"), { message: fmt(t("resume.savedMsg"), { score: health.score }) });
    setSaved(true);
  };

  const genSummary = () => {
    if (!user) return;
    setDraft({ ...r, summary: generateResumeSummary(user, isHindi) });
    setSaved(false);
  };

  const improveAll = () => {
    const profile = user ?? {
      name: r.name,
      careerGoal: r.headline ? `a career in ${r.headline}` : "a career in tech",
      skills: r.skills,
      education: "Not specified",
      location: r.location,
    };
    setDraft({
      ...r,
      summary: r.summary.trim() ? improveBullet(r.summary, isHindi) : generateResumeSummary(profile, isHindi),
      projects: r.projects.map((p) => ({ ...p, description: improveBullet(p.description, isHindi) })),
    });
    toast(t("resume.polishToast"), { message: t("resume.polishMsg") });
    setSaved(false);
  };

  const addProject = () =>
    patch({ projects: [...r.projects, { id: uid("p"), name: t("resume.newProject"), description: t("resume.projectPlaceholder"), skills: [] }] });
  const addCert = () => patch({ certifications: [...r.certifications, { id: uid("c"), name: t("resume.newCert"), issuer: "", year: "2026" }] });

  const download = () => {
    save();
    downloadResumePdf(r);
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("resume.eyebrow")}
        title={t("resume.title")}
        sub={t("resume.sub")}
        icon="FileText"
      >
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{health.score}<span className="text-sm text-navy-400">/100</span></p>
            <p className="text-[10px] uppercase tracking-wider text-navy-400">{t("resume.healthScore")}</p>
          </div>
          <Button size="sm" onClick={save} disabled={saved}>
            <Icon name={saved ? "Check" : "Save"} size={14} /> {saved ? t("resume.saved") : t("resume.save")}
          </Button>
          <Button size="sm" variant="warm" onClick={download}>
            <Icon name="FileDown" size={14} /> {t("resume.download")}
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <div className="glass rounded-2xl p-5">
            <p className="mb-4 flex items-center gap-2 font-bold text-white"><Icon name="User" size={17} className="text-electric-300" /> {t("resume.basics")}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("prof.fullName")}><Input value={r.name} onChange={(e) => patch({ name: e.target.value })} /></Field>
              <Field label={t("resume.headline")}><Input value={r.headline} onChange={(e) => patch({ headline: e.target.value })} /></Field>
              <Field label={t("resume.email")}><Input type="email" value={r.email} onChange={(e) => patch({ email: e.target.value })} /></Field>
              <Field label={t("resume.phone")}><Input value={r.phone} onChange={(e) => patch({ phone: e.target.value })} placeholder="+91 …" /></Field>
              <Field label={t("resume.location")}><Input value={r.location} onChange={(e) => patch({ location: e.target.value })} /></Field>
              <Field label={t("resume.linkedin")}><Input value={r.linkedin} onChange={(e) => patch({ linkedin: e.target.value })} placeholder="linkedin.com/in/…" /></Field>
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="flex items-center gap-2 font-bold text-white"><Icon name="Sparkles" size={17} className="text-saffron-400" /> {t("resume.summary")}</p>
              <button onClick={genSummary} className="inline-flex items-center gap-1.5 rounded-lg border border-saffron-500/40 bg-saffron-500/10 px-2.5 py-1.5 text-xs font-medium text-saffron-300 transition-colors hover:bg-saffron-500/20 cursor-pointer">
                <Icon name="Wand2" size={13} /> {t("resume.aiGenerate")}
              </button>
            </div>
            <Textarea rows={4} value={r.summary} onChange={(e) => patch({ summary: e.target.value })} placeholder={t("resume.summaryPlaceholder")} />
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="flex items-center gap-2 font-bold text-white"><Icon name="Layers2" size={17} className="text-mint-400" /> {t("resume.projects")}</p>
              <button onClick={addProject} className="inline-flex items-center gap-1.5 rounded-lg border border-electric-400/50 px-2.5 py-1.5 text-xs font-medium text-electric-300 transition-colors hover:bg-electric-500/10 cursor-pointer">
                <Icon name="Plus" size={13} /> {t("resume.addProject")}
              </button>
            </div>
            <div className="space-y-3">
              {r.projects.map((p) => (
                <div key={p.id} className="rounded-xl border border-white/10 bg-white/4 p-3.5">
                  <Input className="mb-2" value={p.name} onChange={(e) => patch({ projects: r.projects.map((x) => (x.id === p.id ? { ...x, name: e.target.value } : x)) })} aria-label={t("resume.projectName")} />
                  <Textarea rows={2} value={p.description} onChange={(e) => patch({ projects: r.projects.map((x) => (x.id === p.id ? { ...x, description: e.target.value } : x)) })} aria-label={t("resume.projectDescription")} />
                </div>
              ))}
              {!r.projects.length && (
                <p className="text-sm text-navy-300">{t("resume.noProjects")}</p>
              )}
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <p className="mb-4 flex items-center gap-2 font-bold text-white"><Icon name="Award" size={17} className="text-violet-400" /> {t("resume.certs")}</p>
            <div className="space-y-2.5">
              {r.certifications.map((c) => (
                <div key={c.id} className="flex items-center gap-2">
                  <Input value={c.name} onChange={(e) => patch({ certifications: r.certifications.map((x) => (x.id === c.id ? { ...x, name: e.target.value } : x)) })} aria-label={t("resume.certName")} />
                  <Input className="w-28" value={c.year} onChange={(e) => patch({ certifications: r.certifications.map((x) => (x.id === c.id ? { ...x, year: e.target.value } : x)) })} aria-label={t("resume.year")} />
                </div>
              ))}
              <button onClick={addCert} className="inline-flex items-center gap-1.5 text-xs font-medium text-electric-300 hover:text-white cursor-pointer">
                <Icon name="Plus" size={13} /> {t("resume.addCert")}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <p className="font-bold text-white">{t("resume.health")}</p>
              <span className="text-2xl font-bold text-gradient">{health.score}%</span>
            </div>
            <div className="mt-4 space-y-3">
              {health.categories.map((c) => (
                <Bar key={c.label} label={c.label} value={c.score} color={c.score >= 75 ? "#2dd4a7" : c.score >= 50 ? "#ffad4d" : "#ff4d6d"} suffix="" />
              ))}
            </div>
            <div className="mt-5 space-y-2">
              {health.suggestions.map((s) => (
                <p key={s} className="flex gap-2 text-xs text-navy-200"><Icon name="Lightbulb" size={13} className="mt-0.5 shrink-0 text-saffron-400" /> {s}</p>
              ))}
            </div>
            <Button variant="warm" className="mt-5 w-full" onClick={improveAll}>
              <Icon name="Wand2" size={15} /> {t("resume.aiPolish")}
            </Button>
          </div>

          <div className="glass rounded-2xl p-5">
            <p className="mb-3 flex items-center gap-2 font-bold text-white"><Icon name="Terminal" size={16} className="text-electric-300" /> {t("resume.skills")}</p>
            <div className="flex flex-wrap gap-1.5">
              {r.skills.map((s) => (
                <Badge key={s.name} tone="blue">{s.name}</Badge>
              ))}
            </div>
            <p className="mt-3 text-xs text-navy-400">{t("resume.manageSkills")}</p>
          </div>

          <div className="glass rounded-2xl p-5">
            <p className="mb-2 font-bold text-white">{t("resume.tips")}</p>
            {[
              t("resume.tip.1"),
              t("resume.tip.2"),
              t("resume.tip.3"),
              t("resume.tip.4"),
            ].map((t) => (
              <p key={t} className="flex gap-2 py-1 text-xs text-navy-200"><Icon name="Check" size={13} className="mt-0.5 text-mint-400" /> {t}</p>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
