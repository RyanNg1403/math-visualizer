// Single source of truth for every STEM explainer in this repo.
//
// To add an explainer: drop `deck.html`, `<id>.mp4`, `poster.jpg` (and the
// `motion-canvas/` project that renders the video) into `explainers/<id>/`,
// then append an entry below. The web app in `src/` renders from this list,
// so a new lesson shows up with no further wiring. See ARCHITECTURE.md.

export interface Explainer {
  /** url-safe id; also the folder name under explainers/ */
  id: string;
  title: string;
  /** one-line description for cards */
  blurb: string;
  tags: string[];
  /** standalone interactive HTML deck */
  deck: string;
  /** rendered 1080p60 mp4 */
  video: string;
  /** still frame used on web-app cards */
  poster: string;
}

// NOTE: each URL must be a `new URL('<string literal>', import.meta.url)` so that
// Vite can statically find the file and emit it as a fingerprinted asset. Do not
// refactor these into a helper that takes a variable — Vite can't analyze that,
// and the asset silently won't be bundled.
export const explainers: Explainer[] = [
  {
    id: 'derivative',
    title: 'The Derivative',
    blurb: 'From the slope of a tangent line to the gradient and the tangent plane in 3-D.',
    tags: ['calculus'],
    deck: new URL('./derivative/deck.html', import.meta.url).href,
    video: new URL('./derivative/derivative.mp4', import.meta.url).href,
    poster: new URL('./derivative/poster.jpg', import.meta.url).href,
  },
  {
    id: 'taylor',
    title: 'Taylor Series',
    blurb: 'Building a curve out of polynomials — each term bends the approximation closer.',
    tags: ['calculus'],
    deck: new URL('./taylor/deck.html', import.meta.url).href,
    video: new URL('./taylor/taylor.mp4', import.meta.url).href,
    poster: new URL('./taylor/poster.jpg', import.meta.url).href,
  },
];

export const getExplainer = (id: string): Explainer | undefined =>
  explainers.find((e) => e.id === id);
