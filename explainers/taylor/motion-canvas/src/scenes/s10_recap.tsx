import {makeScene2D, Rect, Txt} from '@motion-canvas/2d';
import {all, fadeTransition, waitFor} from '@motion-canvas/core';
import {PALETTE, MONO, SERIF, addKicker, makeCaption} from '../lib';
import {sceneTitle} from './common';

function card(tag: string, title: string, body: string, x: number, color: string) {
  const g = new Rect({position: [x, 30], size: [430, 430], fill: '#131829', stroke: '#272e44', lineWidth: 2, radius: 8, opacity: 0});
  g.add(new Txt({text: tag.toUpperCase(), position: [-170, -155], offset: [-1, 0], fontFamily: MONO, fontSize: 20, letterSpacing: 4, fill: color}));
  g.add(new Txt({text: title, position: [-170, -105], offset: [-1, 0], fontFamily: SERIF, fontSize: 36, fontWeight: 600, fill: PALETTE.ink}));
  g.add(new Txt({text: body, position: [0, 80], width: 330, fontFamily: 'Karla', fontSize: 27, lineHeight: 38, fill: '#aab1c4', textWrap: true}));
  return g;
}

export default makeScene2D(function* (view) {
  view.fill(PALETTE.bg);
  yield* fadeTransition(0.6);
  addKicker(view, '10 · recap');
  sceneTitle(view, 'Taylor series: local truth, upgraded one derivative at a time');
  const say = makeCaption(view);
  const c1 = card('geometry', 'Touch the curve', 'Choose a center a. Match the value and the derivative clues there.', -470, PALETTE.blue);
  const c2 = card('computation', 'Replace by powers', 'Calculators, physics solvers, and simulations use local polynomials because they are easy to compute.', 0, PALETTE.yellow);
  const c3 = card('warning', 'Stay local', 'Far from the center, or beyond a singularity, the promise can break.', 470, PALETTE.red);
  view.add(c1); view.add(c2); view.add(c3);

  yield* say('A Taylor series is a polynomial trained on the local behavior of f.');
  yield* c1.opacity(1, 0.7);
  yield* waitFor(0.7);
  yield* say('That polynomial is useful because powers are cheap and predictable.');
  yield* c2.opacity(1, 0.7);
  yield* waitFor(0.7);
  yield* say('The final question is always: how far from a can I trust it?');
  yield* c3.opacity(1, 0.7);
  yield* waitFor(2.5);
  yield* all(c1.opacity(0.9, 0.3), c2.opacity(0.9, 0.3), c3.opacity(0.9, 0.3));
});
