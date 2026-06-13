import {makeScene2D, Txt, Node} from '@motion-canvas/2d';
import {waitFor, fadeTransition, tween, easeInOutSine} from '@motion-canvas/core';
import {PALETTE, SERIF, MONO, makeBark, placeMoth, makeShades, scatter, evolveMoths, meanOf, lerp, BARK} from '../lib';

export default makeScene2D(function* (view) {
  view.fill(PALETTE.bg);
  yield* fadeTransition(0.6);

  view.add(new Txt({text: '07 · CHANGE THE WORLD', position: [-740, -480], offset: [-1, 0], fontFamily: MONO, fontSize: 22, letterSpacing: 5, fill: PALETTE.gold, opacity: 0.85}));
  view.add(new Txt({text: 'Darken the bark, and evolution turns around', y: -420, fontFamily: SERIF, fontWeight: 500, fontSize: 46, fill: PALETTE.ink}));
  const cap = new Txt({y: 470, width: 1560, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontWeight: 300, fontSize: 38, fill: PALETTE.caption, opacity: 0});
  view.add(cap);

  let B = 0.16;
  const bark = makeBark(BARK, 0.66); bark.setDarkness(B); view.add(bark.rect);
  const read = new Txt({position: [-660, -348], offset: [-1, 0], fontFamily: MONO, fontSize: 28, fill: PALETTE.ink, opacity: 0, text: ''});
  view.add(read);

  const N = 34;
  let shades = makeShades(N, 0.3, 0.17, 5);
  let gen = 0;
  let layer: Node | null = null;
  function build() {
    const lay = new Node({});
    const pos = scatter(N, {x: BARK.x + 50, y: BARK.y + 70, w: BARK.w - 100, h: BARK.h - 120}, 400 + gen * 17);
    shades.forEach((s, i) => lay.add(placeMoth(s, pos[i].x, pos[i].y, 26)));
    return lay;
  }
  const setRead = () => read.text(`gen ${gen}    avg shade ${meanOf(shades).toFixed(2)}    bark ${B.toFixed(2)}`);

  layer = build(); view.add(layer); setRead();
  yield* read.opacity(1, 0.4);
  cap.text('A pale population on pale bark — every moth well hidden.'); yield* cap.opacity(1, 0.5);
  yield* waitFor(1.0);

  // soot darkens the bark
  yield* cap.opacity(0, 0.25); cap.text('Then soot blackens the bark. Suddenly it is the pale moths that are exposed.'); yield* cap.opacity(1, 0.45);
  yield* tween(2.2, (t) => { B = lerp(0.16, 0.82, easeInOutSine(t)); bark.setDarkness(B); setRead(); });
  yield* waitFor(1.0);

  // evolution turns around: population darkens to match
  yield* cap.opacity(0, 0.25); cap.text('Select, inherit, repeat — and the moths chase the bark the other way.'); yield* cap.opacity(1, 0.45);
  for (let g = 1; g <= 6; g++) {
    shades = evolveMoths(shades, {B, strength: 2.6, mutation: 0.06, seed: 500 + g}); gen = g;
    yield* layer!.opacity(0, 0.3);
    layer!.remove();
    layer = build(); layer.opacity(0); view.add(layer); setRead();
    yield* layer.opacity(1, 0.4);
    yield* waitFor(0.35);
  }
  yield* cap.opacity(0, 0.25); cap.text('Same engine, new winner — the population is dark now, and hidden again.'); yield* cap.opacity(1, 0.45);
  yield* waitFor(1.8);
});
