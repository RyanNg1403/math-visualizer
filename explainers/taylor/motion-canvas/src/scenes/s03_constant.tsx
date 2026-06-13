import {makeScene2D, Circle, Latex, Line, Txt} from '@motion-canvas/2d';
import {all, fadeTransition, waitFor} from '@motion-canvas/core';
import {PALETTE, MONO, addKicker, drawOn, fnLine, localF, makeAxes, makeCaption, mapper} from '../lib';
import {sceneTitle} from './common';

export default makeScene2D(function* (view) {
  view.fill(PALETTE.bg);
  yield* fadeTransition(0.6);
  addKicker(view, '03 · term 0');
  sceneTitle(view, 'First approximation: keep only the height');
  const say = makeCaption(view);
  const M = mapper([-2.4, 3.1], [-1.6, 3.1], {x: -660, y: -300, w: 1320, h: 630});
  const axes = makeAxes(M, {xticks: [-2, -1, 1, 2, 3], yticks: [-1, 1, 2], xlab: 'x', ylab: 'y'});
  const a = 0.4, y = localF(a);
  const curve = fnLine(M, localF, -2.2, 2.8, PALETTE.blue, 7);
  const p0 = new Line({points: [[M.X(-2.2), M.Y(y)], [M.X(2.8), M.Y(y)]], stroke: PALETTE.yellow, lineWidth: 6, lineCap: 'round', end: 0, opacity: 0});
  const dot = new Circle({size: 25, fill: PALETTE.yellow, position: [M.X(a), M.Y(y)], scale: 0});
  const eq = new Latex({tex: '\\textcolor{#e9e7df}{P_0(x)=f(a)}', position: [445, -55], width: 340, opacity: 0});
  const read = new Txt({text: 'matches height', position: [455, 80], fontFamily: MONO, fontSize: 28, fill: PALETTE.yellow, opacity: 0});
  view.add(axes.group); view.add(curve); view.add(p0); view.add(dot); view.add(eq); view.add(read);

  yield* say('The constant polynomial matches the height and nothing else.');
  yield* axes.show(0.6);
  yield* drawOn(curve, 1.2);
  yield* waitFor(0.4);
  yield* say('P0 gets the value right, but it has no direction.');
  yield* all(dot.scale(1, 0.45), drawOn(p0, 0.9), eq.opacity(1, 0.7), read.opacity(1, 0.7));
  yield* waitFor(1.8);
});
