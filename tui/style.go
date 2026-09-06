package main

// ─────────────────────────────────────────────────────────────────────────────
//  THE PRINT SHOP — Jellybean Dossier palette & fixed compositions, lifted
//  verbatim from lib/jellybeans.ts and the original joule.sh press room.
// ─────────────────────────────────────────────────────────────────────────────

import (
	"fmt"
	"strings"

	"github.com/charmbracelet/lipgloss"
)

// the jar
const (
	inkC   = "#221F1A"
	boneC  = "#DED5C6"
	paperC = "#0A0908"
	cardC  = "#151310"
	hairC  = "#6B675E"
	neutC  = "#8A857B"
)

var jar = []lipgloss.Color{
	"#F2A9CB", // bubblegum
	"#8FD8B0", // mint
	"#F6D468", // lemon
	"#93C7F2", // sky
	"#BCA5EE", // lavender
	"#FFB488", // tangerine
	"#F08D8D", // cherry
	"#D8E96E", // lime
}

var (
	bubblegum = jar[0]
	mint      = jar[1]
	lemon     = jar[2]
	sky       = jar[3]
	lavender  = jar[4]
	tangerine = jar[5]
	cherry    = jar[6]
	neutral   = lipgloss.Color(neutC)
	bone      = lipgloss.Color(boneC)
)

// fixed styles — mono eyebrows, pills, the paper strip
var (
	dimStyle   = lipgloss.NewStyle().Faint(true)
	paperStyle = lipgloss.NewStyle().Background(lipgloss.Color(paperC))
	monoKicker = lipgloss.NewStyle().Bold(true).Faint(true)
)

func fg(c lipgloss.Color) lipgloss.Style { return lipgloss.NewStyle().Foreground(c) }

// pill renders a bean-colored label chip — the only rounded objects in the system.
func pill(label string, c lipgloss.Color) string {
	return lipgloss.NewStyle().Background(c).Foreground(lipgloss.Color(inkC)).Bold(true).Render(label)
}

func okLine(format string, a ...any) string {
	return "  " + pill(" OK ", mint) + " " + fmt.Sprintf(format, a...)
}
func warnLine(format string, a ...any) string {
	return "  " + pill(" !! ", lemon) + " " + fmt.Sprintf(format, a...)
}
func errLine(format string, a ...any) string {
	return "  " + pill("FAIL", cherry) + " " + fmt.Sprintf(format, a...)
}
func infoLine(format string, a ...any) string {
	return "  " + pill("INFO", sky) + " " + fmt.Sprintf(format, a...)
}
func skipLine(format string, a ...any) string {
	return "  " + pill("SKIP", neutral) + " " + fmt.Sprintf(format, a...)
}

// hdr renders "  ● 01 // PREFLIGHT" + a hairline rule, as one block.
func hdr(num, title string, bean lipgloss.Color) string {
	head := "  " + fg(bean).Render("●") + " " + monoKicker.Render(num+"//") + " " +
		lipgloss.NewStyle().Bold(true).Render(title)
	return head + "\n" + dimStyle.Render(" "+strings.Repeat("─", 74))
}

// jarRow — signature element #1: eight bean dots.
func jarRow() string {
	parts := make([]string, len(jar))
	for i, b := range jar {
		parts[i] = fg(b).Render("●")
	}
	return strings.Join(parts, " ")
}

// banner — the paper strip: JOULE wordmark (bubblegum J, bone ink), jar row,
// tagline, spec line. Every segment carries its own paper background so the
// strip survives inline resets, exactly like the original's selective resets.
func banner() string {
	j := []string{"     ██╗", "     ██║", "     ██║", "██   ██║", "╚█████╔╝", " ╚════╝ "}
	o := []string{" ██████╗ ", "██╔═══██╗", "██║   ██║", "██║   ██║", "╚██████╔╝", " ╚═════╝ "}
	u := []string{"██╗   ██╗", "██║   ██╗", "██║   ██╗", "██║   ██╗", "╚██╗ ██╔╝", " ╚████╔╝ "}
	l := []string{"██╗     ", "██║     ", "██║     ", "██║     ", "███████╗", "╚══════╝"}
	e := []string{"███████╗", "██╔════╝", "█████╗  ", "██╔══╝  ", "███████╗", "╚══════╝"}

	onPaper := func(s string) string { return paperStyle.Render(s) }
	sp := onPaper(strings.Repeat(" ", 66))
	lines := []string{sp}
	for i := 0; i < 6; i++ {
		seg := onPaper(fg(bubblegum).Background(lipgloss.Color(paperC)).Render(j[i])) + onPaper(" ") +
			onPaper(fg(bone).Background(lipgloss.Color(paperC)).Render(o[i]+" "+u[i]+" "+l[i]+" "+e[i]))
		lines = append(lines, center(onPaper, seg, 66))
	}
	jarSeg := onPaper(func() string {
		parts := make([]string, len(jar))
		for i, b := range jar {
			parts[i] = fg(b).Background(lipgloss.Color(paperC)).Render("●")
		}
		return strings.Join(parts, onPaper(" "))
	}())
	lines = append(lines, center(onPaper, jarSeg, 66), sp)
	tag := "JEE PREPARATION PLATFORM · SELF-HOSTED COMMAND CENTER"
	lines = append(lines, center(onPaper, onPaper(dimStyle.Render(tag)), 66))
	colo := "PAPER #0A0908 · INK #DED5C6 · BEANS ×8 · RADIUS 2 · GRAIN 5%"
	lines = append(lines, center(onPaper, onPaper(dimStyle.Render(colo)), 66), sp)
	return strings.Join(lines, "\n")
}

// center pads a pre-colored segment inside a fixed-width strip.
func center(onPaper func(string) string, seg string, w int) string {
	plain := stripANSI(seg)
	pad := w - len([]rune(plain))
	if pad < 0 {
		pad = 0
	}
	left := pad / 2
	return onPaper(strings.Repeat(" ", left)) + seg + onPaper(strings.Repeat(" ", pad-left))
}

// stripANSI removes SGR sequences for width math.
func stripANSI(s string) string {
	var b strings.Builder
	in := false
	for _, r := range s {
		if r == '\x1b' {
			in = true
			continue
		}
		if in {
			if r == 'm' {
				in = false
			}
			continue
		}
		b.WriteRune(r)
	}
	return b.String()
}

// loginCard — the seeded demo credentials plate.
func loginCard() string {
	h := fg(lipgloss.Color(hairC))
	v := fg(sky)
	d := dimStyle
	rule := strings.Repeat("─", 44)
	lines := []string{
		h.Render("┌" + rule + "┐"),
		h.Render("│") + d.Render(" DEMO ACCOUNT") + strings.Repeat(" ", 31) + h.Render("│"),
		h.Render("│") + "  email    " + v.Render("demo@jee.app") + strings.Repeat(" ", 21) + h.Render("│"),
		h.Render("│") + "  password " + v.Render("demo1234") + strings.Repeat(" ", 25) + h.Render("│"),
		h.Render("└" + rule + "┘"),
	}
	return strings.Join(lines, "\n")
}

func colophon() string {
	return "\n" + jarRow() + dimStyle.Render(" · PAPER #0A0908 · INK #DED5C6 · BEANS ×8 · RADIUS 2 · GRAIN 5%")
}
