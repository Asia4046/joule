package main

// ─────────────────────────────────────────────────────────────────────────────
//  JOULE // JEE PREPARATION PLATFORM — local configure & run (Bubble Tea TUI)
//  Jellybean Dossier edition · PAPER #0A0908 · INK #DED5C6 · BEANS ×8
//
//  One command stands the app up from a clean clone:
//      ./joule.sh            → preflight → install → .env → migrate → seed → dev
//      ./joule.sh --prod     → same, then next build && next start
//
//  Subcommands: dev | build | start | seed | migrate | studio | backup |
//               restore | status | help
// ─────────────────────────────────────────────────────────────────────────────

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"

	"github.com/charmbracelet/lipgloss"
	"github.com/muesli/termenv"
)

func bannerPrint() { fmt.Println(banner()) }

// ── step helpers ─────────────────────────────────────────────────────────────

func execStep(st stageDef, label string, command func() *exec.Cmd) step {
	return step{kind: stepExec, stage: st.title, num: st.num, bean: st.bean, label: label, command: command}
}

func fnStep(st stageDef, label string, run func() ([]string, error)) step {
	return step{kind: stepFn, stage: st.title, num: st.num, bean: st.bean, label: label, run: run}
}

// envStep loads .env and guarantees DATABASE_URL, like require_ready.
func envStep(cfg *options) step {
	return fnStep(stageEnvironment, "environment", func() ([]string, error) {
		envPath := filepath.Join(cfg.root, ".env")
		if _, err := os.Stat(envPath); err == nil {
			parseEnvFile(envPath)
		}
		if os.Getenv("DATABASE_URL") == "" {
			return nil, fmt.Errorf("DATABASE_URL missing — run ./joule.sh first")
		}
		return []string{okLine("DATABASE_URL → %s", maskURL(os.Getenv("DATABASE_URL")))}, nil
	})
}

// depsSteps installs node_modules when they are missing (--install forces it).
func depsSteps(cfg *options) []step {
	if !cfg.forceInstall && depsPresent(cfg) {
		return nil
	}
	pm := detectPM()
	return []step{
		fnStep(stageDependencies, "dependencies", func() ([]string, error) {
			return []string{infoLine("installing dependencies (%s install)", pm)}, nil
		}),
		execStep(stageDependencies, "install dependencies ("+pm+" install)",
			func() *exec.Cmd { return exec.Command(pm, "install") }),
	}
}

// requirePreflight mirrors the original's silent stage_preflight for aux commands.
func requirePreflight(cfg *options) {
	if _, err := preflightLines(cfg); err != nil {
		fmt.Println(errLine("%s", err.Error()))
		fmt.Println(colophon())
		os.Exit(1)
	}
}

func bin(cfg *options, rel string) string {
	return filepath.Join(cfg.root, "node_modules", ".bin", filepath.Base(rel))
}

// ── per-command queues ───────────────────────────────────────────────────────

func buildSteps(cfg *options) []step {
	requirePreflight(cfg)
	steps := depsSteps(cfg)
	steps = append(steps, envStep(cfg))
	steps = append(steps, execStep(stageDependencies, "production build (next build)",
		func() *exec.Cmd { return exec.Command(bin(cfg, "next"), "build") }))
	return steps
}

func startSteps(cfg *options) []step {
	requirePreflight(cfg)
	cfg.mode = "prod"
	steps := depsSteps(cfg)
	steps = append(steps, envStep(cfg))
	steps = append(steps, execStep(stageLaunch, "production build (next build)",
		func() *exec.Cmd { return exec.Command(bin(cfg, "next"), "build") }))
	return steps
}

func seedSteps(cfg *options) []step {
	requirePreflight(cfg)
	cfg.doSeed = "yes"
	steps := depsSteps(cfg)
	steps = append(steps, envStep(cfg))
	steps = append(steps, execStep(stageSeed, "seed syllabus + weightage + demo account",
		func() *exec.Cmd { return exec.Command(cfg.pm, "run", "db:seed") }))
	steps = append(steps, fnStep(stageSeed, "demo", func() ([]string, error) {
		return []string{infoLine("demo login → demo@jee.app / demo1234")}, nil
	}))
	return steps
}

func migrateSteps(cfg *options) []step {
	requirePreflight(cfg)
	steps := depsSteps(cfg)
	steps = append(steps, envStep(cfg))
	steps = append(steps, execStep(stageDatabase, "apply prisma migrations",
		func() *exec.Cmd { return exec.Command(bin(cfg, "prisma"), "migrate", "deploy") }))
	return steps
}

func studioSteps(cfg *options) []step {
	requirePreflight(cfg)
	steps := depsSteps(cfg)
	steps = append(steps, envStep(cfg))
	steps = append(steps, fnStep(stageDatabase, "studio", func() ([]string, error) {
		return []string{infoLine("prisma studio → http://localhost:5555")}, nil
	}))
	return steps
}

