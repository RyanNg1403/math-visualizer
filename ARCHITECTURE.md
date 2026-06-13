# Architecture

This repo grows by **explainers** — one self-contained STEM lesson each (a derivative,
a Taylor series, eigenvectors, …). Every explainer ships the same artifacts in the same
place, and a single registry makes them show up in the web app automatically. Adding a
new lesson is a fixed recipe, not a wiring exercise.

## Layout

```
math-visualizer/
├─ index.html, ivory-scholar.html   # web-app entry points (Vite)
├─ src/                             # the "Math Visualizer" web app
│  ├─ main.ts                       # app logic
│  ├─ app-html.ts                   # markup; pulls lesson assets from the registry
│  └─ styles.css
├─ explainers/                      # ← the library of explainers
│  ├─ registry.ts                   # SINGLE SOURCE OF TRUTH (typed list of explainers)
│  ├─ derivative/
│  │  ├─ deck.html                  # standalone interactive deck   (skill Phase 1)
│  │  ├─ derivative.mp4             # rendered 1080p60 video        (skill Phase 2)
│  │  ├─ poster.jpg                 # still frame for web-app cards
│  │  ├─ gen_music.py               # ambient music-bed generator
│  │  └─ motion-canvas/             # the project that renders the video
│  └─ taylor/
│     ├─ deck.html  taylor.mp4  poster.jpg  motion-canvas/
│     └─ AGENTS.md  BRIEF.md  REPORT.md      # how this one was built
├─ .claude/skills/  .codex/skills/  # the `math-deck-video` agent skill (the playbook)
├─ ARCHITECTURE.md                  # this file
└─ README.md
```

## The contract for an explainer

Each `explainers/<id>/` directory provides, by convention:

| File | What | Required |
|---|---|---|
| `deck.html` | Standalone interactive HTML deck (open directly in a browser). | yes |
| `<id>.mp4` | Rendered 1080p60 video with the music bed. | yes |
| `poster.jpg` | A representative still, shown on the web-app card. | yes |
| `motion-canvas/` | The Motion Canvas project that renders `<id>.mp4`. | for reproducibility |

- `<id>` is lowercase/kebab-case, and is **both** the folder name and the registry `id`.
- The video is named `<id>.mp4`; the deck is always `deck.html`; the poster is always `poster.jpg`.

## The registry — single source of truth

`explainers/registry.ts` exports a typed `explainers: Explainer[]`. The web app (`src/`)
imports it; nothing else hard-codes lesson paths. Each asset URL **must** be written as a
`new URL('<string literal>', import.meta.url).href` so Vite can find the file and emit it
as a fingerprinted asset — do **not** wrap that in a helper that takes a variable, or the
asset silently won't be bundled.

## Add a new explainer (the recipe)

1. **Produce the artifacts.** Run the `math-deck-video` skill for the concept — it builds
   the interactive `deck.html` first, then ports it to Motion Canvas and renders the video.
2. **Place them** in a new `explainers/<id>/`:
   ```
   explainers/<id>/{deck.html, <id>.mp4, motion-canvas/}
   ```
   Make the poster from a representative frame:
   ```
   ffmpeg -ss <seconds> -i explainers/<id>/<id>.mp4 -frames:v 1 explainers/<id>/poster.jpg
   ```
3. **Register it.** Append one entry to `explainers/registry.ts` (id, title, blurb, tags,
   and the three `new URL(...)` asset literals).
4. **See it.** `npm run dev` — the lesson is now available to the web app, and `deck.html`
   opens standalone.

That's the whole loop: build → drop in `explainers/<id>/` → one registry entry.

## Build & run

```bash
# web app (the gallery / chat UI)
npm install
npm run dev          # http://127.0.0.1:8765
npm run build        # tsc + vite build -> dist/

# a single deck, no tooling
open explainers/<id>/deck.html

# re-render an explainer's video
cd explainers/<id>/motion-canvas
npm install && npx vite            # open the editor, press RENDER
# then add music + mux (see the skill's references/video-pipeline.md)
```

## What is and isn't committed

Source and final artifacts are committed: `deck.html`, `<id>.mp4`, `poster.jpg`, the
Motion Canvas **source**, and `registry.ts`. Regenerable intermediates are gitignored and
must never be committed: `node_modules/`, `dist/`, `output/`, `music.wav`, `verify_frames/`.
