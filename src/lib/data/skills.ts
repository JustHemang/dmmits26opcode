export const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Professional"] as const;

export const LEVEL_VALUE: Record<string, number> = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
  Professional: 4,
};

export function skillValue(level: string) {
  return LEVEL_VALUE[level] ?? 1;
}

export const SKILL_CATALOG = [
  "HTML", "CSS", "JavaScript", "React", "Node.js", "Git", "SQL", "Python",
  "Figma", "Canva", "Photoshop", "Illustrator", "UI Design", "UX Research",
  "Wireframing", "Prototyping", "Design Thinking", "Typography", "Branding",
  "SEO", "Social Media", "Copywriting", "Google Analytics", "Email Marketing",
  "Content Creation", "Video Editing", "Storytelling", "Excel", "Power BI",
  "Statistics", "Machine Learning", "Networking", "Linux", "Security Fundamentals",
  "Ethical Hacking", "Electrical Fundamentals", "Wiring", "Solar Technology",
  "Engine Systems", "EV Technology", "Diagnostics", "First Aid", "Patient Care",
  "Medical Terminology", "Tally", "Accounting Principles", "Supply Chain",
  "Inventory Management", "Coordination", "Crop Science", "Precision Farming",
  "Communication", "Negotiation", "CRM", "Front Office", "Culinary Skills",
  "Skincare", "Cosmetology", "Safety Standards", "Site Management",
] as const;
