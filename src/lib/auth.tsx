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

export const DEMO_USER: UserProfile = {
  id: "demo_aarav",
  name: "Aarav Sharma",
  email: "aarav@skillindiahub.demo",
  location: "Delhi",
  city: "Delhi",
  education: "Class 12 (CBSE)",
  skillLevel: "Beginner",
  interests: ["creating", "technology"],
  skills: [
    { name: "HTML", level: "Intermediate" },
    { name: "CSS", level: "Intermediate" },
    { name: "Figma", level: "Intermediate" },
    { name: "Canva", level: "Intermediate" },
    { name: "JavaScript", level: "Beginner" },
    { name: "Wireframing", level: "Beginner" },
  ],  careerGoal: "Become a professional UI/UX Designer",
  targetCareer: "UI/UX Designer",
  targetCareerId: "ui-ux-designer",
  goalType: "Internship",
  hoursPerWeek: 15,
  createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
  skilldna: {
    completedAt: Date.now() - 1000 * 60 * 60 * 24 * 14,
    scores: [
      { label: "Creativity", score: 92, icon: "PenTool" },
      { label: "Technology", score: 84, icon: "Cpu" },
      { label: "Problem Solving", score: 78, icon: "BrainCircuit" },
      { label: "Communication", score: 76, icon: "MessageCircle" },
      { label: "Hands-On", score: 71, icon: "Hammer" },
    ],
    matches: [
      {
        id: "ui-ux-designer",
        title: "UI/UX Designer",
        category: "Design",
        match: 92,
        salary: "₹4–12 LPA",
        demand: "High",
        why: { interests: 100, skills: 68, location: 92, experience: 80, problemSolving: 82 },
        reasons: [
          "Your interest in creating and technology maps directly to what UI/UX Designers do every day",
          "You already have core skills — HTML, CSS and Figma — that transfer into this career",
          "Your Class 12 background gives you a strong entry foundation",
          "Strong High demand across your region with salaries from ₹4–12 LPA",
        ],
        skillsNeeded: ["Figma", "HTML", "CSS", "Design Thinking", "Wireframing", "Prototyping"],
        missingSkills: ["Prototyping", "UX Research", "Design Thinking"],
      },
      {
        id: "digital-marketer",
        title: "Digital Marketing Specialist",
        category: "Digital Marketing",
        match: 86,
        salary: "₹3–10 LPA",
        demand: "High",
        why: { interests: 80, skills: 55, location: 92, experience: 78, problemSolving: 75 },
        reasons: [
          "Your interest in creating aligns with content and social media work",
          "Your Canva skills give you a creative edge for marketing assets",
          "Strong High demand for digital marketing across India",
        ],
        skillsNeeded: ["SEO", "Social Media", "Copywriting", "Google Analytics", "Content Creation"],
        missingSkills: ["SEO", "Google Analytics", "Copywriting"],
      },
      {
        id: "web-developer",
        title: "Web Developer",
        category: "IT & Software",
        match: 81,
        salary: "₹3.5–12 LPA",
        demand: "Very High",
        why: { interests: 70, skills: 62, location: 92, experience: 76, problemSolving: 84 },
        reasons: [
          "Your technology interest and JavaScript basics translate well",
          "HTML, CSS and JavaScript give you a running start",
          "Very High demand with strong starting salaries",
        ],
        skillsNeeded: ["HTML", "CSS", "JavaScript", "React", "Git", "SQL"],
        missingSkills: ["React", "Git", "SQL"],
      },
      {
        id: "graphic-designer",
        title: "Graphic Designer",
        category: "Design",
        match: 78,
        salary: "₹2.5–8 LPA",
        demand: "Medium",
        why: { interests: 80, skills: 65, location: 92, experience: 74, problemSolving: 68 },
        reasons: [
          "Your strong creativity score and Canva skill fit graphic design",
          "Visual design is your natural language",
        ],
        skillsNeeded: ["Canva", "Photoshop", "Illustrator", "Typography", "Branding"],
        missingSkills: ["Photoshop", "Illustrator"],
      },
      {
        id: "content-creator",
        title: "Content Creator",
        category: "Digital Marketing",
        match: 74,
        salary: "₹2–12 LPA",
        demand: "High",
        why: { interests: 60, skills: 58, location: 92, experience: 72, problemSolving: 65 },
        reasons: ["Your creativity and communication scores support content work"],
        skillsNeeded: ["Content Creation", "Video Editing", "Copywriting", "Social Media"],
        missingSkills: ["Video Editing", "Copywriting"],
      },
    ],
    topCareer: {
      id: "ui-ux-designer",
      title: "UI/UX Designer",
      category: "Design",
      match: 92,
      salary: "₹4–12 LPA",
      demand: "High",
      why: { interests: 100, skills: 68, location: 92, experience: 80, problemSolving: 82 },
      reasons: [],
      skillsNeeded: ["Figma", "HTML", "CSS", "Design Thinking", "Wireframing", "Prototyping"],
      missingSkills: ["Prototyping", "UX Research", "Design Thinking"],
    },
    summary:
      "A natural beginner in Delhi, your strongest signal is creating and technology. You align most with UI/UX Designer at 92% because your interests, current skills and learning capacity fit the role's core demands. Your immediate focus: close the gap on Prototyping and UX Research through targeted training, then build 2 portfolio projects to unlock internships.",
    answers: {
      enjoys: ["creating", "technology"],
      skillLevel: "Beginner",
      location: "Delhi",
      education: "Class 12",
      goal: "Internship",
      hours: 15,
      interest: "Design",
    },
  },
  xp: 1250,
  level: 3,
  badges: ["first-step", "course-complete", "resume-ready", "passport-holder"],
  resumeHealth: 87,
  avatarColor: "from-electric-500 to-sky-glow",
};

