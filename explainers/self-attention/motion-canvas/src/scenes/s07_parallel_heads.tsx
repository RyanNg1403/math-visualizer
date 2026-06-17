import {makeScene2D, Txt} from '@motion-canvas/2d';
import {all, createSignal, waitFor} from '@motion-canvas/core';
import {PALETTE, WORD_X, addKicker, beam, drawOn, makeCaption, sceneTitle, sentenceTokens} from '../lib';

export default makeScene2D(function* (view) {
  view.fill(PALETTE.bg);
  addKicker(view, '07 · all at once');
  sceneTitle(view, 'Every token can do this at the same time');
  const say = makeCaption(view);
  const head = createSignal(1);

  const words = sentenceTokens(undefined, -45, {1: PALETTE.blue, 5: PALETTE.green, 7: PALETTE.yellow});
  const colors = [PALETTE.purple, PALETTE.blue, PALETTE.green];
  const beams = words.map((_, i) => {
    const j = i === 0 ? 1 : Math.max(0, i - 1);
    const b = beam([WORD_X[i], -76], [WORD_X[j], -76], colors[i % 3], 3, 72 + (i % 3) * 28);
    b.opacity(() => i % 3 === head() ? 0.9 : 0.12);
    b.lineWidth(() => i % 3 === head() ? 6 : 1.5);
    return b;
  });
  const labels = [
    new Txt({text: 'head 1: grammar', x: -480, y: 185, fontFamily: 'IBM Plex Mono, monospace', fontSize: 30, fill: PALETTE.purple, opacity: () => head() === 0 ? 1 : 0.25}),
    new Txt({text: 'head 2: references', x: -25, y: 185, fontFamily: 'IBM Plex Mono, monospace', fontSize: 30, fill: PALETTE.blue, opacity: () => head() === 1 ? 1 : 0.25}),
    new Txt({text: 'head 3: properties', x: 455, y: 185, fontFamily: 'IBM Plex Mono, monospace', fontSize: 30, fill: PALETTE.green, opacity: () => head() === 2 ? 1 : 0.25}),
  ];

  words.forEach(t => view.add(t));
  beams.forEach(b => view.add(b));
  labels.forEach(l => view.add(l));

  yield* say('Self-attention is parallel: every word can update itself from context.');
  yield* all(...words.map(t => t.opacity(1, 0.45)));
  for (const b of beams) yield* drawOn(b, 0.08);
  yield* waitFor(0.8);

  yield* say('Real transformers use several heads: several ways of looking at once.');
  yield* all(...labels.map(l => l.opacity(1, 0.5)));
  yield* head(0, 1.0);
  yield* waitFor(0.7);
  yield* head(1, 1.0);
  yield* waitFor(0.7);
  yield* head(2, 1.0);
  yield* waitFor(8.0);
});
