import type { ComponentType } from "react";
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
import type { BeanName } from "@/lib/jellybeans";

export type NavItem = { href: string; label: string; icon: ComponentType<{ fontSize?: "small" | "medium" | "large"; sx?: object }> };
export type NavSection = { section: string; bean: BeanName; items: NavItem[] };

/** Sections are numbered like a dossier index — 01 through 06. */
export const NAV: NavSection[] = [
  {
    section: "Overview",
    bean: "bubblegum",
    items: [{ href: "/dashboard", label: "Dashboard", icon: DashboardOutlinedIcon }],
  },
  {
    section: "Preparation",
    bean: "sky",
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
    bean: "tangerine",
    items: [
      { href: "/questions", label: "Questions", icon: QuizOutlinedIcon },
      { href: "/mistakes", label: "Mistakes", icon: BugReportOutlinedIcon },
      { href: "/mock-tests", label: "Mock Tests", icon: AssignmentOutlinedIcon },
    ],
  },
  {
    section: "Analytics",
    bean: "lemon",
    items: [
      { href: "/performance", label: "Performance", icon: InsightsOutlinedIcon },
      { href: "/weightage", label: "JEE Weightage", icon: BarChartOutlinedIcon },
      { href: "/insights", label: "Insights", icon: TipsAndUpdatesOutlinedIcon },
    ],
  },
  {
    section: "Personal",
    bean: "lavender",
    items: [
      { href: "/journal", label: "Journal", icon: BookOutlinedIcon },
      { href: "/calendar", label: "Calendar", icon: CalendarMonthOutlinedIcon },
      { href: "/resources", label: "Resources", icon: FolderOutlinedIcon },
    ],
  },
  {
    section: "System",
    bean: "mint",
    items: [{ href: "/settings", label: "Settings", icon: SettingsOutlinedIcon }],
  },
];

export const MOBILE_NAV: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: DashboardOutlinedIcon },
  { href: "/syllabus", label: "Syllabus", icon: MenuBookOutlinedIcon },
  { href: "/sessions", label: "Study", icon: TimerOutlinedIcon },
  { href: "/mock-tests", label: "Tests", icon: AssignmentOutlinedIcon },
  { href: "/performance", label: "Stats", icon: InsightsOutlinedIcon },
];

/** Dossier index for a route — "01"…"06" from its owning nav section. */
export function sectionIndexFor(pathname: string): { index: string; section: string; bean: BeanName } | null {
  for (let i = 0; i < NAV.length; i++) {
    const g = NAV[i];
    if (g.items.some((it) => pathname === it.href || pathname.startsWith(it.href + "/"))) {
      return { index: String(i + 1).padStart(2, "0"), section: g.section, bean: g.bean };
    }
  }
  return null;
}
