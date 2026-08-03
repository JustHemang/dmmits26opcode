"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

const AUTH_ROUTES = ["/login", "/signup"];
const PUBLIC_ROUTES = ["/hiring", "/hiring/employer"];

export function RouteGuard({ children }: { children: ReactNode }) {
  const { user, isHydrated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isHydrated) return;
    if (PUBLIC_ROUTES.includes(pathname)) return;
    let target: string | null = null;

    if (pathname === "/skilldna") {
      if (!user) target = "/login?from=/skilldna";
    } else if (AUTH_ROUTES.includes(pathname)) {
      if (user) target = user.skilldna ? "/dashboard" : "/skilldna";
    } else if (pathname === "/") {
      if (user && !user.skilldna) target = "/skilldna";
    } else if (!user) {
      target = "/login?from=" + encodeURIComponent(pathname);
    } else if (!user.skilldna) {
      target = "/skilldna";
    }

    if (target) {
      if (target.startsWith("/login")) sessionStorage.setItem("sih_login_nav", "1");
      router.replace(target);
    }
  }, [isHydrated, user, pathname, router]);

  if (!isHydrated) return null;

  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isHome = pathname === "/";
  const isPublic = PUBLIC_ROUTES.includes(pathname);
  const blocked =
    (!isPublic && pathname === "/skilldna" && !user) ||
    (isAuthRoute && !!user) ||
    (isHome && !!user && !user.skilldna) ||
    (!isHome && !isAuthRoute && !isPublic && pathname !== "/skilldna" && (!user || !user.skilldna));

  if (blocked) return null;

  return <>{children}</>;
}
