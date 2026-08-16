"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import AppBar from "@mui/material/AppBar";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme, alpha } from "@mui/material/styles";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import SearchIcon from "@mui/icons-material/SearchOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import TrackChangesOutlinedIcon from "@mui/icons-material/TrackChangesOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import AutorenewOutlinedIcon from "@mui/icons-material/AutorenewOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import TipsAndUpdatesOutlinedIcon from "@mui/icons-material/TipsAndUpdatesOutlined";
import BookOutlinedIcon from "@mui/icons-material/MenuBook";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import BoltIcon from "@mui/icons-material/Bolt";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import SearchCommand from "@/components/SearchCommand";
import NotificationBell from "@/components/NotificationBell";
import { useThemeMode } from "@/components/Providers";

const NAV = [
  {
    section: "Overview",
    items: [{ href: "/dashboard", label: "Dashboard", icon: DashboardOutlinedIcon }],
  },
  {
    section: "Preparation",
    items: [
      { href: "/syllabus", label: "Syllabus", icon: MenuBookOutlinedIcon },
      { href: "/concepts", label: "Concept Labs", icon: ScienceOutlinedIcon },
      { href: "/tracker", label: "Tracker", icon: TrackChangesOutlinedIcon },
      { href: "/sessions", label: "Study Sessions", icon: TimerOutlinedIcon },
      { href: "/revision", label: "Revision", icon: AutorenewOutlinedIcon },
      { href: "/goals", label: "Goals", icon: FlagOutlinedIcon },
    ],
  },
  {
    section: "Practice",
    items: [
      { href: "/questions", label: "Questions", icon: QuizOutlinedIcon },
      { href: "/mistakes", label: "Mistakes", icon: BugReportOutlinedIcon },
      { href: "/mock-tests", label: "Mock Tests", icon: AssignmentOutlinedIcon },
    ],
  },
  {
    section: "Analytics",
    items: [
      { href: "/performance", label: "Performance", icon: InsightsOutlinedIcon },
      { href: "/weightage", label: "JEE Weightage", icon: BarChartOutlinedIcon },
      { href: "/insights", label: "Insights", icon: TipsAndUpdatesOutlinedIcon },
    ],
  },
  {
    section: "Personal",
    items: [
      { href: "/journal", label: "Journal", icon: BookOutlinedIcon },
      { href: "/calendar", label: "Calendar", icon: CalendarMonthOutlinedIcon },
      { href: "/resources", label: "Resources", icon: FolderOutlinedIcon },
    ],
  },
  {
    section: "System",
    items: [{ href: "/settings", label: "Settings", icon: SettingsOutlinedIcon }],
  },
];

const MOBILE_NAV = [
  { href: "/dashboard", label: "Home", icon: DashboardOutlinedIcon },
  { href: "/syllabus", label: "Syllabus", icon: MenuBookOutlinedIcon },
  { href: "/sessions", label: "Study", icon: TimerOutlinedIcon },
  { href: "/mock-tests", label: "Tests", icon: AssignmentOutlinedIcon },
  { href: "/performance", label: "Stats", icon: InsightsOutlinedIcon },
];

const SIDEBAR_WIDTH = 248;

function Brand() {
  const theme = useTheme();
  return (
    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ px: 1.5 }}>
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: 2.5,
          background: "linear-gradient(135deg, #4f46e5, #8b5cf6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 4px 14px rgba(99,102,241,.45)"
              : "0 4px 12px rgba(79,70,229,.35)",
          flexShrink: 0,
        }}
      >
        <BoltIcon sx={{ fontSize: 19 }} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 800, fontSize: "0.98rem", letterSpacing: "-0.02em", lineHeight: 1.15 }}>
          JEE<span style={{ opacity: 0.45 }}>·</span>Command
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontSize: "0.6rem", letterSpacing: "0.1em", fontWeight: 700, textTransform: "uppercase" }}
        >
          Prep Platform
        </Typography>
      </Box>
    </Stack>
  );
}

