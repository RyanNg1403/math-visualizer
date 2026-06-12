# Phase-gate checklist

Work through these gates in order. Do not advance past a gate with unchecked items — every item exists because skipping it produced a real defect.

## Gate 0 — Design (before any code)
- [ ] Audience floor stated in one sentence
- [ ] 8–12 scene outline written; each scene is a single idea
- [ ] The money-shot animation identified and given the most time
- [ ] 1–2 application domains chosen for this audience (include one failure case if the concept has one)
- [ ] 2–3 interactive moments chosen (deck) with their scripted-ghost translation noted (video)

## Gate 1 — Deck built
- [ ] Single self-contained HTML file; only CDN deps (KaTeX, fonts)
- [ ] Engine copied from the example deck (tween/flush, makeGraph, drawOn, beat controller, HUD)
- [ ] Every formula is KaTeX; every number is mono; captions are one italic line
- [ ] Palette semantics consistent (blue subject / yellow instrument / green-red semantic / purple derived)

## Gate 2 — Deck verified (evidence required)
- [ ] Served over http and loaded with zero console errors
- [ ] Every slide stepped to its final beat and screenshotted (use the microtask flush loop if the tab is occluded)
- [ ] No overlaps: formulas, readouts, labels, kicker, moving elements
- [ ] Each interactive control driven with real pointer/input events and a computed value read back
- [ ] Traces solidified; replay (`r`) works on every slide

## Gate 3 — Video port
- [ ] Scaffold + lib copied; fonts CSS imported; meta at 1080p60 + ffmpeg exporter
- [ ] One scene per slide; beats → `yield*`; holds added (video pacing 15–20 s/scene)
- [ ] Interactions replaced by scripted ghost interactions (sweep 2–3 telling values)
- [ ] The five Motion Canvas gotchas reviewed against every scene (LaTeX nesting, currentColor, cap dots, Txt containers, trace freezing)

## Gate 4 — Render verified (evidence required)
- [ ] Editor console clean of MathJax errors before rendering
- [ ] Render completed with the window visible; output size stable before probing
- [ ] One frame per scene extracted and actually inspected; defects fixed and re-verified (budget two passes)

## Gate 5 — Final video
- [ ] Music generated (license-free) ~30 s longer than video; levels probed
- [ ] Muxed with `-c:v copy`, ducked ≈ −9 dB, fades in/out; duration matches video
- [ ] Final probe: codecs, resolution, fps, duration; overall RMS ≈ −25..−28 dB; late frame extracted
- [ ] Report states what was verified with evidence and what was not (e.g., audio needs a human ear check)
