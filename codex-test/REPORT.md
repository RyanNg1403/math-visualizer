# Taylor Series Visual Explainer Report

## Artifacts

- Interactive deck: `taylor-deck.html`
- Final video: `taylor.mp4`
- Motion Canvas source/render: `motion-canvas/`
- Verification evidence: `evidence/`

## Scene List

1. The promise: a yellow polynomial locally impersonates the blue function.
2. Local information: start at center `a`, then collect derivative clues.
3. Term 0: the constant approximation matches only height.
4. Term 1: slope adds the tangent line; scripted/interactive center movement.
5. Term 2: curvature bends the approximation into the function.
6. Money shot: odd Taylor polynomials hug `sin(x)` farther as degree rises.
7. Matching derivatives: coefficients are forced by matching local fingerprints.
8. Formula: Taylor's sum appears after the visual construction.
9. Radius of trust: `1/(1-x)` works inside `|x| < 1` and fails outside.
10. Recap: geometry, computation, and the locality warning.

## Deck Verification

- Served over HTTP on port `8200` and verified with Playwright.
- Console errors: `0`, recorded in `evidence/deck/console.json`.
- Slide screenshots: `evidence/deck/slide-01.png` through `evidence/deck/slide-10.png`.
- Contact sheet: `evidence/deck/contact-sheet.png`.
- Replay check: verifier pressed `r` on every slide and confirmed the active slide stayed correct.
- Interactive controls driven with real pointer/input events:
  - Slide 4 center slider: `a=1.10`
  - Slide 6 degree slider: `n=7`
  - Slide 9 failure slider: `x=1.12 (fail)`
- Summary: `evidence/deck/summary.txt`.

## Video Verification

- Motion Canvas editor render completed twice; first pass exposed a formula/vertical-wall overlap in the radius scene, fixed before final render.
- Editor evidence:
  - `evidence/video/editor-before-render.png`
  - `evidence/video/editor-render-started.png`
  - `evidence/video/editor-after-render.png`
  - `evidence/video/editor-console.json`
- Raw render probe: `evidence/video/render-probe.txt`
  - H.264, `1920x1080`, `60/1`, duration `94.850000s`.
- Final frame evidence:
  - Per-scene frames: `evidence/video/frames-final/`
  - Contact sheet: `evidence/video/frame-contact-sheet-final.png`
  - Late mux frame: `evidence/video/final-late-frame.png`

## Audio And Final MP4

- Music generated locally with the skill's numpy synthesizer: `music.wav`, `125s`.
- Raw music levels: `evidence/video/music-levels.txt`, RMS about `-17.7 dB`.
- Muxed with `-c:v copy`, AAC audio, `-9 dB` music ducking, 2.5s fade-in, 5.5s fade-out.
- Final probe: `evidence/video/final-probe.txt`
  - H.264 video, `1920x1080`, `60/1`
  - AAC audio
  - Duration `94.850000s`
- Final audio RMS: `evidence/video/final-audio-rms.txt`, about `-26.97 dB`.

## Deviations And Caveats

- I used `npx vite build` as the Motion Canvas compile check. Raw `npx tsc --noEmit` reports scaffold/type issues for Motion Canvas `?scene` imports and upstream `Callback` declarations, while the Vite build succeeds and is the relevant Motion Canvas bundling path.
- The editor console contains two MathJax warnings for blank space glyph paths, not formula parse failures. Rendered formula frames were inspected in the final contact sheet.
- I cannot perform a human listening check; audio presence, duration, fades, and RMS level were verified numerically.
