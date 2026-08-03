"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { useTheme } from "@/lib/theme";
import { useLang } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ReloadOverlay } from "@/components/layout/reload-overlay";
import { cn, initials, avatarGradient } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";

gsap.registerPlugin(ScrollTrigger);

const LINKS = [
  { href: "/skilldna", label: "nav.skilldna", icon: "Brain" },
  { href: "/training", label: "nav.training", icon: "GraduationCap" },
  { href: "/internships", label: "nav.internships", icon: "Briefcase" },
  { href: "/jobs", label: "nav.jobs", icon: "Building2" },
  { href: "/radar", label: "nav.radar", icon: "Radar" },
  { href: "/hiring", label: "nav.hiring", icon: "Users2" },
  { href: "/copilot", label: "nav.copilot", icon: "Bot" },
];

const MORE_LINKS = [
  { href: "/skill-gap", label: "nav.skillGap", icon: "SlidersHorizontal" },
  { href: "/roadmap", label: "nav.roadmap", icon: "Route" },
  { href: "/resume-builder", label: "nav.resume", icon: "FileText" },
  { href: "/skill-passport", label: "nav.passport", icon: "BadgeCheck" },
  { href: "/simulator", label: "nav.simulator", icon: "FlaskConical" },
  { href: "/quests", label: "nav.quests", icon: "Trophy" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { unreadCount } = useStore();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLang();
  const { lang, setLang } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reloading, setReloading] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const st = ScrollTrigger.create({
      start: "top -64",
      onUpdate: (self) => {
        if (self.direction === 1 && self.scroll() > 120 && !menuOpen) {
          gsap.to(header, { y: -100, duration: 0.35, ease: "power2.out" });
        } else {
          gsap.to(header, { y: 0, duration: 0.35, ease: "power2.out" });
        }
      },
    });
    return () => st.kill();
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // No GSAP timeline needed, using Framer Motion instead

  const links = user
    ? [{ href: "/dashboard", label: "nav.dashboard", icon: "LayoutDashboard" }, ...LINKS]
    : [...LINKS];

  const handleLogoClick = () => {
    const href = user ? "/dashboard" : "/";
    if (reloading) return;
    setReloading(true);
    setTimeout(() => {
      setReloading(false);
      if (pathname === href) {
        router.refresh();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        router.push(href);
      }
    }, 700);
  };

  const openMenu = () => {
    if (!menuOpen) {
      if (headerRef.current) headerRef.current.style.transform = "";
      setMenuOpen(true);
    }
  };

  const userQuickLinks = [
    { href: "/profile", label: t("nav.profile"), icon: "User" },
    { href: "/saved", label: t("nav.saved"), icon: "Heart" },
    { href: "/applications", label: t("nav.applications"), icon: "ClipboardCheck" },
    { href: "/notifications", label: t("nav.notifications").replace("{unreadCount}", String(unreadCount)), icon: "Bell" },
  ];

  if (pathname === "/login" || pathname === "/signup") return null;

  return (
    <header
      ref={headerRef}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "glass-strong shadow-lg" : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <button type="button" onClick={handleLogoClick} className="flex items-center gap-2.5 cursor-pointer" aria-label={`Skill India Hub ${t("nav.home")}`}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-electric-500 to-sky-glow text-white shadow-glow-blue">
            <Icon name="Rocket" size={19} />
          </span>
          <span className="hidden text-base font-bold tracking-tight sm:block">
            <span className="text-white">Skill India</span> <span className="text-gradient">Hub</span>
          </span>
        </button>

        <div className="flex items-center gap-1">
          <Link
            href="/search"
            aria-label={t("nav.search")}
            className="grid h-10 w-10 place-items-center rounded-xl text-navy-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            <Icon name="Search" size={19} />
          </Link>

          <button
            onClick={() => setLang(lang === "en" ? "hi" : "en")}
            aria-label={t("nav.language")}
            title={t("nav.language")}
            className="flex h-10 items-center gap-1 rounded-xl px-2 text-sm font-bold text-navy-200 transition-colors hover:bg-white/5 hover:text-white cursor-pointer"
          >
            <Icon name="Languages" size={18} />
            <span className="hidden md:block">{lang === "en" ? "EN" : "हिं"}</span>
          </button>

          <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? t("nav.switchLight") : t("nav.switchDark")}
            className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl text-navy-200 transition-colors hover:bg-white/5 hover:text-white cursor-pointer"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.25 }}
              >
                <Icon name={theme === "dark" ? "Moon" : "Sun"} size={18} />
              </motion.span>
            </AnimatePresence>
          </button>

          {user && (
            <Link
              href="/notifications"
              aria-label={t("nav.notifications").replace("{unreadCount}", String(unreadCount))}
              className="relative grid h-10 w-10 place-items-center rounded-xl text-navy-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              <Icon name="Bell" size={19} />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-saffron-500 px-1 text-[10px] font-bold text-navy-950">
                  {unreadCount}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <Link
              href="/profile"
              aria-label={t("nav.openProfile")}
              className="ml-1 flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 pr-3 transition-colors hover:border-electric-400/40"
            >
              <span className={cn("grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br text-xs font-bold text-white", avatarGradient(user.name))}>
                {initials(user.name)}
              </span>
              <span className="hidden max-w-[90px] truncate text-sm font-medium text-white sm:block">
                {user.name.split(" ")[0]}
              </span>
            </Link>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/hiring"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/10"
              >
                Employers
              </Link>
              <Link
                href="/login"
                onClick={() => sessionStorage.setItem("sih_login_nav", "1")}
                className="rounded-xl bg-gradient-to-r from-electric-500 to-sky-glow px-4 py-2 text-sm font-medium text-white shadow-glow-blue transition-all hover:brightness-110"
              >
                {t("nav.signIn")}
              </Link>
            </div>
          )}

          <button
            onClick={() => (menuOpen ? setMenuOpen(false) : openMenu())}
            aria-label={t("nav.toggleMenu")}
            aria-expanded={menuOpen}
            className="relative flex h-10 w-10 flex-col items-center justify-center gap-1.5 overflow-hidden rounded-xl text-navy-200 transition-colors hover:bg-white/5 hover:text-white cursor-pointer"
          >
            <motion.span
              animate={menuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="h-[2px] w-5 rounded-full bg-current origin-center"
            />
            <motion.span
              animate={menuOpen ? { opacity: 0, scale: 0.5 } : { opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="h-[2px] w-5 rounded-full bg-current origin-center"
            />
            <motion.span
              animate={menuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="h-[2px] w-5 rounded-full bg-current origin-center"
            />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[80] bg-navy-950/95 backdrop-blur-2xl"
          >
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex h-full flex-col overflow-y-auto scrollbar-none"
            >
              <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
                <button type="button" onClick={handleLogoClick} className="flex items-center gap-2.5 cursor-pointer">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-electric-500 to-sky-glow text-white shadow-glow-blue">
                    <Icon name="Rocket" size={19} />
                  </span>
                  <span className="text-base font-bold tracking-tight text-white">
                    Skill India <span className="text-gradient">Hub</span>
                  </span>
                </button>
                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label={t("nav.toggleMenu")}
                  className="grid h-10 w-10 place-items-center rounded-xl text-navy-200 transition-colors hover:bg-white/5 hover:text-white cursor-pointer"
                >
                  <Icon name="X" size={21} />
                </button>
              </div>

              <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-8 px-4 py-8 sm:px-6">
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {links.map((l, i) => {
                    const active = pathname === l.href;
                    return (
                      <motion.div
                        key={l.href}
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 10, opacity: 0 }}
                        transition={{ duration: 0.4, delay: 0.15 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <Link
                          href={l.href}
                          onClick={() => setMenuOpen(false)}
                          className={cn(
                            "group flex items-center gap-4 rounded-2xl border px-5 py-4 transition-all",
                            active
                              ? "border-electric-400/40 bg-electric-500/10 text-white"
                              : "border-white/5 bg-white/2 text-navy-100 hover:border-electric-400/30 hover:bg-white/5 hover:text-white"
                          )}
                        >
                          <span
                            className={cn(
                              "grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-transform group-hover:scale-110",
                              active ? "bg-electric-500/20 text-electric-300" : "bg-white/6 text-electric-300"
                            )}
                          >
                            <Icon name={l.icon as never} size={20} />
                          </span>
                          <span className="text-lg font-semibold sm:text-xl">{t(l.label as never)}</span>
                          <Icon name="ArrowRight" size={16} className="ml-auto text-navy-500 transition-all group-hover:translate-x-1 group-hover:text-electric-300" />
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                {user && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="space-y-2"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-navy-500">{t("nav.primary")}</p>
                    <div className="flex flex-wrap gap-2">
                      {MORE_LINKS.map((l) => (
                        <Link
                          key={l.href}
                          href={l.href}
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/4 px-3.5 py-2 text-sm text-navy-200 transition-colors hover:border-electric-400/40 hover:text-white"
                        >
                          <Icon name={l.icon as never} size={15} /> {t(l.label as never)}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="mt-auto space-y-4 border-t border-white/10 pt-6"
                >
                  {user ? (
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <span className={cn("grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br text-sm font-bold text-white", avatarGradient(user.name))}>
                          {initials(user.name)}
                        </span>
                        <div>
                          <p className="font-semibold text-white">{user.name}</p>
                          <p className="truncate text-xs text-navy-400">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {userQuickLinks.map((i) => (
                          <Link
                            key={i.href}
                            href={i.href}
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/4 px-3 py-2 text-xs text-navy-200 transition-colors hover:border-electric-400/40 hover:text-white"
                          >
                            <Icon name={i.icon as never} size={14} /> {i.label}
                          </Link>
                        ))}
                        <LogoutButton onDone={() => setMenuOpen(false)} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                      <p className="text-sm text-navy-300">{t("login.left.1")}</p>
                      <div className="flex items-center gap-2">
                        <LanguageSwitcher compact />
                        <Link
                          href="/login"
                          onClick={() => {
                            sessionStorage.setItem("sih_login_nav", "1");
                            setMenuOpen(false);
                          }}
                          className="rounded-xl bg-gradient-to-r from-electric-500 to-sky-glow px-5 py-2.5 text-sm font-semibold text-white shadow-glow-blue transition-all hover:brightness-110"
                        >
                          {t("nav.signIn")}
                        </Link>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ReloadOverlay show={reloading} />
    </header>
  );
}

function LogoutButton({ onDone }: { onDone?: () => void }) {
  const { logout } = useAuth();
  const { toast } = useStore();
  const { t } = useLang();
  return (
    <button
      onClick={() => {
        logout();
        onDone?.();
        toast(t("prof.signedOut"), { kind: "info" });
        window.location.href = "/";
      }}
      className="flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-glow/10 px-3 py-2 text-xs font-medium text-rose-300 transition-colors hover:bg-rose-glow/20 cursor-pointer"
    >
      <Icon name="LogOut" size={14} /> {t("nav.signOut")}
    </button>
  );
}
