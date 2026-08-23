"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { DEFAULT_REVISION_INTERVALS, DEMO_EMAIL } from "@/lib/constants";
import { customizationSchema, DASHBOARD_WIDGETS } from "@/lib/customization";

export type ActionState = { error?: string; ok?: boolean } | undefined;

// ---------- journal ----------

const journalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  date: z.string().min(1),
  mood: z.string().optional().nullable(),
  studiedWhat: z.string().optional().nullable(),
  understood: z.string().optional().nullable(),
  struggled: z.string().optional().nullable(),
  mistakes: z.string().optional().nullable(),
  tomorrow: z.string().optional().nullable(),
  body: z.string().default(""),
});

export async function saveJournalAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const id = String(formData.get("id") || "");
  const parsed = journalSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  const data = {
    title: d.title,
    date: new Date(d.date),
    mood: d.mood || null,
    studiedWhat: d.studiedWhat || null,
    understood: d.understood || null,
    struggled: d.struggled || null,
    mistakes: d.mistakes || null,
    tomorrow: d.tomorrow || null,
    body: d.body ?? "",
  };
  if (id) {
    await prisma.journalEntry.updateMany({ where: { id, userId: user.id }, data });
  } else {
    await prisma.journalEntry.create({ data: { ...data, userId: user.id } });
  }
  revalidatePath("/journal");
  return { ok: true };
}

export async function deleteJournalAction(formData: FormData) {
  const user = await requireUser();
  await prisma.journalEntry.deleteMany({ where: { id: String(formData.get("id")), userId: user.id } });
  revalidatePath("/journal");
}

// ---------- goals ----------

const goalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  kind: z.enum(["daily", "weekly", "long_term"]),
  metric: z.enum(["hours", "questions", "chapters", "mocks", "custom"]),
  target: z.coerce.number().positive("Target must be positive"),
  deadline: z.string().optional().nullable(),
});

export async function createGoalAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = goalSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  await prisma.goal.create({
    data: {
      userId: user.id,
      title: d.title,
      kind: d.kind,
      metric: d.metric,
      target: d.target,
      deadline: d.deadline ? new Date(d.deadline) : null,
    },
  });
  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateGoalProgressAction(formData: FormData) {
  const user = await requireUser();
  const parsed = z
    .object({ id: z.string().min(1), current: z.coerce.number().min(0).max(1_000_000) })
    .safeParse({ id: formData.get("id"), current: formData.get("current") });
  if (!parsed.success) return;
  const { id, current } = parsed.data;
  const completed = formData.has("completed");
  const goal = await prisma.goal.findFirst({ where: { id, userId: user.id } });
  if (!goal) return;
  await prisma.goal.update({
    where: { id },
    data: { current, completed: completed || current >= goal.target },
  });
  revalidatePath("/goals");
  revalidatePath("/dashboard");
}

export async function deleteGoalAction(formData: FormData) {
  const user = await requireUser();
  await prisma.goal.deleteMany({ where: { id: String(formData.get("id")), userId: user.id } });
  revalidatePath("/goals");
}

// ---------- mock tests ----------

const mockTestSchema = z
  .object({
    name: z.string().min(1, "Test name is required"),
    date: z.string().min(1),
    examType: z.enum(["main", "advanced"]),
    source: z.string().optional().nullable(),
    totalMarks: z.coerce.number().positive(),
    marksObtained: z.coerce.number().min(0),
    physicsMarks: z.coerce.number().min(0).optional().nullable(),
    chemistryMarks: z.coerce.number().min(0).optional().nullable(),
    mathsMarks: z.coerce.number().min(0).optional().nullable(),
    attempted: z.coerce.number().int().min(0),
    correct: z.coerce.number().int().min(0),
    incorrect: z.coerce.number().int().min(0),
    skipped: z.coerce.number().int().min(0).default(0),
    timeMinutes: z.coerce.number().int().positive(),
    negativeMarks: z.coerce.number().min(0).default(0),
    percentile: z.coerce.number().min(0).max(100).optional().nullable(),
    rank: z.coerce.number().int().min(0).optional().nullable(),
  })
  .refine((v) => v.marksObtained <= v.totalMarks, { message: "Marks cannot exceed total marks" })
  .refine((v) => v.correct + v.incorrect <= v.attempted, { message: "Correct + incorrect cannot exceed attempted" });

