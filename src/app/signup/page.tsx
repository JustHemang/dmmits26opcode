"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { Button, Input, Select, Field, Logo } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { HumanCheck } from "@/components/ui/human-check";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useLang } from "@/lib/i18n";
import { CITIES } from "@/lib/data/cities";
import { cn } from "@/lib/utils";

const CITY_OTHER = "__other__";
const EDU_OTHER = "__other__";

const EDUCATION_OPTIONS = [
  "Class 10",
  "Class 12",
  "ITI / Diploma",
  "B.Tech / B.E.",
  "B.Sc",
  "B.Com / BBA",
  "BA",
  "Graduate",
  "Post Graduate",
];

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const { toast } = useStore();
  const { t } = useLang();
  const [mode, setMode] = useState<"mobile" | "email">("mobile");
  const [form, setForm] = useState({
    name: "",
    identifier: "",
    password: "",
    city: "",
    cityCustom: "",
    education: "Class 12",
    educationCustom: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [human, setHuman] = useState(false);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const cityValue = form.city === CITY_OTHER ? form.cityCustom.trim() : form.city;
  const eduValue = form.education === EDU_OTHER ? form.educationCustom.trim() : form.education;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signup({
      name: form.name,
      identifier: form.identifier,
      password: form.password,
      city: cityValue || "Delhi",
      education: eduValue || "Class 12",
    });
    setLoading(false);
    if (!res.ok) {
      toast("Unable to create account", { kind: "error", message: res.error });
      return;
    }
    toast("Account created! 🎉", { message: `Welcome, ${form.name.split(" ")[0]}. Your account is saved securely.` });
    router.replace("/skilldna");
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="fixed right-4 top-4 z-50">
        <LanguageSwitcher align="right" showShort />
      </div>
      <div className="relative flex items-center justify-center px-4 py-14 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link href="/"><Logo size="lg" /></Link>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl font-bold tracking-tight text-white">{t("signup.title")}</h1>
            <p className="mt-2 text-navy-300">
              {t("signup.have")}{" "}
              <Link href="/login" className="font-semibold text-electric-300 hover:text-white">Sign in</Link>
            </p>
          </motion.div>

          <div className="mt-7 grid grid-cols-2 gap-1.5 rounded-2xl border border-white/10 bg-white/4 p-1.5">
            {(
              [
                { id: "mobile", label: t("signup.tab.mobile"), icon: "Smartphone" },
                { id: "email", label: t("signup.tab.email"), icon: "Mail" },
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
            <Field label={t("signup.name")}>
              <div className="relative">
                <Icon name="User" size={16} className="pointer-events-none absolute left-3.5 top-3.5 text-navy-400" />
                <Input type="text" value={form.name} onChange={update("name")} placeholder="e.g. Priya Verma" className="pl-10" required />
              </div>
            </Field>
            <Field label={mode === "mobile" ? t("signup.mobile") : t("signup.email")}>
              <div className="relative">
                <Icon name={mode === "mobile" ? "Smartphone" : "Mail"} size={16} className="pointer-events-none absolute left-3.5 top-3.5 text-navy-400" />
                <Input
                  type={mode === "mobile" ? "tel" : "text"}
                  value={form.identifier}
                  onChange={update("identifier")}
                  placeholder={mode === "mobile" ? t("signup.mobilePlaceholder") : t("signup.emailPlaceholder")}
                  className="pl-10"
                  inputMode={mode === "mobile" ? "numeric" : "email"}
                  autoComplete={mode === "mobile" ? "tel" : "email"}
                  required
                />
              </div>
            </Field>
            <Field label={t("signup.password")}>
              <div className="relative">
                <Icon name="Lock" size={16} className="pointer-events-none absolute left-3.5 top-3.5 text-navy-400" />
                <Input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={update("password")}
                  placeholder={t("signup.pwHint")}
                  className="pl-10 pr-10"
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
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("signup.city")}>
                <Select
                  value={form.city || (CITIES.length ? "" : CITY_OTHER)}
                  onChange={(e) => {
                    update("city")(e);
                    if (e.target.value === CITY_OTHER) setForm((f) => ({ ...f, cityCustom: "" }));
                  }}
                >
                  <option value="">{t("signup.cityPlaceholder")}</option>
                  {CITIES.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}, {c.state}</option>
                  ))}
                  <option value={CITY_OTHER}>{t("signup.cityOther")}</option>
                </Select>
              </Field>
              <Field label={t("signup.education")}>
                <Select
                  value={form.education}
                  onChange={(e) => {
                    update("education")(e);
                    if (e.target.value === EDU_OTHER) setForm((f) => ({ ...f, educationCustom: "" }));
                  }}
                >
                  {EDUCATION_OPTIONS.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                  <option value={EDU_OTHER}>{t("signup.educationOther")}</option>
                </Select>
              </Field>
            </div>
            {form.city === CITY_OTHER && (
              <Field label={t("signup.cityOther")}>
                <Input type="text" value={form.cityCustom} onChange={update("cityCustom")} placeholder="e.g. Ratnagiri" required />
              </Field>
            )}
            {form.education === EDU_OTHER && (
              <Field label={t("signup.educationOther")}>
                <Input type="text" value={form.educationCustom} onChange={update("educationCustom")} placeholder="e.g. Chartered Accountant" required />
              </Field>
            )}

            <HumanCheck onValidChange={setHuman} />

            <Button type="submit" className="w-full" size="lg" disabled={loading || !human}>
              {loading ? (
                <><Icon name="LoaderCircle" size={17} className="animate-spin" /> {t("signup.submitting")}…</>
              ) : (
                <><Icon name="Sparkles" size={17} /> {t("signup.submit")}</>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs leading-relaxed text-navy-400">
            {t("signup.terms")}
          </p>
          <p className="mt-4 text-center text-xs text-navy-400">© 2026 Skill India Hub · Made by Devansh Mehta & Hemang Luthra</p>
        </div>
      </div>

      <div className="relative hidden overflow-hidden border-l border-white/10 lg:block">
        <div className="absolute inset-0" aria-hidden="true">
          <div className="grid-bg absolute inset-0 opacity-60" />
          <div className="absolute right-0 top-1/4 h-[420px] w-[420px] rounded-full bg-electric-500/15 blur-[120px]" />
          <div className="absolute bottom-0 right-1/3 h-[300px] w-[300px] rounded-full bg-saffron-500/10 blur-[110px]" />
        </div>
        <div className="relative flex h-full flex-col items-end justify-between p-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-electric-400/30 bg-electric-500/10 px-4 py-1.5 text-xs font-medium text-electric-300">
            <Icon name="Sparkles" size={13} /> Free forever for Indian youth
          </span>
          <div className="text-right">
            <h2 className="text-4xl font-bold leading-tight text-white">
              Your path to a <span className="text-gradient-warm">career you&apos;ll love</span>
            </h2>
            <p className="ml-auto mt-4 max-w-sm text-navy-300">
              Join 2M+ young Indians discovering their skills, closing their gaps, and launching careers with AI guidance. Your account is stored securely and can&apos;t be changed once created.
            </p>
            <div className="mt-6 flex items-center justify-end gap-2 text-xs text-navy-400">
              <Icon name="Users" size={14} className="text-electric-300" />
              New jobs & internships added daily
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
