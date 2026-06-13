import {makeScene2D, Txt, Node} from '@motion-canvas/2d';
import {waitFor, fadeTransition} from '@motion-canvas/core';
import {PALETTE, SERIF, MONO, makeBark, placeMoth, makeShades, scatter, evolveMoths, meanOf, BARK} from '../lib';

export default makeScene2D(function* (view) {
  view.fill(PALETTE.bg);
  yield* fadeTransition(0.6);

  view.add(new Txt({text: '06 · RUN THE LOOP', position: [-740, -480], offset: [-1, 0], fontFamily: MONO, fontSize: 22, letterSpacing: 5, fill: PALETTE.gold, opacity: 0.85}));
  view.add(new Txt({text: 'Generation after generation, the moths fade into the bark', y: -420, fontFamily: SERIF, fontWeight: 500, fontSize: 44, fill: PALETTE.ink}));
  const cap = new Txt({y: 470, width: 1560, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontWeight: 300, fontSize: 38, fill: PALETTE.caption, opacity: 0});
  view.add(cap);

  const B = 0.16;
  const bark = makeBark(BARK, 0.42); bark.setDarkness(B); view.add(bark.rect);
  const read = new Txt({position: [-660, -348], offset: [-1, 0], fontFamily: MONO, fontSize: 28, fill: PALETTE.ink, opacity: 0, text: ''});
  view.add(read);

  const N = 30;
  let shades = makeShades(N, 0.46, 0.2, 9); shades[2] = 0.85; shades[15] = 0.82;
  let gen = 0;
  let layer: Node | null = null;

  function build() {
    const lay = new Node({});
    const pos = scatter(N, {x: BARK.x + 50, y: BARK.y + 70, w: BARK.w - 100, h: BARK.h - 120}, 90 + gen * 13);
    shades.forEach((s, i) => lay.add(placeMoth(s, pos[i].x, pos[i].y, 26)));
    return lay;
  }
  const setRead = () => read.text(`generation ${gen}    avg shade ${meanOf(shades).toFixed(2)}`);

  layer = build(); view.add(layer); setRead();
  yield* read.opacity(1, 0.4);
  cap.text('Generation 0: a real mix, sitting on pale bark.'); yield* cap.opacity(1, 0.5);
  yield* waitFor(1.2);

  for (let g = 1; g <= 6; g++) {
    shades = evolveMoths(shades, {B, strength: 2.4, mutation: 0.06, seed: 200 + g}); gen = g;
    yield* layer!.opacity(0, 0.3);
    layer!.remove();
    layer = build(); layer.opacity(0); view.add(layer); setRead();
    yield* layer.opacity(1, 0.4);
    yield* waitFor(0.4);
  }
  yield* cap.opacity(0, 0.25); cap.text('Six generations on, almost the whole population melts into the bark. The moth evolved.'); yield* cap.opacity(1, 0.45);
  yield* waitFor(1.8);
});
