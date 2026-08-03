"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/lib/auth";
import { useLang, type TranslationKey } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

const FOOTER_COLS: { title: TranslationKey; links: { label: TranslationKey; href: string }[] }[] = [
  {
    title: "footer.explore",
    links: [
      { label: "nav.skilldna", href: "/skilldna" },
      { label: "nav.roadmap", href: "/roadmap" },
      { label: "nav.skillGap", href: "/skill-gap" },
      { label: "nav.simulator", href: "/simulator" },
    ],
  },
  {
    title: "footer.opportunities",
    links: [
      { label: "nav.training", href: "/training" },
      { label: "nav.internships", href: "/internships" },
      { label: "nav.jobs", href: "/jobs" },
      { label: "nav.radar", href: "/radar" },
    ],
  },
  {
    title: "footer.toolkit",
    links: [
      { label: "nav.resume", href: "/resume-builder" },
      { label: "nav.passport", href: "/skill-passport" },
      { label: "nav.applications", href: "/applications" },
      { label: "nav.quests", href: "/quests" },
    ],
  },
];

export function Footer() {
  const { t } = useLang();
  const { user } = useAuth();
  const pathname = usePathname();
  if (pathname === "/login" || pathname === "/signup") return null;
  return (
    <footer className="relative z-10 border-t border-white/10 bg-navy-900/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-2.5" aria-label={`Skill India Hub ${t("nav.home")}`}>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-electric-500 to-sky-glow text-white shadow-glow-blue">
              <Icon name="Rocket" size={19} />
            </span>
            <span className="text-base font-bold tracking-tight">
              <span className="text-white">Skill India</span> <span className="text-gradient">Hub</span>
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-navy-300">{t("footer.tagline")}</p>
          <div className="mt-5 flex items-center gap-2 text-xs text-navy-400">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
              <Icon name="Sparkles" size={12} /> {t("foot.aiPowered")}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
              <Icon name="BadgeCheck" size={12} /> {t("foot.govtCertified")}
            </span>
          </div>
        </div>

        {FOOTER_COLS.map((col) => (
          <nav key={col.title} aria-label={t(col.title)}>
            <h3 className="mb-4 text-sm font-semibold text-white">{t(col.title)}</h3>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-navy-300 transition-colors hover:text-white">
                    {t(l.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-white/10 py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-xs text-navy-400 sm:flex-row sm:px-6">
          <p>© 2026 Skill India Hub · {t("footer.rights")}</p>
          <div className="flex items-center gap-5">
            <LanguageSwitcher compact showShort />
            {!user && (
              <>
                <Link href="/login" onClick={() => sessionStorage.setItem("sih_login_nav", "1")} className="hover:text-white">{t("footer.signIn")}</Link>
                <Link href="/signup" className="hover:text-white">{t("footer.createAccount")}</Link>
              </>
            )}
            <Link href="/search" className="hover:text-white">{t("nav.search")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
