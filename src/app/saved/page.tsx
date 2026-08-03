"use client";

import { useMemo } from "react";
import { PageShell } from "@/components/layout/background";
import { PageHeader } from "@/components/ui/page-header";
import { TrainingCard, InternshipCard, JobCard } from "@/components/opportunities/cards";
import { Icon } from "@/components/ui/icon";
import { TRAINING, INTERNSHIPS, JOBS } from "@/lib/data/opportunities";
import { useStore } from "@/lib/store";
import { useAuth, GUEST_USER } from "@/lib/auth";
import { useLang } from "@/lib/i18n";

type Kind = "training" | "internship" | "job";

function fmt(str: string, vars: Record<string, string | number>) {
  return str.replace(/\{(\w+)\}/g, (m, k) => String(vars[k] ?? m));
}

export default function SavedPage() {
  const { saved, toggleSaved } = useStore();
  const { user: authUser } = useAuth();
  const user = authUser ?? GUEST_USER;
  const { t } = useLang();

  const items = useMemo(() => {
    const out: { kind: Kind; id: string; sort: number }[] = [];
    saved.forEach((id) => {
      const t = TRAINING.find((x) => x.id === id);
      if (t) out.push({ kind: "training", id, sort: t.aiMatch });
      const i = INTERNSHIPS.find((x) => x.id === id);
      if (i) out.push({ kind: "internship", id, sort: i.aiMatch });
      const j = JOBS.find((x) => x.id === id);
      if (j) out.push({ kind: "job", id, sort: j.aiMatch });
    });
    return out.sort((a, b) => b.sort - a.sort);
  }, [saved]);

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("saved.eyebrow")}
        title={t("saved.title")}
        sub={t("saved.sub")}
        icon="Heart"
      >
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-navy-200">
          <Icon name="Heart" size={15} className="text-saffron-400" /> {fmt(t("saved.count"), { count: items.length })}
        </div>
      </PageHeader>

      {items.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((it, idx) => {
            const training = TRAINING.find((x) => x.id === it.id);
            const internship = INTERNSHIPS.find((x) => x.id === it.id);
            const job = JOBS.find((x) => x.id === it.id);
            return (
              <div key={`${it.kind}-${it.id}`} className="relative">
                {training && <TrainingCard t={training} user={user} index={idx} />}
                {internship && <InternshipCard i={internship} user={user} index={idx} />}
                {job && <JobCard j={job} user={user} index={idx} />}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass rounded-2xl p-12 text-center">
          <Icon name="Heart" size={32} className="mx-auto text-navy-400" />
          <p className="mt-4 font-semibold text-white">{t("saved.emptyTitle")}</p>
          <p className="mt-1 text-sm text-navy-300">{t("saved.emptySub")}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href="/training" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-electric-500 to-sky-glow px-4 py-2.5 text-sm font-medium text-white transition-all hover:brightness-110">
              <Icon name="GraduationCap" size={16} /> {t("saved.browseTraining")}
            </a>
            <a href="/internships" className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-medium text-navy-200 transition-colors hover:bg-white/5">
              <Icon name="Briefcase" size={16} /> {t("saved.browseInternships")}
            </a>
          </div>
        </div>
      )}
    </PageShell>
  );
}
