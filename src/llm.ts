import { explainers, type Explainer } from '../explainers/registry';

// A lesson the UI can render. Today it's just a registry explainer, but the seam
// returns its own type so a real provider can later return generated content
// (e.g. a freshly produced deck + video) without changing call sites.
export type Lesson = Explainer;

/**
 * The single integration point for a real model / provider.
 *
 * Replace the body with a real call (Anthropic, OpenAI, or your own backend that
 * runs the `math-deck-video` pipeline) and resolve to a `Lesson`. Keep API keys
 * server-side / in env — never hard-code or commit them.
 *
 * For now this falls back to matching the prompt against the existing library so
 * the app is fully functional with no provider wired.
 */
export async function generateLesson(prompt: string): Promise<Lesson> {
  // TODO: call the real provider here.
  const q = prompt.toLowerCase();
  const match =
    explainers.find(
      (e) =>
        q.includes(e.id) ||
        q.includes(e.title.toLowerCase()) ||
        e.tags.some((t) => q.includes(t)),
    ) ?? explainers[0];
  return match;
}
