import {makeScene2D, Circle, Line, Txt, Latex, Node} from '@motion-canvas/2d';
import {
  all, createSignal, easeInOutCubic, easeOutCubic,
  fadeTransition, waitFor, ThreadGenerator,
} from '@motion-canvas/core';
import {PALETTE, MONO, mapper, makeAxes, fnLine, drawOn, LOSS, LOSSp, makeCaption, addKicker} from '../lib';

export default makeScene2D(function* (view) {
  view.fill(PALETTE.bg);
  yield* fadeTransition(0.6);

  addKicker(view, '09 · how machines learn');
  const say = makeCaption(view);

  const M = mapper([-3.5, 3.5], [0, 10], {x: -640, y: -430, w: 1280, h: 800});
  const axes = makeAxes(M, {xticks: [-2, 2]});
  view.add(axes.group);

  const bx = createSignal(2.6);
  const bowl = fnLine(M, LOSS, -3.05, 3.05, PALETTE.purple, 7);
  const ball = new Circle({
    size: 30, fill: PALETTE.red, scale: 0,
    position: () => [M.X(bx()), M.Y(LOSS(bx())) - 14],
  });
  const marks = new Node({});
  const loss = new Latex({
    tex: '{\\color{#e9e7df} \\text{loss } L(x)}', width: 180, position: [-700, -360], opacity: 0,
  });
  const rule = new Latex({
    tex: "{\\color{#e9e7df} x \\leftarrow x - \\eta\\, L'(x)}", width: 300, position: [560, -380], opacity: 0,
  });
  const etaLab = new Txt({
    text: '', fontFamily: MONO, fontSize: 34, fill: PALETTE.yellow,
    position: [560, -300], opacity: 0,
  });
  const status = new Txt({
    text: '', fontFamily: MONO, fontSize: 34, fill: PALETTE.green,
    position: [560, -230], opacity: 0,
  });
  view.add(bowl); view.add(marks); view.add(ball);
  view.add(loss); view.add(rule); view.add(etaLab); view.add(status);

  function* descend(eta: number, maxSteps: number): ThreadGenerator {
    for (let k = 0; k < maxSteps; k++) {
      const x = bx();
      const g = LOSSp(x);
      const nx = x - eta * g;
      marks.add(new Line({
        points: [[M.X(x), M.Y(0) + 12], [M.X(x), M.Y(0) + 26]],
        stroke: PALETTE.red, lineWidth: 3, opacity: 0.85,
      }));
      if (Math.abs(nx) > 3.35) {
        yield* bx(Math.sign(nx) * 3.05, 0.5, easeOutCubic);
        return;
      }
      yield* bx(nx, 0.55, easeInOutCubic);
      if (Math.abs(eta * LOSSp(bx())) < 0.015) return;
      yield* waitFor(0.12);
    }
  }

  yield* say('Machine learning, in one picture: the loss measures how wrong a model is.');
  yield* axes.show(0.5);
  yield* all(drawOn(bowl, 1.5, easeInOutCubic), loss.opacity(1, 0.9));
  yield* ball.scale(1, 0.5, easeOutCubic);
  yield* say('The ball is blind. It can only feel the slope under its feet.');
  yield* waitFor(1.0);

  yield* all(rule.opacity(1, 0.8), etaLab.opacity(1, 0.4), status.opacity(1, 0.4));
  etaLab.text('η = 0.35');
  yield* say('So it steps against the slope. Again and again. That is training.');
  yield* descend(0.35, 14);
  status.text('converged ✓');
  yield* waitFor(1.4);

  // round two: crank the learning rate
  yield* say('One danger: make the steps too bold, and every step overshoots the valley.');
  status.text(''); marks.removeChildren();
  yield* bx(1.8, 0.8, easeInOutCubic);
  etaLab.text('η = 2.20');
  yield* waitFor(0.4);
  yield* descend(2.2, 10);
  status.fill(PALETTE.red);
  status.text('diverged — η too big');
  yield* say('Step size is everything — every ML engineer learns this in week one.');
  yield* waitFor(2.0);
});
