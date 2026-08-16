export const SUBJECTS = ["Physics", "Chemistry", "Mathematics"] as const;
export type Subject = (typeof SUBJECTS)[number];

// Data-encoding colors (charts, progress, statuses) — kept muted-warm to sit
// on the paper/ink chrome. The UI chrome itself stays monochrome.
export const SUBJECT_COLORS: Record<string, string> = {
  Physics: "#C05C3C",
  Chemistry: "#43806B",
  Mathematics: "#3E5F8A",
};

export const CHAPTER_STATUSES = [
  { value: "not_started", label: "Not Started", color: "#8A877F" },
  { value: "learning", label: "Learning", color: "#C77D2E" },
  { value: "completed", label: "Completed", color: "#43806B" },
  { value: "revision_due", label: "Revision Due", color: "#BF4B4B" },
  { value: "mastered", label: "Mastered", color: "#2E6E4E" },
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
