"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageShell } from "@/components/layout/background";
import { PageHeader } from "@/components/ui/page-header";
import { FilterBar } from "@/components/opportunities/filters";
import { InternshipCard } from "@/components/opportunities/cards";
import { Select, Skeleton } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { INTERNSHIPS } from "@/lib/data/opportunities";
import { useAuth, GUEST_USER } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function InternshipsPage() {
  const params = useSearchParams();
  const { user: authUser } = useAuth();
  const user = authUser ?? GUEST_USER;
  const { t } = useLang();

  const [hydrated, setHydrated] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [location, setLocation] = useState("All");
  const [level, setLevel] = useState("All");
  const [remote, setRemote] = useState(false);
  const [paid, setPaid] = useState(false);
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

  const categories = useMemo(() => Array.from(new Set(INTERNSHIPS.map((i) => i.category))).sort(), []);
  const locations = useMemo(() => Array.from(new Set(INTERNSHIPS.map((i) => i.location))).sort(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return INTERNSHIPS.filter((i) => {
      if (category !== "All" && i.category !== category) return false;
      if (location !== "All" && i.location !== location) return false;
      if (level !== "All" && i.level !== level) return false;
      if (remote && !i.remote) return false;
      if (paid && !i.paid) return false;
      if (q && !`${i.title} ${i.company} ${i.description} ${i.skills.join(" ")}`.toLowerCase().includes(q)) return false;
      return true;
    }).sort((a, b) => b.aiMatch - a.aiMatch);
  }, [query, category, location, level, remote, paid]);

  const reset = () => {
    setQuery("");
    setCategory("All");
    setLocation("All");
    setLevel("All");
    setRemote(false);
    setPaid(false);
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("int.eyebrow")}
        title={t("int.title")}
        sub={t("int.sub")}
        icon="Briefcase"
      >
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-navy-200">
          <Icon name="IndianRupee" size={15} className="text-mint-400" /> {t("int.avgStipend")}
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
        queryPlaceholder="Search internships, company or skill…"
        reset={reset}
      >
        <Select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full sm:w-36" aria-label="Filter by level">
          <option value="All">All levels</option>
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </Select>
        <div className="flex items-center gap-1.5">
          <ToggleButton active={remote} onClick={() => setRemote((v) => !v)} label="Remote" icon="Globe" />
          <ToggleButton active={paid} onClick={() => setPaid((v) => !v)} label="Paid" icon="Wallet" />
        </div>
      </FilterBar>

      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {!hydrated ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72" />)
        ) : filtered.length ? (
          filtered.map((i, idx) => (
            <div key={i.id} data-opp-id={i.id} className={cn("rounded-2xl transition-all duration-500", pulse === i.id && "ring-2 ring-saffron-400/70 shadow-[0_0_40px_-8px_rgba(255,153,51,0.5)]")}>
              <InternshipCard i={i} user={user} index={idx} />
            </div>
          ))
        ) : (
          <div className="col-span-full glass rounded-2xl p-12 text-center">
            <Icon name="SearchX" size={32} className="mx-auto text-navy-400" />
            <p className="mt-4 font-semibold text-white">No internships match those filters</p>
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
