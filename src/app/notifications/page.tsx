"use client";

import { useStore } from "@/lib/store";
import { PageShell } from "@/components/layout/background";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const KIND_ICON: Record<string, { icon: string; color: string }> = {
  match: { icon: "Target", color: "text-mint-400 bg-mint-400/10" },
  skill: { icon: "Lightbulb", color: "text-saffron-400 bg-saffron-400/10" },
  opportunity: { icon: "Briefcase", color: "text-electric-300 bg-electric-500/10" },
  milestone: { icon: "Trophy", color: "text-violet-400 bg-violet-400/10" },
  resume: { icon: "FileText", color: "text-rose-300 bg-rose-400/10" },
};

export default function NotificationsPage() {
  const { notifications, markNotificationsRead, markNotificationRead, toast } = useStore();
  const { t } = useLang();

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("notif.eyebrow")}
        title={t("notif.title")}
        sub={t("notif.sub")}
        icon="Bell"
      >
        {notifications.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              markNotificationsRead();
              toast("All caught up", { kind: "info", message: "Every notification is marked as read." });
            }}
          >
            <Icon name="CheckCheck" size={15} /> Mark all as read
          </Button>
        )}
      </PageHeader>

      {notifications.length ? (
        <div className="space-y-3">
          {notifications.map((n) => {
            const style = KIND_ICON[n.kind] ?? { icon: "Bell", color: "text-electric-300 bg-electric-500/10" };
            return (
              <button
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={cn(
                  "flex w-full items-start gap-4 rounded-2xl border p-5 text-left transition-colors cursor-pointer",
                  n.read ? "border-white/8 bg-white/2" : "border-electric-400/30 bg-electric-500/8 hover:bg-electric-500/12"
                )}
              >
                <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl", style.color)}>
                  <Icon name={style.icon} size={19} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className={cn("font-bold", n.read ? "text-navy-200" : "text-white")}>{n.title}</p>
                    {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-electric-400" />}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-navy-300">{n.body}</p>
                  <p className="mt-2 text-xs text-navy-500">{n.time}</p>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="glass rounded-2xl p-12 text-center">
          <Icon name="BellOff" size={32} className="mx-auto text-navy-400" />
          <p className="mt-4 font-semibold text-white">You're all caught up</p>
          <p className="mt-1 text-sm text-navy-300">New matches and alerts will appear here as you explore the hub.</p>
        </div>
      )}
    </PageShell>
  );
}
