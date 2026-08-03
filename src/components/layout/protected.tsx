"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Icon } from "@/components/ui/icon";

export function Protected({ children }: { children: ReactNode }) {
  const { user, isHydrated } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (isHydrated && !user) {
      setRedirecting(true);
      const t = setTimeout(() => router.replace("/login?from=" + encodeURIComponent(window.location.pathname)), 250);
      return () => clearTimeout(t);
    }
  }, [isHydrated, user, router]);

  if (!isHydrated || redirecting) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <div className="relative">
          <span className="absolute inset-0 animate-ping rounded-full bg-electric-500/20" />
          <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-electric-500 to-sky-glow text-white shadow-glow-blue">
            <Icon name="Rocket" size={26} />
          </span>
        </div>
        <p className="text-sm text-navy-300">Signing you in…</p>
      </div>
    );
  }

  return <>{children}</>;
}
