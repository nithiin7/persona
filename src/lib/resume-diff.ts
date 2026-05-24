import { Resume, WorkExperience, Project, Education } from "./types";

export type DiffStatus = "unchanged" | "added" | "removed" | "changed";

export interface BulletDiff {
  status: DiffStatus;
  base?: string;
  tailored?: string;
}

export interface WorkExpDiff {
  match: "matched" | "added" | "removed";
  base?: WorkExperience;
  tailored?: WorkExperience;
  bulletDiffs: BulletDiff[];
  hasBulletChanges: boolean;
}

export interface SkillCategoryDiff {
  category: string;
  match: "matched" | "added" | "removed";
  addedItems: string[];
  removedItems: string[];
  unchangedItems: string[];
}

export interface ProjectDiff {
  match: "matched" | "added" | "removed";
  base?: Project;
  tailored?: Project;
  bulletDiffs: BulletDiff[];
  hasBulletChanges: boolean;
}

export interface EducationDiff {
  match: "matched" | "added" | "removed";
  base?: Education;
  tailored?: Education;
}

export interface ResumeDiff {
  summaryChanged: boolean;
  baseSummary: string;
  tailoredSummary: string;
  workExperience: WorkExpDiff[];
  skills: SkillCategoryDiff[];
  projects: ProjectDiff[];
  education: EducationDiff[];
  totalChanges: number;
}

// LCS-based array diff
function lcsArrayDiff(base: string[], tailored: string[]): BulletDiff[] {
  const n = base.length;
  const m = tailored.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(m + 1).fill(0)
  );

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      dp[i][j] =
        base[i - 1] === tailored[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  const raw: BulletDiff[] = [];
  let i = n,
    j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && base[i - 1] === tailored[j - 1]) {
      raw.unshift({
        status: "unchanged",
        base: base[i - 1],
        tailored: tailored[j - 1],
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      raw.unshift({ status: "added", tailored: tailored[j - 1] });
      j--;
    } else {
      raw.unshift({ status: "removed", base: base[i - 1] });
      i--;
    }
  }

  // Pair consecutive removed+added as 'changed'
  const result: BulletDiff[] = [];
  let k = 0;
  while (k < raw.length) {
    if (
      raw[k].status === "removed" &&
      k + 1 < raw.length &&
      raw[k + 1].status === "added"
    ) {
      result.push({
        status: "changed",
        base: raw[k].base,
        tailored: raw[k + 1].tailored,
      });
      k += 2;
    } else {
      result.push(raw[k]);
      k++;
    }
  }

  return result;
}

