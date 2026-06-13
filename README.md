# stem-visualizer

Manim-quality math explainers, built with plain web tech and rendered to video — plus the **agent skill** that encodes the whole workflow so a coding agent (Codex, Claude Code, or any agent that reads `SKILL.md` playbooks) can reproduce it for a new concept end to end.

## What's here

| Path | What it is |
|---|---|
| `src/` + `index.html` (Vite) | **STEM Visualizer** — Ivory Scholar chat / interactive web app that plays the explainer videos. Sources its lessons from the registry. Run with `npm install` then `npm run dev`. |
| `explainers/<id>/` | One self-contained STEM lesson each — `deck.html` (standalone interactive deck), `<id>.mp4` (1080p60 video), `poster.jpg`, and the `motion-canvas/` project that renders it. Currently **derivative** (slope → tangent plane → gradient, with a click-to-orbit 3D act) and **taylor**. Open any `deck.html` directly in a browser. |
| `explainers/registry.ts` | **Single source of truth** — the typed list of explainers the web app renders from. Adding a lesson = drop a folder + one entry here. |
| `ARCHITECTURE.md` | The project structure and the step-by-step recipe for adding a new explainer. |
| `.codex/skills/math-deck-video/` (mirrored at `.claude/skills/`) | **The skill**: a complete playbook for producing these — design taste, deck architecture, Motion Canvas port recipe, verified reference implementations to copy from, music/mux pipeline, and the phase-gate checklist. |

## Using the skill

The skill is discovered automatically when an agent runs inside this repo (Codex scans `.codex/skills/`, Claude Code scans `.claude/skills/`). Then ask for a new explainer, e.g.:

> Build a visual explainer for eigenvectors — both phases: the interactive deck and the rendered video.

The agent should announce it's following `math-deck-video` and work through the phases: lesson design → HTML deck (verified in a browser, slide by slide) → Motion Canvas port → 1080p60 render → music + mux → frame-by-frame verification → report.

To install the skill elsewhere, copy `math-deck-video/` into your personal skills directory (`~/.codex/skills/` or `~/.claude/skills/`).

## Working on the video projects

The Motion Canvas projects ship without `node_modules` or rendered intermediates:

```bash
cd explainers/<id>/motion-canvas    # e.g. explainers/derivative/motion-canvas
npm install
npx vite                            # opens the Motion Canvas editor; render via the RENDER button
```

Requirements: node ≥ 22, ffmpeg, python3 + numpy (for the music generator, `explainers/<id>/gen_music.py`).

See **[ARCHITECTURE.md](ARCHITECTURE.md)** for the full project structure and the recipe to add a new explainer.
