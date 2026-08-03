"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Application, Notification, Quest, ResumeData, Roadmap, ChatMessage } from "@/types";
import { QUESTS } from "@/lib/data/meta";
import { uid } from "@/lib/utils";

const SAVE_KEY = "sih_saved";
const APP_KEY = "sih_applications";
const NOTIF_KEY = "sih_notifications";
const ROADMAP_KEY = "sih_roadmap";
const RESUME_KEY = "sih_resume";
const QUEST_KEY = "sih_quests";
const CHAT_KEY = "sih_chat";
const COURSES_KEY = "sih_courses";

type Toast = { id: string; title: string; message?: string; kind: "success" | "info" | "warn" | "error" };

type StoreType = {
  saved: string[];
  toggleSaved: (id: string) => void;
  isSaved: (id: string) => boolean;
  applications: Application[];
  applyTo: (a: Omit<Application, "id" | "status" | "updatedAt">) => void;
  updateApplication: (id: string, status: Application["status"]) => void;
  markOpportunitySelected: (opportunityId: string) => void;
  removeApplication: (id: string) => void;
  isApplied: (id: string) => boolean;
  notifications: Notification[];
  markNotificationsRead: () => void;
  markNotificationRead: (id: string) => void;
  pushNotification: (n: Omit<Notification, "id" | "read">) => void;
  unreadCount: number;
  roadmap: Roadmap | null;
  setRoadmap: (r: Roadmap) => void;
  toggleTask: (monthIndex: number, taskId: string) => void;
  resume: ResumeData | null;
  setResume: (r: ResumeData) => void;
  quests: Quest[];
  completeQuest: (id: string) => void;
  completedCourses: string[];
  addCompletedCourse: (id: string) => void;
  chat: ChatMessage[];
  sendChat: (m: ChatMessage) => void;
  resetChat: () => void;
  toasts: Toast[];
  toast: (title: string, opts?: { message?: string; kind?: Toast["kind"] }) => void;
  dismissToast: (id: string) => void;
};

