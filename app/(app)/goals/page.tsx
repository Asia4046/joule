import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import GoalsView from "@/components/goals/GoalsView";

export const dynamic = "force-dynamic";

export default async function GoalsPage() {
  const user = await requireUser();
  const goals = await prisma.goal.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const items = goals.map((g) => ({
    id: g.id,
    title: g.title,
    kind: g.kind,
    metric: g.metric,
    target: g.target,
    current: g.current,
    completed: g.completed,
    deadline: g.deadline ? g.deadline.toISOString() : null,
  }));

  const dueCount = items.filter((g) => !g.completed).length;

  return (
    <GoalsView
      goals={items}
      subtitle={dueCount ? `${dueCount} active goal${dueCount === 1 ? "" : "s"} across daily, weekly and long-term targets` : "Structure your prep with daily, weekly and long-term goals"}
    />
  );
}
