"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { TrainingProgram, Internship, Job, UserProfile, MatchBreakdown } from "@/types";
import { MatchRing } from "@/components/ui/visuals";
import { Badge, Button } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { computeMatchBreakdown } from "@/lib/ai/engine";
import { useStore } from "@/lib/store";
import { useLang, type TranslationKey } from "@/lib/i18n";
import { oppHi } from "@/lib/data/oppLocalization";
import { cn } from "@/lib/utils";
import { MatchModal } from "@/components/opportunities/match-modal";

function fmt(str: string, vars: Record<string, string | number>) {
  return str.replace(/\{(\w+)\}/g, (m, k) => String(vars[k] ?? m));
}

const LEVEL_KEYS: Record<string, TranslationKey> = {
  Beginner: "sd.level.beginner",
  Intermediate: "sd.level.intermediate",
  Advanced: "sd.level.advanced",
  Professional: "sd.level.professional",
};

const TYPE_KEYS: Record<string, TranslationKey> = {
  "Full-time": "card.typeFull",
  "Part-time": "card.typePart",
  Contract: "card.typeContract",
};

export function OpportunityActions({
  id,
  title,
  kind,
  company,
  match,
  onWhy,
  onApply,
  onStart,
}: {
  id: string;
  title: string;
  kind: "job" | "internship" | "training";
  company: string;
  match: number;
  onWhy: () => void;
  onApply?: () => void;
  onStart?: () => void;
}) {
  const { toggleSaved, isSaved, toast } = useStore();
  const { t } = useLang();
  const saved = isSaved(id);
  return (
    <div className="mt-5 flex flex-wrap items-center gap-2">
      {onStart && (
        <Button size="sm" onClick={onStart}>
          <Icon name="Play" size={15} /> {t("card.startLearning")}
        </Button>
      )}
      <Button size="sm" onClick={onWhy}>
        <Icon name="Brain" size={15} /> {t("card.whyMatch")}
      </Button>
      {onApply && (
        <Button size="sm" variant="warm" onClick={onApply}>
          <Icon name="Rocket" size={15} /> {t("card.apply")}
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        aria-label={saved ? t("card.saved") : t("card.save")}
        onClick={() => toggleSaved(id)}
        className={saved ? "text-saffron-400" : ""}
      >
        <Icon name="Heart" size={15} className={saved ? "fill-saffron-400" : ""} /> {saved ? t("card.saved") : t("card.save")}
      </Button>
    </div>
  );
}

function LevelBadge({ level }: { level: string }) {
  const { t } = useLang();
  const tone = level === "Beginner" ? "green" : level === "Intermediate" ? "blue" : "warm";
  return <Badge tone={tone}>{LEVEL_KEYS[level] ? t(LEVEL_KEYS[level]) : level}</Badge>;
}

export function TrainingCard({ t: tr, user, index, onStart }: { t: TrainingProgram; user: UserProfile; index: number; onStart?: () => void }) {
  const { applyTo, isApplied } = useStore();
  const { t, isHindi } = useLang();
  const [showWhy, setShowWhy] = useState(false);
  const [breakdown, setBreakdown] = useState<MatchBreakdown | null>(null);
  const [coursePct, setCoursePct] = useState<number | null>(null);
  const applied = isApplied(tr.id);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`sih_course_${tr.id}`);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const ids: string[] = Array.isArray(parsed) ? parsed : parsed.done ?? [];
      const total = tr.skills.slice(0, 5).length * 2;
      const doneCount = ids.filter((id) => id.startsWith(`${tr.id}-`)).length;
      setCoursePct(total ? Math.min(100, Math.round((doneCount / total) * 100)) : 0);
    } catch {
      // ignore
    }
  }, [tr.id]);

  const title = isHindi ? oppHi(tr.id, "title") ?? tr.title : tr.title;
  const provider = isHindi ? oppHi(tr.id, "provider") ?? tr.provider : tr.provider;
  const description = isHindi ? oppHi(tr.id, "description") ?? tr.description : tr.description;
  const category = t(`cat.${tr.category}` as TranslationKey);
  const cost = tr.cost === "Free" ? t("card.free") : tr.cost === "Stipend Paid" ? t("card.stipend") : t("card.paid");

  const openWhy = () => {
    setBreakdown(computeMatchBreakdown({ skills: tr.skills, location: tr.location, category: tr.category }, user));
    setShowWhy(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.05 }}
      className="glass group flex h-full flex-col rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-electric-400/40"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="blue">{category}</Badge>
            <LevelBadge level={tr.level} />
            <Badge tone={tr.cost === "Free" ? "green" : tr.cost === "Paid" ? "warm" : "blue"}>{cost}</Badge>
          </div>
          <h3 className="mt-3 text-lg font-bold text-white">{title}</h3>
          <p className="mt-0.5 text-sm text-navy-300">{provider}</p>
        </div>
        <MatchRing value={tr.aiMatch} size={58} stroke={5} label={t("card.aiMatch")} />
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-navy-300">
        <span className="inline-flex items-center gap-1.5"><Icon name="MapPin" size={13} className="text-electric-300" /> {tr.location}</span>
        <span className="inline-flex items-center gap-1.5"><Icon name="Clock" size={13} className="text-electric-300" /> {tr.duration}</span>
        <span className="inline-flex items-center gap-1.5"><Icon name="Star" size={13} className="text-saffron-400" /> {tr.rating}</span>
        <span className="inline-flex items-center gap-1.5"><Icon name="Users" size={13} className="text-electric-300" /> {fmt(t("card.seats"), { count: tr.seats })}</span>
      </div>

      <p className="mt-4 flex-1 text-sm leading-relaxed text-navy-200">{description}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {tr.skills.slice(0, 4).map((s) => (
          <span key={s} className="rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] text-navy-300">{s}</span>
        ))}
      </div>

      {coursePct !== null && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px]">
            <span className="inline-flex items-center gap-1.5 text-navy-400">
              <Icon name={coursePct === 100 ? "CheckCheck" : "GraduationCap"} size={12} className={coursePct === 100 ? "text-mint-400" : "text-electric-300"} />
              {coursePct === 100 ? t("card.completed") : t("card.courseProgress")}
            </span>
            <span className={cn("font-semibold", coursePct === 100 ? "text-mint-400" : "text-electric-300")}>{coursePct}%</span>
          </div>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/8">
            <div
              className={cn("h-full rounded-full transition-all duration-500", coursePct === 100 ? "bg-mint-400" : "bg-gradient-to-r from-electric-500 to-sky-glow")}
              style={{ width: `${coursePct}%` }}
            />
          </div>
        </div>
      )}

      <OpportunityActions
        id={tr.id}
        title={title}
        kind="training"
        company={provider}
        match={tr.aiMatch}
        onWhy={openWhy}
        onStart={onStart}
        onApply={() => {
          if (applied) {
            return;
          }
          applyTo({ opportunityId: tr.id, kind: "training", title, company: provider, match: tr.aiMatch });
        }}
      />

      <MatchModalView open={showWhy} onClose={() => setShowWhy(false)} breakdown={breakdown} user={user} title={title} subtitle={`${provider} · ${tr.location}`} />
    </motion.div>
  );
}

