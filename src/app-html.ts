// Static shell for the STEM Visualizer web app. No lesson is hard-coded here:
// all content (videos, posters, decks, the library) is injected by main.ts from
// the explainer registry, and new lessons come from the LLM seam in ./llm.ts.
// See ARCHITECTURE.md for the per-explainer contract (video = illustration,
// deck = interactive mode).
export const appHtml = `<div class="app">
  <aside class="sidebar" aria-label="Workspace">
    <div class="brand-row">
      <div class="brand-mark">S</div>
      <div class="brand-copy">
        <strong>STEM Visualizer</strong>
        <span>STEM animation studio</span>
      </div>
    </div>

    <button class="new-chat" type="button" id="newChatButton">
      <span>+</span>
      <span>New lesson</span>
    </button>

    <section class="sidebar-section recent-wrap" aria-labelledby="libraryLabel">
      <span class="sidebar-label" id="libraryLabel">Library</span>
      <div class="recent-list" id="lessonList"></div>
    </section>
  </aside>

  <main class="main">
    <header class="topbar">
      <div class="lesson-title">
        <strong id="lessonTitle">STEM Visualizer</strong>
      </div>
    </header>

    <div class="workspace">
      <section class="view chat-view" aria-label="Chat mode">
        <div class="chat-shell">
          <div class="conversation" id="conversation">
            <div class="conversation-inner" id="conversationInner"></div>
          </div>

          <div class="composer-wrap">
            <form class="composer" id="promptForm">
              <div class="prompt-row" aria-label="Prompt examples">
                <button class="prompt-chip" type="button" data-example="Explain Fourier series with rotating vectors">Fourier series</button>
                <button class="prompt-chip" type="button" data-example="Explain Bayes theorem with nested areas">Bayes theorem</button>
                <button class="prompt-chip" type="button" data-example="Explain gradient descent on a 3D loss surface">Gradient descent</button>
              </div>
              <div class="input-row">
                <input class="prompt-input" id="promptInput" type="text" autocomplete="off" placeholder="Message STEM Visualizer">
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
              <strong id="interactiveTitle">Interactive explorer</strong>
              <span id="interactiveSubtitle">Click the deck, then press → to step through and ← to go back.</span>
            </div>
            <div class="interactive-actions">
              <button class="secondary-action" type="button" data-view-choice="chat">Back to chat</button>
            </div>
          </div>
          <div class="deck-wrap">
            <iframe id="deckFrame" class="deck-frame" title="Interactive explainer deck" allow="fullscreen"></iframe>
          </div>
        </div>
      </section>
    </div>
  </main>
</div>`;
