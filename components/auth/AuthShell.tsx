"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { useThemeMode } from "@/components/Providers";

/** Ivory paper backdrop for the auth pages — a single sharp card floating on it. */
export default function AuthShell({ children, tagline }: { children: ReactNode; tagline: string }) {
  const { resolved } = useThemeMode();

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        position: "relative",
        overflow: "hidden",
        bgcolor: resolved === "dark" ? "#1B1A18" : "#F4F2EC",
      }}
    >
      {/* quiet terracotta corner marks */}
      <Box aria-hidden sx={{ position: "absolute", top: 24, left: 24, width: 24, height: 24, borderLeft: "3px solid #D97757", borderTop: "3px solid #D97757" }} />
      <Box aria-hidden sx={{ position: "absolute", bottom: 24, right: 24, width: 24, height: 24, borderRight: "3px solid #D97757", borderBottom: "3px solid #D97757" }} />

      <Box sx={{ position: "relative", width: "100%", maxWidth: 400 }}>
        <Stack spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Box
            sx={{
              width: 54,
              height: 54,
              bgcolor: "#D97757",
              border: "1.5px solid #1F1E1D",
              boxShadow: "4px 4px 0 #1F1E1D",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography className="jee-serif" sx={{ fontWeight: 700, fontSize: "1.7rem", color: "#1F1E1D", lineHeight: 1 }}>
              J
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography className="jee-serif" sx={{ fontWeight: 600, fontSize: "1.4rem", letterSpacing: "0.01em" }}>
              JEE Command
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {tagline}
            </Typography>
          </Box>
        </Stack>
        {children}
      </Box>
    </Box>
  );
}