function num(formData: FormData, key: string): number | null {
  const v = formData.get(key);
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function createMockTestAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = mockTestSchema.safeParse({
    name: formData.get("name"),
    date: formData.get("date"),
    examType: formData.get("examType"),
    source: formData.get("source"),
    totalMarks: formData.get("totalMarks"),
    marksObtained: formData.get("marksObtained"),
    physicsMarks: num(formData, "physicsMarks") ?? undefined,
    chemistryMarks: num(formData, "chemistryMarks") ?? undefined,
    mathsMarks: num(formData, "mathsMarks") ?? undefined,
    attempted: formData.get("attempted"),
    correct: formData.get("correct"),
    incorrect: formData.get("incorrect"),
    skipped: formData.get("skipped") ?? 0,
    timeMinutes: formData.get("timeMinutes"),
    negativeMarks: formData.get("negativeMarks") ?? 0,
    percentile: num(formData, "percentile") ?? undefined,
    rank: num(formData, "rank") ?? undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  await prisma.mockTest.create({
    data: {
      userId: user.id,
      name: d.name,
      date: new Date(d.date),
      examType: d.examType,
      source: d.source || null,
      totalMarks: d.totalMarks,
      marksObtained: d.marksObtained,
      physicsMarks: d.physicsMarks ?? null,
      chemistryMarks: d.chemistryMarks ?? null,
      mathsMarks: d.mathsMarks ?? null,
      attempted: d.attempted,
      correct: d.correct,
      incorrect: d.incorrect,
      skipped: d.skipped,
      timeMinutes: d.timeMinutes,
      negativeMarks: d.negativeMarks,
      percentile: d.percentile ?? null,
      rank: d.rank ?? null,
    },
  });
  // weekly mock goals
  await prisma.goal.updateMany({
    where: { userId: user.id, metric: "mocks", kind: "weekly", completed: false },
    data: { current: { increment: 1 } },
  });
  revalidatePath("/mock-tests");
  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteMockTestAction(formData: FormData) {
  const user = await requireUser();
  const deleted = await prisma.mockTest.deleteMany({
    where: { id: String(formData.get("id")), userId: user.id },
  });
  if (deleted.count === 0) return;
  // undo createMockTestAction's increment of weekly mock goals, clamped at 0
  await prisma.goal.updateMany({
    where: { userId: user.id, metric: "mocks", kind: "weekly", completed: false },
    data: { current: { decrement: 1 } },
  });
  await prisma.goal.updateMany({
    where: { userId: user.id, metric: "mocks", kind: "weekly", current: { lt: 0 } },
    data: { current: 0 },
  });
  revalidatePath("/mock-tests");
  revalidatePath("/goals");
  revalidatePath("/dashboard");
}

// ---------- mistakes ----------

const mistakeSchema = z.object({
  subject: z.string().min(1),
  chapterId: z.string().optional().nullable(),
  topicId: z.string().optional().nullable(),
  question: z.string().min(1, "Describe the question"),
  myReasoning: z.string().optional().nullable(),
  solution: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  mistakeType: z.string().min(1),
  difficulty: z.enum(["easy", "medium", "hard"]),
  date: z.string().min(1),
});

export async function createMistakeAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = mistakeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  await prisma.mistake.create({
    data: {
      userId: user.id,
      subject: d.subject,
      chapterId: d.chapterId || null,
      topicId: d.topicId || null,
      question: d.question,
      myReasoning: d.myReasoning || null,
      solution: d.solution || null,
      source: d.source || null,
      mistakeType: d.mistakeType,
      difficulty: d.difficulty,
      date: new Date(d.date),
    },
  });
  revalidatePath("/mistakes");
  return { ok: true };
}

const mistakeStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["open", "revisited", "resolved"]),
});

