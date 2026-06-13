import {makeScene2D, Line, Circle, Txt} from '@motion-canvas/2d';
import {fadeTransition, waitFor, easeInOutCubic} from '@motion-canvas/core';
import {makeCaption, addKicker, PALETTE, MONO} from '../lib';
import {makeStage3D, proj3, F3, F3x, F3y, CFG3, drive3, spin3} from '../lib3d';

// The payoff: the gradient points steepest-uphill; flip it and you roll downhill (gradient descent).
export default makeScene2D(function* (view) {
  view.fill(PALETTE.bg);
  yield* fadeTransition(0.6);

  addKicker(view, '12 · which way is downhill?');
  const say = makeCaption(view);

  const st = makeStage3D(view, {});
  const cam = st.cam;

  const gArrow = new Line({points: [[0,0],[0,0]], stroke: PALETTE.red, lineWidth: 7, lineCap: 'round', endArrow: true, arrowSize: 22, opacity: 0});
  const dArrow = new Line({points: [[0,0],[0,0]], stroke: PALETTE.green, lineWidth: 6, lineCap: 'round', endArrow: true, arrowSize: 19, opacity: 0});
  const ball = new Circle({size: 18, fill: PALETTE.green, opacity: 0});
  const read = new Txt({text: '', fontFamily: MONO, fontSize: 36, fill: PALETTE.red, position: [-700, -350], offset: [-1, 0], opacity: 0});
  view.add(gArrow); view.add(dArrow); view.add(ball); view.add(read);

  const state = {g: 0, d: 0, bx: CFG3.x0, by: CFG3.y0};
  st.extras.push(() => {
    const px = st.px, py = st.py, gx = F3x(px,py), gy = F3y(px,py), z0 = F3(px,py);
    const gn = Math.hypot(gx,gy) || 1, ux = gx/gn, uy = gy/gn, len = 1.6*state.g;
    const sx = px+ux*len, sy = py+uy*len;
    const u0 = proj3(px,py,z0,cam), u1 = proj3(sx,sy,F3(sx,sy),cam);
    gArrow.points([[u0.x,u0.y],[u1.x,u1.y]]);
    const bgx = F3x(state.bx,state.by), bgy = F3y(state.bx,state.by), bz = F3(state.bx,state.by);
    const bn = Math.hypot(bgx,bgy) || 1, dl = 1.4*state.d;
    const dx2 = state.bx-bgx/bn*dl, dy2 = state.by-bgy/bn*dl;
    const d0 = proj3(state.bx,state.by,bz,cam), d1 = proj3(dx2,dy2,F3(dx2,dy2),cam);
    dArrow.points([[d0.x,d0.y],[d1.x,d1.y]]);
    ball.position([d0.x,d0.y]);
    read.text(`∇f = (${gx.toFixed(2)}, ${gy.toFixed(2)})`);
  });
  st.redraw();

  yield* say('Bundle the two slopes into a single arrow: the gradient, ∇f.');
  gArrow.opacity(1); read.opacity(1);
  yield* drive3(st, v => state.g = v, 0.001, 1, 0.9);
  yield* say('It points in the one steepest-uphill direction.');
  yield* waitFor(1.0);

  yield* say('Flip the sign — and −∇f points downhill. Take a step…');
  ball.opacity(1); dArrow.opacity(1);
  yield* drive3(st, v => state.d = v, 0, 1, 0.6);
  for (let k=0;k<6;k++) {
    const gx = F3x(state.bx,state.by), gy = F3y(state.bx,state.by);
    const fx = state.bx, fy = state.by, nx = fx-0.5*gx, ny = fy-0.5*gy;
    const frames = 26;
    for (let i=0;i<=frames;i++) { const t = easeInOutCubic(i/frames); state.bx = fx+(nx-fx)*t; state.by = fy+(ny-fy)*t; st.redraw(); yield; }
  }
  yield* say('…then look again, and step again. That is gradient descent.');
  yield* spin3(st, 0.4, 3.0);
  yield* say('The same move that trained the 1-D loss — now working in any dimension.');
  yield* waitFor(2.2);
});
