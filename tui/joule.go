package main

// ─────────────────────────────────────────────────────────────────────────────
//  THE DESK — configuration, environment, probes and the step queue that both
//  the Bubble Tea pipeline and the plain fallback walk.
// ─────────────────────────────────────────────────────────────────────────────

import (
	"fmt"
	"math/rand"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/charmbracelet/lipgloss"
)

const (
	nodeMinMajor = 20
	nodeMinMinor = 9
)

// lipglossColor keeps the step/bean signatures short.
type lipglossColor = lipgloss.Color

func isTTY(f *os.File) bool {
	fi, err := f.Stat()
	if err != nil {
		return false
	}
	return fi.Mode()&os.ModeCharDevice != 0
}

func sleepBriefly() { time.Sleep(time.Second) }

type options struct {
	cmd          string // dev | build | start | seed | migrate | studio | backup | restore | status | help
	port         int
	mode         string // dev | prod (launch mode)
	doSeed       string // auto | yes | no
	forceInstall bool
	open         bool
	offline      bool
	assumeYes    bool
	noColor      bool
	root         string
	pm           string // yarn | npm
	// interactive state filled mid-pipeline
	envDraftURL  string
	dockerAnswer bool
	dbUp         bool // the 04 probe found a live database
	handoff      bool // a server/exec handoff happened (for Ctrl-C farewell)
}

type stepKind int

const (
	stepFn stepKind = iota
	stepExec
	stepPromptURL
	stepConfirm
)

type step struct {
	kind       stepKind
	stage, num string
	bean       lipglossColor
	label      string
	// exec
	command func() *exec.Cmd
	// fn — returns transcript lines; error fails the pipeline
	run func() ([]string, error)
	// promptURL
	def string
	// confirm — appends follow-up steps when answered yes
	onYes func() []step
	// when — skip the step entirely when it returns false
	when func(*options) bool
}

var envRe = regexp.MustCompile(`^[A-Za-z_][A-Za-z0-9_]*$`)
var maskRe = regexp.MustCompile(`^postgresql(\+[a-z]+)?://[^@]+@([^/?]+)(/[^?]*)?.*`)
var hostRe = regexp.MustCompile(`^postgresql(\+[a-z]+)?://[^@]+@([^/:?]+).*`)

// maskURL keeps credentials out of the transcript.
func maskURL(dburl string) string {
	if m := maskRe.FindStringSubmatch(dburl); m != nil {
		return m[2] + m[3]
	}
	return "(unparsed)"
}

// parseEnvFile loads KEY=VALUE pairs, exporting them like the original.
func parseEnvFile(path string) (map[string]string, error) {
	b, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	out := map[string]string{}
	for _, line := range strings.Split(string(b), "\n") {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		k, v, _ := strings.Cut(line, "=")
		if !envRe.MatchString(k) {
			continue
		}
		v = strings.TrimSuffix(strings.TrimPrefix(strings.TrimSuffix(strings.TrimPrefix(v, `"`), `"`), `'`), `'`)
		out[k] = v
		os.Setenv(k, v)
	}
	return out, nil
}

func mintSecret() string {
	if b, err := exec.Command("openssl", "rand", "-base64", "32").Output(); err == nil && len(b) > 0 {
		return strings.TrimSpace(string(b))
	}
	b := make([]byte, 32)
	rand.Read(b)
	return b64Encode(b)
}

func b64Encode(b []byte) string {
	const enc = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
	var sb strings.Builder
	for i := 0; i < len(b); i += 3 {
		var v uint32
		n := len(b) - i
		v = uint32(b[i]) << 16
		if n > 1 {
			v |= uint32(b[i+1]) << 8
		}
		if n > 2 {
			v |= uint32(b[i+2])
		}
		for j := 0; j < 4; j++ {
			if j*6 < n*8 {
				sb.WriteByte(enc[(v>>(18-6*j))&0x3F])
			} else {
				sb.WriteByte('=')
			}
		}
	}
	return sb.String()
}

func nodeVersionOK() (string, bool) {
	v, err := exec.Command("node", "-p", "process.versions.node").Output()
	if err != nil {
		return "", false
	}
	ver := strings.TrimSpace(string(v))
	parts := strings.Split(ver, ".")
	if len(parts) < 2 {
		return ver, false
	}
	major, _ := strconv.Atoi(parts[0])
	minor, _ := strconv.Atoi(parts[1])
	return ver, major > nodeMinMajor || (major == nodeMinMajor && minor >= nodeMinMinor)
}

