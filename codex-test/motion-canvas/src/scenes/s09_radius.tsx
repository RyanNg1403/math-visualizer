import {makeScene2D, Circle, Latex, Line, Txt} from '@motion-canvas/2d';
import {all, createSignal, easeInOutSine, fadeTransition, waitFor} from '@motion-canvas/core';
import {PALETTE, MONO, addKicker, drawOn, fnLine, makeAxes, makeCaption, mapper} from '../lib';
import {sceneTitle} from './common';

const F = (x: number) => 1 / (1 - x);
const P = (x: number, n: number) => {
  let s = 0;
  for (let k = 0; k <= n; k++) s += Math.pow(x, k);
  return s;
};
const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b);
function pPoints(M: ReturnType<typeof mapper>, n: number): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i <= 280; i++) {
    const x = -1.1 + 2.28 * i / 280;
    pts.push([M.X(x), M.Y(clamp(P(x, n), -1, 6))]);
  }
  return pts;
}

export default makeScene2D(function* (view) {
  view.fill(PALETTE.bg);
  yield* fadeTransition(0.6);
  addKicker(view, '09 · radius of trust');
  sceneTitle(view, 'A series has a local radius of trust');
  const say = makeCaption(view);
  const M = mapper([-1.2, 1.35], [-1, 6], {x: -660, y: -315, w: 1320, h: 650});
  const axes = makeAxes(M, {xticks: [-1, 0, 1], yticks: [1, 3, 5], xlab: 'x', ylab: 'y'});
  const x = createSignal(0.65);
  const curve = fnLine(M, F, -1.1, 0.86, PALETTE.blue, 7, 250);
  const wall = new Line({points: [[M.X(1), M.Y(-1)], [M.X(1), M.Y(6)]], stroke: PALETTE.red, lineWidth: 4, lineDash: [10, 12], end: 0, opacity: 0});
  const poly = new Line({points: pPoints(M, 12), stroke: PALETTE.yellow, lineWidth: 7, lineCap: 'round', lineJoin: 'round', end: 0, opacity: 0});
  const dot = new Circle({size: 25, fill: () => Math.abs(x()) < 1 ? PALETTE.yellow : PALETTE.red, scale: 0, position: () => [M.X(x()), M.Y(clamp(P(x(), 12), -1, 6))]});
  const read = new Txt({text: () => `x = ${x().toFixed(2)}    partial sum = ${P(x(), 12).toFixed(2)}    ${Math.abs(x()) < 1 ? 'inside radius' : 'outside radius'}`, position: [-140, -360], fontFamily: MONO, fontSize: 28, fill: () => Math.abs(x()) < 1 ? PALETTE.ink : PALETTE.red, opacity: 0});
  const eq = new Latex({tex: '\\textcolor{#e9e7df}{\\frac{1}{1-x}=1+x+x^2+x^3+\\cdots\\quad(|x|<1)}', position: [-80, 230], width: 680, opacity: 0});
  view.add(axes.group); view.add(curve); view.add(wall); view.add(poly); view.add(dot); view.add(read); view.add(eq);

  yield* say('For 1/(1-x), the wall at x = 1 limits the whole series.');
  yield* axes.show(0.6);
  yield* drawOn(curve, 1.2);
  yield* drawOn(wall, 0.6);
  yield* waitFor(0.7);
  yield* say('Inside the wall, the series chases the function.');
  yield* all(drawOn(poly, 1.1), dot.scale(1, 0.45), read.opacity(1, 0.6), eq.opacity(1, 0.8));
  yield* x(-0.75, 1.4, easeInOutSine);
  yield* x(0.8, 1.4, easeInOutSine);
  yield* waitFor(0.5);
  yield* say('Past x = 1, more terms do not rescue the approximation.');
  yield* x(1.12, 2.2, easeInOutSine);
  yield* waitFor(2.0);
});
