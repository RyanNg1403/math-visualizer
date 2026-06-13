import { appHtml, derivativePosterUrl, derivativeVideoUrl } from './app-html';
import './styles.css';

type ViewMode = 'chat' | 'interactive';

type PlotBounds = {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
};

type Point = {
  x: number;
  y: number;
};

type ChatRecord = {
  id: string;
  title: string;
  summary: string;
  html: string;
};

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Missing #app mount node.');
}

app.innerHTML = appHtml;
document.body.dataset.view = 'chat';

const state = {
  concept: 'Derivative explainer',
  playing: false,
};

const getElement = <T extends HTMLElement>(id: string): T => {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Missing element: #${id}`);
  }

  return element as unknown as T;
};

const getSvgElement = <T extends SVGElement>(id: string): T => {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Missing SVG element: #${id}`);
  }

  return element as unknown as T;
};

const lessonTitle = getElement<HTMLElement>('lessonTitle');
const promptInput = getElement<HTMLInputElement>('promptInput');
const conversation = getElement<HTMLElement>('conversation');
const conversationInner = getElement<HTMLElement>('conversationInner');
const promptForm = getElement<HTMLFormElement>('promptForm');
const chatHistory = getElement<HTMLElement>('chatHistory');
const xSlider = getElement<HTMLInputElement>('xSlider');
const dxSlider = getElement<HTMLInputElement>('dxSlider');
const xMetric = getElement<HTMLElement>('xMetric');
const slopeMetric = getElement<HTMLElement>('slopeMetric');
const dxMetric = getElement<HTMLElement>('dxMetric');
const playButton = getElement<HTMLButtonElement>('playButton');
const interactiveTitle = getElement<HTMLElement>('interactiveTitle');
const initialConversationHtml = conversationInner.innerHTML;
const initialChat: ChatRecord = {
  id: 'demo-derivative',
  title: 'Derivative explainer',
  summary: 'Tangent line and rate of change',
  html: initialConversationHtml,
};
const chatRecords: ChatRecord[] = [initialChat];
let activeChatId: string | null = initialChat.id;
let nextChatId = 1;
let responseTimer: number | null = null;

const gridLayer = getSvgElement<SVGGElement>('gridLayer');
const curvePath = getSvgElement<SVGPathElement>('curvePath');
const ghostCurve = getSvgElement<SVGPathElement>('ghostCurve');
const tangentLine = getSvgElement<SVGLineElement>('tangentLine');
const dxLine = getSvgElement<SVGLineElement>('dxLine');
const mainPoint = getSvgElement<SVGCircleElement>('mainPoint');
const dxPoint = getSvgElement<SVGCircleElement>('dxPoint');
const readoutOne = getSvgElement<SVGTextElement>('readoutOne');
const readoutTwo = getSvgElement<SVGTextElement>('readoutTwo');
const readoutThree = getSvgElement<SVGTextElement>('readoutThree');

const plot: PlotBounds = {
  xMin: -2,
  xMax: 2.6,
  yMin: -0.25,
  yMax: 3.2,
  left: 132,
  right: 704,
  top: 78,
  bottom: 438,
};

function mathFunction(x: number): number {
  return 0.18 * x * x * x - 0.72 * x + 1.65;
}

function derivative(x: number): number {
  return 0.54 * x * x - 0.72;
}

function sx(x: number): number {
  return plot.left + ((x - plot.xMin) / (plot.xMax - plot.xMin)) * (plot.right - plot.left);
}

function sy(y: number): number {
  return plot.bottom - ((y - plot.yMin) / (plot.yMax - plot.yMin)) * (plot.bottom - plot.top);
}

function point(x: number): Point {
  return { x: sx(x), y: sy(mathFunction(x)) };
}

function fmt(value: number): string {
  return value.toFixed(2);
}

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

function currentChatSummary(): string {
  const userMessages = Array.from(conversationInner.querySelectorAll<HTMLElement>('.user-bubble'));
  const latestPrompt = userMessages[userMessages.length - 1]?.textContent?.trim();

  return latestPrompt || 'Lesson draft';
}

function renderChatHistory(): void {
  chatHistory.innerHTML = '';

  chatRecords.forEach((record) => {
    const button = document.createElement('button');
    button.className = 'recent-item';
    button.type = 'button';
    button.dataset.chatId = record.id;
    button.classList.toggle('active', record.id === activeChatId);

    const title = document.createElement('strong');
    title.textContent = record.title;

    const summary = document.createElement('span');
    summary.textContent = record.summary;

    button.append(title, summary);
    chatHistory.appendChild(button);
  });

  if (chatRecords.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'history-empty';
    empty.textContent = 'No saved lessons yet.';
    chatHistory.appendChild(empty);
  }
}

