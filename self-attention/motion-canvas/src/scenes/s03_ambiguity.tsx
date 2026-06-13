import {makeScene2D, Txt} from '@motion-canvas/2d';
import {all, waitFor} from '@motion-canvas/core';
import {PALETTE, addKicker, beam, drawOn, makeCaption, sceneTitle, sentenceTokens} from '../lib';

const xs11 = [-785, -640, -495, -360, -235, -90, 70, 225, 355, 480, 630];

export default makeScene2D(function* (view) {
  view.fill(PALETTE.bg);
  addKicker(view, '03 · ambiguity');
  sceneTitle(view, 'The same word can look in different places');
  const say = makeCaption(view);

  const tiredWords = ['The', 'animal', "didn't", 'cross', 'the', 'street', 'because', 'it', 'was', 'too', 'tired'];
  const wideWords = ['The', 'animal', "didn't", 'cross', 'the', 'street', 'because', 'it', 'was', 'too', 'wide'];
  const tired = sentenceTokens(tiredWords, -105, {1: PALETTE.blue, 5: PALETTE.green, 7: PALETTE.yellow, 10: PALETTE.blue}, xs11);
  const wide = sentenceTokens(wideWords, 145, {1: PALETTE.blue, 5: PALETTE.green, 7: PALETTE.yellow, 10: PALETTE.green}, xs11);
  const labelA = new Txt({text: 'case A', x: -800, y: -182, fontFamily: 'IBM Plex Mono, monospace', fontSize: 24, fill: PALETTE.dim, opacity: 0});
  const labelB = new Txt({text: 'case B', x: -800, y: 68, fontFamily: 'IBM Plex Mono, monospace', fontSize: 24, fill: PALETTE.dim, opacity: 0});
  const tiredBeam = beam([xs11[7], -135], [xs11[1], -135], PALETTE.blue, 8, 120);
  const wideBeam = beam([xs11[7], 115], [xs11[5], 115], PALETTE.green, 8, 120);
  const tiredTag = new Txt({text: 'it -> animal', x: -430, y: -285, fontFamily: 'IBM Plex Mono, monospace', fontSize: 28, fill: PALETTE.blue, opacity: 0});
  const wideTag = new Txt({text: 'it -> street', x: 370, y: -6, fontFamily: 'IBM Plex Mono, monospace', fontSize: 28, fill: PALETTE.green, opacity: 0});

  view.add(labelA); view.add(labelB);
  tired.forEach(t => view.add(t));
  wide.forEach(t => view.add(t));
  view.add(tiredBeam); view.add(wideBeam); view.add(tiredTag); view.add(wideTag);

  yield* say('If the next word is tired, the useful context is animal.');
  yield* all(labelA.opacity(1, 0.4), ...tired.map(t => t.opacity(1, 0.55)));
  yield* all(drawOn(tiredBeam, 1.0), tiredTag.opacity(1, 0.6));
  yield* waitFor(1.1);

  yield* say('If the next word is wide, the useful context is street.');
  yield* all(labelB.opacity(1, 0.4), ...wide.map(t => t.opacity(1, 0.55)));
  yield* all(drawOn(wideBeam, 1.0), wideTag.opacity(1, 0.6));
  yield* waitFor(8.2);
});
