"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export type ActionState = { error?: string; ok?: boolean } | undefined;

// ---------- study sessions ----------

const sessionSchema = z
  .object({
    subject: z.string().min(1),
    chapterId: z.string().optional().nullable(),
    topic: z.string().optional().nullable(),
    startedAt: z.string().min(1),
    endedAt: z.string().min(1),
    type: z.string().min(1),
    notes: z.string().optional().nullable(),
  })
  .refine((v) => new Date(v.endedAt) > new Date(v.startedAt), {
    message: "End time must be after start time",
  });

export async function createSessionAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = sessionSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { error: parsed.error.issues[0].message };
    const d = parsed.data;
    const durationMinutes = Math.max(
      1,
      Math.round((new Date(d.endedAt).getTime() - new Date(d.startedAt).getTime()) / 60000)
    );
    const chapterId = d.chapterId || null;
    await prisma.studySession.create({
      data: {
        userId: user.id,
        subject: d.subject,
        chapterId,
        topic: d.topic || null,
        startedAt: new Date(d.startedAt),
        endedAt: new Date(d.endedAt),
        durationMinutes,
        type: d.type,
        notes: d.notes || null,
      },
    });
    revalidatePath("/sessions");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch {
    return { error: "Could not save the session." };
  }
}

export async function deleteSessionAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  await prisma.studySession.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/sessions");
  revalidatePath("/dashboard");
}

// ---------- question logs ----------

const questionLogSchema = z
  .object({
    subject: z.string().min(1),
    chapterId: z.string().optional().nullable(),
    topic: z.string().optional().nullable(),
    total: z.coerce.number().int().min(1).max(1000),
    correct: z.coerce.number().int().min(0).max(1000),
    incorrect: z.coerce.number().int().min(0).max(1000),
    skipped: z.coerce.number().int().min(0).max(1000).default(0),
    difficulty: z.string().default("mixed"),
    date: z.string().min(1),
  })
  .refine((v) => v.correct + v.incorrect <= v.total, {
    message: "Correct + incorrect cannot exceed total questions",
  });

export async function createQuestionLogAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = questionLogSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { error: parsed.error.issues[0].message };
    const d = parsed.data;
    await prisma.questionLog.create({
      data: {
        userId: user.id,
        subject: d.subject,
        chapterId: d.chapterId || null,
        topic: d.topic || null,
        total: d.total,
        correct: d.correct,
        incorrect: d.incorrect,
        skipped: d.skipped,
        difficulty: d.difficulty,
        date: new Date(d.date),
      },
    });
    // keep chapter-level tallies in sync
    if (d.chapterId) {
      await prisma.chapterState.upsert({
        where: { userId_chapterId: { userId: user.id, chapterId: d.chapterId } },
        create: {
          userId: user.id,
          chapterId: d.chapterId,
          status: "learning",
          questionsSolved: d.total,
          questionsCorrect: d.correct,
          lastStudiedAt: new Date(d.date),
        },
        update: {
          questionsSolved: { increment: d.total },
          questionsCorrect: { increment: d.correct },
          lastStudiedAt: new Date(d.date),
        },
      });
    }
    revalidatePath("/questions");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch {
    return { error: "Could not save the log." };
  }
}

export async function deleteQuestionLogAction(formData: FormData) {
  const user = await requireUser();
  await prisma.questionLog.deleteMany({ where: { id: String(formData.get("id")), userId: user.id } });
  revalidatePath("/questions");
}

// ---------- chapter state (tracker / syllabus) ----------

export async function updateChapterStatusAction(formData: FormData) {
  const user = await requireUser();
  const chapterId = String(formData.get("chapterId"));
  const status = String(formData.get("status"));
  await prisma.chapterState.upsert({
    where: { userId_chapterId: { userId: user.id, chapterId } },
    create: { userId: user.id, chapterId, status, lastStudiedAt: status === "not_started" ? undefined : new Date() },
    update: {
      status,
      ...(status !== "not_started" ? { lastStudiedAt: new Date() } : {}),
    },
  });
  revalidatePath("/syllabus");
  revalidatePath("/tracker");
  revalidatePath("/dashboard");
}

export async function updateTopicDoneAction(formData: FormData) {
  const user = await requireUser();
  const chapterId = String(formData.get("chapterId"));
  const topicId = String(formData.get("topicId"));
  const done = String(formData.get("done")) === "true";
  const state = await prisma.chapterState.upsert({
    where: { userId_chapterId: { userId: user.id, chapterId } },
    create: { userId: user.id, chapterId, status: "learning", lastStudiedAt: new Date() },
    update: { lastStudiedAt: new Date() },
  });
  await prisma.topicState.upsert({
    where: { chapterStateId_topicId: { chapterStateId: state.id, topicId } },
    create: { chapterStateId: state.id, topicId, done },
    update: { done },
  });
  revalidatePath("/syllabus");
  revalidatePath(`/tracker/${chapterId}`);
  revalidatePath("/dashboard");
}

export async function updateConfidenceAction(formData: FormData) {
  const user = await requireUser();
  const chapterId = String(formData.get("chapterId"));
  const confidence = Number(formData.get("confidence"));
  await prisma.chapterState.upsert({
    where: { userId_chapterId: { userId: user.id, chapterId } },
    create: { userId: user.id, chapterId, confidence, status: "learning", lastStudiedAt: new Date() },
    update: { confidence, lastStudiedAt: new Date() },
  });
  revalidatePath(`/tracker/${chapterId}`);
}
