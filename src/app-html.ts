// Lesson assets come from the shared explainer registry (the single source of
// truth). Add a new entry there and it's available here — see ARCHITECTURE.md.
import { getExplainer } from '../explainers/registry';

const derivative = getExplainer('derivative')!;
export const derivativeVideoUrl = derivative.video;
export const derivativePosterUrl = derivative.poster;

export const appHtml = `<div class="app">
  <aside class="sidebar" aria-label="Workspace">
    <div class="brand-row">
      <div class="brand-mark">M</div>
      <div class="brand-copy">
        <strong>Math Visualizer</strong>
        <span>STEM animation studio</span>
      </div>
    </div>

    <button class="new-chat" type="button" id="newChatButton">
      <span>+</span>
      <span>New lesson</span>
    </button>

    <section class="sidebar-section recent-wrap" aria-labelledby="historyLabel">
      <span class="sidebar-label" id="historyLabel">History</span>
      <div class="recent-list" id="chatHistory"></div>
    </section>
  </aside>

  <main class="main">
    <header class="topbar">
      <div class="lesson-title">
        <strong id="lessonTitle">Derivative explainer</strong>
      </div>
    </header>

    <div class="workspace">
      <section class="view chat-view" aria-label="Chat mode">
        <div class="chat-shell">
          <div class="conversation" id="conversation">
            <div class="conversation-inner" id="conversationInner">
              <article class="message">
                <div class="avatar assistant">MV</div>
                <div class="message-body">
                  <p>A derivative tells us the instantaneous rate of change at one point on a curve. Here, the tangent line turns that idea into something you can see.</p>
                </div>
              </article>

              <article class="message">
                <div class="avatar user">You</div>
                <div class="message-body">
                  <div class="user-bubble">Explain derivatives with an animated tangent line</div>
                </div>
              </article>

              <article class="message">
                <div class="avatar assistant">MV</div>
                <div class="message-body">
                  <p>I built a concise explainer with a 3Blue1Brown-inspired curve, tangent, and rate-of-change readout.</p>
                  <div class="video-result">
                    <div class="video-stage">
                      <div class="stage-frame">
                        <video class="preview-video" poster="${derivativePosterUrl}" preload="metadata" playsinline controls data-preview-video>
                          <source src="${derivativeVideoUrl}" type="video/mp4">
                        </video>
                        <button class="preview-play-button" type="button" data-play-preview aria-label="Play Derivative of a curve video">
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
              </article>
            </div>
          </div>

          <div class="composer-wrap">
            <form class="composer" id="promptForm">
              <div class="prompt-row" aria-label="Prompt examples">
                <button class="prompt-chip" type="button" data-example="Explain Fourier series with rotating vectors">Fourier series</button>
                <button class="prompt-chip" type="button" data-example="Explain Bayes theorem with nested areas">Bayes theorem</button>
                <button class="prompt-chip" type="button" data-example="Explain gradient descent on a 3D loss surface">Gradient descent</button>
              </div>
              <div class="input-row">
                <input class="prompt-input" id="promptInput" type="text" autocomplete="off" placeholder="Message Math Visualizer">
                <button class="send-button" type="submit" aria-label="Send">-&gt;</button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section class="view interactive-view" aria-label="Interactive mode">
        <div class="interactive-shell">
          <div class="interactive-header">
            <div class="interactive-title">
              <strong id="interactiveTitle">Derivative explorer</strong>
              <span id="interactiveSubtitle">Move the point and watch the tangent update.</span>
            </div>
            <div class="interactive-actions">
              <button class="secondary-action" type="button" data-view-choice="chat">Back to chat</button>
              <button class="primary-action" type="button" id="playButton">Play sweep</button>
            </div>
          </div>

          <div class="visual-lab">
            <div class="board-wrap">
              <div class="board-surface">
                <svg class="math-board" viewBox="0 0 820 560" role="img" aria-label="Interactive derivative graph">
                  <rect x="0" y="0" width="820" height="560" fill="var(--surface)"></rect>
                  <g id="gridLayer"></g>
                  <polygon class="surface-plane" points="96,438 702,438 748,482 142,482"></polygon>
                  <line class="axis-line" id="xAxis" x1="96" y1="438" x2="702" y2="438"></line>
                  <line class="axis-line" id="yAxis" x1="142" y1="482" x2="142" y2="78"></line>
                  <path class="soft-line" id="ghostCurve"></path>
                  <path class="curve-line" id="curvePath"></path>
                  <line class="math-line" id="tangentLine" x1="0" y1="0" x2="0" y2="0"></line>
                  <line class="soft-line" id="dxLine" x1="0" y1="0" x2="0" y2="0"></line>
                  <circle class="plot-point" id="mainPoint" cx="0" cy="0" r="10"></circle>
                  <circle class="plot-point" id="dxPoint" cx="0" cy="0" r="7" opacity="0.58"></circle>
                  <rect class="label-chip" id="readoutBox" x="500" y="70" width="202" height="86" rx="8"></rect>
                  <text class="label-text" id="readoutOne" x="518" y="100">x = 0.00</text>
                  <text class="label-text" id="readoutTwo" x="518" y="126">f(x) = 0.00</text>
                  <text class="label-text" id="readoutThree" x="518" y="152">slope = 0.00</text>
                </svg>
              </div>
            </div>

            <aside class="control-panel" aria-label="Controls">
              <div class="metric-grid">
                <div class="metric">
                  <span>Current x</span>
                  <strong id="xMetric">0.00</strong>
                </div>
                <div class="metric">
                  <span>Slope</span>
                  <strong id="slopeMetric">0.00</strong>
                </div>
                <div class="metric">
                  <span>Delta x</span>
                  <strong id="dxMetric">0.38</strong>
                </div>
              </div>

              <div class="slider-block">
                <label for="xSlider">Point on curve</label>
                <input id="xSlider" type="range" min="-1.8" max="2.2" step="0.01" value="0.65">
              </div>

              <div class="slider-block">
                <label for="dxSlider">dx interval</label>
                <input id="dxSlider" type="range" min="0.12" max="0.86" step="0.01" value="0.38">
              </div>

              <p class="concept-notes" id="conceptNotes">The tangent line is the limit of a secant line as dx gets smaller.</p>
            </aside>
          </div>

          <div class="formula-strip">
            <span class="formula">f(x) = 0.18x^3 - 0.72x + 1.65</span>
            <span class="formula">slope = df / dx</span>
            <span class="style-note" id="styleNote">Ivory Scholar</span>
          </div>
        </div>
      </section>
    </div>
  </main>
</div>`;
