import {makeScene2D, Line} from '@motion-canvas/2d';
import {fadeTransition, waitFor} from '@motion-canvas/core';
import {makeCaption, addKicker, PALETTE, drawOn} from '../lib';
import {makeStage3D, poly3, F3, CFG3, orbitTo3, spin3} from '../lib3d';

// The bridge: a 2D curve we already know, lifted into a surface.
export default makeScene2D(function* (view) {
  view.fill(PALETTE.bg);
  yield* fadeTransition(0.6);

  addKicker(view, '10 · from a curve to a surface');
  const say = makeCaption(view);

  const st = makeStage3D(view, {cam: {theta: 0, phi: 0.12}, showPt: false});
  st.surfG.opacity(0);                       // surface hidden until it "fills in"
  const slice = new Line({points: [[0,0],[0,0]], stroke: PALETTE.blue, lineWidth: 7, lineCap: 'round', end: 0, opacity: 0});
  view.add(slice);
  const D = CFG3.dom;
  st.extras.push(() => {
    const pts: [number, number, number][] = [];
    for (let i=0;i<=80;i++) { const x = -D + 2*D*i/80; pts.push([x, 0, F3(x, 0)]); }
    slice.points(poly3(pts, st.cam));
  });
  st.redraw();

  yield* say('Until now: one input, one output — a single curve.');
  slice.opacity(1);
  yield* drawOn(slice, 1.4);
  yield* waitFor(0.9);

  yield* say('Now let the height depend on a second input as well.');
  yield* waitFor(0.7);

  yield* say('That curve fills out — into a whole surface.');
  yield* orbitTo3(st, CFG3.theta, CFG3.phi, 2.8, true);
  yield* waitFor(0.7);

  st.showPt = true; st.redraw();
  yield* say('Every point on the ground now carries a height: f of x and y.');
  yield* spin3(st, 0.4, 3.6);
  yield* waitFor(1.2);
});
