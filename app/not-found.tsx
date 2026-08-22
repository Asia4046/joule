"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        p: 2,
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="center">
        <Box sx={{ width: 9, height: 9, borderRadius: 999, bgcolor: "#D77BA6" }} aria-hidden />
        <Typography className="jee-mono" sx={{ fontSize: "0.64rem", fontWeight: 700, letterSpacing: "0.2em", color: "text.secondary" }}>
          404 // PAGE NOT ON FILE
        </Typography>
      </Stack>
      <Typography variant="h1" className="jee-display" sx={{ fontSize: "4rem", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1 }}>
        404
      </Typography>
      <Typography variant="h6">This page doesn&apos;t exist.</Typography>
      <Button component={Link} href="/dashboard" variant="contained">
        Back to dashboard
      </Button>
    </Box>
  );
}
