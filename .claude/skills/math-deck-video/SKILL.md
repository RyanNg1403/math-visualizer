---
name: math-deck-video
description: Build a Manim-quality visual explainer for a math or technical concept in two phases - first an interactive HTML slide deck (SVG + KaTeX, choreographed animation beats, dark 3Blue1Brown aesthetic), then a Motion Canvas port rendered as a 1080p60 MP4 with an ambient music bed. Use this whenever the user wants to visualize, animate, teach, or explain a mathematical, scientific, or algorithmic concept - "make a demo of X", "explain X visually", "create an animation/video about X", "3Blue1Brown-style anything" - even if they only mention one of the two output formats.
---

# Math deck → video

This is a complete playbook — it assumes no prior context and bundles working reference implementations, so any coding agent can follow it. Read the referenced files at the point each phase begins; they contain the accumulated taste and the exact bugs already paid for once.

**Map of the playbook:**

| File | Read when |
|---|---|
| `references/design-taste.md` | Phase 0 — the judgment calls: pedagogy, motion, look, caption voice |
| `references/deck-patterns.md` | Phase 1 — deck architecture, pitfalls, verification procedure |
| `references/motion-canvas-port.md` | Phase 2 — scaffold, port recipe, the five gotchas, render procedure |
| `references/video-pipeline.md` | Phase 2 — music, mux, final QA commands |
| `references/checklist.md` | Continuously — phase gates; don't advance with unchecked items |
| `assets/example-deck.html` | Phase 1 — complete verified 10-scene deck; copy its engine |
| `assets/motion-canvas-lib.ts`, `assets/example-scene.tsx`, `assets/scaffold/` | Phase 2 — drop-in library, model scene, project skeleton |
| `scripts/gen_music.py`, `scripts/verify_video.sh` | Phase 2 — run, don't rewrite |

Produce **two artifacts, in this order**: an interactive HTML slide deck, then a rendered MP4 video ported from it. The deck always comes first even when the user only asked for a video - it is the storyboard. Every design decision (scene list, beat choreography, pacing, palette, what gets animated when) is made and verified cheaply in the deck, where iteration is a browser refresh; the video phase is then a mechanical port of decisions already validated. Skipping the deck means discovering design problems during a render pipeline instead of in a refresh loop.

If the user explicitly says they only want the deck (or only want to iterate on an existing deck), stop after Phase 1 and offer the video as a follow-up.

## Phase 0 - Design the lesson (10 minutes of thinking, saves hours)

Read `references/design-taste.md` first - it holds the judgment calls that make the result feel designed rather than generated. Then decide:

- **Audience floor.** What can the viewer be assumed to know? Default: comfortable with functions and graphs, nothing beyond. Every scene must be watchable from that floor.
- **Narrative arc.** 8-12 scenes following: *concrete hook → build intuition visually → formalize (the equation arrives last, after the viewer has already watched everything it says) → 1-2 real-life applications chosen for the audience → recap that unifies*. The strongest scenes animate **one idea each**.
- **The money shot.** Identify the single animation that carries the concept (for derivatives it was secant→tangent as h→0). Give it the most screen time and the slowest easing.
- **Interactive moments.** Pick 2-3 slides that gain the most from a slider or draggable point - typically the money shot and the applications. Interactivity is what the HTML medium adds over video; in the video phase these become scripted "ghost interactions".
- **Captions carry narration.** One short italic line per beat, subtitle-style. The visuals do the explaining; if a caption needs two sentences, the animation is not doing its job.

Ask the user only what genuinely changes the design (audience, applications domain); default everything else.

## Phase 1 - The HTML deck

Read `references/deck-patterns.md` before writing the deck. It distills the architecture and the pitfalls that cost real debugging time.

The short version:

1. **One self-contained HTML file** (CDN for KaTeX + Google Fonts only). Copy the animation engine from `assets/example-deck.html` (a complete, verified 10-scene deck) - the tween/flush engine, `makeGraph`, `drawOn`, the slide/beat controller, and the HUD are reusable as-is; replace the `slides` array and palette accents.
2. **Beats, not autoplay.** Each slide is a list of `async` beat functions; → plays the next beat, exactly like Manim's `self.play` calls. Beat 0 autoplays on slide entry.
3. **Dark Manim aesthetic.** Near-black blue background, one serif display font + one mono for readouts, Manim-ish palette (blue curve, yellow highlight, green/red semantic), draw-on curves, KaTeX for every formula.
4. **Verify in a real browser, slide by slide** - not just the happy path. Use whatever browser automation is available (built-in browser tools, Playwright, Puppeteer - any of them work; the procedures in the reference are tool-agnostic). Fast-forward beats with the microtask flush trick when the tab is occluded (Chrome freezes rAF in covered tabs), screenshot every slide's final state, and drive interactions with real pointer events. Check for overlapping elements; formulas belong in empty graph regions.

## Phase 2 - The video

Read `references/motion-canvas-port.md` (scaffold + port recipe + the five Motion Canvas gotchas) and `references/video-pipeline.md` (music, mux, verification) when you reach this phase.

The short version:

1. **Scaffold** a Motion Canvas project (vite + `@motion-canvas/2d` + ffmpeg exporter; exact files in the reference). Copy `assets/motion-canvas-lib.ts` - it already ports the deck's graph mapper, axes, draw-on, captions, and palette.
2. **Port one scene per slide.** The deck's beats map 1:1 onto `yield*` statements; interactive moments become scripted explorations (the slider animates itself; gradient descent runs converge-then-diverge as a double act). Video pacing is slower than deck pacing: add holds after key moments, target ~15-20 s per scene.
3. **Render via the editor** (vite dev server → RENDER button). The browser window must be visible and unminimized during the render - occluded tabs freeze requestAnimationFrame and the render stalls. Drive the click with the Chrome tools; bring the window forward with AppleScript if needed.
4. **Verify frame-by-frame before declaring success**: extract one frame per scene with ffmpeg and inspect each. First renders reliably surface 3-5 visual bugs (missing LaTeX, overlaps, orientation mistakes). Fix, re-render, re-verify the fixed spots.
5. **Music + mux**: generate a license-free ambient bed with `scripts/gen_music.py` (numpy synthesis - no downloads, no licensing questions), then mux with ffmpeg at background level (target ≈ -27 dB RMS overall) with fade in/out. Confirm with `ffprobe` + `astats`.

## Quality bar (both phases)

- Zero console errors; every formula renders (a missing fraction bar or minus sign is a known failure mode - see the gotchas reference).
- Nothing overlaps: readouts, formulas, labels, and moving elements each own empty space. When two labeled points can merge during an animation, fade one label out as they approach.
- Animated traces (a curve being drawn by a moving point) must be **solidified into a static full curve at the end of their beat**, so the end state survives replays, skips, and back-navigation.
- Report honestly: what was verified (with evidence - screenshots, probe output) and what wasn't (e.g., "I can't hear the music; levels are measurably correct, give it an ear check").
