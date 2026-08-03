"use client";

import { cn } from "@/lib/utils";

export function Background({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-navy-950">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="grid-bg absolute inset-0 opacity-60" />
        <div className="absolute -top-32 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-electric-500/12 blur-[140px]" />
        <div className="absolute right-[-120px] top-[30%] h-[360px] w-[360px] rounded-full bg-sky-glow/10 blur-[130px]" />
        <div className="absolute bottom-[-100px] left-[-120px] h-[360px] w-[360px] rounded-full bg-saffron-500/8 blur-[130px]" />
      </div>
      {children}
    </div>
  );
}

export function PageShell({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6", className)}>{children}</div>
  );
}
