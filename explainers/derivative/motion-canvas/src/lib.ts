import {Circle, Line, Txt, Node, View2D} from '@motion-canvas/2d';
import {all, ThreadGenerator} from '@motion-canvas/core';

export const PALETTE = {
  bg: '#0b0e15',
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

// ---- the math (same as the HTML deck) ----
export const carS = (t: number) => {
  const u = Math.min(Math.max(t / 8, 0), 1);
  return 120 * u * u * (3 - 2 * u);
};
export const carV = (t: number) => {
  const u = Math.min(Math.max(t / 8, 0), 1);
  return 90 * u * (1 - u);
};
export const F = (x: number) => (x * x * x) / 3 - x;
export const Fp = (x: number) => x * x - 1;
export const LOSS = (x: number) => 0.08 * Math.pow(x, 4) + 0.2 * x * x + 0.6;
export const LOSSp = (x: number) => 0.32 * Math.pow(x, 3) + 0.4 * x;

// ---- coordinate mapping: math space -> scene space (origin center, y down) ----
export interface Rect2 {x: number; y: number; w: number; h: number} // top-left in scene coords
export function mapper(xr: [number, number], yr: [number, number], r: Rect2) {
  const X = (u: number) => r.x + ((u - xr[0]) / (xr[1] - xr[0])) * r.w;
  const Y = (v: number) => r.y + r.h - ((v - yr[0]) / (yr[1] - yr[0])) * r.h;
  return {X, Y, xr, yr, r};
}
export type Mapper = ReturnType<typeof mapper>;

// ---- axes with draw-on ----
export function makeAxes(
  M: Mapper,
  opts: {xticks?: number[]; yticks?: number[]; xlab?: string; ylab?: string} = {},
) {
  const x0 = Math.min(Math.max(0, M.xr[0]), M.xr[1]);
  const y0 = Math.min(Math.max(0, M.yr[0]), M.yr[1]);
  const xAxis = new Line({
    points: [[M.X(M.xr[0]) - 8, M.Y(y0)], [M.X(M.xr[1]) + 14, M.Y(y0)]],
    stroke: PALETTE.axis, lineWidth: 3, endArrow: true, arrowSize: 12, end: 0,
  });
  const yAxis = new Line({
    points: [[M.X(x0), M.Y(y0) + 8], [M.X(x0), M.Y(M.yr[1]) - 14]],
    stroke: PALETTE.axis, lineWidth: 3, endArrow: true, arrowSize: 12, end: 0,
  });
  const labels = new Node({opacity: 0});
  for (const t of opts.xticks ?? []) {
    labels.add(new Txt({
      text: `${t}`, position: [M.X(t), M.Y(y0) + 30],
      fontFamily: MONO, fontSize: 24, fill: PALETTE.dim,
    }));
  }
  for (const v of opts.yticks ?? []) {
    labels.add(new Txt({
      text: `${v}`, position: [M.X(x0) - 40, M.Y(v)],
      fontFamily: MONO, fontSize: 24, fill: PALETTE.dim,
    }));
  }
  if (opts.xlab) {
    labels.add(new Txt({
      text: opts.xlab, position: [M.X(M.xr[1]) - 30, M.Y(y0) + 64],
      fontFamily: MONO, fontSize: 22, fill: PALETTE.dim,
    }));
  }
  if (opts.ylab) {
    labels.add(new Txt({
      text: opts.ylab, position: [M.X(x0) + 30, M.Y(M.yr[1]) - 20],
      fontFamily: MONO, fontSize: 22, fill: PALETTE.dim, offset: [-1, 0],
    }));
  }
  const group = new Node({});
  group.add(xAxis); group.add(yAxis); group.add(labels);
  function* show(dur = 0.7): ThreadGenerator {
    yield* all(xAxis.end(1, dur), yAxis.end(1, dur), labels.opacity(1, dur));
  }
  return {group, show};
}

// ---- sampled function curve ----
export function fnLine(
  M: Mapper, f: (x: number) => number, a: number, b: number,
  stroke: string, lineWidth = 7, n = 180,
) {
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const x = a + ((b - a) * i) / n;
    pts.push([M.X(x), M.Y(f(x))]);
  }
  return new Line({
    points: pts, stroke, lineWidth, lineCap: 'round', lineJoin: 'round', end: 0,
    opacity: 0, // hidden until drawn — a zero-length round-cap line renders as a stray dot
  });
}

export function* drawOn(line: Line, dur: number, ease?: (t: number) => number): ThreadGenerator {
  line.opacity(1);
  yield* line.end(1, dur, ease);
}

// ---- clipped straight line through (a, fa) with slope m ----
export function slopeSegment(
  M: Mapper, a: number, fa: number, m: number, u0: number, u1: number,
) {
  const ys = (u: number) => fa + m * (u - a);
  const yLo = M.yr[0] + 0.02 * (M.yr[1] - M.yr[0]);
  const yHi = M.yr[1] - 0.02 * (M.yr[1] - M.yr[0]);
  if (Math.abs(m) > 1e-9) {
    if (ys(u0) < yLo) u0 = a + (yLo - fa) / m; else if (ys(u0) > yHi) u0 = a + (yHi - fa) / m;
    if (ys(u1) < yLo) u1 = a + (yLo - fa) / m; else if (ys(u1) > yHi) u1 = a + (yHi - fa) / m;
  }
  return [
    [M.X(u0), M.Y(ys(u0))],
    [M.X(u1), M.Y(ys(u1))],
  ] as [number, number][];
}

export function dot(M: Mapper, x: number, y: number, color: string, size = 24) {
  return new Circle({size, fill: color, position: [M.X(x), M.Y(y)], scale: 0});
}

// ---- bottom caption with crossfade ----
export function makeCaption(view: View2D) {
  const txt = new Txt({
    y: 470, width: 1560, textAlign: 'center',
    fontFamily: SERIF, fontStyle: 'italic', fontSize: 36,
    fill: PALETTE.caption, opacity: 0, textWrap: true,
  });
  view.add(txt);
  return function* say(s: string): ThreadGenerator {
    if (txt.text()) yield* txt.opacity(0, 0.25);
    txt.text(s);
    yield* txt.opacity(1, 0.45);
  };
}

// ---- kicker (scene number, top-left) ----
export function addKicker(view: View2D, label: string) {
  view.add(new Txt({
    text: label.toUpperCase(), position: [-740, -480], offset: [-1, 0],
    fontFamily: MONO, fontSize: 22, letterSpacing: 5, fill: PALETTE.dim,
  }));
}
