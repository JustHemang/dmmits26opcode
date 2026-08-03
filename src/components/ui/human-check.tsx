"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const SETS: { same: string[]; odd: string }[] = [
  { same: ["Monitor", "Laptop", "Phone"], odd: "Car" },
  { same: ["Car", "Truck", "Rocket"], odd: "Hammer" },
  { same: ["Hammer", "Wrench", "HardHat"], odd: "Moon" },
  { same: ["Mail", "Phone", "MessageCircle"], odd: "Cloud" },
  { same: ["GraduationCap", "BookOpen", "ClipboardCheck"], odd: "Heart" },
  { same: ["Palette", "Music", "Mic"], odd: "Leaf" },
  { same: ["Sun", "Moon", "Cloud"], odd: "Rocket" },
  { same: ["Heart", "HeartPulse", "Brain"], odd: "Car" },
  { same: ["Cpu", "Database", "Cloud"], odd: "Hammer" },
  { same: ["Wallet", "IndianRupee", "CircleDollarSign"], odd: "Leaf" },
  { same: ["PenTool", "Palette", "Wand2"], odd: "Truck" },
  { same: ["Code", "Terminal", "GitBranch"], odd: "Sun" },
  { same: ["Mic", "Music", "PlayCircle"], odd: "Hammer" },
  { same: ["Briefcase", "Building2", "BadgeCheck"], odd: "Globe" },
  { same: ["HardHat", "Factory", "Wrench"], odd: "Sun" },
  { same: ["Truck", "Package", "Rocket"], odd: "Sun" },
  { same: ["Trophy", "PartyPopper", "Crown"], odd: "Cloud" },
  { same: ["Compass", "MapPin", "Globe"], odd: "Hammer" },
  { same: ["Utensils", "Salad", "Leaf"], odd: "Cpu" },
  { same: ["GraduationCap", "BookOpen", "Laptop"], odd: "Wrench" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickPuzzle() {
  const set = SETS[Math.floor(Math.random() * SETS.length)];
  return { options: shuffle([...set.same, set.odd]), odd: set.odd };
}

export function HumanCheck({ onValidChange }: { onValidChange: (valid: boolean) => void }) {
  const [puzzle, setPuzzle] = useState<{ options: string[]; odd: string } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [wrong, setWrong] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setPuzzle(pickPuzzle()), 0);
    return () => clearTimeout(id);
  }, []);

  const verified = !!puzzle && selected === puzzle.odd;

  const choose = (name: string) => {
    if (!puzzle || verified) return;
    setSelected(name);
    const isOdd = name === puzzle.odd;
    setWrong(!isOdd);
    onValidChange(isOdd);
  };

  const refresh = () => {
    setPuzzle(pickPuzzle());
    setSelected(null);
    setWrong(false);
    onValidChange(false);
  };

  return (
    <div
      className={cn(
        "rounded-xl border bg-white/4 p-3 transition-colors",
        verified ? "border-mint-400/50 bg-mint-400/5" : "border-white/10"
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "grid h-9 w-9 shrink-0 place-items-center rounded-lg",
            verified ? "bg-mint-400/15 text-mint-400" : "bg-electric-500/15 text-electric-300"
          )}
        >
          <Icon name={verified ? "ShieldCheck" : "Bot"} size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-white">Human check</p>
          <p className="text-xs text-navy-300">{puzzle ? "Tap the one that doesn't belong" : "Loading…"}</p>
        </div>
        <button
          type="button"
          onClick={refresh}
          aria-label="New puzzle"
          className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-navy-300 transition-colors hover:bg-white/5 hover:text-white cursor-pointer"
        >
          <Icon name="RefreshCcw" size={15} />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2">
        {(puzzle?.options ?? [null, null, null, null]).map((name, i) => {
          const chosen = name === selected;
          return (
            <button
              key={i}
              type="button"
              onClick={() => name && choose(name)}
              className={cn(
                "grid place-items-center rounded-lg border p-2.5 transition-all",
                !name
                  ? "pointer-events-none bg-white/3 text-navy-600"
                  : chosen && verified
                    ? "border-mint-400/60 bg-mint-400/15 text-mint-400"
                    : chosen && wrong
                      ? "border-rose-glow/60 bg-rose-glow/10 text-rose-300"
                      : "border-white/10 text-navy-200 hover:border-electric-400/40 hover:bg-white/5 cursor-pointer"
              )}
            >
              <Icon name={name ?? "Circle"} size={22} />
            </button>
          );
        })}
      </div>

      {wrong && <p className="mt-2 text-xs text-rose-300">That&apos;s not it — find the one that doesn&apos;t belong.</p>}
      {verified && (
        <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-mint-400">
          <Icon name="CheckCircle2" size={14} /> Verified
        </p>
      )}
    </div>
  );
}
