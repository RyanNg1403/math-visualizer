import {Latex, Txt, View2D} from '@motion-canvas/2d';
import {ThreadGenerator} from '@motion-canvas/core';
import {PALETTE, SERIF, MONO} from '../lib';

export function sceneTitle(view: View2D, text: string) {
  view.add(new Txt({
    text,
    position: [-740, -410],
    offset: [-1, 0],
    width: 1380,
    fontFamily: SERIF,
    fontSize: 52,
    fontWeight: 600,
    fill: PALETTE.ink,
    textWrap: true,
  }));
}

export function monoRead(text: string | (() => string), position: [number, number]) {
  return new Txt({
    text,
    position,
    fontFamily: MONO,
    fontSize: 30,
    fill: PALETTE.ink,
    opacity: 0,
  });
}

export function formula(tex: string, position: [number, number], width = 520) {
  return new Latex({
    tex: `\\textcolor{#e9e7df}{${tex}}`,
    position,
    width,
    opacity: 0,
  });
}

export function* reveal(node: {opacity: (value: number, seconds?: number) => ThreadGenerator}, seconds = 0.6) {
  yield* node.opacity(1, seconds);
}
