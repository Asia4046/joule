import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import AutorenewOutlinedIcon from "@mui/icons-material/AutorenewOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { getSessionUser } from "@/lib/auth";
import { CONCEPT_CONTENT } from "@/lib/concept-content";
import { SIM_REGISTRY } from "@/components/concepts/sims";
import { K, ka } from "@/lib/kanagawa";

export const dynamic = "force-dynamic";

const FEATURES = [
  {
    icon: ScienceOutlinedIcon,
    tint: K.crystalBlue,
    title: "Concept Labs",
    copy: "Every major chapter ships with an interactive simulation — ray benches, orbital slices, collision tracks — built to make the formula feel obvious before you memorise it.",
  },
  {
    icon: InsightsOutlinedIcon,
    tint: K.springGreen,
    title: "Mock-test forensics",
    copy: "Score, accuracy, attempt speed and silly-mistake rate, sliced by chapter and topic. Know exactly which 4 chapters cost you the last 20 marks.",
  },
  {
    icon: BugReportOutlinedIcon,
    tint: K.waveRed,
    title: "Mistake ledger",
    copy: "Wrong answers get logged with the reason you got them wrong — concept gap, calculation slip, or misread — and come back to haunt you until you fix them.",
  },
  {
    icon: AutorenewOutlinedIcon,
    tint: K.carpYellow,
    title: "Spaced revision engine",
    copy: "A revision queue that resurfaces notes and questions at expanding intervals, weighted by JEE weightage and your own accuracy history.",
  },
  {
    icon: MapOutlinedIcon,
    tint: K.springBlue,
    title: "Syllabus map",
    copy: "The full Physics and Chemistry syllabus, tracked chapter by chapter with Main and Advanced weightage — so study time follows marks, not vibes.",
  },
  {
    icon: EventNoteOutlinedIcon,
    tint: K.sakuraPink,
    title: "Planning suite",
    copy: "Study sessions, goals with deadlines, a journal and a calendar that talks to all of it. The system thinks about tomorrow so you can think about torque.",
  },
];

const PALETTE = [
  { hex: K.crystalBlue, name: "crystal blue" },
  { hex: K.springGreen, name: "spring green" },
  { hex: K.carpYellow, name: "carp yellow" },
  { hex: K.waveRed, name: "wave red" },
  { hex: K.sakuraPink, name: "sakura pink" },
];

