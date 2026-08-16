"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
  type Theme,
  CSSObject,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";

export type ThemeMode = "light" | "dark" | "system";
type Resolved = "light" | "dark";

const STORAGE_KEY = "jee-theme-mode";

const ThemeModeContext = createContext<{
  mode: ThemeMode;
  resolved: Resolved;
  setMode: (m: ThemeMode) => void;
}>({ mode: "system", resolved: "light", setMode: () => {} });

export const useThemeMode = () => useContext(ThemeModeContext);

// Paper & Ink — Claude-inspired monochrome. Warm paper, warm ink, one terracotta
// accent. Sharp corners (radius 0) with hard offset shadows. Simulations and
// charts keep their data colors; the chrome around them stays monochrome.
export const INK = "#1F1E1D";
export const PAPER = "#F0EEE6";
export const CARD = "#FBFAF6";
export const TERRA = "#D97757";

const SANS = "var(--font-inter), system-ui, -apple-system, sans-serif";
const SERIF = "var(--font-serif), Georgia, 'Times New Roman', serif";

const shape = { borderRadius: 0 } as const;

const typography = {
  fontFamily: SANS,
  h1: { fontFamily: SERIF, fontWeight: 600, letterSpacing: "-0.01em" },
  h2: { fontFamily: SERIF, fontWeight: 600, letterSpacing: "-0.01em" },
  h3: { fontFamily: SERIF, fontWeight: 600, letterSpacing: "-0.005em" },
  h4: { fontFamily: SERIF, fontSize: "1.5rem", fontWeight: 600, letterSpacing: "-0.005em" },
  h5: { fontFamily: SERIF, fontSize: "1.2rem", fontWeight: 600 },
  h6: { fontFamily: SERIF, fontSize: "1.05rem", fontWeight: 600 },
  subtitle2: { fontWeight: 600 },
  body2: { fontSize: "0.8125rem" },
  button: { textTransform: "none" as const, fontWeight: 700, letterSpacing: "0.02em" },
};

// Sharp tile: hairline ink border + hard offset shadow.
const tile = (border: string, shadow: string): CSSObject => ({
  borderRadius: 0,
  border: `1.5px solid ${border}`,
  boxShadow: `${shadow}`,
});

