import {makeScene2D, Txt, Layout, Node} from '@motion-canvas/2d';
import {sequence, waitFor} from '@motion-canvas/core';
import {PALETTE, MONO, SERIF, makeBark, placeMoth, makeShades, scatter, BARK} from '../lib';

export default makeScene2D(function* (view) {
  view.fill(PALETTE.bg);

  const bark = makeBark(BARK, 0.21); bark.setDarkness(0.18);
  view.add(bark.rect);

  const layer = new Node({}); view.add(layer);
  const shades = makeShades(15, 0.30, 0.16, 7);
  const pos = scatter(15, {x: BARK.x + 70, y: BARK.y + 90, w: BARK.w - 140, h: BARK.h - 150}, 7);
  const moths = pos.map((p, i) => { const m = placeMoth(shades[i], p.x, p.y, 30); m.opacity(0); return m; });
  moths.forEach((m) => layer.add(m));

  const over = new Txt({text: 'A LIVING MODEL · NO BIOLOGY REQUIRED', y: -300, fontFamily: MONO, fontSize: 24, letterSpacing: 8, fill: PALETTE.gold, opacity: 0});
  const title = new Layout({y: -160, layout: true, gap: 0, opacity: 0});
  title.add(new Txt({text: 'Natural ', fontFamily: SERIF, fontWeight: 300, fontSize: 124, fill: PALETTE.ink}));
  title.add(new Txt({text: 'Selection', fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500, fontSize: 124, fill: PALETTE.gold}));
  const sub = new Txt({text: 'how a moth comes to match its tree — one generation at a time', y: -50, fontFamily: SERIF, fontStyle: 'italic', fontWeight: 300, fontSize: 40, fill: PALETTE.caption, opacity: 0});
  view.add(over); view.add(title); view.add(sub);

  yield* sequence(0.06, ...moths.map((m) => m.opacity(1, 0.6)));
  yield* over.opacity(1, 0.7);
  yield* title.opacity(1, 1.0);
  yield* sub.opacity(1, 0.7);
  yield* waitFor(1.6);
});