export function InternshipCard({ i, user, index }: { i: Internship; user: UserProfile; index: number }) {
  const { applyTo, isApplied } = useStore();
  const { t, isHindi } = useLang();
  const [showWhy, setShowWhy] = useState(false);
  const [breakdown, setBreakdown] = useState<MatchBreakdown | null>(null);
  const applied = isApplied(i.id);

  const title = isHindi ? oppHi(i.id, "title") ?? i.title : i.title;
  const company = isHindi ? oppHi(i.id, "company") ?? i.company : i.company;
  const description = isHindi ? oppHi(i.id, "description") ?? i.description : i.description;
  const category = t(`cat.${i.category}` as TranslationKey);

  const openWhy = () => {
    setBreakdown(computeMatchBreakdown({ skills: i.skills, location: i.location, category: i.category }, user));
    setShowWhy(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.05 }}
      className="glass group flex h-full flex-col rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-electric-400/40"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="blue">{category}</Badge>
            {i.paid ? <Badge tone="green">{t("card.paid")} · {i.stipend}</Badge> : <Badge tone="neutral">{t("card.certified")}</Badge>}
            {i.remote ? <Badge tone="warm">{t("card.remote")}</Badge> : <Badge tone="neutral">{t("card.onsite")}</Badge>}
          </div>
          <h3 className="mt-3 text-lg font-bold text-white">{title}</h3>
          <p className="mt-0.5 text-sm text-navy-300">{company}</p>
        </div>
        <MatchRing value={i.aiMatch} size={58} stroke={5} label={t("card.aiMatch")} />
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-navy-300">
        <span className="inline-flex items-center gap-1.5"><Icon name="MapPin" size={13} className="text-electric-300" /> {i.location}</span>
        <span className="inline-flex items-center gap-1.5"><Icon name="Clock" size={13} className="text-electric-300" /> {i.duration}</span>
        <span className="inline-flex items-center gap-1.5"><Icon name="Users" size={13} className="text-electric-300" /> {fmt(t("card.applicants"), { count: i.applicants })}</span>
      </div>

      <p className="mt-4 flex-1 text-sm leading-relaxed text-navy-200">{description}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {i.skills.slice(0, 4).map((s) => (
          <span key={s} className="rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] text-navy-300">{s}</span>
        ))}
      </div>

      <OpportunityActions
        id={i.id}
        title={title}
        kind="internship"
        company={company}
        match={i.aiMatch}
        onWhy={openWhy}
        onApply={() => {
          if (applied) return;
          applyTo({ opportunityId: i.id, kind: "internship", title, company, match: i.aiMatch });
        }}
      />

      <MatchModalView open={showWhy} onClose={() => setShowWhy(false)} breakdown={breakdown} user={user} title={title} subtitle={`${company} · ${i.location}`} />
    </motion.div>
  );
}

