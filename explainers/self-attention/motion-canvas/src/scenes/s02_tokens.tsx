import {makeScene2D, Txt} from '@motion-canvas/2d';
import {all, waitFor} from '@motion-canvas/core';
import {PALETTE, WORD_X, addKicker, makeCaption, sceneTitle, sentenceTokens, vectorBars} from '../lib';

export default makeScene2D(function* (view) {
  view.fill(PALETTE.bg);
  addKicker(view, '02 · tokens');
  sceneTitle(view, 'First, text becomes tokens');
  const say = makeCaption(view);

  const top = new Txt({
    text: 'A model does not receive a sentence as one object.',
    y: -245,
    fontFamily: 'Fraunces, Georgia, serif',
    fontSize: 42,
    fill: PALETTE.ink,
  });
  const tokens = sentenceTokens(undefined, -70, {
    1: PALETTE.blue,
    5: PALETTE.green,
    7: PALETTE.yellow,
  });
  const vectors = tokens.map((_, i) => vectorBars(
    [0.34 + (i % 3) * 0.11, 0.72 - (i % 4) * 0.07, 0.24 + (i % 5) * 0.08, 0.52 - (i % 2) * 0.14],
    [WORD_X[i] - 42, 160],
    i === 7 ? PALETTE.yellow : PALETTE.blue,
    54,
  ));
  const eq = new Txt({
    text: 'token -> vector',
    x: 540,
    y: 278,
    fontFamily: 'IBM Plex Mono, monospace',
    fontSize: 30,
    fill: PALETTE.caption,
    opacity: 0,
  });

  view.add(top);
  tokens.forEach(t => view.add(t));
  vectors.forEach(v => view.add(v));
  view.add(eq);

  yield* say('It first breaks text into tokens: small pieces, often words.');
  yield* all(...tokens.map(t => t.opacity(1, 0.6)));
  yield* waitFor(0.8);

  yield* say('Each token gets a vector, so geometry can carry meaning.');
  yield* all(...vectors.map(v => v.opacity(1, 0.75)), eq.opacity(1, 0.75));
  yield* waitFor(8.2);
});
