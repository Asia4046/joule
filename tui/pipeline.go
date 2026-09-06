package main

// ─────────────────────────────────────────────────────────────────────────────
//  THE PIPELINE — a Bubble Tea model that walks the step queue like the
//  original press room: the transcript (stage headers, OK/FAIL pills, the
//  login card) is printed permanently to scrollback via tea.Println, exec
//  tasks spin under a jar-cycling bean and only surface their tail on
//  failure, prompts happen inline, and the finished desk hands the terminal
//  to `next dev` / `next start` via ExecProcess.
// ─────────────────────────────────────────────────────────────────────────────

import (
	"bufio"
	"errors"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/charmbracelet/bubbles/textinput"
	tea "github.com/charmbracelet/bubbletea"
)

type startStepMsg struct{ model pipelineModel }
type taskDoneWithTailMsg struct {
	err   error
	tail  []string
	label string
}
type spinnerTickMsg struct{}
type launchDoneMsg struct{ code int }

type modelMode int

const (
	modeRunning modelMode = iota
	modePromptURL
	modeConfirm
	modeFailed
	modeDone
)

type pipelineModel struct {
	cfg     *options
	steps   []step
	idx     int
	ch      chan tea.Msg
	spinner int
	mode    modelMode
	input   textinput.Model
	width   int
	height  int
	exit    int
}

func newPipeline(cfg *options, steps []step) pipelineModel {
	ti := textinput.New()
	ti.CharLimit = 256
	ti.Width = 52
	return pipelineModel{
		cfg:   cfg,
		steps: steps,
		ch:    make(chan tea.Msg, 1024),
		input: ti,
	}
}

func (m pipelineModel) Init() tea.Cmd {
	// the banner is printed once by main() before the program starts;
	// printing it here too raced the first stage header into a double
	return func() tea.Msg { return startStepMsg{model: m} }
}

func spinnerTick() tea.Cmd {
	return tea.Tick(120*time.Millisecond, func(time.Time) tea.Msg { return spinnerTickMsg{} })
}

// seqPrints builds ONE flat sequence: every line printed in slice order,
// then any follow-up cmds. Flatness is load-bearing — a Cmd that returns a
// nested Sequence is queued without being awaited, so its prints race the
// next dispatch; only a single-level Sequence prints before it continues.
func seqPrints(lines []string, then ...tea.Cmd) tea.Cmd {
	cmds := make([]tea.Cmd, 0, len(lines)+len(then))
	for _, l := range lines {
		cmds = append(cmds, tea.Println(l))
	}
	return tea.Sequence(append(cmds, then...)...)
}

// waitFor keeps the model fed from the bridge channel while a task streams.
func waitFor(ch chan tea.Msg) tea.Cmd {
	return func() tea.Msg { return <-ch }
}

// beginStep prints the stage header when it changes and dispatches the step.
// All of a step's transcript output travels as one sequenced printLines so
// header, OK lines and any failure footer can never interleave, and the next
// step is dispatched only after those prints land.
func (m pipelineModel) beginStep() (pipelineModel, tea.Cmd) {
	for m.idx < len(m.steps) {
		st := m.steps[m.idx]
		if st.when == nil || st.when(m.cfg) {
			break
		}
		m = m.advance()
	}
	if m.idx >= len(m.steps) {
		return m.finish()
	}
	st := m.steps[m.idx]
	var lines []string
	if st.num != "" && (m.idx == 0 || m.steps[m.idx-1].num != st.num) {
		lines = append(lines, "", hdr(st.num, st.stage, st.bean))
	}
	switch st.kind {
	case stepFn:
		out, err := st.run()
		lines = append(lines, out...)
		if errors.Is(err, errNeedsDockerConfirm) {
			m.mode = modeConfirm
			return m, seqPrints(lines)
		}
		if err != nil {
			m.mode, m.exit = modeFailed, 1
			lines = append(lines, errLine("%s", err.Error()), colophon())
			return m, seqPrints(lines)
		}
		m2 := m.advance()
		return m, seqPrints(lines, func() tea.Msg { return startStepMsg{model: m2} })
	case stepExec:
		return m.runExec(st, seqPrints(lines))
	case stepPromptURL:
		m.mode = modePromptURL
		m.input.Placeholder = st.def
		m.input.SetValue("")
		return m, seqPrints(lines, textinput.Blink)
	case stepConfirm:
		m.mode = modeConfirm
		return m, seqPrints(lines)
	}
	return m, seqPrints(lines)
}

func (m pipelineModel) advance() pipelineModel {
	m.idx++
	return m
}

