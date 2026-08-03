import type {
  CareerMatch,
  SkillDNAAnswer,
  SkillDNAResult,
  SkillGapItem,
  Roadmap,
  RoadmapMonth,
  ResumeData,
  MatchBreakdown,
  UserProfile,
  ChatMessage,
} from "@/types";
import { CAREER_DEFS, careerById } from "@/lib/data/careers";
import { TRAINING, INTERNSHIPS, JOBS } from "@/lib/data/opportunities";
import { skillValue } from "@/lib/data/skills";

const INTEREST_WEIGHTS: Record<string, string[]> = {
  creating: ["ui-ux-designer", "graphic-designer", "content-creator", "chef", "web-developer", "beauty-therapist", "digital-marketer"],
  technology: ["web-developer", "cybersecurity-analyst", "ai-engineer", "data-analyst", "ui-ux-designer", "automotive-technician", "agriculture-technician"],
  building: ["electrician", "automotive-technician", "construction-supervisor", "logistics-coordinator"],
  people: ["sales-executive", "digital-marketer", "healthcare-assistant", "hotel-management", "beauty-therapist", "chef", "content-creator"],
  numbers: ["data-analyst", "accountant", "ai-engineer", "cybersecurity-analyst", "web-developer", "logistics-coordinator", "electrician"],
  content: ["content-creator", "digital-marketer", "graphic-designer"],
  outdoors: ["agriculture-technician", "electrician", "construction-supervisor", "content-creator"],
  helping: ["healthcare-assistant", "beauty-therapist", "sales-executive", "hotel-management", "agriculture-technician"],
};

function hash(n: number) {
  return ((n * 9301 + 49297) % 233280) / 233280;
}

export function calculateCareerMatch(
  answers: SkillDNAAnswer,
  userSkills: { name: string; level: string }[],
  seed: number = 7,
  isHindi: boolean = false
): CareerMatch[] {
  const userSkillSet = userSkills.map((s) => s.name.toLowerCase());
  const userSkillLevels: Record<string, number> = {};
  userSkills.forEach((s) => {
    userSkillSet.push(s.name.toLowerCase());
    userSkillLevels[s.name.toLowerCase()] = skillValue(s.level);
  });

  return CAREER_DEFS.map((career, idx) => {
    const interestScore =
      career.interests.filter((i) => answers.enjoys.includes(i)).length / Math.max(1, career.interests.length);

    const interestOverlap = career.interests.length
      ? career.interests.filter((i) => answers.enjoys.includes(i)).length / career.interests.length
      : 0;

    let skillHits = 0;
    let skillValueSum = 0;
    career.skills.forEach((s) => {
      const lvl = userSkillLevels[s.name.toLowerCase()];
      if (lvl && lvl >= 1) {
        skillHits++;
        skillValueSum += Math.min(1, lvl / s.required);
      }
    });
    const skillsScore = career.skills.length
      ? (skillHits / career.skills.length) * 0.5 + (skillValueSum / career.skills.length) * 0.5
      : 0;

    const locationScore = 0.82 + hash(idx + seed) * 0.12;
    const experienceScore = 0.7 + hash(idx + seed + 3) * 0.22;

    let problemSolving = 0.65;
    if (answers.enjoys.includes("technology")) problemSolving += 0.12;
    if (answers.enjoys.includes("numbers")) problemSolving += 0.12;
    if (answers.enjoys.includes("building")) problemSolving += 0.08;
    if (userSkillSet.includes("javascript") || userSkillSet.includes("python")) problemSolving += 0.08;
    if (answers.education.includes("B.Tech") || answers.education.includes("Engineering")) problemSolving += 0.05;
    problemSolving = Math.min(1, problemSolving);

    const levelBonus = answers.skillLevel === "Beginner" ? 0.05 : answers.skillLevel === "Intermediate" ? 0.03 : 0;
    const goalBonus = answers.goal.includes(career.category.split(" ")[0]) ? 0.04 : 0;
    const hoursBonus = answers.hours >= 10 ? 0.02 : 0;

    const raw =
      interestScore * 0.32 +
      skillsScore * 0.3 +
      (locationScore * 0.12) +
      (experienceScore * 0.1) +
      problemSolving * 0.12 +
      levelBonus +
      goalBonus +
      hoursBonus;

    const match = Math.min(97, Math.round(raw * 100) + 2);

    const missing = career.skills
      .filter((s) => !userSkillSet.includes(s.name.toLowerCase()) && skillValue("Beginner") < s.required)
      .map((s) => s.name)
      .slice(0, 4);

    return {
      id: career.id,
      title: career.title,
      category: career.category,
      match,
      salary: career.salary,
      demand: career.demand,
      why: {
        interests: Math.round(interestOverlap * 100),
        skills: Math.round(skillsScore * 100),
        location: Math.round(locationScore * 100),
        experience: Math.round(experienceScore * 100),
        problemSolving: Math.round(problemSolving * 100),
      },
      reasons: buildReasons(career, answers, skillsScore, problemSolving, idx + seed, isHindi),
      skillsNeeded: career.skills.slice(0, 6).map((s) => s.name),
      missingSkills: missing,
    };
  })
    .sort((a, b) => b.match - a.match)
    .slice(0, 5);
}

function buildReasons(
  career: (typeof CAREER_DEFS)[number],
  answers: SkillDNAAnswer,
  skillsScore: number,
  problemSolving: number,
  seed: number,
  isHindi: boolean = false
): string[] {
  const reasons: string[] = [];
  const shared = career.interests.filter((i) => answers.enjoys.includes(i));
  const interestList = shared.map((s) => s.replace("-", " ")).join(isHindi ? " और " : " and ");
  if (shared.length) {
    reasons.push(
      isHindi
        ? `करियर में आपकी रुचि ${interestList} सीधे ${career.title} की दिनचर्या से मेल खाती है`
        : `Your interest in ${interestList} maps directly to what ${career.title}s do every day`
    );
  } else {
    reasons.push(
      isHindi
        ? `आपकी समस्या-समाधान शैली ${career.title} के दिन-प्रतिदिन के काम के साथ मेल खाती है`
        : `Your problem-solving style complements the day-to-day work of a ${career.title}`
    );
  }
  if (skillsScore > 0.35) {
    reasons.push(
      isHindi
        ? "आपके पास पहले से ऐसे कोर स्किल हैं जो इस करियर में काम आते हैं"
        : "You already have core skills that transfer into this career"
    );
  }
  if (answers.education.includes("B.Tech") || answers.education.includes("12")) {
    reasons.push(
      isHindi
        ? `आपकी ${answers.education} पृष्ठभूमि आपको मज़बूत शुरुआती आधार देती है`
        : `Your ${answers.education} background gives you a strong entry foundation`
    );
  }
  reasons.push(
    isHindi
      ? `आपके क्षेत्र में ${career.demand} की मज़बूत मांग, ${career.salary} से शुरू होने वाले वेतन के साथ`
      : `Strong ${career.demand} demand across your region with salaries from ${career.salary}`
  );
  if (problemSolving > 0.75) {
    reasons.push(
      isHindi
        ? "आपकी प्रोफ़ाइल में उच्च विश्लेषणात्मक और समस्या-समाधान क्षमता पाई गई"
        : "High analytical and problem-solving aptitude detected in your profile"
    );
  }
  reasons.push(
    isHindi
      ? `प्रति वर्ष ~${career.growth}% की दर से बढ़ रहा — भारत के सबसे तेज़ बढ़ते करियर ट्रैक में से एक`
      : `Growing at ~${career.growth}% per year — one of India's fastest rising career tracks`
  );
  return reasons.slice(0, 4);
}

