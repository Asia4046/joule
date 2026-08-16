import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ results: [] }, { status: 401 });
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 2) return NextResponse.json({ results: [] });

  const [chapters, tests, journal, mistakes, resources, goals] = await Promise.all([
    prisma.chapter.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      select: { id: true, name: true, subject: true },
      take: 5,
    }),
    prisma.mockTest.findMany({
      where: { userId: user.id, name: { contains: q, mode: "insensitive" } },
      select: { id: true, name: true, date: true },
      take: 4,
    }),
    prisma.journalEntry.findMany({
      where: { userId: user.id, OR: [{ title: { contains: q, mode: "insensitive" } }, { body: { contains: q, mode: "insensitive" } }] },
      select: { id: true, title: true, date: true },
      take: 4,
    }),
    prisma.mistake.findMany({
      where: { userId: user.id, question: { contains: q, mode: "insensitive" } },
      select: { id: true, question: true },
      take: 4,
    }),
    prisma.resource.findMany({
      where: { userId: user.id, title: { contains: q, mode: "insensitive" } },
      select: { id: true, title: true },
      take: 4,
    }),
    prisma.goal.findMany({
      where: { userId: user.id, title: { contains: q, mode: "insensitive" } },
      select: { id: true, title: true },
      take: 3,
    }),
  ]);

  const results = [
    ...chapters.map((c) => ({ type: "Chapter", label: c.name, sub: c.subject, href: `/tracker/${c.id}` })),
    ...tests.map((t) => ({ type: "Mock Test", label: t.name, sub: t.date.toLocaleDateString("en-IN"), href: "/mock-tests" })),
    ...journal.map((j) => ({ type: "Journal", label: j.title, sub: j.date.toLocaleDateString("en-IN"), href: "/journal" })),
    ...mistakes.map((m) => ({ type: "Mistake", label: m.question.slice(0, 60), sub: "", href: "/mistakes" })),
    ...resources.map((r) => ({ type: "Resource", label: r.title, sub: "", href: "/resources" })),
    ...goals.map((g) => ({ type: "Goal", label: g.title, sub: "", href: "/goals" })),
  ];

  return NextResponse.json({ results });
}
