# Porting the deck to Motion Canvas

Motion Canvas (MIT, `@motion-canvas/*` 3.x) is the chosen video engine: its generator-based scenes (`yield*` = Manim's `self.play`) map 1:1 onto the deck's beats. This file is the complete port recipe. Follow it in order; every gotcha listed here was a real bug that survived to a render.

## 1. Scaffold

Copy `assets/scaffold/` into a new project directory (it contains `package.json`, `vite.config.ts`, `tsconfig.json`, `src/project.ts`, `src/project.meta`, `src/global.css`), then:

```bash
npm install
npx vite --port 9000   # run detached/background; this serves the editor
```

Notes:
- `src/project.meta` pre-configures 1920×1080, 60 fps rendering, the FFmpeg exporter, and the dark background. The vite plugin rewrites/normalizes this file on first load — that is expected.
- `src/global.css` imports Google Fonts (Fraunces + IBM Plex Mono). Canvas text can only use loaded fonts; without this import every Txt falls back to system fonts.
- Copy `assets/motion-canvas-lib.ts` to `src/lib.ts`. It contains the palette, the math-coords→scene-coords `mapper`, `makeAxes` (axes/ticks/arrows with draw-on), `fnLine` (sampled curve, created hidden), `drawOn`, `slopeSegment` (y-clipped line through a point with slope), `dot`, `makeCaption` (italic crossfading subtitle), and `addKicker`.

## 2. Port each slide as one scene file

`src/scenes/sNN_name.tsx`, registered in `src/project.ts` via `import sNN from './scenes/sNN_name?scene';`. Study `assets/example-scene.tsx` (the secant→tangent "money shot" scene) — it demonstrates every pattern below.

The mapping from deck constructs:

| Deck construct | Motion Canvas construct |
|---|---|
| beat function | a `yield*` block (usually `say(...)` + animations) |
| `tween(h, 4→0.05)` | `const h = createSignal(4); yield* h(0.05, 5.5, easeOutCubic)` |
| elements positioned from `h` | reactive props: `position: () => [M.X(3+h()), M.Y(f(3+h()))]` |
| live readout | `Txt({text: () => \`h = ${h().toFixed(2)}\`})` |
| `drawOn(path)` | `yield* drawOn(line, dur, ease)` from lib |
| slider / draggable point | scripted ghost interaction: animate the signal through 2-3 illustrative values |
| caption swap | `yield* say('...')` |
| slide transition | `yield* fadeTransition(0.6)` as the scene's first yield (not in scene 1) |

Pacing: video is slower than deck. Add `waitFor(0.8–2.2)` holds after each key moment; the money-shot tween gets 4–6 s. Target 15–20 s per scene.

## 3. The five Motion Canvas gotchas (memorize before writing scenes)

1. **LaTeX color — never nest `{\color{...} ...}` brace groups.** Motion Canvas's MathJax path throws `Extra close brace` / `Missing argument for \color`. Use `\textcolor{#hex}{...}` instead.
2. **`currentColor` glyphs render invisible.** Fraction bars and minus signs between colored terms inherit `currentColor`, which the canvas renders as nothing on a dark bg. Wrap the *entire* expression in an outer `\textcolor{#e9e7df}{...}`, with inner `\textcolor`s for the colored parts.
3. **Zero-length round-cap lines render a stray dot** at their start before draw-on. `fnLine` in the lib already creates curves with `opacity: 0`; always reveal via `drawOn`, and give inline-constructed solid lines `opacity: 0` + `line.opacity(1)` right before drawing.
4. **Never use `Txt` as a container** for other nodes (children get concatenated into garbage). Group with `Node`.
5. **Reactive traces erase themselves** when their driving signal moves backward. After the tracing sweep completes, freeze: `trail.points(staticFullArray)`.

Also: whitespace inside `Txt` collapses — use ` ` for multi-space gaps in readouts.

## 4. Render

Rendering happens **in the browser editor** (no official headless CLI as of v3.17):

1. Open the vite dev server URL in a browser (e.g. `http://localhost:9000` if you used `--port 9000`). Check the editor console (bug icon) for MathJax errors *before* rendering — they will not stop a render, they just produce missing formulas.
2. **The window must be visible and unminimized for the whole render** — Chrome freezes `requestAnimationFrame` for occluded tabs and the render stalls at 0. On macOS, bring it forward via AppleScript (`tell application "Google Chrome" to activate` + raise the right window); with Playwright, launch headed, or use new-headless mode where rAF runs normally.
3. Click **RENDER** in the Video Settings panel. ~9,000 frames (2.5 min @ 60 fps) renders in roughly 1.5–2 minutes. Output: `<project>/output/project.mp4`.
4. The file is finalized only when its size stops changing (`moov atom not found` from ffprobe = still writing). Poll size-stability, not existence or first mtime change.

## 5. Verify the render frame-by-frame (non-negotiable)

First renders reliably contain 3–5 visual bugs. Extract one frame per scene and *look at every one*:

```bash
for t in 8 20 33 48 63 78 95 110 128 145; do   # adjust to scene midpoints/ends
  ffmpeg -y -loglevel error -ss $t -i output/project.mp4 -frames:v 1 check_t$t.png
done
```

Inspect for: missing/partial formulas (gotchas 1–2), overlapping text, elements colliding with the kicker or captions, stray dots (gotcha 3), erased traces (gotcha 5), upside-down or misplaced icon art. Fix, re-render, re-extract **the frames that were broken** plus neighbors. Two render passes is normal; budget for it.