const StoreContext = createContext<StoreType | null>(null);

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<string[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [roadmap, setRoadmapState] = useState<Roadmap | null>(null);
  const [resume, setResumeState] = useState<ResumeData | null>(null);
  const [quests, setQuests] = useState<Quest[]>(QUESTS);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [completedCourses, setCompletedCourses] = useState<string[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSaved(load(SAVE_KEY, []));
    setApplications(load(APP_KEY, []));
    setNotifications(load<Notification[]>(NOTIF_KEY, []));
    setRoadmapState(load(ROADMAP_KEY, null));
    setResumeState(load(RESUME_KEY, null));
    setQuests(load(QUEST_KEY, QUESTS));
    setChat(load(CHAT_KEY, []));
    setCompletedCourses(load(COURSES_KEY, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === APP_KEY) setApplications(load(APP_KEY, []));
      if (e.key === NOTIF_KEY) setNotifications(load<Notification[]>(NOTIF_KEY, []));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(SAVE_KEY, JSON.stringify(saved));
  }, [saved, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(APP_KEY, JSON.stringify(applications));
  }, [applications, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(NOTIF_KEY, JSON.stringify(notifications));
  }, [notifications, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    if (roadmap) localStorage.setItem(ROADMAP_KEY, JSON.stringify(roadmap));
  }, [roadmap, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    if (resume) localStorage.setItem(RESUME_KEY, JSON.stringify(resume));
  }, [resume, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(QUEST_KEY, JSON.stringify(quests));
  }, [quests, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(CHAT_KEY, JSON.stringify(chat));
  }, [chat, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(COURSES_KEY, JSON.stringify(completedCourses));
  }, [completedCourses, hydrated]);

  const toast = useCallback((title: string, opts?: { message?: string; kind?: Toast["kind"] }) => {
    const id = uid("toast");
    setToasts((prev) => [...prev.slice(-3), { id, title, message: opts?.message, kind: opts?.kind ?? "success" }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleSaved = useCallback(
    (id: string) => {
      setSaved((prev) => {
        const has = prev.includes(id);
        toast(has ? "Removed from saved" : "Saved to opportunities", {
          kind: has ? "info" : "success",
          message: has ? "You can find it under Saved Opportunities." : "Saved for later — find it under Saved Opportunities.",
        });
        return has ? prev.filter((s) => s !== id) : [...prev, id];
      });
    },
    [toast]
  );

  const isSaved = useCallback((id: string) => saved.includes(id), [saved]);

  const applyTo = useCallback(
    (a: Omit<Application, "id" | "status" | "updatedAt">) => {
      setApplications((prev) => {
        if (prev.some((p) => p.opportunityId === a.opportunityId)) {
          toast("Already applied", { kind: "info", message: "You've already applied to this opportunity." });
          return prev;
        }
        toast("Application submitted!", { message: "Track its status in the Application Tracker." });
        return [{ ...a, id: uid("app"), status: "Applied", updatedAt: Date.now() }, ...prev];
      });
    },
    [toast]
  );

  const updateApplication = useCallback((id: string, status: Application["status"]) => {
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status, updatedAt: Date.now() } : a)));
  }, []);

  const markOpportunitySelected = useCallback((opportunityId: string) => {
    setApplications((prev) =>
      prev.map((a) =>
        a.opportunityId === opportunityId && a.status !== "Selected" ? { ...a, status: "Selected", updatedAt: Date.now() } : a
      )
    );
  }, []);

  const removeApplication = useCallback((id: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const isApplied = useCallback((id: string) => applications.some((a) => a.opportunityId === id), [applications]);

  const markNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const pushNotification = useCallback((n: Omit<Notification, "id" | "read">) => {
    setNotifications((prev) => [{ ...n, id: uid("n"), read: false }, ...prev].slice(0, 20));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const setRoadmap = useCallback((r: Roadmap) => setRoadmapState(r), []);

  const toggleTask = useCallback(
    (monthIndex: number, taskId: string) => {
      setRoadmapState((prev) => {
        if (!prev) return prev;
        const months = prev.months.map((m, mi) =>
          mi === monthIndex
            ? { ...m, tasks: m.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)) }
            : m
        );
        const all = months.flatMap((m) => m.tasks);
        const next = { ...prev, months, completedTasks: all.filter((t) => t.done).length };
        return next;
      });
    },
    []
  );

  const setResume = useCallback((r: ResumeData) => setResumeState(r), []);

  const completeQuest = useCallback(
    (id: string) => {
      setQuests((prev) => {
        if (prev.find((q) => q.id === id)?.completed) return prev;
        return prev.map((q) => (q.id === id ? { ...q, completed: true } : q));
      });
    },
    []
  );

  const addCompletedCourse = useCallback((id: string) => {
    setCompletedCourses((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const sendChat = useCallback((m: ChatMessage) => {
    setChat((prev) => [...prev.slice(-40), m]);
  }, []);

  const resetChat = useCallback(() => setChat([]), []);

  const value = useMemo(
    () => ({
      saved,
      toggleSaved,
      isSaved,
      applications,
      applyTo,
      updateApplication,
      markOpportunitySelected,
      removeApplication,
      isApplied,
      notifications,
      markNotificationsRead,
      markNotificationRead,
      pushNotification,
      unreadCount,
      roadmap,
      setRoadmap,
      toggleTask,
      resume,
      setResume,
      quests,
      completeQuest,
      completedCourses,
      addCompletedCourse,
      chat,
      sendChat,
      resetChat,
      toasts,
      toast,
      dismissToast,
    }),
    [
      saved, toggleSaved, isSaved, applications, applyTo, updateApplication, markOpportunitySelected, removeApplication, isApplied,
      notifications, markNotificationsRead, markNotificationRead, pushNotification, unreadCount,
      roadmap, setRoadmap, toggleTask, resume, setResume, quests, completeQuest, completedCourses, addCompletedCourse,
      chat, sendChat, resetChat, toasts, toast, dismissToast,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
