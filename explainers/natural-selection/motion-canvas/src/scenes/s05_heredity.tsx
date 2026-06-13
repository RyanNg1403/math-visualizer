import {makeScene2D, Txt, Node} from '@motion-canvas/2d';
import {sequence, waitFor, fadeTransition} from '@motion-canvas/core';
import {PALETTE, SERIF, MONO, makeBark, placeMoth, makeShades, scatter, mulberry32, gauss, clamp, BARK} from '../lib';

export default makeScene2D(function* (view) {
  view.fill(PALETTE.bg);
  yield* fadeTransition(0.6);

  view.add(new Txt({text: '05 · HEREDITY CARRIES IT ON', position: [-740, -480], offset: [-1, 0], fontFamily: MONO, fontSize: 22, letterSpacing: 5, fill: PALETTE.gold, opacity: 0.85}));
  view.add(new Txt({text: 'Survivors breed — and offspring resemble parents', y: -420, fontFamily: SERIF, fontWeight: 500, fontSize: 46, fill: PALETTE.ink}));
  const cap = new Txt({y: 470, width: 1560, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontWeight: 300, fontSize: 38, fill: PALETTE.caption, opacity: 0});
  view.add(cap);

  const bark = makeBark(BARK, 0.42); bark.setDarkness(0.16); view.add(bark.rect);
  const layer = new Node({}); view.add(layer);
  const shades = makeShades(16, 0.28, 0.13, 12);
  const pos = scatter(16, {x: BARK.x + 80, y: BARK.y + 90, w: BARK.w - 160, h: BARK.h - 220}, 12);
  const parents = pos.map((p, i) => placeMoth(shades[i], p.x, p.y, 30));
  parents.forEach((m) => layer.add(m));

  cap.text('These are the survivors — mostly pale. They pair off and lay eggs.'); yield* cap.opacity(1, 0.5);
  yield* waitFor(1.2);

  // offspring near each parent, similar shade + tiny variation
  const rng = mulberry32(31);
  const kidLayer = new Node({}); view.add(kidLayer);
  const kids = pos.map((p, i) => {
    const ks = clamp(shades[i] + gauss(rng) * 0.07, 0.03, 0.97);
    const k = placeMoth(ks, p.x + (rng() - 0.5) * 70, p.y + 70 + (rng() - 0.5) * 30, 22);
    k.opacity(0); return k;
  });
  kids.forEach((k) => kidLayer.add(k));
  yield* cap.opacity(0, 0.25); cap.text('Their offspring start life pale too — the head-start is inherited, not earned.'); yield* cap.opacity(1, 0.45);
  yield* sequence(0.05, ...kids.map((k) => k.opacity(1, 0.5)));
  yield* waitFor(1.8);
});
