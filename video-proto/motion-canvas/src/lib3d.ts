// 3D projection engine for the video port — the same math as the HTML deck's CFG3/proj3,
// expressed with Motion Canvas nodes. The surface is a depth-sorted mesh of filled+stroked
// quads (zIndex = painter's rank); axes, slices, tangent planes, and the gradient arrow are
// plain Line/Circle nodes re-projected each frame by redraw().
import {Line, Circle, Txt, Node, View2D} from '@motion-canvas/2d';
import {ThreadGenerator, easeOutCubic, easeInOutSine, easeInOutCubic} from '@motion-canvas/core';
import {PALETTE, MONO} from './lib';

export const CFG3 = {
  amp: 2.4, spread: 0.25, tilt: 0.12,        // z = amp·e^(-spread·r²) + tilt·x
  dom: 3.2, grid: 18,                         // domain ±dom, mesh resolution
  x0: 1.15, y0: -0.95,                        // marked point
  theta: 0.92, phi: 0.52, scale: 134, persp: 0, zlift: 1.0, cx: 0, cy: 70,
  light: [-0.35, -0.42, 0.84] as [number, number, number],
  lo: '#163a5b', hi: '#7fe0ef',
};
export const F3  = (x: number, y: number) => CFG3.amp*Math.exp(-CFG3.spread*(x*x+y*y)) + CFG3.tilt*x;
export const F3x = (x: number, y: number) => CFG3.amp*Math.exp(-CFG3.spread*(x*x+y*y))*(-2*CFG3.spread*x) + CFG3.tilt;
export const F3y = (x: number, y: number) => CFG3.amp*Math.exp(-CFG3.spread*(x*x+y*y))*(-2*CFG3.spread*y);

export interface Cam {theta: number; phi: number; scale: number; persp: number; zlift: number; cx: number; cy: number}
export const cam3 = (o: Partial<Cam> = {}): Cam => ({
  theta: CFG3.theta, phi: CFG3.phi, scale: CFG3.scale, persp: CFG3.persp,
  zlift: CFG3.zlift, cx: CFG3.cx, cy: CFG3.cy, ...o,
});

export type Pt = [number, number];
export function proj3(x: number, y: number, z: number, cam: Cam): {x: number; y: number; depth: number} {
  const ct = Math.cos(cam.theta), st = Math.sin(cam.theta);
  const xr = x*ct - y*st, yr = x*st + y*ct;
  const cf = Math.cos(cam.phi), sf = Math.sin(cam.phi);
  const zv = z*cam.zlift;
  const up = zv*cf - yr*sf;
  const depth = yr*cf + zv*sf;
  const k = cam.persp ? 1/(1 + cam.persp*(3 - depth)) : 1;
  return {x: cam.cx + xr*cam.scale*k, y: cam.cy - up*cam.scale*k, depth};
}
export const poly3 = (pts: [number, number, number][], cam: Cam): Pt[] =>
  pts.map(p => { const q = proj3(p[0], p[1], p[2], cam); return [q.x, q.y] as Pt; });

