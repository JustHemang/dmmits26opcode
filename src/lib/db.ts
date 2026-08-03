// Client-side account database backed by localStorage.
// Once an account is created it is immutable — the record is never overwritten.
// Logins are verified against the stored identifier + password.

export type AccountRecord = {
  name: string;
  identifier: string;
  email: string;
  mobile?: string;
  passwordHash: string;
  city: string;
  education: string;
  createdAt: number;
};

const PREFIX = "sih_account_";

export function isMobileIdentifier(id: string): boolean {
  return /^[6-9]\d{9}$/.test(id.trim());
}

export function isEmailIdentifier(id: string): boolean {
  return /^\S+@\S+\.\S+$/.test(id.trim());
}

export function normalizeIdentifier(id: string): string {
  return id.trim().toLowerCase();
}

export function accountKey(identifier: string): string {
  return PREFIX + normalizeIdentifier(identifier);
}

export function resolveIdentifier(identifier: string): { email: string; mobile?: string } {
  const normalized = normalizeIdentifier(identifier);
  if (isMobileIdentifier(normalized)) {
    return { email: `${normalized}@skillindiahub.in`, mobile: normalized };
  }
  return { email: normalized };
}

export function hashPassword(pw: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < pw.length; i++) {
    const ch = pw.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return `${(h2 >>> 0).toString(16)}${(h1 >>> 0).toString(16)}`;
}

export function createAccount(data: {
  name: string;
  identifier: string;
  password: string;
  city: string;
  education: string;
}): { ok: true; record: AccountRecord } | { ok: false; error: string } {
  const name = data.name.trim();
  if (name.length < 2) return { ok: false, error: "Please enter your full name." };
  if (data.password.length < 6) return { ok: false, error: "Password must be 6+ characters." };
  const isMobile = isMobileIdentifier(data.identifier);
  const isEmail = isEmailIdentifier(data.identifier);
  if (!isMobile && !isEmail) {
    return { ok: false, error: "Enter a valid 10-digit mobile number (starts with 6-9) or an email address." };
  }
  const key = accountKey(data.identifier);
  if (localStorage.getItem(key)) {
    return { ok: false, error: "An account already exists with this email/mobile. Please sign in instead." };
  }
  const resolved = resolveIdentifier(data.identifier);
  const record: AccountRecord = {
    name,
    identifier: normalizeIdentifier(data.identifier),
    email: resolved.email,
    mobile: resolved.mobile,
    passwordHash: hashPassword(data.password),
    city: data.city || "Delhi",
    education: data.education || "Class 12",
    createdAt: Date.now(),
  };
  localStorage.setItem(key, JSON.stringify(record));
  return { ok: true, record };
}

export function findAccount(identifier: string): AccountRecord | null {
  try {
    const raw = localStorage.getItem(accountKey(identifier));
    if (!raw) return null;
    return JSON.parse(raw) as AccountRecord;
  } catch {
    return null;
  }
}

export function verifyLogin(
  identifier: string,
  password: string
): { ok: true; account: AccountRecord } | { ok: false; error: string } {
  const account = findAccount(identifier);
  if (!account) {
    return { ok: false, error: "No account found with this email/mobile. Create an account first." };
  }
  if (hashPassword(password) !== account.passwordHash) {
    return { ok: false, error: "Incorrect password. Try again." };
  }
  return { ok: true, account };
}

// ---------------------------------------------------------------------------
// Employer accounts — real, immutable, verified exactly like seeker accounts.
// ---------------------------------------------------------------------------

export type EmployerRecord = {
  name: string;
  email: string;
  company: string;
  passwordHash: string;
  createdAt: number;
};

const EMP_PREFIX = "sih_employer_account_";
export const EMPLOYER_SESSION_KEY = "sih_employer_session";
export const AUTH_USER_KEY = "sih_auth_user";

export function employerKey(email: string): string {
  return EMP_PREFIX + normalizeIdentifier(email);
}

export function createEmployerAccount(data: {
  name: string;
  company: string;
  email: string;
  password: string;
}): { ok: true; record: EmployerRecord } | { ok: false; error: string } {
  const name = data.name.trim();
  const company = data.company.trim();
  const email = normalizeIdentifier(data.email);
  if (name.length < 2) return { ok: false, error: "Please enter your full name." };
  if (company.length < 2) return { ok: false, error: "Please enter your company name." };
  if (!isEmailIdentifier(email)) return { ok: false, error: "Enter a valid work email address." };
  if (data.password.length < 6) return { ok: false, error: "Password must be 6+ characters." };
  const key = employerKey(email);
  if (localStorage.getItem(key)) {
    return { ok: false, error: "An employer account already exists with this email. Sign in instead." };
  }
  const record: EmployerRecord = {
    name,
    email,
    company,
    passwordHash: hashPassword(data.password),
    createdAt: Date.now(),
  };
  localStorage.setItem(key, JSON.stringify(record));
  return { ok: true, record };
}

