/**
 * Full-database restore for Joule — the counterpart to scripts/backup.ts.
 *
 *   tsx scripts/restore.ts [backup-file] [--yes]
 *
 * Replaces ALL data in the database with the contents of a backup file
 * (default: the newest backups/joule-backup-*.json). Everything runs in one
 * transaction: children are deleted first, then rows are recreated in
 * parent-first order with their original ids, so accounts, sessions, hashes
 * and cross-links survive exactly as they were.
 */
import { PrismaClient } from "@prisma/client";
import { readdirSync, existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { loadEnvFile, MODELS, countMigrations, dbLabel, type ModelName } from "./lib";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

type Backup = {
  meta: { app: string; schemaVersion: number; createdAt: string; counts: Record<string, number> };
  data: Record<string, Record<string, unknown>[]>;
};

/** JSON has no Date type — turn ISO datetime strings back into Date objects for Prisma. */
function reviveDates(rows: Record<string, unknown>[]): Record<string, unknown>[] {
  return rows.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([k, v]) => [k, typeof v === "string" && ISO_DATE.test(v) ? new Date(v) : v])
    )
  );
}

/** Postgres caps statement parameters (~65k) — insert long tables in chunks. */
async function createManyChunked(
  client: { createMany: (a: { data: unknown[] }) => Promise<unknown> },
  rows: Record<string, unknown>[]
) {
  const CHUNK = 500;
  for (let i = 0; i < rows.length; i += CHUNK) {
    await client.createMany({ data: rows.slice(i, i + CHUNK) });
  }
}

async function latestBackup(): Promise<string | null> {
  const dir = resolve(process.cwd(), "backups");
  if (!existsSync(dir)) return null;
  const files = readdirSync(dir)
    .filter((f) => /^joule-backup-.*\.json$/.test(f))
    .sort();
  return files.length ? resolve(dir, files[files.length - 1]) : null;
}

async function confirm(question: string): Promise<boolean> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = (await rl.question(question)).trim().toLowerCase();
  rl.close();
  return answer === "y" || answer === "yes";
}

async function main() {
  loadEnvFile();
  const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const skipConfirm = process.argv.slice(2).includes("--yes");
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set (put it in .env or the environment).");
    process.exit(1);
  }

  const file = resolve(process.cwd(), args[0] ?? (await latestBackup() ?? ""));
  if (!file || !existsSync(file)) {
    console.error("Backup file not found. Pass a path or run scripts/backup.ts first.");
    process.exit(1);
  }

  const backup: Backup = JSON.parse(await readFile(file, "utf8"));
  if (backup.meta?.app !== "joule" || typeof backup.data !== "object") {
    console.error("This does not look like a Joule backup file.");
    process.exit(1);
  }
  for (const m of MODELS) {
    if (!Array.isArray(backup.data[m])) backup.data[m] = [];
  }

  const currentVersion = countMigrations();
  if (backup.meta.schemaVersion > currentVersion) {
    console.error(
      `Backup schema (v${backup.meta.schemaVersion}) is newer than the database schema (v${currentVersion}). ` +
        "Run `npx prisma migrate deploy` before restoring."
    );
    process.exit(1);
  }
  if (backup.meta.schemaVersion < currentVersion) {
    console.log(
      `Note: backup is from an older schema (v${backup.meta.schemaVersion} → v${currentVersion}); ` +
        "columns added since will take their defaults."
    );
  }

  const total = MODELS.reduce((sum, m) => sum + backup.data[m].length, 0);
  console.log(`Backup:  ${file}`);
  console.log(`Created: ${backup.meta.createdAt} · ${total} rows`);
  console.log(`Target:  ${dbLabel(process.env.DATABASE_URL)} — ALL existing data will be replaced.`);
  if (!skipConfirm) {
    const ok = await confirm("Type y to wipe and restore, anything else to abort: ");
    if (!ok) {
      console.log("Aborted — nothing was changed.");
      process.exit(0);
    }
  }

  const prisma = new PrismaClient();
  try {
    const restored = await prisma.$transaction(
      async (tx) => {
        // children first — reverse of the parent-first MODELS order
        for (const model of [...MODELS].reverse()) {
          await (tx as unknown as Record<ModelName, { deleteMany: () => Promise<unknown> }>)[model].deleteMany();
        }
        for (const model of MODELS) {
          const rows = reviveDates(backup.data[model]);
          if (!rows.length) continue;
          await createManyChunked(
            (tx as unknown as Record<ModelName, { createMany: (a: { data: unknown[] }) => Promise<unknown> }>)[model],
            rows
          );
        }
        return Object.fromEntries(MODELS.map((m) => [m, backup.data[m].length])) as Record<string, number>;
      },
      { timeout: 120_000 }
    );

    console.log("Restore complete:");
    for (const [model, count] of Object.entries(restored)) {
      console.log(`  ${model.padEnd(18)} ${count}`);
    }
    console.log("Passwords, sessions and all cross-links were restored verbatim.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("Restore failed (the transaction rolled back — data is unchanged):", err instanceof Error ? err.message : err);
  process.exit(1);
});
