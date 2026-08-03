"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/layout/background";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { initials, avatarGradient, cn } from "@/lib/utils";
import { isEmailIdentifier } from "@/lib/db";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { toast } = useStore();
  const { t } = useLang();
  const router = useRouter();
  const [showIdentifier, setShowIdentifier] = useState(false);

  if (!user) {
    return (
      <PageShell>
        <div className="glass mx-auto max-w-md rounded-2xl p-12 text-center">
          <Icon name="User" size={32} className="mx-auto text-navy-400" />
          <p className="mt-4 font-semibold text-white">{t("prof.signInFirst")}</p>
          <a href="/login" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-electric-500 to-sky-glow px-4 py-2.5 text-sm font-medium text-white transition-all hover:brightness-110">
            {t("prof.signInCta")}
          </a>
        </div>
      </PageShell>
    );
  }

  const identifier = user.mobile ?? user.email;
  const isMobile = user.mobile ? true : !isEmailIdentifier(user.email);

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("prof.eyebrow")}
        title={t("prof.title")}
        sub={t("prof.sub")}
        icon="User"
      >
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-navy-200">
          <Icon name="BadgeCheck" size={15} className="text-mint-400" /> {t("prof.verified")}
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <div className="glass rounded-2xl p-6">
          <div className="flex flex-col items-center text-center">
            <span className={cn("grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br text-2xl font-bold text-white", avatarGradient(user.name))}>
              {initials(user.name)}
            </span>
            <p className="mt-4 text-xl font-bold text-white">{user.name}</p>
            <p className="mt-1 text-sm text-navy-300">{user.city} · {user.education}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Badge tone="green">Level {user.level}</Badge>
              <Badge tone="warm">{user.xp} XP</Badge>
            </div>
          </div>

          <div className="mt-6 space-y-3 border-t border-white/10 pt-6">
            <button
              onClick={() => setShowIdentifier((s) => !s)}
              className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/4 px-4 py-3 text-sm transition-colors hover:border-electric-400/40 cursor-pointer"
            >
              <span className="flex items-center gap-2 text-navy-200">
                <Icon name={isMobile ? "Smartphone" : "Mail"} size={15} className="text-electric-300" />
                {isMobile ? "Mobile" : "Email"} sign-in
              </span>
              <span className="flex items-center gap-2 text-navy-300">
                {showIdentifier ? identifier : "••••••••••"}
                <Icon name={showIdentifier ? "EyeOff" : "Eye"} size={15} />
              </span>
            </button>
          </div>

          <button
            onClick={() => {
              logout();
              toast("Signed out", { kind: "info", message: "Your progress stays saved on this device." });
              router.replace("/");
            }}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-300 transition-colors hover:bg-rose-500/20 cursor-pointer"
          >
            <Icon name="LogOut" size={15} /> Sign out
          </button>
        </div>

        <div className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <p className="flex items-center gap-2 font-bold text-white"><Icon name="User" size={17} className="text-electric-300" /> Account details</p>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <ProfileRow label="Full name" value={user.name} />
              <ProfileRow label="City" value={user.city} />
              <ProfileRow label="Education" value={user.education} />
              <ProfileRow label="Member since" value={new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} />
            </dl>
          </div>

          <div className="glass rounded-2xl p-6">
            <p className="flex items-center gap-2 font-bold text-white"><Icon name="Target" size={17} className="text-saffron-400" /> Career profile</p>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <ProfileRow label="Target career" value={user.targetCareer || "Not set yet — take SkillDNA"} />
              <ProfileRow label="Goal" value={user.goalType} />
              <ProfileRow label="Skill level" value={user.skillLevel} />
              <ProfileRow label="Hours / week" value={`${user.hoursPerWeek}`} />
            </dl>
          </div>

          <div className="glass rounded-2xl p-6">
            <p className="flex items-center gap-2 font-bold text-white"><Icon name="Sparkles" size={17} className="text-mint-400" /> Your skills</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {user.skills.length ? (
                user.skills.map((s) => <Badge key={s.name} tone="blue">{s.name} · {s.level}</Badge>)
              ) : (
                <p className="text-sm text-navy-300">No skills added yet — build them via training and SkillDNA.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-navy-400">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-white">{value}</dd>
    </div>
  );
}
