import {Circle, Line, Rect, Path, Node, Txt, View2D} from '@motion-canvas/2d';
import {all, ThreadGenerator} from '@motion-canvas/core';

// ---- botanical "bark & moth" palette (mirrors the HTML deck) ----
export const PALETTE = {
  bg: '#0d1310',
  dim: '#8b968a',
  gold: '#e7b84b',
  green: '#74cf90',
  sage: '#9bd3a9',
  rose: '#e0705f',
  ink: '#eef1e6',
  caption: '#cdd4c6',
  body: '#15110c',
};

export const MONO = 'IBM Plex Mono, monospace';
export const SERIF = 'Newsreader, Georgia, serif';

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b);

// ---- the biology (identical model to the HTML deck) ----
const RAMP_PALE = [176, 170, 150], RAMP_DARK = [44, 40, 35];
export function ramp(t: number) {
  t = clamp(t, 0, 1);
  const c = RAMP_PALE.map((v, i) => Math.round(lerp(v, RAMP_DARK[i], t)));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}
export function barkColor(B: number) {
  B = clamp(B, 0, 1);
  const p = [150, 146, 128], d = [47, 43, 39];
  const c = p.map((v, i) => Math.round(lerp(v, d[i], B)));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}
export const conspicuous = (shade: number, B: number) => Math.abs(shade - B);
export const camouflage = (shade: number, B: number) => 1 - Math.abs(shade - B);
export const meanOf = (a: number[]) => a.reduce((s, x) => s + x, 0) / a.length;