// runExec spins the task; output is captured, only a tail surfaces on failure.
func (m pipelineModel) runExec(st step, pre tea.Cmd) (pipelineModel, tea.Cmd) {
	ch := m.ch
	c := st.command()
	if c == nil {
		return m.fail(fmt.Errorf("no command for step %q", st.label))
	}
	c.Dir = m.cfg.root
	pr, pw := io.Pipe()
	c.Stdout = pw
	c.Stderr = pw
	if err := c.Start(); err != nil {
		return m.fail(fmt.Errorf("%s — %v", st.label, err))
	}
	tail := make([]string, 0, 12)
	go func() {
		sc := bufio.NewScanner(pr)
		sc.Buffer(make([]byte, 0, 64*1024), 1024*1024)
		for sc.Scan() {
			tail = append(tail, sc.Text())
			if len(tail) > 12 {
				tail = tail[len(tail)-12:]
			}
		}
		_ = pw.Close()
		ch <- taskDoneWithTailMsg{err: c.Wait(), tail: tail, label: st.label}
	}()
	var cmds []tea.Cmd
	if pre != nil {
		cmds = append(cmds, pre)
	}
	cmds = append(cmds, spinnerTick(), func() tea.Msg { return <-ch })
	return m, tea.Batch(cmds...)
}

func (m pipelineModel) fail(err error) (pipelineModel, tea.Cmd) {
	m.mode, m.exit = modeFailed, 1
	return m, seqPrints([]string{errLine("%s", err.Error()), colophon()})
}

// finish hands the terminal to the dev server, or settles for aux commands.
func (m pipelineModel) finish() (pipelineModel, tea.Cmd) {
	launches := m.cfg.cmd == "dev" || m.cfg.cmd == "start" || m.cfg.cmd == "studio"
	if !launches {
		m.mode = modeDone
		return m, seqPrints([]string{colophon(), "", dimStyle.Render("  press any key to log off")})
	}
	m.mode = modeRunning
	url := fmt.Sprintf("http://localhost:%d", m.cfg.port)
	var cmd *exec.Cmd
	var handoffLines []string
	if m.cfg.cmd == "studio" {
		cmd = exec.Command(filepath.Join(m.cfg.root, "node_modules", ".bin", "prisma"), "studio")
		handoffLines = []string{infoLine("prisma studio → http://localhost:5555")}
	} else {
		cmd = m.cfg.launcherCmd()
		handoffLines = []string{
			"  " + pill(" ↑ ", mint) + " serving on " + url + " — Ctrl-C to log off",
			loginCard(),
		}
		m.openBrowserSoon()
	}
	m.cfg.handoff = true
	return m, seqPrints(handoffLines, tea.ExecProcess(cmd, func(err error) tea.Msg {
		code := 0
		if err != nil {
			var ee *exec.ExitError
			if errors.As(err, &ee) {
				code = ee.ExitCode()
			} else {
				code = 1
			}
		}
		return launchDoneMsg{code}
	}))
}

func (m pipelineModel) openBrowserSoon() {
	if !m.cfg.open {
		return
	}
	url := fmt.Sprintf("http://localhost:%d", m.cfg.port)
	opener := ""
	for _, c := range []string{"xdg-open", "open"} {
		if _, err := exec.LookPath(c); err == nil {
			opener = c
			break
		}
	}
	if opener == "" {
		return
	}
	script := fmt.Sprintf(`for i in $(seq 1 120); do
  if command -v curl >/dev/null 2>&1; then curl -sf -o /dev/null %q || { sleep 0.5; continue; }; else sleep 3; fi
  exec %s %q
done`, url, opener, url)
	cmd := exec.Command("sh", "-c", script)
	cmd.Dir = m.cfg.root
	_ = cmd.Start() // detached: exits right after opening
}

func (m pipelineModel) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch t := msg.(type) {
	case startStepMsg:
		return t.model.beginStep()

	case tea.WindowSizeMsg:
		m.width, m.height = t.Width, t.Height
		return m, nil

	case spinnerTickMsg:
		if m.mode == modeRunning && m.idx < len(m.steps) && m.steps[m.idx].kind == stepExec {
			m.spinner = (m.spinner + 1) % len(jar)
			return m, spinnerTick()
		}
		return m, nil

	case taskDoneWithTailMsg:
		if t.err != nil {
			m.mode, m.exit = modeFailed, 1
			lines := []string{errLine("%s", t.label)}
			for _, l := range t.tail {
				lines = append(lines, "      "+l)
			}
			lines = append(lines, colophon())
			return m, seqPrints(lines)
		}
		m2 := m.advance()
		return m, seqPrints([]string{okLine("%s", t.label)},
			func() tea.Msg { return startStepMsg{model: m2} })

	case launchDoneMsg:
		m.exit = t.code
		m.mode = modeDone
		return m, seqPrints([]string{
			warnLine("focus session ended — the desk lamp clicks off"),
			colophon(),
			"",
			dimStyle.Render("  press any key to log off"),
		})

	case tea.KeyMsg:
		switch m.mode {
		case modePromptURL:
			switch t.String() {
			case "enter":
				v := strings.TrimSpace(m.input.Value())
				if v == "" {
					v = m.input.Placeholder
				}
				if !validPostgresURL(v) {
					return m, tea.Println(errLine("that does not look like a PostgreSQL URL — try again"))
				}
				m.cfg.envDraftURL = v
				return m.nextStep()
			case "ctrl+c":
				m.exit = 130
				return m, tea.Quit
			}
			var cmd tea.Cmd
			m.input, cmd = m.input.Update(msg)
			return m, cmd
		case modeConfirm:
			switch strings.ToLower(t.String()) {
			case "y":
				m.cfg.dockerAnswer = true
			case "n", "enter":
				m.cfg.dockerAnswer = false
			case "ctrl+c":
				m.exit = 130
				return m, tea.Quit
			default:
				return m, nil
			}
			return m.nextStep()
		case modeFailed, modeDone:
			return m, tea.Quit
		}
		if t.String() == "ctrl+c" {
			m.exit = 130
			return m, tea.Quit
		}
		return m, nil
	}
	return m, nil
}

