import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { generateNotifications } from "@/lib/notifications";

export async function GET(_req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await generateNotifications(user.id);

  const [items, unread] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.notification.count({ where: { userId: user.id, read: false } }),
  ]);

  return NextResponse.json({
    unread,
    items: items.map((n) => ({
      id: n.id,
      kind: n.kind,
      message: n.message,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    })),
  });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { markAllRead?: boolean; id?: string };
  if (body.markAllRead) {
    await prisma.notification.updateMany({ where: { userId: user.id, read: false }, data: { read: true } });
  } else if (body.id) {
    await prisma.notification.updateMany({ where: { id: body.id, userId: user.id }, data: { read: true } });
  }
  return NextResponse.json({ ok: true });
}
