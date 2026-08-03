export type UserProfile = {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  location: string;
  city: string;
  education: string;
  skillLevel: "Beginner" | "Intermediate" | "Advanced" | "Professional";
  interests: string[];
  skills: SkillEntry[];
  careerGoal: string;
  targetCareer: string;
  targetCareerId: string;
  goalType: "Training" | "Internship" | "Job" | "Career Exploration" | "Apprenticeship";
  hoursPerWeek: number;
  createdAt: number;
  skilldna: SkillDNAResult | null;
  xp: number;
  level: number;
  badges: string[];
  resumeHealth: number;
  avatarColor: string;
};

export type SkillEntry = {
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Professional";
};

export type CareerMatch = {
  id: string;
  title: string;
  category: string;
  match: number;
  salary: string;
  demand: string;
  why: {
    interests: number;
    skills: number;
    location: number;
    experience: number;
    problemSolving: number;
  };
  reasons: string[];
  skillsNeeded: string[];
  missingSkills: string[];
};

export type SkillDNAAnswer = {
  enjoys: string[];
  skillLevel: string;
  location: string;
  education: string;
  goal: string;
  hours: number;
  interest: string;
};

export type SkillDNAResult = {
  completedAt: number;
  scores: { label: string; score: number; icon?: string }[];
  matches: CareerMatch[];
  topCareer: CareerMatch;
  summary: string;
  answers: SkillDNAAnswer;
};

export type RoadmapTask = {
  id: string;
  label: string;
  type: "Learn" | "Project" | "Certification" | "Internship" | "Application";
  done: boolean;
  link?: string;
};

export type RoadmapMonth = {
  month: number;
  title: string;
  goal: string;
  tasks: RoadmapTask[];
};

export type Roadmap = {
  career: string;
  months: RoadmapMonth[];
  totalTasks: number;
  completedTasks: number;
};

export type SkillGapItem = {
  skill: string;
  requiredLevel: number;
  currentLevel: number;
  status: "met" | "partial" | "gap";
  learningResource?: string;
};

export type TrainingProgram = {
  id: string;
  title: string;
  provider: string;
  category: string;
  location: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  cost: "Free" | "Paid" | "Stipend Paid";
  skills: string[];
  rating: number;
  aiMatch: number;
  seats: number;
  description: string;
  tags: string[];
};

export type Internship = {
  id: string;
  title: string;
  company: string;
  email: string;
  category: string;
  location: string;
  remote: boolean;
  duration: string;
  paid: boolean;
  stipend: string;
  skills: string[];
  level: "Beginner" | "Intermediate" | "Advanced";
  aiMatch: number;
  description: string;
  applicants: number;
};

export type Job = {
  id: string;
  title: string;
  company: string;
  email: string;
  category: string;
  location: string;
  remote: boolean;
  type: "Full-time" | "Part-time" | "Contract";
  salary: string;
  skills: string[];
  experience: string;
  aiMatch: number;
  description: string;
  postedDays: number;
};

export type MatchBreakdown = {
  score: number;
  skillsMatch: number;
  interestMatch: number;
  locationMatch: number;
  experienceMatch: number;
  missingSkills: string[];
};

export type Application = {
  id: string;
  opportunityId: string;
  kind: "job" | "internship" | "training";
  title: string;
  company: string;
  status: "Saved" | "Applied" | "Under Review" | "Interview" | "Selected" | "Rejected";
  updatedAt: number;
  match: number;
};

export type Notification = {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  kind: "match" | "skill" | "opportunity" | "milestone" | "resume";
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp: number;
};

export type Quest = {
  id: string;
  name: string;
  description: string;
  xp: number;
  icon: string;
  completed: boolean;
};

export type ResumeProject = {
  id: string;
  name: string;
  description: string;
  skills: string[];
};

export type ResumeEntry = {
  id: string;
  title: string;
  org: string;
  period: string;
  detail: string;
};

export type ResumeCert = {
  id: string;
  name: string;
  issuer: string;
  year: string;
};

export type ResumeData = {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  headline: string;
  summary: string;
  skills: SkillEntry[];
  education: ResumeEntry[];
  experience: ResumeEntry[];
  projects: ResumeProject[];
  certifications: ResumeCert[];
};

export type ChatMessage = {
  id: string;
  role: "user" | "bot";
  text: string;
};

export type CareerCategory = {
  id: string;
  name: string;
  icon: string;
  careers: string[];
  color: string;
  description: string;
};

export type City = {
  name: string;
  state: string;
  lat: number;
  lng: number;
  opportunities: number;
  roles: string[];
};