export function findEmployerAccount(email: string): EmployerRecord | null {
  try {
    const raw = localStorage.getItem(employerKey(email));
    return raw ? (JSON.parse(raw) as EmployerRecord) : null;
  } catch {
    return null;
  }
}

export function verifyEmployerLogin(
  email: string,
  password: string
): { ok: true; account: EmployerRecord } | { ok: false; error: string } {
  const account = findEmployerAccount(email);
  if (!account) {
    return { ok: false, error: "No employer account found with this email. Create one first." };
  }
  if (hashPassword(password) !== account.passwordHash) {
    return { ok: false, error: "Incorrect password. Try again." };
  }
  return { ok: true, account };
}

export function getEmployerSession(): EmployerRecord | null {
  try {
    const raw = localStorage.getItem(EMPLOYER_SESSION_KEY);
    return raw ? (JSON.parse(raw) as EmployerRecord) : null;
  } catch {
    return null;
  }
}

export function setEmployerSession(record: EmployerRecord | null) {
  if (record) localStorage.setItem(EMPLOYER_SESSION_KEY, JSON.stringify(record));
  else localStorage.removeItem(EMPLOYER_SESSION_KEY);
}

// ---------------------------------------------------------------------------
// Candidate discovery — real registered learners become employer candidates.
// ---------------------------------------------------------------------------

export function listSeekerAccounts(): AccountRecord[] {
  const out: AccountRecord[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(PREFIX)) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) out.push(JSON.parse(raw) as AccountRecord);
      } catch {
        // ignore corrupt entries
      }
    }
  }
  return out.sort((a, b) => b.createdAt - a.createdAt);
}

export function getStoredAuthUser(): UserProfileLike | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? (JSON.parse(raw) as UserProfileLike) : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Posted jobs — a real job board shared between employers and seekers.
// Jobs live per-employer (sih_employer_jobs_<email>) and are aggregated into
// a global board so seekers can find and apply to them.
// ---------------------------------------------------------------------------

export type PostedJob = {
  id: string;
  title: string;
  role: string;
  city: string;
  salary: string;
  skills: string[];
  hires: number;
  employerEmail: string;
  company: string;
  createdAt: number;
};

export type JobApplication = {
  id: string;
  jobId: string;
  employerEmail: string;
  seekerEmail: string;
  seekerName: string;
  status: "applied" | "shortlisted" | "interview" | "interviewed" | "hired" | "rejected";
  aiInterviewData?: {
    transcript: string;
    score: number;
    technicalScore: number;
    verdict: string;
  };
  appliedAt: number;
  updatedAt: number;
};

const EMP_JOBS_PREFIX = "sih_employer_jobs_";
const JOB_APPLICATIONS_KEY = "sih_job_applications";

export function employerJobsKey(email: string): string {
  return EMP_JOBS_PREFIX + normalizeIdentifier(email);
}

export function listEmployerJobs(email: string): PostedJob[] {
  try {
    const raw = localStorage.getItem(employerJobsKey(email));
    if (!raw) return [];
    const emp = findEmployerAccount(email);
    const jobs = JSON.parse(raw) as PostedJob[];
    return jobs.map((j) => ({
      ...j,
      employerEmail: j.employerEmail ?? email,
      company: j.company ?? emp?.company ?? "Skill India Hub Employer",
      createdAt: j.createdAt ?? 0,
    }));
  } catch {
    return [];
  }
}

export function saveEmployerJobs(email: string, jobs: PostedJob[]) {
  try {
    localStorage.setItem(employerJobsKey(email), JSON.stringify(jobs));
  } catch {
    // ignore storage quota errors
  }
}

export function listAllPostedJobs(): PostedJob[] {
  const out: PostedJob[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(EMP_JOBS_PREFIX)) {
      const email = key.slice(EMP_JOBS_PREFIX.length);
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const emp = findEmployerAccount(email);
        const jobs = JSON.parse(raw) as PostedJob[];
        jobs.forEach((j) =>
          out.push({
            ...j,
            employerEmail: j.employerEmail ?? email,
            company: j.company ?? emp?.company ?? "Skill India Hub Employer",
            createdAt: j.createdAt ?? 0,
          })
        );
      } catch {
        // ignore corrupt entries
      }
    }
  }
  return out.sort((a, b) => b.createdAt - a.createdAt);
}

export function findPostedJob(jobId: string): PostedJob | null {
  return listAllPostedJobs().find((j) => j.id === jobId) ?? null;
}

