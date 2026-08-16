"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
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
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import SearchCommand from "@/components/SearchCommand";
import NotificationBell from "@/components/NotificationBell";
import { ClockCard, QuoteCard } from "@/components/SidebarWidgets";
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

const SIDEBAR_WIDTH = 264;

function Brand() {
  return (
    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ px: 0.5 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          bgcolor: "#D97757",
          border: "1.5px solid #000",
          boxShadow: "3px 3px 0 #000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Typography className="jee-serif" sx={{ fontWeight: 700, fontSize: "1.15rem", color: "#1F1E1D", lineHeight: 1 }}>
          J
        </Typography>
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{ fontWeight: 800, fontSize: "0.95rem", color: "#F0EEE6", lineHeight: 1.15, letterSpacing: "0.02em" }}
        >
          JEE COMMAND
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: "rgba(240,238,230,0.45)", fontSize: "0.58rem", letterSpacing: "0.16em", fontWeight: 700, textTransform: "uppercase" }}
        >
          Prep Platform
        </Typography>
      </Box>
    </Stack>
  );
}

function SidebarContent({ pathname, userName }: { pathname: string; userName: string }) {
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
        bgcolor: "#1F1E1D",
      }}
    >
      <Box sx={{ px: 2, pt: 2.25, pb: 2 }}>
        <Brand />
      </Box>
      <Box sx={{ px: 2, pb: 2 }}>
        <ClockCard />
      </Box>
      <Box sx={{ px: 1.5, flex: 1, overflowY: "auto", pb: 1 }}>
        {NAV.map((group) => (
          <Box key={group.section} sx={{ mb: 1.5 }}>
            <Typography
              variant="caption"
              sx={{ px: 1.5, py: 0.5, display: "block", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", fontSize: "0.58rem", color: "rgba(240,238,230,0.38)" }}
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
                      mb: 0.25,
                      minHeight: 36,
                      position: "relative",
                      color: active ? "#1F1E1D" : "rgba(240,238,230,0.72)",
                      transition: "all .15s ease",
                      ...(active
                        ? {
                            bgcolor: "#F0EEE6",
                            border: "1.5px solid #F0EEE6",
                            boxShadow: "3px 3px 0 #D97757",
                            "&:hover": { bgcolor: "#FFFDF8" },
                          }
                        : {
                            border: "1.5px solid transparent",
                            "&:hover": { bgcolor: "rgba(240,238,230,0.08)", color: "#F0EEE6" },
                          }),
                      "& .MuiListItemIcon-root": {
                        minWidth: 34,
                        color: active ? "#C05C3C" : "rgba(240,238,230,0.55)",
                      },
                    }}
                    selected={active}
                  >
                    <ListItemIcon sx={{ minWidth: 34 }}>
                      <item.icon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ fontSize: "0.85rem", fontWeight: active ? 700 : 500 }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>
      <Box sx={{ px: 2, pb: 1.5 }}>
        <QuoteCard />
      </Box>
      <Box sx={{ px: 1.5, pt: 0.5, pb: 1.5 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            p: 1.25,
            border: "1.5px solid #57544C",
            boxShadow: "3px 3px 0 #000",
            bgcolor: "#2A2926",
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              bgcolor: "#D97757",
              border: "1.5px solid #000",
              color: "#1F1E1D",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.72rem",
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            {initials}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.8rem", color: "#F0EEE6", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {userName}
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(240,238,230,0.45)", fontSize: "0.65rem" }}>
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
  const { mode, resolved, setMode } = useThemeMode();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const dark = resolved === "dark";

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
        sx={{ display: { xs: "block", md: "none" }, "& .MuiDrawer-paper": { width: SIDEBAR_WIDTH, border: "none", bgcolor: "#1F1E1D" } }}
      >
        <SidebarContent pathname={pathname} userName={userName} />
      </Drawer>

      <Box sx={{ flexGrow: 1, minWidth: 0, pb: { xs: 7, md: 0 } }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: dark ? "rgba(27,26,24,0.9)" : "rgba(240,238,230,0.9)",
            backdropFilter: "blur(8px)",
            borderBottom: "1.5px solid",
            borderBottomColor: dark ? "#3D3B35" : "#1F1E1D",
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
                py: 0.75,
                cursor: "text",
                width: { xs: "100%", sm: 380 },
                textAlign: "left",
                bgcolor: dark ? "#26251F" : "#FBFAF6",
                border: "1.5px solid",
                borderColor: dark ? "#E8E5DB" : "#1F1E1D",
                boxShadow: dark ? "3px 3px 0 #000" : "3px 3px 0 #1F1E1D",
                transition: "transform .15s ease, box-shadow .15s ease",
                "&:hover": {
                  transform: "translate(-1px,-1px)",
                  boxShadow: dark ? "4px 4px 0 #000" : "4px 4px 0 #1F1E1D",
                },
                "&:focus-visible": {
                  outline: "2px solid #D97757",
                  outlineOffset: 2,
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
                  border: "1px solid",
                  borderColor: "divider",
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
            <Tooltip title={dark ? "Light mode" : "Dark mode"}>
              <IconButton
                onClick={() => setMode(dark ? "light" : "dark")}
                aria-label="Toggle theme"
                sx={{
                  transition: "transform .25s ease",
                  "&:hover": { transform: "rotate(15deg)" },
                }}
              >
                {dark ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
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
          borderTop: "1.5px solid",
          borderColor: dark ? "#E8E5DB" : "#1F1E1D",
          bgcolor: dark ? "rgba(38,37,31,0.95)" : "rgba(251,250,246,0.95)",
          backdropFilter: "blur(8px)",
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
                color: active ? "primary.dark" : "text.secondary",
                textDecoration: "none",
              }}
            >
              <Box
                sx={{
                  px: 1.5,
                  py: 0.25,
                  bgcolor: active ? alpha("#D97757", 0.16) : "transparent",
                  transition: "background-color .15s ease",
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