function SidebarContent({ pathname, userName }: { pathname: string; userName: string }) {
  const theme = useTheme();
  const initials = useMemo(
    () => userName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase(),
    [userName]
  );
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background:
          theme.palette.mode === "dark"
            ? "linear-gradient(180deg, #0e0e14, #0b0b10)"
            : "linear-gradient(180deg, #fcfcfe, #f4f5fa)",
      }}
    >
      <Box sx={{ px: 1.5, py: 2.25 }}>
        <Brand />
      </Box>
      <Box sx={{ px: 1.5, flex: 1, overflowY: "auto", pb: 1.5 }}>
        {NAV.map((group) => (
          <Box key={group.section} sx={{ mb: 1.75 }}>
            <Typography
              variant="caption"
              sx={{ px: 1.5, py: 0.5, display: "block", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", fontSize: "0.62rem" }}
              color="text.secondary"
            >
              {group.section}
            </Typography>
            <List dense disablePadding>
              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <ListItemButton
                    key={item.href}
                    component={Link}
                    href={item.href}
                    sx={{
                      borderRadius: 2,
                      mb: 0.25,
                      minHeight: 38,
                      position: "relative",
                      transition: "all .15s ease",
                      ...(active
                        ? {
                            bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.16 : 0.1),
                            color: theme.palette.mode === "dark" ? theme.palette.primary.light : theme.palette.primary.dark,
                            "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.14) },
                            "&::before": {
                              content: '""',
                              position: "absolute",
                              left: -6,
                              top: "50%",
                              transform: "translateY(-50%)",
                              width: 3,
                              height: 18,
                              borderRadius: 3,
                              background: `linear-gradient(180deg, ${theme.palette.primary.main}, #8b5cf6)`,
                            },
                          }
                        : {
                            color: theme.palette.text.secondary,
                            "&:hover": { bgcolor: alpha(theme.palette.text.primary, 0.05), color: "text.primary" },
                          }),
                      "& .MuiListItemIcon-root": {
                        minWidth: 34,
                        color: active
                          ? theme.palette.mode === "dark"
                            ? theme.palette.primary.light
                            : theme.palette.primary.dark
                          : undefined,
                      },
                    }}
                    selected={active}
                  >
                    <ListItemIcon sx={{ minWidth: 34 }}>
                      <item.icon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ fontSize: "0.85rem", fontWeight: active ? 650 : 500 }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>
      <Box sx={{ p: 1.5, pt: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            p: 1.25,
            borderRadius: 2.5,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: alpha(theme.palette.background.paper, 0.65),
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #4f46e5, #8b5cf6)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.72rem",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {initials}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.8rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {userName}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
              Signed in
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default function AppShell({ children, userName }: { children: React.ReactNode; userName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const { mode, setMode } = useThemeMode();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100dvh", bgcolor: "background.default" }}>
      {/* Desktop sidebar */}
      <Box
        component="nav"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          borderRight: `1px solid ${theme.palette.divider}`,
          display: { xs: "none", md: "block" },
          position: "sticky",
          top: 0,
          height: "100dvh",
        }}
      >
        <SidebarContent pathname={pathname} userName={userName} />
      </Box>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { xs: "block", md: "none" }, "& .MuiDrawer-paper": { width: SIDEBAR_WIDTH, borderRight: `1px solid ${theme.palette.divider}` } }}
      >
        <SidebarContent pathname={pathname} userName={userName} />
      </Drawer>

      <Box sx={{ flexGrow: 1, minWidth: 0, pb: { xs: 7, md: 0 } }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: alpha(theme.palette.background.paper, 0.82),
            backdropFilter: "blur(10px)",
            borderBottom: `1px solid ${theme.palette.divider}`,
            color: "text.primary",
          }}
        >
          <Toolbar sx={{ gap: 1 }}>
            {!isDesktop && (
              <IconButton edge="start" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
                <MenuOutlinedIcon />
              </IconButton>
            )}
            <Paper
              component="button"
              onClick={() => setSearchOpen(true)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 2,
                py: 0.8,
                borderRadius: 999,
                cursor: "text",
                width: { xs: "100%", sm: 380 },
                textAlign: "left",
                bgcolor: theme.palette.mode === "dark" ? alpha(theme.palette.background.default, 0.8) : "#f1f2f7",
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: "none",
                transition: "border-color .2s ease, box-shadow .2s ease",
                "&:hover": {
                  borderColor: alpha(theme.palette.primary.main, 0.45),
                  boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.08)}`,
                },
              }}
            >
              <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                Search chapters, tests, journal…
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: { xs: "none", sm: "block" },
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1.5,
                  px: 0.75,
                  py: 0.25,
                  fontSize: "0.65rem",
                  fontWeight: 600,
                }}
              >
                Ctrl K
              </Typography>
            </Paper>
            <Box sx={{ flexGrow: 1 }} />
            <NotificationBell />
            <Tooltip title={mode === "dark" ? "Light mode" : "Dark mode"}>
              <IconButton
                onClick={() => setMode(mode === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
                sx={{
                  transition: "transform .25s ease",
                  "&:hover": { transform: "rotate(15deg)" },
                }}
              >
                {mode === "dark" ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Log out">
              <IconButton onClick={logout} aria-label="Log out">
                <LogoutOutlinedIcon />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ p: { xs: 1.5, sm: 2.5, md: 3 }, maxWidth: 1280, mx: "auto" }}>
          <Box key={pathname} className="jee-page-enter">
            {children}
          </Box>
        </Box>
      </Box>

      {/* Mobile bottom nav */}
      <Paper
        square
        elevation={0}
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          display: { xs: "flex", md: "none" },
          zIndex: theme.zIndex.appBar,
          borderTop: `1px solid ${theme.palette.divider}`,
          bgcolor: alpha(theme.palette.background.paper, 0.92),
          backdropFilter: "blur(10px)",
        }}
      >
        {MOBILE_NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Box
              key={item.href}
              component={Link}
              href={item.href}
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.25,
                py: 1,
                color: active ? "primary.main" : "text.secondary",
                textDecoration: "none",
              }}
            >
              <Box
                sx={{
                  px: 1.5,
                  py: 0.25,
                  borderRadius: 999,
                  bgcolor: active ? alpha(theme.palette.primary.main, 0.12) : "transparent",
                  transition: "background-color .2s ease",
                }}
              >
                <item.icon fontSize="small" />
              </Box>
              <Typography variant="caption" sx={{ fontSize: "0.65rem", fontWeight: active ? 700 : 500 }}>
                {item.label}
              </Typography>
            </Box>
          );
        })}
      </Paper>

      <SearchCommand open={searchOpen} onClose={() => setSearchOpen(false)} />
    </Box>
  );
}
