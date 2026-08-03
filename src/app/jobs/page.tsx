"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageShell } from "@/components/layout/background";
import { PageHeader } from "@/components/ui/page-header";
import { FilterBar } from "@/components/opportunities/filters";
import { JobCard } from "@/components/opportunities/cards";
import { Select, Skeleton, Button, Badge } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { JOBS } from "@/lib/data/opportunities";
import { useAuth, GUEST_USER } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { listAllPostedJobs, applyToPostedJob, listJobApplications, type PostedJob } from "@/lib/db";
import { cn } from "@/lib/utils";

function fmt(str: string, vars: Record<string, string | number>) {
  return str.replace(/\{(\w+)\}/g, (m, k) => String(vars[k] ?? m));
}

export default function JobsPage() {
  const params = useSearchParams();
  const router = useRouter();
  const { user: authUser } = useAuth();
  const user = authUser ?? GUEST_USER;
  const { t } = useLang();
  const { applyTo, pushNotification, toast } = useStore();

  const [board, setBoard] = useState<PostedJob[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);

  const [hydrated, setHydrated] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [location, setLocation] = useState("All");
  const [type, setType] = useState("All");
  const [remote, setRemote] = useState(false);
  const [pulse, setPulse] = useState("");

  useEffect(() => setHydrated(true), []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBoard(listAllPostedJobs());
    if (authUser?.email) {
      const mine = listJobApplications().filter((a) => a.seekerEmail.toLowerCase().trim() === authUser.email.toLowerCase().trim());
      setAppliedJobIds(mine.map((a) => a.jobId));
    }
  }, [authUser]);
  useEffect(() => {
    setCategory(params.get("category") ?? "All");
    setLocation(params.get("location") ?? "All");
    setQuery(params.get("q") ?? "");
  }, [params]);

  const highlight = params.get("highlight");
  useEffect(() => {
    if (!highlight || !hydrated) return;
    const t = setTimeout(() => {
      const el = document.querySelector(`[data-opp-id="${highlight}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setPulse(highlight);
        setTimeout(() => setPulse(""), 3200);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [highlight, hydrated]);

  const categories = useMemo(() => Array.from(new Set(JOBS.map((j) => j.category))).sort(), []);
  const locations = useMemo(() => Array.from(new Set(JOBS.map((j) => j.location))).sort(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return JOBS.filter((j) => {
      if (category !== "All" && j.category !== category) return false;
      if (location !== "All" && j.location !== location) return false;
      if (type !== "All" && j.type !== type) return false;
      if (remote && !j.remote) return false;
      if (q && !`${j.title} ${j.company} ${j.description} ${j.skills.join(" ")}`.toLowerCase().includes(q)) return false;
      return true;
    }).sort((a, b) => b.aiMatch - a.aiMatch);
  }, [query, category, location, type, remote]);

  const reset = () => {
    setQuery("");
    setCategory("All");
    setLocation("All");
    setType("All");
    setRemote(false);
  };

  const applyToBoard = (job: PostedJob) => {
    if (!authUser || authUser.id === "guest") {
      toast(t("jobboard.loginToast"), { kind: "error", message: t("jobboard.loginMsg") });
      router.push("/login?from=/jobs");
      return;
    }
    const res = applyToPostedJob(job, { name: authUser.name, email: authUser.email });
    if (!res.ok) {
      toast(t("jobboard.applied"), { kind: "info" });
      return;
    }
    applyTo({ opportunityId: job.id, kind: "job", title: job.title, company: job.company, match: 0 });
    setAppliedJobIds((prev) => [job.id, ...prev]);
    pushNotification({
      title: t("jobboard.notifTitle"),
      body: fmt(t("jobboard.notifBody"), { title: job.title, company: job.company }),
      time: t("course.justNow"),
      kind: "opportunity",
    });
    toast(t("jobboard.appliedToast"), { message: fmt(t("jobboard.appliedMsg"), { company: job.company }) });
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("job.eyebrow")}
        title={t("job.title")}
        sub={t("job.sub")}
        icon="Building2"
      >
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-navy-200">
          <Icon name="TrendingUp" size={15} className="text-mint-400" /> {t("job.openings").replace("{count}", String(JOBS.length))}
        </div>
      </PageHeader>

      {board.length > 0 && (
        <section className="mb-8 rounded-3xl border border-saffron-500/25 bg-gradient-to-b from-saffron-500/10 via-white/3 to-transparent p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-saffron-400">{t("jobboard.eyebrow")}</p>
              <h2 className="mt-1 text-xl font-bold text-white">{t("jobboard.title")}</h2>
              <p className="mt-1 text-sm text-navy-300">{t("jobboard.sub")}</p>
            </div>
            <Badge tone="warm"><Icon name="Zap" size={13} /> {fmt(t("jobboard.applicants"), { count: board.length })}</Badge>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {board.map((job) => {
              const applied = appliedJobIds.includes(job.id);
              return (
                <div key={job.id} className="flex flex-col rounded-2xl border border-white/10 bg-white/4 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-saffron-400/40">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="blue">{job.role}</Badge>
                        <Badge tone="warm"><Icon name="Zap" size={11} /> {t("jobboard.hiringNow")}</Badge>
                      </div>
                      <h3 className="mt-2 font-bold text-white">{job.title}</h3>
                      <p className="text-sm text-navy-300">{job.company}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-navy-300">
                    <span className="inline-flex items-center gap-1.5"><Icon name="MapPin" size={13} className="text-electric-300" /> {job.city}</span>
                    <span className="inline-flex items-center gap-1.5"><Icon name="IndianRupee" size={13} className="text-mint-400" /> {job.salary}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {job.skills.slice(0, 4).map((s) => (
                      <span key={s} className="rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] text-navy-300">{s}</span>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    {applied ? (
                      <Button size="sm" variant="ghost" disabled>
                        <Icon name="Check" size={14} /> {t("jobboard.applied")}
                      </Button>
                    ) : (
                      <Button size="sm" variant="warm" onClick={() => applyToBoard(job)}>
                        <Icon name="Rocket" size={14} /> {t("jobboard.apply")}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <FilterBar
        count={filtered.length}
        query={query}
        onQuery={setQuery}
        category={category}
        onCategory={setCategory}
        categories={categories}
        location={location}
        onLocation={setLocation}
        locations={locations}
        queryPlaceholder="Search jobs, company or skill…"
        reset={reset}
      >
        <Select value={type} onChange={(e) => setType(e.target.value)} className="w-full sm:w-36" aria-label="Filter by type">
          <option value="All">All types</option>
          <option>Full-time</option>
          <option>Part-time</option>
          <option>Contract</option>
        </Select>
        <ToggleButton active={remote} onClick={() => setRemote((v) => !v)} label="Remote" icon="Globe" />
      </FilterBar>

      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {!hydrated ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72" />)
        ) : filtered.length ? (
          filtered.map((j, idx) => (
            <div key={j.id} data-opp-id={j.id} className={cn("rounded-2xl transition-all duration-500", pulse === j.id && "ring-2 ring-saffron-400/70 shadow-[0_0_40px_-8px_rgba(255,153,51,0.5)]")}>
              <JobCard j={j} user={user} index={idx} />
            </div>
          ))
        ) : (
          <div className="col-span-full glass rounded-2xl p-12 text-center">
            <Icon name="SearchX" size={32} className="mx-auto text-navy-400" />
            <p className="mt-4 font-semibold text-white">No jobs match those filters</p>
            <p className="mt-1 text-sm text-navy-300">Try clearing a filter or searching a different skill.</p>
          </div>
        )}
      </div>
    </PageShell>
  );
}

function ToggleButton({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon: string }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex h-11 items-center gap-1.5 rounded-xl border px-3 text-sm font-medium transition-colors cursor-pointer",
        active ? "border-electric-400/60 bg-electric-500/15 text-white" : "border-white/10 text-navy-300 hover:bg-white/5"
      )}
    >
      <Icon name={icon} size={14} /> {label}
    </button>
  );
}
