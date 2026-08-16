export const SUBJECTS = ["Physics", "Chemistry", "Mathematics"] as const;
export type Subject = (typeof SUBJECTS)[number];

export const SUBJECT_COLORS: Record<string, string> = {
  Physics: "#6366f1",
  Chemistry: "#10b981",
  Mathematics: "#f59e0b",
};

export const CHAPTER_STATUSES = [
  { value: "not_started", label: "Not Started", color: "#94a3b8" },
  { value: "learning", label: "Learning", color: "#f59e0b" },
  { value: "completed", label: "Completed", color: "#3b82f6" },
  { value: "revision_due", label: "Revision Due", color: "#ef4444" },
  { value: "mastered", label: "Mastered", color: "#10b981" },
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
