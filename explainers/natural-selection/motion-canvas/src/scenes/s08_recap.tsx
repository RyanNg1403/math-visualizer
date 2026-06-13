import {makeScene2D, Txt, Rect, Node, Circle} from '@motion-canvas/2d';
import {all, waitFor, fadeTransition, easeOutCubic} from '@motion-canvas/core';
import {PALETTE, MONO, SERIF, placeMoth, barkColor} from '../lib';

export default makeScene2D(function* (view) {
  view.fill(PALETTE.bg);
  yield* fadeTransition(0.6);

  view.add(new Txt({text: '08 · THREE INGREDIENTS, ONE ENGINE', position: [-740, -480], offset: [-1, 0], fontFamily: MONO, fontSize: 22, letterSpacing: 5, fill: PALETTE.gold, opacity: 0.85}));
  view.add(new Txt({text: 'What you just watched', y: -400, fontFamily: SERIF, fontWeight: 500, fontSize: 54, fill: PALETTE.ink}));
  const cap = new Txt({y: 470, width: 1560, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontWeight: 300, fontSize: 38, fill: PALETTE.caption, opacity: 0});
  view.add(cap);

  const defs = [
    {tag: 'INGREDIENT ONE', name: 'Variation', accent: PALETTE.sage, body: 'Moths differ in shade. That range of coats is the raw material selection works with.',
      art: (n: Node) => { [0.12, 0.34, 0.56, 0.8].forEach((s, i) => n.add(placeMoth(s, -120 + i * 80, 6, 22))); }},
    {tag: 'INGREDIENT TWO', name: 'Selection', accent: PALETTE.rose, body: 'A bird hunting by sight removes the moths that stand out. Camouflage decides who survives.',
      art: (n: Node) => { n.add(placeMoth(0.2, -70, 6, 24)); n.add(new Circle({position: [80, 6], size: 78, stroke: PALETTE.rose, lineWidth: 3, lineDash: [6, 8]})); n.add(placeMoth(0.88, 80, 6, 24)); }},
    {tag: 'INGREDIENT THREE', name: 'Heredity', accent: PALETTE.gold, body: 'Offspring inherit a parent’s shade — so each generation’s camouflage is kept and built on.',
      art: (n: Node) => { n.add(placeMoth(0.22, -70, -6, 26)); n.add(placeMoth(0.26, 70, 14, 20)); }},
  ];

  const cards = defs.map((d, i) => {
    const x = (i - 1) * 560;
    const card = new Node({position: [x, 40], opacity: 0, y: 100});
    card.add(new Rect({size: [500, 460], radius: 22, fill: '#15211b', stroke: d.accent, lineWidth: 1.5}));
    card.add(new Rect({size: [500, 6], radius: 3, fill: d.accent, y: -227}));
    card.add(new Txt({text: d.tag, y: -160, fontFamily: MONO, fontSize: 22, letterSpacing: 4, fill: d.accent}));
    card.add(new Txt({text: d.name, y: -100, fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500, fontSize: 52, fill: PALETTE.ink}));
    const bark = new Rect({y: 0, size: [420, 96], radius: 10, fill: barkColor(0.18), clip: true});
    d.art(bark); card.add(bark);
    card.add(new Txt({text: d.body, y: 130, width: 430, textAlign: 'center', textWrap: true, fontFamily: SERIF, fontWeight: 300, fontSize: 27, lineHeight: 36, fill: PALETTE.caption}));
    view.add(card); return card;
  });

  const reveal = function* (i: number) { yield* all(cards[i].opacity(1, 0.6), cards[i].y(40, 0.6, easeOutCubic)); };
  cap.text('Start with variation — moths that differ.'); yield* cap.opacity(1, 0.5);
  yield* reveal(0);
  yield* cap.opacity(0, 0.25); cap.text('Add selection — a predator that sees mismatches.'); yield* cap.opacity(1, 0.45);
  yield* reveal(1);
  yield* cap.opacity(0, 0.25); cap.text('Keep it with heredity — and the population evolves to hide. No designer required.'); yield* cap.opacity(1, 0.45);
  yield* reveal(2);
  yield* waitFor(2.4);
});
