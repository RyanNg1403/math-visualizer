import {makeScene2D, Circle, Line, Rect, Txt, Node} from '@motion-canvas/2d';
import {
  all, createSignal, easeInOutCubic, linear, fadeTransition, waitFor,
} from '@motion-canvas/core';
import {PALETTE, MONO, mapper, makeAxes, fnLine, drawOn, carS, carV, makeCaption, addKicker} from '../lib';

export default makeScene2D(function* (view) {
  view.fill(PALETTE.bg);
  yield* fadeTransition(0.6);

  addKicker(view, '08 · your speedometer');
  const say = makeCaption(view);

  const tt = createSignal(0);

  // the road
  const roadY = -412;
  const road = new Node({opacity: 0});
  road.add(new Line({
    points: [[-620, roadY], [620, roadY]], stroke: '#2a3147', lineWidth: 5,
  }));
  road.add(new Line({
    points: [[-620, roadY], [620, roadY]], stroke: '#454f6b', lineWidth: 2, lineDash: [14, 16],
  }));
  const car = new Node({
    position: () => [-620 + (carS(tt()) / 120) * 1240, roadY - 4],
  });
  car.add(new Rect({width: 56, height: 17, radius: 5, fill: PALETTE.yellow, y: -14}));
  car.add(new Rect({width: 27, height: 14, radius: 4, fill: PALETTE.yellow, y: -27}));
  car.add(new Circle({size: 12, fill: PALETTE.bg, stroke: PALETTE.ink, lineWidth: 2.5, x: -15, y: -5}));
  car.add(new Circle({size: 12, fill: PALETTE.bg, stroke: PALETTE.ink, lineWidth: 2.5, x: 15, y: -5}));
  road.add(car);
  view.add(road);

  const M1 = mapper([0, 8.4], [0, 130], {x: -570, y: -360, w: 1140, h: 330});
  const M2 = mapper([0, 8.4], [0, 27], {x: -570, y: 60, w: 1140, h: 330});
  const ax1 = makeAxes(M1, {xticks: [2, 4, 6, 8], yticks: [60, 120], ylab: 'position s(t)'});
  const ax2 = makeAxes(M2, {xticks: [2, 4, 6, 8], yticks: [10, 20], ylab: "speed v(t) = s'(t)"});
  view.add(ax1.group); view.add(ax2.group);

  const curve1 = fnLine(M1, carS, 0, 8, PALETTE.blue, 7);
  const d1 = new Circle({
    size: 18, fill: PALETTE.yellow, opacity: 0,
    position: () => [M1.X(tt()), M1.Y(carS(tt()))],
  });
  const trail = new Line({
    points: () => {
      const pts: [number, number][] = [];
      for (let u = 0; u <= tt() + 1e-9; u += 0.05) pts.push([M2.X(u), M2.Y(carV(u))]);
      pts.push([M2.X(tt()), M2.Y(carV(tt()))]);
      return pts;
    },
    stroke: PALETTE.green, lineWidth: 7, lineCap: 'round', lineJoin: 'round', opacity: 0,
  });
  const d2 = new Circle({
    size: 18, fill: PALETTE.green, opacity: 0,
    position: () => [M2.X(tt()), M2.Y(carV(tt()))],
  });
  const speedo = new Txt({
    text: () => `speedometer  ${carV(tt()).toFixed(1)} m/s`,
    position: [430, -490], fontFamily: MONO, fontSize: 34, fill: PALETTE.green, opacity: 0,
  });
  view.add(curve1); view.add(trail); view.add(d1); view.add(d2); view.add(speedo);

  yield* say('One motion, two curves. The bottom one is empty — the drive will draw it.');
  yield* all(road.opacity(1, 0.7), ax1.show(0.6), ax2.show(0.6));
  yield* drawOn(curve1, 1.5, easeInOutCubic);
  yield* all(d1.opacity(1, 0.3), d2.opacity(1, 0.3), trail.opacity(1, 0.3), speedo.opacity(1, 0.3));

  yield* say('At every instant, the speedometer reads the slope of position.');
  yield* tt(8, 7.0, linear);

  yield* say('v = s′ — your car computes a derivative sixty times a second.');
  yield* waitFor(2.2);
});
