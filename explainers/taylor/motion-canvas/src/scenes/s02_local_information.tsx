import {makeScene2D, Circle, Latex, Line, Txt} from '@motion-canvas/2d';
import {all, fadeTransition, waitFor} from '@motion-canvas/core';
import {PALETTE, MONO, addKicker, drawOn, fnLine, localF, localFp, makeAxes, makeCaption, mapper} from '../lib';
import {sceneTitle} from './common';

export default makeScene2D(function* (view) {
  view.fill(PALETTE.bg);
  yield* fadeTransition(0.6);
  addKicker(view, '02 · local information');
  sceneTitle(view, 'Taylor begins with one point, then asks for more clues');
  const say = makeCaption(view);
  const M = mapper([-2.4, 3.1], [-1.6, 3.1], {x: -660, y: -300, w: 1320, h: 630});
  const axes = makeAxes(M, {xticks: [-2, -1, 1, 2, 3], yticks: [-1, 1, 2], xlab: 'x', ylab: 'y'});
  const curve = fnLine(M, localF, -2.2, 2.8, PALETTE.blue, 7);
  const a = 0.4, y = localF(a);
  const vline = new Line({points: [[M.X(a), M.Y(0)], [M.X(a), M.Y(y)]], stroke: PALETTE.yellow, lineWidth: 4, lineDash: [10, 12], end: 0, opacity: 0});
  const dot = new Circle({size: 26, fill: PALETTE.yellow, position: [M.X(a), M.Y(y)], scale: 0});
  const read = new Txt({text: `center a = ${a.toFixed(1)}    height f(a) = ${y.toFixed(2)}`, position: [-350, -360], fontFamily: MONO, fontSize: 30, fill: PALETTE.ink, opacity: 0});
  const clues = new Latex({tex: '\\textcolor{#e9e7df}{\\text{clues at }a:\\quad f(a),\\; f\\prime(a),\\; f\\prime\\prime(a),\\ldots}', position: [390, 125], width: 620, opacity: 0});
  const slopeRead = new Txt({text: `first slope clue: f'(a) = ${localFp(a).toFixed(2)}`, position: [360, -340], fontFamily: MONO, fontSize: 28, fill: PALETTE.green, opacity: 0});
  view.add(axes.group); view.add(curve); view.add(vline); view.add(dot); view.add(read); view.add(clues); view.add(slopeRead);

  yield* say('One point gives one fact: the height f(a).');
  yield* axes.show(0.6);
  yield* drawOn(curve, 1.4);
  yield* all(drawOn(vline, 0.5), dot.scale(1, 0.45), read.opacity(1, 0.6));
  yield* waitFor(0.9);
  yield* say('Derivatives add more local facts: slope, bend, and the bend of the bend.');
  yield* all(clues.opacity(1, 0.7), slopeRead.opacity(1, 0.7));
  yield* waitFor(1.8);
});
