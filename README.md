# math-visualizer

Manim-quality math explainers, built with plain web tech and rendered to video — plus the **agent skill** that encodes the whole workflow so a coding agent (Codex, Claude Code, or any agent that reads `SKILL.md` playbooks) can reproduce it for a new concept end to end.

## What's here

| Path | What it is |
|---|---|
| `src/` + Vite files | **Math Visualizer** — Ivory Scholar chat and interactive STEM visualizer prototype, built as a Vite + TypeScript frontend. Run with `npm install` then `npm run dev`. |
| `video-proto/the-derivative.mp4` | The same lesson as a 2.5-min 1080p60 video with an ambient music bed, rendered from the Motion Canvas port in `video-proto/motion-canvas/`. |
| `codex-test/` | A second, independently produced explainer (**Taylor series**: `taylor-deck.html` + `taylor.mp4`) — built by an agent following the skill, with its build report in `REPORT.md`. |
| `.codex/skills/math-deck-video/` (mirrored at `.claude/skills/`) | **The skill**: a complete playbook for producing these — design taste, deck architecture, Motion Canvas port recipe, verified reference implementations to copy from, music/mux pipeline, and the phase-gate checklist. |

## Using the skill

The skill is discovered automatically when an agent runs inside this repo (Codex scans `.codex/skills/`, Claude Code scans `.claude/skills/`). Then ask for a new explainer, e.g.:

> Build a visual explainer for eigenvectors — both phases: the interactive deck and the rendered video.

The agent should announce it's following `math-deck-video` and work through the phases: lesson design → HTML deck (verified in a browser, slide by slide) → Motion Canvas port → 1080p60 render → music + mux → frame-by-frame verification → report.

To install the skill elsewhere, copy `math-deck-video/` into your personal skills directory (`~/.codex/skills/` or `~/.claude/skills/`).

## Working on the video projects

The Motion Canvas projects ship without `node_modules` or rendered intermediates:

```bash
cd video-proto/motion-canvas   # or codex-test/motion-canvas
npm install
npx vite                       # opens the Motion Canvas editor; render via the RENDER button
```

Requirements: node ≥ 22, ffmpeg, python3 + numpy (for the music generator, `video-proto/gen_music.py`).
