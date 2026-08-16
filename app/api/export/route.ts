import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(_req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [profile, sessions, journal, goals, tests, mistakes, logs, resources] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: user.id } }),
    prisma.studySession.findMany({ where: { userId: user.id } }),
    prisma.journalEntry.findMany({ where: { userId: user.id } }),
    prisma.goal.findMany({ where: { userId: user.id } }),
    prisma.mockTest.findMany({ where: { userId: user.id } }),
    prisma.mistake.findMany({ where: { userId: user.id } }),
    prisma.questionLog.findMany({ where: { userId: user.id } }),
    prisma.resource.findMany({ where: { userId: user.id } }),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    account: { email: user.email, name: user.name },
    profile,
    sessions,
    journal,
    goals,
    tests,
    mistakes,
    questionLogs: logs,
    resources,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="jee-command-export.json"`,
    },
  });
}
