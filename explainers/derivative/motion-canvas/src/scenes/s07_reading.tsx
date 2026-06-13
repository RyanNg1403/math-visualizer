import {makeScene2D, Circle, Txt} from '@motion-canvas/2d';
import {
  all, easeInOutCubic, easeOutBack, fadeTransition, waitFor,
} from '@motion-canvas/core';
import {PALETTE, MONO, mapper, makeAxes, fnLine, drawOn, F, makeCaption, addKicker} from '../lib';

export default makeScene2D(function* (view) {
  view.fill(PALETTE.bg);
  yield* fadeTransition(0.6);

  addKicker(view, '07 · reading a curve');
  const say = makeCaption(view);

  const M = mapper([-2.6, 2.6], [-2.2, 2.2], {x: -620, y: -420, w: 1240, h: 800});
  const axes = makeAxes(M, {xticks: [-2, -1, 1, 2], yticks: [-1, 1]});
  view.add(axes.group);

  const base = fnLine(M, F, -2.45, 2.45, '#4d5569', 7);
  const segUp1 = fnLine(M, F, -2.45, -1, PALETTE.green, 8);
  const segUp2 = fnLine(M, F, 1, 2.45, PALETTE.green, 8);
  const segDn = fnLine(M, F, -1, 1, PALETTE.red, 8);
  view.add(base); view.add(segUp1); view.add(segUp2); view.add(segDn);

  const pillStyle = {fontFamily: MONO, fontSize: 30, opacity: 0} as const;
  const pillUp = new Txt({...pillStyle, text: "f'(x) > 0 — climbing ↗", fill: PALETTE.green, position: [-470, -380]});
  const pillDn = new Txt({...pillStyle, text: "f'(x) < 0 — falling ↘", fill: PALETTE.red, position: [-480, -310]});
  const pillZr = new Txt({...pillStyle, text: "f'(x) = 0 — turning point", fill: PALETTE.yellow, position: [-450, -240]});
  view.add(pillUp); view.add(pillDn); view.add(pillZr);

  yield* say('You can now read any curve through its slope.');
  yield* axes.show(0.5);
  yield* drawOn(base, 1.4, easeInOutCubic);
  yield* waitFor(0.4);

  yield* say('Positive slope — climbing.');
  yield* all(drawOn(segUp1, 0.9), pillUp.opacity(1, 0.5));
  yield* drawOn(segUp2, 0.9);
  yield* waitFor(0.8);

  yield* say('Negative slope — falling.');
  yield* all(drawOn(segDn, 1.0), pillDn.opacity(1, 0.5));
  yield* waitFor(0.8);

  yield* say('And where the slope is exactly zero, the curve turns: peaks and valleys.');
  yield* pillZr.opacity(1, 0.5);
  for (const x of [-1, 1]) {
    const d = new Circle({size: 26, fill: PALETTE.yellow, position: [M.X(x), M.Y(F(x))], scale: 0});
    const ring = new Circle({
      size: 26, stroke: PALETTE.yellow, lineWidth: 3, fill: null,
      position: [M.X(x), M.Y(F(x))], opacity: 0,
    });
    const lab = new Txt({
      text: "f' = 0", fontFamily: MONO, fontSize: 28, fill: PALETTE.yellow, opacity: 0,
      position: [M.X(x), M.Y(F(x)) + (F(x) > 0 ? -52 : 52)],
    });
    view.add(d); view.add(ring); view.add(lab);
    yield* all(d.scale(1, 0.4, easeOutBack), lab.opacity(1, 0.4));
    ring.opacity(0.9);
    yield* all(ring.scale(2.4, 0.8), ring.opacity(0, 0.8));
  }
  yield* say('Maxima and minima live where f′ = 0 — the key to finding the best of anything.');
  yield* waitFor(2.0);
});
