import {makeScene2D, Circle, Line, Rect, Txt, Node} from '@motion-canvas/2d';
import {all, easeOutCubic, fadeTransition, waitFor} from '@motion-canvas/core';
import {PALETTE, MONO, SERIF, makeCaption, addKicker} from '../lib';

function card(
  x: number, tagColor: string, tag: string, name: string, body: string,
  art: (g: Node) => void,
) {
  const g = new Node({position: [x, -60], opacity: 0});
  g.add(new Rect({width: 400, height: 520, radius: 18, fill: '#131829', stroke: '#272e44', lineWidth: 1.5}));
  g.add(new Txt({text: tag.toUpperCase(), y: -210, fontFamily: MONO, fontSize: 20, letterSpacing: 3, fill: tagColor}));
  g.add(new Txt({text: name, y: -150, fontFamily: SERIF, fontWeight: 600, fontSize: 44, fill: PALETTE.ink}));
  const artG = new Node({y: -30});
  art(artG);
  g.add(artG);
  g.add(new Txt({
    text: body, y: 150, width: 330, textWrap: true, textAlign: 'center',
    fontFamily: 'Karla, sans-serif', fontSize: 25, lineHeight: 35, fill: PALETTE.caption,
  }));
  return g;
}

export default makeScene2D(function* (view) {
  view.fill(PALETTE.bg);
  yield* fadeTransition(0.6);

  addKicker(view, '13 · one idea, every dimension');
  const say = makeCaption(view);

  const title = new Txt({
    text: 'What you now know', y: -430, fontFamily: SERIF, fontWeight: 600,
    fontSize: 60, fill: PALETTE.ink, opacity: 0,
  });
  view.add(title);

  const c1 = card(-690, PALETTE.blue, 'geometry', 'Slope',
    'The tangent line’s steepness,\ncaught at a single instant.',
    g => {
      g.add(new Line({points: [[-130, 55], [-50, 45], [30, -10], [140, -55]], stroke: PALETTE.blue, lineWidth: 5, radius: 36, lineCap: 'round'}));
      g.add(new Line({points: [[-55, 55], [110, -70]], stroke: PALETTE.yellow, lineWidth: 4}));
      g.add(new Circle({size: 15, fill: PALETTE.yellow, position: [26, -8]}));
    });
  const c2 = card(-230, PALETTE.green, 'rate of change', 'Speed',
    'The rate of any change:\nyour speedometer reads s′(t).',
    g => {
      g.add(new Circle({size: 160, stroke: '#3a4154', lineWidth: 9, fill: null, startAngle: 150, endAngle: 390}));
      g.add(new Line({points: [[0, 16], [58, -50]], stroke: PALETTE.green, lineWidth: 6, lineCap: 'round'}));
      g.add(new Circle({size: 17, fill: PALETTE.green, position: [0, 16]}));
    });
  const c3 = card(230, PALETTE.red, 'optimization', 'Direction',
    'The gradient ∇f points uphill —\nflip it and you train networks.',
    g => {
      const pts: [number, number][] = [];
      for (let i=0;i<=40;i++) { const x = -1.9 + (3.8*i)/40; pts.push([x*72, -55 + (2.4 - 0.55*x*x)*42]); }
      g.add(new Line({points: pts, stroke: PALETTE.purple, lineWidth: 5, lineCap: 'round'}));
      g.add(new Circle({size: 17, fill: PALETTE.red, position: [-100, 6]}));
      g.add(new Circle({size: 13, fill: PALETTE.red, position: [-52, 34], opacity: 0.75}));
      g.add(new Circle({size: 10, fill: PALETTE.red, position: [-12, 48], opacity: 0.5}));
    });
  const c4 = card(690, PALETTE.yellow, 'any dimension', 'Plane',
    'A tangent line becomes a tangent\nplane — the best flat fit, anywhere.',
    g => {
      g.add(new Line({points: [[-150, 35], [-110, 30], [-70, 8], [-32, -28]], stroke: PALETTE.blue, lineWidth: 4, radius: 26, lineCap: 'round'}));
      g.add(new Line({points: [[-122, 38], [-40, -34]], stroke: PALETTE.yellow, lineWidth: 3.5}));
      g.add(new Circle({size: 12, fill: PALETTE.yellow, position: [-82, 2]}));
      g.add(new Line({points: [[2, -10], [44, -10]], stroke: PALETTE.dim, lineWidth: 4, endArrow: true, arrowSize: 13}));
      g.add(new Line({points: [[72, 18], [112, -28], [152, 2]], stroke: PALETTE.blue, lineWidth: 4, radius: 18, lineCap: 'round'}));
      g.add(new Line({points: [[80, 38], [120, -4], [160, 26]], stroke: '#3f8fb0', lineWidth: 3, radius: 18, lineCap: 'round'}));
      g.add(new Line({points: [[86, -16], [158, -30], [174, 4], [102, 14]], closed: true, fill: 'rgba(255,212,94,0.18)', stroke: PALETTE.yellow, lineWidth: 2}));
      g.add(new Circle({size: 13, fill: PALETTE.yellow, position: [130, -6]}));
    });
  view.add(c1); view.add(c2); view.add(c3); view.add(c4);

  yield* all(title.opacity(1, 0.8), title.y(-440, 0.8));

  yield* say('Geometry: a slope.');
  yield* all(c1.opacity(1, 0.6), c1.y(-70, 0.6, easeOutCubic));
  yield* waitFor(0.5);

  yield* say('Physics: a rate.');
  yield* all(c2.opacity(1, 0.6), c2.y(-70, 0.6, easeOutCubic));
  yield* waitFor(0.5);

  yield* say('Optimization: a direction.');
  yield* all(c3.opacity(1, 0.6), c3.y(-70, 0.6, easeOutCubic));
  yield* waitFor(0.5);

  yield* say('And in any number of dimensions: a flat plane that just touches.');
  yield* all(c4.opacity(1, 0.6), c4.y(-70, 0.6, easeOutCubic));
  yield* waitFor(1.0);

  yield* say('One move — a line in 1D becomes a plane in many. That is the derivative.');
  yield* waitFor(3.0);
});
