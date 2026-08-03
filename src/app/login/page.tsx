"use client";

import { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { Button, Input, Field, Logo } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { HumanCheck } from "@/components/ui/human-check";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useLang } from "@/lib/i18n";
import { initials } from "@/lib/utils";
import { cn } from "@/lib/utils";

let buttonNav = false;

function LoginForm() {
  const router = useRouter();
  const { login, demoLogin, user } = useAuth();
  const { toast } = useStore();
  const { t } = useLang();
  const [mode, setMode] = useState<"mobile" | "email">("mobile");
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [human, setHuman] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace(user.skilldna ? "/dashboard" : "/skilldna");
      return;
    }
    if (sessionStorage.getItem("sih_login_nav") === "1") {
      sessionStorage.removeItem("sih_login_nav");
      buttonNav = true;
    }
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (!buttonNav && nav?.type === "reload") {
      router.replace("/");
    }
  }, [user, router]);

  const handleDemo = () => {
    demoLogin();
    toast("Welcome, Aarav! 👋", { message: "Signed in as Demo User with your full personalized dashboard." });
    router.replace("/dashboard");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await login({ name, identifier, password });
    setLoading(false);
    if (!res.ok) {
      toast("Unable to sign in", { kind: "error", message: res.error });
      return;
    }
    toast(`Welcome back, ${name.split(" ")[0]}!`, { message: "You're signed in." });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="fixed right-4 top-4 z-50">
        <LanguageSwitcher align="right" showShort />
      </div>
      <div className="relative hidden overflow-hidden border-r border-white/10 lg:block">
        <div className="absolute inset-0" aria-hidden="true">
          <div className="dot-bg absolute inset-0 opacity-50" />
          <div className="absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-electric-500/15 blur-[120px]" />
          <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-saffron-500/10 blur-[110px]" />
        </div>
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/" aria-label="Skill India Hub home">
            <Logo size="lg" />
          </Link>
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="max-w-md text-4xl font-bold leading-tight text-white"
            >
              Discover what you&apos;re good at. <span className="text-gradient">Launch where it leads.</span>
            </motion.h2>
            <div className="mt-8 space-y-3">
              {[
                { icon: "Brain", text: t("login.left.1") },
                { icon: "Route", text: t("login.left.2") },
                { icon: "BadgeCheck", text: t("login.left.3") },
              ].map((f, i) => (
                <motion.div
                  key={f.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.15 }}
                  className="flex items-center gap-3"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-electric-500/15 text-electric-300">
                    <Icon name={f.icon} size={17} />
                  </span>
                  <p className="text-sm text-navy-200">{f.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
          <p className="text-xs text-navy-400">© 2026 Skill India Hub · Made by Devansh Mehta & Hemang Luthra</p>
        </div>
      </div>

      <div className="relative flex items-center justify-center px-4 py-14 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link href="/"><Logo size="lg" /></Link>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl font-bold tracking-tight text-white">{t("login.title")}</h1>
            <p className="mt-2 text-navy-300">{t("login.sub")}</p>
          </motion.div>

          <div className="mt-7 grid grid-cols-2 gap-1.5 rounded-2xl border border-white/10 bg-white/4 p-1.5">
            {(
              [
                { id: "mobile", label: t("login.tab.mobile"), icon: "Smartphone" },
                { id: "email", label: t("login.tab.email"), icon: "Mail" },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                aria-pressed={mode === m.id}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all cursor-pointer",
                  mode === m.id ? "bg-gradient-to-r from-electric-500 to-sky-glow text-white shadow-glow-soft" : "text-navy-300 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon name={m.icon} size={16} /> {m.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Field label={t("login.name")}>
              <div className="relative">
                <Icon name="User" size={16} className="pointer-events-none absolute left-3.5 top-3.5 text-navy-400" />
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="pl-10"
                  autoComplete="name"
                  required
                />
              </div>
            </Field>
            <Field label={mode === "mobile" ? t("login.mobile") : t("login.email")}>
              <div className="relative">
                <Icon name={mode === "mobile" ? "Smartphone" : "Mail"} size={16} className="pointer-events-none absolute left-3.5 top-3.5 text-navy-400" />
                <Input
                  type={mode === "mobile" ? "tel" : "text"}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={mode === "mobile" ? t("login.mobilePlaceholder") : t("login.emailPlaceholder")}
                  className="pl-10"
                  inputMode={mode === "mobile" ? "numeric" : "email"}
                  autoComplete={mode === "mobile" ? "tel" : "username"}
                  required
                />
              </div>
            </Field>
            <Field label={t("login.password")}>
              <div className="relative">
                <Icon name="Lock" size={16} className="pointer-events-none absolute left-3.5 top-3.5 text-navy-400" />
                <Input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  className="absolute right-3 top-3 text-navy-400 hover:text-white cursor-pointer"
                >
                  <Icon name={showPw ? "EyeOff" : "Eye"} size={17} />
                </button>
              </div>
            </Field>

            <HumanCheck onValidChange={setHuman} />

            <Button type="submit" className="w-full" disabled={loading || !human}>
              {loading ? (
                <>
                  <Icon name="LoaderCircle" size={17} className="animate-spin" /> {t("login.submit")}…
                </>
              ) : (
                <>
                  <Icon name="LogOut" size={17} className="rotate-180" /> {t("login.submit")}
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-navy-300">
            {t("login.new")}{" "}
            <Link href="/signup" className="font-semibold text-electric-300 transition-colors hover:text-white">
              {t("login.create")}
            </Link>
          </p>

          <div className="my-7 flex items-center gap-4">
            <span className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-navy-400">judging the demo?</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <button
            onClick={handleDemo}
            className="group flex w-full flex-col items-center rounded-2xl border border-saffron-500/40 bg-gradient-to-r from-saffron-500/15 via-white/5 to-saffron-500/15 p-5 text-center transition-all hover:border-saffron-400 hover:shadow-[0_0_40px_-10px_rgba(255,153,51,0.5)] cursor-pointer"
          >
            <span className="flex items-center gap-2.5 text-base font-bold text-white">
              <Icon name="Sparkles" size={19} className="text-saffron-400" />
              {t("login.demo")}
            </span>
            <span className="mt-2 flex items-center gap-2 text-xs text-navy-300">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br text-[10px] font-bold text-white from-electric-500 to-sky-glow">
                {initials("Aarav Sharma")}
              </span>
              {t("login.demoSub")}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
