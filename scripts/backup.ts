/**
 * Full-database backup for Joule.
 *
 *   tsx scripts/backup.ts [output-file]
 *
 * Dumps every table via Prisma into a single JSON file (default:
 * backups/joule-backup-YYYYMMDD-HHMMSS.json). Pure Node — no pg_dump or local
 * PostgreSQL install needed, works against any DATABASE_URL (local, Neon, …).
 * Restore with scripts/restore.ts.
 */
import { PrismaClient } from "@prisma/client";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { loadEnvFile, MODELS, countMigrations } from "./lib";

async function main() {
  loadEnvFile();
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set (put it in .env or the environment).");
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const data = {
      user: await prisma.user.findMany(),
      profile: await prisma.profile.findMany(),
      userPreference: await prisma.userPreference.findMany(),
      chapter: await prisma.chapter.findMany(),
      topic: await prisma.topic.findMany(),
      chapterWeightage: await prisma.chapterWeightage.findMany(),
      chapterState: await prisma.chapterState.findMany(),
      topicState: await prisma.topicState.findMany(),
      studySession: await prisma.studySession.findMany(),
      journalEntry: await prisma.journalEntry.findMany(),
      goal: await prisma.goal.findMany(),
      mockTest: await prisma.mockTest.findMany(),
      mistake: await prisma.mistake.findMany(),
      questionLog: await prisma.questionLog.findMany(),
      revision: await prisma.revision.findMany(),
      resource: await prisma.resource.findMany(),
      notification: await prisma.notification.findMany(),
    };

    const counts = Object.fromEntries(MODELS.map((m) => [m, data[m].length]));
    const total = MODELS.reduce((sum, m) => sum + data[m].length, 0);

    const payload = {
      meta: {
        app: "joule",
        schemaVersion: countMigrations(),
        createdAt: new Date().toISOString(),
        counts,
      },
      data,
    };

    const now = new Date();
    const p = (n: number) => String(n).padStart(2, "0");
    const stamp = `${now.getFullYear()}${p(now.getMonth() + 1)}${p(now.getDate())}-${p(now.getHours())}${p(now.getMinutes())}${p(now.getSeconds())}`;
    const out = resolve(process.cwd(), process.argv[2] ?? `backups/joule-backup-${stamp}.json`);
    await mkdir(dirname(out), { recursive: true });
    const json = JSON.stringify(payload, null, 1);
    await writeFile(out, json, "utf8");

    console.log(`Backup written: ${out}`);
    console.log(`  ${(json.length / 1024).toFixed(1)} kB · ${total} rows total`);
    for (const [model, count] of Object.entries(counts)) {
      console.log(`  ${model.padEnd(18)} ${count}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("Backup failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
