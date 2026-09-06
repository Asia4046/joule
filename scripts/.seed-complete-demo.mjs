// One-off: finish the demo-user seed sections that an interrupted run never
// wrote (question logs → resources). Mirrors prisma/seed.ts verbatim, additive
// only, guarded by per-table counts so re-running stays a no-op.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const daysAgo = (n) => new Date(Date.now() - n * 86400000);
const daysFromNow = (n) => new Date(Date.now() + n * 86400000);

let seed = 42;
const rand = () => {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648;
};
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const between = (a, b) => a + rand() * (b - a);

const user = await prisma.user.findUnique({ where: { email: "demo@jee.app" } });
if (!user) throw new Error("demo user missing — run the normal seed first");
const uid = user.id;

const count = (m) => prisma[m].count({ where: { userId: uid } });
const studied = await prisma.chapterState.findMany({
  where: { userId: uid },
  include: { chapter: true },
});
const topicsAll = await prisma.topic.findMany({ include: { chapter: true } });

if ((await count("questionLog")) === 0) {
  console.log("Seeding question logs...");
  for (let d = 60; d >= 0; d -= 1) {
    if (rand() < 0.3) continue;
    const st = pick(studied);
    const total = Math.floor(between(15, 70));
    const acc = between(0.5, 0.9);
    const correct = Math.round(total * acc);
    await prisma.questionLog.create({
      data: {
        userId: uid,
        subject: st.chapter.subject,
        chapterId: st.chapterId,
        total,
        correct,
        incorrect: total - correct,
        date: daysAgo(d),
      },
    });
  }
}

if ((await count("mockTest")) === 0) {
  console.log("Seeding mock tests...");
  const sources = ["Allen Major", "Aakash AIATS", "Physics Wallash", "Resonance Part Test", "NTA Abhyas"];
  for (let i = 0; i < 10; i++) {
    const t = 9 - i; // newer = higher
    const totalMarks = 300;
    const marks = 130 + t * 7 + Math.floor(between(-12, 12));
    const attempted = 55 + Math.floor(between(0, 12));
    const correct = Math.round(attempted * (0.55 + t * 0.028 + between(-0.03, 0.03)));
    const incorrect = attempted - correct;
    const p = marks * (0.36 + between(-0.05, 0.05));
    const c = marks * (0.33 + between(-0.05, 0.05));
    await prisma.mockTest.create({
      data: {
        userId: uid,
        name: `${pick(sources)} #${i + 1}`,
        date: daysAgo(90 - i * 9),
        examType: rand() < 0.7 ? "main" : "advanced",
        source: pick(sources),
        totalMarks,
        marksObtained: marks,
        physicsMarks: Math.round(p),
        chemistryMarks: Math.round(c),
        mathsMarks: Math.round(marks - p - c),
        attempted,
        correct,
        incorrect,
        skipped: 75 - attempted,
        timeMinutes: 180,
        negativeMarks: incorrect,
        percentile: 92 + i * 0.65 + between(-0.5, 0.5),
      },
    });
  }
}

if ((await count("mistake")) === 0) {
  console.log("Seeding mistakes...");
  const mistakeTypes = ["conceptual", "calculation", "silly", "misread", "formula_forgotten", "time_pressure", "guessing"];
  for (let i = 0; i < 24; i++) {
    const t = pick(topicsAll);
    await prisma.mistake.create({
      data: {
        userId: uid,
        subject: t.chapter.subject,
        chapterId: t.chapterId,
        topicId: t.id,
        question: `Q: ${t.name} — JEE-level problem where the correct approach involved applying the core concept carefully. (Demo entry)`,
        myReasoning: "Applied the standard formula but missed the edge case in the problem statement.",
        solution: "Use the constraint given in the second line of the question before substituting values.",
        source: pick(["Allen DPP", "HC Verma", "Cengage", "PYQ 2023", "FIITJEE AITS"]),
        mistakeType: pick(mistakeTypes),
        difficulty: pick(["easy", "medium", "hard"]),
        date: daysAgo(Math.floor(between(0, 45))),
        status: rand() < 0.3 ? "revisited" : "open",
      },
    });
  }
}

