"use client";

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import { CHAPTER_STATUSES } from "@/lib/constants";
import { updateChapterStatusAction } from "@/app/actions/study";

export default function SyllabusControls({
  subjects,
  branches,
  activeSubject,
  activeBranch,
  activeStatus,
}: {
  subjects: string[];
  branches: string[];
  activeSubject: string;
  activeBranch: string;
  activeStatus: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key === "subject") params.delete("branch");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: "wrap", gap: 1 }} useFlexGap>
      <Chip label="All" onClick={() => setParam("subject", "")} variant={!activeSubject ? "filled" : "outlined"} color={activeSubject ? "default" : "primary"} />
      {subjects.map((s) => (
        <Chip
          key={s}
          label={s}
          onClick={() => setParam("subject", activeSubject === s ? "" : s)}
          variant={activeSubject === s ? "filled" : "outlined"}
          color={activeSubject === s ? "primary" : "default"}
        />
      ))}
      {activeSubject === "Chemistry" &&
        branches.map((b) => (
          <Chip
            key={b}
            label={b}
            onClick={() => setParam("branch", activeBranch === b ? "" : b)}
            variant={activeBranch === b ? "filled" : "outlined"}
            color={activeBranch === b ? "secondary" : "default"}
          />
        ))}
      {CHAPTER_STATUSES.map((s) => (
        <Chip
          key={s.value}
          label={s.label}
          onClick={() => setParam("status", activeStatus === s.value ? "" : s.value)}
          variant={activeStatus === s.value ? "filled" : "outlined"}
          color={activeStatus === s.value ? "default" : "default"}
          sx={activeStatus === s.value ? { bgcolor: s.color, color: "#fff" } : undefined}
        />
      ))}
    </Stack>
  );
}

export function ChapterMenu({
  chapterId,
  status,
  totalTopics,
  doneTopics,
}: {
  chapterId: string;
  status: string;
  totalTopics: number;
  doneTopics: number;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
      {totalTopics > 0 && (
        <Box sx={{ flexGrow: 1, maxWidth: 260 }}>
          <LinearProgress
            variant="determinate"
            value={(doneTopics / totalTopics) * 100}
            color="secondary"
            sx={{ height: 5 }}
          />
          <Box component="span" sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
            {doneTopics}/{totalTopics} topics
          </Box>
        </Box>
      )}
      <TextField
        select
        size="small"
        label="Status"
        defaultValue={status}
        disabled={pending}
        onChange={(e) => {
          const formData = new FormData();
          formData.set("chapterId", chapterId);
          formData.set("status", e.target.value);
          startTransition(() => {
            void updateChapterStatusAction(formData);
          });
        }}
        sx={{ minWidth: 160, "& .MuiSelect-select": { py: 0.75 } }}
      >
        {CHAPTER_STATUSES.map((s) => (
          <MenuItem key={s.value} value={s.value} sx={{ fontSize: "0.85rem" }}>
            {s.label}
          </MenuItem>
        ))}
      </TextField>
    </Stack>
  );
}


