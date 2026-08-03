"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { GsapReveal } from "@/components/ui/scroll-reveal";
import { useLang } from "@/lib/i18n";

const JOURNEY = [
  { labelKey: "home.journey.s1.t", icon: "User", color: "from-electric-500 to-sky-glow", descKey: "home.journey.s1.d" },
  { labelKey: "home.journey.s2.t", icon: "Sparkles", color: "from-violet-500 to-electric-400", descKey: "home.journey.s2.d" },
  { labelKey: "home.journey.s3.t", icon: "GraduationCap", color: "from-electric-400 to-sky-glow", descKey: "home.journey.s3.d" },
  { labelKey: "home.journey.s4.t", icon: "Hammer", color: "from-saffron-400 to-brown-500", descKey: "home.journey.s4.d" },
  { labelKey: "home.journey.s5.t", icon: "Briefcase", color: "from-mint-400 to-electric-400", descKey: "home.journey.s5.d" },
  { labelKey: "home.journey.s6.t", icon: "Rocket", color: "from-saffron-500 to-brown-500", descKey: "home.journey.s6.d" },
];

const FLOATING = [
  { top: "8%", right: "6%", titleKey: "home.float.1.t", subKey: "home.float.1.s", icon: "Target", delay: 0, color: "text-mint-400" },
  { top: "30%", right: "16%", titleKey: "home.float.2.t", subKey: "home.float.2.s", icon: "SlidersHorizontal", delay: 0.6, color: "text-saffron-400" },
  { bottom: "12%", right: "8%", titleKey: "home.float.3.t", subKey: "home.float.3.s", icon: "Briefcase", delay: 1.2, color: "text-electric-300" },
  { bottom: "34%", right: "20%", titleKey: "home.float.4.t", subKey: "home.float.4.s", icon: "FileText", delay: 1.8, color: "text-rose-300" },
];

