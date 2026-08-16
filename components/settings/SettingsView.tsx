"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useThemeMode } from "@/components/Providers";
import {
  updateProfileAction,
  updatePreferencesAction,
  changePasswordAction,
  deleteAccountAction,
  type ActionState,
} from "@/app/actions/data";

type ProfileProps = {
  targetExam: string;
  targetYear: number;
  targetPercentile: number | null;
  targetRank: number | null;
  prepLevel: string;
  dailyStudyTargetMinutes: number;
  dailyQuestionTarget: number;
};

type PrefsProps = {
  revisionIntervals: string;
  notifyRevision: boolean;
  notifyGoals: boolean;
  notifyStreak: boolean;
  notifyMockTests: boolean;
};

export default function SettingsView({
  email,
  name,
  profile,
  prefs,
}: {
  email: string;
  name: string;
  profile: ProfileProps;
  prefs: PrefsProps;
}) {
  const [tab, setTab] = useState(0);
  const { mode, setMode } = useThemeMode();
  const router = useRouter();

  const [profileState, profileAction, profilePending] = useActionState<ActionState, FormData>(updateProfileAction, undefined);
  const [prefsState, prefsAction, prefsPending] = useActionState<ActionState, FormData>(updatePreferencesAction, undefined);
  const [pwState, pwAction, pwPending] = useActionState<ActionState, FormData>(changePasswordAction, undefined);
  const [delState, delAction, delPending] = useActionState<ActionState, FormData>(deleteAccountAction, undefined);

  return (
    <Card>
      <CardContent>
        <Tabs value={tab} onChange={(_, v: number) => setTab(v)} sx={{ mb: 3 }}>
          <Tab label="Appearance" />
          <Tab label="Study preferences" />
          <Tab label="Notifications" />
          <Tab label="Account" />
        </Tabs>

        {tab === 0 && (
          <Stack spacing={2} sx={{ maxWidth: 420 }}>
            <Typography variant="body2" color="text.secondary">Theme preference is remembered on this device.</Typography>
            <Stack direction="row" spacing={1}>
              {(["light", "dark", "system"] as const).map((m) => (
                <Chip
                  key={m}
                  label={m[0].toUpperCase() + m.slice(1)}
                  onClick={() => setMode(m)}
                  color={mode === m ? "primary" : "default"}
                  variant={mode === m ? "filled" : "outlined"}
                />
              ))}
            </Stack>
          </Stack>
        )}

        {tab === 1 && (
          <form action={profileAction}>
            <Stack spacing={2} sx={{ maxWidth: 520 }}>
              {profileState?.error && <Alert severity="error">{profileState.error}</Alert>}
              {profileState?.ok && <Alert severity="success">Preferences saved.</Alert>}
              <TextField size="small" label="Name" name="name" defaultValue={name} required fullWidth />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField select size="small" label="Target exam" name="targetExam" defaultValue={profile.targetExam} fullWidth>
                  <MenuItem value="main">JEE Main</MenuItem>
                  <MenuItem value="advanced">JEE Advanced</MenuItem>
                  <MenuItem value="both">Both</MenuItem>
                </TextField>
                <TextField size="small" label="Target year" name="targetYear" type="number" defaultValue={profile.targetYear} fullWidth />
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField size="small" label="Target percentile (optional)" name="targetPercentile" type="number" defaultValue={profile.targetPercentile ?? ""} slotProps={{ input: { inputProps: { step: "0.01", min: 0, max: 100 } } }} fullWidth />
                <TextField size="small" label="Target rank (optional)" name="targetRank" type="number" defaultValue={profile.targetRank ?? ""} fullWidth />
              </Stack>
              <TextField select size="small" label="Preparation level" name="prepLevel" defaultValue={profile.prepLevel} fullWidth>
                <MenuItem value="beginner">Beginner</MenuItem>
                <MenuItem value="intermediate">Intermediate</MenuItem>
                <MenuItem value="advanced">Advanced</MenuItem>
              </TextField>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField size="small" label="Daily study target (minutes)" name="dailyStudyTargetMinutes" type="number" defaultValue={profile.dailyStudyTargetMinutes} fullWidth />
                <TextField size="small" label="Daily question target" name="dailyQuestionTarget" type="number" defaultValue={profile.dailyQuestionTarget} fullWidth />
              </Stack>
              <Box>
                <Button type="submit" variant="contained" disabled={profilePending}>
                  {profilePending ? "Saving…" : "Save preferences"}
                </Button>
              </Box>
            </Stack>
          </form>
        )}

        {tab === 2 && (
          <form action={prefsAction}>
            <Stack spacing={2} sx={{ maxWidth: 520 }}>
              {prefsState?.error && <Alert severity="error">{prefsState.error}</Alert>}
              {prefsState?.ok && <Alert severity="success">Notification preferences saved.</Alert>}
              <FormControlLabel control={<Switch name="notifyRevision" defaultChecked={prefs.notifyRevision} />} label="Revision reminders" />
              <FormControlLabel control={<Switch name="notifyGoals" defaultChecked={prefs.notifyGoals} />} label="Goal alerts" />
              <FormControlLabel control={<Switch name="notifyStreak" defaultChecked={prefs.notifyStreak} />} label="Streak reminders" />
              <FormControlLabel control={<Switch name="notifyMockTests" defaultChecked={prefs.notifyMockTests} />} label="Mock test reminders" />
              <Divider />
              <TextField
                size="small"
                label="Revision intervals (days, comma-separated)"
                name="revisionIntervals"
                defaultValue={prefs.revisionIntervals}
                helperText="Spaced-repetition intervals between revision cycles"
                fullWidth
              />
              <Box>
                <Button type="submit" variant="contained" disabled={prefsPending}>
                  {prefsPending ? "Saving…" : "Save"}
                </Button>
              </Box>
            </Stack>
          </form>
        )}

        {tab === 3 && (
          <Stack spacing={3} sx={{ maxWidth: 520 }}>
            <Stack spacing={0.5}>
              <Typography variant="body2"><strong>Account:</strong> {email}</Typography>
            </Stack>

            <form action={pwAction}>
              <Stack spacing={2}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>CHANGE PASSWORD</Typography>
                {pwState?.error && <Alert severity="error">{pwState.error}</Alert>}
                {pwState?.ok && <Alert severity="success">Password changed.</Alert>}
                <TextField size="small" label="Current password" name="currentPassword" type="password" required fullWidth />
                <TextField size="small" label="New password (min 8 characters)" name="newPassword" type="password" required fullWidth />
                <Box>
                  <Button type="submit" variant="outlined" disabled={pwPending}>
                    {pwPending ? "Changing…" : "Change password"}
                  </Button>
                </Box>
              </Stack>
            </form>

            <Divider />

            <Box sx={{ border: 1, borderColor: "error.main", borderRadius: 2, p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "error.main", mb: 1 }}>
                DANGER ZONE
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Deleting your account permanently removes all sessions, tests, journal entries and other data.
              </Typography>
              <form action={delAction}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}>
                  <TextField size="small" label='Type "DELETE" to confirm' name="confirm" required />
                  <Button type="submit" color="error" variant="outlined" disabled={delPending}>
                    {delPending ? "Deleting…" : "Delete account"}
                  </Button>
                </Stack>
              </form>
              {delState?.error && <Alert severity="error" sx={{ mt: 1 }}>{delState.error}</Alert>}
            </Box>

            <Button component="a" href="/api/export" variant="text">
              Export my data (JSON)
            </Button>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
