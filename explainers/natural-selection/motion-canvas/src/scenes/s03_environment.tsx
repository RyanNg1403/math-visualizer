import {makeScene2D, Txt, Node, Circle} from '@motion-canvas/2d';
import {sequence, waitFor, all, fadeTransition} from '@motion-canvas/core';
import {PALETTE, SERIF, MONO, makeBark, placeMoth, makeShades, scatter, conspicuous, BARK} from '../lib';

export default makeScene2D(function* (view) {
  view.fill(PALETTE.bg);
  yield* fadeTransition(0.6);

  view.add(new Txt({text: '03 · THE BARK HAS AN OPINION', position: [-740, -480], offset: [-1, 0], fontFamily: MONO, fontSize: 22, letterSpacing: 5, fill: PALETTE.gold, opacity: 0.85}));
  view.add(new Txt({text: 'On pale bark, the dark moths give themselves away', y: -420, fontFamily: SERIF, fontWeight: 500, fontSize: 46, fill: PALETTE.ink}));
  const cap = new Txt({y: 470, width: 1560, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontWeight: 300, fontSize: 38, fill: PALETTE.caption, opacity: 0});
  view.add(cap);

  const B = 0.16;
  const bark = makeBark(BARK, 0.42); bark.setDarkness(B); view.add(bark.rect);
  const layer = new Node({}); view.add(layer);
  const shades = makeShades(28, 0.34, 0.19, 5); shades[3] = 0.86; shades[19] = 0.8;
  const pos = scatter(28, {x: BARK.x + 50, y: BARK.y + 70, w: BARK.w - 100, h: BARK.h - 120}, 5);
  const moths = pos.map((p, i) => placeMoth(shades[i], p.x, p.y, 28));
  moths.forEach((m) => layer.add(m));

  cap.text('A moth is safe only as long as it blends in.'); yield* cap.opacity(1, 0.5);
  yield* waitFor(1.0);
  yield* cap.opacity(0, 0.25); cap.text('Against pale bark, the well-matched moths nearly vanish.'); yield* cap.opacity(1, 0.45);
  yield* waitFor(1.0);

  // ring the conspicuous ones
  const rings = shades.map((s, i) => conspicuous(s, B) > 0.4 ? new Circle({position: moths[i].position(), size: 90, stroke: PALETTE.rose, lineWidth: 3, lineDash: [6, 8], opacity: 0}) : null).filter(Boolean) as Circle[];
  rings.forEach((r) => view.add(r));
  yield* all(...rings.map((r) => r.opacity(1, 0.5)));
  yield* cap.opacity(0, 0.25); cap.text('But a handful stand out. Camouflage is just matching your background.'); yield* cap.opacity(1, 0.45);
  yield* waitFor(1.8);
});
