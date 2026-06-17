import {Latex, makeScene2D, Txt} from '@motion-canvas/2d';
import {all, waitFor} from '@motion-canvas/core';
import {PALETTE, addKicker, makeCaption, sceneTitle} from '../lib';

export default makeScene2D(function* (view) {
  view.fill(PALETTE.bg);
  addKicker(view, '08 · formula');
  sceneTitle(view, 'The whole move in one line');
  const say = makeCaption(view);

  const formula = new Latex({
    tex: '\\textcolor{#e9e7df}{\\operatorname{Attention}(Q,K,V)=\\operatorname{softmax}\\!\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V}',
    y: -120,
    width: 1040,
    opacity: 0,
  });
  const q = new Txt({text: 'Q: what each token seeks', x: -500, y: 105, fontFamily: 'IBM Plex Mono, monospace', fontSize: 30, fill: PALETTE.yellow, opacity: 0});
  const k = new Txt({text: 'K: what each token offers', x: 0, y: 105, fontFamily: 'IBM Plex Mono, monospace', fontSize: 30, fill: PALETTE.blue, opacity: 0});
  const v = new Txt({text: 'V: what each token contributes', x: 515, y: 105, fontFamily: 'IBM Plex Mono, monospace', fontSize: 30, fill: PALETTE.green, opacity: 0});
  const paper = new Txt({text: '2017 paper: Attention Is All You Need', y: 240, fontFamily: 'IBM Plex Mono, monospace', fontSize: 32, fill: PALETTE.yellow, opacity: 0});
  const final = new Txt({
    text: 'Self-attention lets each token update itself using the context that matters.',
    y: 350,
    width: 1420,
    textAlign: 'center',
    fontFamily: 'Fraunces, Georgia, serif',
    fontSize: 42,
    fill: PALETTE.ink,
    opacity: 0,
  });

  view.add(formula); view.add(q); view.add(k); view.add(v); view.add(paper); view.add(final);

  yield* say('The formula is just the picture written compactly.');
  yield* formula.opacity(1, 1.0);
  yield* all(q.opacity(1, 0.6), k.opacity(1, 0.6), v.opacity(1, 0.6));
  yield* waitFor(1.0);

  yield* say('A word becomes precise by learning where to look.');
  yield* all(paper.opacity(1, 0.7), final.opacity(1, 0.9));
  yield* waitFor(8.8);
});
