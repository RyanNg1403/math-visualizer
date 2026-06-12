# HTML deck architecture & pitfalls

The reference implementation is `assets/example-deck.html` — a complete, browser-verified 10-scene deck on derivatives. Copy its engine wholesale; this file explains what each piece is for and the bugs we already paid for.

## Engine (reuse verbatim from the example)

- **Tween core** — `tween({dur, ease, update})` on `requestAnimationFrame`, returning a Promise. Every running tween registers in an `activeTweens` set; `flushTweens()` finishes them all instantly (`update(1)` + resolve). The flush is what makes beats skippable and the deck testable.
- **`drawOn(path, dur)`** — stroke-dasharray draw-on for any SVG path. Clear the dasharray when done.
- **`makeGraph(svg, opts)`** — maps math coords → SVG coords (`X(u)`, `Y(v)`), builds axes with arrowheads, ticks, grid, labels; returns `pathD(f, a, b)` for sampled function curves. All visual math goes through a mapper — never hand-place coordinates.
- **Slide/beat controller** — each slide: `{kicker, title, vh, caption, setup(ctx), beats: [async fn...]}`. `→`/Space/click advances: plays the next beat, or moves to the next slide when beats are exhausted; `←` goes back; `r` replays the slide (full rebuild — slides must be reconstructible from `setup`). Beat 0 autoplays on entry. A click during a beat flushes it (fast-forward), and the *next* click advances — good UX, don't "fix" it.
- **Caption crossfade** — `ctx.say(html)` swaps the single italic caption line per beat.

## Design rules that made it look good

- Palette as CSS variables: bg `#0b0e15`, ink `#e9e7df`, blue `#58c4dd`, yellow `#ffd45e`, green `#7fd483`, red `#ff6f61`, purple `#c792ea`, dim `#69718a`. Blue = the subject curve, yellow = the highlighted/tangent thing, green/red = semantic (positive/negative, average), purple = derived objects.
- Fonts: Fraunces (display + italic captions), IBM Plex Mono (readouts, ticks, kickers), KaTeX for all math. Never render formulas as plain text.
- Terse captions: one line, subtitle-style, italic serif, centered under the stage. Highlight key words with colored `<span>`s matching the visual.
- Live readouts (mono, top of stage) that update during tweens — `h = 0.42 s  slope = 20.96 m/s` — are the cheapest way to connect animation to quantity.
- Formulas live in **empty regions of the graph** (usually lower-right). Before placing, check what the curve occupies at its fullest extent.

## Pitfalls (each of these was a real bug)

1. **CSS `style.transform` overrides the SVG `transform` attribute.** A fade helper that tweens `style.transform` will teleport attribute-positioned groups to the origin. If a node is positioned via attribute transform, the fade helper must not touch transform (pass `dy=0` and skip it).
2. **Chrome freezes `requestAnimationFrame` in occluded tabs.** Anything gated on rAF (including adding a CSS class "on next frame") silently never happens when the window is covered. Use forced reflow (`void el.offsetWidth`) instead of rAF to kick transitions, and test via the flush loop below.
3. **Animated traces are pure functions of their progress signal** — if a later beat moves the signal backward, the trace erases. Solidify: at the end of the tracing beat, replace the trail's points with the full sampled curve.
4. **Labels on merging points collide.** When an animation drives point B into point A, fade B's label out as the gap shrinks (`opacity = clamp((gap - eps)/range)`).
5. **Slope/secant lines drawn from a point + slope must be clipped in y** as well as x, or steep lines exit the plot area; clip endpoints to the graph's y-range by solving for the boundary intersection.
6. **Zero-length round-cap lines render as stray dots.** Any `end: 0`/length-0 path with `stroke-linecap: round` shows a dot before its draw-on starts. Create hidden, reveal when drawing begins.

## Verification procedure (do all of it)

1. Serve the file (`python3 -m http.server`) and open it in Chrome via the browser tools; `file://` URLs get mangled by the navigate tool.
2. If the tab is occluded (animations frozen, `document.visibilityState === 'hidden'`), don't fight for window focus repeatedly. Install a fast-forward helper in the page and drive it: flush all tweens via microtask loop — `for (let k=0;k<800;k++){ flushTweens(); await Promise.resolve(); }` between `playBeat()` calls. Timers are throttled to ≥1 s in hidden tabs, so a `setTimeout`-based loop is 10× too slow — microtasks are not throttled.
3. Step every slide to its final beat and screenshot. Look specifically for: overlapping text, formulas on top of curves, missing KaTeX, stray dots, traces that vanished.
4. Test each interactive control with real pointer events (click-drag on handles, set sliders + dispatch `input`), and read back a computed value to confirm the wiring (e.g., the readout text after a drag).
5. Console must be error-free on load and after a full traversal.
