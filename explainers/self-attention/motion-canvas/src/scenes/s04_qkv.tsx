import {makeScene2D, Txt} from '@motion-canvas/2d';
import {all, waitFor} from '@motion-canvas/core';
import {PALETTE, WORD_X, addKicker, beam, drawOn, makeCaption, sceneTitle, sentenceTokens, token} from '../lib';

export default makeScene2D(function* (view) {
  view.fill(PALETTE.bg);
  addKicker(view, '04 · matching');
  sceneTitle(view, 'Self-attention starts with a small matching game');
  const say = makeCaption(view);

  const words = sentenceTokens(undefined, 170, {1: PALETTE.blue, 5: PALETTE.green, 7: PALETTE.yellow});
  const query = token('query(it)', [WORD_X[7], -130], PALETTE.yellow, 148);
  const keyAnimal = token('key(animal)', [WORD_X[1], 0], PALETTE.blue, 168);
  const keyStreet = token('key(street)', [WORD_X[5], 0], PALETTE.green, 158);
  const beamAnimal = beam([WORD_X[7], -165], [WORD_X[1], -35], PALETTE.blue, 7, 64);
  const beamStreet = beam([WORD_X[7], -165], [WORD_X[5], -35], PALETTE.green, 7, 64);
  const defs = new Txt({
    text: 'query: what this word seeks\nkey: what another word offers',
    x: 610,
    y: -245,
    width: 520,
    textAlign: 'left',
    fontFamily: 'IBM Plex Mono, monospace',
    fontSize: 28,
    fill: PALETTE.caption,
    opacity: 0,
  });
  const scoreA = new Txt({text: 'score = q_it * k_animal', x: -430, y: 80, fontFamily: 'IBM Plex Mono, monospace', fontSize: 28, fill: PALETTE.blue, opacity: 0});
  const scoreS = new Txt({text: 'score = q_it * k_street', x: 170, y: 80, fontFamily: 'IBM Plex Mono, monospace', fontSize: 28, fill: PALETTE.green, opacity: 0});

  words.forEach(t => view.add(t));
  view.add(query); view.add(keyAnimal); view.add(keyStreet);
  view.add(beamAnimal); view.add(beamStreet); view.add(defs); view.add(scoreA); view.add(scoreS);

  yield* say('A query asks what kind of context this word is looking for.');
  yield* all(...words.map(t => t.opacity(1, 0.45)));
  yield* all(query.opacity(1, 0.55), defs.opacity(1, 0.7));
  yield* waitFor(0.9);

  yield* say('Keys answer: "I might be useful context." Dot products become scores.');
  yield* all(keyAnimal.opacity(1, 0.5), keyStreet.opacity(1, 0.5));
  yield* all(drawOn(beamAnimal, 1.0), drawOn(beamStreet, 1.0));
  yield* all(scoreA.opacity(1, 0.6), scoreS.opacity(1, 0.6));
  yield* waitFor(8.2);
});
