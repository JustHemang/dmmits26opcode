"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { PageShell } from "@/components/layout/background";
import { PageHeader } from "@/components/ui/page-header";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { careerResponse, quickMessages } from "@/lib/ai/engine";
import { uid } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import type { ChatMessage } from "@/types";

export default function CopilotPage() {
  const { user } = useAuth();
  const { chat, sendChat, resetChat } = useStore();
  const { t, isHindi } = useLang();
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, thinking]);

  const ask = (text: string) => {
    const q = text.trim();
    if (!q || !user || thinking) return;
    sendChat({ id: uid("m"), role: "user", text: q });
    setInput("");
    setThinking(true);
    setTimeout(() => {
      sendChat({ id: uid("m"), role: "bot", text: careerResponse(user, q, isHindi) });
      setThinking(false);
    }, 900);
  };

  const messages: ChatMessage[] = user ? chat : [];

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("copilot.eyebrow")}
        title={t("copilot.title")}
        sub={t("copilot.sub")}
        icon="Bot"
      >
        <button
          onClick={resetChat}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs text-navy-300 transition-colors hover:bg-white/5 hover:text-white cursor-pointer"
        >
          <Icon name="RefreshCcw" size={13} /> {t("copilot.clearChat")}
        </button>
      </PageHeader>

      <div className="mx-auto max-w-3xl">
        <div className="glass flex h-[540px] flex-col rounded-3xl">
          <div className="flex items-center gap-3 border-b border-white/10 px-5 py-3.5">
            <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-electric-500 to-sky-glow text-white">
              <Icon name="Bot" size={18} />
              <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-navy-900 bg-mint-400" />
            </span>
            <div>
              <p className="text-sm font-bold text-white">{t("copilot.title")}</p>
              <p className="text-[11px] text-navy-400">{t("copilot.online")}</p>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 scrollbar-none">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-electric-500/15 text-electric-300">
                  <Icon name="Sparkles" size={24} />
                </span>
                <p className="mt-4 font-semibold text-white">{t("copilot.greeting")}{user ? `, ${user.name.split(" ")[0]}` : ""} 👋</p>
                <p className="mt-1 max-w-xs text-sm text-navy-300">
                  {t("copilot.intro")}
                </p>
              </div>
            )}

            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[80%] rounded-2xl rounded-br-sm bg-gradient-to-r from-electric-500 to-sky-glow px-4 py-2.5 text-sm text-white"
                      : "max-w-[85%] rounded-2xl rounded-bl-sm border border-white/10 bg-white/5 px-4 py-2.5 text-sm leading-relaxed text-navy-100"
                  }
                >
                  {m.text}
                </div>
              </motion.div>
            ))}

            {thinking && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-white/10 bg-white/5 px-4 py-3">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-electric-300" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-electric-300" style={{ animationDelay: "0.12s" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-electric-300" style={{ animationDelay: "0.24s" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-white/10 p-3">
            <div className="mb-2 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {quickMessages(user!, isHindi).slice(0, 4).map((q) => (
                <button
                  key={q}
                  onClick={() => ask(q)}
                  className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-navy-200 transition-colors hover:border-electric-400/40 hover:text-white cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                ask(input);
              }}
              className="flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("copilot.placeholder")}
                className="h-12 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-navy-400 focus:border-electric-400 focus:outline-none"
                aria-label="Ask Career Copilot"
              />
              <button
                type="submit"
                disabled={!input.trim() || thinking}
                aria-label="Send message"
                className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-r from-electric-500 to-sky-glow text-white shadow-glow-blue transition-all hover:brightness-110 disabled:opacity-40 cursor-pointer"
              >
                <Icon name="Send" size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