// dbProbe reuses the exact @prisma/client probe from the original script,
// with one retry — pooled/serverless databases (Neon cold starts, PgBouncer
// handoffs) fail transiently, and a single flaky probe once contradicted an
// OK from the step before it.
func dbProbe() string {
	probe := dbProbeOnce()
	if dbReachable(probe) {
		return probe
	}
	sleepBriefly()
	return dbProbeOnce()
}

func dbProbeOnce() string {
	out, _ := exec.Command("node", "-e", `
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  try {
    const chapters = await p.chapter.count();
    const users = await p.user.count();
    console.log(`+"`OK chapters=${chapters} users=${users}`"+`);
  } catch (e) {
    const m = String((e && e.message) || e);
    if (/P2021|does not exist/i.test(m)) console.log("EMPTY schema-not-migrated");
    else console.log("CONN " + m.split("\n")[0].slice(0, 140));
  } finally { await p.$disconnect().catch(() => {}); }
})();
`).Output()
	return strings.TrimSpace(string(out))
}

func dbReachable(probe string) bool {
	return strings.HasPrefix(probe, "OK") || strings.HasPrefix(probe, "EMPTY")
}

func dbHost(dburl string) string {
	if m := hostRe.FindStringSubmatch(dburl); m != nil {
		return m[2]
	}
	return ""
}

func localHost(host string) bool {
	h := strings.Trim(host, "[]")
	return h == "localhost" || h == "127.0.0.1" || h == "::1"
}

func (o *options) launcherCmd() *exec.Cmd {
	bin := filepath.Join(o.root, "node_modules", ".bin", "next")
	args := []string{"dev"}
	if o.mode == "prod" {
		args = []string{"start"}
	}
	args = append(args, "-p", strconv.Itoa(o.port))
	return exec.Command(bin, args...)
}

// ── the queue ────────────────────────────────────────────────────────────────

type stageDef struct {
	num, title string
	bean       lipglossColor
}

var (
	stagePreflight    = stageDef{"01", "PREFLIGHT", bubblegum}
	stageDependencies = stageDef{"02", "DEPENDENCIES", sky}
	stageEnvironment  = stageDef{"03", "ENVIRONMENT", tangerine}
	stageDatabase     = stageDef{"04", "DATABASE", lemon}
	stageSeed         = stageDef{"05", "SEED", lavender}
	stageLaunch       = stageDef{"06", "LAUNCH", mint}
)

