/** Shared helpers for the backup/restore scripts — no side effects on import. */
import { resolve } from "node:path";
import { readFileSync, readdirSync, existsSync } from "node:fs";

/** Minimal .env loader — same keys Next.js would inject (DATABASE_URL, AUTH_SECRET). */
export function loadEnvFile() {
  const path = resolve(process.cwd(), ".env");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let value = m[2];
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[m[1]] === undefined) process.env[m[1]] = value;
  }
}

/** Backup/restore order: parents first, so writes never violate a foreign key. */
export const MODELS = [
  "user",
  "profile",
  "userPreference",
  "chapter",
  "topic",
  "chapterWeightage",
  "chapterState",
  "topicState",
  "studySession",
  "journalEntry",
  "goal",
  "mockTest",
  "mistake",
  "questionLog",
  "revision",
  "resource",
  "notification",
] as const;

export type ModelName = (typeof MODELS)[number];

export function countMigrations(): number {
  const dir = resolve(process.cwd(), "prisma/migrations");
  if (!existsSync(dir)) return 0;
  return readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).length;
}

/** Redacted DATABASE_URL for display (keeps host, hides credentials). */
export function dbLabel(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "unparseable URL";
  }
}
