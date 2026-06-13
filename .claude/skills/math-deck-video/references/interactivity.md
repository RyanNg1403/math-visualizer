# Building interactive controls (the deck's superpower)

A rendered video shows one path through a concept. The HTML deck lets the viewer *ask
their own questions* — "what if the angle were steeper? what if the temperature doubled?
what if the learning rate were too big?" — and watch the answer. That is the single
biggest reason to ship the deck, and it is where most generated decks fall short: a slider
that doesn't visibly do anything, three knobs with no readout, or controls that break the
moment you press replay. This file is the recipe for controls that actually teach.

Applies to **every STEM subject**, not just math — the patterns are identical whether the
parameter is a launch angle, a temperature, an allele frequency, or a learning rate.

## The one rule: `state → render()`, controls only touch state

Every interactive slide has exactly **one source of truth** — a small state object — and
**one function that draws the whole scene from it**. Controls never draw; they mutate state
and call the render function. Readouts are produced *inside* render(), so the number and the
picture can never disagree.

```js
setup(c) {
  const G = makeGraph(c.svg, {x:[0,10], y:[0,6], ...});
  // 1) elements, created ONCE
  const traj = el('path', {class:'curve c-blue', fill:'none'}, G.layer);
  const apex = el('circle', {r:6, class:'f-yellow'}, G.layer);
  const read = htm(c.ov, 'pill', {right:'4%', top:'6%'}, '');
  // 2) state — the single source of truth
  c.refs = { angle: 45, speed: 20 };
  // 3) render EVERYTHING from state (every control calls this)
  c.update = () => {
    const { angle, speed } = c.refs;
    const pts = trajectory(angle, speed);            // pure function of state
    traj.setAttribute('d', G.pathD(...));
    apex.setAttribute('cx', G.X(apexX)); apex.setAttribute('cy', G.Y(apexY));
    read.innerHTML = `<span class="lab">range</span> ${fmt(range)} m`;
  };
  c.update();   // draw the initial state
}
```

Why this matters: replay (`r`) rebuilds the slide from `setup`, so if the scene is a pure
function of state, replay and back-navigation just work. Decks that compute positions
imperatively inside event handlers desync the instant you press `r` or drag twice.

## Control catalogue (copy these)

Each control is created in `setup`; its listener writes state, updates its own label, and
calls `c.update()`.

### Slider — the workhorse
```js
const ctrl = htm(c.ov, 'ctrl ui', {left:'50%', bottom:'4%', transform:'translateX(-50%)'},
  `<span>angle</span><input type="range" min="10" max="80" step="1" value="45"><span class="val"></span>`);
const inp = ctrl.querySelector('input'), val = ctrl.querySelector('.val');
inp.addEventListener('input', () => {
  c.refs.angle = +inp.value;
  val.textContent = `${c.refs.angle}°`;
  c.update();
});
```
Pick `min`/`max`/`step` that span the *interesting* range and no more; show the value beside
the slider. Two or three linked sliders are fine — label each one.

### Draggable point / handle
Use the engine's `draggable(handle, svg, onMove)`; convert pointer SVG coords back to data
coords, **clamp**, write state, render.
```js
draggable(apex, c.svg, p => {
  const x = Math.min(Math.max((p.x - G.X(0)) / (G.X(1) - G.X(0)), 0), 10); // px → data, clamped
  c.refs.x0 = x; c.update();
});
```
Give a draggable element a visible affordance (a halo / `cursor:grab`) so the viewer knows
to grab it.

### Toggle / mode switch
For discrete states (series vs parallel circuit, exothermic vs endothermic, BFS vs DFS): two
or three buttons that set a state flag and re-render.

### Play / sweep button
Animate a parameter across its range so the viewer sees the whole family at once — drive
state with `tween` and call `c.update()` each frame. Pair it with the slider (button =
autoplay the story; slider = explore manually).

## Every change needs a visible answer
A control that doesn't obviously change the picture is worse than none. For each knob, make
sure at least one thing visibly moves — a curve reshapes, a vector/point moves, a region
fills, a count changes — **and** put a live **readout** (mono pill) next to it showing the
quantity it governs. The number changing *in lockstep* with the picture is the teaching moment.

## One or two meaningful knobs, not five
Expose the parameter the viewer would actually wonder about, on the slide where that question
is loudest (usually the "money" slide and the real-world application). More than ~3 controls
on one slide reads as a control panel, not an explanation. Many parameters → spread them
across slides; don't pile them up.

## STEM examples (the same shape, every subject)
- **Physics** — projectile: angle / speed / gravity sliders → trajectory with range &
  max-height readouts; pendulum: length / gravity → period; optics: refractive index → bend
  angle; circuit: resistance slider → current arrow.
- **Chemistry** — ideal gas: T / V / n sliders → pressure readout + particle speed; titration:
  drag the added-volume point along the pH curve; reaction: temperature → rate / shifting
  Boltzmann distribution.
- **Biology** — logistic growth: growth-rate & carrying-capacity sliders → population curve;
  Hardy–Weinberg: allele-frequency slider → genotype-ratio bars; enzyme kinetics: drag
  [substrate] along the Michaelis–Menten curve → reaction rate.
- **CS / IT** — sorting: array-size slider + step button; binary search: drag the target value;
  gradient descent: learning-rate dial (show it diverge past a threshold); complexity: n
  slider → operation count.
- **Math** — the h-slider that turns a secant into a tangent; a draggable point reading off
  f′(x); the learning-rate dial.

Every one is a control the viewer *wants*, wired to a visible change and a live number.

## Pitfalls (the usual reasons interactive decks feel flat)
1. **Dead controls** — a slider/handle that changes a value nothing displays. Bind every
   control to a visible element *and* a readout.
2. **DOM as state** — reading values/positions back out of the DOM instead of from the state
   object. Breaks on replay and accumulates drift. State is the only truth; render from it.
3. **No live readout** — the viewer can't tell *how much* changed. Pair every control with a number.
4. **Knob soup** — too many controls; the teaching point drowns. One or two per slide.
5. **Unclamped inputs** — drags/sliders that push the scene off-screen or into `NaN`. Clamp to
   the data range; guard divide-by-zero and domain limits (e.g. `√`, `log`).
6. **Replay-fragile** — a control that mutates an element created outside `setup`, so `r`
   can't rebuild it. Everything a control touches is created in `setup` and derived in `update`.
7. **Redraw jank** — if `update()` rebuilds hundreds of nodes per `input`, cache the static
   parts and recompute only what the parameter affects.

## Verify interactivity (not just that it renders)
For **every** control: drive it with real events (set the slider `value` then dispatch an
`input` event; pointer-drag handles), then read back *both* the readout text and a computed
attribute (e.g. a path `d` or a circle `cx`) to confirm the picture actually moved — not just
that the control exists. A control you didn't drive in testing is a control you didn't ship.
This is step 4 of the verification procedure in `deck-patterns.md`; interactive slides do not
pass their phase gate until each control is exercised this way.
