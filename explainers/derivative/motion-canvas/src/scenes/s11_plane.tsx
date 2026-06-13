import {makeScene2D, Line, Latex, Txt} from '@motion-canvas/2d';
import {fadeTransition, waitFor, all} from '@motion-canvas/core';
import {makeCaption, addKicker, PALETTE, MONO, drawOn} from '../lib';
import {makeStage3D, poly3, F3, F3x, F3y, CFG3, drive3, spin3, movePoint3} from '../lib3d';

// The core idea: the tangent line becomes a tangent plane (best flat approximation).
export default makeScene2D(function* (view) {
  view.fill(PALETTE.bg);
  yield* fadeTransition(0.6);

  addKicker(view, '11 · the tangent line grows up');
  const say = makeCaption(view);

  const st = makeStage3D(view, {});
  const cam = st.cam, D = CFG3.dom;

  const sliceX = new Line({points: [[0,0],[0,0]], stroke: PALETTE.yellow, lineWidth: 5, lineCap: 'round', end: 0, opacity: 0});
  const sliceY = new Line({points: [[0,0],[0,0]], stroke: PALETTE.green,  lineWidth: 5, lineCap: 'round', end: 0, opacity: 0});
  const plane  = new Line({points: [[0,0],[0,0],[0,0]], closed: true, fill: 'rgba(255,212,94,0.15)', stroke: PALETTE.yellow, lineWidth: 2.5, opacity: 0});
  const tanX = new Line({points: [[0,0],[0,0]], stroke: PALETTE.yellow, lineWidth: 8, lineCap: 'round', end: 0, opacity: 0});
  const tanY = new Line({points: [[0,0],[0,0]], stroke: PALETTE.green,  lineWidth: 8, lineCap: 'round', end: 0, opacity: 0});
  const readX = new Txt({text: '', fontFamily: MONO, fontSize: 36, fill: PALETTE.yellow, position: [-700, -350], offset: [-1, 0], opacity: 0});
  const readY = new Txt({text: '', fontFamily: MONO, fontSize: 36, fill: PALETTE.green,  position: [-700, -280], offset: [-1, 0], opacity: 0});
  const eq = new Latex({
    tex: '\\textcolor{#e9e7df}{z \\approx f + \\textcolor{#ffd45e}{f_x}\\,\\Delta x + \\textcolor{#7fd483}{f_y}\\,\\Delta y}',
    width: 720, position: [440, -380], opacity: 0,
  });
  view.add(sliceX); view.add(sliceY); view.add(plane); view.add(tanX); view.add(tanY);
  view.add(readX); view.add(readY); view.add(eq);

  const state = {planeT: 0};
  st.extras.push(() => {
    const px = st.px, py = st.py, z0 = F3(px,py), mx = F3x(px,py), my = F3y(px,py), du = 1.15;
    const sx: [number, number, number][] = [], sy: [number, number, number][] = [];
    for (let i=0;i<=64;i++) { const x = -D + 2*D*i/64; sx.push([x, py, F3(x, py)]); }
    for (let i=0;i<=64;i++) { const y = -D + 2*D*i/64; sy.push([px, y, F3(px, y)]); }
    sliceX.points(poly3(sx, cam)); sliceY.points(poly3(sy, cam));
    tanX.points(poly3([[px-du,py,z0-mx*du],[px+du,py,z0+mx*du]], cam));
    tanY.points(poly3([[px,py-du,z0-my*du],[px,py+du,z0+my*du]], cam));
    const s = state.planeT*1.7;
    const P = (dx: number, dy: number): [number, number, number] => [px+dx, py+dy, z0+mx*dx+my*dy];
    plane.points(poly3([P(-s,-s),P(s,-s),P(s,s),P(-s,s)], cam));
    readX.text(`∂f/∂x = ${mx.toFixed(2)}`);
    readY.text(`∂f/∂y = ${my.toFixed(2)}`);
  });
  st.redraw();

  yield* say('Pick a point. Walk along x, and it is just a curve — with a tangent line.');
  sliceX.opacity(1);
  yield* drawOn(sliceX, 0.9);
  tanX.opacity(1); readX.opacity(1);
  yield* drawOn(tanX, 0.8);
  yield* say('Its slope is ∂f/∂x — the same tangent line as before, on a slice.');
  yield* waitFor(1.0);

  yield* say('Walk along y instead: a second curve, a second tangent line — ∂f/∂y.');
  sliceY.opacity(1);
  yield* drawOn(sliceY, 0.9);
  tanY.opacity(1); readY.opacity(1);
  yield* drawOn(tanY, 0.8);
  yield* waitFor(0.9);

  yield* say('One slope made a line. Two slopes pin a whole plane.');
  plane.opacity(1);
  yield* all(eq.opacity(1, 0.8), drive3(st, v => state.planeT = v, 0, 1, 2.4));
  yield* say('The tangent plane — the surface’s best flat approximation at the point.');
  yield* spin3(st, 0.45, 3.2);

  yield* say('Move the point, and the plane rides along, always flat against the hill.');
  yield* movePoint3(st, -1.6, 1.4, 2.4);
  yield* waitFor(0.3);
  yield* movePoint3(st, CFG3.x0, CFG3.y0, 2.2);
  yield* waitFor(1.2);
});
