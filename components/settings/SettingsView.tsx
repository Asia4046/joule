"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
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
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { useThemeMode } from "@/components/Providers";
import UserAvatar from "@/components/UserAvatar";
import {
  updateProfileAction,
  updatePreferencesAction,
  updateCustomizationAction,
  changePasswordAction,
  deleteAccountAction,
  type ActionState,
} from "@/app/actions/data";
import {
  AVATAR_EMOJIS,
  BEAN_CHOICES,
  DASHBOARD_WIDGETS,
  type Customization,
} from "@/lib/customization";
import { J, type BeanName } from "@/lib/jellybeans";
import { DEMO_EMAIL } from "@/lib/constants";

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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: "0.02em" }}>
      {children}
    </Typography>
  );
}

/** Two-tone jellybean swatch — pastel fill over its deep variant. */
function BeanSwatch({
  value,
  label,
  selected,
  onSelect,
}: {
  value: BeanName;
  label: string;
  selected: boolean;
  onSelect: (v: BeanName) => void;
}) {
  const bean = J.bean[value];
  return (
    <ButtonBase
      onClick={() => onSelect(value)}
      aria-pressed={selected}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 0.5,
        p: 0.75,
        borderRadius: "2px",
        border: `1px solid ${selected ? "text.primary" : "divider"}`,
        boxShadow: selected ? "3px 3px 0 rgba(34,31,26,0.18)" : "none",
        transition: "border-color .15s ease, box-shadow .15s ease",
      }}
    >
      <Box sx={{ width: 42, height: 18, bgcolor: bean.fill, borderBottom: `5px solid ${bean.deep}` }} />
      <Typography variant="caption" sx={{ fontWeight: selected ? 700 : 500, fontSize: "0.66rem" }}>
        {label}
      </Typography>
    </ButtonBase>
  );
}

function PersonalizeForm({ name, c }: { name: string; c: Customization }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateCustomizationAction, undefined);
  const [emoji, setEmoji] = useState<string>(c.avatarEmoji);
  const [avatarBean, setAvatarBean] = useState<BeanName>(c.avatarBean);
  const [avatarUrl, setAvatarUrl] = useState<string>(c.avatarUrl);
  const [accent, setAccent] = useState<BeanName>(c.accent);
  const [weekStartsOn, setWeekStartsOn] = useState<0 | 1>(c.weekStartsOn);
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <form action={action}>
      <Stack spacing={3} sx={{ maxWidth: 560 }}>
        {state?.error && <Alert severity="error">{state.error}</Alert>}
        {state?.ok && <Alert severity="success">Personalization saved.</Alert>}

        {/* hidden inputs carry the picker state */}
        <input type="hidden" name="accent" value={accent} />
        <input type="hidden" name="avatarEmoji" value={emoji} />
        <input type="hidden" name="avatarBean" value={avatarBean} />
        <input type="hidden" name="weekStartsOn" value={weekStartsOn} />

        <Stack spacing={1.5}>
          <SectionTitle>AVATAR</SectionTitle>
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ p: 1.25, border: "1px solid", borderColor: "divider", borderRadius: "2px" }}>
            <UserAvatar name={name} emoji={emoji} bean={avatarBean} url={avatarUrl} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{name}</Typography>
              <Typography className="jee-mono" variant="caption" sx={{ color: "text.secondary", fontSize: "0.6rem", letterSpacing: "0.08em" }}>
                SIGNED IN
              </Typography>
            </Box>
          </Stack>
          <TextField
            size="small"
            label="Profile picture URL (optional)"
            name="avatarUrl"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://example.com/me.jpg"
            helperText="A direct image link (http/https). Takes precedence over the emoji; paste is enough."
            fullWidth
          />
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {AVATAR_EMOJIS.map((e) => (
              <ButtonBase
                key={e || "initials"}
                onClick={() => setEmoji(e)}
                aria-pressed={emoji === e}
                aria-label={e ? `Avatar ${e}` : "Initials avatar"}
                sx={{
                  width: 38, height: 38, borderRadius: "2px",
                  border: `1px solid ${emoji === e ? "text.primary" : "divider"}`,
                  boxShadow: emoji === e ? "2px 2px 0 rgba(34,31,26,0.18)" : "none",
                  fontSize: "1.15rem", lineHeight: 1,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                {e || <span style={{ fontSize: "0.68rem", fontWeight: 800 }}>{initials}</span>}
              </ButtonBase>
            ))}
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
            {BEAN_CHOICES.map((b) => (
              <BeanSwatch key={b.value} value={b.value} label={b.label} selected={avatarBean === b.value} onSelect={setAvatarBean} />
            ))}
          </Box>
        </Stack>

        <Divider />
        <Stack spacing={1.5}>
          <SectionTitle>ACCENT</SectionTitle>
          <Typography variant="body2" color="text.secondary">
            Applied to links, focus rings, selection highlights and sliders across the app.
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
            {BEAN_CHOICES.map((b) => (
              <BeanSwatch key={b.value} value={b.value} label={b.label} selected={accent === b.value} onSelect={setAccent} />
            ))}
          </Box>
        </Stack>

        <Divider />
        <Stack spacing={2}>
          <SectionTitle>STUDY DEFAULTS</SectionTitle>
          <TextField
            size="small"
            label="Default focus timer (minutes)"
            name="focusMinutes"
            type="number"
            defaultValue={c.focusMinutes}
            slotProps={{ input: { inputProps: { min: 5, max: 120 } } }}
            helperText="Presets: 25 Pomodoro · 50 Deep · 90 Long — or any length from 5 to 120"
            sx={{ maxWidth: 280 }}
          />
        </Stack>

        <Divider />
        <Stack spacing={2}>
          <SectionTitle>REGION &amp; CLOCK</SectionTitle>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Week starts on</Typography>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={weekStartsOn}
                onChange={(_, v: 0 | 1) => v !== null && setWeekStartsOn(v)}
              >
                <ToggleButton value={0}>Sunday</ToggleButton>
                <ToggleButton value={1}>Monday</ToggleButton>
              </ToggleButtonGroup>
            </Stack>
            <FormControlLabel control={<Switch name="hour12" defaultChecked={c.hour12} />} label="12-hour clock" />
          </Stack>
        </Stack>

        <Divider />
        <Stack spacing={1}>
          <SectionTitle>DASHBOARD WIDGETS</SectionTitle>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 0 }}>
            {DASHBOARD_WIDGETS.map((w) => (
              <FormControlLabel
                key={w.key}
                control={<Switch name={`dash_${w.key}`} defaultChecked={c.dashboard[w.key]} />}
                label={w.label}
              />
            ))}
          </Box>
        </Stack>

        <Box>
          <Button type="submit" variant="contained" disabled={pending}>
            {pending ? "Saving…" : "Save personalization"}
          </Button>
        </Box>
      </Stack>
    </form>
  );
}

