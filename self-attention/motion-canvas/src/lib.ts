import {Line, Node, Rect, Txt, View2D} from '@motion-canvas/2d';
import {all, ThreadGenerator} from '@motion-canvas/core';

export const PALETTE = {
  bg: '#0b0e15',
  panel: '#121827',
  panel2: '#171c2c',
  axis: '#5a6378',
  dim: '#69718a',
  blue: '#58c4dd',
  yellow: '#ffd45e',
  green: '#7fd483',
  red: '#ff6f61',
  purple: '#c792ea',
  ink: '#e9e7df',
  caption: '#b9c0d2',
};

export const MONO = 'IBM Plex Mono, monospace';
export const SERIF = 'Fraunces, Georgia, serif';

export const WORDS = ['The', 'animal', "didn't", 'cross', 'the', 'street', 'because', 'it', 'was', 'too'];
export const WORD_X = [-720, -555, -390, -235, -95, 70, 250, 420, 575, 700];

export function addKicker(view: View2D, label: string) {
  view.add(new Txt({
    text: label.toUpperCase(),
    position: [-820, -488],
    offset: [-1, 0],
    fontFamily: MONO,
    fontSize: 22,
    letterSpacing: 5,
    fill: PALETTE.dim,
  }));
}

export function sceneTitle(view: View2D, text: string) {
  view.add(new Txt({
    text,
    position: [-820, -420],
    offset: [-1, 0],
    width: 1520,
    fontFamily: SERIF,
    fontSize: 52,
    fontWeight: 600,
    fill: PALETTE.ink,
    textWrap: true,
  }));
}

export function makeCaption(view: View2D) {
  const txt = new Txt({
    y: 470,
    width: 1580,
    textAlign: 'center',
    fontFamily: SERIF,
    fontStyle: 'italic',
    fontSize: 36,
    fill: PALETTE.caption,
    opacity: 0,
    textWrap: true,
  });
  view.add(txt);
  return function* say(s: string): ThreadGenerator {
    if (txt.text()) yield* txt.opacity(0, 0.22);
    txt.text(s);
    yield* txt.opacity(1, 0.42);
  };
}

export function token(
  text: string,
  position: [number, number],
  color = '#2a3147',
  width = Math.max(92, text.length * 17 + 34),
) {
  const g = new Node({position, opacity: 0});
  g.add(new Rect({
    width,
    height: 58,
    radius: 10,
    fill: PALETTE.panel,
    stroke: color,
    lineWidth: 2,
  }));
  g.add(new Txt({
    text,
    fontFamily: MONO,
    fontSize: 28,
    fill: PALETTE.ink,
  }));
  return g;
}

export function sentenceTokens(
  words = WORDS,
  y = 120,
  classes: Record<number, string> = {},
  xs = WORD_X,
) {
  return words.map((word, i) => token(word, [xs[i] ?? (-720 + i * 150), y], classes[i] ?? '#2a3147'));
}

export function beam(
  from: [number, number],
  to: [number, number],
  color: string,
  width = 6,
  lift = 150,
) {
  const mid: [number, number] = [(from[0] + to[0]) / 2, Math.min(from[1], to[1]) - lift];
  return new Line({
    points: [from, mid, to],
    stroke: color,
    lineWidth: width,
    lineCap: 'round',
    lineJoin: 'round',
    end: 0,
    opacity: 0,
  });
}

export function vectorBars(
  values: number[],
  position: [number, number],
  color: string,
  scale = 78,
) {
  const g = new Node({position, opacity: 0});
  values.forEach((value, i) => {
    const h = Math.max(12, Math.abs(value) * scale);
    g.add(new Rect({
      width: 18,
      height: h,
      radius: 4,
      x: i * 30,
      y: value >= 0 ? -h / 2 : h / 2,
      fill: color,
      opacity: 0.9,
    }));
    g.add(new Line({
      points: [[i * 30 - 12, 0], [i * 30 + 12, 0]],
      stroke: '#3f465c',
      lineWidth: 2,
    }));
  });
  return g;
}

export function monoRead(text: string | (() => string), position: [number, number], color = PALETTE.ink) {
  return new Txt({
    text,
    position,
    fontFamily: MONO,
    fontSize: 30,
    fill: color,
    opacity: 0,
  });
}

export function* popIn(nodes: Node[], seconds = 0.45): ThreadGenerator {
  yield* all(...nodes.map(node => node.opacity(1, seconds)));
}

export function* drawOn(line: Line, seconds = 0.9): ThreadGenerator {
  line.opacity(1);
  yield* line.end(1, seconds);
}