export function summarizeSkillDNA(matches: CareerMatch[], answers: SkillDNAAnswer, isHindi: boolean = false): string {
  const top = matches[0];
  if (isHindi) {
    return `${answers.skillLevel === "Beginner" ? "एक स्वाभाविक शुरुआती" : "एक प्रतिबद्ध शिक्षार्थी"} ${answers.location} में — आपकी सबसे मज़बूत संकेत ${answers.enjoys.join(" और ")} है। आपका सबसे अच्छा मेल ${top.title} के साथ ${top.match}% है, क्योंकि आपकी रुचियां, मौजूदा स्किल और सीखने की क्षमता भूमिका की मुख्य ज़रूरतों से मेल खाती हैं। आपका तुरंत फोकस: लक्षित ट्रेनिंग से ${top.missingSkills.slice(0, 2).join(" और ") || "एडवांस डिज़ाइन टूल्स"} पर गैप बंद करें, फिर इंटर्नशिप पाने के लिए 2 पोर्टफोलियो प्रोजेक्ट बनाएं।`;
  }
  return `${answers.skillLevel === "Beginner" ? "A natural beginner" : "A committed learner"} in ${answers.location}, your strongest signal is ${answers.enjoys.join(" and ")}. You align most with ${top.title} at ${top.match}% because your interests, current skills and learning capacity fit the role's core demands. Your immediate focus: close the gap on ${top.missingSkills.slice(0, 2).join(" and ") || "advanced design tools"} through targeted training, then build 2 portfolio projects to unlock internships.`;
}

export function runSkillDNA(answers: SkillDNAAnswer, userSkills: { name: string; level: string }[], isHindi: boolean = false): SkillDNAResult {
  const matches = calculateCareerMatch(answers, userSkills, 7, isHindi);
  const topCareer = matches[0];
  const baseScore = (i: number) => ({ score: Math.round(Math.min(97, 78 + hash(i) * 18)) });
  const scores = [
    { label: "Creativity", score: 78 + (answers.enjoys.includes("creating") ? 14 : 6), icon: "PenTool" },
    { label: "Technology", score: 76 + (answers.enjoys.includes("technology") ? 16 : 6), icon: "Cpu" },
    { label: "Problem Solving", score: 74 + (answers.enjoys.includes("numbers") || answers.enjoys.includes("building") ? 12 : 8), icon: "BrainCircuit" },
    { label: "Communication", score: 72 + (answers.enjoys.includes("people") ? 16 : 8), icon: "MessageCircle" },
    { label: "Hands-On", score: 70 + (answers.enjoys.includes("building") ? 16 : 6), icon: "Hammer" },
  ].map((s, i) => ({ ...s, score: Math.min(96, s.score + baseScore(i).score % 7) }));

  return {
    completedAt: Date.now(),
    scores,
    matches,
    topCareer,
    summary: summarizeSkillDNA(matches, answers, isHindi),
    answers,
  };
}

export function generateSkillGap(targetCareerId: string, userSkills: { name: string; level: string }[], isHindi: boolean = false): SkillGapItem[] {
  const career = CAREER_DEFS.find((c) => c.id === targetCareerId);
  if (!career) return [];
  return career.skills.map((req) => {
    const user = userSkills.find((s) => s.name.toLowerCase() === req.name.toLowerCase());
    const current = user ? skillValue(user.level) : 0;
    const required = req.required;
    const status = current >= required ? "met" : current >= required - 1 && current > 0 ? "partial" : current > 0 ? "partial" : "gap";
    const resource = TRAINING.find((t) => t.skills.includes(req.name));
    return {
      skill: req.name,
      requiredLevel: required,
      currentLevel: current,
      status,
      learningResource: resource?.title ?? (isHindi ? `${req.name} का परिचय` : `Intro to ${req.name}`),
    };
  });
}

export function generateRoadmap(targetCareerId: string, userSkills: { name: string; level: string }[], level: string, isHindi: boolean = false): Roadmap {
  const career = CAREER_DEFS.find((c) => c.id === targetCareerId);
  const def = career ?? CAREER_DEFS[0];
  const gaps = generateSkillGap(targetCareerId, userSkills, isHindi);
  const topGaps = gaps.filter((g) => g.status !== "met").slice(0, 3).map((g) => g.skill);
  const hasGaps = topGaps.length > 0;
  const h = isHindi;

  const months: RoadmapMonth[] = [
    {
      month: 1,
      title: h ? "फाउंडेशन स्प्रिंट" : "Foundation Sprint",
      goal: h ? `${def.title} की बुनियादी बातों में महारत हासिल करें और अपना वर्कस्पेस तैयार करें।` : `Master the fundamentals of ${def.title} and set up your workspace.`,
      tasks: [
        { id: "m1a", label: h ? `${def.title} के लिए SkillDNA पूरा करें` : `Complete SkillDNA for ${def.title}`, type: "Learn", done: true },
        { id: "m1b", label: hasGaps ? (h ? `${topGaps[0]} सीखना शुरू करें (बेसिक → प्रोजेक्ट)` : `Start learning ${topGaps[0]} (basics → projects)`) : (h ? `${def.skills[0]?.name} के कोर स्किल मज़बूत करें` : `Solidify core ${def.skills[0]?.name} skills`), type: "Learn", done: false },
        { id: "m1c", label: h ? `${def.category} का मुफ़्त शुरुआती कोर्स जॉइन करें` : `Enroll in a free ${def.category} beginner course`, type: "Learn", done: false, link: "/training" },
        { id: "m1d", label: h ? "LinkedIn + Skill India Hub प्रोफ़ाइल बनाएं" : "Set up LinkedIn + Skill India Hub profile", type: "Application", done: false },
      ],
    },
    {
      month: 2,
      title: h ? "स्किल बिल्डिंग" : "Skill Building",
      goal: h ? `${topGaps[1] ?? def.skills[1]?.name ?? "कोर टूल्स"} में गहराई से जाएं और रोज़ अभ्यास करें।` : `Deep-dive into ${topGaps[1] ?? def.skills[1]?.name ?? "core tools"} and practice daily.`,
      tasks: [
        { id: "m2a", label: hasGaps ? (h ? `${topGaps[1] ?? def.skills[1]?.name} पर ट्रेनिंग पूरी करें` : `Complete training on ${topGaps[1] ?? def.skills[1]?.name}`) : (h ? `${def.skills[1]?.name} की एडवांस प्रैक्टिस` : `Advanced ${def.skills[1]?.name} practice`), type: "Learn", done: false, link: "/training" },
        { id: "m2b", label: h ? "एक पेज का डेमो प्रोजेक्ट बनाएं" : "Build a 1-page demo project", type: "Project", done: false },
        { id: "m2c", label: h ? "अपने क्षेत्र का कम्युनिटी / Discord जॉइन करें" : "Join a community / Discord for your field", type: "Learn", done: false },
        { id: "m2d", label: h ? "अपने प्रोजेक्ट पर 3 लोगों से फीडबैक लें" : "Get feedback on your project from 3 people", type: "Project", done: false },
      ],
    },
    {
      month: 3,
      title: h ? "प्रोजेक्ट फेज़" : "Project Phase",
      goal: h ? "एक पोर्टफोलियो प्रोजेक्ट बनाएं जो आपकी स्किल साबित करे।" : "Ship a portfolio project that proves your skill.",
      tasks: [
        { id: "m3a", label: h ? "अपना पहला पूरा पोर्टफोलियो प्रोजेक्ट बनाएं" : "Build your first complete portfolio project", type: "Project", done: false },
        { id: "m3b", label: h ? "इसे GitHub / Behance पर दस्तावेज़ित करें" : "Document it on GitHub / Behance", type: "Project", done: false },
        { id: "m3c", label: h ? `${def.category} की शुरुआती सर्टिफिकेशन अर्जित करें` : `Earn a starter ${def.category} certification`, type: "Certification", done: false },
        { id: "m3d", label: h ? "प्रोजेक्ट को अपने AI रिज़्यूमे में जोड़ें" : "Add the project to your AI Resume", type: "Application", done: false, link: "/resume-builder" },
      ],
    },
    {
      month: 4,
      title: h ? "सर्टिफिकेशन और पॉलिश" : "Certify & Polish",
      goal: h ? "अपनी स्किल सर्टिफाइड करें और पोर्टफोलियो व रिज़्यूमे फाइनल करें।" : "Certify your skills and finalize your portfolio and resume.",
      tasks: [
        { id: "m4a", label: h ? `${def.certifications[0] ?? "इंडस्ट्री सर्टिफिकेशन"} पूरा करें` : `Complete ${def.certifications[0] ?? "industry certification"}`, type: "Certification", done: false },
        { id: "m4b", label: h ? "रिज़्यूमे + स्किल पासपोर्ट पॉलिश करें" : "Polish resume + Skill Passport", type: "Application", done: false, link: "/skill-passport" },
        { id: "m4c", label: h ? "अपना रिज़्यूमे AI हेल्थ स्कोर से जांचें" : "Run your resume through AI Health Score", type: "Application", done: false, link: "/resume-builder" },
        { id: "m4d", label: h ? "2 केस-स्टडी लेख बनाएं" : "Create 2 case-study writeups", type: "Project", done: false },
      ],
    },
    {
      month: 5,
      title: h ? "अवसर खोज" : "Opportunity Hunt",
      goal: h ? "अपनी नई स्किल से मैच वाली इंटर्नशिप और नौकरियों में आवेदन करें।" : "Apply to matched internships and jobs using your new skills.",
      tasks: [
        { id: "m5a", label: h ? "अपने पास की 10 मैच वाली इंटर्नशिप शॉर्टलिस्ट करें" : "Shortlist 10 matched internships near you", type: "Internship", done: false, link: "/internships" },
        { id: "m5b", label: h ? "तैयार रिज़्यूमे के साथ 3-5 इंटर्नशिप में आवेदन करें" : "Apply to 3-5 internships with tailored resumes", type: "Internship", done: false },
        { id: "m5c", label: h ? "इंटरव्यू प्रश्नों का अभ्यास करें (AI कॉपिलॉट)" : "Practice interview questions (AI Copilot)", type: "Application", done: false, link: "/copilot" },
        { id: "m5d", label: h ? "2 करियर वेबिनार या इवेंट में भाग लें" : "Attend 2 career webinars or events", type: "Application", done: false, link: "/radar" },
      ],
    },
    {
      month: 6,
      title: h ? "लॉन्च" : "Launch",
      goal: h ? "इंटर्नशिप को ऑफर में बदलें और अपना लॉन्च प्लान फाइनल करें।" : "Convert internships into offers and finalize your launch plan.",
      tasks: [
        { id: "m6a", label: h ? "3 मैच वाली एंट्री-लेवल नौकरियों में आवेदन करें" : "Apply to 3 matched entry-level jobs", type: "Application", done: false, link: "/jobs" },
        { id: "m6b", label: h ? "ट्रैकर में आवेदनों की फॉलो-अप करें" : "Follow up on applications in the tracker", type: "Application", done: false, link: "/applications" },
        { id: "m6c", label: h ? "नई सर्टिफिकेशन से स्किल पासपोर्ट अपडेट करें" : "Update Skill Passport with new certifications", type: "Application", done: false, link: "/skill-passport" },
        { id: "m6d", label: h ? "अपना Career Launch बैज सेलिब्रेट करें!" : "Celebrate your Career Launch badge!", type: "Application", done: false },
      ],
    },
  ];

  const allTasks = months.flatMap((m) => m.tasks);
  return {
    career: def.title,
    months,
    totalTasks: allTasks.length,
    completedTasks: allTasks.filter((t) => t.done).length,
  };
}