func dbScriptSteps(cfg *options, label, script string) []step {
	requirePreflight(cfg)
	pm := detectPM()
	steps := depsSteps(cfg)
	steps = append(steps, envStep(cfg))
	steps = append(steps, execStep(stageSeed, label,
		func() *exec.Cmd { return exec.Command(pm, "run", script) }))
	return steps
}

func printHelp() {
	fmt.Println(banner())
	fmt.Println()
	fmt.Println(" " + fg(bubblegum).Render("●") + " " + monoKicker.Render("00//") + " " + lipgloss.NewStyle().Bold(true).Render("USAGE") + dimStyle.Render(" — the dossier index"))
	fmt.Println()
	fmt.Println("  ./joule.sh [command] [flags]          default: dev")
	fmt.Println()
	rows := [][3]lipgloss.Color{
		{sky, "dev", "install → env → migrate → seed → next dev"},
		{tangerine, "build", "production build (next build)"},
		{lemon, "start", "serve the production build"},
		{lavender, "seed", "re-seed syllabus + demo data (idempotent)"},
		{mint, "migrate", "apply prisma migrations (deploy)"},
		{bubblegum, "studio", "open prisma studio on :5555"},
		{cherry, "backup", "JSON backup of every table → backups/"},
		{cherry, "restore", "restore newest backup (interactive)"},
		{neutral, "status", "preflight report without launching"},
		{neutral, "help", "this page"},
	}
	for _, r := range rows {
		fmt.Printf("  %s %-8s %s\n", fg(r[0]).Render("●"), r[1], r[2])
	}
	fmt.Println()
	fmt.Println("  " + dimStyle.Render("flags") + "   -p, --port N     port (default 3000)")
	fmt.Println("          --prod          build + start instead of dev")
	fmt.Println("          --open          open the browser once ready")
	fmt.Println("          --seed          force seeding even if data exists")
	fmt.Println("          --no-seed       skip seeding")
	fmt.Println("          --install       force dependency install")
	fmt.Println("          --offline       skip database stages (UI work only)")
	fmt.Println("          --no-color      plain paper, no beans")
	fmt.Println("          -y, --yes       non-interactive; accept defaults")
	fmt.Println(colophon())
}

// ── entry ────────────────────────────────────────────────────────────────────

func parseArgs() options {
	o := options{
		cmd:    "dev",
		port:   3000,
		mode:   "dev",
		doSeed: "auto",
		root:   os.Getenv("JOULE_ROOT"),
	}
	if o.root == "" {
		o.root, _ = os.Getwd()
	}
	args := os.Args[1:]
	for i := 0; i < len(args); i++ {
		a := args[i]
		switch a {
		case "dev", "build", "start", "seed", "migrate", "studio", "backup", "restore", "status", "help":
			o.cmd = a
		case "-p", "--port":
			if i+1 >= len(args) {
				fmt.Fprintln(os.Stderr, "joule: --port needs a value")
				os.Exit(2)
			}
			i++
			n, err := strconv.Atoi(args[i])
			if err != nil || n <= 0 {
				fmt.Fprintf(os.Stderr, "joule: invalid port %q\n", args[i])
				os.Exit(2)
			}
			o.port = n
		case "--prod":
			o.mode = "prod"
		case "--open":
			o.open = true
		case "--seed":
			o.doSeed = "yes"
		case "--no-seed":
			o.doSeed = "no"
		case "--install":
			o.forceInstall = true
		case "--offline":
			o.offline = true
		case "--no-color":
			o.noColor = true
		case "-y", "--yes":
			o.assumeYes = true
		case "-h", "--help":
			o.cmd = "help"
		default:
			fmt.Fprintf(os.Stderr, "unknown argument: %s\n\n", a)
			o.cmd = "help"
		}
	}
	return o
}

func main() {
	cfg := parseArgs()
	if cfg.noColor || os.Getenv("NO_COLOR") != "" {
		lipgloss.SetColorProfile(termenv.Ascii)
	}
	_ = os.Chdir(cfg.root)

	switch cfg.cmd {
	case "help":
		printHelp()
	case "status":
		runStatus(&cfg)
	case "dev":
		// the full pipeline; --prod swaps the launch (build + start)
		bannerPrint()
		steps := buildPipeline(&cfg)
		os.Exit(runPipeline(&cfg, steps))
	case "build":
		bannerPrint()
		os.Exit(runPipeline(&cfg, buildSteps(&cfg)))
	case "start":
		bannerPrint()
		os.Exit(runPipeline(&cfg, startSteps(&cfg)))
	case "seed":
		bannerPrint()
		os.Exit(runPipeline(&cfg, seedSteps(&cfg)))
	case "migrate":
		bannerPrint()
		os.Exit(runPipeline(&cfg, migrateSteps(&cfg)))
	case "studio":
		bannerPrint()
		os.Exit(runPipeline(&cfg, studioSteps(&cfg)))
	case "backup":
		bannerPrint()
		os.Exit(runPipeline(&cfg, dbScriptSteps(&cfg, "backup every table → backups/", "db:backup")))
	case "restore":
		bannerPrint()
		os.Exit(runPipeline(&cfg, dbScriptSteps(&cfg, "restore newest backup (interactive)", "db:restore")))
	}
}
