import {makeScene2D, Circle, Line, Rect, Txt, Node} from '@motion-canvas/2d';
import {
  all, easeOutCubic, fadeTransition, waitFor,
} from '@motion-canvas/core';
import {PALETTE, MONO, SERIF, makeCaption, addKicker} from '../lib';

function card(
  x: number, tagColor: string, tag: string, name: string, body: string,
  art: (g: Node) => void,
) {
  const g = new Node({position: [x, -60], opacity: 0});
  g.add(new Rect({
    width: 420, height: 560, radius: 18, fill: '#131829',
    stroke: '#272e44', lineWidth: 1.5,
  }));
  g.add(new Txt({
    text: tag.toUpperCase(), y: -230, fontFamily: MONO, fontSize: 22,
    letterSpacing: 4, fill: tagColor,
  }));
  g.add(new Txt({
    text: name, y: -170, fontFamily: SERIF, fontWeight: 600, fontSize: 46, fill: PALETTE.ink,
  }));
  const artG = new Node({y: -40});
  art(artG);
  g.add(artG);
  const bodyT = new Txt({
    text: body, y: 150, width: 350, textWrap: true, textAlign: 'center',
    fontFamily: 'Karla, sans-serif', fontSize: 27, lineHeight: 38, fill: PALETTE.caption,
  });
  g.add(bodyT);
  return g;
}

export default makeScene2D(function* (view) {
  view.fill(PALETTE.bg);
  yield* fadeTransition(0.6);

  addKicker(view, '10 · one idea, three faces');
  const say = makeCaption(view);

  const title = new Txt({
    text: 'What you now know', y: -420, fontFamily: SERIF, fontWeight: 600,
    fontSize: 64, fill: PALETTE.ink, opacity: 0,
  });
  view.add(title);

  const c1 = card(-460, PALETTE.blue, 'geometry', 'Slope',
    'The tangent line’s steepness,\ncaught at a single instant.',
    g => {
      g.add(new Line({
        points: [[-150, 60], [-60, 50], [30, -10], [150, -60]],
        stroke: PALETTE.blue, lineWidth: 5, radius: 40, lineCap: 'round',
      }));
      g.add(new Line({
        points: [[-60, 60], [120, -75]], stroke: PALETTE.yellow, lineWidth: 4,
      }));
      g.add(new Circle({size: 16, fill: PALETTE.yellow, position: [28, -8]}));
    });
  const c2 = card(0, PALETTE.green, 'rate of change', 'Speed',
    'The rate of any change:\nyour speedometer reads s′(t).',
    g => {
      g.add(new Circle({
        size: 170, stroke: '#3a4154', lineWidth: 9, fill: null,
        startAngle: 150, endAngle: 390,
      }));
      g.add(new Line({
        points: [[0, 18], [62, -52]], stroke: PALETTE.green, lineWidth: 6, lineCap: 'round',
      }));
      g.add(new Circle({size: 18, fill: PALETTE.green, position: [0, 18]}));
    });
  const c3 = card(460, PALETTE.red, 'optimization', 'Direction',
    'Downhill, step by step —\nthe move that trains neural networks.',
    g => {
      const pts: [number, number][] = [];
      for (let i = 0; i <= 40; i++) {
        const x = -1.9 + (3.8 * i) / 40;
        pts.push([x * 80, -60 + (2.4 - 0.55 * x * x) * 45]);
      }
      g.add(new Line({points: pts, stroke: PALETTE.purple, lineWidth: 5, lineCap: 'round'}));
      g.add(new Circle({size: 18, fill: PALETTE.red, position: [-110, 8]}));
      g.add(new Circle({size: 14, fill: PALETTE.red, position: [-58, 38], opacity: 0.75}));
      g.add(new Circle({size: 11, fill: PALETTE.red, position: [-14, 52], opacity: 0.5}));
    });
  view.add(c1); view.add(c2); view.add(c3);

  yield* all(title.opacity(1, 0.8), title.y(-430, 0.8));

  yield* say('Geometry: a slope.');
  yield* all(c1.opacity(1, 0.6), c1.y(-70, 0.6, easeOutCubic));
  yield* waitFor(0.6);

  yield* say('Physics: a rate.');
  yield* all(c2.opacity(1, 0.6), c2.y(-70, 0.6, easeOutCubic));
  yield* waitFor(0.6);

  yield* say('And a compass: the direction to better.');
  yield* all(c3.opacity(1, 0.6), c3.y(-70, 0.6, easeOutCubic));
  yield* waitFor(1.2);

  yield* say('All three are one move — two points, slid together until average becomes instant.');
  yield* waitFor(3.0);
});
