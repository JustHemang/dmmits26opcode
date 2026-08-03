"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/layout/background";
import { PageHeader } from "@/components/ui/page-header";
import { Button, Badge, Field, Input, Select } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { useLang, type TranslationKey } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import {
  getEmployerSession,
  setEmployerSession,
  listEmployerJobs,
  saveEmployerJobs,
  listJobApplications,
  setJobApplicationStatus,
  getApplicantDetail,
  listSeekerCandidates,
  type EmployerRecord,
  type PostedJob,
  type JobApplication,
  type ApplicantDetail,
  type SeekerCandidate,
} from "@/lib/db";

type ApplicantRow = { application: JobApplication; detail: ApplicantDetail; job?: PostedJob };
type Candidate = SeekerCandidate & { match: number };

const CATEGORY_SKILLS: Record<string, string[]> = {
  "IT & Software": ["JavaScript", "React", "HTML", "CSS", "SQL", "Python"],
  "Design": ["Figma", "UI Design", "Photoshop", "Canva", "Illustrator"],
  "AI & Data": ["Python", "SQL", "Excel", "Power BI", "Statistics"],
  "Digital Marketing": ["SEO", "Social Media", "Content Creation", "Google Analytics"],
  "Healthcare": ["Patient Care", "First Aid", "Medical Terminology"],
  "Sales": ["Communication", "CRM", "Negotiation"],
  "Customer Service": ["Communication", "Query Resolution", "CRM"],
  "Finance": ["Excel", "Tally", "GST Basics"],
  "Operations": ["Excel", "Data Entry", "MS Office"],
  "Administration": ["MS Office", "Communication", "Scheduling"],
  "Human Resources": ["Sourcing", "Screening", "Communication"],
  "Logistics": ["Inventory Management", "Excel", "Coordination"],
  "Media & Content": ["Copywriting", "Grammar", "SEO Basics"],
  "Electrical": ["Electrical Fundamentals", "Wiring", "Safety Standards"],
  "Automotive": ["EV Technology", "Diagnostics", "Safety Standards"],
  "Agriculture": ["Precision Farming", "Drone Operations", "Data Recording"],
  "Hospitality": ["Front Office", "Customer Service", "Communication"],
  "Beauty & Wellness": ["Skincare", "Cosmetology", "Communication"],
  "Construction": ["Site Management", "Blueprint Reading", "Safety Standards"],
};

const ROLE_OPTIONS = Object.keys(CATEGORY_SKILLS);

