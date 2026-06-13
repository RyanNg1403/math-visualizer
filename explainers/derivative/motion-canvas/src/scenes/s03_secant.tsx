import {makeScene2D, Circle, Line, Txt, Latex} from '@motion-canvas/2d';
import {
  all, createSignal, easeInOutCubic, easeOutBack,
  fadeTransition, waitFor,
} from '@motion-canvas/core';
import {
  PALETTE, MONO, mapper, makeAxes, fnLine, slopeSegment, carS, makeCaption, addKicker,
} from '../lib';

export default makeScene2D(function* (view) {
  view.fill(PALETTE.bg);
  yield* fadeTransition(0.6);

  addKicker(view, '03 · average rate of change');
  const say = makeCaption(view);

  const M = mapper([0, 8.7], [0, 138], {x: -680, y: -400, w: 1360, h: 740});
  const axes = makeAxes(M, {xticks: [2, 4, 6, 8], yticks: [40, 80, 120], xlab: 'time (s)'});
  view.add(axes.group);

  const a = createSignal(2);
  const b = createSignal(6);
  const slope = () => (carS(b()) - carS(a())) / (b() - a());

  const curve = fnLine(M, carS, 0, 8, PALETTE.blue, 8);
  const secant = new Line({
    points: () => slopeSegment(M, a(), carS(a()), slope(), a() - 1.3, b() + 1.3),
    stroke: PALETTE.green, lineWidth: 5, lineCap: 'round', end: 0, opacity: 0,
  });
  const run = new Line({
    points: () => [[M.X(a()), M.Y(carS(a()))], [M.X(b()), M.Y(carS(a()))]],
    stroke: PALETTE.yellow, lineWidth: 3, lineDash: [8, 9], end: 0,
  });
  const rise = new Line({
    points: () => [[M.X(b()), M.Y(carS(a()))], [M.X(b()), M.Y(carS(b()))]],
    stroke: PALETTE.red, lineWidth: 3, lineDash: [8, 9], end: 0,
  });
  const labDt = new Txt({
    text: 'Δt', fontFamily: MONO, fontSize: 30, fill: PALETTE.yellow, opacity: 0,
    position: () => [M.X((a() + b()) / 2), M.Y(carS(a())) + 36],
  });
  const labDs = new Txt({
    text: 'Δs', fontFamily: MONO, fontSize: 30, fill: PALETTE.red, opacity: 0,
    position: () => [M.X(b()) + 44, M.Y((carS(a()) + carS(b())) / 2)],
  });
  const mkPoint = (sig: () => number, name: string) => {
    const g = new Circle({
      size: 26, fill: PALETTE.yellow, scale: 0,
      position: () => [M.X(sig()), M.Y(carS(sig()))],
    });
    const t = new Txt({
      text: name, fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 32,
      fill: PALETTE.ink, position: () => [M.X(sig()), M.Y(carS(sig())) - 38], opacity: 0,
    });
    return {g, t};
  };
  const A = mkPoint(() => a(), 'A');
  const B = mkPoint(() => b(), 'B');
  const read = new Txt({
    text: () => `Δs/Δt = ${(carS(b()) - carS(a())).toFixed(0)} m / ${(b() - a()).toFixed(1)} s = ${slope().toFixed(1)} m/s`,
    position: [-180, -430], fontFamily: MONO, fontSize: 32, fill: PALETTE.green, opacity: 0,
  });
  const eq = new Latex({
    tex: '{\\color{#e9e7df}\\text{avg speed}=\\frac{\\Delta s}{\\Delta t}=\\frac{s(B)-s(A)}{B-A}}',
    position: [430, 170], width: 540, opacity: 0,
  });

  view.add(curve); view.add(secant); view.add(run); view.add(rise);
  view.add(labDt); view.add(labDs);
  view.add(A.g); view.add(A.t); view.add(B.g); view.add(B.t);
  view.add(read); view.add(eq);

  yield* say('Pick two moments. They make a secant line.');
  yield* axes.show(0.5);
  curve.end(1); curve.opacity(1);
  yield* all(A.g.scale(1, 0.45, easeOutBack), B.g.scale(1, 0.45, easeOutBack),
    A.t.opacity(1, 0.45), B.t.opacity(1, 0.45));
  secant.opacity(1);
  yield* secant.end(1, 1.0, easeInOutCubic);

  yield* say('Its slope — Δs over Δt — is the average speed between them.');
  yield* run.end(1, 0.5); yield* labDt.opacity(1, 0.3);
  yield* rise.end(1, 0.5); yield* labDs.opacity(1, 0.3);
  yield* all(read.opacity(1, 0.5), eq.opacity(1, 0.8));
  yield* waitFor(1.0);

  // ghost interaction: move the two moments around, the slope follows
  yield* say('Move the moments — the slope follows.');
  yield* all(a(1.2, 1.4, easeInOutCubic), b(7.4, 1.4, easeInOutCubic));
  yield* waitFor(0.5);
  yield* all(a(3.4, 1.4, easeInOutCubic), b(4.6, 1.4, easeInOutCubic));
  yield* say('And the closer they get, the more the line hugs the curve. Hold that thought.');
  yield* waitFor(1.6);
});