export function generateResumeSummary(profile: Pick<UserProfile, "name" | "careerGoal" | "skills" | "education" | "location">, isHindi: boolean = false): string {
  const topSkills = profile.skills.slice(0, 4).map((s) => s.name).join(isHindi ? ", " : ", ");
  if (isHindi) {
    return `${profile.name} ${profile.location} में रहने वाले एक प्रेरित ${profile.careerGoal} aspirant हैं, जिनके पास ${topSkills} में हैंड्स-ऑन स्किल हैं। एक तेज़-सीखने वाले जो ${profile.careerGoal.toLowerCase()} की बुनियादी बातों को असली प्रोजेक्ट में लागू करने पर ध्यान देते हैं, आत्म-निर्देशित सीखने का ट्रैक रिकॉर्ड और स्ट्रक्चर्ड ट्रेनिंग व इंटर्नशिप से इंडस्ट्री में आने का स्पष्ट लक्ष्य। विस्तार पर ध्यान और ग्रोथ माइंडसेट के लिए जाने जाते हैं।`;
  }
  return `${profile.name} is a motivated ${profile.careerGoal} aspirant based in ${profile.location} with hands-on skills in ${topSkills}. A quick learner focused on applying ${profile.careerGoal.toLowerCase()} fundamentals to real-world projects, with a track record of self-driven learning and a clear goal to break into the industry through structured training and internships. Known for attention to detail and a growth mindset.`;
}

export function improveBullet(raw: string, isHindi: boolean = false): string {
  const trimmed = raw.trim().replace(/\.$/, "");
  const strongVerbs = isHindi
    ? ["नेतृत्व किया", "बनाया", "डिज़ाइन किया", "लॉन्च किया", "बढ़ाया", "सुव्यवस्थित किया", "विकसित किया", "निर्मित किया", "सुधारा", "शिप किया"]
    : ["Led", "Built", "Designed", "Launched", "Increased", "Streamlined", "Developed", "Created", "Improved", "Shipped"];
  const words = trimmed.split(" ");
  const verb = strongVerbs[Math.abs(trimmed.length + raw.charCodeAt(0)) % strongVerbs.length];
  const rest = words.slice(1).join(" ").replace(/^(l|a|t|b|c|s|i|d)ed\s+/i, "");
  if (isHindi) {
    return `${verb} ${rest || trimmed} — मापने योग्य प्रभाव के साथ, गुणवत्ता और स्थिरता में सुधार।`;
  }
  return `${verb} ${rest || trimmed} with measurable impact, improving quality and consistency.`;
}