if ((await count("revision")) === 0) {
  console.log("Seeding revisions...");
  for (let i = 0; i < 8; i++) {
    const t = pick(topicsAll);
    await prisma.revision.create({
      data: {
        userId: uid,
        topicId: t.id,
        subject: t.chapter.subject,
        dueAt: rand() < 0.6 ? daysAgo(Math.floor(between(0, 3))) : daysFromNow(Math.floor(between(1, 5))),
      },
    });
  }
}

if ((await count("goal")) === 0) {
  console.log("Seeding goals...");
  await prisma.goal.createMany({
    data: [
      { userId: uid, title: "Study 6 hours", kind: "daily", metric: "hours", target: 6, current: between(2, 6) },
      { userId: uid, title: "Solve 60 questions", kind: "daily", metric: "questions", target: 60, current: Math.floor(between(20, 60)) },
      { userId: uid, title: "Finish Integral Calculus", kind: "weekly", metric: "custom", target: 1, current: 0.6 },
      { userId: uid, title: "Take 2 mock tests", kind: "weekly", metric: "mocks", target: 2, current: 1 },
      { userId: uid, title: "JEE Main 99+ percentile", kind: "long_term", metric: "custom", target: 100, current: 97.5 },
      { userId: uid, title: "JEE Advanced under AIR 5000", kind: "long_term", metric: "custom", target: 100, current: 45 },
    ],
  });
}

if ((await count("journalEntry")) === 0) {
  console.log("Seeding journal...");
  const moods = ["focused", "tired", "motivated", "frustrated", "calm", "energetic"];
  for (let i = 0; i < 12; i++) {
    await prisma.journalEntry.create({
      data: {
        userId: uid,
        date: daysAgo(i * 3),
        title: pick(["Deep work day", "Mock analysis", "Backlog clearing", "Concept building", "Revision sprint"]),
        mood: pick(moods),
        studiedWhat: pick(["Rotational motion + problems", "GOC reaction mechanisms", "Definite integration tricks", "Coordination compounds CFT"]),
        understood: "The core concept finally clicked after redoing the derivation from scratch.",
        struggled: pick(["Rolling without slipping problems", "Cannizzaro vs Aldol conditions", "Definite integral properties"]),
        mistakes: "Rushed two questions and misread the given units.",
        tomorrow: "Revise today's mistakes and solve 20 more questions on the same topic.",
        body: "Good session today. Timer helped me stay off the phone. Need to keep the momentum going this week.",
      },
    });
  }
}

if ((await count("resource")) === 0) {
  console.log("Seeding resources...");
  await prisma.resource.createMany({
    data: [
      { userId: uid, type: "book", title: "HC Verma — Concepts of Physics Vol 1 & 2", subject: "Physics", tags: "fundamentals,problems", favorite: true },
      { userId: uid, type: "book", title: "Irodov — Problems in General Physics", subject: "Physics", tags: "advanced" },
      { userId: uid, type: "book", title: "NCERT Chemistry Class 11 & 12", subject: "Chemistry", tags: "must-read,inorganic", favorite: true },
      { userId: uid, type: "book", title: "MS Chouhan — Organic Chemistry", subject: "Chemistry", tags: "organic" },
      { userId: uid, type: "book", title: "Cengage Mathematics Series", subject: "Mathematics", tags: "problems" },
      { userId: uid, type: "video", title: "Rotational Motion full course", url: "https://www.youtube.com/results?search_query=rotational+motion+jee", subject: "Physics", tags: "lectures" },
      { userId: uid, type: "website", title: "NTA Abhyas App mocks", url: "https://nta.ac.in/", subject: "Physics", tags: "mocks" },
      { userId: uid, type: "problem_set", title: "PYQ last 10 years — all subjects", subject: "Physics", tags: "pyq", favorite: true, completed: false },
      { userId: uid, type: "notes", title: "Short notes — Organic reagents map", subject: "Chemistry", tags: "revision" },
    ],
  });
}

console.log("Demo seed completion done.");
await prisma.$disconnect();
