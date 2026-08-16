"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

/**
 * Standard chrome around every simulation: a card with the sim title, a caption,
 * the dark canvas panel (fixed aspect), a controls row and live readouts.
 */
export default function SimFrame({
  title,
  about,
  height = 340,
  canvas, // <canvas> element rendered by the sim via useCanvas
  controls,
  readouts,
  action,
}: {
  title: string;
  about?: string;
  height?: number;
  canvas: ReactNode;
  controls?: ReactNode;
  readouts?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <Card sx={{ overflow: "hidden" }}>
      <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1}
          sx={{ mb: 1.5 }}
        >
          <Box>
            <Typography variant="h6">{title}</Typography>
            {about && (
              <Typography variant="caption" color="text.secondary">
                {about}
              </Typography>
            )}
          </Box>
          {action}
        </Stack>
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height,
            borderRadius: 0,
            overflow: "hidden",
            "& canvas": { display: "block", width: "100%", height: "100%" },
          }}
        >
          {canvas}
        </Box>
        {controls && (
          <Box sx={{ mt: 2 }}>
            {controls}
          </Box>
        )}
        {readouts && (
          <Box
            sx={{
              mt: 1.5,
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              "& > *": { flex: "1 1 130px" },
            }}
          >
            {readouts}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