export function resumeHealthScore(resume: ResumeData, isHindi: boolean = false): { score: number; categories: { label: string; score: number; tip: string }[]; suggestions: string[] } {
  const skillScore = Math.min(100, resume.skills.length * 12);
  const projScore = Math.min(100, resume.projects.length * 30);
  const eduScore = Math.min(100, 40 + resume.education.length * 20);
  const expScore = Math.min(100, resume.experience.length * 25);
  const fmtScore = [resume.summary.length > 80, resume.phone, resume.linkedin, resume.headline].filter(Boolean).length * 25;

  const score = Math.round(skillScore * 0.25 + projScore * 0.25 + eduScore * 0.15 + expScore * 0.2 + fmtScore * 0.15);

  const h = isHindi;
  const suggestions: string[] = [];
  if (resume.skills.length < 6) suggestions.push(h ? "स्किल श्रेणी मज़बूत करने के लिए कम से कम 6 प्रासंगिक स्किल जोड़ें" : "Add at least 6 relevant skills to strengthen the Skills category");
  if (resume.projects.length < 2) suggestions.push(h ? "मापने योग्य परिणामों वाले 1-2 और प्रोजेक्ट जोड़ें" : "Add 1-2 more projects with measurable outcomes");
  if (resume.experience.length < 2) suggestions.push(h ? "इंटर्नशिप या स्वयंसेवी कार्य को अनुभव में शामिल करें" : "Include internships or volunteer work as experience");
  if (resume.summary.length < 80) suggestions.push(h ? "अपनी प्रोफेशनल समरी को 2-3 वाक्यों में विस्तारित करें" : "Expand your professional summary to 2-3 sentences");
  if (!resume.phone) suggestions.push(h ? "भर्तीकर्ताओं तक पहुंचने के लिए फ़ोन नंबर जोड़ें" : "Add a phone number so recruiters can reach you");
  if (!resume.linkedin) suggestions.push(h ? "अपना LinkedIn प्रोफ़ाइल लिंक करें" : "Link your LinkedIn profile");
  if (resume.certifications.length < 1) suggestions.push(h ? "विश्वसनीयता बढ़ाने के लिए सर्टिफिकेशन जोड़ें" : "Add a certification to boost credibility");

  return {
    score,
    categories: [
      { label: h ? "स्किल" : "Skills", score: skillScore, tip: skillScore < 70 ? (h ? "अधिक भूमिका-प्रासंगिक स्किल सूचीबद्ध करें" : "List more role-relevant skills") : (h ? "बेहतरीन स्किल कवरेज" : "Great skill coverage") },
      { label: h ? "प्रोजेक्ट" : "Projects", score: projScore, tip: projScore < 70 ? (h ? "प्रोजेक्ट स्किल साबित करते हैं — और जोड़ें" : "Projects prove skills — add more") : (h ? "मज़बूत प्रोजेक्ट पोर्टफोलियो" : "Strong project portfolio") },
      { label: h ? "शिक्षा" : "Education", score: eduScore, tip: eduScore < 70 ? (h ? "अपनी शिक्षा विवरण जोड़ें" : "Add your education details") : (h ? "शिक्षा पूर्ण दिखती है" : "Education looks complete") },
      { label: h ? "अनुभव" : "Experience", score: expScore, tip: expScore < 70 ? (h ? "इंटर्नशिप या स्वयंसेवा शामिल करें" : "Include internships or volunteering") : (h ? "अच्छा अनुभव इतिहास" : "Good experience history") },
      { label: h ? "फ़ॉर्मेटिंग" : "Formatting", score: fmtScore, tip: fmtScore < 80 ? (h ? "संपर्क + समरी फ़ील्ड पूरे करें" : "Complete contact + summary fields") : (h ? "फ़ॉर्मेटिंग भर्तीकर्ता-तैयार है" : "Formatting is recruiter-ready") },
    ],
    suggestions: suggestions.length ? suggestions : [h ? "आपका रिज़्यूमे मज़बूत है। हर आवेदन के अनुसार समरी तैयार करने पर विचार करें।" : "Your resume is strong. Consider tailoring the summary per application."],
  };
}

export function computeMatchBreakdown(opportunity: { skills: string[]; location: string; category: string }, profile: UserProfile): MatchBreakdown {
  const skillHits = opportunity.skills.filter((s) => profile.skills.some((ps) => ps.name.toLowerCase() === s.toLowerCase()));
  const skillsMatch = opportunity.skills.length ? Math.round((skillHits.length / opportunity.skills.length) * 100) : 60;
  const interestMatch = Math.min(100, 60 + (profile.skilldna ? Math.round(profile.skilldna.scores.find((s) => s.label === "Creativity")?.score ?? 70) : 70) * 0.25);
  const locationMatch = profile.city === opportunity.location ? 100 : profile.city && opportunity.location ? 78 : 60;
  const experienceMatch = 70 + Math.round((profile.skills.length / 8) * 25);
  const missing = opportunity.skills.filter((s) => !profile.skills.some((ps) => ps.name.toLowerCase() === s.toLowerCase()));
  const score = Math.min(98, Math.round(skillsMatch * 0.5 + interestMatch * 0.2 + locationMatch * 0.15 + experienceMatch * 0.15));
  return {
    score,
    skillsMatch,
    interestMatch,
    locationMatch,
    experienceMatch,
    missingSkills: missing.slice(0, 3),
  };
}

export function findMatch(profile: UserProfile): MatchBreakdown {
  return computeMatchBreakdown(
    { skills: profile.skills.map((s) => s.name), location: profile.city, category: profile.targetCareer },
    profile
  );
}

function rankedOpportunities(profile: UserProfile, list: { skills: string[]; location: string; category: string }[], n = 4) {
  return list
    .map((o) => ({ o, b: computeMatchBreakdown(o, profile) }))
    .sort((a, b) => b.b.score - a.b.score)
    .slice(0, n)
    .map((x) => x.b);
}

export function recommendNextAction(profile: UserProfile, isHindi: boolean = false): { title: string; detail: string; link: string } {
  if (!profile.skilldna) {
    return isHindi
      ? { title: "अपना SkillDNA पूरा करें", detail: "2 मिनट से कम में AI से जानें कि कौन-से करियर आपके लिए सबसे मेल खाते हैं।", link: "/skilldna" }
      : { title: "Complete your SkillDNA", detail: "Let AI discover which careers match you best in under 2 minutes.", link: "/skilldna" };
  }
  const gap = generateSkillGap(profile.targetCareerId, profile.skills, isHindi);
  const openGap = gap.filter((g) => g.status !== "met");
  if (openGap.length) {
    return isHindi
      ? { title: `आगे ${openGap[0].skill} सीखें`, detail: `यह स्किल ${profile.targetCareer} की ओर सबसे बड़ा गैप बंद करती है।`, link: "/skill-gap" }
      : { title: `Learn ${openGap[0].skill} next`, detail: `This skill closes the biggest gap toward ${profile.targetCareer}.`, link: "/skill-gap" };
  }
  if (!profile.resumeHealth || profile.resumeHealth < 85) {
    return isHindi
      ? { title: "अपना रिज़्यूमे हेल्थ बढ़ाएं", detail: "आपका रिज़्यूमे 85 से कम स्कोर करता है। AI से इसे पॉलिश करवाएं।", link: "/resume-builder" }
      : { title: "Boost your resume health", detail: "Your resume scores below 85. Let AI polish it.", link: "/resume-builder" };
  }
  return isHindi
    ? { title: "मैच वाले अवसरों में आवेदन करें", detail: "आप लॉन्च के लिए तैयार हैं। आपके लिए 3 नए मैच इंतज़ार कर रहे हैं।", link: "/jobs" }
    : { title: "Apply to matched opportunities", detail: "You're launch-ready. 3 fresh matches are waiting for you.", link: "/jobs" };
}

