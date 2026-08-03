"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageShell } from "@/components/layout/background";
import { PageHeader } from "@/components/ui/page-header";
import { Button, ButtonLink, Input, Field } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { useLang } from "@/lib/i18n";
import { verifyEmployerLogin, createEmployerAccount, setEmployerSession } from "@/lib/db";

export default function HiringPage() {
  const router = useRouter();
  const { t } = useLang();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setErr("");
    if (mode === "login") {
      if (!email.trim() || !password.trim()) {
        setErr(t("hiring.errPassword"));
        return;
      }
      setBusy(true);
      await new Promise((r) => setTimeout(r, 650));
      const res = verifyEmployerLogin(email.trim(), password);
      setBusy(false);
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setEmployerSession(res.account);
      router.push("/hiring/employer");
      return;
    }
    if (!name.trim() || !company.trim() || !email.trim() || !password.trim()) {
      setErr(t("hiring.errSignup"));
      return;
    }
    setBusy(true);
    await new Promise((r) => setTimeout(r, 850));
    const res = createEmployerAccount({ name: name.trim(), company: company.trim(), email: email.trim(), password });
    setBusy(false);
    if (!res.ok) {
      setErr(res.error);
      return;
    }
    setEmployerSession(res.record);
    router.push("/hiring/employer");
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("hiring.eyebrow")}
        title={t("hiring.title")}
        sub={t("hiring.sub")}
        icon="Building2"
      />

      <div className="grid gap-5 sm:grid-cols-3">
        {[
          { v: "2.1M+", l: t("hiring.learners"), icon: "Users2" },
          { v: "18,000+", l: t("hiring.companies"), icon: "Building2" },
          { v: "92%", l: t("hiring.matchAccuracy"), icon: "Target" },
        ].map((s) => (
          <div key={s.l} className="glass flex items-center gap-4 rounded-2xl p-5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-electric-500/15 text-electric-300">
              <Icon name={s.icon as never} size={20} />
            </span>
            <div>
              <p className="text-2xl font-bold text-white">{s.v}</p>
              <p className="text-xs text-navy-300">{s.l}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-electric-400/25 bg-gradient-to-b from-electric-500/15 via-white/5 to-transparent p-7"
        >
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-electric-500/20 blur-3xl" />
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-electric-500 to-sky-glow text-white shadow-glow-blue">
              <Icon name="Building2" size={22} />
            </span>
            <div>
              <h2 className="text-xl font-bold text-white">{t("hiring.employer")}</h2>
              <p className="text-xs text-navy-300">{mode === "login" ? t("hiring.loginSub") : t("hiring.signupSub")}</p>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2 rounded-xl bg-white/5 p-1">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors cursor-pointer ${mode === "login" ? "bg-electric-500/20 text-white" : "text-navy-300 hover:text-white"}`}
            >
              {t("hiring.employerLogin")}
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors cursor-pointer ${mode === "signup" ? "bg-electric-500/20 text-white" : "text-navy-300 hover:text-white"}`}
            >
              {t("hiring.createWorkspace")}
            </button>
          </div>

          <div className="mt-6 space-y-3">
            {mode === "signup" && (
              <Field label={t("hiring.fullName")}>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Priya Nair" />
              </Field>
            )}
            {mode === "signup" && (
              <Field label={t("hiring.company")}>
                <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder={t("hire.companyPlaceholder")} />
              </Field>
            )}
            <Field label={t("hiring.workEmail")}>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hr@company.in" />
            </Field>
            <Field label={t("hiring.password")}>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </Field>
            {err && <p className="text-sm text-rose-300">{err}</p>}
            <Button className="w-full" onClick={submit} disabled={busy}>
              <Icon name={mode === "login" ? "KeyRound" : "User"} size={15} />
              {busy ? "…" : mode === "login" ? t("hiring.signIn") : t("hiring.createWorkspace")}
            </Button>
            <button
              onClick={() => {
                setErr("");
                setMode(mode === "login" ? "signup" : "login");
              }}
              className="w-full text-center text-xs text-electric-300 hover:text-white cursor-pointer"
            >
              {mode === "login" ? t("hiring.toSignup") : t("hiring.toLogin")}
            </button>

            <div className="mt-6 border-t border-white/10 pt-6">
              <Button
                variant="secondary"
                className="w-full"
                onClick={async () => {
                  const demoEmail = "hr@demo.company";
                  const { listEmployerJobs, saveEmployerJobs } = await import("@/lib/db");
                  
                  const existingJobs = listEmployerJobs(demoEmail);
                  if (existingJobs.length === 0) {
                    const { uid } = await import("@/lib/utils");
                    const { applyToPostedJob } = await import("@/lib/db");
                    const j1 = {
                      id: uid("job"),
                      employerEmail: demoEmail,
                      title: "Frontend Developer",
                      role: "IT & Software",
                      company: "Acme Corp",
                      city: "Bangalore",
                      salary: "₹8L - ₹12L",
                      skills: ["React", "TypeScript", "Tailwind CSS"],
                      hires: 0,
                      createdAt: Date.now(),
                    };
                    const j2 = {
                      id: uid("job"),
                      employerEmail: demoEmail,
                      title: "Marketing Intern",
                      role: "Digital Marketing",
                      company: "Acme Corp",
                      city: "Mumbai",
                      salary: "₹20k/month",
                      skills: ["SEO", "Content Writing", "Social Media"],
                      hires: 0,
                      createdAt: Date.now() - 100000,
                    };
                    saveEmployerJobs(demoEmail, [j1, j2]);
                    
                    // Pre-populate some dummy applicants
                    applyToPostedJob(j1, { name: "Priya Sharma", email: "priya@example.com" });
                    applyToPostedJob(j2, { name: "Rahul Verma", email: "rahul@example.com" });
                  }

                  setEmployerSession({
                    name: "Demo Employer",
                    email: demoEmail,
                    company: "Acme Corp",
                    passwordHash: "demo",
                    createdAt: Date.now(),
                  });
                  router.push("/hiring/employer");
                }}
              >
                <Icon name="TestTube" size={15} /> Try Employer Demo
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="relative overflow-hidden rounded-3xl border border-saffron-500/25 bg-gradient-to-b from-saffron-500/15 via-white/5 to-transparent p-7"
        >
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-saffron-500/20 blur-3xl" />
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-saffron-500 to-brown-500 text-navy-950">
              <Icon name="Briefcase" size={22} />
            </span>
            <div>
              <h2 className="text-xl font-bold text-white">{t("hiring.seeker")}</h2>
              <p className="text-xs text-navy-300">{t("hiring.seekerSub")}</p>
            </div>
          </div>

          <ul className="mt-5 space-y-2 text-sm text-navy-100">
            {[
              t("hiring.seek.1"),
              t("hiring.seek.2"),
              t("hiring.seek.3"),
            ].map((t) => (
              <li key={t} className="flex gap-2.5"><Icon name="CheckCircle2" size={16} className="mt-0.5 shrink-0 text-saffron-400" /> {t}</li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col gap-3">
            <ButtonLink href="/login" variant="warm" className="w-full">
              <Icon name="User" size={15} /> {t("hiring.employeeLogin")}
            </ButtonLink>
            <ButtonLink href="/signup" variant="secondary" className="w-full">
              {t("hiring.createAccount")}
            </ButtonLink>
          </div>

          <div className="mt-5 flex items-center gap-2 rounded-xl border border-mint-400/20 bg-mint-400/5 p-3 text-xs text-navy-200">
            <Icon name="BadgeCheck" size={16} className="shrink-0 text-mint-400" />
            {t("hiring.verified")}
          </div>
        </motion.div>
      </div>

      <section className="mt-16 grid gap-4 md:grid-cols-3">
        {[
          { icon: "ShieldCheck", t: t("hiring.f.1t"), d: t("hiring.f.1d"), c: "text-mint-400" },
          { icon: "Zap", t: t("hiring.f.2t"), d: t("hiring.f.2d"), c: "text-saffron-400" },
          { icon: "IndianRupee", t: t("hiring.f.3t"), d: t("hiring.f.3d"), c: "text-electric-300" },
        ].map((f) => (
          <div key={f.t} className="glass rounded-2xl p-6">
            <Icon name={f.icon as never} size={22} className={f.c} />
            <h3 className="mt-3 font-bold text-white">{f.t}</h3>
            <p className="mt-1 text-sm leading-relaxed text-navy-300">{f.d}</p>
          </div>
        ))}
      </section>
    </PageShell>
  );
}
