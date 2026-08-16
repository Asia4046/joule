"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

type Insight = { kind: "positive" | "warning" | "info"; text: string };
type Priority = { chapterId: string; name: string; subject: string; priority: "high" | "medium" | "low"; reason: string };

export default function InsightsList({ insights, priorities }: { insights: Insight[]; priorities: Priority[] }) {
  return (
    <Stack spacing={2}>
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1.5 }}>What your data says</Typography>
          {insights.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Keep logging sessions, questions and tests — insights appear as data accumulates.
            </Typography>
          ) : (
            <Stack spacing={1.25}>
              {insights.map((i, idx) => (
                <Stack key={idx} direction="row" spacing={1.5} alignItems="flex-start">
                  {i.kind === "positive" ? (
                    <TrendingUpIcon fontSize="small" color="success" sx={{ mt: 0.25 }} />
                  ) : i.kind === "warning" ? (
                    <WarningAmberIcon fontSize="small" color="warning" sx={{ mt: 0.25 }} />
                  ) : (
                    <InfoOutlinedIcon fontSize="small" color="info" sx={{ mt: 0.25 }} />
                  )}
                  <Typography variant="body2">{i.text}</Typography>
                </Stack>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 0.5 }}>Study priorities</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
            Ranked by weightage × weakness × staleness. Click a chapter to open its tracker.
          </Typography>
          {priorities.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Mark chapters in the syllabus to generate priorities.
            </Typography>
          ) : (
            <Stack divider={<Divider flexItem />} spacing={1.25}>
              {priorities.map((p) => (
                <Stack key={p.chapterId} direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                  <Box component={Link} href={`/tracker/${p.chapterId}`} sx={{ textDecoration: "none", color: "text.primary", minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, "&:hover": { color: "primary.main" } }}>
                      {p.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {p.subject} · {p.reason}
                    </Typography>
                  </Box>
                  <Chip
                    label={p.priority}
                    size="small"
                    variant="outlined"
                    color={p.priority === "high" ? "error" : p.priority === "medium" ? "warning" : "success"}
                  />
                </Stack>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
