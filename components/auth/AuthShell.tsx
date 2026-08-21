"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { useThemeMode } from "@/components/Providers";
import { K, ka } from "@/lib/kanagawa";

/** Sumi-ink backdrop with a quiet wave glow — one floating card for the auth forms. */
export default function AuthShell({ children, tagline }: { children: ReactNode; tagline: string }) {
  const { resolved } = useThemeMode();
  const dark = resolved === "dark";

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
        bgcolor: dark ? "#000000" : K.washiBg,
      }}
    >
      {/* quiet corner glows — crystal blue & sakura */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: -220,
          left: -180,
          width: 560,
          height: 560,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(255,255,255,${dark ? 0.07 : 0.5}) 0%, transparent 68%)`,
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          bottom: -240,
          right: -160,
          width: 560,
          height: 560,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(255,255,255,${dark ? 0.04 : 0.3}) 0%, transparent 68%)`,
        }}
      />

      <Box sx={{ position: "relative", width: "100%", maxWidth: 400 }}>
        <Stack spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Box
            sx={{
              width: 54,
              height: 54,
              borderRadius: 3,
              background: "#111116",
              border: `1px solid ${K.nightLine2}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: "1.55rem", color: "#FAFAFA", lineHeight: 1 }}>
              波
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ fontWeight: 700, fontSize: "1.35rem", letterSpacing: "0.01em" }}>
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