export function computeResumeDiff(base: Resume, tailored: Resume): ResumeDiff {
  const baseSummary = base.professional_summary ?? "";
  const tailoredSummary = tailored.professional_summary ?? "";
  const summaryChanged = baseSummary !== tailoredSummary;

  // Work Experience — match by company+position key
  const tailoredWorkMap = new Map(
    tailored.work_experience.map((w) => [`${w.company}|${w.position}`, w])
  );
  const baseWorkMap = new Map(
    base.work_experience.map((w) => [`${w.company}|${w.position}`, w])
  );

  const workExperience: WorkExpDiff[] = [];

  for (const baseExp of base.work_experience) {
    const key = `${baseExp.company}|${baseExp.position}`;
    const tailoredExp = tailoredWorkMap.get(key);
    if (tailoredExp) {
      const bulletDiffs = lcsArrayDiff(
        baseExp.description,
        tailoredExp.description
      );
      workExperience.push({
        match: "matched",
        base: baseExp,
        tailored: tailoredExp,
        bulletDiffs,
        hasBulletChanges: bulletDiffs.some((b) => b.status !== "unchanged"),
      });
    } else {
      workExperience.push({
        match: "removed",
        base: baseExp,
        bulletDiffs: [],
        hasBulletChanges: false,
      });
    }
  }

  for (const tailoredExp of tailored.work_experience) {
    const key = `${tailoredExp.company}|${tailoredExp.position}`;
    if (!baseWorkMap.has(key)) {
      workExperience.push({
        match: "added",
        tailored: tailoredExp,
        bulletDiffs: [],
        hasBulletChanges: false,
      });
    }
  }

  // Skills — match categories by name
  const tailoredSkillMap = new Map(tailored.skills.map((s) => [s.category, s]));
  const baseSkillMap = new Map(base.skills.map((s) => [s.category, s]));

  const skills: SkillCategoryDiff[] = [];

  for (const baseSkill of base.skills) {
    const tailoredSkill = tailoredSkillMap.get(baseSkill.category);
    if (tailoredSkill) {
      const baseSet = new Set(baseSkill.items);
      const tailoredSet = new Set(tailoredSkill.items);
      skills.push({
        category: baseSkill.category,
        match: "matched",
        addedItems: tailoredSkill.items.filter((i) => !baseSet.has(i)),
        removedItems: baseSkill.items.filter((i) => !tailoredSet.has(i)),
        unchangedItems: baseSkill.items.filter((i) => tailoredSet.has(i)),
      });
    } else {
      skills.push({
        category: baseSkill.category,
        match: "removed",
        addedItems: [],
        removedItems: baseSkill.items,
        unchangedItems: [],
      });
    }
  }

  for (const tailoredSkill of tailored.skills) {
    if (!baseSkillMap.has(tailoredSkill.category)) {
      skills.push({
        category: tailoredSkill.category,
        match: "added",
        addedItems: tailoredSkill.items,
        removedItems: [],
        unchangedItems: [],
      });
    }
  }

  // Projects — match by name
  const tailoredProjectMap = new Map(tailored.projects.map((p) => [p.name, p]));
  const baseProjectMap = new Map(base.projects.map((p) => [p.name, p]));

  const projects: ProjectDiff[] = [];

  for (const baseProject of base.projects) {
    const tailoredProject = tailoredProjectMap.get(baseProject.name);
    if (tailoredProject) {
      const bulletDiffs = lcsArrayDiff(
        baseProject.description,
        tailoredProject.description
      );
      projects.push({
        match: "matched",
        base: baseProject,
        tailored: tailoredProject,
        bulletDiffs,
        hasBulletChanges: bulletDiffs.some((b) => b.status !== "unchanged"),
      });
    } else {
      projects.push({
        match: "removed",
        base: baseProject,
        bulletDiffs: [],
        hasBulletChanges: false,
      });
    }
  }

  for (const tailoredProject of tailored.projects) {
    if (!baseProjectMap.has(tailoredProject.name)) {
      projects.push({
        match: "added",
        tailored: tailoredProject,
        bulletDiffs: [],
        hasBulletChanges: false,
      });
    }
  }

  // Education — match by school name
  const tailoredEduMap = new Map(tailored.education.map((e) => [e.school, e]));
  const baseEduMap = new Map(base.education.map((e) => [e.school, e]));

  const education: EducationDiff[] = [];

  for (const baseEdu of base.education) {
    const tailoredEdu = tailoredEduMap.get(baseEdu.school);
    education.push({
      match: tailoredEdu ? "matched" : "removed",
      base: baseEdu,
      tailored: tailoredEdu,
    });
  }

  for (const tailoredEdu of tailored.education) {
    if (!baseEduMap.has(tailoredEdu.school)) {
      education.push({ match: "added", tailored: tailoredEdu });
    }
  }

  // Count total changes
  let totalChanges = summaryChanged ? 1 : 0;
  for (const w of workExperience) {
    if (w.match !== "matched") totalChanges++;
    else
      totalChanges += w.bulletDiffs.filter(
        (b) => b.status !== "unchanged"
      ).length;
  }
  for (const s of skills) {
    totalChanges += s.addedItems.length + s.removedItems.length;
    if (s.match !== "matched") totalChanges++;
  }
  for (const p of projects) {
    if (p.match !== "matched") totalChanges++;
    else
      totalChanges += p.bulletDiffs.filter(
        (b) => b.status !== "unchanged"
      ).length;
  }
  for (const e of education) {
    if (e.match !== "matched") totalChanges++;
  }

  return {
    summaryChanged,
    baseSummary,
    tailoredSummary,
    workExperience,
    skills,
    projects,
    education,
    totalChanges,
  };
}
