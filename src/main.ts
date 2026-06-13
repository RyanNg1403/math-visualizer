import { appHtml } from './app-html';
import './styles.css';
import { explainers, type Explainer } from '../explainers/registry';
import { generateLesson } from './llm';

type ViewMode = 'chat' | 'interactive';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Missing #app mount node.');
}

app.innerHTML = appHtml;
document.body.dataset.view = 'chat';

const getElement = <T extends HTMLElement>(id: string): T => {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Missing element: #${id}`);
  }

  return element as unknown as T;
};

const lessonTitle = getElement<HTMLElement>('lessonTitle');
const promptInput = getElement<HTMLInputElement>('promptInput');
const conversation = getElement<HTMLElement>('conversation');
const conversationInner = getElement<HTMLElement>('conversationInner');
const promptForm = getElement<HTMLFormElement>('promptForm');
const lessonList = getElement<HTMLElement>('lessonList');
const interactiveTitle = getElement<HTMLElement>('interactiveTitle');
const deckFrame = getElement<HTMLIFrameElement>('deckFrame');

let currentLesson: Explainer | null = null;
let loadedDeck: string | null = null; // which deck URL the iframe currently holds
let responseTimer: number | null = null;

function escapeHtml(value: string): string {
  const entities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  return value.replace(/[&<>"']/g, (char) => entities[char]);
}

function lessonFromLocation(): Explainer | null {
  const [, hashMode, hashLesson] = window.location.hash.match(/^#([^/]+)\/?(.+)?$/) ?? [];

  if (hashMode === 'interactive' && hashLesson) {
    const id = decodeURIComponent(hashLesson);
    return explainers.find((explainer) => explainer.id === id) ?? null;
  }

  const queryLesson = new URLSearchParams(window.location.search).get('lesson');

  if (queryLesson) {
    return explainers.find((explainer) => explainer.id === queryLesson) ?? null;
  }

  return null;
}

// --- the library (sidebar) is the registry ---
function renderLibrary(): void {
  lessonList.innerHTML = '';

  explainers.forEach((explainer) => {
    const button = document.createElement('button');
    button.className = 'recent-item';
    button.type = 'button';
    button.dataset.lessonId = explainer.id;
    button.classList.toggle('active', currentLesson?.id === explainer.id);

    const title = document.createElement('strong');
    title.textContent = explainer.title;

    const summary = document.createElement('span');
    summary.textContent = explainer.blurb;

    button.append(title, summary);
    lessonList.appendChild(button);
  });

  if (explainers.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'history-empty';
    empty.textContent = 'No explainers yet.';
    lessonList.appendChild(empty);
  }
}

// --- rendering ---
function userMessageHtml(text: string): string {
  return `
    <article class="message">
      <div class="avatar user">You</div>
      <div class="message-body"><div class="user-bubble">${escapeHtml(text)}</div></div>
    </article>`;
}

// The video illustrates the concept; the corner button opens the deck (interactive).
function lessonCardHtml(lesson: Explainer): string {
  const safeTitle = escapeHtml(lesson.title);

  return `
    <article class="message">
      <div class="avatar assistant">SV</div>
      <div class="message-body">
        <p>${escapeHtml(lesson.blurb)}</p>
        <div class="video-result">
          <div class="video-stage">
            <div class="stage-frame">
              <video class="preview-video" poster="${lesson.poster}" preload="metadata" playsinline controls data-preview-video>
                <source src="${lesson.video}" type="video/mp4">
              </video>
              <button class="preview-play-button" type="button" data-play-preview aria-label="Play ${safeTitle} video">
                <span class="play-glyph" aria-hidden="true"></span>
              </button>
              <button class="interactive-corner-button" type="button" data-open-interactive aria-label="Open interactive explorer" title="Open interactive explorer">
                <span aria-hidden="true">↗</span>
                <span>Interactive</span>
              </button>
            </div>
          </div>
        </div>
        <div class="lesson-actions">
          <button class="primary-action" type="button" data-open-interactive>Interactive explorer</button>
          <a class="secondary-link" href="${lesson.deck}" target="_blank" rel="noreferrer">Open deck</a>
        </div>
      </div>
    </article>`;
}

function thinkingHtml(): string {
  return `
    <article class="message" data-thinking>
      <div class="avatar assistant">SV</div>
      <div class="message-body">
        <div class="thinking"><span class="pulse-dot"></span><span>Storyboarding scenes</span></div>
      </div>
    </article>`;
}

// home: a short welcome + the registry as a clickable library grid
function renderHome(): void {
  currentLesson = null;
  lessonTitle.textContent = 'STEM Visualizer';
  interactiveTitle.textContent = 'Interactive explorer';

  const cards = explainers
    .map(
      (explainer) => `
        <button class="library-card" type="button" data-lesson-id="${explainer.id}">
          <img class="library-card-poster" src="${explainer.poster}" alt="" loading="lazy">
          <span class="library-card-title">${escapeHtml(explainer.title)}</span>
          <span class="library-card-blurb">${escapeHtml(explainer.blurb)}</span>
        </button>`,
    )
    .join('');

  conversationInner.innerHTML = `
    <article class="message">
      <div class="avatar assistant">SV</div>
      <div class="message-body">
        <p>Pick an explainer from the library, or describe a STEM concept and I'll build one.</p>
        <div class="library-grid">${cards}</div>
      </div>
    </article>`;
  conversation.scrollTop = 0;
  renderLibrary();
}

function setLessonMeta(lesson: Explainer): void {
  currentLesson = lesson;
  lessonTitle.textContent = lesson.title;
  interactiveTitle.textContent = `${lesson.title} explorer`;
  // a different deck means the iframe must reload next time interactive opens
  if (loadedDeck !== lesson.deck) {
    loadedDeck = null;
  }
}

// open a library lesson (no prompt transcript)
function showLesson(lesson: Explainer): void {
  setLessonMeta(lesson);
  conversationInner.innerHTML = lessonCardHtml(lesson);
  conversation.scrollTop = conversation.scrollHeight;
  renderLibrary();
}

function clearPendingResponse(): void {
  if (responseTimer !== null) {
    window.clearTimeout(responseTimer);
    responseTimer = null;
  }
}

// --- view toggle: interactive mode is the current lesson's deck, lazy-loaded ---
function setView(view: ViewMode): void {
  document.body.dataset.view = view;

  document.querySelectorAll<HTMLElement>('[data-view-choice]').forEach((button) => {
    button.classList.toggle('active', button.dataset.viewChoice === view);
  });

  const currentPath = `${window.location.pathname}${window.location.search}`;

  if (view === 'interactive') {
    if (!currentLesson) {
      setLessonMeta(lessonFromLocation() ?? explainers[0]);
      renderLibrary();
    }

    const lesson = currentLesson;

    if (lesson && loadedDeck !== lesson.deck) {
      deckFrame.src = lesson.deck;
      loadedDeck = lesson.deck;
    }

    if (lesson) {
      history.replaceState(null, '', `${currentPath}#interactive/${lesson.id}`);
    }
  } else if (window.location.hash === '#interactive') {
    history.replaceState(null, '', currentPath);
  } else if (window.location.hash.startsWith('#interactive/')) {
    history.replaceState(null, '', currentPath);
  }

  window.scrollTo(0, 0);
}

// --- prompt -> LLM seam -> lesson ---
async function submitPrompt(text: string): Promise<void> {
  const prompt = text.trim();

  if (!prompt) {
    return;
  }

  promptInput.value = '';
  clearPendingResponse();
  conversationInner.innerHTML = userMessageHtml(prompt) + thinkingHtml();
  conversation.scrollTop = conversation.scrollHeight;

  try {
    const lesson = await generateLesson(prompt);
    conversationInner.querySelector('[data-thinking]')?.remove();
    setLessonMeta(lesson);
    conversationInner.insertAdjacentHTML('beforeend', lessonCardHtml(lesson));
    conversation.scrollTop = conversation.scrollHeight;
    renderLibrary();
  } catch {
    conversationInner.querySelector('[data-thinking]')?.remove();
    conversationInner.insertAdjacentHTML(
      'beforeend',
      `<article class="message"><div class="avatar assistant">SV</div><div class="message-body"><p>Sorry — I couldn't build that lesson just now.</p></div></article>`,
    );
  }
}

function startNewLesson(): void {
  clearPendingResponse();
  promptInput.value = '';
  renderHome();
  setView('chat');
  promptInput.focus();
}

// --- events ---
document.querySelectorAll<HTMLElement>('[data-view-choice]').forEach((button) => {
  button.addEventListener('click', () => {
    const view = button.dataset.viewChoice;

    if (view === 'chat' || view === 'interactive') {
      setView(view);
    }
  });
});

document.querySelectorAll<HTMLElement>('[data-example]').forEach((button) => {
  button.addEventListener('click', () => {
    promptInput.value = button.dataset.example ?? '';
    promptInput.focus();
  });
});

document.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }

  const lessonButton = event.target.closest<HTMLElement>('[data-lesson-id]');

  if (lessonButton?.dataset.lessonId) {
    const lesson = explainers.find((item) => item.id === lessonButton.dataset.lessonId);

    if (lesson) {
      showLesson(lesson);
      setView('chat');
    }

    return;
  }

  if (event.target.closest('[data-open-interactive]')) {
    setView('interactive');
    return;
  }

  if (event.target.closest('[data-play-preview]')) {
    const frame = event.target.closest('.stage-frame');
    const video = frame?.querySelector<HTMLVideoElement>('[data-preview-video]');

    if (frame && video) {
      frame.classList.add('is-playing');
      void video.play();
    }
  }
});

promptForm.addEventListener('submit', (event) => {
  event.preventDefault();
  void submitPrompt(promptInput.value);
});

getElement<HTMLButtonElement>('newChatButton').addEventListener('click', () => {
  startNewLesson();
});

// --- boot ---
renderHome();
const initialLesson = lessonFromLocation();

if (initialLesson) {
  showLesson(initialLesson);
}

setView(window.location.hash.startsWith('#interactive') ? 'interactive' : 'chat');
