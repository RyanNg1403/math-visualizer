import {makeScene2D, Circle, Line, Txt, Latex} from '@motion-canvas/2d';
import {
  all, createSignal, easeInOutSine, easeInOutCubic, easeOutCubic,
  fadeTransition, waitFor,
} from '@motion-canvas/core';
import {PALETTE, MONO, mapper, makeAxes, fnLine, drawOn, carS, makeCaption, addKicker} from '../lib';

export default makeScene2D(function* (view) {
  view.fill(PALETTE.bg);
  yield* fadeTransition(0.6);

  addKicker(view, '02 · the question');
  const say = makeCaption(view);

  const M = mapper([0, 8.7], [0, 138], {x: -680, y: -400, w: 1360, h: 740});
  const axes = makeAxes(M, {xticks: [2, 4, 6, 8], yticks: [40, 80, 120], xlab: 'time (s)', ylab: 'position (m)'});
  view.add(axes.group);

  const tt = createSignal(0);
  const curve = fnLine(M, carS, 0, 8, PALETTE.blue, 8);
  const car = new Circle({
    size: 24, fill: PALETTE.yellow, opacity: 0,
    position: () => [M.X(tt()), M.Y(carS(tt()))],
  });
  const read = new Txt({
    text: () => `t = ${tt().toFixed(1)} s   position = ${carS(tt()).toFixed(0)} m`,
    position: [220, -490], fontFamily: MONO, fontSize: 32, fill: PALETTE.ink, opacity: 0,
  });
  view.add(curve); view.add(car); view.add(read);

  yield* say('A car’s position, second by second.');
  yield* axes.show();
  yield* drawOn(curve, 1.8, easeInOutCubic);
  yield* all(car.opacity(1, 0.3), read.opacity(1, 0.3));
  yield* tt(8, 3.6, easeInOutSine);

  // the average: one straight chord, start to finish
  const chord = new Line({
    points: [[M.X(0), M.Y(0)], [M.X(8), M.Y(120)]],
    stroke: PALETTE.green, lineWidth: 4, lineDash: [10, 12], end: 0,
  });
  const avgLab = new Txt({
    text: 'average: 15 m/s', position: [M.X(5.1), M.Y(60) + 76],
    fontFamily: MONO, fontSize: 30, fill: PALETTE.green, opacity: 0,
  });
  view.add(chord); view.add(avgLab);
  yield* say('120 meters in 8 seconds — the average is easy.');
  yield* chord.end(1, 1.0, easeInOutCubic);
  yield* avgLab.opacity(1, 0.5);
  yield* waitFor(1.2);

  // ...but what about the instant?
  const vline = new Line({
    points: [[M.X(3), M.Y(0)], [M.X(3), M.Y(carS(3))]],
    stroke: PALETTE.yellow, lineWidth: 3, lineDash: [8, 9], end: 0,
  });
  const dotA = new Circle({size: 26, fill: PALETTE.yellow, position: [M.X(3), M.Y(carS(3))], scale: 0});
  const ring = new Circle({
    size: 26, stroke: PALETTE.yellow, lineWidth: 3, fill: null,
    position: [M.X(3), M.Y(carS(3))], scale: 1, opacity: 0,
  });
  const q = new Latex({
    tex: '{\\color{#e9e7df}\\text{speed at exactly } t = 3\\,?}',
    position: [330, 40], width: 560, opacity: 0,
  });
  view.add(vline); view.add(dotA); view.add(ring); view.add(q);

  yield* say('But the average hides the moment. What happens at exactly t = 3?');
  yield* vline.end(1, 0.6);
  yield* dotA.scale(1, 0.4, easeOutCubic);
  yield* all(
    q.opacity(1, 0.8),
    (function* () {
      for (let k = 0; k < 2; k++) {
        ring.scale(1); ring.opacity(0.9);
        yield* all(ring.scale(2.6, 1.0), ring.opacity(0, 1.0));
      }
    })(),
  );
  yield* waitFor(1.4);
});