export default function SettingsView({
  email,
  name,
  profile,
  prefs,
  customization,
}: {
  email: string;
  name: string;
  profile: ProfileProps;
  prefs: PrefsProps;
  customization: Customization;
}) {
  const [tab, setTab] = useState(0);
  const { mode, setMode } = useThemeMode();
  const router = useRouter();
  const isDemo = email === DEMO_EMAIL;

  const [profileState, profileAction, profilePending] = useActionState<ActionState, FormData>(updateProfileAction, undefined);
  const [prefsState, prefsAction, prefsPending] = useActionState<ActionState, FormData>(updatePreferencesAction, undefined);
  const [pwState, pwAction, pwPending] = useActionState<ActionState, FormData>(changePasswordAction, undefined);
  const [delState, delAction, delPending] = useActionState<ActionState, FormData>(deleteAccountAction, undefined);

  return (
    <Card>
      <CardContent>
        <Tabs
          value={tab}
          onChange={(_, v: number) => setTab(v)}
          variant="scrollable"
          scrollButtons={false}
          allowScrollButtonsMobile
          sx={{ mb: 3, minHeight: 44 }}
        >
          <Tab label="Personalize" />
          <Tab label="Appearance" />
          <Tab label="Study preferences" />
          <Tab label="Notifications" />
          <Tab label="Account" />
        </Tabs>

        {tab === 0 && <PersonalizeForm name={name} c={customization} />}

        {tab === 1 && (
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

        {tab === 2 && (
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

        {tab === 3 && (
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

        {tab === 4 && (
          <Stack spacing={3} sx={{ maxWidth: 520 }}>
            <Stack spacing={0.5}>
              <Typography variant="body2"><strong>Account:</strong> {email}</Typography>
            </Stack>

            {isDemo ? (
              <Alert severity="info">
                This is the shared demo account — its password can&apos;t be changed and it can&apos;t be
                deleted. Everything else (personalization, data, journals) is fair game.
              </Alert>
            ) : (
              <>
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

            <Box sx={{ border: 1, borderColor: "error.main", p: 2 }}>
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
              </>
            )}

            <Button component="a" href="/api/export" variant="text">
              Export my data (JSON)
            </Button>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
