import {makeScene2D, Txt} from '@motion-canvas/2d';
import {all, waitFor} from '@motion-canvas/core';
import {PALETTE, SERIF, WORD_X, addKicker, beam, drawOn, makeCaption, sceneTitle, sentenceTokens} from '../lib';

export default makeScene2D(function* (view) {
  view.fill(PALETTE.bg);
  addKicker(view, '01 · attention mechanism');
  sceneTitle(view, 'Attention means choosing what to look at');
  const say = makeCaption(view);

  const title = new Txt({
    text: 'The Attention Mechanism',
    y: -250,
    fontFamily: SERIF,
    fontSize: 112,
    fontWeight: 300,
    fill: PALETTE.ink,
    opacity: 0,
  });
  const subtitle = new Txt({
    text: 'how a model chooses the context that matters',
    y: -166,
    fontFamily: SERIF,
    fontStyle: 'italic',
    fontSize: 34,
    fill: PALETTE.caption,
    opacity: 0,
  });
  const tokens = sentenceTokens(undefined, 135, {
    1: PALETTE.blue,
    5: PALETTE.green,
    7: PALETTE.yellow,
  });
  const animalBeam = beam([WORD_X[7], 105], [WORD_X[1], 105], PALETTE.blue, 7, 155);
  const streetBeam = beam([WORD_X[7], 105], [WORD_X[5], 105], PALETTE.green, 7, 108);
  const prompt = new Txt({
    text: 'predict the next word after "too"',
    y: 270,
    fontFamily: 'IBM Plex Mono, monospace',
    fontSize: 30,
    fill: PALETTE.yellow,
    opacity: 0,
  });

  view.add(title); view.add(subtitle);
  tokens.forEach(t => view.add(t));
  view.add(animalBeam); view.add(streetBeam); view.add(prompt);

  yield* say('Attention is a way for a model to ask: what should I look at right now?');
  yield* all(title.opacity(1, 0.9), subtitle.opacity(1, 0.9));
  yield* all(...tokens.map(t => t.opacity(1, 0.55)));
  yield* prompt.opacity(1, 0.6);
  yield* waitFor(0.8);

  yield* say('In self-attention, words look at other words in the same sentence.');
  yield* all(drawOn(animalBeam, 1.1), drawOn(streetBeam, 1.1));
  yield* waitFor(8.0);
});
