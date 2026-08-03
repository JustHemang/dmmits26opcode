"use client";

import { motion } from "framer-motion";
import type { MatchBreakdown, UserProfile } from "@/types";
import { Modal } from "@/components/ui/modal";
import { Bar } from "@/components/ui/visuals";
import { Button } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { useStore } from "@/lib/store";
import { useLang } from "@/lib/i18n";

export function MatchModal({
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
  user: UserProfile | null;
  title: string;
  subtitle?: string;
}) {
  const { toast } = useStore();
  const { t } = useLang();
  if (!breakdown) return null;

  const rows = [
    { label: t("match.skills"), value: breakdown.skillsMatch, icon: "Sparkles", color: "#4f8dff" },
    { label: t("match.interests"), value: breakdown.interestMatch, icon: "Heart", color: "#ff9933" },
    { label: t("match.location"), value: breakdown.locationMatch, icon: "MapPin", color: "#2dd4a7" },
    { label: t("match.experience"), value: breakdown.experienceMatch, icon: "Briefcase", color: "#7ba9ff" },
  ];

  const addSkills = () => {
    toast(t("match.addSkillsToast"), { message: t("match.addSkillsMsg") });
  };

  return (
    <Modal open={open} onClose={onClose} title={t("card.whyMatch")} icon="Brain" wide>
      <div className="grid gap-6 sm:grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center justify-center">
          <div className="ring-conic relative grid h-36 w-36 place-items-center rounded-full p-[6px]">
            <div className="grid h-full w-full place-items-center rounded-full bg-navy-900">
              <div className="text-center">
                <p className="text-4xl font-extrabold text-white">{breakdown.score}%</p>
                <p className="text-[11px] uppercase tracking-wider text-navy-300">{t("match.scoreLabel")}</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-base font-bold text-white">{title}</h4>
          {subtitle && <p className="mt-1 text-sm text-navy-300">{subtitle}</p>}
          <div className="mt-5 space-y-3.5">
            {rows.map((r) => (
              <Bar key={r.label} label={r.label} value={r.value} color={r.color} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-7 rounded-xl border border-white/10 bg-white/4 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-white">
          <Icon name="Lightbulb" size={16} className="text-saffron-400" /> {t("match.aiSuggestion")}
        </p>
        {breakdown.missingSkills.length > 0 ? (
          <>
            <p className="mt-2 text-sm text-navy-200">
              {t("match.missingA")} <span className="font-semibold text-white">{breakdown.missingSkills.join(", ")}</span>{" "}
              {t("match.missingB").replace("{skill}", breakdown.missingSkills[0])}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {breakdown.missingSkills.map((s) => (
                <span key={s} className="inline-flex items-center gap-1.5 rounded-full border border-rose-glow/30 bg-rose-glow/10 px-3 py-1 text-xs text-rose-300">
                  <Icon name="CirclePlus" size={13} /> {s}
                </span>
              ))}
            </div>
            <Button onClick={addSkills} size="sm" className="mt-4">
              <Icon name="Wand2" size={14} /> {t("match.addMissingSkills")}
            </Button>
          </>
        ) : (
          <p className="mt-2 text-sm text-navy-200">{t("match.noGaps")}</p>
        )}
      </div>

      <div className="mt-5 flex justify-end">
        <Button variant="ghost" onClick={onClose}>{t("match.close")}</Button>
      </div>
    </Modal>
  );
}