export const GUEST_USER: UserProfile = {
  id: "guest",
  name: "Guest Explorer",
  email: "guest@skillindiahub.in",
  location: "India",
  city: "Delhi",
  education: "Class 12",
  skillLevel: "Beginner",
  interests: [],
  skills: [],
  careerGoal: "",
  targetCareer: "",
  targetCareerId: "",
  goalType: "Career Exploration",
  hoursPerWeek: 8,
  createdAt: Date.now(),
  skilldna: null,
  xp: 0,
  level: 1,
  badges: [],
  resumeHealth: 0,
  avatarColor: "from-electric-500 to-sky-glow",
};

type AuthContextType = {
  user: UserProfile | null;
  isHydrated: boolean;
  login: (data: { name: string; identifier: string; password: string }) => Promise<{ ok: boolean; error?: string }>;
  signup: (data: { name: string; identifier: string; password: string; city: string; education: string }) => Promise<{ ok: boolean; error?: string }>;
  demoLogin: () => void;
  guestLogin: () => void;
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
        ...DEMO_USER,
        id: uid("user"),
        name: account.name,
        email: account.email,
        mobile: account.mobile,
        city: account.city,
        location: account.city,
        education: account.education,
        skilldna: null,
        targetCareer: "",
        targetCareerId: "",
        careerGoal: "",
        badges: [],
        xp: 0,
        level: 1,
        resumeHealth: 0,
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

  const demoLogin = useCallback(() => {
    persist({ ...DEMO_USER, id: "demo_aarav", email: "aarav@skillindiahub.demo" });
  }, [persist]);

  const guestLogin = useCallback(() => {
    persist({ ...GUEST_USER, id: uid("guest"), name: "Guest Explorer", createdAt: Date.now() });
  }, [persist]);

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
      demoLogin,
      guestLogin,
      logout,
      updateProfile,
      setSkillDNA,
      addXp,
      awardBadge,
    }),
    [user, isHydrated, login, signup, demoLogin, guestLogin, logout, updateProfile, setSkillDNA, addXp, awardBadge, writeSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
