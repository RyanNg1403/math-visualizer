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
  /** optional one-line hint shown under the title in interactive mode,
   *  describing this deck's specific controls. Falls back to a generic hint. */
  hint?: string;
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
    hint: 'Press → to step through. In the 3-D act, drag the surface to orbit it.',
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
  {
    id: 'electromagnetic-induction',
    title: 'Electromagnetic Induction',
    blurb: 'Changing magnetic flux wakes a circuit: Faraday gives the size, Lenz gives the direction.',
    tags: [
      'physics',
      'electromagnetism',
      'induction',
      'faraday',
      'lenz',
      'magnetic flux',
      'motional emf',
      'generator',
      'transformer',
    ],
    deck: new URL('./electromagnetic-induction/deck.html', import.meta.url).href,
    video: new URL(
      './electromagnetic-induction/electromagnetic-induction.mp4',
      import.meta.url,
    ).href,
    poster: new URL('./electromagnetic-induction/poster.jpg', import.meta.url).href,
  },
  {
    id: 'activation-energy-catalyst',
    title: 'Activation Energy & Catalyst',
    blurb:
      'A 3-D chemistry explainer showing activation barriers, transition states, and how catalysts open a lower-energy pathway.',
    tags: [
      'chemistry',
      'activation energy',
      'catalyst',
      'catalysis',
      'reaction rate',
      'arrhenius',
      'transition state',
    ],
    deck: new URL('./activation-energy-catalyst/deck.html', import.meta.url).href,
    video: new URL(
      './activation-energy-catalyst/activation-energy-catalyst.mp4',
      import.meta.url,
    ).href,
    poster: new URL('./activation-energy-catalyst/poster.jpg', import.meta.url).href,
  },
  {
    id: 'self-attention',
    title: 'Self-Attention',
    blurb: 'How a transformer decides which words to look at — queries, keys, softmax, and the value blend.',
    tags: ['computer science', 'deep learning', 'transformers'],
    deck: new URL('./self-attention/deck.html', import.meta.url).href,
    video: new URL('./self-attention/self-attention.mp4', import.meta.url).href,
    poster: new URL('./self-attention/poster.jpg', import.meta.url).href,
  },
  {
    id: 'natural-selection',
    title: 'Natural Selection',
    blurb: 'How camouflage evolves — moths, a bird that hunts by sight, and bark that changes colour generation by generation.',
    tags: ['biology', 'evolution', 'camouflage'],
    deck: new URL('./natural-selection/deck.html', import.meta.url).href,
    video: new URL('./natural-selection/natural-selection.mp4', import.meta.url).href,
    poster: new URL('./natural-selection/poster.jpg', import.meta.url).href,
    hint: 'Press → to step through. In the playground, darken the bark and release the bird.',
  },
];

export const getExplainer = (id: string): Explainer | undefined =>
  explainers.find((e) => e.id === id);
