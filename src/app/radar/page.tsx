"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { PageShell } from "@/components/layout/background";
import { PageHeader } from "@/components/ui/page-header";
import { Badge, ButtonLink } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { CITIES, REGIONS } from "@/lib/data/cities";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";

function fmt(str: string, vars: Record<string, string | number>) {
  return str.replace(/\{(\w+)\}/g, (m, k) => String(vars[k] ?? m));
}

const REGION_COLOR: Record<string, string> = {
  North: "#4f8dff",
  South: "#2dd4a7",
  East: "#ff9933",
  West: "#a06a3b",
  Central: "#8b5cf6",
};

const INDIA_BOUNDS = { minLat: 7.5, maxLat: 36.5, minLng: 68, maxLng: 97.6 };

function norm(lat: number, lng: number) {
  const { minLat, maxLat, minLng, maxLng } = INDIA_BOUNDS;
  return {
    x: ((lng - minLng) / (maxLng - minLng)) * 100,
    y: ((maxLat - lat) / (maxLat - minLat)) * 100,
  };
}

const INDIA_OUTLINE: [number, number][] = [
  [23.5, 68.7], [24.0, 69.0], [24.8, 69.5], [26.0, 68.8], [28.5, 70.3],
  [30.0, 72.0], [31.0, 74.5], [32.6, 74.9], [34.6, 76.3], [34.5, 78.1],
  [33.5, 79.0], [31.5, 78.4], [30.5, 80.3], [29.4, 80.0], [27.2, 88.1],
  [27.5, 89.0], [26.9, 92.0], [27.5, 95.5], [28.0, 96.8], [28.6, 97.4],
  [27.2, 96.0], [25.0, 95.0], [23.7, 94.2], [23.0, 92.9], [23.8, 91.3],
  [24.0, 90.0], [22.6, 89.0], [22.0, 89.0], [21.8, 88.3], [21.5, 87.8],
  [20.7, 87.0], [19.3, 85.0], [17.7, 83.4], [15.9, 80.9], [14.0, 80.2],
  [12.3, 80.1], [11.0, 79.9], [8.4, 78.0], [8.1, 77.6], [8.9, 76.6],
  [11.9, 75.3], [14.8, 74.3], [15.5, 73.9], [18.9, 72.8], [20.8, 72.8],
  [21.4, 72.5], [22.3, 72.2], [22.8, 70.6], [23.2, 68.6],
];

const OUTLINE_POINTS = INDIA_OUTLINE.map(([lat, lng]) => {
  const p = norm(lat, lng);
  return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
}).join(" ");

