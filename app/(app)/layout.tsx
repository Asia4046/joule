import { redirect } from "next/navigation";
import AppShell from "@/components/AppShell";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mergeCustomization } from "@/lib/customization";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const prefs = await prisma.userPreference.findUnique({
    where: { userId: user.id },
    select: { customization: true },
  });
  const c = mergeCustomization(prefs?.customization);
  return (
    <AppShell
      userName={user.name}
      avatar={{ emoji: c.avatarEmoji, bean: c.avatarBean, url: c.avatarUrl }}
      hour12={c.hour12}
    >
      {children}
    </AppShell>
  );
}
