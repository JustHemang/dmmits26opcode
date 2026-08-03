import type { Badge, Quest, Notification, CareerCategory } from "@/types";
import { CATEGORIES } from "./careers";

export const BADGES: Badge[] = [
  { id: "first-step", name: "First Step", description: "Completed your SkillDNA assessment", icon: "Footprints", xp: 150 },
  { id: "course-complete", name: "Course Complete", description: "Finished your first training module", icon: "GraduationCap", xp: 200 },
  { id: "project-builder", name: "Project Builder", description: "Added your first project to your resume", icon: "Hammer", xp: 250 },
  { id: "resume-ready", name: "Resume Ready", description: "Generated your AI resume", icon: "FileText", xp: 300 },
  { id: "career-launch", name: "Career Launch", description: "Applied to your first opportunity", icon: "Rocket", xp: 400 },
  { id: "skill-quest", name: "Skill Seeker", description: "Completed your first Skill Quest", icon: "Target", xp: 150 },
  { id: "passport-holder", name: "Passport Holder", description: "Created your Digital Skill Passport", icon: "BadgeCheck", xp: 200 },
  { id: "radar-on", name: "Radar On", description: "Explored the Opportunity Radar", icon: "Radar", xp: 100 },
];

export const QUESTS: Quest[] = [
  { id: "q1", name: "Complete SkillDNA", description: "Discover your career matches with the AI quiz", xp: 150, icon: "Sparkles", completed: false },
  { id: "q2", name: "Complete a Training", description: "Finish one recommended training module", xp: 200, icon: "GraduationCap", completed: false },
  { id: "q3", name: "Build a Project", description: "Add a project to your AI Resume Builder", xp: 250, icon: "Hammer", completed: false },
  { id: "q4", name: "Earn a Certification", description: "Add a certification to your Skill Passport", xp: 200, icon: "Award", completed: false },
  { id: "q5", name: "Create Your Resume", description: "Generate your AI-optimized resume", xp: 300, icon: "FileText", completed: false },
  { id: "q6", name: "Apply for an Opportunity", description: "Apply to a matched job or internship", xp: 350, icon: "Rocket", completed: false },
];

export const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    title: "New career match found",
    body: "UI/UX Designer now matches you at 92%. Your Figma and design interest align perfectly.",
    time: "2h ago",
    read: false,
    kind: "match",
  },
  {
    id: "n2",
    title: "Skill gap detected",
    body: "Adding 'Prototyping' to your skills could unlock 18% more internships in Bengaluru.",
    time: "5h ago",
    read: false,
    kind: "skill",
  },
  {
    id: "n3",
    title: "3 internships near you",
    body: "Flipkart Labs and Coursera India posted design internships in your preferred city.",
    time: "1d ago",
    read: true,
    kind: "opportunity",
  },
  {
    id: "n4",
    title: "Resume health is 87/100",
    body: "Adding a project boosts your score to 94. Try the AI Resume Builder.",
    time: "1d ago",
    read: true,
    kind: "resume",
  },
  {
    id: "n5",
    title: "Milestone unlocked",
    body: "You've completed 2 steps of your Career Roadmap. Keep the momentum going!",
    time: "2d ago",
    read: false,
    kind: "milestone",
  },
];

export function categoriesWithMeta(): CareerCategory[] {
  return CATEGORIES.map((c) => ({
    ...c,
    careers: c.careers,
    icon: c.icon,
    color: c.color,
  }));
}
