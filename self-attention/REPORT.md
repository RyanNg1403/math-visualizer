# Self-Attention Visual Explainer Report

## Artifacts

- Interactive deck: `self-attention-deck.html`
- Final video: `self-attention.mp4`
- Motion Canvas source/render: `motion-canvas/`
- Verification evidence: `evidence/`

## Scene List

1. Hook: the model predicts the next word after "too" while "it" can point to different context.
   The opening now explicitly introduces the attention mechanism as choosing what to look at.
2. Tokenization: text becomes tokens, then vectors.
3. Ambiguity: "too tired" points "it" toward animal; "too wide" points it toward street.
4. Q/K matching: query means what "it" seeks; keys mean what earlier words offer.
5. Softmax: raw scores become attention weights and beam thickness.
6. Money shot: value vectors blend into an updated "it" vector, shifting next-word probabilities.
7. Parallel attention: every token can update at once, with a light multi-head visual nod.
8. Formula and close: compact attention formula plus the "Attention Is All You Need" callback.

## Deck Verification

- Served over HTTP on port `8300` and verified with Playwright using system Chrome.
- Console errors: `0`, recorded in `evidence/deck/console.json`.
- Slide screenshots: `evidence/deck/slide-01.png` through `evidence/deck/slide-08.png`.
- Contact sheet: `evidence/deck/contact-sheet.png`.
- Replay check: verifier pressed `r` on every slide and confirmed the active slide stayed correct.
- Interactive controls driven with real pointer/input events:
  - Slide 5 context slider: `too wide`
  - Slide 7 head slider: `properties`
- Summary: `evidence/deck/summary.txt`.

## Video Verification

- Motion Canvas build passed with `npx vite build`.
- Raw render completed through the Motion Canvas editor driver.
- A second visual QA pass fixed text/beam overlaps in the ambiguity, Q/K matching, and value-blend scenes before the final mux.
- A follow-up revision made the opening explicitly introduce the attention mechanism before narrowing to self-attention.
- Editor evidence:
  - `evidence/video/editor-before-render.png`
  - `evidence/video/editor-render-started.png`
  - `evidence/video/editor-after-render.png`
  - `evidence/video/editor-console.json`
- Raw render probe: `evidence/video/render-probe.txt`
  - H.264, `1920x1080`, `60/1`, duration `113.100000s`.
- Final frame evidence:
  - Per-scene frames: `evidence/video/frames-final/`
  - Contact sheet: `evidence/video/frame-contact-sheet-final.png`
  - Late mux frame: `evidence/video/final-late-frame.png`

## Audio And Final MP4

- Music generated locally with the skill's numpy synthesizer: `music.wav`, `145s`.
- Raw music levels: `evidence/video/music-levels.txt`, RMS about `-17.74 dB`.
- Muxed with `-c:v copy`, AAC audio, `-9 dB` music ducking, 2.5s fade-in, 5.5s fade-out.
- Final probe: `evidence/video/final-probe.txt`
  - H.264 video, `1920x1080`, `60/1`
  - AAC audio
  - Duration `113.100000s`
- Final audio RMS: `evidence/video/final-audio-rms.txt`, about `-26.92 dB`.

## Deviations And Caveats

- ImageMagick was not installed, so contact sheets were generated with ffmpeg instead.
- `fadeTransition` failed in this Motion Canvas/editor context, so scene-level fade transitions were removed. Scene-internal animation remains intact.
- The npm install for the Motion Canvas project repeatedly stalled after populating dependencies. I copied the matching package lock from the prior Motion Canvas project and used the system `/opt/homebrew/bin/ffmpeg` through a local `node_modules` shim for rendering. The final source, render, and probes are complete.
- I cannot perform a human listening check; audio presence, duration, fades, and RMS level were verified numerically.
