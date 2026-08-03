"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageShell } from "@/components/layout/background";
import { PageHeader } from "@/components/ui/page-header";
import { Badge, Button } from "@/components/ui/primitives";
import { Bar } from "@/components/ui/visuals";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import { CAREER_DEFS, careerById } from "@/lib/data/careers";
import { cn } from "@/lib/utils";

type SimState = { month: number; skill: number; salary: number; certified: boolean; events: string[] };

const SALARY_FROM = 1.2;

function parseSalary(s: string): number {
  const lpa = s.match(/([\d.]+)\s*LPA/i);
  if (lpa) return Math.max(1, Number(lpa[1]));
  const first = s.match(/[\d.,]+/);
  if (first) return Math.max(1, Math.round(Number(first[0].replace(/,/g, "")) / 100000));
  return 4;
}

export default function SimulatorPage() {
  const { user } = useAuth();
  const { t } = useLang();
  const careers = useMemo(() => CAREER_DEFS.map((c) => c.title).sort(), []);
  const initial = user?.targetCareer && careers.includes(user.targetCareer) ? user.targetCareer : "Web Developer";
  const [careerTitle, setCareerTitle] = useState(initial);
  const [sim, setSim] = useState<SimState | null>(null);
  const [running, setRunning] = useState(false);

  const career = careerById(careerTitle);
  const skillCount = career?.skills.length ?? 6;
  const baseSalary = career ? parseSalary(career.salary) : 4;

  const runSim = () => {
    setRunning(true);
    setSim(null);
    setTimeout(() => {
      const events: string[] = [];
      const c = career ?? { title: careerTitle, skills: [], certifications: [] };
      c.skills.slice(0, 4).forEach((s, i) => events.push(`Month ${3 + i * 2}: Mastered ${s.name} — ${s.required}/4`));
      if (c.certifications.length) events.push(`Month 9: Certified — ${c.certifications[0]}`);
      events.push("Month 11: First project shipped to portfolio");
      events.push("Month 12: Job offer secured 🎉");
      setSim({
        month: 12,
        skill: 100,
        salary: baseSalary + 3.5,
        certified: c.certifications.length > 0,
        events,
      });
      setRunning(false);
    }, 1400);
  };

  const salaryLPA = (sim?.salary ?? baseSalary).toFixed(1);
  const tier = salaryLPA >= "5" ? "mid" : "entry";

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("sim.eyebrow")}
        title={t("sim.title")}
        sub={t("sim.sub")}
        icon="FlaskConical"
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="glass h-fit rounded-2xl p-6">
          <label className="text-sm font-semibold text-white">Choose a career</label>
          <select
            value={careerTitle}
            onChange={(e) => setCareerTitle(e.target.value)}
            className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-navy-900 px-3 text-sm text-white focus:border-electric-400 focus:outline-none"
            aria-label="Choose a career to simulate"
          >
            {careers.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {career && (
            <div className="mt-4 space-y-3">
              <p className="text-sm leading-relaxed text-navy-300">{career.summary}</p>
              <div className="flex flex-wrap gap-2">
                <Badge tone="blue">{career.salary}</Badge>
                <Badge tone="green">{career.demand} demand</Badge>
                <Badge tone="warm">+{career.growth}% growth</Badge>
              </div>
              <p className="text-xs text-navy-400">Key skills required: {career.skills.map((s) => s.name).slice(0, 5).join(", ")}</p>
            </div>
          )}

          <Button onClick={runSim} disabled={running} className="mt-6 w-full">
            {running ? (
              <>
                <Icon name="LoaderCircle" size={16} className="animate-spin" /> Simulating…
              </>
            ) : (
              <>
                <Icon name="Play" size={16} /> Run 12-month simulation
              </>
            )}
          </Button>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-wider text-navy-400">12-Month Projection</p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-mint-400/10 px-2.5 py-1 text-xs font-medium text-mint-400">
              <span className="relative flex h-2 w-2"><span className="absolute h-full w-full animate-ping rounded-full bg-mint-400 opacity-75" /><span className="relative h-2 w-2 rounded-full bg-mint-400" /></span>
              {sim ? "Simulation complete" : "Ready to run"}
            </span>
          </div>

          {sim ? (
            <div className="mt-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <Stat label="Projected salary" value={`₹${salaryLPA} LPA`} sub={`${tier === "mid" ? "Mid" : "Entry"}-level range`} icon="IndianRupee" />
                <Stat label="Skill mastery" value={`${sim.skill}%`} sub={`${skillCount} core skills`} icon="Brain" />
                <Stat label="Certification" value={sim.certified ? "Earned" : "None"} sub={sim.certified ? "Industry-verified" : "Add via roadmap"} icon="Award" />
              </div>

              <div className="mt-6">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-navy-400">Skill growth</p>
                <Bar value={sim.skill} color="#2dd4a7" />
                <p className="mt-2 text-xs text-navy-400">From {Math.max(0, Math.round(sim.skill / 2.2))}% today → {sim.skill}% in 12 months</p>
              </div>

              <div className="mt-6 space-y-2.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-navy-400">Milestones</p>
                {sim.events.map((e, i) => (
                  <motion.div
                    key={e}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.12 }}
                    className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/3 px-4 py-2.5"
                  >
                    <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full", i === sim.events.length - 1 ? "bg-mint-400/20 text-mint-400" : "bg-electric-500/15 text-electric-300")}>
                      <Icon name={i === sim.events.length - 1 ? "Trophy" : "Check"} size={12} />
                    </span>
                    <span className="text-sm text-navy-200">{e}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <AnimatePresence>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 flex flex-col items-center py-10 text-center">
                <Icon name="FlaskConical" size={36} className="text-navy-500" />
                <p className="mt-4 font-semibold text-white">Project your next 12 months</p>
                <p className="mt-1 max-w-sm text-sm text-navy-300">Pick a career and hit “Run 12-month simulation” to see how training, projects and certification translate into a salary jump.</p>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </PageShell>
  );
}

function Stat({ label, value, sub, icon }: { label: string; value: string; sub: string; icon: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
      <p className="flex items-center gap-1.5 text-xs text-navy-400"><Icon name={icon} size={13} className="text-electric-300" /> {label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
      <p className="mt-0.5 text-xs text-navy-400">{sub}</p>
    </div>
  );
}
