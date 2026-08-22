import { J, SUBJECT_COLORS as BEAN_SUBJECTS, beanOn } from "@/lib/jellybeans";

export const SUBJECTS = ["Physics", "Chemistry", "Mathematics"] as const;
export type Subject = (typeof SUBJECTS)[number];

// Data-encoding colors (charts, progress, statuses) — jellybean deeps on
// light paper, fills on dark. The UI chrome itself stays ink on paper.
export const SUBJECT_COLORS: Record<string, string> = Object.fromEntries(
  Object.entries(BEAN_SUBJECTS).map(([k, v]) => [k, v.deep])
);

export const subjectBean = (subject: string): { fill: string; deep: string } =>
  BEAN_SUBJECTS[subject] ?? J.bean.bubblegum;

/** Mode-aware subject color for charts/graphs — deep on light paper, fill on dark. */
export const subjectColor = (subject: string, dark: boolean) =>
  beanOn(subjectBean(subject), dark);

/**
 * Mode-aware sx for subject-colored data in Server Components (which can't
 * call useTheme): the deep variant applies by default and the pastel fill
 * takes over under [data-jee-theme="dark"], set by Providers on <html>.
 */
export const subjectBarSx = (subject: string) => {
  const bean = subjectBean(subject);
  return {
    "& .MuiLinearProgress-bar": { bgcolor: bean.deep },
    '[data-jee-theme="dark"] & .MuiLinearProgress-bar': { bgcolor: bean.fill },
  };
};

export const subjectDotSx = (subject: string) => {
  const bean = subjectBean(subject);
  return {
    bgcolor: bean.deep,
    '[data-jee-theme="dark"] &': { bgcolor: bean.fill },
  };
};

export const subjectBorderSx = (subject: string) => {
  const bean = subjectBean(subject);
  return {
    borderColor: bean.deep,
    '[data-jee-theme="dark"] &': { borderColor: bean.fill },
  };
};

export const CHAPTER_STATUSES = [
  { value: "not_started", label: "Not Started", color: "#8A857B" },
  { value: "learning", label: "Learning", color: J.bean.lemon.deep },
  { value: "completed", label: "Completed", color: J.bean.mint.deep },
  { value: "revision_due", label: "Revision Due", color: J.bean.cherry.deep },
  { value: "mastered", label: "Mastered", color: "#0E5A38" },
] as const;

export const STUDY_TYPES = [
  { value: "concept", label: "Concept Learning" },
  { value: "practice", label: "Problem Solving" },
  { value: "revision", label: "Revision" },
  { value: "mock_test", label: "Mock Test" },
  { value: "analysis", label: "Analysis" },
  { value: "lecture", label: "Lecture" },
  { value: "reading", label: "Reading" },
] as const;

export const MISTAKE_TYPES = [
  { value: "conceptual", label: "Conceptual" },
  { value: "calculation", label: "Calculation" },
  { value: "silly", label: "Silly" },
  { value: "misread", label: "Misread Question" },
  { value: "formula_forgotten", label: "Formula Forgotten" },
  { value: "time_pressure", label: "Time Pressure" },
  { value: "guessing", label: "Guessing" },
] as const;

export const RESOURCE_TYPES = [
  { value: "book", label: "Book" },
  { value: "video", label: "YouTube / Video" },
  { value: "pdf", label: "PDF" },
  { value: "website", label: "Website" },
  { value: "notes", label: "Notes" },
  { value: "problem_set", label: "Problem Set" },
  { value: "course", label: "Course" },
] as const;

export const DEFAULT_REVISION_INTERVALS = [1, 3, 7, 14, 30, 60];

export const labelFor = <T extends { value: string; label: string }>(list: readonly T[], value: string) =>
  list.find((x) => x.value === value)?.label ?? value;