export function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function gauss(rng: () => number) {
  let u = 0, v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
export function makeShades(n: number, mean: number, sd: number, seed: number) {
  const rng = mulberry32(seed); const a: number[] = [];
  for (let i = 0; i < n; i++) a.push(clamp(mean + gauss(rng) * sd, 0.03, 0.97));
  return a;
}
export function evolveMoths(shades: number[], {B, strength, mutation, seed}: {B: number; strength: number; mutation: number; seed: number}) {
  const rng = mulberry32(seed);
  const wt = shades.map((s) => Math.pow(camouflage(s, B), strength));
  const total = wt.reduce((s, x) => s + x, 0) || 1;
  const next: number[] = [];
  for (let i = 0; i < shades.length; i++) {
    let r = rng() * total, parent = shades[0];
    for (let j = 0; j < shades.length; j++) { r -= wt[j]; if (r <= 0) { parent = shades[j]; break; } }
    next.push(clamp(parent + gauss(rng) * mutation, 0.02, 0.98));
  }
  return next;
}
// scatter n positions across a rect with seeded jitter (scene coords, origin centre)
export function scatter(n: number, r: {x: number; y: number; w: number; h: number}, seed: number, pad = 70) {
  const rng = mulberry32(seed);
  const cols = Math.max(1, Math.round(Math.sqrt((n * (r.w - 2 * pad)) / (r.h - 2 * pad))));
  const rows = Math.ceil(n / cols); const out: {x: number; y: number}[] = [];
  for (let i = 0; i < n; i++) {
    const cx = i % cols, ry = Math.floor(i / cols);
    const gx = r.x + pad + (cols > 1 ? ((r.w - 2 * pad) * cx) / (cols - 1) : r.w / 2);
    const gy = r.y + pad + (rows > 1 ? ((r.h - 2 * pad) * ry) / (rows - 1) : r.h / 2);
    out.push({x: gx + (rng() - 0.5) * ((r.w - 2 * pad) / cols) * 0.86, y: gy + (rng() - 0.5) * ((r.h - 2 * pad) / rows) * 0.78});
  }
  return out;
}

// ---- a peppered moth, resting wings-spread (local units ~[-1,1], caller scales) ----
export function moth(shade: number): Node {
  const col = ramp(shade), edge = 'rgba(16,12,8,0.42)', fleck = ramp(clamp(shade + 0.32, 0, 1));
  const g = new Node({});
  const wing = (x: number, y: number, w: number, h: number, rot: number) =>
    new Circle({position: [x, y], size: [w, h], rotation: rot, fill: col, stroke: edge, lineWidth: 0.05});
  g.add(wing(-0.50, -0.26, 1.24, 0.84, -23));
  g.add(wing(0.50, -0.26, 1.24, 0.84, 23));
  g.add(wing(-0.40, 0.34, 0.90, 0.70, 26));
  g.add(wing(0.40, 0.34, 0.90, 0.70, -26));
  for (const p of [[-0.62, -0.30], [-0.34, -0.12], [0.62, -0.30], [0.34, -0.12]] as [number, number][]) {
    g.add(new Circle({position: p, size: [0.14, 0.14], fill: fleck, opacity: 0.7}));
  }
  g.add(new Circle({position: [0, 0.04], size: [0.26, 1.2], fill: PALETTE.body}));
  g.add(new Circle({position: [0, -0.58], size: [0.24, 0.24], fill: PALETTE.body}));
  g.add(new Line({points: [[0, -0.64], [-0.27, -0.96]], stroke: PALETTE.body, lineWidth: 0.055, lineCap: 'round'}));
  g.add(new Line({points: [[0, -0.64], [0.27, -0.96]], stroke: PALETTE.body, lineWidth: 0.055, lineCap: 'round'}));
  return g;
}
export function placeMoth(shade: number, x: number, y: number, s: number): Node {
  const g = moth(shade); g.position([x, y]); g.scale(s); return g;
}

// ---- the bark slab (rounded rect + clipped streaks + lichen) ----
export function makeBark(r: {x: number; y: number; w: number; h: number}, seed: number) {
  const rect = new Rect({position: [r.x + r.w / 2, r.y + r.h / 2], size: [r.w, r.h], radius: 22, fill: barkColor(0), clip: true,
    stroke: '#0c0f0a', lineWidth: 2});
  const rng = mulberry32(seed);
  const streaks: {node: Rect; base: number}[] = [];
  for (let i = 0; i < 26; i++) {
    const sx = -r.w / 2 + rng() * r.w; const w = 4 + rng() * 10; const base = 0.05 + rng() * 0.06;
    streaks.push({node: new Rect({position: [sx, 0], size: [w, r.h + 12], fill: '#000', opacity: base}), base});
  }
  const lichen: Circle[] = [];
  for (let i = 0; i < 14; i++) {
    const lx = -r.w / 2 + 30 + rng() * (r.w - 60), ly = -r.h / 2 + 30 + rng() * (r.h - 60);
    lichen.push(new Circle({position: [lx, ly], size: [(20 + rng() * 50), (14 + rng() * 30)], fill: '#aeb59a', opacity: 0}));
  }
  streaks.forEach((s) => rect.add(s.node));
  lichen.forEach((l) => rect.add(l));
  function setDarkness(B: number) {
    rect.fill(barkColor(B));
    const lichOp = clamp((0.55 - B) * 0.85, 0, 0.5);
    lichen.forEach((l) => l.opacity(lichOp));
    streaks.forEach((s) => s.node.opacity(s.base * (0.7 + B * 0.8)));
  }
  setDarkness(0);
  return {rect, setDarkness};
}

// ---- bird silhouette (a Path; caller positions/scales/rotates the returned Node) ----
const BIRD_D = 'M0,-1 C0.26,-0.7 0.3,-0.5 0.36,-0.4 C0.95,-0.56 1.55,-0.2 1.78,0.06 C1.2,0.06 0.72,0.12 0.42,0.46 C0.3,0.72 0.16,0.86 0,0.86 C-0.16,0.86 -0.3,0.72 -0.42,0.46 C-0.72,0.12 -1.2,0.06 -1.78,0.06 C-1.55,-0.2 -0.95,-0.56 -0.36,-0.4 C-0.3,-0.5 -0.26,-0.7 0,-1 Z';
export function bird(): Node {
  const g = new Node({opacity: 0});
  g.add(new Path({data: BIRD_D, fill: '#1c2118', stroke: '#0c0f0a', lineWidth: 0.04}));
  return g;
}

// ---- bottom caption with crossfade ----
export function makeCaption(view: View2D) {
  const txt = new Txt({
    y: 470, width: 1560, textAlign: 'center',
    fontFamily: SERIF, fontStyle: 'italic', fontWeight: 300, fontSize: 38,
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
    fontFamily: MONO, fontSize: 22, letterSpacing: 5, fill: PALETTE.gold, opacity: 0.85,
  }));
}

// the bark slab in scene coords (1920x1080 view, origin centre)
export const BARK = {x: -760, y: -300, w: 1520, h: 640};
