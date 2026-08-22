"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RemoveIcon from "@mui/icons-material/Remove";
import { EmptyState, PageHeader } from "@/components/ui";
import { deleteGoalAction, updateGoalProgressAction } from "@/app/actions/data";
import GoalFormDialog from "./GoalFormDialog";

export type GoalItem = {
  id: string;
  title: string;
  kind: string;
  metric: string;
  target: number;
  current: number;
  completed: boolean;
  deadline: string | null;
};

const TABS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "long_term", label: "Long-term" },
] as const;

const METRIC_LABELS: Record<string, string> = {
  hours: "hours",
  questions: "questions",
  chapters: "chapters",
  mocks: "mocks",
  custom: "units",
};

const fmtValue = (v: number, metric: string) => {
  if (metric === "hours") return `${Math.round(v * 10) / 10}h`;
  return `${Math.round(v)}`;
};

export default function GoalsView({ goals, subtitle }: { goals: GoalItem[]; subtitle: string }) {
  const [tab, setTab] = useState(0);
  const [open, setOpen] = useState(false);
  const kind = TABS[tab].value;
  const visible = goals.filter((g) => g.kind === kind);

  return (
    <Box>
      <PageHeader
        title="Goals"
        subtitle={subtitle}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
            Add goal
          </Button>
        }
      />

      <Card>
        <CardContent>
          <Tabs value={tab} onChange={(_e, v: number) => setTab(v)} sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            {TABS.map((t) => {
              const count = goals.filter((g) => g.kind === t.value && !g.completed).length;
              return <Tab key={t.value} label={`${t.label}${count ? ` (${count})` : ""}`} />;
            })}
          </Tabs>

          {visible.length === 0 ? (
            <EmptyState
              title={`No ${TABS[tab].label.toLowerCase()} goals yet.`}
              description="Set measurable targets to keep your preparation accountable."
              action={
                <Button variant="contained" onClick={() => setOpen(true)}>
                  Add goal
                </Button>
              }
            />
          ) : (
            <Stack spacing={1.5}>
              {visible.map((g) => {
                const done = g.completed || g.current >= g.target;
                const step = g.metric === "hours" ? 0.5 : 1;
                return (
                  <Card key={g.id} variant="outlined" sx={{ bgcolor: "transparent" }}>
                    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <form action={updateGoalProgressAction}>
                          <input type="hidden" name="id" value={g.id} />
                          <input type="hidden" name="current" value={g.current} />
                          {done && <input type="hidden" name="completed" value="on" />}
                          <Checkbox
                            size="small"
                            checked={done}
                            sx={{ mt: -0.5, ml: -1 }}
                            disabled={g.completed}
                            onChange={(e) => e.currentTarget.form?.requestSubmit()}
                            aria-label={`Toggle ${g.title} completion`}
                          />
                        </form>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, textDecoration: done ? "line-through" : "none", opacity: done ? 0.6 : 1 }}
                            >
                              {g.title}
                            </Typography>
                            <Chip label={METRIC_LABELS[g.metric] ?? g.metric} size="small" variant="outlined" />
                            {g.deadline && (
                              <Chip
                                label={`due ${new Date(g.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
                                size="small"
                                variant="outlined"
                                color={!done && new Date(g.deadline) < new Date() ? "error" : "default"}
                              />
                            )}
                            {done && <Chip label="Completed" size="small" color="success" variant="outlined" />}
                          </Stack>
                          <Stack direction="row" justifyContent="space-between" sx={{ mt: 1, mb: 0.5 }}>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(100, (g.current / g.target) * 100)}
                              color={done ? "success" : "secondary"}
                              sx={{ height: 6, width: "100%", mr: 1.5, bgcolor: "action.hover" }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
                              {fmtValue(g.current, g.metric)} / {fmtValue(g.target, g.metric)}
                            </Typography>
                          </Stack>
                        </Box>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          {!done && (
                            <>
                              <form action={updateGoalProgressAction}>
                                <input type="hidden" name="id" value={g.id} />
                                <input type="hidden" name="current" value={Math.max(0, Math.round((g.current - step) * 10) / 10)} />
                                <IconButton size="small" type="submit" aria-label={`Decrease ${g.title} progress`}>
                                  <RemoveIcon fontSize="small" />
                                </IconButton>
                              </form>
                              <form action={updateGoalProgressAction}>
                                <input type="hidden" name="id" value={g.id} />
                                <input type="hidden" name="current" value={Math.round((g.current + step) * 10) / 10} />
                                <IconButton size="small" type="submit" aria-label={`Increase ${g.title} progress`}>
                                  <AddIcon fontSize="small" />
                                </IconButton>
                              </form>
                            </>
                          )}
                          <form action={deleteGoalAction}>
                            <input type="hidden" name="id" value={g.id} />
                            <IconButton
                              size="small"
                              type="submit"
                              aria-label={`Delete ${g.title}`}
                              onClick={(e) => {
                                if (!window.confirm(`Delete "${g.title}"?`)) e.preventDefault();
                              }}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </form>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          )}
        </CardContent>
      </Card>

      <GoalFormDialog open={open} onClose={() => setOpen(false)} defaultKind={kind} />
    </Box>
  );
}
