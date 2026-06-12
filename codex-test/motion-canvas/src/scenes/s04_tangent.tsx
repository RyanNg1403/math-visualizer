import {makeScene2D, Circle, Latex, Line, Txt} from '@motion-canvas/2d';
import {all, createSignal, easeInOutSine, fadeTransition, waitFor} from '@motion-canvas/core';
import {PALETTE, MONO, addKicker, drawOn, fnLine, localF, localFp, makeAxes, makeCaption, mapper, slopeSegment} from '../lib';
import {sceneTitle} from './common';

export default makeScene2D(function* (view) {
  view.fill(PALETTE.bg);
  yield* fadeTransition(0.6);
  addKicker(view, '04 · term 1');
  sceneTitle(view, 'Add the slope: the tangent line appears');
  const say = makeCaption(view);
  const M = mapper([-2.4, 3.1], [-1.6, 3.1], {x: -660, y: -300, w: 1320, h: 630});
  const axes = makeAxes(M, {xticks: [-2, -1, 1, 2, 3], yticks: [-1, 1, 2], xlab: 'x', ylab: 'y'});
  const a = createSignal(0.4);
  const curve = fnLine(M, localF, -2.2, 2.8, PALETTE.blue, 7);
  const tangent = new Line({points: () => slopeSegment(M, a(), localF(a()), localFp(a()), -1.8, 2.6), stroke: PALETTE.yellow, lineWidth: 7, lineCap: 'round', end: 0, opacity: 0});
  const dot = new Circle({size: 26, fill: PALETTE.yellow, scale: 0, position: () => [M.X(a()), M.Y(localF(a()))]});
  const read = new Txt({text: () => `a = ${a().toFixed(2)}    slope f'(a) = ${localFp(a()).toFixed(2)}`, position: [-320, -360], fontFamily: MONO, fontSize: 30, fill: PALETTE.ink, opacity: 0});
  const eq = new Latex({tex: '\\textcolor{#e9e7df}{P_1(x)=f(a)+f\\prime(a)(x-a)}', position: [400, 180], width: 610, opacity: 0});
  view.add(axes.group); view.add(curve); view.add(tangent); view.add(dot); view.add(read); view.add(eq);

  yield* say('Height plus slope makes the best local line.');
  yield* axes.show(0.6);
  yield* drawOn(curve, 1.1);
  yield* all(dot.scale(1, 0.45), read.opacity(1, 0.6), drawOn(tangent, 1), eq.opacity(1, 0.7));
  yield* waitFor(0.8);
  yield* say('Move the center. The line is loyal only near its own point.');
  yield* a(1.25, 2.2, easeInOutSine);
  yield* a(-0.9, 2.7, easeInOutSine);
  yield* a(0.4, 1.8, easeInOutSine);
  yield* waitFor(1.2);
});
