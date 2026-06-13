import {makeScene2D, Circle, Line, Txt, Latex} from '@motion-canvas/2d';
import {
  all, createSignal, easeInOutCubic, easeOutCubic, easeOutBack,
  fadeTransition, waitFor,
} from '@motion-canvas/core';
import {
  PALETTE, MONO, mapper, makeAxes, fnLine, slopeSegment, carS, carV, makeCaption, addKicker,
} from '../lib';

export default makeScene2D(function* (view) {
  view.fill(PALETTE.bg);
  yield* fadeTransition(0.6);

  addKicker(view, '04 · the limit');
  const say = makeCaption(view);

  const M = mapper([0, 8.7], [0, 138], {x: -680, y: -400, w: 1360, h: 740});
  const axes = makeAxes(M, {xticks: [2, 4, 6, 8], yticks: [40, 80, 120], xlab: 'time (s)'});
  view.add(axes.group);

  const h = createSignal(4);
  const slope = () => (carS(3 + h()) - carS(3)) / h();

  const curve = fnLine(M, carS, 0, 8, PALETTE.blue, 8);
  const secant = new Line({
    points: () => slopeSegment(M, 3, carS(3), slope(), 0.6, 7.2),
    stroke: PALETTE.green, lineWidth: 5, lineCap: 'round', end: 0, opacity: 0,
  });
  const A = new Circle({size: 26, fill: PALETTE.yellow, position: [M.X(3), M.Y(carS(3))], scale: 0});
  const B = new Circle({
    size: 22, fill: PALETTE.green, scale: 0,
    position: () => [M.X(3 + h()), M.Y(carS(3 + h()))],
  });
  const read = new Txt({
    text: () => `h = ${h().toFixed(2)} s   slope = ${slope().toFixed(2)} m/s`,
    position: [-280, -430], fontFamily: MONO, fontSize: 34, fill: PALETTE.ink, opacity: 0,
  });
  const eq = new Latex({
    tex: '{\\color{#e9e7df}\\text{slope}=\\frac{s(3+h)-s(3)}{h}}',
    position: [460, 180], width: 420, opacity: 0,
  });
  const tag = new Txt({
    text: () => `limit: ${carV(3).toFixed(1)} m/s — the speed at t = 3`,
    position: [350, 60], fontFamily: MONO, fontSize: 32, fill: PALETTE.yellow, opacity: 0,
  });

  view.add(curve); view.add(secant); view.add(A); view.add(B);
  view.add(read); view.add(eq); view.add(tag);

  yield* say('Fix A at t = 3. The second point sits a step h later.');
  yield* axes.show(0.5);
  curve.end(1); curve.opacity(1);
  yield* all(A.scale(1, 0.45, easeOutBack), B.scale(1, 0.45, easeOutBack));
  secant.opacity(1);
  yield* all(secant.end(1, 0.9, easeInOutCubic), read.opacity(1, 0.6), eq.opacity(1, 0.9));
  yield* waitFor(0.8);

  yield* say('Now shrink h — and watch the slope number.');
  yield* h(0.05, 5.5, easeOutCubic);
  yield* waitFor(0.4);

  yield* say('It doesn’t vanish. It settles — on the speed at this very instant.');
  yield* all(secant.stroke(PALETTE.yellow, 0.6), secant.lineWidth(7, 0.6), tag.opacity(1, 0.7));
  yield* waitFor(2.2);
});
