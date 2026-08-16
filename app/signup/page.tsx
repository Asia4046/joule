"use client";

import { useActionState } from "react";
import Link from "next/link";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import { useTheme, alpha } from "@mui/material/styles";
import { signupAction, type AuthState } from "@/app/auth-actions";
import AuthShell from "@/components/auth/AuthShell";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(signupAction, undefined);
  const theme = useTheme();

  return (
    <AuthShell tagline="Your personal JEE command center.">
      <Card
        sx={{
          borderRadius: 5,
          border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 24px 64px rgba(0,0,0,.55)"
              : "0 24px 64px rgba(27,27,34,.12)",
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: "-0.02em", textAlign: "center" }}>
            Create your account
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: "center" }}>
            Track every chapter, session and test from day one.
          </Typography>
          <form action={formAction}>
            <Stack spacing={2}>
              {state?.error && <Alert severity="error">{state.error}</Alert>}
              <TextField label="Name" name="name" autoComplete="name" required fullWidth />
              <TextField label="Email" name="email" type="email" autoComplete="email" required fullWidth />
              <TextField
                label="Password (min 8 characters)"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                fullWidth
              />
              <Button type="submit" variant="contained" size="large" disabled={pending} fullWidth sx={{ mt: 0.5, py: 1.1 }}>
                {pending ? "Creating account…" : "Sign up"}
              </Button>
            </Stack>
          </form>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2.5, textAlign: "center" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ fontWeight: 600, color: theme.palette.primary.main }}>
              Sign in
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
