import {makeScene2D, Txt, Node, Circle} from '@motion-canvas/2d';
import {waitFor, all, fadeTransition, easeInOutSine, ThreadGenerator} from '@motion-canvas/core';
import {PALETTE, SERIF, MONO, makeBark, placeMoth, makeShades, scatter, conspicuous, bird, BARK} from '../lib';

export default makeScene2D(function* (view) {
  view.fill(PALETTE.bg);
  yield* fadeTransition(0.6);

  view.add(new Txt({text: '04 · SELECTION — THE BIRD', position: [-740, -480], offset: [-1, 0], fontFamily: MONO, fontSize: 22, letterSpacing: 5, fill: PALETTE.gold, opacity: 0.85}));
  view.add(new Txt({text: 'A bird that hunts by sight edits the population', y: -420, fontFamily: SERIF, fontWeight: 500, fontSize: 46, fill: PALETTE.ink}));
  const cap = new Txt({y: 470, width: 1560, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontWeight: 300, fontSize: 38, fill: PALETTE.caption, opacity: 0});
  view.add(cap);

  const B = 0.16;
  const bark = makeBark(BARK, 0.42); bark.setDarkness(B); view.add(bark.rect);
  const layer = new Node({}); view.add(layer);
  const shades = makeShades(28, 0.34, 0.19, 5); shades[3] = 0.86; shades[19] = 0.8;
  const pos = scatter(28, {x: BARK.x + 50, y: BARK.y + 70, w: BARK.w - 100, h: BARK.h - 120}, 5);
  const moths = pos.map((p, i) => placeMoth(shades[i], p.x, p.y, 28));
  moths.forEach((m) => layer.add(m));

  const total = moths.length;
  const read = new Txt({position: [690, -430], fontFamily: MONO, fontSize: 30, fill: PALETTE.ink, opacity: 0, text: ''});
  view.add(read);

  const b = bird(); b.scale(40); b.position([-1100, -180]); view.add(b);

  function* flyTo(x: number, y: number, dur: number): ThreadGenerator {
    const from = b.position();
    const rot = Math.atan2(y - from.y, x - from.x) * 180 / Math.PI + 90;
    yield* all(b.rotation(rot, Math.min(dur, 0.35)), b.position([x, y], dur, easeInOutSine));
  }

  cap.text('A hungry bird arrives. It searches the bark for anything that breaks the pattern.'); yield* cap.opacity(1, 0.5);
  yield* b.opacity(1, 0.4);
  yield* flyTo(-300, -120, 0.9);
  yield* flyTo(380, -160, 1.0);
  yield* waitFor(0.4);

  // the cull
  const doomed = shades.map((s, i) => ({c: conspicuous(s, B), i})).filter((d) => d.c > 0.4).map((d) => d.i);
  let eaten = 0;
  read.text(`eaten 0    survived ${total}`); yield* read.opacity(1, 0.4);
  yield* cap.opacity(0, 0.25); cap.text('It eats what it can see. The hidden ones live to breed.'); yield* cap.opacity(1, 0.45);
  for (const idx of doomed) {
    const p = moths[idx].position();
    yield* flyTo(p.x, p.y - 6, 0.7);
    yield* all(moths[idx].opacity(0, 0.3), moths[idx].scale(10, 0.3));
    eaten++;
    read.text(`eaten ${eaten}    survived ${total - eaten}`);
    yield* waitFor(0.12);
  }
  yield* flyTo(1300, -200, 0.8);
  yield* b.opacity(0, 0.3);
  yield* cap.opacity(0, 0.25); cap.text('Every moth it spotted is gone. The camouflaged ones never get noticed.'); yield* cap.opacity(1, 0.45);
  yield* waitFor(1.8);
});
