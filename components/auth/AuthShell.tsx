"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import BoltIcon from "@mui/icons-material/Bolt";
import type { ReactNode } from "react";

/** Aesthetic backdrop for the auth pages — soft gradient orbs over the default background. */
export default function AuthShell({ children, tagline }: { children: ReactNode; tagline: string }) {
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
        bgcolor: "background.default",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "-22%",
          left: "-12%",
          width: 620,
          height: 620,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(79,70,229,0.20), transparent 65%)",
          filter: "blur(30px)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "-28%",
          right: "-10%",
          width: 680,
          height: 680,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.16), transparent 65%)",
          filter: "blur(36px)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: "26%",
          right: "16%",
          width: 240,
          height: 240,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(13,148,136,0.12), transparent 65%)",
          filter: "blur(26px)",
          pointerEvents: "none",
        }}
      />
      <Box sx={{ position: "relative", width: "100%", maxWidth: 400 }}>
        <Stack spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 3,
              background: "linear-gradient(135deg, #4f46e5, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              boxShadow: "0 10px 28px rgba(79,70,229,.4)",
            }}
          >
            <BoltIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ fontWeight: 800, fontSize: "1.15rem", letterSpacing: "-0.02em" }}>
              JEE<span style={{ opacity: 0.45 }}>·</span>Command
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
