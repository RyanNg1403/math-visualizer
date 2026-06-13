# Design taste — what makes these explainers good

This file captures the judgment calls, not the mechanics. When in doubt, decisions here outrank convenience.

Every principle below is **subject-agnostic** — it holds for a physics trajectory, a titration curve, a sorting array, or a population model just as well as for a derivative. Where an example names a math object, read it as a stand-in for your subject's equivalent (the "curve" is whatever you're plotting; the "money shot" is whichever single animation carries *your* concept).

## Pedagogy

- **Concrete before abstract, always.** Open with a physical scenario the viewer already understands (a car driving, a ball rolling) and *earn* the formalism. The defining equation appears only after the viewer has watched every part of it happen on screen — then the formula reads as a transcript of what they saw, not as new material.
- **One idea per scene.** If a scene needs "and also...", split it. The scene list should read as single statements: "average speed is a slope", "shrinking h turns secant into tangent", "the slopes form a new function".
- **Identify the money shot and spend on it.** Every concept has one animation that *is* the understanding (secant→tangent; Riemann rectangles thinning; vectors getting scaled by a matrix). Give it the slowest easing, the longest hold, a live numeric readout converging, and bring it back later as a callback ("the slide-4 move").
- **Applications are part of the explanation, not dessert.** Pick 1–2 domains the audience actually cares about and animate the concept *working* there (speedometer drawing v(t); gradient descent stepping downhill). A failure case teaches more than a success — show the learning rate exploding, not just converging.
- **Recap unifies, not summarizes.** End by showing the faces of the idea are the same thing ("slope = rate = direction — all one move").

## Motion

- Durations that feel right at 60 fps: curve draw-on 1.4–2.0 s `easeInOutCubic`; point pops 0.4 s `easeOutBack`; UI/label fades 0.4–0.8 s; the money tween 4–6 s `easeOutCubic` (decelerating into the limit — the slowdown *is* the meaning); scene crossfade 0.6 s.
- Holds after key moments: 0.8–2.2 s. Video pacing needs air; if it feels slow while authoring, it is right.
- Things move for reasons. A draw-on means "this object is being introduced"; a color shift means "this object changed status" (green secant → yellow tangent at the limit); a pulse ring means "look here". Don't animate for decoration.
- Live readouts during tweens connect picture to number: the slope readout ticking toward 21.1 while the secant rotates teaches the limit better than any sentence.

## Look

- Background near-black blue (`#0b0e15`), never pure black. Subtle grain/vignette in HTML; flat in video (compression hates grain).
- Color semantics, applied consistently across the whole piece: **blue** = the subject (the function), **yellow** = the highlighted instrument (tangent, current point, h), **green** = secondary/average/positive, **red** = negative/error/falling, **purple** = derived objects (f′, loss curve), **dim gray** = chrome (axes, ticks, kickers).
- Typography: a serif with character for display + italic captions (Fraunces), a mono for every number (IBM Plex Mono), real LaTeX for every formula. Mixed-font discipline is most of the "designed, not generated" feel.
- Layout: graph owns ~70% of the frame; kicker (small, letter-spaced, dim) top-left; live readout top-center/right; formula in an *empty* region of the plot (usually lower-right); caption centered at bottom. Nothing within ~40 px of anything else.

## Caption voice

One italic line per beat, subtitle register, present tense, no hedging. The caption names what the eye should notice — it never explains what the animation already shows.

- Good: *"Now shrink h — and watch the slope number."*
- Good: *"The ball is blind. It can only feel the slope under its feet."*
- Bad: *"As we can see, when we decrease the value of h, the secant line approaches the tangent line, which represents the instantaneous rate of change."* (three ideas, passive, redundant with the visual)

Colored `<span>`s / `\textcolor` in captions and formulas must match the object colors on the graph — the color *is* the cross-reference.

## Interactivity (deck) and its video translation

Sliders and draggable points go where the viewer would ask "but what if...": the h slider, draggable secant endpoints, a learning-rate dial. In the video these become **scripted ghost interactions** that answer the same question: sweep the parameter through 2–3 telling values, including one failure (η too big → divergence). The video should feel like watching an expert play with the deck.

## Music

Ambient, harmonically static (slow major-7 pad cycles), no percussion, no melody fighting the captions. Mixed quiet: ≈ −27 dB RMS overall, 2.5 s fade-in, ~5 s fade-out. The music's job is to make silence not feel broken.
