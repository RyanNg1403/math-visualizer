import {makeScene2D, Latex, Rect, Txt} from '@motion-canvas/2d';
import {all, fadeTransition, waitFor} from '@motion-canvas/core';
import {PALETTE, MONO, addKicker, makeCaption} from '../lib';
import {sceneTitle} from './common';

export default makeScene2D(function* (view) {
  view.fill(PALETTE.bg);
  yield* fadeTransition(0.6);
  addKicker(view, '08 · the formula');
  sceneTitle(view, 'Taylor’s formula is the transcript of that matching');
  const say = makeCaption(view);
  const eq = new Latex({tex: '\\textcolor{#e9e7df}{f(x)\\approx\\sum_{k=0}^{n}\\frac{f^{(k)}(a)}{k!}(x-a)^k}', position: [-120, -110], width: 980, opacity: 0});
  const terms = new Latex({tex: '\\textcolor{#e9e7df}{\\textcolor{#ffd45e}{f(a)}+\\textcolor{#7fd483}{f\\prime(a)(x-a)}+\\textcolor{#c792ea}{\\frac{f\\prime\\prime(a)}{2!}(x-a)^2}+\\cdots}', position: [-80, 110], width: 1050, opacity: 0});
  const box = new Rect({position: [560, -125], size: [330, 180], fill: '#171c2c', stroke: '#2a3147', lineWidth: 2, radius: 8, opacity: 0});
  const note = new Txt({text: 'center: a\ndegree: n\nlocal coordinate: x-a', position: [560, -125], fontFamily: MONO, fontSize: 28, lineHeight: 44, fill: PALETTE.ink, opacity: 0});
  view.add(eq); view.add(terms); view.add(box); view.add(note);

  yield* say('The center is a; the powers measure distance from that center.');
  yield* eq.opacity(1, 1.0);
  yield* waitFor(1.0);
  yield* say('Each derivative buys one more power of x-a.');
  yield* all(terms.opacity(1, 0.9), box.opacity(1, 0.7), note.opacity(1, 0.7));
  yield* waitFor(1.0);
  yield* say('When n grows without bound, the Taylor polynomial becomes a Taylor series.');
  yield* waitFor(2.0);
});