function WaveMark({ size = 40 }: { size?: number }) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: 2.5,
        background: `linear-gradient(135deg, ${K.waveBlue2}, ${K.crystalBlue})`,
        border: `1px solid ${ka(K.crystalBlue, 0.6)}`,
        boxShadow: `0 4px 20px ${ka(K.crystalBlue, 0.45)}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Typography sx={{ fontWeight: 800, fontSize: size * 0.52, color: K.fujiWhite, lineHeight: 1 }}>波</Typography>
    </Box>
  );
}

function SectionHeading({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <Stack spacing={1.25} sx={{ mb: { xs: 4, md: 6 }, maxWidth: 640 }}>
      <Typography
        className="jee-mono"
        sx={{ color: K.springBlue, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase" }}
      >
        {kicker}
      </Typography>
      <Typography sx={{ fontSize: { xs: "1.7rem", md: "2.2rem" }, fontWeight: 700, letterSpacing: "-0.02em", color: K.fujiWhite, lineHeight: 1.15 }}>
        {title}
      </Typography>
      {sub && (
        <Typography sx={{ color: K.springViolet1, fontSize: "1rem", lineHeight: 1.65 }}>
          {sub}
        </Typography>
      )}
    </Stack>
  );
}

/** Mock dashboard preview — a distilled portrait of the real app, drawn in pure Box/SVG. */
function ProductMock() {
  const bars = [38, 55, 42, 66, 58, 74, 62, 81, 70, 88, 79, 92];
  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: 5,
        border: `1px solid ${ka(K.sumiInk3, 0.9)}`,
        background: `linear-gradient(180deg, ${ka(K.sumiInk1, 0.95)}, ${ka(K.sumiInk0, 0.98)})`,
        boxShadow: `0 30px 90px rgba(0,0,0,0.55), 0 0 80px ${ka(K.crystalBlue, 0.12)}`,
        overflow: "hidden",
        mx: "auto",
        maxWidth: 920,
      }}
    >
      {/* window chrome */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2.5, py: 1.5, borderBottom: `1px solid ${ka(K.sumiInk3, 0.7)}` }}>
        {[K.waveRed, K.carpYellow, K.springGreen].map((c) => (
          <Box key={c} sx={{ width: 9, height: 9, borderRadius: 999, bgcolor: c, opacity: 0.85 }} />
        ))}
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ width: 180, height: 10, borderRadius: 999, bgcolor: ka(K.sumiInk2, 0.9), mx: "auto" }} />
        <Box sx={{ flexGrow: 1 }} />
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "none", sm: "168px 1fr" } }}>
        {/* rail */}
        <Box sx={{ display: { xs: "none", sm: "block" }, borderRight: `1px solid ${ka(K.sumiInk3, 0.6)}`, p: 2 }}>
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 2.5 }}>
            <WaveMark size={30} />
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: K.fujiWhite, letterSpacing: "0.04em" }}>
              JEE COMMAND
            </Typography>
          </Stack>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <Box
              key={i}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                px: 1.5,
                py: 0.9,
                mb: 0.5,
                borderRadius: 2,
                bgcolor: i === 1 ? ka(K.crystalBlue, 0.16) : "transparent",
                border: i === 1 ? `1px solid ${ka(K.crystalBlue, 0.35)}` : "1px solid transparent",
              }}
            >
              <Box sx={{ width: 13, height: 13, borderRadius: 0.5, bgcolor: i === 1 ? K.springBlue : ka(K.sumiInk4, 0.9) }} />
              <Box sx={{ width: `${64 + (i % 3) * 18}%`, height: 8, borderRadius: 999, bgcolor: i === 1 ? ka(K.crystalBlue, 0.75) : ka(K.sumiInk3, 0.8) }} />
            </Box>
          ))}
        </Box>
        {/* body */}
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
            {[
              { label: "ACCURACY", value: "78.4%", delta: "+6.2 this month", tint: K.springGreen },
              { label: "STUDY TIME", value: "42h", delta: "this week", tint: K.crystalBlue },
              { label: "REVISION QUEUE", value: "17", delta: "due today", tint: K.carpYellow },
            ].map((s) => (
              <Box
                key={s.label}
                sx={{
                  flex: 1,
                  p: 2,
                  borderRadius: 3.5,
                  border: `1px solid ${ka(K.sumiInk3, 0.8)}`,
                  bgcolor: ka(K.sumiInk2, 0.35),
                }}
              >
                <Typography className="jee-mono" sx={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.16em", color: K.katanaGray }}>
                  {s.label}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mt: 0.75 }}>
                  <Typography className="jee-mono jee-num" sx={{ fontSize: "1.55rem", fontWeight: 700, color: K.fujiWhite, lineHeight: 1 }}>
                    {s.value}
                  </Typography>
                  <Typography sx={{ fontSize: "0.66rem", color: s.tint, fontWeight: 600 }}>{s.delta}</Typography>
                </Stack>
              </Box>
            ))}
          </Stack>
          {/* chart */}
          <Box sx={{ borderRadius: 3.5, border: `1px solid ${ka(K.sumiInk3, 0.8)}`, bgcolor: ka(K.sumiInk2, 0.25), p: 2.5, mb: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: K.oldWhite }}>Mock test trajectory</Typography>
              <Stack direction="row" spacing={1}>
                {[K.crystalBlue, K.carpYellow].map((c) => (
                  <Stack key={c} direction="row" spacing={0.5} alignItems="center">
                    <Box sx={{ width: 8, height: 8, borderRadius: 999, bgcolor: c }} />
                    <Typography sx={{ fontSize: "0.62rem", color: K.katanaGray }}>score</Typography>
                  </Stack>
                ))}
              </Stack>
            </Stack>
            <Box
              component="svg"
              viewBox="0 0 480 150"
              sx={{ width: "100%", height: "auto", display: "block" }}
              aria-hidden
            >
              <defs>
                <linearGradient id="lg-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={K.crystalBlue} stopOpacity="0.35" />
                  <stop offset="100%" stopColor={K.crystalBlue} stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0, 1, 2, 3].map((i) => (
                <line key={i} x1="0" y1={12 + i * 42} x2="480" y2={12 + i * 42} stroke={ka(K.sumiInk3, 0.55)} strokeWidth="1" />
              ))}
              <path
                d={`M0,${150 - bars[0]} ${bars.map((b, i) => `L${i * 43.6},${150 - b - 20}`).join(" ")} L480,150 L0,150 Z`}
                fill="url(#lg-area)"
              />
              <path
                d={`M0,${130 - bars[0] * 0.4} ${bars.map((b, i) => `L${i * 43.6},${138 - b * 0.35}`).join(" ")}`}
                fill="none"
                stroke={K.carpYellow}
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d={`M0,${150 - bars[0]} ${bars.map((b, i) => `L${i * 43.6},${150 - b - 20}`).join(" ")}`}
                fill="none"
                stroke={K.crystalBlue}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {bars.map((b, i) => (
                <circle key={i} cx={i * 43.6} cy={150 - b - 20} r={i === bars.length - 1 ? 4.5 : 2.5} fill={i === bars.length - 1 ? K.carpYellow : K.crystalBlue} />
              ))}
            </Box>
          </Box>
          {/* revision rows */}
          <Stack spacing={1.25}>
            {[
              { tag: "Rotational motion", due: "today", tint: K.crystalBlue, pct: 72 },
              { tag: "Chemical bonding", due: "tomorrow", tint: K.springGreen, pct: 45 },
              { tag: "Ray optics", due: "in 3 days", tint: K.sakuraPink, pct: 30 },
            ].map((r) => (
              <Box key={r.tag} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ width: 7, height: 7, borderRadius: 999, bgcolor: r.tint, flexShrink: 0 }} />
                <Typography sx={{ fontSize: "0.78rem", color: K.oldWhite, width: 150, flexShrink: 0 }}>{r.tag}</Typography>
                <Box sx={{ flexGrow: 1, height: 5, borderRadius: 999, bgcolor: ka(K.sumiInk2, 0.9), overflow: "hidden" }}>
                  <Box sx={{ width: `${r.pct}%`, height: 1, borderRadius: 999, bgcolor: r.tint }} />
                </Box>
                <Typography className="jee-mono" sx={{ fontSize: "0.64rem", color: K.katanaGray, width: 72, textAlign: "right", flexShrink: 0 }}>
                  {r.due}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

export default async function Landing() {
  const user = await getSessionUser();
  const labCount = Object.keys(CONCEPT_CONTENT).length;
  const simCount = Object.keys(SIM_REGISTRY).length;

  return (
    <Box
      component="article"
      sx={{
        minHeight: "100dvh",
        bgcolor: K.sumiInk0,
        color: K.fujiWhite,
        position: "relative",
        overflowX: "clip",
        "& a": { textDecoration: "none" },
      }}
    >
      {/* ambient background: corner glows + faint grid */}
      <Box aria-hidden sx={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <Box sx={{ position: "absolute", top: -320, left: "50%", transform: "translateX(-50%)", width: 1100, height: 700, background: `radial-gradient(ellipse, ${ka(K.crystalBlue, 0.14)} 0%, transparent 65%)` }} />
        <Box sx={{ position: "absolute", top: 500, left: -260, width: 700, height: 700, background: `radial-gradient(circle, ${ka(K.sakuraPink, 0.07)} 0%, transparent 65%)` }} />
        <Box sx={{ position: "absolute", top: 1100, right: -260, width: 700, height: 700, background: `radial-gradient(circle, ${ka(K.springGreen, 0.06)} 0%, transparent 65%)` }} />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(${ka(K.sumiInk4, 0.14)} 1px, transparent 1px), linear-gradient(90deg, ${ka(K.sumiInk4, 0.14)} 1px, transparent 1px)`,
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse 90% 60% at 50% 0%, black 30%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse 90% 60% at 50% 0%, black 30%, transparent 75%)",
          }}
        />
      </Box>

      {/* nav */}
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          bgcolor: ka(K.sumiInk0, 0.75),
          backdropFilter: "blur(14px)",
          borderBottom: `1px solid ${ka(K.sumiInk3, 0.5)}`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} sx={{ maxWidth: 1120, mx: "auto", px: { xs: 2, sm: 3 }, py: 1.75 }}>
          <Stack direction="row" spacing={1.25} alignItems="center" component="a" href="/">
            <WaveMark size={36} />
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", letterSpacing: "0.05em" }}>JEE COMMAND</Typography>
              <Typography sx={{ fontSize: "0.6rem", letterSpacing: "0.18em", color: K.katanaGray, fontWeight: 600 }}>PREP PLATFORM</Typography>
            </Box>
          </Stack>
          <Box sx={{ flexGrow: 1 }} />
          <Stack direction="row" spacing={2.5} sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
            {[
              { href: "#features", label: "Features" },
              { href: "#labs", label: "Concept Labs" },
              { href: "#system", label: "The system" },
            ].map((l) => (
              <Box key={l.href} component="a" href={l.href} sx={{ color: K.springViolet1, fontSize: "0.85rem", fontWeight: 600, "&:hover": { color: K.fujiWhite } }}>
                {l.label}
              </Box>
            ))}
          </Stack>
          <Box
            component="a"
            href={user ? "/dashboard" : "/login"}
            sx={{
              px: 2.25,
              py: 1,
              borderRadius: 999,
              border: `1px solid ${ka(K.crystalBlue, 0.5)}`,
              color: K.crystalBlue,
              fontSize: "0.85rem",
              fontWeight: 700,
              transition: "all .18s ease",
              "&:hover": { bgcolor: ka(K.crystalBlue, 0.12), borderColor: K.crystalBlue },
              whiteSpace: "nowrap",
            }}
          >
            {user ? "Open app" : "Sign in"}
          </Box>
        </Stack>
      </Box>

      {/* hero */}
      <Box component="section" sx={{ position: "relative", maxWidth: 1120, mx: "auto", px: { xs: 2, sm: 3 }, pt: { xs: 8, md: 12 }, pb: { xs: 6, md: 10 }, textAlign: "center" }}>
        <Stack spacing={2.5} alignItems="center" sx={{ maxWidth: 780, mx: "auto", mb: { xs: 5, md: 7 } }}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              px: 1.75,
              py: 0.6,
              borderRadius: 999,
              border: `1px solid ${ka(K.sumiInk3, 0.9)}`,
              bgcolor: ka(K.sumiInk1, 0.8),
            }}
          >
            <Box sx={{ width: 7, height: 7, borderRadius: 999, bgcolor: K.springGreen, boxShadow: `0 0 10px ${ka(K.springGreen, 0.9)}` }} />
            <Typography className="jee-mono" sx={{ fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.08em", color: K.oldWhite }}>
              {labCount} chapter labs · {simCount} live simulations
            </Typography>
          </Stack>
          <Typography
            sx={{
              fontSize: { xs: "2.4rem", sm: "3.2rem", md: "4rem" },
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.06,
              textWrap: "balance",
            }}
          >
            Your rank is a system output.{" "}
            <Box component="span" sx={{ background: `linear-gradient(100deg, ${K.crystalBlue}, ${K.springBlue} 55%, ${K.springGreen})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              Build the system.
            </Box>
          </Typography>
          <Typography sx={{ fontSize: { xs: "1rem", md: "1.15rem" }, color: K.springViolet1, lineHeight: 1.7, maxWidth: 620 }}>
            JEE Command is the command center for your preparation — concept labs with real simulations,
            mock-test forensics, a mistake ledger that never forgets, and a revision engine that schedules itself.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ pt: 1.5 }}>
            <Box
              component="a"
              href={user ? "/dashboard" : "/signup"}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                px: 3.5,
                py: 1.5,
                borderRadius: 999,
                background: `linear-gradient(135deg, ${K.crystalBlue}, ${K.springBlue})`,
                color: K.sumiInk0,
                fontWeight: 800,
                fontSize: "0.95rem",
                boxShadow: `0 10px 36px ${ka(K.crystalBlue, 0.4)}`,
                transition: "transform .18s ease, box-shadow .18s ease",
                "&:hover": { transform: "translateY(-2px)", boxShadow: `0 14px 44px ${ka(K.crystalBlue, 0.55)}` },
              }}
            >
              {user ? "Go to dashboard" : "Start preparing"}
              <ArrowForwardIcon sx={{ fontSize: 18 }} />
            </Box>
            <Box
              component="a"
              href="#labs"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                px: 3.5,
                py: 1.5,
                borderRadius: 999,
                border: `1px solid ${ka(K.sumiInk4, 0.9)}`,
                color: K.oldWhite,
                fontWeight: 700,
                fontSize: "0.95rem",
                transition: "all .18s ease",
                "&:hover": { borderColor: K.sumiInk4, bgcolor: ka(K.fujiWhite, 0.05), color: K.fujiWhite },
              }}
            >
              See the labs
            </Box>
          </Stack>
        </Stack>
        <ProductMock />
      </Box>

      {/* stats strip */}
      <Box component="section" sx={{ position: "relative", borderBottom: `1px solid ${ka(K.sumiInk3, 0.5)}` }}>
        <Box sx={{ maxWidth: 1120, mx: "auto", px: { xs: 2, sm: 3 }, py: { xs: 4, md: 5.5 } }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: { xs: 3, md: 2 } }}>
            {[
              { v: `${labCount}`, l: "chapter concept labs" },
              { v: `${simCount}`, l: "interactive simulations" },
              { v: "2", l: "subjects mapped end-to-end" },
              { v: "360°", l: "mock & practice analytics" },
            ].map((s) => (
              <Stack key={s.l} spacing={0.5} sx={{ textAlign: "center" }}>
                <Typography className="jee-mono jee-num" sx={{ fontSize: { xs: "2rem", md: "2.4rem" }, fontWeight: 700, color: K.fujiWhite, lineHeight: 1 }}>
                  {s.v}
                </Typography>
                <Typography sx={{ fontSize: "0.78rem", color: K.katanaGray }}>{s.l}</Typography>
              </Stack>
            ))}
          </Box>
        </Box>
      </Box>

      {/* features */}
      <Box component="section" id="features" sx={{ position: "relative", maxWidth: 1120, mx: "auto", px: { xs: 2, sm: 3 }, py: { xs: 7, md: 11 } }}>
        <SectionHeading
          kicker="Features"
          title="One workspace, the whole preparation."
          sub="Six tools that share one brain — what you miss in a mock shows up in your revision queue, and what the syllabus weights most shows up first."
        />
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" }, gap: 2.5 }}>
          {FEATURES.map((f) => (
            <Box
              key={f.title}
              sx={{
                p: 3,
                borderRadius: 4.5,
                border: `1px solid ${ka(K.sumiInk3, 0.8)}`,
                bgcolor: ka(K.sumiInk1, 0.65),
                transition: "all .22s ease",
                "&:hover": {
                  transform: "translateY(-3px)",
                  borderColor: ka(f.tint, 0.45),
                  boxShadow: `0 18px 48px rgba(0,0,0,0.4), 0 0 32px ${ka(f.tint, 0.1)}`,
                },
              }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: ka(f.tint, 0.14),
                  border: `1px solid ${ka(f.tint, 0.35)}`,
                  color: f.tint,
                  mb: 2,
                }}
              >
                <f.icon sx={{ fontSize: 21 }} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: "1.02rem", mb: 1, color: K.fujiWhite }}>{f.title}</Typography>
              <Typography sx={{ fontSize: "0.85rem", color: K.springViolet1, lineHeight: 1.7 }}>{f.copy}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* labs strip */}
      <Box
        component="section"
        id="labs"
        sx={{
          position: "relative",
          maxWidth: 1120,
          mx: "auto",
          px: { xs: 2, sm: 3 },
          py: { xs: 7, md: 11 },
        }}
      >
        <SectionHeading
          kicker="Concept Labs"
          title="Physics you can push, drag and break."
          sub="Every lab is a real simulation, not a video — set up a Galilean telescope, park an object at a mirror's centre of curvature, or watch a cyclotron trace, then read the matrix math off the bench."
        />
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2.5 }}>
          {[
            { title: "Lens & mirror bench", copy: "Combine six kinds of lenses and mirrors; images located by ray-transfer matrices.", tint: K.crystalBlue },
            { title: "Bohr & hydrogen", copy: "Energy levels, transition wavelengths and the Lyman–Balmer–Paschen map.", tint: K.waveRed },
            { title: "Orbital slices", copy: "Real spherical-harmonic cross-sections for any n, l, m — phase included.", tint: K.springGreen },
            { title: "Collisions & fields", copy: "Elastic to sticky, cyclotron radii, charged paths — all live, all tweakable.", tint: K.carpYellow },
          ].map((c) => (
            <Box
              key={c.title}
              sx={{
                position: "relative",
                p: 2.75,
                borderRadius: 4.5,
                border: `1px solid ${ka(K.sumiInk3, 0.8)}`,
                bgcolor: `linear-gradient(180deg, ${ka(K.sumiInk1, 0.9)}, ${ka(K.sumiInk0, 0.6)})`,
                overflow: "hidden",
              }}
            >
              <Box sx={{ position: "absolute", top: -46, right: -46, width: 130, height: 130, borderRadius: "50%", background: `radial-gradient(circle, ${ka(c.tint, 0.22)} 0%, transparent 70%)` }} />
              <Typography sx={{ fontWeight: 700, fontSize: "0.92rem", mb: 1, color: K.fujiWhite }}>{c.title}</Typography>
              <Typography sx={{ fontSize: "0.8rem", color: K.springViolet1, lineHeight: 1.65 }}>{c.copy}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* system / palette */}
      <Box component="section" id="system" sx={{ position: "relative", maxWidth: 1120, mx: "auto", px: { xs: 2, sm: 3 }, py: { xs: 7, md: 11 } }}>
        <Box
          sx={{
            borderRadius: 6,
            border: `1px solid ${ka(K.sumiInk3, 0.85)}`,
            background: `linear-gradient(140deg, ${ka(K.waveBlue2, 0.35)}, ${ka(K.sumiInk1, 0.9)} 45%)`,
            p: { xs: 3.5, md: 6 },
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box sx={{ position: "absolute", top: -140, right: -140, width: 420, height: 420, borderRadius: "50%", background: `radial-gradient(circle, ${ka(K.crystalBlue, 0.18)} 0%, transparent 70%)` }} />
          <Stack spacing={3} sx={{ position: "relative", maxWidth: 620 }}>
            <Typography
              className="jee-mono"
              sx={{ color: K.springBlue, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase" }}
            >
              The system
            </Typography>
            <Typography sx={{ fontSize: { xs: "1.6rem", md: "2.1rem" }, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              Study like a systems engineer, not a student.
            </Typography>
            <Typography sx={{ color: K.springViolet2, lineHeight: 1.75, fontSize: "0.95rem" }}>
              Track the syllabus like a backlog. Treat mocks like production incidents. Keep a ledger of every
              mistake, review it on a schedule, and let the analytics tell you what to study next — the same
              loop, every day, until the exam is a formality.
            </Typography>
            <Stack direction="row" spacing={2} sx={{ pt: 1, flexWrap: "wrap", gap: 1.5 }}>
              {PALETTE.map((p) => (
                <Stack key={p.hex} direction="row" spacing={0.75} alignItems="center" sx={{ px: 1.5, py: 0.75, borderRadius: 999, border: `1px solid ${ka(K.sumiInk3, 0.9)}`, bgcolor: ka(K.sumiInk0, 0.5) }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: 999, bgcolor: p.hex, boxShadow: `0 0 12px ${ka(p.hex, 0.8)}` }} />
                  <Typography className="jee-mono" sx={{ fontSize: "0.66rem", color: K.oldWhite }}>{p.name}</Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Box>
      </Box>

      {/* final CTA */}
      <Box component="section" sx={{ position: "relative", maxWidth: 1120, mx: "auto", px: { xs: 2, sm: 3 }, py: { xs: 7, md: 11 }, textAlign: "center" }}>
        <Stack spacing={3} alignItems="center" sx={{ maxWidth: 640, mx: "auto" }}>
          <Typography sx={{ fontSize: { xs: "1.9rem", md: "2.6rem" }, fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1.15, textWrap: "balance" }}>
            Two years. One wave.{" "}
            <Box component="span" sx={{ color: K.crystalBlue }}>
              Ride it.
            </Box>
          </Typography>
          <Typography sx={{ color: K.springViolet1, lineHeight: 1.7 }}>
            Set up your account in a minute — the syllabus map, labs and analytics are waiting.
          </Typography>
          <Box
            component="a"
            href={user ? "/dashboard" : "/signup"}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              px: 4,
              py: 1.6,
              borderRadius: 999,
              background: `linear-gradient(135deg, ${K.crystalBlue}, ${K.springBlue})`,
              color: K.sumiInk0,
              fontWeight: 800,
              fontSize: "1rem",
              boxShadow: `0 12px 44px ${ka(K.crystalBlue, 0.45)}`,
              transition: "transform .18s ease, box-shadow .18s ease",
              "&:hover": { transform: "translateY(-2px)", boxShadow: `0 16px 52px ${ka(K.crystalBlue, 0.6)}` },
            }}
          >
            {user ? "Open your dashboard" : "Create your account"}
            <ArrowForwardIcon sx={{ fontSize: 19 }} />
          </Box>
        </Stack>
      </Box>

      {/* footer */}
      <Box component="footer" sx={{ position: "relative", borderTop: `1px solid ${ka(K.sumiInk3, 0.5)}` }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between" alignItems="center" sx={{ maxWidth: 1120, mx: "auto", px: { xs: 2, sm: 3 }, py: 4 }}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <WaveMark size={28} />
            <Typography sx={{ fontSize: "0.8rem", color: K.springViolet1, fontWeight: 600 }}>
              JEE Command — built for aspirants, by the Great Wave.
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2.5}>
            {[
              { href: "/login", label: "Sign in" },
              { href: "/signup", label: "Sign up" },
            ].map((l) => (
              <Box key={l.href} component="a" href={l.href} sx={{ color: K.katanaGray, fontSize: "0.8rem", fontWeight: 600, "&:hover": { color: K.fujiWhite } }}>
                {l.label}
              </Box>
            ))}
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