function saveCurrentChat(): void {
  if (!conversationInner.innerHTML.trim()) {
    return;
  }

  const title = lessonTitle.textContent?.trim() || 'Untitled lesson';
  const summary = currentChatSummary();
  const existing = activeChatId
    ? chatRecords.find((record) => record.id === activeChatId)
    : undefined;

  if (existing) {
    existing.title = title;
    existing.summary = summary;
    existing.html = conversationInner.innerHTML;
  } else {
    activeChatId = `lesson-${nextChatId}`;
    nextChatId += 1;
    chatRecords.unshift({
      id: activeChatId,
      title,
      summary,
      html: conversationInner.innerHTML,
    });
  }

  renderChatHistory();
}

function clearPendingResponse(): void {
  if (responseTimer === null) {
    return;
  }

  window.clearTimeout(responseTimer);
  responseTimer = null;
}

function makeSvg<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number>,
): SVGElementTagNameMap[K] {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);

  Object.entries(attrs).forEach(([key, value]) => {
    node.setAttribute(key, String(value));
  });

  return node;
}

function drawGrid(): void {
  gridLayer.innerHTML = '';

  for (let x = -2; x <= 2.6; x += 0.5) {
    gridLayer.appendChild(makeSvg('line', {
      class: 'grid-line',
      x1: sx(x),
      y1: plot.top,
      x2: sx(x),
      y2: plot.bottom,
    }));
  }

  for (let y = 0; y <= 3.2; y += 0.5) {
    gridLayer.appendChild(makeSvg('line', {
      class: 'grid-line',
      x1: plot.left,
      y1: sy(y),
      x2: plot.right,
      y2: sy(y),
    }));
  }
}

function curveD(): string {
  const parts: string[] = [];

  for (let i = 0; i <= 120; i += 1) {
    const x = plot.xMin + (plot.xMax - plot.xMin) * (i / 120);
    const p = point(x);
    parts.push(`${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`);
  }

  return parts.join(' ');
}

function updateInteractive(): void {
  const x = Number(xSlider.value);
  const dx = Number(dxSlider.value);
  const y = mathFunction(x);
  const slope = derivative(x);
  const p = point(x);
  const p2 = point(Math.min(x + dx, plot.xMax));

  const tangentSpan = 1.12;
  const xA = Math.max(plot.xMin, x - tangentSpan);
  const xB = Math.min(plot.xMax, x + tangentSpan);
  const yA = y + slope * (xA - x);
  const yB = y + slope * (xB - x);

  tangentLine.setAttribute('x1', String(sx(xA)));
  tangentLine.setAttribute('y1', String(sy(yA)));
  tangentLine.setAttribute('x2', String(sx(xB)));
  tangentLine.setAttribute('y2', String(sy(yB)));

  dxLine.setAttribute('x1', String(p.x));
  dxLine.setAttribute('y1', String(p.y));
  dxLine.setAttribute('x2', String(p2.x));
  dxLine.setAttribute('y2', String(p2.y));

  mainPoint.setAttribute('cx', String(p.x));
  mainPoint.setAttribute('cy', String(p.y));
  dxPoint.setAttribute('cx', String(p2.x));
  dxPoint.setAttribute('cy', String(p2.y));

  xMetric.textContent = fmt(x);
  slopeMetric.textContent = fmt(slope);
  dxMetric.textContent = fmt(dx);
  readoutOne.textContent = `x = ${fmt(x)}`;
  readoutTwo.textContent = `f(x) = ${fmt(y)}`;
  readoutThree.textContent = `slope = ${fmt(slope)}`;
}

function setView(view: ViewMode): void {
  document.body.dataset.view = view;

  document.querySelectorAll<HTMLElement>('[data-view-choice]').forEach((button) => {
    button.classList.toggle('active', button.dataset.viewChoice === view);
  });

  const currentPath = `${window.location.pathname}${window.location.search}`;

  if (view === 'interactive') {
    history.replaceState(null, '', `${currentPath}#interactive`);
    updateInteractive();
  } else if (window.location.hash === '#interactive') {
    history.replaceState(null, '', currentPath);
  }

  window.scrollTo(0, 0);
}

