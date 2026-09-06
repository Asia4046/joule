package main

// ─────────────────────────────────────────────────────────────────────────────
//  STATUS — the preflight report without launching. Probes run synchronously
//  (they take a second or two), then the dossier is displayed until any key.
// ─────────────────────────────────────────────────────────────────────────────

import (
	"fmt"
	"os"
	"os/exec"
	"strings"

	tea "github.com/charmbracelet/bubbletea"
)

type statusModel struct {
	lines []string
}

func (m statusModel) Init() tea.Cmd { return nil }
func (m statusModel) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	if _, ok := msg.(tea.KeyMsg); ok {
		return m, tea.Quit
	}
	return m, nil
}
func (m statusModel) View() string {
	var b strings.Builder
	b.WriteString(banner())
	b.WriteString("\n")
	for _, l := range m.lines {
		b.WriteString(l)
		b.WriteString("\n")
	}
	b.WriteString(colophon())
	b.WriteString("\n")
	b.WriteString(dimStyle.Render("  press any key to log off"))
	return b.String()
}

// collectStatus gathers the whole report as transcript lines.
func collectStatus(cfg *options) []string {
	var out []string
	appendStage := func(num, title string, bean lipglossColor) {
		out = append(out, "", hdr(num, title, bean))
	}

	appendStage(stagePreflight.num, stagePreflight.title, stagePreflight.bean)
	lines, err := preflightLines(cfg)
	out = append(out, lines...)
	if err != nil {
		out = append(out, errLine("%s", err.Error()))
		return out
	}

	appendStage(stageDependencies.num, stageDependencies.title, stageDependencies.bean)
	lines, _ = depsCheckLines(cfg)
	out = append(out, lines...)
	if depsPresent(cfg) {
		lines, _ = prismaClientLines(cfg)
		out = append(out, lines...)
	} else {
		out = append(out, skipLine("prisma client not generated yet"))
	}

	appendStage(stageEnvironment.num, stageEnvironment.title, stageEnvironment.bean)
	envFile := envFileExists(cfg)
	if envFile {
		env, _ := parseEnvFile(cfg.root + string(os.PathSeparator) + ".env")
		out = append(out, okLine(".env found"))
		if dburl := env["DATABASE_URL"]; dburl != "" {
			out = append(out, okLine("DATABASE_URL → %s", maskURL(dburl)))
		} else {
			out = append(out, errLine("DATABASE_URL is not set — put a PostgreSQL URL in .env"))
			return out
		}
	} else {
		out = append(out, errLine("no .env yet — run ./joule.sh to mint one"))
		return out
	}

	appendStage(stageDatabase.num, stageDatabase.title, stageDatabase.bean)
	probe := dbProbe()
	switch {
	case strings.HasPrefix(probe, "OK"):
		out = append(out, okLine("reachable & seeded — %s", strings.TrimPrefix(probe, "OK ")))
	case strings.HasPrefix(probe, "EMPTY"):
		out = append(out, warnLine("reachable, schema not migrated yet (run: ./joule.sh migrate)"))
	default:
		out = append(out, errLine("unreachable — %s", strings.TrimPrefix(probe, "CONN ")))
	}
	if dbReachable(probe) {
		ms, _ := exec.Command(cfg.root+string(os.PathSeparator)+"node_modules"+string(os.PathSeparator)+".bin"+string(os.PathSeparator)+"prisma",
			"migrate", "status").CombinedOutput()
		if strings.Contains(strings.ToLower(string(ms)), "up to date") {
			out = append(out, okLine("migrations: up to date"))
		} else {
			out = append(out, warnLine("migrations: pending (run: ./joule.sh migrate)"))
		}
	}

	appendStage("05", "BUILD", lavender)
	if _, err := os.Stat(cfg.root + string(os.PathSeparator) + ".next"); err == nil {
		out = append(out, okLine(".next build cache present"))
	} else {
		out = append(out, skipLine("no build yet"))
	}
	return out
}

// runStatus renders the report, quiting on any key when on a TTY.
func runStatus(cfg *options) {
	lines := collectStatus(cfg)
	if !isTTY(os.Stdout) {
		fmt.Println(banner())
		for _, l := range lines {
			fmt.Println(l)
		}
		fmt.Println(colophon())
		return
	}
	p := tea.NewProgram(statusModel{lines: lines})
	_, _ = p.Run()
}
