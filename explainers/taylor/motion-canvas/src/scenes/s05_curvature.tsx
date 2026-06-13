import {makeScene2D, Latex, Txt} from '@motion-canvas/2d';
import {all, fadeTransition, waitFor} from '@motion-canvas/core';
import {PALETTE, MONO, addKicker, drawOn, expTaylorLocal, fnLine, localF, makeAxes, makeCaption, mapper} from '../lib';
import {sceneTitle} from './common';

export default makeScene2D(function* (view) {
  view.fill(PALETTE.bg);
  yield* fadeTransition(0.6);
  addKicker(view, '05 · term 2');
  sceneTitle(view, 'Curvature is the next correction');
  const say = makeCaption(view);
  const M = mapper([-2.4, 3.1], [-1.6, 3.1], {x: -660, y: -300, w: 1320, h: 630});
  const axes = makeAxes(M, {xticks: [-2, -1, 1, 2, 3], yticks: [-1, 1, 2], xlab: 'x', ylab: 'y'});
  const a = 0.4;
  const curve = fnLine(M, localF, -2.2, 2.8, PALETTE.blue, 7);
  const p1 = fnLine(M, x => expTaylorLocal(x, a, 1), -1.5, 2.2, PALETTE.green, 5);
  const p2 = fnLine(M, x => expTaylorLocal(x, a, 2), -1.5, 2.2, PALETTE.yellow, 7);
  const eq = new Latex({tex: '\\textcolor{#e9e7df}{P_2(x)=f(a)+f\\prime(a)(x-a)+\\frac{f\\prime\\prime(a)}{2!}(x-a)^2}', position: [360, 190], width: 760, opacity: 0});
  const label = new Txt({text: 'linear vs quadratic', position: [-420, -355], fontFamily: MONO, fontSize: 28, fill: PALETTE.ink, opacity: 0});
  view.add(axes.group); view.add(curve); view.add(p1); view.add(p2); view.add(eq); view.add(label);

  yield* say('A tangent line misses the bend.');
  yield* axes.show(0.6);
  yield* drawOn(curve, 1.2);
  yield* drawOn(p1, 0.9);
  yield* waitFor(0.7);
  yield* say('The quadratic term bends with the function.');
  yield* all(drawOn(p2, 1.3), eq.opacity(1, 0.8), label.opacity(1, 0.7));
  yield* waitFor(1.8);
});