function hashScore(a: string, b: string): number {
  let h = 0;
  const s = a + "|" + b;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function matchFor(c: SeekerCandidate, jobs: PostedJob[]): number {
  if (jobs.length === 0) return 55 + (hashScore(c.id, "base") % 25);
  let best = 0;
  for (const j of jobs) {
    const req = j.skills.length ? j.skills : (CATEGORY_SKILLS[j.role] ?? []);
    if (c.skills.length === 0 || req.length === 0) {
      const base = 62 + (hashScore(c.id, j.id) % 20);
      best = Math.max(best, base);
      continue;
    }
    const cLower = c.skills.map((s) => s.toLowerCase());
    const overlap = req.filter((r) => cLower.includes(r.toLowerCase())).length;
    const denom = Math.min(req.length, c.skills.length);
    const ratio = denom ? overlap / denom : 0;
    best = Math.max(best, Math.min(98, Math.round(45 + ratio * 53)));
  }
  return best;
}

function fmt(str: string, vars: Record<string, string | number>) {
  return str.replace(/\{(\w+)\}/g, (m, k) => String(vars[k] ?? m));
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function day(ts: number) {
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const STATUS_BADGE: Record<JobApplication["status"], { label: TranslationKey; tone: "blue" | "green" | "warm" | "red" | "neutral" }> = {
  applied: { label: "hire.applied", tone: "blue" },
  shortlisted: { label: "hire.shortlisted", tone: "warm" },
  interview: { label: "hire.interviews", tone: "warm" },
  interviewed: { label: "hire.interviewed", tone: "green" },
  hired: { label: "hire.hired", tone: "green" },
  rejected: { label: "hire.rejected", tone: "red" },
};

export default function EmployerPage() {
  const router = useRouter();
  const { t } = useLang();
  const { toast, pushNotification, markOpportunitySelected } = useStore();
  const [employer, setEmployer] = useState<EmployerRecord | null>(null);
  const [ready, setReady] = useState(false);
  const [jobs, setJobs] = useState<PostedJob[]>([]);
  const [rows, setRows] = useState<ApplicantRow[]>([]);
  const [talent, setTalent] = useState<Candidate[]>([]);
  const [tab, setTab] = useState<"applicants" | "openings" | "talent">("applicants");
  const [posting, setPosting] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [form, setForm] = useState({ title: "", role: "IT & Software", city: "Delhi", salary: "₹3.5 LPA", skills: "" });
  const [scorecard, setScorecard] = useState<JobApplication | null>(null);

  useEffect(() => {
    const emp = getEmployerSession();
    if (!emp) {
      router.replace("/hiring");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEmployer(emp);
    const jobsArr = listEmployerJobs(emp.email);
    setJobs(jobsArr);
    setRows(
      listJobApplications()
        .filter((a) => jobsArr.some((j) => j.id === a.jobId))
        .map((a) => ({ application: a, detail: getApplicantDetail(a.seekerEmail), job: jobsArr.find((j) => j.id === a.jobId) }))
    );
    setTalent(listSeekerCandidates().map((c) => ({ ...c, match: matchFor(c, jobsArr) })));
    setReady(true);
  }, [router]);

  const persistJobs = (next: PostedJob[]) => {
    setJobs(next);
    if (employer) saveEmployerJobs(employer.email, next);
  };

  const stats = useMemo(() => {
    const applicants = rows.filter((r) => r.application.status !== "rejected").length;
    const interviews = rows.filter((r) => r.application.status === "interview").length;
    const hires = rows.filter((r) => r.application.status === "hired").length;
    return { jobs: jobs.length, applicants, interviews, hires };
  }, [rows, jobs]);

  const postJob = () => {
    if (!form.title.trim() || !employer) return;
    const manual = form.skills.split(",").map((s) => s.trim()).filter(Boolean);
    const skills = manual.length ? manual : (CATEGORY_SKILLS[form.role] ?? []);
    const job: PostedJob = {
      id: `ej${Date.now()}`,
      title: form.title.trim(),
      role: form.role,
      city: form.city,
      salary: form.salary,
      skills,
      hires: 0,
      employerEmail: employer.email,
      company: employer.company,
      createdAt: Date.now(),
    };
    persistJobs([job, ...jobs]);
    setForm({ title: "", role: "IT & Software", city: "Delhi", salary: "₹3.5 LPA", skills: "" });
    setPosting(false);
    toast("Opening published!", { message: `"${job.title}" is now live for applicants.` });
  };

  const deleteJob = (id: string) => {
    persistJobs(jobs.filter((j) => j.id !== id));
    setRows((prev) => prev.filter((r) => r.application.jobId !== id));
  };

  const setStatus = (application: JobApplication, status: JobApplication["status"]) => {
    setJobApplicationStatus(application.id, status);
    setRows((prev) =>
      prev.map((r) => (r.application.id === application.id ? { ...r, application: { ...r.application, status, updatedAt: Date.now() } } : r))
    );
  };

  const hire = (application: JobApplication) => {
    const job = jobs.find((j) => j.id === application.jobId);
    const company = job?.company ?? employer?.company ?? "their team";
    setStatus(application, "hired");
    markOpportunitySelected(application.jobId);
    if (job) persistJobs(jobs.map((j) => (j.id === job.id ? { ...j, hires: j.hires + 1 } : j)));
    pushNotification({
      title: fmt(t("hire.hireNotifTitle"), { company }),
      body: fmt(t("hire.hireNotifBody"), { name: application.seekerName, company, title: job?.title ?? "" }),
      time: t("hire.hireNotifTime"),
      kind: "opportunity",
    });
    toast(t("hire.hireToastTitle"), { message: fmt(t("hire.hireToastMsg"), { name: application.seekerName }) });
  };

  const signOut = () => {
    setEmployerSession(null);
    router.push("/hiring");
  };

  if (!ready || !employer) return null;

  const applicantsFor = (jobId: string) => rows.filter((r) => r.application.jobId === jobId);
  const activeRows = rows.filter((r) => r.application.status !== "rejected");
  const activeOrdered = [...activeRows].sort((a, b) => {
    const rank: Record<JobApplication["status"], number> = { applied: 0, shortlisted: 1, interview: 2, interviewed: 3, hired: 4, rejected: 5 };
    return rank[a.application.status] - rank[b.application.status] || b.application.appliedAt - a.application.appliedAt;
  });

  const actionButtons = (row: ApplicantRow) => {
    const app = row.application;
    if (app.status === "hired") {
      return (
        <div className="flex items-center gap-2">
          <Badge tone="green"><Icon name="CheckCircle2" size={13} /> {t(STATUS_BADGE.hired.label)}</Badge>
          <a
            href={`mailto:${app.seekerEmail}?subject=${encodeURIComponent(`Onboarding at ${row.job?.company ?? employer.company}`)}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-electric-400/40 px-2.5 py-1.5 text-xs font-medium text-electric-300 transition-colors hover:bg-electric-500/10"
          >
            <Icon name="Mail" size={13} /> {t("hire.contact")}
          </a>
        </div>
      );
    }
    if (app.status === "rejected") {
      return <Badge tone="red"><Icon name="X" size={13} /> {t(STATUS_BADGE.rejected.label)}</Badge>;
    }
    return (
      <div className="flex flex-wrap items-center gap-2">
        {app.status === "applied" && (
          <Button size="sm" onClick={() => setStatus(app, "shortlisted")}>
            <Icon name="ThumbsUp" size={13} /> {t("hire.shortlist")}
          </Button>
        )}
        {app.status === "shortlisted" && (
          <Button size="sm" onClick={() => setStatus(app, "interview")}>
            <Icon name="Mic" size={13} /> Invite to AI Interview
          </Button>
        )}
        {app.status === "interview" && (
          <Badge tone="warm"><Icon name="Clock" size={13} /> Waiting for AI Interview</Badge>
        )}
        {app.status === "interviewed" && (
          <div className="flex items-center gap-2">
            <Badge tone="green"><Icon name="CheckCircle" size={13} /> AI Score: {app.aiInterviewData?.score}%</Badge>
            <Button size="sm" onClick={() => setScorecard(app)}>
              <Icon name="FileText" size={13} /> View Scorecard
            </Button>
          </div>
        )}
        {(app.status === "shortlisted" || app.status === "interviewed") && (
          <Button size="sm" variant="warm" onClick={() => hire(app)}>
            <Icon name="PartyPopper" size={13} /> {t("hire.hire")}
          </Button>
        )}
        {app.status !== "interviewed" && app.status !== "interview" && (
          <Button size="sm" variant="ghost" onClick={() => setStatus(app, "rejected")}>
            <Icon name="X" size={13} /> {t("hire.rejectCandidate")}
          </Button>
        )}
        <a
          href={`mailto:${app.seekerEmail}?subject=${encodeURIComponent(`Opportunity at ${row.job?.company ?? employer.company}`)}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-electric-400/40 px-2.5 py-1.5 text-xs font-medium text-electric-300 transition-colors hover:bg-electric-500/10"
        >
          <Icon name="Mail" size={13} /> {t("hire.contact")}
        </a>
      </div>
    );
  };

  const renderApplicant = (row: ApplicantRow) => (
    <div key={row.application.id} className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/4 p-4 md:flex-row md:items-start">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-electric-500 to-sky-glow text-sm font-bold text-white">
        {initials(row.detail.name)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-white">{row.detail.name}</p>
          <Badge tone={STATUS_BADGE[row.application.status].tone}>{t(STATUS_BADGE[row.application.status].label)}</Badge>
          <span className="text-xs text-navy-400">{fmt(t("hire.appliedOn"), { date: day(row.application.appliedAt) })}</span>
        </div>
        <p className="mt-0.5 text-sm text-navy-300">
          {row.job && <span className="font-medium text-electric-300">{row.job.title}</span>}
          {row.job && <span> · </span>}
          {row.detail.city}{row.detail.education ? ` · ${row.detail.education}` : ""}
          {row.detail.targetCareer ? ` · ${row.detail.targetCareer}` : ""}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(row.detail.skills.length ? row.detail.skills : ["SkillDNA pending"]).slice(0, 6).map((s) => (
            <span key={s} className="rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] text-navy-300">{s}</span>
          ))}
        </div>
      </div>
      <div className="shrink-0">{actionButtons(row)}</div>
    </div>
  );

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("hire.workspace")}
        title={employer.company}
        sub={fmt(t("hire.workspaceSub"), { email: employer.email })}
        icon="Building2"
      >
        <div className="flex items-center gap-2">
          <Badge tone="green">{t("hire.learners")} · {talent.length}</Badge>
          <Button size="sm" variant="ghost" onClick={signOut}>
            <Icon name="LogOut" size={14} /> {t("hire.signOut")}
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { l: t("hire.openings"), v: stats.jobs, icon: "Briefcase", c: "text-electric-300" },
          { l: t("hire.applicants"), v: stats.applicants, icon: "Users2", c: "text-mint-400" },
          { l: t("hire.interviews"), v: stats.interviews, icon: "MessageCircle", c: "text-saffron-400" },
          { l: t("hire.hires"), v: stats.hires, icon: "PartyPopper", c: "text-rose-300" },
        ].map((s) => (
          <div key={s.l} className="glass flex items-center gap-4 rounded-2xl p-5">
            <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/6", s.c)}>
              <Icon name={s.icon as never} size={20} />
            </span>
            <div>
              <p className="text-2xl font-bold text-white">{s.v}</p>
              <p className="text-xs text-navy-300">{s.l}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-2">
        {[
          { id: "applicants" as const, label: t("hire.applicantsTab"), icon: "Users2" },
          { id: "openings" as const, label: t("hire.openings"), icon: "Briefcase" },
          { id: "talent" as const, label: t("hire.talentPool"), icon: "Sparkles" },
        ].map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
              tab === tb.id ? "bg-electric-500/15 text-white" : "text-navy-300 hover:bg-white/5"
            )}
          >
            <Icon name={tb.icon as never} size={15} /> {tb.label}
          </button>
        ))}
      </div>

      {tab === "applicants" && (
        <div className="mt-8">
          {activeOrdered.length === 0 ? (
            <div className="glass rounded-[2rem] p-16 text-center">
              <div className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-full bg-electric-500/10 shadow-glow-blue border border-electric-400/20">
                <Icon name="Users2" size={40} className="text-electric-400" />
              </div>
              <p className="mt-4 text-2xl font-bold text-white">{t("hire.emptyApplicants")}</p>
              <p className="mx-auto mt-2 max-w-md text-navy-300">{t("hire.emptyApplicantsSub")}</p>
              <Button className="mt-8" onClick={() => { setTab("openings"); setPosting(true); }}>
                <Icon name="Plus" size={16} /> {t("hire.postJob")}
              </Button>
            </div>
          ) : (
            <div className="flex gap-6 overflow-x-auto pb-8 snap-x scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/10">
              {[
                { id: "applied", label: "New Applied", statuses: ["applied"], color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
                { id: "reviewing", label: "Under Review", statuses: ["shortlisted"], color: "bg-saffron-500/10 text-saffron-400 border-saffron-500/20" },
                { id: "interview", label: "Interviews", statuses: ["interview", "interviewed"], color: "bg-electric-500/10 text-electric-300 border-electric-500/20" },
                { id: "selected", label: "Selected", statuses: ["hired"], color: "bg-mint-500/10 text-mint-400 border-mint-500/20" },
              ].map((column) => {
                const columnApps = activeOrdered.filter(a => column.statuses.includes(a.application.status));
                return (
                  <div key={column.id} className="flex flex-col min-w-[320px] max-w-[320px] snap-center">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white">{column.label}</h3>
                      <span className={`inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${column.color}`}>
                        {columnApps.length}
                      </span>
                    </div>
                    
                    <div className="flex flex-col gap-4 min-h-[400px] rounded-2xl bg-white/2 p-3 border border-white/5">
                      {columnApps.map((row) => (
                        <div key={row.application.id} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-navy-900/50 p-4 shadow-lg backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/5 hover:scale-[1.02]">
                          <div className="flex items-start gap-3">
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-electric-500 to-sky-glow text-xs font-bold text-white shadow-glow-blue">
                              {initials(row.detail.name)}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-bold text-white">{row.detail.name}</p>
                              <p className="truncate text-xs text-navy-300">
                                {row.job ? <span className="font-medium text-electric-300">{row.job.title}</span> : null}
                              </p>
                              <p className="truncate text-xs text-navy-400 mt-0.5">
                                {row.detail.city}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {(row.detail.skills.length ? row.detail.skills : ["SkillDNA pending"]).slice(0, 3).map((s) => (
                              <span key={s} className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-medium text-navy-200">{s}</span>
                            ))}
                            {row.detail.skills.length > 3 && (
                              <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-medium text-navy-400">+{row.detail.skills.length - 3}</span>
                            )}
                          </div>
                          
                          <div className="mt-2 border-t border-white/5 pt-3">
                            <div className="flex flex-col gap-2">
                              {actionButtons(row)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "openings" && (
        <div className="mt-4">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-bold text-white">{fmt(t("hire.applicantsCount"), { count: rows.length })}</p>
            <Button size="sm" onClick={() => setPosting((p) => !p)}>
              <Icon name="Plus" size={14} /> {t("hire.postJob")}
            </Button>
          </div>

          {posting && (
            <div className="mb-4 space-y-3 rounded-xl border border-electric-400/25 bg-electric-500/8 p-4">
              <Field label={t("hire.jobTitle")}><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={t("hire.jobTitlePlaceholder")} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label={t("hire.category")}>
                  <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    {ROLE_OPTIONS.map((r) => <option key={r}>{r}</option>)}
                  </Select>
                </Field>
                <Field label={t("hire.city")}><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
              </div>
              <div className="grid grid-cols-2 items-end gap-3">
                <Field label={t("hire.salary")}><Input value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} /></Field>
                <Field label={t("hire.skills")}><Input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder={t("hire.skillsPlaceholder")} /></Field>
              </div>
              <Button onClick={postJob}><Icon name="Send" size={14} /> {t("hire.publish")}</Button>
            </div>
          )}

          {jobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center">
              <Icon name="Briefcase" size={28} className="mx-auto text-navy-400" />
              <p className="mt-3 text-sm font-semibold text-white">{t("hire.noJobs")}</p>
              <p className="mt-1 text-xs text-navy-400">{t("hire.postFirst")}</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {jobs.map((j) => {
                const apps = applicantsFor(j.id);
                const open = expanded.has(j.id);
                return (
                  <div key={j.id} className="rounded-xl border border-white/10 bg-white/4 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-white">{j.title}</p>
                        <p className="text-xs text-navy-400">{j.role} · {j.city} · {j.salary}</p>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {j.skills.slice(0, 4).map((s) => (
                            <span key={s} className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-navy-300">{s}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-navy-300">{fmt(t("hire.hiresCount"), { count: j.hires })}</span>
                        <button
                          onClick={() => setExpanded((prev) => { const next = new Set(prev); if (next.has(j.id)) next.delete(j.id); else next.add(j.id); return next; })}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-electric-400/40 px-3 py-1.5 text-xs font-medium text-electric-300 transition-colors hover:bg-electric-500/10 cursor-pointer"
                        >
                          <Icon name="Users2" size={13} /> {fmt(t("hire.viewApplicants"), { count: apps.length })}
                          <Icon name={open ? "ChevronDown" : "ChevronRight"} size={13} />
                        </button>
                        <button
                          onClick={() => deleteJob(j.id)}
                          aria-label={t("hire.deleteJob")}
                          className="grid h-8 w-8 place-items-center rounded-lg text-navy-400 transition-colors hover:bg-rose-glow/10 hover:text-rose-300 cursor-pointer"
                        >
                          <Icon name="X" size={15} />
                        </button>
                      </div>
                    </div>
                    {open && (
                      <div className="mt-4 space-y-2.5 border-t border-white/8 pt-4">
                        {apps.length === 0 ? (
                          <p className="text-sm text-navy-400">{t("hire.noApplicants")}</p>
                        ) : (
                          apps.map(renderApplicant)
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "talent" && (
        <div className="mt-4">
          <p className="mb-3 text-sm text-navy-400">{t("hire.talentPoolSub")}</p>
          {talent.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center">
              <Icon name="Users2" size={30} className="mx-auto text-navy-400" />
              <p className="mt-3 text-sm font-semibold text-white">{t("hire.noCandidates")}</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[...talent].sort((a, b) => b.match - a.match).map((c) => (
                <div key={c.id} className="glass flex flex-col rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className={cn("grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br text-sm font-bold text-white", c.match > 88 ? "from-mint-400 to-electric-500" : "from-saffron-400 to-brown-500")}>
                        {c.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                      </span>
                      <div>
                        <p className="font-semibold text-white">{c.name}</p>
                        <p className="text-xs text-navy-400">{c.city} · {c.education}</p>
                      </div>
                    </div>
                    <Badge tone={c.match >= 88 ? "green" : c.match >= 80 ? "warm" : "neutral"}>{fmt(t("hire.match"), { pct: c.match })}</Badge>
                  </div>
                  <p className="mt-3 text-sm font-medium text-navy-100">{c.targetCareer || t("hire.role")}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(c.skills.length ? c.skills : ["SkillDNA pending"]).slice(0, 6).map((s) => (
                      <span key={s} className="rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] text-navy-300">{s}</span>
                    ))}
                  </div>
                  <a
                    href={`mailto:${c.email}?subject=${encodeURIComponent(`Opportunity from ${employer.company}`)}&body=${encodeURIComponent(`Hi ${c.name},\n\nWe saw your profile on Skill India Hub and would like to discuss an opportunity at ${employer.company}.\n\nThanks,\n${employer.name}\n${employer.company}`)}`}
                    className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl border border-electric-400/40 px-3 py-2 text-xs font-medium text-electric-300 transition-colors hover:bg-electric-500/10"
                  >
                    <Icon name="Mail" size={13} /> {t("hire.contact")}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <p className="mt-8 text-center text-xs text-navy-400">
        {t("hire.savedNote")}
      </p>

      {scorecard && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-950/80 p-4 backdrop-blur-sm">
          <div className="glass w-full max-w-lg overflow-hidden rounded-2xl p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Icon name="BrainCircuit" size={24} className="text-electric-300" /> AI Interview Scorecard
              </h3>
              <button onClick={() => setScorecard(null)} className="text-navy-300 hover:text-white">
                <Icon name="X" size={20} />
              </button>
            </div>
            
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-white/5 p-4 text-center">
                <p className="text-xs font-semibold uppercase text-navy-400 mb-1">Overall Score</p>
                <p className="text-3xl font-bold text-mint-400">{scorecard.aiInterviewData?.score}%</p>
              </div>
              <div className="rounded-xl bg-white/5 p-4 text-center">
                <p className="text-xs font-semibold uppercase text-navy-400 mb-1">Tech Relevance</p>
                <p className="text-3xl font-bold text-sky-400">{scorecard.aiInterviewData?.technicalScore}%</p>
              </div>
            </div>

            <div className="mb-6 rounded-xl bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase text-navy-400 mb-2">AI Verdict</p>
              <div className="flex items-center gap-2 text-lg font-semibold text-white">
                <Icon name={scorecard.aiInterviewData?.score! > 85 ? "Award" : "ThumbsUp"} size={20} className="text-saffron-400" />
                {scorecard.aiInterviewData?.verdict}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs font-semibold uppercase text-navy-400 mb-2">Full Transcript</p>
              <div className="max-h-48 overflow-y-auto rounded-xl bg-white/5 p-4 text-sm leading-relaxed text-navy-200">
                "{scorecard.aiInterviewData?.transcript}"
              </div>
            </div>

            <Button className="w-full" variant="warm" onClick={() => {
              hire(scorecard);
              setScorecard(null);
            }}>
              <Icon name="PartyPopper" size={16} /> Hire Candidate Now
            </Button>
          </div>
        </div>
      )}
    </PageShell>
  );
}
