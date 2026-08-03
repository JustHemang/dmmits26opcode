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
import type { SkillDNAResult, SkillEntry, UserProfile } from "@/types";
import { uid } from "@/lib/utils";
import { createAccount, verifyLogin, type AccountRecord } from "@/lib/db";

const AUTH_KEY = "sih_auth_user";
const PROGRESS_PREFIX = "sih_progress_";

function accountKeyOf(u: { email?: string; mobile?: string }): string {
  const id = (u.email ?? u.mobile ?? "").toLowerCase().trim();
  return id.replace(/[^a-z0-9@.]/gi, "_");
}

function extractProgress(prev: UserProfile): Partial<UserProfile> {
  return {
    skilldna: prev.skilldna,
    skills: prev.skills,
    interests: prev.interests,
    targetCareer: prev.targetCareer,
    targetCareerId: prev.targetCareerId,
    careerGoal: prev.careerGoal,
    goalType: prev.goalType,
    hoursPerWeek: prev.hoursPerWeek,
    skillLevel: prev.skillLevel,
    xp: prev.xp,
    level: prev.level,
    badges: prev.badges,
    resumeHealth: prev.resumeHealth,
  };
}

function loadProgressRecord(key: string): UserProfile | null {
  try {
    const raw = localStorage.getItem(PROGRESS_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserProfile;
    return parsed && parsed.id ? parsed : null;
  } catch {
    return null;
  }
}


type AuthContextType = {
  user: UserProfile | null;
  isHydrated: boolean;
  login: (data: { name: string; identifier: string; password: string }) => Promise<{ ok: boolean; error?: string }>;
  signup: (data: { name: string; identifier: string; password: string; city: string; education: string }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  setSkillDNA: (result: SkillDNAResult) => void;
  addXp: (amount: number) => void;
  awardBadge: (badgeId: string) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.id) setUser(parsed);
      }
    } catch {
      // ignore corrupt storage
    }
    setIsHydrated(true);
  }, []);

  const persist = useCallback((next: UserProfile | null) => {
    setUser(next);
    if (next) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(next));
      try {
        localStorage.setItem(PROGRESS_PREFIX + accountKeyOf(next), JSON.stringify(next));
      } catch {
        // ignore storage quota errors
      }
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  }, []);

  const login = useCallback(
    async (data: { name: string; identifier: string; password: string }) => {
      await new Promise((r) => setTimeout(r, 650));
      if (data.name.trim().length < 2) {
        return { ok: false, error: "Enter the full name you used to create your account." };
      }
      const res = verifyLogin(data.identifier, data.password);
      if (!res.ok) return res;
      const account = res.account;
      if (account.name.trim().toLowerCase() !== data.name.trim().toLowerCase()) {
        return { ok: false, error: "The name you entered doesn't match this account." };
      }
      let progress: Partial<UserProfile> = {};
      try {
        const prev = loadProgressRecord(accountKeyOf({ email: account.email, mobile: account.mobile }));
        if (prev) {
          progress = extractProgress(prev);
        } else {
          const raw = localStorage.getItem(AUTH_KEY);
          if (raw) {
            const prevSession = JSON.parse(raw) as UserProfile;
            const sameAccount =
              prevSession.email === account.email || (account.mobile && prevSession.mobile === account.mobile);
            if (prevSession && prevSession.id && sameAccount) {
              progress = extractProgress(prevSession);
            }
          }
        }
      } catch {
        // ignore malformed stored session
      }
      const newUser: UserProfile = {
        id: uid("user"),
        name: account.name,
        email: account.email,
        mobile: account.mobile,
        location: account.city,
        city: account.city,
        education: account.education,
        skillLevel: "Beginner",
        interests: [],
        skills: [],
        careerGoal: "",
        targetCareer: "",
        targetCareerId: "",
        goalType: "Career Exploration",
        hoursPerWeek: 10,
        createdAt: Date.now(),
        skilldna: null,
        xp: 0,
        level: 1,
        badges: [],
        resumeHealth: 0,
        avatarColor: "from-electric-500 to-sky-glow",
        ...progress,
      };
      persist(newUser);
      return { ok: true };
    },
    [persist]
  );

  const signup = useCallback(
    async (data: { name: string; identifier: string; password: string; city: string; education: string }) => {
      await new Promise((r) => setTimeout(r, 850));
      const res = createAccount({
        name: data.name,
        identifier: data.identifier,
        password: data.password,
        city: data.city,
        education: data.education,
      });
      if (!res.ok) return res;
      const acc: AccountRecord = res.record;
      const newUser: UserProfile = {
        id: uid("user"),
        name: acc.name,
        email: acc.email,
        mobile: acc.mobile,
        location: acc.city,
        city: acc.city,
        education: acc.education,
        skillLevel: "Beginner",
        interests: [],
        skills: [],
        careerGoal: "",
        targetCareer: "",
        targetCareerId: "",
        goalType: "Career Exploration",
        hoursPerWeek: 10,
        createdAt: Date.now(),
        skilldna: null,
        xp: 0,
        level: 1,
        badges: [],
        resumeHealth: 0,
        avatarColor: "from-electric-500 to-sky-glow",
      };
      persist(newUser);
      return { ok: true };
    },
    [persist]
  );

  const logout = useCallback(() => persist(null), [persist]);

  const writeSession = useCallback((next: UserProfile) => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(next));
    try {
      localStorage.setItem(PROGRESS_PREFIX + accountKeyOf(next), JSON.stringify(next));
    } catch {
      // ignore storage quota errors
    }
  }, []);

  const updateProfile = useCallback(
    (patch: Partial<UserProfile>) => {
      setUser((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...patch };
        writeSession(next);
        return next;
      });
    },
    []
  );

  const setSkillDNA = useCallback(
    (result: SkillDNAResult) => {
      setUser((prev) => {
        if (!prev) return prev;
        const top = result.topCareer;
        const next: UserProfile = {
          ...prev,
          skilldna: result,
          targetCareer: top.title,
          targetCareerId: top.id,
          careerGoal: `Become a professional ${top.title}`,
          interests: result.answers.enjoys,
          skillLevel: result.answers.skillLevel as UserProfile["skillLevel"],
          goalType: result.answers.goal as UserProfile["goalType"],
          hoursPerWeek: result.answers.hours,
        };
        writeSession(next);
        return next;
      });
    },
    []
  );

  const addXp = useCallback((amount: number) => {
    setUser((prev) => {
      if (!prev) return prev;
      const xp = prev.xp + amount;
      const level = Math.floor(xp / 500) + 1;
      const next = { ...prev, xp, level };
      writeSession(next);
      return next;
    });
  }, []);

  const awardBadge = useCallback((badgeId: string) => {
    setUser((prev) => {
      if (!prev || prev.badges.includes(badgeId)) return prev;
      const next = { ...prev, badges: [...prev.badges, badgeId] };
      writeSession(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      isHydrated,
      login,
      signup,
      logout,
      updateProfile,
      setSkillDNA,
      addXp,
      awardBadge,
    }),
    [user, isHydrated, login, signup, logout, updateProfile, setSkillDNA, addXp, awardBadge, writeSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
