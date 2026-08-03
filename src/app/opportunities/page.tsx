"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { PageShell } from "@/components/layout/background";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { MatchRing } from "@/components/ui/visuals";
import { TRAINING, INTERNSHIPS, JOBS } from "@/lib/data/opportunities";
import { useAuth, GUEST_USER } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "training", labelKey: "opp.training", icon: "GraduationCap", list: TRAINING, total: `${TRAINING.length} programs` },
  { id: "internships", labelKey: "opp.internships", icon: "Briefcase", list: INTERNSHIPS, total: `${INTERNSHIPS.length} internships` },
  { id: "jobs", labelKey: "opp.jobs", icon: "Building2", list: JOBS, total: `${JOBS.length} jobs` },
] as const;

export default function OpportunitiesPage() {
  const { user: authUser } = useAuth();
  const user = authUser ?? GUEST_USER;
  const { t } = useLang();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("training");
  const [category, setCategory] = useState("All");

  const active = TABS.find((t) => t.id === tab)!;
  const cats = Array.from(new Set(active.list.map((o) => o.category))).sort();
  const items = active.list
    .filter((o) => category === "All" || o.category === category)
    .sort((a, b) => b.aiMatch - a.aiMatch)
    .slice(0, 6);

  const browseHref = { training: "/training", internships: "/internships", jobs: "/jobs" }[tab];
  const matchLabel = { training: "AI match", internships: "AI match", jobs: "AI match" }[tab];

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("opp.eyebrow")}
        title={t("opp.title")}
        sub={t("opp.sub")}
        icon="Compass"
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((tb) => (
          <button
            key={tb.id}
            onClick={() => {
              setTab(tb.id);
              setCategory("All");
            }}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer",
              tab === tb.id ? "bg-gradient-to-r from-electric-500 to-sky-glow text-white shadow-glow-blue" : "glass text-navy-200 hover:text-white"
            )}
          >
            <Icon name={tb.icon} size={16} /> {t(tb.labelKey)}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-electric-400 focus:outline-none [&>option]:bg-navy-900 cursor-pointer"
            aria-label="Filter category"
          >
            <option value="All">{t("filter.allCategories")}</option>
            {cats.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <Link
            href={browseHref}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-electric-400/50 px-3 text-sm font-medium text-electric-300 transition-colors hover:bg-electric-500/10 hover:text-white"
          >
            {t("opp.viewAll")} <Icon name="ArrowRight" size={14} />
          </Link>
        </div>
      </div>

      <motion.div key={tab + category} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((o, i) => (
          <motion.div key={o.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="glass rounded-2xl p-5 transition-all hover:-translate-y-1 hover:border-electric-400/40">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge tone="blue">{o.category}</Badge>
                <p className="mt-2 font-bold text-white">{o.title}</p>
                <p className="text-xs text-navy-300">{"company" in o ? o.company : o.provider}</p>
              </div>
              <MatchRing value={o.aiMatch} size={52} stroke={5} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-navy-300">
              <span className="inline-flex items-center gap-1"><Icon name="MapPin" size={12} /> {o.location}</span>
              {"duration" in o && <span className="inline-flex items-center gap-1"><Icon name="Clock" size={12} /> {o.duration}</span>}
              {"stipend" in o && <span className="inline-flex items-center gap-1 text-mint-400"><Icon name="IndianRupee" size={12} /> {o.stipend}</span>}
              {"salary" in o && <span className="inline-flex items-center gap-1 text-mint-400"><Icon name="IndianRupee" size={12} /> {o.salary}</span>}
            </div>
            <Link href={`${browseHref}?highlight=${o.id}`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-electric-300 hover:text-white">
              {t("opp.viewDetails")} <Icon name="ArrowRight" size={14} />
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </PageShell>
  );
}
