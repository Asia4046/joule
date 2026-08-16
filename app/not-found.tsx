"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
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
      <Typography variant="h1" sx={{ fontSize: "4rem", fontWeight: 800, letterSpacing: "-0.04em" }}>
        404
      </Typography>
      <Typography variant="h6">This page doesn&apos;t exist.</Typography>
      <Button component={Link} href="/dashboard" variant="contained">
        Back to dashboard
      </Button>
    </Box>
  );
}
