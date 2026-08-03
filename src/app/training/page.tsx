"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageShell } from "@/components/layout/background";
import { PageHeader } from "@/components/ui/page-header";
import { FilterBar } from "@/components/opportunities/filters";
import { TrainingCard } from "@/components/opportunities/cards";
import { TrainingCourseModal } from "@/components/opportunities/course";
import { Select, Skeleton } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { TRAINING } from "@/lib/data/opportunities";
import { useAuth, GUEST_USER } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { TrainingProgram } from "@/types";

export default function TrainingPage() {
  const params = useSearchParams();
  const { user: authUser } = useAuth();
  const user = authUser ?? GUEST_USER;
  const { t } = useLang();
  const [openCourse, setOpenCourse] = useState<TrainingProgram | null>(null);

  const [hydrated, setHydrated] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [location, setLocation] = useState("All");
  const [level, setLevel] = useState("All");
  const [cost, setCost] = useState("All");
  const [pulse, setPulse] = useState("");

  useEffect(() => setHydrated(true), []);
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

  const categories = useMemo(() => Array.from(new Set(TRAINING.map((t) => t.category))).sort(), []);
  const locations = useMemo(() => Array.from(new Set(TRAINING.map((t) => t.location))).sort(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TRAINING.filter((t) => {
      if (category !== "All" && t.category !== category) return false;
      if (location !== "All" && t.location !== location) return false;
      if (level !== "All" && t.level !== level) return false;
      if (cost !== "All" && t.cost !== cost) return false;
      if (q && !`${t.title} ${t.provider} ${t.description} ${t.skills.join(" ")}`.toLowerCase().includes(q)) return false;
      return true;
    }).sort((a, b) => b.aiMatch - a.aiMatch);
  }, [query, category, location, level, cost]);

  const reset = () => {
    setQuery("");
    setCategory("All");
    setLocation("All");
    setLevel("All");
    setCost("All");
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("train.eyebrow")}
        title={t("train.title")}
        sub={t("train.sub")}
        icon="GraduationCap"
      >
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-navy-200">
          <Icon name="BookOpen" size={15} className="text-electric-300" /> {t("train.count").replace("{count}", String(TRAINING.length))}
        </div>
      </PageHeader>

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
        queryPlaceholder="Search training, provider or skill…"
        reset={reset}
      >
        <Select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full sm:w-36" aria-label="Filter by level">
          <option value="All">All levels</option>
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </Select>
        <Select value={cost} onChange={(e) => setCost(e.target.value)} className="w-full sm:w-36" aria-label="Filter by cost">
          <option value="All">All costs</option>
          <option>Free</option>
          <option>Paid</option>
          <option>Stipend Paid</option>
        </Select>
      </FilterBar>

      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {!hydrated ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72" />)
        ) : filtered.length ? (
          filtered.map((t, i) => (
            <div key={t.id} data-opp-id={t.id} className={cn("rounded-2xl transition-all duration-500", pulse === t.id && "ring-2 ring-saffron-400/70 shadow-[0_0_40px_-8px_rgba(255,153,51,0.5)]")}>
              <TrainingCard t={t} user={user} index={i} onStart={() => setOpenCourse(t)} />
            </div>
          ))
        ) : (
          <div className="col-span-full glass rounded-2xl p-12 text-center">
            <Icon name="SearchX" size={32} className="mx-auto text-navy-400" />
            <p className="mt-4 font-semibold text-white">No training matches those filters</p>
            <p className="mt-1 text-sm text-navy-300">Try clearing a filter or searching a different skill.</p>
          </div>
        )}
      </div>

      <TrainingCourseModal training={openCourse} onClose={() => setOpenCourse(null)} />
    </PageShell>
  );
}