export async function updateMistakeStatusAction(formData: FormData) {
  const user = await requireUser();
  const parsed = mistakeStatusSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
  if (!parsed.success) return;
  await prisma.mistake.updateMany({
    where: { id: parsed.data.id, userId: user.id },
    data: { status: parsed.data.status },
  });
  revalidatePath("/mistakes");
}

export async function deleteMistakeAction(formData: FormData) {
  const user = await requireUser();
  await prisma.mistake.deleteMany({ where: { id: String(formData.get("id")), userId: user.id } });
  revalidatePath("/mistakes");
}

// ---------- revision ----------

export async function completeRevisionAction(formData: FormData) {
  const user = await requireUser();
  const revisionId = String(formData.get("id"));
  const revision = await prisma.revision.findFirst({ where: { id: revisionId, userId: user.id } });
  if (!revision) return;
  const prefs = await prisma.userPreference.findUnique({ where: { userId: user.id } });
  const intervals: number[] = Array.isArray(prefs?.revisionIntervals)
    ? (prefs!.revisionIntervals as number[])
    : DEFAULT_REVISION_INTERVALS;

  // advance to next interval based on how many revisions this topic has had
  const pastCount = await prisma.revision.count({
    where: { userId: user.id, topicId: revision.topicId, completedAt: { not: null } },
  });
  const nextDays = intervals[Math.min(pastCount, intervals.length - 1)] ?? 7;

  await prisma.$transaction([
    prisma.revision.update({ where: { id: revisionId }, data: { completedAt: new Date() } }),
    prisma.revision.create({
      data: {
        userId: user.id,
        topicId: revision.topicId,
        subject: revision.subject,
        dueAt: new Date(Date.now() + nextDays * 86400000),
      },
    }),
  ]);
  revalidatePath("/revision");
  revalidatePath("/dashboard");
}

const scheduleRevisionSchema = z.object({
  topicId: z.string().min(1),
  days: z.coerce.number().int().min(0).max(365).default(1),
});

export async function scheduleRevisionAction(formData: FormData) {
  const user = await requireUser();
  const parsed = scheduleRevisionSchema.safeParse({
    topicId: formData.get("topicId"),
    days: formData.get("days") ?? 1,
  });
  if (!parsed.success) return;
  const { topicId, days } = parsed.data;
  const topic = await prisma.topic.findUnique({ where: { id: topicId }, include: { chapter: true } });
  if (!topic) return;
  await prisma.revision.create({
    data: {
      userId: user.id,
      topicId,
      subject: topic.chapter.subject,
      dueAt: new Date(Date.now() + days * 86400000),
    },
  });
  revalidatePath("/revision");
}

// ---------- resources ----------

const resourceSchema = z.object({
  type: z.string().min(1),
  title: z.string().min(1, "Title is required"),
  url: z.string().url("Enter a valid URL").optional().or(z.literal("")).nullable(),
  subject: z.string().optional().nullable(),
  topicId: z.string().optional().nullable(),
  tags: z.string().optional().nullable(),
});

export async function createResourceAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = resourceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  await prisma.resource.create({
    data: {
      userId: user.id,
      type: d.type,
      title: d.title,
      url: d.url || null,
      subject: d.subject || null,
      topicId: d.topicId || null,
      tags: d.tags || "",
    },
  });
  revalidatePath("/resources");
  return { ok: true };
}

export async function toggleResourceFlagAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const field = String(formData.get("field")); // favorite | completed
  const value = String(formData.get("value")) === "true";
  if (field !== "favorite" && field !== "completed") return;
  await prisma.resource.updateMany({
    where: { id, userId: user.id },
    data: field === "favorite" ? { favorite: value } : { completed: value },
  });
  revalidatePath("/resources");
}

export async function deleteResourceAction(formData: FormData) {
  const user = await requireUser();
  await prisma.resource.deleteMany({ where: { id: String(formData.get("id")), userId: user.id } });
  revalidatePath("/resources");
}

// ---------- settings / profile ----------

