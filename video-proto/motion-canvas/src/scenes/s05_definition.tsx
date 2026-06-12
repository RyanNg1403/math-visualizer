import {makeScene2D, Circle, Line, Txt, Latex} from '@motion-canvas/2d';
import {
  all, createSignal, easeInOutCubic, easeInOutSine, easeOutBack,
  fadeTransition, waitFor,
} from '@motion-canvas/core';
import {PALETTE, mapper, makeAxes, fnLine, drawOn, slopeSegment, makeCaption, addKicker} from '../lib';

const G5 = (x: number) => 0.12 * x * x + 0.6;

export default makeScene2D(function* (view) {
  view.fill(PALETTE.bg);
  yield* fadeTransition(0.6);

  addKicker(view, '05 · the definition, decoded');
  const say = makeCaption(view);

  const M = mapper([0, 7.4], [0, 4.6], {x: -800, y: -380, w: 860, h: 700});
  const axes = makeAxes(M, {});
  view.add(axes.group);

  const h = createSignal(2.5);
  const xa = 2;
  const slope = () => (G5(xa + h()) - G5(xa)) / h();

  const curve = fnLine(M, G5, 0.2, 5.5, '#d7d5cc', 7);
  const dashA = new Line({
    points: [[M.X(xa), M.Y(0)], [M.X(xa), M.Y(G5(xa))]],
    stroke: PALETTE.blue, lineWidth: 3, lineDash: [8, 9], end: 0,
  });
  const dashB = new Line({
    points: () => [[M.X(xa + h()), M.Y(0)], [M.X(xa + h()), M.Y(G5(xa + h()))]],
    stroke: PALETTE.green, lineWidth: 3, lineDash: [8, 9], end: 0,
  });
  const A = new Circle({size: 24, fill: PALETTE.blue, position: [M.X(xa), M.Y(G5(xa))], scale: 0});
  const B = new Circle({
    size: 24, fill: PALETTE.green, scale: 0,
    position: () => [M.X(xa + h()), M.Y(G5(xa + h()))],
  });
  const labA = new Latex({
    tex: '{\\color{#58c4dd} f(x)}', width: 92,
    position: [M.X(xa) - 10, M.Y(G5(xa)) - 52], opacity: 0,
  });
  const labB = new Latex({
    tex: '{\\color{#7fd483} f(x+h)}', width: 170,
    position: () => [M.X(xa + h()) + 40, M.Y(G5(xa + h())) - 52],
    opacity: 0,
  });
  const brkt = new Line({
    points: () => {
      const y = M.Y(0) + 46;
      return [
        [M.X(xa), y - 10], [M.X(xa), y],
        [M.X(xa + h()), y], [M.X(xa + h()), y - 10],
      ] as [number, number][];
    },
    stroke: PALETTE.yellow, lineWidth: 3, end: 0,
  });
  const labH = new Latex({
    tex: '{\\color{#ffd45e} h}', width: 26,
    position: () => [M.X(xa + h() / 2), M.Y(0) + 88], opacity: 0,
  });
  const secant = new Line({
    points: () => slopeSegment(M, xa, G5(xa), slope(), Math.max(0.3, xa - 1.4), Math.min(5.4, xa + h() + 1.6)),
    stroke: PALETTE.red, lineWidth: 5, lineCap: 'round', end: 0, opacity: 0,
  });

  // the formula, assembled piece by piece
  const eqHead = new Latex({
    tex: "{\\color{#e9e7df} f'(x)\\;=}", width: 170, position: [240, -140], opacity: 0,
  });
  const eqLim = new Latex({
    tex: '\\textcolor{#e9e7df}{\\lim_{h\\to 0}}', width: 110, position: [410, -132], opacity: 0,
  });
  const eqFrac = new Latex({
    tex: '\\textcolor{#e9e7df}{\\frac{\\textcolor{#7fd483}{f(x+h)}-\\textcolor{#58c4dd}{f(x)}}{\\textcolor{#ffd45e}{h}}}',
    width: 360, position: [680, -140], opacity: 0,
  });

  view.add(curve); view.add(dashA); view.add(dashB); view.add(brkt);
  view.add(secant); view.add(A); view.add(B);
  view.add(labA); view.add(labB); view.add(labH);
  view.add(eqHead); view.add(eqLim); view.add(eqFrac);

  yield* say('The famous formula — every symbol is something you can point at.');
  yield* axes.show(0.5);
  yield* drawOn(curve, 1.2, easeInOutCubic);
  yield* dashA.end(1, 0.4);
  yield* all(A.scale(1, 0.4, easeOutBack), labA.opacity(1, 0.5), eqHead.opacity(1, 0.7));
  yield* say('f(x) — the height at x.');
  yield* waitFor(0.8);

  yield* dashB.end(1, 0.4);
  yield* all(B.scale(1, 0.4, easeOutBack), labB.opacity(1, 0.5));
  yield* brkt.end(1, 0.5);
  yield* labH.opacity(1, 0.4);
  yield* say('A step h to the right — height f(x+h).');
  yield* waitFor(0.8);

  secant.opacity(1);
  yield* secant.end(1, 0.8, easeInOutCubic);
  yield* eqFrac.opacity(1, 0.9);
  yield* say('The fraction is just rise over run: the secant’s slope.');
  yield* waitFor(1.2);

  yield* eqLim.opacity(1, 0.8);
  yield* say('And lim h→0 is the move you just watched: secant becomes tangent.');
  yield* all(h(0.18, 3.2, easeInOutSine), labB.opacity(0, 2.2));
  yield* waitFor(1.8);
});
