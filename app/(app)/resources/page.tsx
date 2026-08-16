import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ResourcesView from "@/components/resources/ResourcesView";

export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  const user = await requireUser();
  const resources = await prisma.resource.findMany({
    where: { userId: user.id },
    orderBy: [{ favorite: "desc" }, { createdAt: "desc" }],
  });

  const items = resources.map((r) => ({
    id: r.id,
    type: r.type,
    title: r.title,
    url: r.url,
    subject: r.subject,
    tags: r.tags,
    favorite: r.favorite,
    completed: r.completed,
  }));

  return <ResourcesView resources={items} />;
}