export function JobCard({ j, user, index }: { j: Job; user: UserProfile; index: number }) {
  const { applyTo, isApplied } = useStore();
  const { t, isHindi } = useLang();
  const [showWhy, setShowWhy] = useState(false);
  const [breakdown, setBreakdown] = useState<MatchBreakdown | null>(null);
  const applied = isApplied(j.id);

  const title = isHindi ? oppHi(j.id, "title") ?? j.title : j.title;
  const company = isHindi ? oppHi(j.id, "company") ?? j.company : j.company;
  const description = isHindi ? oppHi(j.id, "description") ?? j.description : j.description;
  const category = t(`cat.${j.category}` as TranslationKey);
  const type = TYPE_KEYS[j.type] ? t(TYPE_KEYS[j.type]) : j.type;

  const openWhy = () => {
    setBreakdown(computeMatchBreakdown({ skills: j.skills, location: j.location, category: j.category }, user));
    setShowWhy(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.05 }}
      className="glass group flex h-full flex-col rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-electric-400/40"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="blue">{category}</Badge>
            <Badge tone="neutral">{type}</Badge>
            {j.remote && <Badge tone="warm">{t("card.remote")}</Badge>}
          </div>
          <h3 className="mt-3 text-lg font-bold text-white">{title}</h3>
          <p className="mt-0.5 text-sm text-navy-300">{company} · {j.experience}</p>
        </div>
        <MatchRing value={j.aiMatch} size={58} stroke={5} label={t("card.aiMatch")} />
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-navy-300">
        <span className="inline-flex items-center gap-1.5"><Icon name="MapPin" size={13} className="text-electric-300" /> {j.location}</span>
        <span className="inline-flex items-center gap-1.5"><Icon name="IndianRupee" size={13} className="text-mint-400" /> {j.salary}</span>
        <span className="inline-flex items-center gap-1.5"><Icon name="Clock" size={13} className="text-electric-300" /> {fmt(t("card.dAgo"), { count: j.postedDays })}</span>
      </div>

      <p className="mt-4 flex-1 text-sm leading-relaxed text-navy-200">{description}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {j.skills.slice(0, 4).map((s) => (
          <span key={s} className="rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] text-navy-300">{s}</span>
        ))}
      </div>

      <OpportunityActions
        id={j.id}
        title={title}
        kind="job"
        company={company}
        match={j.aiMatch}
        onWhy={openWhy}
        onApply={() => {
          if (applied) return;
          applyTo({ opportunityId: j.id, kind: "job", title, company, match: j.aiMatch });
        }}
      />

      <MatchModalView open={showWhy} onClose={() => setShowWhy(false)} breakdown={breakdown} user={user} title={title} subtitle={`${company} · ${j.location}`} />
    </motion.div>
  );
}

function MatchModalView({
  open,
  onClose,
  breakdown,
  user,
  title,
  subtitle,
}: {
  open: boolean;
  onClose: () => void;
  breakdown: MatchBreakdown | null;
  user: UserProfile;
  title: string;
  subtitle: string;
}) {
  return <MatchModal open={open} onClose={onClose} breakdown={breakdown} user={user} title={title} subtitle={subtitle} />;
}