function titleFromPrompt(prompt: string): string {
  const cleaned = prompt
    .replace(/^explain\s+/i, '')
    .replace(/\s+with\s+.*/i, '')
    .trim();

  if (!cleaned) {
    return 'STEM explainer';
  }

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function appendUserMessage(text: string): void {
  const article = document.createElement('article');
  article.className = 'message';
  article.innerHTML = `
    <div class="avatar user">You</div>
    <div class="message-body">
      <div class="user-bubble"></div>
    </div>
  `;

  const bubble = article.querySelector<HTMLDivElement>('.user-bubble');

  if (!bubble) {
    throw new Error('Missing user bubble.');
  }

  bubble.textContent = text;
  conversationInner.appendChild(article);
  conversation.scrollTop = conversation.scrollHeight;
}

function appendThinkingMessage(): HTMLElement {
  const article = document.createElement('article');
  article.className = 'message';
  article.innerHTML = `
    <div class="avatar assistant">MV</div>
    <div class="message-body">
      <div class="thinking"><span class="pulse-dot"></span><span>Storyboarding scenes</span></div>
    </div>
  `;
  conversationInner.appendChild(article);
  conversation.scrollTop = conversation.scrollHeight;

  return article;
}

function appendVideoMessage(prompt: string): void {
  const title = titleFromPrompt(prompt);
  const safeTitle = escapeHtml(title);

  state.concept = title;
  lessonTitle.textContent = title;
  interactiveTitle.textContent = `${title} explorer`;

  const article = document.createElement('article');
  article.className = 'message';
  article.innerHTML = `
    <div class="avatar assistant">MV</div>
    <div class="message-body">
      <p>The explainer is ready as a video draft, with a matching interactive visual.</p>
      <div class="video-result">
        <div class="video-stage">
          <div class="stage-frame">
            <video class="preview-video" poster="${derivativePosterUrl}" preload="metadata" playsinline controls data-preview-video>
              <source src="${derivativeVideoUrl}" type="video/mp4">
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
    </div>
  `;
  conversationInner.appendChild(article);
  conversation.scrollTop = conversation.scrollHeight;
}

function submitPrompt(text: string): void {
  const prompt = text.trim();

  if (!prompt) {
    return;
  }

  promptInput.value = '';
  appendUserMessage(prompt);

  const thinking = appendThinkingMessage();

  clearPendingResponse();
  responseTimer = window.setTimeout(() => {
    thinking.remove();
    appendVideoMessage(prompt);
    responseTimer = null;
  }, 620);
}

function startNewLesson(): void {
  clearPendingResponse();
  saveCurrentChat();
  activeChatId = null;
  state.concept = 'New lesson';
  lessonTitle.textContent = state.concept;
  interactiveTitle.textContent = 'Interactive explorer';
  promptInput.value = '';
  conversationInner.innerHTML = '';
  conversation.scrollTop = 0;
  setView('chat');
  renderChatHistory();
  promptInput.focus();
}

function restoreChat(id: string): void {
  const record = chatRecords.find((item) => item.id === id);

  if (!record) {
    return;
  }

  clearPendingResponse();
  saveCurrentChat();
  activeChatId = record.id;
  state.concept = record.title;
  lessonTitle.textContent = record.title;
  interactiveTitle.textContent = `${record.title} explorer`;
  promptInput.value = '';
  conversationInner.innerHTML = record.html;
  conversation.scrollTop = 0;
  setView('chat');
  renderChatHistory();
  promptInput.focus();
}

function playSweep(): void {
  if (state.playing) {
    return;
  }

  state.playing = true;
  playButton.textContent = 'Playing';

  const start = performance.now();
  const duration = 2600;

  function frame(now: number): void {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 0.5 - Math.cos(progress * Math.PI) / 2;
    xSlider.value = String(-1.65 + eased * 3.65);
    updateInteractive();

    if (progress < 1) {
      requestAnimationFrame(frame);
    } else {
      state.playing = false;
      playButton.textContent = 'Play sweep';
    }
  }

  requestAnimationFrame(frame);
}

function playPreview(trigger: Element): void {
  const frame = trigger.closest('.stage-frame');
  const video = frame?.querySelector<HTMLVideoElement>('[data-preview-video]');

  if (!frame || !video) {
    return;
  }

  frame.classList.add('is-playing');
  void video.play();
}

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

  const historyItem = event.target.closest<HTMLElement>('[data-chat-id]');

  if (historyItem?.dataset.chatId) {
    restoreChat(historyItem.dataset.chatId);
    return;
  }

  if (event.target.closest('[data-open-interactive]')) {
    setView('interactive');
  }

  if (event.target.closest('[data-play-preview]')) {
    playPreview(event.target);
  }
});

promptForm.addEventListener('submit', (event) => {
  event.preventDefault();
  submitPrompt(promptInput.value);
});

getElement<HTMLButtonElement>('newChatButton').addEventListener('click', () => {
  startNewLesson();
});

xSlider.addEventListener('input', updateInteractive);
dxSlider.addEventListener('input', updateInteractive);
playButton.addEventListener('click', playSweep);

drawGrid();
const curve = curveD();
curvePath.setAttribute('d', curve);
ghostCurve.setAttribute('d', curve);
renderChatHistory();
setView(window.location.hash === '#interactive' ? 'interactive' : 'chat');
updateInteractive();