// buildPipeline assembles the full queue for `dev`/`start` (the "one command
// stands the app up" flow). Interactive steps are inline, like the original.
func buildPipeline(o *options) []step {
	var q []step
	add := func(st stageDef, s step) {
		s.stage, s.num, s.bean = st.title, st.num, st.bean
		q = append(q, s)
	}

	env := map[string]string{}
	haveEnv := envFileExists(o)
	if haveEnv {
		if b, err := os.ReadFile(filepath.Join(o.root, ".env")); err == nil {
			_ = parseEnvLoaded(b, env)
		}
	}

	// 01 — preflight
	add(stagePreflight, step{kind: stepFn, label: "preflight", run: func() ([]string, error) {
		return preflightLines(o)
	}})

	// 02 — dependencies
	add(stageDependencies, step{kind: stepFn, label: "check dependencies", run: func() ([]string, error) {
		return depsCheckLines(o)
	}})
	if o.forceInstall || !depsPresent(o) {
		pm := detectPM()
		add(stageDependencies, step{kind: stepExec, label: "install dependencies (" + pm + " install)",
			command: func() *exec.Cmd { return exec.Command(pm, "install") }})
	}
	add(stageDependencies, step{kind: stepFn, label: "prisma client", run: func() ([]string, error) {
		return prismaClientLines(o)
	}})

	// 03 — environment
	if !haveEnv {
		add(stageEnvironment, step{kind: stepFn, label: "env", run: func() ([]string, error) {
			return []string{warnLine("no .env found — minting one")}, nil
		}})
		defaultURL := "postgresql://joule:joule@localhost:5432/joule?schema=public"
		interactive := !o.assumeYes && stdinIsTTY()
		if interactive {
			add(stageEnvironment, step{kind: stepPromptURL, label: "PostgreSQL URL", def: defaultURL})
		}
		add(stageEnvironment, step{kind: stepFn, label: "write .env", run: func() ([]string, error) {
			dburl := defaultURL
			if v := o.envDraftURL; v != "" {
				dburl = v
			}
			secret := mintSecret()
			body := fmt.Sprintf("# Joule — local environment (written by joule.sh)\n# PostgreSQL connection string\nDATABASE_URL=%q\n\n# Secret used to sign JWT session cookies (min 32 chars)\nAUTH_SECRET=%q\n", dburl, secret)
			if err := os.WriteFile(filepath.Join(o.root, ".env"), []byte(body), 0o644); err != nil {
				return nil, err
			}
			os.Setenv("DATABASE_URL", dburl)
			os.Setenv("AUTH_SECRET", secret)
			return []string{okLine(".env written (AUTH_SECRET minted, 32+ chars)")}, nil
		}})
	} else {
		add(stageEnvironment, step{kind: stepFn, label: "env", run: func() ([]string, error) {
			env, _ = parseEnvFile(filepath.Join(o.root, ".env"))
			lines := []string{okLine(".env found")}
			if v := env["AUTH_SECRET"]; len(strings.TrimSpace(v)) < 2 {
				secret := mintSecret()
				f, err := os.OpenFile(filepath.Join(o.root, ".env"), os.O_APPEND|os.O_WRONLY, 0o644)
				if err == nil {
					fmt.Fprintf(f, "\n# AUTH_SECRET appended by joule.sh\nAUTH_SECRET=%q\n", secret)
					f.Close()
				}
				os.Setenv("AUTH_SECRET", secret)
				lines = append(lines, warnLine("AUTH_SECRET was missing — appended a fresh one"))
			}
			dburl := env["DATABASE_URL"]
			if dburl == "" {
				return nil, fmt.Errorf("DATABASE_URL is not set — put a PostgreSQL URL in .env")
			}
			lines = append(lines, okLine("DATABASE_URL → %s", maskURL(dburl)))
			return lines, nil
		}})
	}

	// 04 — database (skipped offline)
	if o.offline {
		add(stageDatabase, step{kind: stepFn, label: "database", run: func() ([]string, error) {
			return []string{warnLine("offline mode — skipping migrate/seed")}, nil
		}})
	} else {
		add(stageDatabase, step{kind: stepFn, label: "database", run: func() ([]string, error) {
			probe := dbProbe()
			o.dbUp = dbReachable(probe)
			if o.dbUp {
				return []string{okLine("postgres reachable — %s", strings.TrimPrefix(probe, "OK "))}, nil
			}
			lines := []string{warnLine("postgres unreachable at %s", maskURL(os.Getenv("DATABASE_URL")))}
			host := dbHost(os.Getenv("DATABASE_URL"))
			if !localHost(host) || !commandExists("docker") {
				return lines, fmt.Errorf("start postgres (or point .env at a live database) and re-run")
			}
			return lines, errNeedsDockerConfirm
		}})
		// the docker fallback only runs when the probe found nothing;
		// migrations below run against whichever database came up
		add(stageDatabase, step{kind: stepFn, label: "docker postgres", when: func(o *options) bool { return !o.dbUp },
			run: func() ([]string, error) {
				return dockerLines(o)
			}})
		add(stageDatabase, step{kind: stepExec, label: "apply prisma migrations",
			command: func() *exec.Cmd {
				return exec.Command(filepath.Join(o.root, "node_modules", ".bin", "prisma"), "migrate", "deploy")
			}})
	}

	// 05 — seed
	switch o.doSeed {
	case "no":
		add(stageSeed, step{kind: stepFn, label: "seed", run: func() ([]string, error) {
			return []string{skipLine("seeding disabled (--no-seed)")}, nil
		}})
	case "yes":
		add(stageSeed, step{kind: stepExec, label: "seed syllabus + weightage + demo account",
			command: func() *exec.Cmd { return exec.Command(o.pm, "run", "db:seed") }})
		add(stageSeed, step{kind: stepFn, label: "demo", run: func() ([]string, error) {
			return []string{infoLine("demo login → demo@jee.app / demo1234")}, nil
		}})
	default:
		add(stageSeed, step{kind: stepFn, label: "seed check", run: func() ([]string, error) {
			probe := dbProbe()
			if strings.HasPrefix(probe, "OK") {
				return []string{skipLine("already seeded (%s)", strings.TrimPrefix(probe, "OK "))}, nil
			}
			return []string{warnLine("cannot probe data (%s) — seeding anyway", probe)}, nil
		}})
		add(stageSeed, step{kind: stepExec, label: "seed syllabus + weightage + demo account",
			command: func() *exec.Cmd { return exec.Command(o.pm, "run", "db:seed") }})
		add(stageSeed, step{kind: stepFn, label: "demo", run: func() ([]string, error) {
			return []string{infoLine("demo login → demo@jee.app / demo1234")}, nil
		}})
	}

	// 06 — launch marker (the ExecProcess handoff happens after the queue drains)
	add(stageLaunch, step{kind: stepFn, label: "launch", run: func() ([]string, error) {
		if o.mode == "prod" {
			return []string{okLine("production build ready — handing over the desk")}, nil
		}
		return []string{okLine("handing over the desk")}, nil
	}})
	if o.mode == "prod" {
		add(stageLaunch, step{kind: stepExec, label: "production build (next build)",
			command: func() *exec.Cmd {
				return exec.Command(filepath.Join(o.root, "node_modules", ".bin", "next"), "build")
			}})
	}

	return q
}

