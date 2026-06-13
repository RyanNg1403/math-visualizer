import {makeScene2D, Circle, Line, Txt, Latex} from '@motion-canvas/2d';
import {
  all, createSignal, easeInOutCubic, easeInOutSine,
  fadeTransition, waitFor,
} from '@motion-canvas/core';
import {PALETTE, MONO, mapper, makeAxes, fnLine, drawOn, F, Fp, makeCaption, addKicker} from '../lib';

export default makeScene2D(function* (view) {
  view.fill(PALETTE.bg);
  yield* fadeTransition(0.6);

  addKicker(view, '06 · a new function');
  const say = makeCaption(view);

  const M1 = mapper([-2.4, 2.4], [-2, 2], {x: -540, y: -440, w: 1100, h: 380});
  const M2 = mapper([-2.4, 2.4], [-1.6, 4.2], {x: -540, y: 30, w: 1100, h: 380});
  const ax1 = makeAxes(M1, {xticks: [-2, -1, 1, 2]});
  const ax2 = makeAxes(M2, {xticks: [-2, -1, 1, 2], yticks: [2, 4]});
  view.add(ax1.group); view.add(ax2.group);

  const px = createSignal(-2.1);
  const curve = fnLine(M1, F, -2.25, 2.25, PALETTE.blue, 7);

  const tan = new Line({
    points: () => {
      const x = px(), y = F(x), m = Fp(x);
      const dx = Math.min(0.55, 1.0 / Math.max(1, Math.abs(m)));
      return [
        [M1.X(x - dx), M1.Y(y - m * dx)],
        [M1.X(x + dx), M1.Y(y + m * dx)],
      ] as [number, number][];
    },
    stroke: PALETTE.yellow, lineWidth: 5, lineCap: 'round', opacity: 0,
  });
  const p1 = new Circle({
    size: 20, fill: PALETTE.yellow, opacity: 0,
    position: () => [M1.X(px()), M1.Y(F(px()))],
  });
  const p2 = new Circle({
    size: 20, fill: PALETTE.purple, opacity: 0,
    position: () => [M2.X(px()), M2.Y(Fp(px()))],
  });
  const link = new Line({
    points: () => [[M1.X(px()), M1.Y(F(px()))], [M2.X(px()), M2.Y(Fp(px()))]],
    stroke: '#4d5569', lineWidth: 2, lineDash: [6, 8], opacity: 0,
  });
  const trail = new Line({
    points: () => {
      const pts: [number, number][] = [];
      for (let x = -2.1; x <= px() + 1e-9; x += 0.03) pts.push([M2.X(x), M2.Y(Fp(x))]);
      pts.push([M2.X(px()), M2.Y(Fp(px()))]);
      return pts;
    },
    stroke: PALETTE.purple, lineWidth: 7, lineCap: 'round', lineJoin: 'round', opacity: 0,
  });
  const read = new Txt({
    text: () => `slope = ${Fp(px()).toFixed(2)}`,
    position: [520, -430], fontFamily: MONO, fontSize: 34, fill: PALETTE.yellow, opacity: 0,
  });
  const lab1 = new Latex({
    tex: '{\\color{#e9e7df} f(x)=\\tfrac{x^3}{3}-x}',
    width: 230, position: [-740, -380], opacity: 0,
  });
  const lab2 = new Latex({
    tex: "{\\color{#c792ea} f'(x)}", width: 90, position: [-760, 80], opacity: 0,
  });
  const lab2b = new Latex({
    tex: '{\\color{#c792ea} =\\,x^2-1}', width: 160, position: [-730, 170], opacity: 0,
  });

  view.add(curve); view.add(link); view.add(trail); view.add(tan);
  view.add(p1); view.add(p2);
  view.add(read); view.add(lab1); view.add(lab2); view.add(lab2b);

  yield* say('Now measure the slope everywhere, and plot it below as a height.');
  yield* all(ax1.show(0.6), ax2.show(0.6), lab1.opacity(1, 0.8), lab2.opacity(1, 0.8));
  yield* drawOn(curve, 1.6, easeInOutCubic);
  yield* all(tan.opacity(1, 0.4), p1.opacity(1, 0.4), p2.opacity(1, 0.4),
    link.opacity(0.7, 0.4), trail.opacity(1, 0.3), read.opacity(1, 0.4));

  yield* px(2.1, 7.0, easeInOutSine);
  // freeze the trace into the complete f' curve before sweeping back
  const full: [number, number][] = [];
  for (let x = -2.1; x <= 2.1 + 1e-9; x += 0.02) full.push([M2.X(x), M2.Y(Fp(x))]);
  trail.points(full);
  yield* all(lab2b.opacity(1, 0.8));
  yield* say('The slopes trace a brand-new function: the derivative.');
  yield* waitFor(1.0);

  // sweep back to underline the correspondence: steep ↔ far from zero, flat ↔ zero
  yield* say('Steep above means far from zero below. Flat above means zero below.');
  yield* px(-1, 2.6, easeInOutSine);
  yield* waitFor(0.3);
  yield* px(1, 2.4, easeInOutSine);
  yield* waitFor(1.2);
});
