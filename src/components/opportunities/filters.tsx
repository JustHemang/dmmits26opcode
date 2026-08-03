"use client";

import { Input, Select } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export function FilterBar({
  count,
  query,
  onQuery,
  category,
  onCategory,
  categories,
  location,
  onLocation,
  locations,
  queryPlaceholder,
  children,
  reset,
}: {
  count: number;
  query: string;
  onQuery: (v: string) => void;
  category: string;
  onCategory: (v: string) => void;
  categories: string[];
  location: string;
  onLocation: (v: string) => void;
  locations: string[];
  queryPlaceholder?: string;
  children?: React.ReactNode;
  reset?: () => void;
}) {
  const hasFilters = query || category !== "All" || location !== "All";
  return (
    <div className="glass rounded-2xl p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
        <div className="relative">
          <Icon name="Search" size={16} className="pointer-events-none absolute left-3.5 top-3.5 text-navy-400" />
          <Input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder={queryPlaceholder ?? "Search by title, provider or skill…"}
            className="pl-10"
            aria-label="Search"
          />
        </div>
        <Select value={category} onChange={(e) => onCategory(e.target.value)} aria-label="Filter by category">
          <option value="All">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>
        <Select value={location} onChange={(e) => onLocation(e.target.value)} aria-label="Filter by city">
          <option value="All">All cities</option>
          {locations.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </Select>
        <div className="flex items-center gap-2">
          {children}
          {reset && (
            <button
              onClick={reset}
              disabled={!hasFilters}
              aria-label="Clear filters"
              className={cn(
                "grid h-11 w-11 place-items-center rounded-xl border transition-colors cursor-pointer",
                hasFilters
                  ? "border-electric-400/50 text-electric-300 hover:bg-electric-500/10"
                  : "border-white/10 text-navy-500 opacity-50"
              )}
            >
              <Icon name="X" size={16} />
            </button>
          )}
        </div>
      </div>
      <p className="mt-3 text-xs text-navy-400">
        {count} result{count === 1 ? "" : "s"} · sorted by AI match for your profile
      </p>
    </div>
  );
}