function loadJobApplications(): JobApplication[] {
  try {
    const raw = localStorage.getItem(JOB_APPLICATIONS_KEY);
    return raw ? (JSON.parse(raw) as JobApplication[]) : [];
  } catch {
    return [];
  }
}

function saveJobApplications(apps: JobApplication[]) {
  try {
    localStorage.setItem(JOB_APPLICATIONS_KEY, JSON.stringify(apps));
  } catch {
    // ignore storage quota errors
  }
}

export function listJobApplications(): JobApplication[] {
  return loadJobApplications().sort((a, b) => b.appliedAt - a.appliedAt);
}

export function applyToPostedJob(
  job: PostedJob,
  seeker: { name: string; email: string }
): { ok: true; application: JobApplication } | { ok: false; error: "alreadyApplied" } {
  const apps = loadJobApplications();
  const exists = apps.some((a) => a.jobId === job.id && normalizeIdentifier(a.seekerEmail) === normalizeIdentifier(seeker.email));
  if (exists) return { ok: false, error: "alreadyApplied" };
  const application: JobApplication = {
    id: `ja${Date.now()}${Math.floor(Math.random() * 900 + 100)}`,
    jobId: job.id,
    employerEmail: job.employerEmail,
    seekerEmail: normalizeIdentifier(seeker.email),
    seekerName: seeker.name.trim(),
    status: "applied",
    appliedAt: Date.now(),
    updatedAt: Date.now(),
  };
  saveJobApplications([application, ...apps]);
  return { ok: true, application };
}

export function setJobApplicationStatus(appId: string, status: JobApplication["status"]) {
  const apps = loadJobApplications();
  saveJobApplications(apps.map((a) => (a.id === appId ? { ...a, status, updatedAt: Date.now() } : a)));
}

export function submitAiInterview(
  appId: string,
  data: { transcript: string; score: number; technicalScore: number; verdict: string }
) {
  const apps = loadJobApplications();
  saveJobApplications(
    apps.map((a) =>
      a.id === appId
        ? {
            ...a,
            status: "interviewed",
            aiInterviewData: data,
            updatedAt: Date.now(),
          }
        : a
    )
  );
}

export function getProgressByEmail(email: string): UserProfileLike | null {
  try {
    const id = (email ?? "").toLowerCase().trim().replace(/[^a-z0-9@.]/gi, "_");
    const raw = localStorage.getItem("sih_progress_" + id);
    return raw ? (JSON.parse(raw) as UserProfileLike) : null;
  } catch {
    return null;
  }
}

export type ApplicantDetail = {
  name: string;
  email: string;
  city: string;
  education: string;
  targetCareer: string;
  skillLevel: string;
  skills: string[];
  xp: number;
};

export function getApplicantDetail(seekerEmail: string): ApplicantDetail {
  const email = normalizeIdentifier(seekerEmail);
  const account = findAccount(email);
  const prog = getProgressByEmail(email);
  return {
    name: account?.name ?? prog?.name ?? "Skill India Learner",
    email,
    city: account?.city ?? prog?.city ?? "India",
    education: account?.education ?? prog?.education ?? "",
    targetCareer: prog?.targetCareer ?? "",
    skillLevel: prog?.skillLevel ?? "Beginner",
    skills: (prog?.skills ?? []).map((s) => s.name),
    xp: prog?.xp ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Seeker candidates for employer dashboards — real registered learners.
// ---------------------------------------------------------------------------

export type SeekerCandidate = {
  id: string;
  name: string;
  email: string;
  city: string;
  education: string;
  targetCareer: string;
  skillLevel: string;
  skills: string[];
  xp: number;
  createdAt: number;
};

export function getSeekerProgress(account: AccountRecord): UserProfileLike | null {
  try {
    const id = (account.email ?? "").toLowerCase().trim().replace(/[^a-z0-9@.]/gi, "_");
    const raw = localStorage.getItem("sih_progress_" + id);
    return raw ? (JSON.parse(raw) as UserProfileLike) : null;
  } catch {
    return null;
  }
}

export function listSeekerCandidates(): SeekerCandidate[] {
  return listSeekerAccounts().map((acc) => {
    const prog = getSeekerProgress(acc);
    return {
      id: acc.email,
      name: acc.name,
      email: acc.email,
      city: acc.city,
      education: acc.education,
      targetCareer: prog?.targetCareer ?? "",
      skillLevel: prog?.skillLevel ?? "Beginner",
      skills: (prog?.skills ?? []).map((s) => s.name),
      xp: prog?.xp ?? 0,
      createdAt: acc.createdAt,
    };
  });
}

type UserProfileLike = {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  city: string;
  education: string;
  skillLevel?: string;
  skills: { name: string; level: string }[];
  targetCareer: string;
  xp: number;
  level: number;
};
