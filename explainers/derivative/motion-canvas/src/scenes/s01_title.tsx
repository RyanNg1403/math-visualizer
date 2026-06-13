import {makeScene2D, Circle, Line, Txt} from '@motion-canvas/2d';
import {all, createSignal, easeInOutSine, easeInOutCubic, waitFor} from '@motion-canvas/core';
import {PALETTE, MONO, SERIF, mapper, fnLine, drawOn} from '../lib';

const f = (x: number) => 1.4 + 1.1 * Math.sin(x * 0.9 - 1);
const fp = (x: number) => 1.1 * 0.9 * Math.cos(x * 0.9 - 1);

export default makeScene2D(function* (view) {
  view.fill(PALETTE.bg);

  const M = mapper([-0.4, 9], [-0.8, 3.6], {x: -620, y: -40, w: 1240, h: 480});

  const over = new Txt({
    text: 'A VISUAL INTRODUCTION',
    y: -390, fontFamily: MONO, fontSize: 24, letterSpacing: 8,
    fill: PALETTE.dim, opacity: 0,
  });
  const title = new Txt({
    text: 'The Derivative', y: -270, fontFamily: SERIF, fontWeight: 300,
    fontSize: 130, fill: PALETTE.ink, opacity: 0,
  });
  const sub = new Txt({
    text: 'slopes, speed, and the mathematics of change',
    y: -170, fontFamily: SERIF, fontStyle: 'italic', fontSize: 38,
    fill: PALETTE.caption, opacity: 0,
  });

  const px = createSignal(0.7);
  const curve = fnLine(M, f, 0, 8.6, PALETTE.blue, 8);
  const tan = new Line({
    points: () => {
      const x = px(), y = f(x), m = fp(x), dx = 1.1;
      return [
        [M.X(x - dx), M.Y(y - m * dx)],
        [M.X(x + dx), M.Y(y + m * dx)],
      ] as [number, number][];
    },
    stroke: PALETTE.yellow, lineWidth: 5, lineCap: 'round', opacity: 0,
  });
  const pt = new Circle({
    size: 22, fill: PALETTE.yellow, opacity: 0,
    position: () => [M.X(px()), M.Y(f(px()))],
  });

  view.add(curve); view.add(tan); view.add(pt);
  view.add(over); view.add(title); view.add(sub);

  yield* all(over.opacity(1, 0.8), title.opacity(1, 1.2));
  yield* all(sub.opacity(1, 0.8), drawOn(curve, 2.0, easeInOutCubic));
  yield* all(tan.opacity(1, 0.4), pt.opacity(1, 0.4));
  yield* px(7.9, 4.5, easeInOutSine);
  yield* waitFor(0.9);
});