export default function RadarPage() {
  const { t } = useLang();
  const [selected, setSelected] = useState<string | null>("Delhi");
  const city = CITIES.find((c) => c.name === selected) ?? null;

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("radar.eyebrow")}
        title={t("radar.title")}
        sub={t("radar.sub")}
        icon="Radar"
      />

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="glass relative overflow-hidden rounded-3xl p-4 sm:p-8">
          <div className="grid-bg absolute inset-0 opacity-40" aria-hidden="true" />
          <div className="ring-conic absolute inset-x-10 top-1/2 h-px opacity-30" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <span className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-electric-400/15" />
            <span className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-electric-400/10" />
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-[560px]">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
              <defs>
                <radialGradient id="radarFill" cx="50%" cy="45%" r="75%">
                  <stop offset="0%" stopColor="#3d7bff" stopOpacity="0.18" />
                  <stop offset="70%" stopColor="#3d7bff" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#3d7bff" stopOpacity="0.03" />
                </radialGradient>
                <filter id="radarGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="0.6" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              <polygon
                points={OUTLINE_POINTS}
                fill="url(#radarFill)"
                stroke="#4f8dff"
                strokeOpacity="0.55"
                strokeWidth="0.45"
                strokeLinejoin="round"
                filter="url(#radarGlow)"
              />
            </svg>
            {CITIES.map((c) => {
              const p = norm(c.lat, c.lng);
              const r = 8 + Math.round((c.opportunities / 1875) * 22);
              const active = selected === c.name;
              return (
                <button
                  key={c.name}
                  onClick={() => setSelected(c.name)}
                  aria-label={`${c.name} — ${c.opportunities} opportunities`}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                >
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="relative grid place-items-center"
                    style={{ width: r * 2, height: r * 2 }}
                  >
                    <span
                      className="absolute inset-0 rounded-full opacity-40"
                      style={{ background: REGION_COLOR[c.region], boxShadow: `0 0 ${r * 2}px ${REGION_COLOR[c.region]}66` }}
                    />
                    <span
                      className={cn("relative grid place-items-center rounded-full border-2 text-[10px] font-bold text-white", active && "z-10")}
                      style={{
                        width: r * 2 - 8,
                        height: r * 2 - 8,
                        background: REGION_COLOR[c.region],
                        borderColor: active ? "#fff" : "rgba(255,255,255,0.35)",
                      }}
                    >
                      <span className={r > 15 ? "" : "hidden"}>{c.opportunities}</span>
                    </span>
                    <span className={cn("absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap text-[11px] font-semibold", active ? "text-white" : "text-navy-300")}>
                      {c.name}
                    </span>
                  </motion.span>
                </button>
              );
            })}
          </div>

          <div className="relative mt-2 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-navy-400">{t("radar.regions")}</span>
            {REGIONS.map((r) => (
              <span key={r} className="flex items-center gap-1.5 text-[11px] text-navy-200">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: REGION_COLOR[r] }} /> {r}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {city ? (
            <motion.div key={city.name} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-navy-400">{t("radar.selectedCity")}</p>
                  <h2 className="mt-1 text-2xl font-bold text-white">{city.name}</h2>
                  <p className="text-sm text-navy-300">{city.state} · {fmt(t("radar.region"), { region: city.region })}</p>
                </div>
                <span className="text-3xl font-bold text-gradient">{city.opportunities.toLocaleString("en-IN")}</span>
              </div>
              <p className="mt-1 text-right text-[11px] text-navy-400">{t("hero.stat3")}</p>

              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-navy-400">{t("radar.topSectors")}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {city.roles.map((r) => (
                    <Badge key={r} tone="blue">{r}</Badge>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2 text-center">
                {[
                  { n: Math.round(city.opportunities * 0.42), l: t("radar.jobs") },
                  { n: Math.round(city.opportunities * 0.34), l: t("radar.internships") },
                  { n: Math.round(city.opportunities * 0.24), l: t("radar.training") },
                ].map((s) => (
                  <div key={s.l} className="rounded-xl bg-white/4 p-3">
                    <p className="text-lg font-bold text-white">{s.n.toLocaleString("en-IN")}</p>
                    <p className="text-[10px] uppercase tracking-wider text-navy-400">{s.l}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-2">
                <ButtonLink href={`/jobs?location=${encodeURIComponent(city.name)}`} size="sm">
                  <Icon name="Building2" size={14} /> {fmt(t("radar.browseJobs"), { city: city.name })}
                </ButtonLink>
                <div className="grid grid-cols-2 gap-2">
                  <ButtonLink href={`/internships?location=${encodeURIComponent(city.name)}`} variant="secondary" size="sm">
                    <Icon name="Briefcase" size={14} /> {t("radar.internships")}
                  </ButtonLink>
                  <ButtonLink href={`/training?location=${encodeURIComponent(city.name)}`} variant="secondary" size="sm">
                    <Icon name="GraduationCap" size={14} /> {t("radar.training")}
                  </ButtonLink>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="glass rounded-2xl p-6 text-center">
              <Icon name="MapPinOff" size={28} className="mx-auto text-navy-400" />
              <p className="mt-3 text-sm text-navy-300">{t("radar.selectCity")}</p>
            </div>
          )}

          <div className="glass rounded-2xl p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-white"><Icon name="TrendingUp" size={16} className="text-mint-400" /> {t("radar.hottest")}</p>
            <div className="mt-3 space-y-2">
              {[...CITIES].sort((a, b) => b.opportunities - a.opportunities).slice(0, 5).map((c, i) => (
                <button
                  key={c.name}
                  onClick={() => setSelected(c.name)}
                  className="flex w-full items-center justify-between rounded-lg bg-white/4 px-3 py-2 text-left transition-colors hover:bg-white/8 cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-sm text-navy-200">
                    <span className="text-[10px] font-bold text-navy-400">#{i + 1}</span> {c.name}
                  </span>
                  <span className="text-xs font-semibold text-white">{c.opportunities.toLocaleString("en-IN")}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
