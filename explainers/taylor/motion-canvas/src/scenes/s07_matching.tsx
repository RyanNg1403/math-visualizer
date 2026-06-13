import {makeScene2D, Latex, Line, Node, Rect, Txt} from '@motion-canvas/2d';
import {all, fadeTransition, waitFor} from '@motion-canvas/core';
import {PALETTE, MONO, SERIF, addKicker, drawOn, fnLine, makeAxes, makeCaption, mapper, sinTaylor} from '../lib';
import {sceneTitle} from './common';

export default makeScene2D(function* (view) {
  view.fill(PALETTE.bg);
  yield* fadeTransition(0.6);
  addKicker(view, '07 · matching derivatives');
  sceneTitle(view, 'The coefficients are forced by a matching game');
  const say = makeCaption(view);
  const poly = new Latex({tex: '\\textcolor{#e9e7df}{P(x)=c_0+c_1x+c_2x^2+c_3x^3+\\cdots}', position: [-415, -120], width: 720, opacity: 0});
  const table = new Node({position: [390, -80], opacity: 0});
  const rows = [['value', 'f(0)=0', 'P(0)=0'], ['slope', 'f′(0)=1', 'P′(0)=1'], ['curvature', 'f″(0)=0', 'P″(0)=0'], ['third bend', 'f‴(0)=-1', 'P‴(0)=-1']];
  table.add(new Rect({size: [520, 250], fill: '#171c2c', stroke: '#2a3147', lineWidth: 2, radius: 8}));
  rows.forEach((r, i) => {
    table.add(new Txt({text: r[0], position: [-205, -85 + i * 55], fontFamily: MONO, fontSize: 23, fill: PALETTE.dim, offset: [-1, 0]}));
    table.add(new Txt({text: r[1], position: [-40, -85 + i * 55], fontFamily: MONO, fontSize: 23, fill: PALETTE.blue, offset: [-1, 0]}));
    table.add(new Txt({text: r[2], position: [140, -85 + i * 55], fontFamily: MONO, fontSize: 23, fill: PALETTE.yellow, offset: [-1, 0]}));
  });
  const result = new Latex({tex: '\\textcolor{#e9e7df}{c_k=\\frac{f^{(k)}(0)}{k!}}', position: [-430, 170], width: 420, opacity: 0});
  const M = mapper([-2.4, 2.4], [-1.5, 1.5], {x: -580, y: 125, w: 500, h: 270});
  const axes = makeAxes(M, {xticks: [-2, 2], yticks: [-1, 1]});
  const curve = fnLine(M, Math.sin, -2.2, 2.2, PALETTE.blue, 5);
  const approx = fnLine(M, x => sinTaylor(x, 5), -2.2, 2.2, PALETTE.yellow, 5);
  const tag = new Txt({text: 'same local fingerprints', position: [-325, 355], fontFamily: SERIF, fontStyle: 'italic', fontSize: 28, fill: PALETTE.caption, opacity: 0});
  view.add(poly); view.add(table); view.add(result); view.add(axes.group); view.add(curve); view.add(approx); view.add(tag);

  yield* say('Pretend the polynomial has unknown coefficients.');
  yield* poly.opacity(1, 0.8);
  yield* waitFor(0.8);
  yield* say('At x = 0, make its value, slope, and higher slopes match sin(x).');
  yield* table.opacity(1, 0.8);
  yield* waitFor(1.0);
  yield* say('The factorial appears because differentiating x^k pulls down k(k-1)…1.');
  yield* all(result.opacity(1, 0.8), axes.show(0.5), drawOn(curve, 0.8), drawOn(approx, 1.0), tag.opacity(1, 0.8));
  yield* waitFor(1.8);
});