var errNeedsDockerConfirm = fmt.Errorf("needs docker confirm")

func envFileExists(o *options) bool {
	_, err := os.Stat(filepath.Join(o.root, ".env"))
	return err == nil
}

func parseEnvLoaded(b []byte, into map[string]string) error {
	for _, line := range strings.Split(string(b), "\n") {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		k, v, _ := strings.Cut(line, "=")
		if !envRe.MatchString(k) {
			continue
		}
		v = strings.TrimSuffix(strings.TrimPrefix(strings.TrimSuffix(strings.TrimPrefix(v, `"`), `"`), `'`), `'`)
		into[k] = v
	}
	return nil
}

func commandExists(name string) bool {
	_, err := exec.LookPath(name)
	return err == nil
}

func detectPM() string {
	if commandExists("yarn") {
		return "yarn"
	}
	if commandExists("npm") {
		return "npm"
	}
	return ""
}

func depsPresent(o *options) bool {
	for _, b := range []string{"next", "prisma", "tsx"} {
		if _, err := os.Stat(filepath.Join(o.root, "node_modules", ".bin", b)); err != nil {
			return false
		}
	}
	return true
}

func stdinIsTTY() bool { return isTTY(os.Stdin) }

func preflightLines(o *options) ([]string, error) {
	ver, okv := nodeVersionOK()
	if ver == "" {
		return nil, fmt.Errorf("node is not on PATH — install Node ≥ %d.%d first", nodeMinMajor, nodeMinMinor)
	}
	if !okv {
		return nil, fmt.Errorf("node %s found — Next.js 16 needs ≥ %d.%d", ver, nodeMinMajor, nodeMinMinor)
	}
	lines := []string{okLine("node v%s", ver)}
	pm := detectPM()
	if pm == "" {
		return nil, fmt.Errorf("neither yarn nor npm found on PATH")
	}
	o.pm = pm
	pmv, _ := exec.Command(pm, "--version").Output()
	lines = append(lines, okLine("package manager: %s %s", pm, strings.TrimSpace(strings.Split(string(pmv), "\n")[0])))
	if commandExists("openssl") {
		lines = append(lines, okLine("openssl present (AUTH_SECRET minting)"))
	} else {
		lines = append(lines, warnLine("openssl missing — secrets fall back to /dev/urandom"))
	}
	return lines, nil
}

func depsCheckLines(o *options) ([]string, error) {
	if o.forceInstall || !depsPresent(o) {
		return []string{infoLine("dependencies missing — installing")}, nil
	}
	n := 0
	if entries, err := os.ReadDir(filepath.Join(o.root, "node_modules")); err == nil {
		n = len(entries)
	}
	return []string{okLine("dependencies present (%d packages)", n)}, nil
}

func prismaClientLines(o *options) ([]string, error) {
	if _, err := os.Stat(filepath.Join(o.root, "node_modules", ".prisma", "client")); err == nil {
		return []string{okLine("prisma client generated")}, nil
	}
	return []string{infoLine("generating prisma client")}, nil
}

// dockerLines spawns the disposable postgres and waits for readiness.
func dockerLines(o *options) ([]string, error) {
	if !o.dockerAnswer {
		return nil, fmt.Errorf("start postgres (or point .env at a live database) and re-run")
	}
	run := exec.Command("docker", "run", "-d", "--name", "joule-db",
		"-e", "POSTGRES_USER=joule", "-e", "POSTGRES_PASSWORD=joule",
		"-e", "POSTGRES_DB=joule", "-p", "5432:5432",
		"-v", "joule-pgdata:/var/lib/postgresql/data", "postgres:16-alpine")
	if out, err := run.CombinedOutput(); err != nil {
		return nil, fmt.Errorf("docker failed to start postgres: %s", strings.TrimSpace(string(out)))
	}
	for i := 0; i < 30; i++ {
		out, _ := exec.Command("docker", "exec", "joule-db", "pg_isready", "-U", "joule", "-d", "joule").Output()
		if strings.Contains(string(out), "accepting connections") {
			return []string{okLine("joule-db accepting connections on :5432")}, nil
		}
		sleepBriefly()
	}
	return nil, fmt.Errorf("postgres container never became ready")
}

// DB URL validation for the prompt step.
func validPostgresURL(s string) bool {
	u, err := url.Parse(s)
	return err == nil && strings.HasPrefix(s, "postgresql") && u.Host != ""
}