export function careerResponse(profile: UserProfile, question: string, isHindi: boolean = false): string {
  const q = question.toLowerCase().trim();
  const career = profile.skilldna?.topCareer;
  const h = isHindi;

  const has = (...words: string[]) => words.some((w) => q.includes(w));

  const gap = generateSkillGap(profile.targetCareerId, profile.skills, h);
  const missing = gap.filter((g) => g.status !== "met").map((g) => g.skill);
  const firstOpen = gap.find((g) => g.status !== "met");

  const name = profile.name.split(" ")[0];
  const target = profile.targetCareer || (career ? career.title : "");
  const userSkillNames = profile.skills.map((s) => s.name.toLowerCase());

  const careerByTitle = (q: string) => {
    const title = CAREER_DEFS.find((c) => q.includes(c.title.toLowerCase()));
    return title ?? null;
  };
  const mentioned = careerByTitle(q);

  const topTraining = TRAINING.filter((t) =>
    t.skills.some((s) => userSkillNames.includes(s.toLowerCase())) || t.category.toLowerCase() === target.toLowerCase().split(" ")[0]
  ).sort((a, b) => b.aiMatch - a.aiMatch).slice(0, 3);
  const topInternships = INTERNSHIPS.filter((i) =>
    i.skills.some((s) => userSkillNames.includes(s.toLowerCase())) || i.category.toLowerCase() === target.toLowerCase().split(" ")[0]
  ).sort((a, b) => b.aiMatch - a.aiMatch).slice(0, 3);
  const topJobs = JOBS.filter((j) =>
    j.skills.some((s) => userSkillNames.includes(s.toLowerCase())) || j.category.toLowerCase() === target.toLowerCase().split(" ")[0]
  ).sort((a, b) => b.aiMatch - a.aiMatch).slice(0, 3);
  const b = findMatch(profile);

  // ---- 1. Greeting ----
  if (has("hi", "hello", "hey", "नमस्ते", "हैलो", "good morning", "good afternoon", "good evening", "सुप्रभात", "नमस्कार")) {
    return h
      ? `नमस्ते ${name}! 👋 मैं Career Copilot हूं — आपकी स्किल, शहर (${profile.city}) और लक्ष्य (${target || "अभी सेट नहीं"}) के साथ। मैं करियर चुनने, सीखने की योजना, इंटर्नशिप/जॉब खोज, रिज़्यूमे और इंटरव्यू में मदद करता हूं। क्या सीखना है, या मुझसे पूछें "मुझे आगे क्या सीखना चाहिए?"`
      : `Hi ${name}! 👋 I'm Career Copilot — tuned to your skills, city (${profile.city}) and goal (${target || "not set yet"}). I can help pick a career, plan learning, find internships/jobs, and prep your resume & interviews. What would you like to explore first?`;
  }

  // ---- 2. Thanks / bye / small talk ----
  if (has("thank", "thanks", "धन्यवाद", "शुक्रिया")) {
    return h
      ? `कहने के लिए शुक्रिया, ${name}! 🙏 मैं यहां हूं जब भी आपको अपने ${target || "करियर"} सफर में कोई मदद चाहिए।`
      : `You're welcome, ${name}! 🙏 I'm always here whenever you need help on your ${target || "career"} journey.`;
  }
  if (has("bye", "goodbye", "अलविदा")) {
    return h
      ? `अलविदा ${name}! जब भी लौटें, मैं आपके ${target || "करियर"} के लिए तैयार रहूंगा। सीखते रहिए! 🚀`
      : `Bye ${name}! I'll be right here whenever you're back. Keep building toward ${target || "your career"}! 🚀`;
  }

  // ---- 3. Capabilities / help ----
  if (has("what can you do", "help me", "how do you work", "what do you do", "मदद", "क्या कर सकते", "कैसे काम")) {
    return h
      ? `मैं इन 8 तरीकों से मदद कर सकता हूं:\n\n1️⃣ करियर: "कौन-सा करियर मुझे सूट करता है?"\n2️⃣ सीखना: "आगे क्या सीखना चाहिए?"\n3️⃣ ट्रेनिंग: "मेरे लिए ट्रेनिंग खोजें"\n4️⃣ इंटर्नशिप/जॉब: "मेरे लिए इंटर्नशिप खोजें"\n5️⃣ मैच: "मैं इस जॉब से मैच क्यों नहीं करता?"\n6️⃣ रिज़्यूमे: "मेरा रिज़्यूमे सुधारें"\n7️⃣ इंटरव्यू: "मुझे इंटरव्यू प्रैक्टिस कराएं"\n8️⃣ रोडमैप: "मेरा करियर रोडमैप बनाएं"\n\nकोई भी पूछें — मैं आपकी असली स्किल और लक्ष्यों से जवाब दूंगा।`
      : `I can help in 8 ways:\n\n1️⃣ Careers — "Which career suits me?"\n2️⃣ Learning — "What should I learn next?"\n3️⃣ Training — "Find training for me"\n4️⃣ Internships/Jobs — "Find internships for me"\n5️⃣ Matches — "Why don't I match this job?"\n6️⃣ Resume — "Improve my resume"\n7️⃣ Interviews — "Quiz me for interviews"\n8️⃣ Roadmap — "Build my career roadmap"\n\nTry any — I answer using your real skills and goals.`;
  }

  // ---- 4. Readiness / am I ready ----
  if (has("am i ready", "ready for", "when should i apply", "am i prepared", "क्या मैं तैयार", "कब आवेदन")) {
    const pct = b.score;
    const resumeOk = (profile.resumeHealth ?? 0) >= 70;
    const hasProject = profile.skilldna !== null || profile.skills.length >= 4;
    const openGapCount = missing.length;
    if (pct >= 70 && resumeOk && openGapCount <= 2) {
      return h
        ? `हां, ${name}! आप आवेदन के लिए तैयार हैं। आपका मैच स्कोर ${pct}% है, रिज़्यूमे हेल्थ ${profile.resumeHealth ?? 0}/100 है, और सिर्फ ${openGapCount} स्किल गैप बाकी हैं। इंटर्नशिप पेज पर जाएं और आज 1 आवेदन करें — मैच % सबसे ऊपर देखें। 🚀`
        : `Yes, ${name}! You're ready to apply. Your match score is ${pct}%, resume health is ${profile.resumeHealth ?? 0}/100, and only ${openGapCount} skill gaps remain. Head to Internships and send 1 application today — sort by match %. 🚀`;
    }
    const focus = [firstOpen?.skill, !resumeOk ? "resume" : null].filter(Boolean).slice(0, 2);
    return h
      ? `लगभग तैयार! आपका मैच ${pct}% है। ${focus.join(" और ")} पर काम करें, फिर आवेदन शुरू करें। मैं इनमें से हर एक पर विस्तार से बता सकता हूं।`
      : `Almost there! Your match is ${pct}%. Work on ${focus.join(" and ") || "your biggest skill gap"} first, then start applying. I can go deeper on any of these.`;
  }

  // ---- 5. Compare two careers ----
  if (has("vs", "compare", "between", "या", "मुकाबले", "बनाम")) {
    const titles = CAREER_DEFS.filter((c) => q.includes(c.title.toLowerCase()));
    if (titles.length >= 2) {
      const [a, c] = titles;
      const lines = [a, c].map((ct) => {
        const ml = profile.skilldna?.matches.find((m) => m.id === ct.id);
        return `${ct.title}: ${ml ? `${ml.match}% मैच · ` : ""}सैलरी ${ct.salary} · मांग ${ct.demand} · ग्रोथ ${ct.growth}% · स्किल: ${ct.skills.slice(0, 4).map((s) => s.name).join(", ")}`;
      });
      return h
        ? `अच्छी तुलना! यहां दोनों की एक-नज़र में जानकारी है:\n\n📊 ${lines[0]}\n📊 ${lines[1]}\n\nआपकी रुचि और स्किल किसके ज़्यादा करीब है, यह बताने के लिए किसी एक का नाम बताएं।`
        : `Good comparison! Here's a side-by-side:\n\n📊 ${lines[0]}\n📊 ${lines[1]}\n\nTell me which one to break down for YOUR profile specifically.`;
    }
  }

  // ---- 6. Specific career info ----
  if (mentioned && (has("about", "tell me", "explain", "क्या है", "बताओ", "के बारे में", "कैसे बनूं", "कैसे बने"))) {
    const ml = profile.skilldna?.matches.find((m) => m.id === mentioned.id);
    const need = profile.skilldna?.matches.find((m) => m.id === mentioned.id)?.missingSkills ?? [];
    return h
      ? `${mentioned.title} एक ${mentioned.category} करियर है — ${mentioned.summary} सैलरी ${mentioned.salary}, मांग ${mentioned.demand}, ग्रोथ ${mentioned.growth}% प्रति वर्ष। मुख्य स्किल: ${mentioned.skills.slice(0, 5).map((s) => s.name).join(", ")}।${ml ? ` आपका इससे मैच ${ml.match}% है${need.length ? ` — पहले सीखें: ${need.slice(0, 3).join(", ")}` : " — आप पहले से अच्छे मैच हैं!"}।` : ""}`
      : `${mentioned.title} is a ${mentioned.category} career — ${mentioned.summary} Salary ${mentioned.salary}, demand ${mentioned.demand}, growing ${mentioned.growth}% per year. Core skills: ${mentioned.skills.slice(0, 5).map((s) => s.name).join(", ")}.${ml ? ` Your match with it is ${ml.match}%${need.length ? ` — learn first: ${need.slice(0, 3).join(", ")}` : " — you're already a strong match!"}.` : ""}`;
  }

  // ---- 7. Which career suits me ----
  if (has("career suits", "what career", "fit me", "which career", "कौन-सा करियर", "करियर सूट", "क्या करियर", "best career", "सबसे अच्छा करियर")) {
    if (career) {
      const scores = (profile.skilldna?.scores ?? []).slice(0, 2).map((s) => `${s.label} (${s.score}%)`);
      const backups = (profile.skilldna?.matches ?? []).slice(1, 3).map((m) => `${m.title} (${m.match}%)`);
      return h
        ? `आपके SkillDNA के आधार पर, ${career.title} आपके लिए सबसे अच्छा मेल है — ${career.match}%। आपका सबसे मज़बूत स्कोर: ${scores.join(" और ")}। बैकअप मैच: ${backups.join(", ") || "कोई नहीं"}। चाहें तो इनमें से किसी के लिए 6-महीने का रोडमैप बना सकता हूं।`
        : `Based on your SkillDNA, ${career.title} suits you best at ${career.match}%. Your strongest signals: ${scores.join(" and ")}. Backup matches: ${backups.join(", ") || "none"}. I can build a 6-month roadmap for any of these.`;
    }
    return h
      ? "अपना SkillDNA क्विज़ शुरू करें — 2 मिनट में मैं आपकी रुचियों और स्किल से आपको सटीक करियर मैच दूंगा, सैलरी और ग्रोथ के साथ।"
      : "Start with your SkillDNA quiz — in under 2 minutes I'll map your interests and skills to exact career matches with salaries and growth.";
  }

  // ---- 8. What to learn next ----
  if (has("learn next", "learn", "what should i", "क्या सीख", "सीखना चाहिए", "स्किल")) {
    if (missing.length) {
      const res = firstOpen?.learningResource ?? "a beginner course";
      const idx = gap.findIndex((g) => g.status !== "met");
      const nextTwo = gap.slice(idx + 1).filter((g) => g.status !== "met").slice(0, 2).map((g) => g.skill);
      return h
        ? `${target} की ओर आपके सबसे बड़े स्किल गैप हैं: ${missing.slice(0, 3).join(", ")}। मेरी सलाह: "${res}" से शुरू करें — यह आपके ${profile.hoursPerWeek} hrs/week बजट में फिट बैठता है।${nextTwo.length ? ` उसके बाद: ${nextTwo.join(" और ")}।` : ""} स्किल गैप एनालाइज़र पर हर गैप की ट्रेनिंग देखें।`
        : `Your biggest skill gaps toward ${target} are: ${missing.slice(0, 3).join(", ")}. My pick: start with "${res}" — it fits your ${profile.hoursPerWeek} hrs/week budget.${nextTwo.length ? ` After that: ${nextTwo.join(" and ")}.` : ""} Open the Skill Gap Analyzer to see the training for each gap.`;
    }
    return h
      ? "आपने अपने लक्ष्य करियर के कोर स्किल कवर कर लिए हैं। अब गहराई में जाएं: 1-2 पोर्टफोलियो प्रोजेक्ट बनाएं, एक सर्टिफिकेशन अर्जित करें, फिर इंटर्नशिप में आवेदन करें। मैं इनमें से किसी पर भी विस्तार से बता सकता हूं।"
      : "You've covered the core skills for your target career. Go deeper: build 1-2 portfolio projects, earn a certification, then apply to internships. I can detail any of these.";
  }

  // ---- 9. Training recommendations ----
  if (has("training", "course", "learn a skill", "प्रशिक्षण", "कोर्स")) {
    if (topTraining.length) {
      const t0 = topTraining[0];
      return h
        ? `आपके लिए मेरी टॉप ट्रेनिंग: "${t0.title}" — ${t0.provider} (${t0.aiMatch}% मैच, ${t0.cost === "Free" ? "मुफ़्त" : t0.cost}, ${t0.duration})। ${t0.skills.slice(0, 3).join(", ")} सीखें।${topTraining[1] ? ` अगली अच्छी: "${topTraining[1].title}"।` : ""} Training पेज पर और देखें।`
        : `My top training pick for you: "${t0.title}" by ${t0.provider} (${t0.aiMatch}% match, ${t0.cost.toLowerCase()}, ${t0.duration}). It teaches ${t0.skills.slice(0, 3).join(", ")}.${topTraining[1] ? ` Also strong: "${topTraining[1].title}".` : ""} Browse more on the Training page.`;
    }
    return h
      ? "Training पेज पर सभी सरकारी-प्रमाणित कोर्स हैं, आपके शहर और स्किल के अनुसार फ़िल्टर किए जा सकते हैं। मैं आपके लक्ष्य करियर के लिए सबसे अच्छा कोर्स चुनने में मदद कर सकता हूं।"
      : "The Training page has all government-certified courses, filterable by your city and skills. Tell me your target and I'll shortlist the best fit.";
  }

  // ---- 10. Internships ----
  if (has("internship", "apprenticeship", "इंटर्नशिप", "अपरेंटिसशिप")) {
    if (topInternships.length) {
      const i0 = topInternships[0];
      const paid = i0.paid ? i0.stipend : "unpaid";
      return h
        ? `मुझे आपकी प्रोफ़ाइल से मैच करती ${topInternships.length} इंटर्नशिप मिलीं। टॉप पिक: "${i0.title}" — ${i0.company} (${i0.aiMatch}% मैच, ${paid}, ${i0.location})।${topInternships[1] ? ` अगली: "${topInternships[1].title}"।` : ""} इंटर्नशिप पेज पर ${i0.title} की सभी स्किल देखें।`
        : `I found ${topInternships.length} internships matching your profile. Top pick: "${i0.title}" at ${i0.company} (${i0.aiMatch}% match, ${paid}, ${i0.location}).${topInternships[1] ? ` Also strong: "${topInternships[1].title}".` : ""} Open the Internships page and shortlist the top one.`;
    }
    return h
      ? "अभी कोई सटीक मैच नहीं मिला। अपनी स्किल को स्किल गैप एनालाइज़र में जोड़ें या ट्रेनिंग करें — फिर मैं बेहतर इंटर्नशिप ढूंढ सकता हूं।"
      : "No exact matches yet. Add skills in the Skill Gap Analyzer or take training first — then I'll find better internships for you.";
  }

  // ---- 11. Jobs ----
  if (has("job", "full-time", "role", "नौकरी", "जॉब")) {
    if (topJobs.length) {
      const j0 = topJobs[0];
      return h
        ? `आपके लिए मेरी टॉप जॉब पिक: "${j0.title}" — ${j0.company} (${j0.aiMatch}% मैच, ${j0.salary}, ${j0.location})। यह ${j0.type} भूमिका है जो ${j0.skills.slice(0, 3).join(", ")} मांगती है।${topJobs[1] ? ` दूसरा विकल्प: "${topJobs[1].title}"।` : ""} Jobs पेज पर आवेदन करें — मैच % के हिसाब से सॉर्ट करें।`
      : `My top job pick for you: "${j0.title}" at ${j0.company} (${j0.aiMatch}% match, ${j0.salary}, ${j0.location}). It's a ${j0.type} role needing ${j0.skills.slice(0, 3).join(", ")}.${topJobs[1] ? ` Runner-up: "${topJobs[1].title}".` : ""} Apply on the Jobs page, sorted by match %.`;
    }
    return h
      ? "जॉब पेज पर एंट्री-लेवल की भूमिकाएं हैं जो आपकी स्किल से मैच होती हैं। कुछ स्किल गैप बंद करें और मैं आपके लिए बेहतर जॉब ढूंढूंगा।"
      : "The Jobs page lists entry-level roles matched to your skills. Close a few skill gaps and I'll surface better matches for you.";
  }

  // ---- 12. Why match ----
  if (has("why") && (has("match") || has("मैच"))) {
    const missingList = b.missingSkills.length ? b.missingSkills.join(", ") : null;
    return h
      ? `आपका मैच ब्रेकडाउन: स्किल ${b.skillsMatch}%, रुचि ${b.interestMatch}%, स्थान ${b.locationMatch}%, अनुभव ${b.experienceMatch}%। कुल ${b.score}%।${missingList ? ` इसे बढ़ाने के लिए सीखें: ${missingList}।` : " आप पहले से ही मज़बूत उम्मीदवार हैं!"} किसी भी नंबर पर मैं और विस्तार से बता सकता हूं।`
      : `Here's your match breakdown: Skills ${b.skillsMatch}%, Interest ${b.interestMatch}%, Location ${b.locationMatch}%, Experience ${b.experienceMatch}% — a ${b.score}% overall.${missingList ? ` To raise it, learn: ${missingList}.` : " You're a strong candidate already!"} Ask me to go deeper on any number.`;
  }

  // ---- 13. Resume ----
  if (has("resume", "cv", "रिज़्यूमे", "सीवी")) {
    const rHealth = profile.resumeHealth ?? 0;
    const advice = rHealth >= 85
      ? (h ? "आपका रिज़्यूमे भर्तीकर्ता-तैयार है। हर आवेदन के अनुसार समरी को ट्वीक करें।" : "Your resume is recruiter-ready. Tailor the summary per application.")
      : (h ? "AI रिज़्यूमे बिल्डर खोलें — यह आपकी समरी और बुलेट्स को पॉलिश करेगा और हेल्थ स्कोर बढ़ाएगा।" : "Open the AI Resume Builder — it'll polish your summary and bullets to lift the health score.");
    return h
      ? `आपका रिज़्यूमे हेल्थ ${rHealth}/100 है। ${advice} टिप: हर बुलेट को मज़बूत क्रिया से शुरू करें और प्रभाव संख्याओं में बताएं ("सत्र 20% बढ़ाया")।`
      : `Your resume health is ${rHealth}/100. ${advice} Pro tip: start bullets with strong action verbs and quantify impact ("increased X by 20%").`;
  }

  // ---- 14. Interview ----
  if (has("interview", "quiz me", "practice", "इंटरव्यू", "साक्षात्कार")) {
    const ct = mentioned ?? (career ? careerById(career.id) : undefined);
    const skills = ct?.skills.slice(0, 4).map((s) => s.name) ?? ["core skills"];
    return h
      ? `${target} के इंटरव्यू में उम्मीद करें:\n\n• पोर्टफोलियो वॉकथ्रू — अपने 1 प्रोजेक्ट की कहानी तैयार रखें\n• प्रैक्टिकल टास्क — जैसे ${skills[0]} से एक छोटा टास्क\n• ${skills[1] ?? "उद्योग"} के बारे में फंडामेंटल सवाल\n• बिहेवियरल सवाल — "एक समस्या बताएं जो आपने हल की"\n\nचाहें तो मैं आपसे अभी मॉक इंटरव्यू शुरू कर सकता हूं!`
      : `For ${target} interviews expect:\n\n• Portfolio walkthrough — have the story of 1 project ready\n• A practical task — e.g. a short exercise around ${skills[0]}\n• Fundamentals on ${skills[1] ?? "the industry"}\n• Behavioral questions — "tell me a problem you solved"\n\nWant me to run a mock interview with you right now?`;
  }

  // ---- 15. Roadmap ----
  if (has("roadmap", "plan", "रोडमैप", "योजना")) {
    return h
      ? `यह रहा आपका ${target || "लक्ष्य"} रोडमैप:\n\nमहीना 1 — फाउंडेशन\nमहीना 2 — स्किल बिल्डिंग\nमहीना 3 — पोर्टफोलियो प्रोजेक्ट\nमहीना 4 — सर्टिफिकेशन\nमहीना 5 — इंटर्नशिप आवेदन\nमहीना 6 — जॉब लॉन्च\n\nहर टास्क ट्रैक करने के लिए Career Roadmap खोलें। यह आपके ${profile.hoursPerWeek} hrs/week बजट के हिसाब से बना है।`
      : `Here's your ${target || "career"} roadmap:\n\nMonth 1 — Foundation\nMonth 2 — Skill building\nMonth 3 — Portfolio project\nMonth 4 — Certification\nMonth 5 — Internship applications\nMonth 6 — Job launch\n\nOpen the Career Roadmap to track each task. It's built around your ${profile.hoursPerWeek} hrs/week budget.`;
  }

  // ---- 16. Demand / hot skills ----
  if (has("demand", "trending", "hot", "in demand", "future", "मांग", "ट्रेंडिंग")) {
    return h
      ? `भारत में अभी के सबसे हॉट स्किल: AI/ML (~40% ग्रोथ), Cybersecurity (~35%), Data Analytics (~31%), UI/UX (~28%) और EV Technology (~17%)। ${target ? `आपके लक्ष्य (${target}) के साथ AI टूल्स जोड़ना आपको बहुत प्रतिस्पर्धी बनाएगा।` : "अपना SkillDNA पूरा करें और मैं आपके लिए सबसे हॉट मैच बताऊंगा।"}`
      : `The hottest skills in India right now: AI/ML (~40% growth), Cybersecurity (~35%), Data Analytics (~31%), UI/UX (~28%) and EV Technology (~17%). ${target ? `Pairing ${target} with AI tools would make you very competitive.` : "Complete your SkillDNA and I'll tell you the hottest match for YOU."}`;
  }

  // ---- 17. Salary ----
  if (has("salary", "earn", "how much", "money", "pay", "सैलरी", "कितना", "पैसा")) {
    if (mentioned) {
      return h
        ? `${mentioned.title} की सैलरी रेंज ${mentioned.salary} है, मांग ${mentioned.demand} और सालाना ग्रोथ ${mentioned.growth}%। शुरुआत में इंटर्नशिप + सर्टिफिकेशन से इस रेंज के ऊपरी छोर तक पहुंचा जा सकता है।`
        : `${mentioned.title}s earn ${mentioned.salary} in India, with ${mentioned.demand} demand and ~${mentioned.growth}% yearly growth. Internships + certification early on can push you toward the top of that band.`;
    }
    if (career) {
      return h
        ? `${career.title}s की शुरुआती सैलरी ${career.salary} है, मांग ${career.demand}। आपके बैकअप मैच: ${profile.skilldna?.matches.slice(1, 3).map((m) => `${m.title} (${m.salary})`).join(" और ") ?? "समान बैंड"}${
            b.missingSkills.length ? `। इसे पाने के लिए ${b.missingSkills.slice(0, 2).join(" और ")} सीखें।` : "।"
          }`
        : `${career.title}s start at ${career.salary} in India, with demand rated ${career.demand}. Your backups: ${profile.skilldna?.matches.slice(1, 3).map((m) => `${m.title} (${m.salary})`).join(" and ") ?? "similar bands"}${
            b.missingSkills.length ? `. To reach it, learn ${b.missingSkills.slice(0, 2).join(" and ")}.` : "."
          }`;
    }
    return h
      ? "सैलरी भूमिका और शहर के अनुसार बदलती है। अपना SkillDNA पूरा करें और मैं आपके टॉप मैचों के लिए असली सैलरी बैंड दिखाऊंगा।"
      : "Salaries vary by role and city. Complete your SkillDNA and I'll show realistic bands for your top matches.";
  }

  // ---- 18. Certification ----
  if (has("certification", "certificate", "certified", "सर्टिफिकेट", "प्रमाणपत्र")) {
    const ct = mentioned ?? (career ? careerById(career.id) : undefined);
    const certs = ct?.certifications ?? [];
    return h
      ? `${ct?.title ?? target} के लिए उद्योग-मान्यता प्राप्त सर्टिफिकेशन: ${certs.length ? certs.join(", ") : "स्टार्टर सर्टिफिकेशन"}। इन्हें Training पेज के सर्टिफाइड कोर्स से अर्जित करें और अपने स्किल पासपोर्ट में जोड़ें — भर्तीकर्ता इन्हें वेरिफाइड स्किल मानते हैं।`
      : `Industry-recognized certifications for ${ct?.title ?? target}: ${certs.length ? certs.join(", ") : "starter certifications"}. Earn them through certified courses on the Training page and add them to your Skill Passport — recruiters treat them as verified skill.`;
  }

  // ---- 19. Portfolio / projects ----
  if (has("portfolio", "project", "पोर्टफोलियो", "प्रोजेक्ट")) {
    return h
      ? `पोर्टफोलियो के लिए 2 प्रोजेक्ट पर्याप्त हैं — गुणवत्ता मायने रखती है, मात्रा नहीं। ${target ? `${target} के लिए: 1 ऐसा प्रोजेक्ट जो एक असली समस्या हल करे + 1 जो आपकी मुख्य स्किल दिखाए।` : "ऐसा प्रोजेक्ट बनाएं जो एक असली समस्या हल करे।"} GitHub/Behance पर दस्तावेज़ करें, अपने रिज़्यूमे में जोड़ें, और इंटरव्यू में उसकी कहानी बताएं।`
      : `Two portfolio projects are enough — quality beats quantity. ${target ? `For ${target}: 1 project that solves a real problem + 1 that shows your core skill.` : "Build something that solves a real problem."} Document it on GitHub/Behance, add it to your resume, and tell its story in interviews.`;
  }

  // ---- 20. Applications tips ----
  if (has("apply", "application", "apply to", "आवेदन", "अप्लाई")) {
    return h
      ? `स्मार्ट तरीके से आवेदन करें:\n\n1️⃣ टॉप 5 मैच चुनें (मैच % ≥ 80)\n2️⃣ हर आवेदन के अनुसार रिज़्यूमे समरी ट्वीक करें\n3️⃣ कवर नोट में 2 वाक्य: आप क्यों फिट + एक सबूत (प्रोजेक्ट/सर्टिफिकेट)\n4️⃣ आवेदन ट्रैकर में स्टेटस अपडेट करें\n5️⃣ 4-5 दिन बाद एक सौम्य फॉलो-अप\n\nमैच % और "Why am I a Match?" का उपयोग पहले से ही सही निर्णय लेने के लिए करें।`
      : `Apply smart:\n\n1️⃣ Pick your top 5 matches (match % ≥ 80)\n2️⃣ Tweak your resume summary per application\n3️⃣ In the cover note: 2 lines — why you fit + one proof (project/cert)\n4️⃣ Track each application's stage in the tracker\n5️⃣ Send one gentle follow-up after 4-5 days\n\nUse match % and "Why am I a Match?" to prioritize before applying.`;
  }

  // ---- 21. XP / level / badges ----
  if (has("xp", "level", "badge", "points", "एक्सपी", "लेवल", "बैज")) {
    return h
      ? `आप लेवल ${profile.level} पर हैं, ${profile.xp} XP और ${profile.badges.length} बैज के साथ। अगला लेवल ${profile.level + 1} ${profile.level * 500 + 500 - profile.xp} XP दूर है — क्वेस्ट पूरे करें और कोर्स पूरे करके XP कमाएं।`
      : `You're at Level ${profile.level} with ${profile.xp} XP and ${profile.badges.length} badge${profile.badges.length === 1 ? "" : "s"}. Next level (${profile.level + 1}) is ${profile.level * 500 + 500 - profile.xp} XP away — complete quests and finish courses to earn it.`;
  }

  // ---- 22. City / location ----
  if (has("city", "near me", "location", "शहर", "पास")) {
    const cityInts = INTERNSHIPS.filter((i) => i.location === profile.city || i.remote);
    const cityJobs = JOBS.filter((j) => j.location === profile.city || j.remote);
    const total = cityInts.length + cityJobs.length;
    return h
      ? `${profile.city} में आपके लिए ${total || "कुछ"} इंटर्नशिप और जॉब अवसर हैं। ऑप्शन रडार पर शहर चुनकर पूरा बाज़ार देखें — वहां मांग के हिसाब से हॉटेस्ट सैक्टर भी दिखते हैं।`
      : `${profile.city} has ${total || "several"} internship and job opportunities matched to you. Open the Opportunity Radar, select your city, and see the full market plus the hottest sectors there.`;
  }

  // ---- 23. How many hours / time management ----
  if (has("hours", "time", "how long", "कितने घंटे", "समय")) {
    const perWeek = profile.hoursPerWeek;
    const months = Math.max(3, Math.round(24 / perWeek));
    return h
      ? `आपके ${perWeek} hrs/week पर, एक कोर स्किल में महारत हासिल करने में लगभग ${months} महीने लगते हैं (ट्रेनिंग + अभ्यास + प्रोजेक्ट)। रोज़ाना 25-30 मिनट की छोटी ब्लॉक प्रैक्टिस सबसे तेज़ प्रगति देती है।`
      : `At ${perWeek} hrs/week, expect ~${months} months to master one core skill (training + practice + project). Daily 25-30 minute practice blocks give the fastest progress.`;
  }

  // ---- 24. Fallback ----
  return h
    ? `मुझे आपके ${target || "करियर"} सफर की योजना बनाने में खुशी होगी। पूछें:\n\n• "कौन-सा करियर मुझे सूट करता है?"\n• "आगे क्या सीखना चाहिए?"\n• "मेरे लिए इंटर्नशिप खोजें"\n• "मेरा रिज़्यूमे सुधारें"\n• "मुझे इंटरव्यू प्रैक्टिस कराएं"\n\nअगर आप किसी करियर का नाम बताएं (जैसे "वेब डेवलपर"), तो मैं उसके बारे में विस्तार से बताऊंगा।`
    : `I'd love to help plan your ${target || "career"} journey. Try asking:\n\n• "Which career suits me?"\n• "What should I learn next?"\n• "Find internships for me"\n• "Improve my resume"\n• "Quiz me for interviews"\n\nOr name any career (e.g. "Web Developer") and I'll break it down for you.`;
}