const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: TERRA, dark: "#C05C3C", light: "#E08B6D" },
    secondary: { main: "#4A4842" },
    success: { main: "#43806B" },
    warning: { main: "#C77D2E" },
    error: { main: "#BF4B4B" },
    info: { main: "#3E5F8A" },
    background: { default: PAPER, paper: CARD },
    text: { primary: INK, secondary: "#6E6B64" },
    divider: "#DDD9CF",
  },
  shape,
  typography,
  components: {
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: "none" } },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          ...tile(INK, "4px 4px 0 #1F1E1D"),
          backgroundColor: CARD,
          transition: "box-shadow .18s ease, transform .18s ease",
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 0, transition: "all .15s ease" },
        containedPrimary: {
          backgroundColor: INK,
          color: "#FAF9F5",
          border: `1.5px solid ${INK}`,
          boxShadow: "3px 3px 0 #D97757",
          "&:hover": {
            backgroundColor: "#35332F",
            transform: "translate(-1px,-1px)",
            boxShadow: "4px 4px 0 #D97757",
          },
          "&:active": { transform: "translate(2px,2px)", boxShadow: "1px 1px 0 #D97757" },
        },
        outlinedPrimary: {
          border: "1.5px solid #1F1E1D",
          color: "#1F1E1D",
          "&:hover": { border: "1.5px solid #1F1E1D", backgroundColor: "rgba(31,30,29,0.06)" },
        },
        outlined: {
          "&:hover": { backgroundColor: "rgba(31,30,29,0.06)" },
        },
      },
    },
    MuiChip: {
      defaultProps: { size: "small" },
      styleOverrides: {
        root: { borderRadius: 0, fontWeight: 600, letterSpacing: "0.02em" },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: { root: { borderRadius: 0, backgroundColor: "#FFFFFF" } },
    },
    MuiAlert: { styleOverrides: { root: { borderRadius: 0 } } },
    MuiTooltip: {
      defaultProps: { arrow: false },
      styleOverrides: {
        tooltip: {
          backgroundColor: INK,
          color: "#FAF9F5",
          fontSize: "0.72rem",
          fontWeight: 600,
          borderRadius: 0,
          padding: "6px 10px",
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: { root: { borderRadius: 0 }, bar: { borderRadius: 0 } },
    },
    MuiTableCell: {
      styleOverrides: { root: { borderColor: "#DDD9CF" } },
    },
    MuiTab: {
      styleOverrides: { root: { minHeight: 40, fontWeight: 700, textTransform: "none" as const } },
    },
    MuiTabs: {
      styleOverrides: { indicator: { height: 3, borderRadius: 0, backgroundColor: TERRA } },
    },
    MuiToggleButton: {
      styleOverrides: { root: { borderRadius: 0 } },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          border: "1.5px solid #1F1E1D",
          boxShadow: "6px 6px 0 #1F1E1D",
          backgroundImage: "none",
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          border: "1.5px solid #1F1E1D",
          boxShadow: "4px 4px 0 #1F1E1D",
          backgroundImage: "none",
        },
      },
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#DE8468", dark: "#D97757", light: "#E89B82" },
    secondary: { main: "#A8A49B" },
    success: { main: "#7BA88F" },
    warning: { main: "#D9A05B" },
    error: { main: "#D97D7D" },
    info: { main: "#8FA8C8" },
    background: { default: "#1B1A18", paper: "#26251F" },
    text: { primary: PAPER, secondary: "#A8A49B" },
    divider: "#3D3B35",
  },
  shape,
  typography,
  components: {
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: "none" } },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          ...tile("#E8E5DB", "4px 4px 0 #000"),
          backgroundColor: "#26251F",
          transition: "box-shadow .18s ease, transform .18s ease",
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 0, transition: "all .15s ease" },
        containedPrimary: {
          backgroundColor: PAPER,
          color: "#1F1E1D",
          border: "1.5px solid #F0EEE6",
          boxShadow: "3px 3px 0 #D97757",
          "&:hover": {
            backgroundColor: "#FFFDF8",
            transform: "translate(-1px,-1px)",
            boxShadow: "4px 4px 0 #D97757",
          },
          "&:active": { transform: "translate(2px,2px)", boxShadow: "1px 1px 0 #D97757" },
        },
        outlinedPrimary: {
          border: "1.5px solid #E8E5DB",
          color: "#F0EEE6",
          "&:hover": { border: "1.5px solid #E8E5DB", backgroundColor: "rgba(240,238,230,0.08)" },
        },
        outlined: {
          "&:hover": { backgroundColor: "rgba(240,238,230,0.08)" },
        },
      },
    },
    MuiChip: {
      defaultProps: { size: "small" },
      styleOverrides: {
        root: { borderRadius: 0, fontWeight: 600, letterSpacing: "0.02em" },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: { root: { borderRadius: 0, backgroundColor: "#1F1E1D" } },
    },
    MuiAlert: { styleOverrides: { root: { borderRadius: 0 } } },
    MuiTooltip: {
      defaultProps: { arrow: false },
      styleOverrides: {
        tooltip: {
          backgroundColor: PAPER,
          color: "#1F1E1D",
          fontSize: "0.72rem",
          fontWeight: 600,
          borderRadius: 0,
          padding: "6px 10px",
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: { root: { borderRadius: 0 }, bar: { borderRadius: 0 } },
    },
    MuiTableCell: {
      styleOverrides: { root: { borderColor: "#3D3B35" } },
    },
    MuiTab: {
      styleOverrides: { root: { minHeight: 40, fontWeight: 700, textTransform: "none" as const } },
    },
    MuiTabs: {
      styleOverrides: { indicator: { height: 3, borderRadius: 0, backgroundColor: "#DE8468" } },
    },
    MuiToggleButton: {
      styleOverrides: { root: { borderRadius: 0 } },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          border: "1.5px solid #E8E5DB",
          boxShadow: "6px 6px 0 #000",
          backgroundImage: "none",
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          border: "1.5px solid #E8E5DB",
          boxShadow: "4px 4px 0 #000",
          backgroundImage: "none",
        },
      },
    },
  },
});

function GlobalThemeStyles() {
  return (
    <GlobalStyles
      styles={(theme: Theme) => ({
        "@keyframes jee-fade-up": {
          from: { opacity: 0, transform: "translateY(10px)" },
          to: { opacity: 1, transform: "none" },
        },
        html: { scrollBehavior: "smooth" },
        "::selection": {
          backgroundColor: theme.palette.mode === "dark" ? "rgba(222,132,104,.45)" : "rgba(217,119,87,.3)",
        },
        "*::-webkit-scrollbar": { width: 10, height: 10 },
        "*::-webkit-scrollbar-track": { background: "transparent" },
        "*::-webkit-scrollbar-thumb": {
          background: theme.palette.mode === "dark" ? "#3D3B35" : "#CFC9BC",
          "&:hover": { background: theme.palette.mode === "dark" ? "#4A4842" : "#B9B2A3" },
        },
        ".jee-page-enter": {
          animation: "jee-fade-up .35s cubic-bezier(.22,1,.36,1) both",
        },
        ".jee-serif": { fontFamily: SERIF },
        ".jee-num": { fontVariantNumeric: "tabular-nums lining-nums" },
      })}
    />
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [resolved, setResolved] = useState<Resolved>("light");

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as ThemeMode | null) ?? "system";
    setModeState(stored);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      setResolved(mode === "system" ? (mq.matches ? "dark" : "light") : mode);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [mode]);

  const setMode = useCallback((m: ThemeMode) => {
    localStorage.setItem(STORAGE_KEY, m);
    setModeState(m);
  }, []);

  const theme = useMemo(() => (resolved === "dark" ? darkTheme : lightTheme), [resolved]);

  const ctx = useMemo(() => ({ mode, resolved, setMode }), [mode, resolved, setMode]);

  return (
    <ThemeModeContext.Provider value={ctx}>
      <AppRouterCacheProvider options={{ key: "mui" }}>
        <MuiThemeProvider theme={theme}>
          <CssBaseline enableColorScheme />
          <GlobalThemeStyles />
          {children}
        </MuiThemeProvider>
      </AppRouterCacheProvider>
    </ThemeModeContext.Provider>
  );
}