const hx2rgb = (h: string) => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
const rgb2hx = (r: number[]) => '#' + r.map(v => Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
const mix = (a: string, b: string, t: number) => { const A=hx2rgb(a), B=hx2rgb(b); return rgb2hx([0,1,2].map(i => A[i]+(B[i]-A[i])*t)); };

function makeSurface3D(parent: Node, cam: Cam, getRise: () => number) {
  const N = CFG3.grid, D = CFG3.dom;
  const xs = (i: number) => -D + 2*D*i/N, ys = (j: number) => -D + 2*D*j/N;
  const g = new Node({});
  parent.add(g);
  const cells: {i: number; j: number; path: Line; depth: number}[] = [];
  for (let i=0;i<N;i++) for (let j=0;j<N;j++) {
    const path = new Line({points: [[0,0],[0,0],[0,0]], closed: true, lineWidth: 1, lineJoin: 'round'});
    g.add(path);
    cells.push({i, j, path, depth: 0});
  }
  const maxZ = CFG3.amp + CFG3.tilt*D + 1e-3;
  const L = CFG3.light, Ln = Math.hypot(L[0],L[1],L[2]);
  function update() {
    const r = getRise();
    const f = (x: number, y: number) => F3(x,y)*r;
    const fills: string[] = [];
    for (const c of cells) {
      const x0=xs(c.i),x1=xs(c.i+1),y0=ys(c.j),y1=ys(c.j+1);
      const z00=f(x0,y0),z10=f(x1,y0),z11=f(x1,y1),z01=f(x0,y1);
      const A=proj3(x0,y0,z00,cam), B=proj3(x1,y0,z10,cam), C=proj3(x1,y1,z11,cam), E=proj3(x0,y1,z01,cam);
      c.depth = (A.depth+B.depth+C.depth+E.depth)/4;
      c.path.points([[A.x,A.y],[B.x,B.y],[C.x,C.y],[E.x,E.y]]);
      const ux=x1-x0, uz=z10-z00, vy=y1-y0, vz=z01-z00;
      const nx=-uz*vy, ny=-ux*vz, nz=ux*vy, nn=Math.hypot(nx,ny,nz)||1;
      let sh = (nx*L[0]+ny*L[1]+nz*L[2])/(nn*Ln);
      sh = 0.55 + 0.45*Math.max(0, sh);
      const zc=(z00+z10+z11+z01)/4;
      const base = mix(CFG3.lo, CFG3.hi, Math.max(0,Math.min(1, (r ? zc/r : 0)/maxZ)));
      fills.push(rgb2hx(hx2rgb(base).map(v => v*sh)));
    }
    const order = cells.map((_,k)=>k).sort((p,q)=>cells[p].depth-cells[q].depth);
    order.forEach((k, rank) => {
      cells[k].path.zIndex(rank);
      cells[k].path.fill(fills[k]);
      cells[k].path.stroke(mix(fills[k], '#0a1622', 0.5));
    });
  }
  return {g, update};
}

export interface Stage3D {
  cam: Cam;
  rise: {v: number};
  px: number; py: number; showPt: boolean;
  extras: Array<() => void>;
  redraw: () => void;
  ptDot: Circle;
  surfG: Node;
}
export function makeStage3D(
  view: View2D,
  o: {rise?: number; showPt?: boolean; px?: number; py?: number; cy?: number; cam?: Partial<Cam>} = {},
): Stage3D {
  const cam = cam3({cy: o.cy ?? CFG3.cy, ...(o.cam ?? {})});
  const rise = {v: o.rise ?? 1};
  const surf = makeSurface3D(view, cam, () => rise.v);
  const D = CFG3.dom;
  const axDefs: {v: [number, number, number]; l: string}[] = [
    {v: [D+0.6, 0, 0], l: 'x'}, {v: [0, D+0.6, 0], l: 'y'}, {v: [0, 0, CFG3.amp+0.7], l: 'z'},
  ];
  const axLines = axDefs.map(() => new Line({points: [[0,0],[0,0]], stroke: '#5a6378', lineWidth: 3, opacity: 0.6}));
  const axTxt = axDefs.map(a => new Txt({text: a.l, fontFamily: MONO, fontSize: 28, fill: '#8b93a7'}));
  axLines.forEach(l => view.add(l));
  axTxt.forEach(t => view.add(t));
  const ptDrop = new Line({points: [[0,0],[0,0]], stroke: PALETTE.yellow, lineWidth: 2.5, lineDash: [7,8], opacity: 0});
  const ptGround = new Circle({size: 10, fill: PALETTE.yellow, opacity: 0});
  const ptDot = new Circle({size: 17, fill: PALETTE.yellow, opacity: 0});
  view.add(ptDrop); view.add(ptGround); view.add(ptDot);
  const st: Stage3D = {
    cam, rise, px: o.px ?? CFG3.x0, py: o.py ?? CFG3.y0, showPt: o.showPt !== false,
    extras: [], redraw: () => {}, ptDot, surfG: surf.g,
  };
  st.redraw = () => {
    surf.update();
    const o0 = proj3(0,0,0,cam);
    axDefs.forEach((a, i) => {
      const e = proj3(a.v[0], a.v[1], a.v[2], cam);
      axLines[i].points([[o0.x,o0.y],[e.x,e.y]]);
      axTxt[i].position([e.x + (a.l==='x'?14:0), e.y + (a.l==='z'?-12:22)]);
    });
    const pz = F3(st.px, st.py)*rise.v;
    const pd = proj3(st.px, st.py, pz, cam), pg = proj3(st.px, st.py, 0, cam);
    ptDrop.points([[pg.x,pg.y],[pd.x,pd.y]]); ptDrop.opacity(st.showPt ? 0.7 : 0);
    ptGround.position([pg.x,pg.y]); ptGround.opacity(st.showPt ? 0.6 : 0);
    ptDot.position([pd.x,pd.y]); ptDot.opacity(st.showPt ? 1 : 0);
    st.extras.forEach(f => f());
  };
  return st;
}

// ---- frame-driven animation helpers (bare `yield` = one rendered frame) ----
export function* rise3(st: Stage3D, dur: number): ThreadGenerator {
  const frames = Math.round(dur*60);
  for (let i=0;i<=frames;i++) { st.rise.v = easeOutCubic(i/frames); st.redraw(); yield; }
  st.rise.v = 1; st.redraw();
}
export function* spin3(st: Stage3D, amp: number, dur: number): ThreadGenerator {
  const frames = Math.round(dur*60), th0 = st.cam.theta;
  for (let i=0;i<=frames;i++) { st.cam.theta = th0 + Math.sin(i/frames*Math.PI*2)*amp; st.redraw(); yield; }
  st.cam.theta = th0; st.redraw();
}
export function* drive3(st: Stage3D, set: (v: number) => void, from: number, to: number, dur: number,
                        ease: (t: number) => number = easeOutCubic): ThreadGenerator {
  const frames = Math.round(dur*60);
  for (let i=0;i<=frames;i++) { set(from + (to-from)*ease(i/frames)); st.redraw(); yield; }
  set(to); st.redraw();
}
export function* movePoint3(st: Stage3D, tx: number, ty: number, dur: number): ThreadGenerator {
  const frames = Math.round(dur*60), x0 = st.px, y0 = st.py;
  for (let i=0;i<=frames;i++) { const t = easeInOutSine(i/frames); st.px = x0+(tx-x0)*t; st.py = y0+(ty-y0)*t; st.redraw(); yield; }
  st.px = tx; st.py = ty; st.redraw();
}
// orbit the camera to a target angle (used for the 2D→3D bridge); optionally fade the surface in
export function* orbitTo3(st: Stage3D, theta: number, phi: number, dur: number, fadeSurface = false): ThreadGenerator {
  const frames = Math.round(dur*60), th0 = st.cam.theta, ph0 = st.cam.phi;
  for (let i=0;i<=frames;i++) {
    const t = easeInOutCubic(i/frames);
    st.cam.theta = th0 + (theta-th0)*t;
    st.cam.phi = ph0 + (phi-ph0)*t;
    if (fadeSurface) st.surfG.opacity(t);
    st.redraw(); yield;
  }
  st.cam.theta = theta; st.cam.phi = phi;
  if (fadeSurface) st.surfG.opacity(1);
  st.redraw();
}
