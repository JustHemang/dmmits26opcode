"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageShell } from "@/components/layout/background";
import { PageHeader } from "@/components/ui/page-header";
import { TrainingCard, InternshipCard, JobCard } from "@/components/opportunities/cards";
import { Input, Skeleton } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { TRAINING, INTERNSHIPS, JOBS } from "@/lib/data/opportunities";
import { useAuth, GUEST_USER } from "@/lib/auth";
import { useLang, type TranslationKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Tab = "all" | "training" | "internships" | "jobs";

const TABS: { id: Tab; labelKey: TranslationKey; icon: string }[] = [
  { id: "all", labelKey: "search.everything", icon: "Search" },
  { id: "training", labelKey: "search.training", icon: "GraduationCap" },
  { id: "internships", labelKey: "search.internships", icon: "Briefcase" },
  { id: "jobs", labelKey: "search.jobs", icon: "Building2" },
];

export default function SearchPage() {
  const params = useSearchParams();
  const { user: authUser } = useAuth();
  const user = authUser ?? GUEST_USER;
  const { t } = useLang();

  const [hydrated, setHydrated] = useState(false);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("all");

  useEffect(() => setHydrated(true), []);
  useEffect(() => setQuery(params.get("q") ?? ""), [params]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const match = (haystack: string) => (q ? haystack.toLowerCase().includes(q) : true);

    const training = TRAINING.filter(
      (t) => match(`${t.title} ${t.provider} ${t.description} ${t.skills.join(" ")} ${t.category}`)
    ).map((t) => ({ kind: "training" as const, id: t.id, title: t.title, match: t.aiMatch, data: t }));
    const internships = INTERNSHIPS.filter(
      (i) => match(`${i.title} ${i.company} ${i.description} ${i.skills.join(" ")} ${i.category}`)
    ).map((i) => ({ kind: "internship" as const, id: i.id, title: i.title, match: i.aiMatch, data: i }));
    const jobs = JOBS.filter(
      (j) => match(`${j.title} ${j.company} ${j.description} ${j.skills.join(" ")} ${j.category}`)
    ).map((j) => ({ kind: "job" as const, id: j.id, title: j.title, match: j.aiMatch, data: j }));

    const all = [...training, ...internships, ...jobs].sort((a, b) => b.match - a.match);
    return { training, internships, jobs, all, total: all.length };
  }, [query]);

  const visible = tab === "all" ? results.all : tab === "training" ? results.training : tab === "internships" ? results.internships : results.jobs;

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("search.eyebrow")}
        title={t("search.title")}
        sub={t("search.sub")}
        icon="Search"
      />

      <form
        onSubmit={(e) => e.preventDefault()}
        className="glass flex items-center gap-2 rounded-2xl border-white/10 p-2 sm:p-3"
      >
        <Icon name="Search" size={18} className="ml-2 shrink-0 text-navy-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search.placeholder")}
          aria-label="Search the hub"
          className="h-12 flex-1 border-0 bg-transparent px-1 text-white placeholder:text-navy-400 focus:ring-0"
          autoFocus
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-navy-400 transition-colors hover:bg-white/5 hover:text-white cursor-pointer"
          >
            <Icon name="X" size={16} />
          </button>
        )}
      </form>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {TABS.map((tb) => {
          const count = tb.id === "all" ? results.total : tb.id === "training" ? results.training.length : tb.id === "internships" ? results.internships.length : results.jobs.length;
          const active = tab === tb.id;
          return (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              aria-pressed={active}
              className={cn(
                "flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer",
                active ? "border-electric-400/60 bg-electric-500/15 text-white" : "border-white/10 text-navy-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon name={tb.icon} size={14} /> {t(tb.labelKey)}
              <span className={cn("rounded-full px-1.5 text-[11px]", active ? "bg-electric-500/30" : "bg-white/8 text-navy-400")}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {!hydrated ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72" />)}
          </div>
        ) : visible.length ? (
          <>
            <p className="mb-4 text-sm text-navy-300">
              <span className="font-semibold text-white">{visible.length}</span> {visible.length === 1 ? t("search.results").replace("{count}", String(visible.length)) : t("search.resultsPlural").replace("{count}", String(visible.length))} {t("search.for")} “{query || t("search.everything")}”
            </p>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visible.map((r, idx) =>
                r.kind === "training" ? (
                  <TrainingCard key={r.id} t={r.data} user={user} index={idx} />
                ) : r.kind === "internship" ? (
                  <InternshipCard key={r.id} i={r.data} user={user} index={idx} />
                ) : (
                  <JobCard key={r.id} j={r.data} user={user} index={idx} />
                )
              )}
            </div>
          </>
        ) : (
          <div className="glass col-span-full rounded-2xl p-12 text-center">
            <Icon name="SearchX" size={32} className="mx-auto text-navy-400" />
            <p className="mt-4 font-semibold text-white">{t("search.emptyTitle")} “{query}”</p>
            <p className="mt-1 text-sm text-navy-300">{t("search.emptySub")}</p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
