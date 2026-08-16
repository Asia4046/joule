"use client";

import { useActionState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import { useTheme, alpha } from "@mui/material/styles";
import { loginAction, type AuthState } from "@/app/auth-actions";
import AuthShell from "@/components/auth/AuthShell";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(loginAction, undefined);
  const theme = useTheme();

  return (
    <AuthShell tagline="Know where you are. Know what to do next.">
      <Card>
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Typography variant="h5" sx={{ textAlign: "center" }}>
            Welcome back
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: "center" }}>
            Sign in to continue your preparation.
          </Typography>
          <form action={formAction}>
            <Stack spacing={2}>
              {state?.error && <Alert severity="error">{state.error}</Alert>}
              <TextField
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                required
                fullWidth
              />
              <TextField
                label="Password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                fullWidth
              />
              <Button type="submit" variant="contained" size="large" disabled={pending} fullWidth sx={{ mt: 0.5, py: 1.1 }}>
                {pending ? "Signing in…" : "Sign in"}
              </Button>
            </Stack>
          </form>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2.5, textAlign: "center" }}>
            No account?{" "}
            <Link href="/signup" style={{ fontWeight: 600, color: theme.palette.primary.main }}>
              Create one
            </Link>
          </Typography>
          <Box
            sx={{
              mt: 2.5,
              py: 1,
              px: 2,
              bgcolor: theme.palette.mode === "dark" ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.primary.main, 0.06),
              border: `1px dashed ${alpha(theme.palette.primary.main, 0.35)}`,
              textAlign: "center",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Demo account — <Box component="span" sx={{ fontWeight: 600 }}>demo@jee.app</Box> /{" "}
              <Box component="span" sx={{ fontWeight: 600 }}>demo1234</Box>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