func (m pipelineModel) nextStep() (pipelineModel, tea.Cmd) {
	m.mode = modeRunning
	m2 := m.advance()
	return m, func() tea.Msg { return startStepMsg{model: m2} }
}

func (m pipelineModel) View() string {
	// the frame is just the active instrument; the record lives in scrollback
	if m.mode == modePromptURL {
		return "  " + fg(tangerine).Render("●") + " PostgreSQL URL [" + m.input.Placeholder + "]: " + m.input.View() +
			"\n" + dimStyle.Render("  enter accepts the bracketed default · ctrl-c to log off")
	}
	if m.mode == modeConfirm {
		return "  " + fg(lemon).Render("●") + " start one with Docker? [y/N]" +
			"\n" + dimStyle.Render("  y / n · ctrl-c to log off")
	}
	if m.mode == modeFailed || m.mode == modeDone {
		return dimStyle.Render("  press any key to log off")
	}
	if m.idx < len(m.steps) && m.steps[m.idx].kind == stepExec {
		dot := fg(jar[m.spinner%len(jar)]).Render("●")
		return "  " + dot + " " + m.steps[m.idx].label + " …"
	}
	return ""
}

// runPipeline drives the queue — Bubble Tea on a TTY, plain paper otherwise.
func runPipeline(cfg *options, steps []step) int {
	if !isTTY(os.Stdout) {
		return runPlain(cfg, steps)
	}
	p := tea.NewProgram(newPipeline(cfg, steps))
	final, err := p.Run()
	if err != nil {
		// a Ctrl-C during the server handoff signals both processes; the
		// farewell the original trap printed lives here
		if cfg.handoff {
			fmt.Println(warnLine("focus session ended — the desk lamp clicks off"))
			fmt.Println(colophon())
			return 0
		}
		fmt.Fprintln(os.Stderr, "joule:", err)
		return 1
	}
	if pm, ok := final.(pipelineModel); ok {
		return pm.exit
	}
	return 0
}

// runPlain — the non-TTY fallback: same queue, plain paper.
func runPlain(cfg *options, steps []step) int {
	for i, st := range steps {
		if st.num != "" && (i == 0 || steps[i-1].num != st.num) {
			fmt.Println()
			fmt.Println(hdr(st.num, st.stage, st.bean))
		}
		switch st.kind {
		case stepFn:
			lines, err := st.run()
			for _, l := range lines {
				fmt.Println(l)
			}
			if err != nil {
				fmt.Println(errLine("%s", err.Error()))
				fmt.Println(colophon())
				return 1
			}
		case stepExec:
			c := st.command()
			if c == nil {
				continue
			}
			c.Dir = cfg.root
			c.Stdout = os.Stdout
			c.Stderr = os.Stderr
			fmt.Printf("  ● %s …\n", st.label)
			if err := c.Run(); err != nil {
				fmt.Println(errLine("%s", st.label))
				fmt.Println(colophon())
				return 1
			}
			fmt.Println(okLine("%s", st.label))
		case stepPromptURL:
			if !stdinIsTTY() || cfg.assumeYes {
				cfg.envDraftURL = st.def
				continue
			}
			fmt.Printf("  ● PostgreSQL URL [%s]: ", st.def)
			var reply string
			fmt.Scanln(&reply)
			if strings.TrimSpace(reply) != "" {
				cfg.envDraftURL = strings.TrimSpace(reply)
			}
		case stepConfirm:
			if !stdinIsTTY() || cfg.assumeYes {
				cfg.dockerAnswer = cfg.assumeYes
				continue
			}
			fmt.Printf("  ● %s [y/N]: ", st.label)
			var reply string
			fmt.Scanln(&reply)
			cfg.dockerAnswer = strings.EqualFold(strings.TrimSpace(reply), "y")
		}
	}
	if cfg.cmd == "dev" || cfg.cmd == "start" {
		url := fmt.Sprintf("http://localhost:%d", cfg.port)
		fmt.Printf("  %s serving on %s — Ctrl-C to log off\n", pill(" ↑ ", mint), url)
		fmt.Println(loginCard())
		c := cfg.launcherCmd()
		if err := c.Run(); err != nil {
			if ee, ok := err.(*exec.ExitError); ok {
				fmt.Println(warnLine("focus session ended — the desk lamp clicks off"))
				fmt.Println(colophon())
				return ee.ExitCode()
			}
			return 1
		}
	}
	fmt.Println(colophon())
	return 0
}
