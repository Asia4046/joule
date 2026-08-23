import Box from "@mui/material/Box";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import SettingsView from "@/components/settings/SettingsView";
import { DEFAULT_REVISION_INTERVALS } from "@/lib/constants";
import { mergeCustomization } from "@/lib/customization";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();
  const [profile, prefs] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: user.id } }),
    prisma.userPreference.findUnique({ where: { userId: user.id } }),
  ]);

  return (
    <Box>
      <PageHeader title="Settings" subtitle="Profile, preferences, notifications and account." />
      <SettingsView
        email={user.email}
        name={user.name}
        profile={{
          targetExam: profile?.targetExam ?? "both",
          targetYear: profile?.targetYear ?? 2027,
          targetPercentile: profile?.targetPercentile ?? null,
          targetRank: profile?.targetRank ?? null,
          prepLevel: profile?.prepLevel ?? "intermediate",
          dailyStudyTargetMinutes: profile?.dailyStudyTargetMinutes ?? 360,
          dailyQuestionTarget: profile?.dailyQuestionTarget ?? 60,
        }}
        prefs={{
          revisionIntervals: Array.isArray(prefs?.revisionIntervals)
            ? ((prefs?.revisionIntervals as number[]) ?? DEFAULT_REVISION_INTERVALS).join(", ")
            : DEFAULT_REVISION_INTERVALS.join(", "),
          notifyRevision: prefs?.notifyRevision ?? true,
          notifyGoals: prefs?.notifyGoals ?? true,
          notifyStreak: prefs?.notifyStreak ?? true,
          notifyMockTests: prefs?.notifyMockTests ?? true,
        }}
        customization={mergeCustomization(prefs?.customization)}
      />
    </Box>
  );
}
