"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageShell } from "@/components/layout/background";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { Application } from "@/types";

const FLOW: Application["status"][] = ["Applied", "Under Review", "Interview", "Selected"];

const STATUS_TONE: Record<Application["status"], "blue" | "warm" | "green" | "red" | "neutral"> = {
  Saved: "neutral",
  Applied: "blue",
  "Under Review": "warm",
  Interview: "warm",
  Selected: "green",
  Rejected: "red",
};

export default function ApplicationsPage() {
  const { applications, updateApplication, removeApplication } = useStore();
  const { user } = useAuth();
  const { t } = useLang();
  const [filter, setFilter] = useState<Application["status"] | "All">("All");

  const [realApps, setRealApps] = useState<any[]>([]);

  import("@/lib/db").then(({ listJobApplications }) => {
    if (!user) return;
    const allRealApps = listJobApplications();
    const myRealApps = allRealApps.filter((a) => a.seekerEmail.toLowerCase().trim() === user.email.toLowerCase().trim());
    setRealApps(myRealApps);
    const statusMap: Record<string, Application["status"]> = {
      "applied": "Applied",
      "shortlisted": "Under Review",
      "interview": "Interview",
      "interviewed": "Interview", // Still show as interview until employer hires
      "hired": "Selected",
      "rejected": "Rejected"
    };

    applications.forEach((loc) => {
      const real = myRealApps.find((ra) => ra.jobId === loc.opportunityId);
      if (real) {
        const mappedStatus = statusMap[real.status];
        if (mappedStatus && mappedStatus !== loc.status) {
          updateApplication(loc.id, mappedStatus);
        }
      }
    });
  });

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: applications.length };
    FLOW.forEach((s) => (c[s] = applications.filter((a) => a.status === s).length));
    c.Selected = applications.filter((a) => a.status === "Selected").length;
    c.Rejected = applications.filter((a) => a.status === "Rejected").length;
    return c;
  }, [applications]);

  const visible = filter === "All" ? applications : applications.filter((a) => a.status === filter);

  const stepIndex = (s: Application["status"]) => FLOW.indexOf(s);

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("apps.eyebrow")}
        title={t("apps.title")}
        sub={t("apps.sub")}
        icon="ClipboardCheck"
      >
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-navy-200">
          <Icon name="Rocket" size={15} className="text-mint-400" /> {t("apps.count").replace("{count}", String(applications.length))}
        </div>
      </PageHeader>

      <div className="mb-6 flex flex-wrap gap-2">
        {["All", ...FLOW, "Selected", "Rejected"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s as Application["status"] | "All")}
            aria-pressed={filter === s}
            className={cn(
              "flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
              filter === s ? "border-electric-400/60 bg-electric-500/15 text-white" : "border-white/10 text-navy-300 hover:bg-white/5"
            )}
          >
            {s} <span className="text-[11px] text-navy-400">({counts[s] ?? 0})</span>
          </button>
        ))}
      </div>

      {visible.length ? (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {visible.map((a) => (
              <motion.div
                key={a.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="glass flex flex-col gap-4 rounded-2xl p-5 md:flex-row md:items-center"
              >
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-electric-500/15 text-electric-300">
                  <Icon name={a.kind === "job" ? "Building2" : a.kind === "internship" ? "Briefcase" : "GraduationCap"} size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-white">{a.title}</p>
                    <Badge tone={STATUS_TONE[a.status]}>{a.status}</Badge>
                    {a.match > 0 && <Badge tone="green">{a.match}% match</Badge>}
                  </div>
                  <p className="mt-0.5 text-sm text-navy-300">{a.company} · Applied {new Date(a.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {a.status === "Rejected" || a.status === "Selected" ? (
                    <div className="flex items-center gap-2 text-sm text-navy-300">
                      {a.status === "Selected" ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-mint-400"><Icon name="Trophy" size={15} /> Selected!</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-semibold text-rose-300"><Icon name="XCircle" size={15} /> Rejected</span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      {FLOW.slice(0, stepIndex(a.status) + 1).map((s, i) => (
                        <button
                          key={s}
                          onClick={() => updateApplication(a.id, s)}
                          title={`Move to ${s}`}
                          aria-label={`Set status to ${s}`}
                          className={cn(
                            "grid h-8 w-8 place-items-center rounded-lg border transition-colors cursor-pointer",
                            i === stepIndex(a.status)
                              ? "border-mint-400/50 bg-mint-400/15 text-mint-400"
                              : "border-white/10 text-navy-400 hover:bg-white/5"
                          )}
                        >
                          <Icon name="Check" size={13} />
                        </button>
                      ))}
                    </div>
                  )}
                  {a.status === "Interview" && (() => {
                    const realApp = realApps.find(ra => ra.jobId === a.opportunityId);
                    if (!realApp) return null;
                    if (realApp.status === "interview") {
                      return (
                        <a 
                          href={`/interview?appId=${realApp.id}`}
                          className="ml-2 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-electric-500 to-sky-glow px-4 py-2 text-sm font-semibold text-white shadow-glow-blue transition-all hover:brightness-110"
                        >
                          <Icon name="Mic" size={15} /> Join AI Interview
                        </a>
                      );
                    } else if (realApp.status === "interviewed") {
                      return (
                        <span className="ml-2 inline-flex items-center gap-1.5 rounded-xl bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-400">
                          <Icon name="CheckCircle2" size={15} /> AI Interview Completed
                        </span>
                      );
                    }
                    return null;
                  })()}
                  <button
                    onClick={() => removeApplication(a.id)}
                    aria-label="Remove application"
                    className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-navy-400 transition-colors hover:border-rose-400/40 hover:text-rose-300 cursor-pointer"
                  >
                    <Icon name="Trash2" size={15} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="glass rounded-2xl p-12 text-center">
          <Icon name="ClipboardCheck" size={32} className="mx-auto text-navy-400" />
          <p className="mt-4 font-semibold text-white">No applications here yet</p>
          <p className="mt-1 text-sm text-navy-300">Apply to a matched internship or job and it will show up in your tracker.</p>
          <a href="/internships" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-electric-500 to-sky-glow px-4 py-2.5 text-sm font-medium text-white transition-all hover:brightness-110">
            <Icon name="Briefcase" size={16} /> Find opportunities
          </a>
        </div>
      )}
    </PageShell>
  );
}
