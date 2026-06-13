import {makeScene2D, Circle, Line, Txt, Latex, Node} from '@motion-canvas/2d';
import {
  all,
  createSignal,
  easeInOutCubic,
  easeOutCubic,
  easeOutBack,
  waitFor,
} from '@motion-canvas/core';

// the car: position s(t) over 8 seconds (same curve as the HTML deck)
const s = (t: number) => {
  const u = Math.min(Math.max(t / 8, 0), 1);
  return 120 * u * u * (3 - 2 * u);
};

// math coords -> scene coords (origin center, y down)
const X = (t: number) => -760 + (t / 8.7) * 1500;
const Y = (v: number) => 390 - (v / 138) * 760;

const PALETTE = {
  bg: '#0b0e15',
  axis: '#5a6378',
  dim: '#69718a',
  blue: '#58c4dd',
  yellow: '#ffd45e',
  green: '#7fd483',
  ink: '#e9e7df',
};

export default makeScene2D(function* (view) {
  view.fill(PALETTE.bg);

  const h = createSignal(4);
  const slope = () => (s(3 + h()) - s(3)) / h();

  // secant through A=(3, s(3)), clipped to the plot area
  const secantPoints = () => {
    const m = slope();
    const fa = s(3);
    let u0 = 0.7, u1 = 7.1;
    const ys = (u: number) => fa + m * (u - 3);
    if (ys(u0) < 2) u0 = 3 + (2 - fa) / m;
    if (ys(u1) > 132) u1 = 3 + (132 - fa) / m;
    return [
      [X(u0), Y(ys(u0))],
      [X(u1), Y(ys(u1))],
    ] as [number, number][];
  };

  const xAxis = new Line({
    points: [[X(0) - 10, Y(0)], [X(8.7), Y(0)]],
    stroke: PALETTE.axis, lineWidth: 3, endArrow: true, arrowSize: 14, end: 0,
  });
  const yAxis = new Line({
    points: [[X(0), Y(0) + 10], [X(0), Y(140)]],
    stroke: PALETTE.axis, lineWidth: 3, endArrow: true, arrowSize: 14, end: 0,
  });

  const ticks = new Node({opacity: 0});
  for (const t of [2, 4, 6, 8]) {
    ticks.add(new Txt({
      text: `${t}`, position: [X(t), Y(0) + 36],
      fontFamily: 'IBM Plex Mono, monospace', fontSize: 26, fill: PALETTE.dim,
    }));
  }
  for (const v of [40, 80, 120]) {
    ticks.add(new Txt({
      text: `${v}`, position: [X(0) - 48, Y(v)],
      fontFamily: 'IBM Plex Mono, monospace', fontSize: 26, fill: PALETTE.dim,
    }));
  }

  const curvePts: [number, number][] = [];
  for (let i = 0; i <= 160; i++) {
    const t = (8 * i) / 160;
    curvePts.push([X(t), Y(s(t))]);
  }
  const curve = new Line({
    points: curvePts, stroke: PALETTE.blue, lineWidth: 7,
    lineCap: 'round', lineJoin: 'round', end: 0,
  });

  const secant = new Line({
    points: secantPoints, stroke: PALETTE.green, lineWidth: 5,
    lineCap: 'round', end: 0,
  });

  const A = new Circle({
    size: 26, fill: PALETTE.yellow, position: [X(3), Y(s(3))], scale: 0,
  });
  const B = new Circle({
    size: 22, fill: PALETTE.green, scale: 0,
    position: () => [X(3 + h()), Y(s(3 + h()))],
  });

  const readout = new Txt({
    text: () => `h = ${h().toFixed(2)} s   slope = ${slope().toFixed(2)} m/s`,
    position: [-360, -420], fontFamily: 'IBM Plex Mono, monospace',
    fontSize: 36, fill: PALETTE.ink, opacity: 0,
  });

  const formula = new Latex({
    tex: '{\\color{#e9e7df}\\text{slope}=\\frac{s(3+h)-s(3)}{h}}',
    position: [520, 180], width: 420, opacity: 0,
  });

  const tag = new Txt({
    text: 'limit: 21.1 m/s — the speed at t = 3',
    position: [340, 80], fontFamily: 'IBM Plex Mono, monospace',
    fontSize: 32, fill: PALETTE.yellow, opacity: 0,
  });

  view.add(ticks);
  view.add(xAxis); view.add(yAxis);
  view.add(curve); view.add(secant);
  view.add(A); view.add(B);
  view.add(readout); view.add(formula); view.add(tag);

  // --- the scene, Manim-style ---
  yield* all(xAxis.end(1, 0.7), yAxis.end(1, 0.7), ticks.opacity(1, 0.7));
  yield* curve.end(1, 1.4, easeInOutCubic);
  yield* all(A.scale(1, 0.4, easeOutBack), B.scale(1, 0.4, easeOutBack));
  yield* all(secant.end(1, 0.8), readout.opacity(1, 0.5), formula.opacity(1, 0.8));
  yield* waitFor(0.4);
  yield* h(0.05, 4.3, easeOutCubic);
  yield* all(secant.stroke(PALETTE.yellow, 0.5), tag.opacity(1, 0.6));
  yield* waitFor(1.6);
});
