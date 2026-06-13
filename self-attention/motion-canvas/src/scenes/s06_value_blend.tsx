import {makeScene2D, Txt} from '@motion-canvas/2d';
import {all, createSignal, easeInOutSine, waitFor} from '@motion-canvas/core';
import {PALETTE, addKicker, beam, drawOn, makeCaption, sceneTitle, token, vectorBars} from '../lib';

export default makeScene2D(function* (view) {
  view.fill(PALETTE.bg);
  addKicker(view, '06 · values');
  sceneTitle(view, 'The useful information gets mixed back in');
  const say = makeCaption(view);

  const mix = createSignal(0);
  const animalValue = token('animal value', [-430, -170], PALETTE.blue, 190);
  const streetValue = token('street value', [370, -170], PALETTE.green, 180);
  const updated = token('updated it', [-40, 145], PALETTE.yellow, 170);
  const barsA = vectorBars([0.82, 0.35, 0.7, 0.25, 0.58], [-505, -45], PALETTE.blue, 88);
  const barsS = vectorBars([0.22, 0.78, 0.31, 0.84, 0.42], [295, -45], PALETTE.green, 88);
  const barsU = vectorBars([0.7, 0.44, 0.63, 0.36, 0.55], [-115, 278], PALETTE.yellow, 76);
  const beamA = beam([-330, -35], [-40, 112], PALETTE.blue, 9, 95);
  const beamS = beam([315, -35], [-40, 112], PALETTE.green, 5, 95);
  beamA.lineWidth(() => 9 - 4 * mix());
  beamS.lineWidth(() => 5 + 5 * mix());
  beamA.opacity(() => 0.9 - 0.45 * mix());
  beamS.opacity(() => 0.45 + 0.45 * mix());
  const formula = new Txt({text: 'new meaning = sum(weight * value)', x: 470, y: 135, fontFamily: 'IBM Plex Mono, monospace', fontSize: 30, fill: PALETTE.ink, opacity: 0});
  const pred = new Txt({
    text: () => `next word\n tired ${(.72 + (.12 - .72) * mix()).toFixed(2)}\n wide  ${(.11 + (.70 - .11) * mix()).toFixed(2)}`,
    x: 610,
    y: 40,
    width: 360,
    textAlign: 'left',
    fontFamily: 'IBM Plex Mono, monospace',
    fontSize: 32,
    fill: PALETTE.caption,
    opacity: 0,
  });

  view.add(animalValue); view.add(streetValue); view.add(updated);
  view.add(barsA); view.add(barsS); view.add(barsU); view.add(beamA); view.add(beamS);
  view.add(formula); view.add(pred);

  yield* say('Values are the information each word contributes.');
  yield* all(animalValue.opacity(1, 0.55), streetValue.opacity(1, 0.55), barsA.opacity(1, 0.7), barsS.opacity(1, 0.7));
  yield* waitFor(0.8);

  yield* say('The weights decide the mixture, so it gets a sharper meaning.');
  yield* all(drawOn(beamA, 1.0), drawOn(beamS, 1.0), updated.opacity(1, 0.65), barsU.opacity(1, 0.65), formula.opacity(1, 0.7), pred.opacity(1, 0.7));
  yield* waitFor(1.0);

  yield* say('Change the context, and the prediction becomes precise in a different direction.');
  yield* mix(1, 3.8, easeInOutSine);
  yield* waitFor(8.2);
});
