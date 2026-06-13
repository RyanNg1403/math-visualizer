import {makeScene2D, Circle, Line, Txt} from '@motion-canvas/2d';
import {all, easeInOutCubic, fadeTransition, waitFor} from '@motion-canvas/core';
import {PALETTE, SERIF, addKicker, drawOn, fnLine, makeAxes, makeCaption, mapper, sinTaylor} from '../lib';
import {sceneTitle} from './common';

export default makeScene2D(function* (view) {
  view.fill(PALETTE.bg);
  addKicker(view, '01 · the promise');
  sceneTitle(view, 'A curved function can have a polynomial stunt double');
  const say = makeCaption(view);
  const M = mapper([-4.2, 4.2], [-2.4, 2.4], {x: -660, y: -210, w: 1320, h: 470});
  const axes = makeAxes(M, {xticks: [-3, -1, 1, 3], yticks: [-1, 1], xlab: 'x'});
  const curve = fnLine(M, Math.sin, -4, 4, PALETTE.blue, 7, 260);
  const poly = fnLine(M, x => sinTaylor(x, 7), -3.15, 3.15, PALETTE.yellow, 7, 260);
  const center = new Circle({size: 26, fill: PALETTE.yellow, position: [M.X(0), M.Y(0)], scale: 0});
  const word = new Txt({
    text: 'Taylor Series', y: -325, fontFamily: SERIF, fontSize: 96,
    fill: PALETTE.ink, opacity: 0,
  });
  view.add(axes.group); view.add(curve); view.add(poly); view.add(center); view.add(word);

  yield* fadeTransition(0.2);
  yield* say('The real curve is blue. The local stand-in is yellow.');
  yield* all(axes.show(0.6), word.opacity(1, 0.9));
  yield* drawOn(curve, 1.5, easeInOutCubic);
  yield* all(center.scale(1, 0.45), drawOn(poly, 1.8, easeInOutCubic));
  yield* waitFor(1.5);
});