export function emptyResume(profile: Pick<UserProfile, "name" | "email" | "city" | "education" | "skills" | "careerGoal">): ResumeData {
  return {
    name: profile.name,
    email: profile.email,
    phone: "",
    location: profile.city,
    linkedin: "",
    headline: `${profile.careerGoal} Aspirant | ${profile.education}`,
    summary: "",
    skills: profile.skills,
    education: [{ id: "e1", title: profile.education, org: "", period: "", detail: "" }],
    experience: [],
    projects: [],
    certifications: [],
  };
}

export function quickMessages(profile: UserProfile, isHindi: boolean = false): string[] {
  const hasGaps = generateSkillGap(profile.targetCareerId, profile.skills, isHindi).some((g) => g.status !== "met");
  if (isHindi) {
    return [
      hasGaps ? "मुझे आगे क्या सीखना चाहिए?" : "कौन-सा करियर मुझे सूट करता है?",
      "मेरे लिए इंटर्नशिप खोजें",
      "कौन-से स्किल की मांग है?",
      "मुझे इंटरव्यू प्रैक्टिस कराएं",
      "मेरा करियर रोडमैप बनाएं",
      "मेरा रिज़्यूमे सुधारें",
      "क्या मैं आवेदन के लिए तैयार हूं?",
    ];
  }
  return [
    hasGaps ? "What should I learn next?" : "Which career suits me?",
    "Find internships for me",
    "What skills are in demand?",
    "Quiz me for interviews",
    "Build my career roadmap",
    "Improve my resume",
    "Am I ready to apply?",
  ];
}
