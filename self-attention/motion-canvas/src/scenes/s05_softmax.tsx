import {Line, makeScene2D, Rect, Txt} from '@motion-canvas/2d';
import {all, createSignal, easeInOutSine, waitFor} from '@motion-canvas/core';
import {PALETTE, WORD_X, addKicker, beam, drawOn, makeCaption, sceneTitle, sentenceTokens} from '../lib';

function softmax2(a: number, b: number) {
  const ea = Math.exp(a);
  const eb = Math.exp(b);
  const z = ea + eb;
  return [ea / z, eb / z];
}

export default makeScene2D(function* (view) {
  view.fill(PALETTE.bg);
  addKicker(view, '05 · softmax');
  sceneTitle(view, 'Scores become weights');
  const say = makeCaption(view);

  const mix = createSignal(0);
  const scoreAnimal = () => 2.4 + (0.55 - 2.4) * mix();
  const scoreStreet = () => 0.65 + (2.45 - 0.65) * mix();
  const wAnimal = () => softmax2(scoreAnimal(), scoreStreet())[0];
  const wStreet = () => softmax2(scoreAnimal(), scoreStreet())[1];
  const words = sentenceTokens(undefined, -120, {1: PALETTE.blue, 5: PALETTE.green, 7: PALETTE.yellow});
  const animalBeam = beam([WORD_X[7], -150], [WORD_X[1], -150], PALETTE.blue, 5, 135);
  const streetBeam = beam([WORD_X[7], -150], [WORD_X[5], -150], PALETTE.green, 5, 100);
  animalBeam.lineWidth(() => 2 + 14 * wAnimal());
  streetBeam.lineWidth(() => 2 + 14 * wStreet());
  animalBeam.opacity(() => 0.22 + 0.78 * wAnimal());
  streetBeam.opacity(() => 0.22 + 0.78 * wStreet());

  const readA = new Txt({text: () => `animal score ${scoreAnimal().toFixed(2)}   weight ${wAnimal().toFixed(2)}`, x: -430, y: 58, fontFamily: 'IBM Plex Mono, monospace', fontSize: 28, fill: PALETTE.blue, opacity: 0});
  const readS = new Txt({text: () => `street score ${scoreStreet().toFixed(2)}   weight ${wStreet().toFixed(2)}`, x: 210, y: 58, fontFamily: 'IBM Plex Mono, monospace', fontSize: 28, fill: PALETTE.green, opacity: 0});
  const meterA = new Rect({x: -430, y: 120, width: () => 260 * wAnimal(), height: 16, offset: [-1, 0], radius: 8, fill: PALETTE.blue, opacity: 0});
  const meterS = new Rect({x: 210, y: 120, width: () => 260 * wStreet(), height: 16, offset: [-1, 0], radius: 8, fill: PALETTE.green, opacity: 0});
  const baseA = new Line({points: [[-430, 120], [-170, 120]], stroke: '#2c344b', lineWidth: 18, lineCap: 'round', opacity: 0});
  const baseS = new Line({points: [[210, 120], [470, 120]], stroke: '#2c344b', lineWidth: 18, lineCap: 'round', opacity: 0});
  const formula = new Txt({text: 'weights = softmax(scores)', x: 450, y: 245, fontFamily: 'IBM Plex Mono, monospace', fontSize: 32, fill: PALETTE.ink, opacity: 0});
  const context = new Txt({text: () => mix() < 0.5 ? 'context: too tired' : 'context: too wide', y: 305, fontFamily: 'IBM Plex Mono, monospace', fontSize: 30, fill: PALETTE.yellow, opacity: 0});

  words.forEach(t => view.add(t));
  view.add(animalBeam); view.add(streetBeam); view.add(readA); view.add(readS);
  view.add(baseA); view.add(baseS); view.add(meterA); view.add(meterS); view.add(formula); view.add(context);

  yield* say('Softmax turns raw matches into percentages that add to one.');
  yield* all(...words.map(t => t.opacity(1, 0.45)));
  animalBeam.end(1); streetBeam.end(1);
  yield* all(readA.opacity(1, 0.6), readS.opacity(1, 0.6), baseA.opacity(1, 0.5), baseS.opacity(1, 0.5), meterA.opacity(1, 0.5), meterS.opacity(1, 0.5), formula.opacity(1, 0.7), context.opacity(1, 0.7));
  yield* waitFor(0.8);

  yield* say('Change the context. The strongest beam changes.');
  yield* mix(1, 4.2, easeInOutSine);
  yield* waitFor(8.1);
});
