import {makeScene2D, Txt, Node, Circle} from '@motion-canvas/2d';
import {sequence, waitFor, all, fadeTransition} from '@motion-canvas/core';
import {PALETTE, SERIF, MONO, makeBark, placeMoth, makeShades, scatter, BARK} from '../lib';

export default makeScene2D(function* (view) {
  view.fill(PALETTE.bg);
  yield* fadeTransition(0.6);

  view.add(new Txt({text: '02 · IT BEGINS WITH VARIATION', position: [-740, -480], offset: [-1, 0], fontFamily: MONO, fontSize: 22, letterSpacing: 5, fill: PALETTE.gold, opacity: 0.85}));
  view.add(new Txt({text: 'No two moths wear the same coat', y: -420, fontFamily: SERIF, fontWeight: 500, fontSize: 50, fill: PALETTE.ink}));
  const cap = new Txt({y: 470, width: 1560, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontWeight: 300, fontSize: 38, fill: PALETTE.caption, opacity: 0});
  view.add(cap);

  const bark = makeBark(BARK, 0.42); bark.setDarkness(0.16); view.add(bark.rect);
  const layer = new Node({}); view.add(layer);
  const shades = makeShades(28, 0.34, 0.19, 5); shades[3] = 0.86; shades[19] = 0.8;
  const pos = scatter(28, {x: BARK.x + 50, y: BARK.y + 70, w: BARK.w - 100, h: BARK.h - 120}, 5);
  const moths = pos.map((p, i) => { const m = placeMoth(shades[i], p.x, p.y, 28); m.opacity(0); return m; });
  moths.forEach((m) => layer.add(m));

  yield* sequence(0.04, ...moths.map((m) => m.opacity(1, 0.45)));
  cap.text('Each one is a single moth. Look closely — no two are exactly alike.'); yield* cap.opacity(1, 0.5);
  yield* waitFor(1.2);

  // spotlight palest + darkest
  const order = shades.map((s, i) => ({s, i})).sort((a, b) => a.s - b.s);
  const pale = order[0].i, dark = order[order.length - 1].i;
  const ringP = new Circle({position: moths[pale].position(), size: 96, stroke: PALETTE.sage, lineWidth: 3, opacity: 0});
  const ringD = new Circle({position: moths[dark].position(), size: 96, stroke: PALETTE.rose, lineWidth: 3, opacity: 0});
  const labP = new Txt({position: [moths[pale].position().x, moths[pale].position().y - 70], fontFamily: MONO, fontSize: 24, fill: PALETTE.sage, text: 'palest', opacity: 0});
  const labD = new Txt({position: [moths[dark].position().x, moths[dark].position().y - 70], fontFamily: MONO, fontSize: 24, fill: PALETTE.rose, text: 'darkest', opacity: 0});
  view.add(ringP); view.add(ringD); view.add(labP); view.add(labD);
  yield* all(ringP.opacity(1, 0.5), ringD.opacity(1, 0.5), labP.opacity(1, 0.5), labD.opacity(1, 0.5));
  yield* cap.opacity(0, 0.25); cap.text('Some are pale as lichen, a few nearly black. That spread is the raw material.'); yield* cap.opacity(1, 0.45);
  yield* waitFor(1.8);
});