export function Hero() {
  const { t } = useLang();
  return (
    <section className="relative px-4 pb-20 pt-32 sm:px-6 lg:pt-40">
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="aurora-orb left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 bg-electric-500/20 blur-[120px]" />
        <div className="aurora-orb left-1/3 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 bg-sky-glow/15 blur-[100px]" style={{ animationDelay: "-3s" }} />
        <div className="aurora-orb left-2/3 top-2/3 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 bg-mint-500/15 blur-[100px]" style={{ animationDelay: "-6s" }} />
      </div>

      <div className="relative mx-auto max-w-5xl text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}>
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-electric-400/30 bg-electric-500/10 px-4 py-1.5 text-xs font-medium text-electric-300 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-mint-400" />
            </span>
            {t("hero.badge")}
          </div>

          <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-7xl lg:text-[5rem]">
            {t("hero.title1")} {t("hero.title2")}
            <br />
            <span className="text-gradient bg-gradient-to-r from-electric-300 via-sky-glow to-mint-400">{t("hero.title3")}</span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-navy-300 sm:text-xl">
            {t("hero.subtitle")}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <ButtonLink href="/skilldna" size="lg" className="shine min-w-[200px] justify-center text-base">
              <Icon name="Sparkles" size={20} /> {t("hero.ctaPrimary")}
            </ButtonLink>
            <ButtonLink href="/opportunities" variant="secondary" size="lg" className="min-w-[200px] justify-center text-base border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-md">
              {t("hero.ctaSecondary")} <Icon name="ArrowRight" size={18} />
            </ButtonLink>
          </div>

          <div className="mx-auto mt-16 flex max-w-3xl flex-wrap items-center justify-center gap-x-12 gap-y-8 border-t border-white/10 pt-10">
            {[
              { n: "2M+", l: t("hero.stat1") },
              { n: "14", l: t("hero.stat2") },
              { n: "3,500+", l: t("hero.stat3") },
              { n: "87", l: t("hero.stat4") },
            ].map((s, i) => (
              <motion.div key={s.l} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.1, ease: "easeOut" }}>
                <p className="text-3xl font-extrabold text-white sm:text-4xl">{s.n}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-navy-400">{s.l}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Floating background elements for depth */}
        {FLOATING.map((card) => (
          <motion.div
            key={card.titleKey}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 + card.delay, type: "spring", stiffness: 100, damping: 20 }}
            className="glass-strong absolute hidden sm:flex -z-10 animate-float opacity-40 hover:opacity-100 transition-opacity"
            style={card.top ? { top: card.top, right: card.right } : { bottom: card.bottom, left: card.right }} // Reusing right as left for bottom ones to balance
          >
            <div className="flex items-center gap-3 rounded-2xl p-3">
              <span className={`grid h-8 w-8 place-items-center rounded-xl bg-white/10 ${card.color}`}>
                <Icon name={card.icon} size={15} />
              </span>
              <div className="text-left">
                <p className="text-[11px] font-bold text-white">{t(card.titleKey as never)}</p>
                <p className="text-[9px] text-navy-400">{t(card.subKey as never)}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

const TOOLKIT_ITEMS: { href: string; icon: string; key: string; accent: string }[] = [
  { href: "/skill-gap", icon: "SlidersHorizontal", key: "toolkit.d.1", accent: "from-saffron-400 to-brown-500" },
  { href: "/roadmap", icon: "Route", key: "toolkit.d.2", accent: "from-violet-500 to-electric-400" },
  { href: "/resume-builder", icon: "FileText", key: "toolkit.d.3", accent: "from-mint-400 to-electric-400" },
  { href: "/skill-passport", icon: "BadgeCheck", key: "toolkit.d.4", accent: "from-electric-400 to-sky-glow" },
  { href: "/simulator", icon: "FlaskConical", key: "toolkit.d.5", accent: "from-saffron-500 to-saffron-400" },
  { href: "/quests", icon: "Trophy", key: "toolkit.d.6", accent: "from-sky-glow to-electric-500" },
];

const TOOLKIT_NAMES: { href: string; label: string }[] = [
  { href: "/skill-gap", label: "nav.skillGap" },
  { href: "/roadmap", label: "nav.roadmap" },
  { href: "/resume-builder", label: "nav.resume" },
  { href: "/skill-passport", label: "nav.passport" },
  { href: "/simulator", label: "nav.simulator" },
  { href: "/quests", label: "nav.quests" },
];

const QUICK_LINKS: { href: string; icon: string; label: string }[] = [
  { href: "/saved", icon: "Heart", label: "nav.saved" },
  { href: "/applications", icon: "ClipboardCheck", label: "nav.applications" },
  { href: "/notifications", icon: "Bell", label: "notif.title" },
  { href: "/profile", icon: "User", label: "nav.profile" },
];

export function ToolkitSection() {
  const { t } = useLang();
  return (
    <section className="px-4 py-14 sm:px-6">
      <GsapReveal className="mx-auto max-w-7xl">
        <div className="mb-10 grid items-end gap-6 md:grid-cols-[1fr_auto]">
          <div>
            <span className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-electric-300">
              <Icon name="Wrench" size={14} /> {t("toolkit.eyebrow")}
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{t("toolkit.title")}</h2>
            <p className="mt-3 max-w-2xl text-navy-300">{t("toolkit.sub")}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLKIT_ITEMS.map((item, i) => {
            const name = TOOLKIT_NAMES.find((n) => n.href === item.href)?.label ?? "nav.home";
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.07, duration: 0.5 }}
              >
                <Link
                  href={item.href}
                  className="glass group flex h-full flex-col rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-electric-400/40 hover:shadow-glow-soft"
                >
                  <div className="flex items-start justify-between">
                    <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition-transform duration-300 group-hover:scale-110 ${item.accent}`}>
                      <Icon name={item.icon} size={21} />
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-electric-300 opacity-0 transition-opacity group-hover:opacity-100">
                      {t("toolkit.open")} <Icon name="ArrowUpRight" size={15} />
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-white">{t(name as never)}</h3>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-navy-300">{t(item.key as never)}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          <span className="text-sm font-semibold text-white">{t("toolkit.quick")}:</span>
          {QUICK_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-sm text-navy-200 transition-colors hover:border-electric-400/40 hover:text-white"
            >
              <Icon name={l.icon} size={14} className="text-electric-300" /> {t(l.label as never)}
            </Link>
          ))}
        </div>
      </GsapReveal>
    </section>
  );
}

export function DiscoverSection() {
  const { t } = useLang();
  return (
    <section className="px-4 py-16 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="glass relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] p-8 sm:p-12"
      >
        <div className="absolute inset-0 -z-0" aria-hidden="true">
          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-electric-500 to-sky-glow" />
          <div className="dot-bg absolute inset-0 opacity-40" />
        </div>
        <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <span className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-electric-300">
              <Icon name="Wand2" size={14} /> {t("discover.eyebrow")}
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {t("discover.title")}
            </h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-navy-300">{t("discover.sub")}</p>
            <ButtonLink href="/skilldna" variant="warm" size="lg" className="mt-7 shine">
              <Icon name="Sparkles" size={18} /> {t("discover.cta")}
            </ButtonLink>
          </div>
          <div className="relative hidden md:block" aria-hidden="true">
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: "Brain", labelKey: "sd.analyze" },
                { icon: "Route", labelKey: "home.discover.map" },
                { icon: "Gauge", labelKey: "sd.score" },
              ].map((c, i) => (
                <motion.div
                  key={c.labelKey}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="glass grid h-28 w-24 place-items-center rounded-2xl"
                >
                  <Icon name={c.icon} size={22} className="text-electric-300" />
                  <p className="mt-2 max-w-[80px] text-center text-[11px] text-navy-300">{t(c.labelKey as never)}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export function HowItWorks() {
  const { t } = useLang();
  const steps = [
    { n: "01", icon: "Search", title: t("how.s1.t"), desc: t("how.s1.d"), color: "from-electric-500 to-sky-glow" },
    { n: "02", icon: "Target", title: t("how.s2.t"), desc: t("how.s2.d"), color: "from-violet-500 to-electric-400" },
    { n: "03", icon: "GraduationCap", title: t("how.s3.t"), desc: t("how.s3.d"), color: "from-electric-400 to-sky-glow" },
    { n: "04", icon: "Hammer", title: t("how.s4.t"), desc: t("how.s4.d"), color: "from-saffron-400 to-brown-500" },
    { n: "05", icon: "Rocket", title: t("how.s5.t"), desc: t("how.s5.d"), color: "from-saffron-500 to-brown-500" },
  ];
  return (
    <section className="px-4 py-20 sm:px-6">
      <GsapReveal className="mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <span className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-electric-300">
            <span className="h-px w-6 bg-current" /> {t("how.eyebrow")} <span className="h-px w-6 bg-current" />
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t("how.title")}
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="glass group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-electric-400/40"
            >
              <div className={`mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-lg ${s.color}`}>
                <Icon name={s.icon} size={21} />
              </div>
              <p className="mb-1 text-xs font-bold tracking-widest text-navy-400">{s.n}</p>
              <h3 className="text-lg font-bold text-white">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-300">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </GsapReveal>
    </section>
  );
}

export function Features() {
  const { t } = useLang();
  const features = [
    { icon: "Brain", title: t("feat.1.t"), desc: t("feat.1.d"), href: "/skilldna", accent: "from-electric-500 to-sky-glow" },
    { icon: "Route", title: t("feat.2.t"), desc: t("feat.2.d"), href: "/roadmap", accent: "from-violet-500 to-electric-400" },
    { icon: "SlidersHorizontal", title: t("feat.3.t"), desc: t("feat.3.d"), href: "/skill-gap", accent: "from-saffron-400 to-brown-500" },
    { icon: "FileText", title: t("feat.4.t"), desc: t("feat.4.d"), href: "/resume-builder", accent: "from-mint-400 to-electric-400" },
    { icon: "BadgeCheck", title: t("feat.5.t"), desc: t("feat.5.d"), href: "/skill-passport", accent: "from-electric-400 to-sky-glow" },
    { icon: "Radar", title: t("feat.6.t"), desc: t("feat.6.d"), href: "/radar", accent: "from-saffron-500 to-saffron-400" },
  ];
  return (
    <section className="px-4 py-20 sm:px-6">
      <GsapReveal className="mx-auto max-w-7xl">
        <div className="mb-14 grid items-end gap-6 md:grid-cols-[1fr_auto]">
          <div>
            <span className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-electric-300">
              <span className="h-px w-6 bg-current" /> {t("feat.eyebrow")}
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {t("feat.title")}
            </h2>
          </div>
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-electric-300 transition-colors hover:text-white">
            {t("feat.cta")} <Icon name="ArrowRight" size={16} />
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <Link
                href={f.href}
                className="glass group flex h-full flex-col rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-electric-400/40 hover:shadow-glow-soft"
              >
                <span className={`mb-5 grid h-13 w-13 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition-transform duration-300 group-hover:scale-110 ${f.accent}`}>
                  <Icon name={f.icon} size={22} />
                </span>
                <h3 className="text-lg font-bold text-white">{f.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-navy-300">{f.desc}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-electric-300 opacity-0 transition-opacity group-hover:opacity-100">
                  {t("feat.6.cta")} <Icon name="ArrowUpRight" size={15} />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </GsapReveal>
    </section>
  );
}

export function Categories() {
  const { t } = useLang();
  const cats = [
    { icon: "Monitor", name: "IT & Software", nameKey: "cat.IT & Software", descKey: "home.cat.d.1" },
    { icon: "ShieldCheck", name: "Cybersecurity", nameKey: "cat.Cybersecurity", descKey: "home.cat.d.2" },
    { icon: "BrainCircuit", name: "AI & Data", nameKey: "cat.AI & Data", descKey: "home.cat.d.3" },
    { icon: "PenTool", name: "Design", nameKey: "cat.Design", descKey: "home.cat.d.4" },
    { icon: "Megaphone", name: "Digital Marketing", nameKey: "cat.Digital Marketing", descKey: "home.cat.d.5" },
    { icon: "HeartPulse", name: "Healthcare", nameKey: "cat.Healthcare", descKey: "home.cat.d.6" },
    { icon: "Car", name: "Automotive", nameKey: "cat.Automotive", descKey: "home.cat.d.7" },
    { icon: "Zap", name: "Electrical", nameKey: "cat.Electrical", descKey: "home.cat.d.8" },
    { icon: "HardHat", name: "Construction", nameKey: "cat.Construction", descKey: "home.cat.d.9" },
    { icon: "Factory", name: "Manufacturing", nameKey: "home.cat.manufacturing", descKey: "home.cat.d.10" },
    { icon: "Utensils", name: "Hospitality", nameKey: "cat.Hospitality", descKey: "home.cat.d.11" },
    { icon: "Sparkles", name: "Beauty & Wellness", nameKey: "cat.Beauty & Wellness", descKey: "home.cat.d.12" },
    { icon: "Leaf", name: "Agriculture", nameKey: "cat.Agriculture", descKey: "home.cat.d.13" },
    { icon: "Truck", name: "Logistics", nameKey: "cat.Logistics", descKey: "home.cat.d.14" },
  ];
  return (
    <section className="px-4 py-20 sm:px-6">
      <GsapReveal className="mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <span className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-electric-300">
            <span className="h-px w-6 bg-current" /> {t("cats.eyebrow")} <span className="h-px w-6 bg-current" />
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{t("cats.title")}</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
          {cats.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                href={`/training?category=${encodeURIComponent(c.name)}`}
                className="glass group flex h-full flex-col items-center rounded-2xl p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-electric-400/40 hover:shadow-glow-soft"
              >
                <span className="mb-3 grid h-12 w-12 place-items-center rounded-xl bg-white/6 text-electric-300 transition-colors group-hover:bg-electric-500/15">
                  <Icon name={c.icon} size={21} />
                </span>
                <p className="text-sm font-semibold text-white">{t(c.nameKey as never)}</p>
                <p className="mt-1 text-[11px] leading-snug text-navy-400">{t(c.descKey as never)}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </GsapReveal>
    </section>
  );
}

export function CitiesSection() {
  const { t } = useLang();
  const cities = [
    { name: "Delhi", opp: 1240, rolesKey: "home.cityRoles.1" },
    { name: "Mumbai", opp: 1100, rolesKey: "home.cityRoles.2" },
    { name: "Bengaluru", opp: 1875, rolesKey: "home.cityRoles.3" },
    { name: "Hyderabad", opp: 980, rolesKey: "home.cityRoles.4" },
    { name: "Chennai", opp: 850, rolesKey: "home.cityRoles.5" },
    { name: "Pune", opp: 790, rolesKey: "home.cityRoles.6" },
    { name: "Kolkata", opp: 620, rolesKey: "home.cityRoles.7" },
    { name: "Jaipur", opp: 540, rolesKey: "home.cityRoles.8" },
    { name: "Gurugram", opp: 720, rolesKey: "home.cityRoles.9" },
    { name: "Noida", opp: 680, rolesKey: "home.cityRoles.10" },
  ];
  return (
    <section className="px-4 py-20 sm:px-6">
      <GsapReveal className="mx-auto max-w-7xl">
        <div className="mb-14 grid items-end gap-6 md:grid-cols-[1fr_auto]">
          <div>
            <span className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-electric-300">
              <span className="h-px w-6 bg-current" /> {t("cities.eyebrow")}
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{t("cities.title")}</h2>
          </div>
          <Link href="/radar" className="inline-flex items-center gap-2 text-sm font-medium text-electric-300 transition-colors hover:text-white">
            {t("cities.cta")} <Icon name="ArrowRight" size={16} />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {cities.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.06 }}
            >
              <Link
                href={`/jobs?location=${encodeURIComponent(c.name)}`}
                className="glass group flex h-full flex-col rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-electric-400/40"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2 font-semibold text-white">
                    <Icon name="MapPin" size={16} className="text-electric-300" /> {c.name}
                  </span>
                  <Icon name="ArrowUpRight" size={15} className="text-navy-400 transition-colors group-hover:text-electric-300" />
                </div>
                <p className="text-2xl font-bold text-gradient">{c.opp.toLocaleString("en-IN")}</p>
                <p className="text-[11px] text-navy-400">{t("hero.stat3")}</p>
                <p className="mt-2 text-[11px] text-navy-300">{t(c.rolesKey as never)}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </GsapReveal>
    </section>
  );
}

export function FinalCTA() {
  const { t } = useLang();
  return (
    <section className="px-4 py-24 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
        className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 p-10 text-center sm:p-16"
      >
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute left-1/2 top-0 h-64 w-[560px] -translate-x-1/2 rounded-full bg-electric-500/20 blur-[110px]" />
          <div className="grid-bg absolute inset-0 opacity-30" />
        </div>
        <div className="relative">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-electric-400/30 bg-electric-500/10 px-4 py-1.5 text-xs font-medium text-electric-300">
            <Icon name="Rocket" size={14} /> {t("home.cta.badge")}
          </span>
          <h2 className="mx-auto max-w-3xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
            {t("cta.title1")}
            <br />
            <span className="text-gradient-warm">{t("cta.title2")}</span>
          </h2>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <ButtonLink href="/skilldna" size="lg" variant="warm" className="shine">
              <Icon name="Sparkles" size={18} /> {t("cta.primary")}
            </ButtonLink>
            <ButtonLink href="/signup" variant="secondary" size="lg">
              {t("cta.secondary")}
            </ButtonLink>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