export async function updateProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return { error: "Name is too short." };
  await prisma.user.update({
    where: { id: user.id },
    data: { name },
  });
  await prisma.profile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      targetExam: String(formData.get("targetExam") ?? "both"),
      targetYear: Number(formData.get("targetYear")) || 2027,
      targetPercentile: num(formData, "targetPercentile"),
      targetRank: num(formData, "targetRank"),
      prepLevel: String(formData.get("prepLevel") ?? "intermediate"),
      dailyStudyTargetMinutes: Number(formData.get("dailyStudyTargetMinutes")) || 360,
      dailyQuestionTarget: Number(formData.get("dailyQuestionTarget")) || 60,
    },
    update: {
      targetExam: String(formData.get("targetExam") ?? "both"),
      targetYear: Number(formData.get("targetYear")) || 2027,
      targetPercentile: num(formData, "targetPercentile"),
      targetRank: num(formData, "targetRank"),
      prepLevel: String(formData.get("prepLevel") ?? "intermediate"),
      dailyStudyTargetMinutes: Number(formData.get("dailyStudyTargetMinutes")) || 360,
      dailyQuestionTarget: Number(formData.get("dailyQuestionTarget")) || 60,
    },
  });
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updatePreferencesAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const intervals = String(formData.get("revisionIntervals") ?? "")
    .split(",")
    .map((x) => parseInt(x.trim(), 10))
    .filter((x) => Number.isFinite(x) && x > 0)
    .slice(0, 10);
  await prisma.userPreference.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      revisionIntervals: intervals.length ? intervals : DEFAULT_REVISION_INTERVALS,
      notifyRevision: formData.get("notifyRevision") === "on",
      notifyGoals: formData.get("notifyGoals") === "on",
      notifyStreak: formData.get("notifyStreak") === "on",
      notifyMockTests: formData.get("notifyMockTests") === "on",
    },
    update: {
      revisionIntervals: intervals.length ? intervals : DEFAULT_REVISION_INTERVALS,
      notifyRevision: formData.get("notifyRevision") === "on",
      notifyGoals: formData.get("notifyGoals") === "on",
      notifyStreak: formData.get("notifyStreak") === "on",
      notifyMockTests: formData.get("notifyMockTests") === "on",
    },
  });
  revalidatePath("/settings");
  return { ok: true };
}

export async function updateCustomizationAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = customizationSchema.safeParse({
    accent: formData.get("accent"),
    avatarEmoji: formData.get("avatarEmoji") ?? "",
    avatarBean: formData.get("avatarBean"),
    avatarUrl: formData.get("avatarUrl") ?? "",
    focusMinutes: formData.get("focusMinutes"),
    weekStartsOn: Number(formData.get("weekStartsOn")),
    hour12: formData.get("hour12") === "on",
    dashboard: Object.fromEntries(
      DASHBOARD_WIDGETS.map((w) => [w.key, formData.get(`dash_${w.key}`) === "on"])
    ),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await prisma.userPreference.upsert({
    where: { userId: user.id },
    create: { userId: user.id, customization: parsed.data },
    update: { customization: parsed.data },
  });
  // the shell (avatar) and root theme (accent) render outside this page
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function changePasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  if (user.email === DEMO_EMAIL) return { error: "The demo account's password can't be changed." };
  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  if (next.length < 8) return { error: "New password must be at least 8 characters." };
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) return { error: "Account not found." };
  const { default: bcrypt } = await import("bcryptjs");
  if (!(await bcrypt.compare(current, dbUser.passwordHash))) {
    return { error: "Current password is incorrect." };
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(next, 12) },
  });
  return { ok: true };
}

export async function deleteAccountAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  if (user.email === DEMO_EMAIL) return { error: "The demo account can't be deleted." };
  const confirm = String(formData.get("confirm") ?? "");
  if (confirm !== "DELETE") return { error: 'Type DELETE to confirm account deletion.' };
  await prisma.user.delete({ where: { id: user.id } });
  const { destroySession } = await import("@/lib/auth");
  await destroySession();
  redirect("/login");
}
