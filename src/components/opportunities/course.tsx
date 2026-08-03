"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { TrainingProgram } from "@/types";
import { Modal } from "@/components/ui/modal";
import { Badge, Button } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { useLang, type TranslationKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Lesson = { id: string; title: string; tag: "Watch" | "Build"; type: "video" | "project"; url: string };
type Module = { title: string; lessons: Lesson[] };

const TOPIC_VIDEOS: Record<string, string> = {
  "Figma": "https://youtu.be/mT_Jjn8RJdo",
  "UI Design": "https://youtu.be/mT_Jjn8RJdo",
  "UX Research": "https://youtu.be/mT_Jjn8RJdo",
  "Wireframing": "https://www.youtube.com/playlist?list=PLqQH_1enUVVTsuli_zuUz8hj__ouAYgt6",
  "Prototyping": "https://www.youtube.com/playlist?list=PLqQH_1enUVVTsuli_zuUz8hj__ouAYgt6",
  "HTML": "https://youtu.be/LzMnsfqjzkA",
  "CSS": "https://youtu.be/LzMnsfqjzkA",
  "JavaScript": "https://youtu.be/LzMnsfqjzkA",
  "React": "https://youtu.be/LzMnsfqjzkA",
  "Node.js": "https://youtu.be/LzMnsfqjzkA",
  "Git": "https://www.youtube.com/playlist?list=PLNvOKbV26aTkQAybRk3vjxtVYg8RxIYS8",
  "Networking": "https://www.youtube.com/playlist?list=PLBlnK6fEyqRgMCUAG0XRw78UA8qnv6jEx",
  "Security Fundamentals": "https://www.youtube.com/playlist?list=PLBlnK6fEyqRgMCUAG0XRw78UA8qnv6jEx",
  "Linux": "https://www.youtube.com/playlist?list=PLSPQu-Cm6qEl_bCvGB0cYK6Ejrb0bT-R6",
  "Ethical Hacking": "https://www.youtube.com/playlist?list=PLSPQu-Cm6qEl_bCvGB0cYK6Ejrb0bT-R6",
  "Excel": "https://www.youtube.com/watch?v=pCJ15nGFgVg",
  "SQL": "https://www.youtube.com/watch?v=7mz73uXD9DA",
  "Power BI": "https://www.youtube.com/watch?v=FwjaHCVNBWA",
  "Data Visualization": "https://www.youtube.com/watch?v=FwjaHCVNBWA",
  "Python": "https://www.youtube.com/watch?v=wUSDVGivd-8",
  "Machine Learning": "https://www.youtube.com/watch?v=i_LwzRVP7bg",
  "Photoshop": "https://www.youtube.com/watch?v=e_dv7GBHka8",
  "Illustrator": "https://www.youtube.com/watch?v=e_dv7GBHka8",
  "Canva": "https://www.youtube.com/watch?v=2SGHeroguFA",
  "Branding": "https://www.youtube.com/watch?v=e_dv7GBHka8",
  "Solar Technology": "https://www.youtube.com/playlist?list=PLRBqpvcvyOcpAL4r3VHRo4TprqQDD0tWK",
};

const PRACTICE_RESOURCES: Record<string, string> = {
  "Figma": "https://www.figma.com/learn/design-basics",
  "UI Design": "https://www.figma.com/learn/design-basics",
  "UX Research": "https://www.figma.com/learn/design-basics",
  "Wireframing": "https://www.figma.com/learn/design-basics",
  "Prototyping": "https://www.figma.com/learn/design-basics",
  "HTML": "https://www.freecodecamp.org/learn",
  "CSS": "https://www.freecodecamp.org/learn",
  "JavaScript": "https://www.freecodecamp.org/learn",
  "React": "https://www.freecodecamp.org/learn",
  "Node.js": "https://www.freecodecamp.org/learn",
  "Git": "https://www.freecodecamp.org/learn",
  "Python": "https://www.freecodecamp.org/learn",
  "Machine Learning": "https://colab.research.google.com/",
  "Canva": "https://www.canva.com/designschool/",
  "Photoshop": "https://helpx.adobe.com/",
  "Illustrator": "https://helpx.adobe.com/",
  "Branding": "https://helpx.adobe.com/",
  "Typograph": "https://www.canva.com/designschool/",
};

function topicUrl(map: Record<string, string>, skill: string, suffix: string) {
  return map[skill] ?? `https://www.youtube.com/results?search_query=${encodeURIComponent(`${skill} ${suffix}`)}`;
}

function fmt(str: string, vars: Record<string, string | number>) {
  return str.replace(/\{(\w+)\}/g, (m, k) => String(vars[k] ?? m));
}

function buildModules(training: TrainingProgram, tr: (key: TranslationKey) => string): Module[] {
  return training.skills.slice(0, 5).map((skill, mi) => ({
    title: skill,
    lessons: [
      {
        id: `${training.id}-${mi}-w`,
        title: fmt(tr("course.watchLesson"), { skill }),
        tag: "Watch",
        type: "video",
        url: topicUrl(TOPIC_VIDEOS, skill, "full course"),
      },
      {
        id: `${training.id}-${mi}-p`,
        title: fmt(tr("course.buildLesson"), { skill }),
        tag: "Build",
        type: "project",
        url: topicUrl(PRACTICE_RESOURCES, skill, "practice project tutorial"),
      },
    ],
  }));
}

const TYPE_ICON: Record<Lesson["type"], string> = { video: "PlayCircle", project: "Hammer" };
const TYPE_TONE: Record<Lesson["type"], string> = { video: "text-electric-300 bg-electric-500/10", project: "text-saffron-300 bg-saffron-500/10" };

export function TrainingCourseModal({
  training,
  onClose,
}: {
  training: TrainingProgram | null;
  onClose: () => void;
}) {
  const { user, addXp, awardBadge } = useAuth();
  const { toast, pushNotification, addCompletedCourse } = useStore();
  const { t } = useLang();
  const [done, setDone] = useState<Set<string>>(new Set());
  const [opened, setOpened] = useState<Set<string>>(new Set());
  const [showCert, setShowCert] = useState(false);

  const modules = useMemo(() => (training ? buildModules(training, t) : []), [training, t]);
  const allLessons = useMemo(() => modules.flatMap((m) => m.lessons), [modules]);
  const total = allLessons.length;
  const completed = done.size;
  const pct = total ? Math.min(100, Math.round((completed / total) * 100)) : 0;

  useEffect(() => {
    if (!training) return;
    try {
      const raw = localStorage.getItem(`sih_course_${training.id}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        const valid = new Set(buildModules(training, t).flatMap((m) => m.lessons.map((l) => l.id)));
        let savedDone: string[] = [];
        let savedOpened: string[] = [];
        if (Array.isArray(parsed)) {
          savedDone = parsed;
          savedOpened = parsed;
        } else {
          savedDone = Array.isArray(parsed.done) ? parsed.done : [];
          savedOpened = [...(Array.isArray(parsed.opened) ? parsed.opened : []), ...savedDone];
        }
        const cleanDone = savedDone.filter((id) => valid.has(id));
        const cleanOpened = savedOpened.filter((id) => valid.has(id));
        setDone(new Set(cleanDone));
        setOpened(new Set(cleanOpened));
        if (cleanDone.length === valid.size && valid.size) setShowCert(true);
      }
    } catch {
      // ignore
    }
  }, [training, t]);

  if (!training) return null;

  const category = t(`cat.${training.category}` as TranslationKey);
  const cost = training.cost === "Free" ? t("card.free") : training.cost === "Stipend Paid" ? t("card.stipend") : t("card.paid");

  const persist = (nextDone: Set<string>, nextOpened: Set<string>) => {
    try {
      localStorage.setItem(`sih_course_${training.id}`, JSON.stringify({ opened: [...nextOpened], done: [...nextDone] }));
    } catch {
      // ignore
    }
  };

  const openLesson = (lesson: Lesson) => {
    window.open(lesson.url, "_blank", "noopener,noreferrer");
    if (opened.has(lesson.id)) return;
    const next = new Set(opened);
    next.add(lesson.id);
    setOpened(next);
    persist(done, next);
  };

  const completeLesson = (lesson: Lesson) => {
    if (!opened.has(lesson.id)) {
      toast(t("course.openFirst"), { message: t("course.openFirstMsg"), kind: "info" });
      return;
    }
    if (done.has(lesson.id)) {
      const next = new Set(done);
      next.delete(lesson.id);
      setDone(next);
      persist(next, opened);
      return;
    }
    const next = new Set(done);
    next.add(lesson.id);
    setDone(next);
    persist(next, opened);
    if (next.size === total) {
      addXp(200);
      awardBadge("course-complete");
      addCompletedCourse(training.id);
      toast(t("course.completedToast"), { message: t("course.completedMsg") });
      setShowCert(true);
      pushNotification({
        title: t("course.notifTitle").replace("{title}", training.title),
        body: t("course.notifBody").replace("{total}", String(total)),
        time: t("course.justNow"),
        kind: "milestone",
      });
    }
  };

  const allDone = completed === total && total > 0;

  return (
    <Modal open={!!training} onClose={onClose} title={t("course.player")} icon="GraduationCap" wide>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="blue">{category}</Badge>
            <Badge tone={training.cost === "Free" ? "green" : "warm"}>{cost}</Badge>
            <Badge tone="neutral">{training.duration}</Badge>
          </div>
          <h3 className="mt-2 text-xl font-bold text-white">{training.title}</h3>
          <p className="mt-0.5 text-sm text-navy-300">{training.provider}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{pct}%</p>
            <p className="text-[10px] uppercase tracking-wider text-navy-400">{t("course.complete")}</p>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-full border-2 border-electric-400/60 text-white">
            <Icon name="GraduationCap" size={20} />
          </div>
        </div>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full bg-gradient-to-r from-electric-500 to-sky-glow transition-all duration-500"
          style={{ width: `${pct}%`, boxShadow: "0 0 12px rgba(61,123,255,0.5)" }}
        />
      </div>
      <p className="mt-1.5 text-xs text-navy-400">
        {completed}/{total} {t("course.lessonsDone")}{user ? ` · ${user.name.split(" ")[0]}` : ""} · {t("course.tapLesson")}
      </p>

      <div className="mt-5 max-h-[46vh] space-y-3 overflow-y-auto pr-1 scrollbar-none">
        {modules.map((m, mi) => {
          const mDone = m.lessons.filter((l) => done.has(l.id)).length;
          return (
            <div key={m.title} className="rounded-xl border border-white/10 bg-white/4 p-4">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-sm font-semibold text-white">
                  <span className="grid h-6 w-6 place-items-center rounded-lg bg-electric-500/15 text-xs text-electric-300">{mi + 1}</span>
                  {m.title}
                </p>
                <span className="text-[11px] text-navy-400">{mDone}/{m.lessons.length}</span>
              </div>
              <div className="mt-2.5 space-y-1.5">
                {m.lessons.map((l) => {
                  const isDone = done.has(l.id);
                  const isOpened = opened.has(l.id);
                  return (
                    <div key={l.id} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 transition-colors", isDone ? "bg-mint-400/10" : "hover:bg-white/5")}>
                      <button
                        onClick={() => openLesson(l)}
                        title={t("course.openOnYouTube")}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left cursor-pointer"
                      >
                        <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-lg", TYPE_TONE[l.type], isDone ? "bg-mint-400/20 text-mint-400" : isOpened ? "bg-white/8 text-electric-300" : "")}>
                          <Icon name={isDone ? "Check" : isOpened ? "Eye" : TYPE_ICON[l.type]} size={15} />
                        </span>
                        <span className={cn("min-w-0 flex-1 text-sm", isDone ? "text-navy-300 line-through" : "text-navy-100")}>{l.title}</span>
                      </button>
                      <span className="hidden items-center gap-1 text-[11px] font-medium text-electric-300 sm:inline-flex">
                        <Icon name="ExternalLink" size={12} /> {l.tag === "Watch" ? t("course.tagWatch") : t("course.tagBuild")}
                      </span>
                      <button
                        onClick={() => completeLesson(l)}
                        disabled={!isOpened}
                        title={isOpened ? (isDone ? t("course.unmarkComplete") : t("course.markComplete")) : t("course.openFirstComplete")}
                        aria-label={isDone ? t("course.markIncomplete") : t("course.markLessonComplete")}
                        className={cn(
                          "grid h-7 w-7 shrink-0 place-items-center rounded-lg border transition-colors cursor-pointer",
                          isDone
                            ? "border-mint-400/50 bg-mint-400/20 text-mint-400"
                            : isOpened
                              ? "border-electric-400/40 text-electric-300 hover:bg-electric-500/10"
                              : "cursor-not-allowed border-white/10 text-navy-500 opacity-40"
                        )}
                      >
                        <Icon name={isDone ? "CheckCheck" : "Circle"} size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {allDone && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-xl border border-mint-400/30 bg-mint-400/10 p-4">
          <p className="flex items-center gap-2 font-bold text-mint-400">
            <Icon name="PartyPopper" size={18} /> {fmt(t("course.allDone"), { title: training.title })}
          </p>
          <p className="mt-1 text-sm text-navy-100">
            {t("course.congratsA")} <span className="font-semibold text-white">+200 XP</span> {t("course.congratsB")}{" "}
            <span className="font-semibold text-white">{t("course.badgeName")}</span> {t("course.congratsTail")}
          </p>
        </motion.div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-navy-400">{t("course.progressSaves")}</p>
        <Button size="sm" onClick={() => { setShowCert(false); onClose(); }}>
          <Icon name="X" size={14} /> {t("course.close")}
        </Button>
      </div>
    </Modal>
  );
}
