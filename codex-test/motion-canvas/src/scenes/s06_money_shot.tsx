import {makeScene2D, Latex, Line, Txt} from '@motion-canvas/2d';
import {all, createSignal, easeInOutSine, fadeTransition, waitFor} from '@motion-canvas/core';
import {PALETTE, MONO, addKicker, drawOn, fnLine, makeAxes, makeCaption, mapper, sinTaylor} from '../lib';
import {sceneTitle} from './common';

function points(M: ReturnType<typeof mapper>, degree: number): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i <= 320; i++) {
    const x = -3.6 + 7.2 * i / 320;
    pts.push([M.X(x), M.Y(sinTaylor(x, degree))]);
  }
  return pts;
}

export default makeScene2D(function* (view) {
  view.fill(PALETTE.bg);
  yield* fadeTransition(0.6);
  addKicker(view, '06 · money shot');
  sceneTitle(view, 'Term by term, the polynomial hugs sin(x)');
  const say = makeCaption(view);
  const M = mapper([-4.2, 4.2], [-2.2, 2.2], {x: -675, y: -315, w: 1350, h: 650});
  const axes = makeAxes(M, {xticks: [-3, -1, 1, 3], yticks: [-1, 1], xlab: 'x', ylab: 'y'});
  const degree = createSignal(1);
  const curve = fnLine(M, Math.sin, -4, 4, PALETTE.blue, 7, 300);
  const poly = new Line({points: () => points(M, Math.round(degree())), stroke: PALETTE.yellow, lineWidth: 7, lineCap: 'round', lineJoin: 'round', end: 0, opacity: 0});
  const read = new Txt({text: () => `Taylor degree ${Math.round(degree())}    usable window widens`, position: [-265, -360], fontFamily: MONO, fontSize: 30, fill: PALETTE.ink, opacity: 0});
  const eq = new Latex({tex: '\\textcolor{#e9e7df}{x-\\frac{x^3}{3!}+\\frac{x^5}{5!}-\\frac{x^7}{7!}+\\cdots}', position: [420, 210], width: 610, opacity: 0});
  view.add(axes.group); view.add(curve); view.add(poly); view.add(read); view.add(eq);

  yield* say('Each odd degree spends one more derivative clue.');
  yield* axes.show(0.6);
  yield* drawOn(curve, 1.2);
  yield* all(drawOn(poly, 0.9), read.opacity(1, 0.6), eq.opacity(1, 0.7));
  yield* waitFor(0.8);
  yield* say('Now add terms one at a time — and watch the trusted window grow.');
  for (const d of [3, 5, 7, 9]) {
    yield* degree(d, 1.15, easeInOutSine);
    yield* waitFor(0.25);
  }
  yield* waitFor(2.0);
});
