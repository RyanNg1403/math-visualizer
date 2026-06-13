const {chromium} = require('playwright');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'evidence', 'deck');
fs.mkdirSync(outDir, {recursive: true});

async function flush(page) {
  await page.evaluate(async () => {
    for (let k = 0; k < 800; k++) {
      window.__deck.flushTweens();
      await Promise.resolve();
    }
  });
}

async function finishSlide(page, index) {
  await page.evaluate(i => window.__deck.goTo(i, false), index);
  const beats = await page.evaluate(() => window.__deck.slides[window.__deck.state().cur].beats.length);
  for (let b = 0; b < beats; b++) {
    await page.evaluate(() => window.__deck.playBeat());
    await flush(page);
  }
  await page.waitForTimeout(80);
}

async function driveRange(page, slideIndex, value) {
  const range = page.locator('.slide.active input[type=range]').first();
  await range.waitFor({state: 'visible', timeout: 3000});
  const box = await range.boundingBox();
  if (!box) throw new Error(`No range box on slide ${slideIndex + 1}`);
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2, {steps: 8});
  await page.mouse.up();
  await range.evaluate((el, v) => {
    el.value = String(v);
    el.dispatchEvent(new Event('input', {bubbles: true}));
    el.dispatchEvent(new Event('change', {bubbles: true}));
  }, value);
  await page.waitForTimeout(80);
  return page.locator('.slide.active .ctrl .val').first().innerText();
}

async function main() {
  const browser = await chromium.launch({headless: true});
  const page = await browser.newPage({viewport: {width: 1440, height: 900}, deviceScaleFactor: 1});
  const messages = [];
  page.on('console', msg => messages.push({type: msg.type(), text: msg.text()}));
  page.on('pageerror', err => messages.push({type: 'pageerror', text: err.stack || err.message}));
  await page.goto('http://127.0.0.1:8200/taylor-deck.html', {waitUntil: 'networkidle'});
  await page.waitForFunction(() => window.__deck && window.katex);
  await flush(page);

  const slideCount = await page.evaluate(() => window.__deck.slides.length);
  const interactionEvidence = [];
  const katexEvidence = [];
  for (let i = 0; i < slideCount; i++) {
    await finishSlide(page, i);
    katexEvidence.push(`slide ${i + 1}: ${await page.locator('.slide.active .katex').count()}`);
    await page.screenshot({path: path.join(outDir, `slide-${String(i + 1).padStart(2, '0')}.png`), fullPage: false});

    if ([3, 5, 8].includes(i)) {
      const values = {3: '1.1', 5: '7', 8: '1.12'}[i];
      const readback = await driveRange(page, i, values);
      interactionEvidence.push(`slide ${i + 1}: ${readback}`);
      await page.screenshot({path: path.join(outDir, `slide-${String(i + 1).padStart(2, '0')}-interaction.png`), fullPage: false});
    }

    await page.keyboard.press('r');
    await page.waitForTimeout(100);
    await flush(page);
    const replayState = await page.evaluate(() => window.__deck.state());
    if (replayState.cur !== i) throw new Error(`Replay moved away from slide ${i + 1}`);
  }

  const katexCount = katexEvidence.reduce((sum, line) => sum + Number(line.split(': ')[1]), 0);
  const badMessages = messages.filter(m => ['error', 'pageerror'].includes(m.type) || /beat error|ReferenceError|TypeError|SyntaxError/i.test(m.text));
  fs.writeFileSync(path.join(outDir, 'console.json'), JSON.stringify(messages, null, 2));
  fs.writeFileSync(path.join(outDir, 'interactions.txt'), interactionEvidence.join('\n') + '\n');
  fs.writeFileSync(path.join(outDir, 'summary.txt'), [
    `slides=${slideCount}`,
    `katex_nodes=${katexCount}`,
    `console_error_count=${badMessages.length}`,
    `screenshots=${slideCount}`,
    ...interactionEvidence,
    ...katexEvidence,
  ].join('\n') + '\n');
  await browser.close();
  if (badMessages.length) {
    console.error(JSON.stringify(badMessages, null, 2));
    process.exit(1);
  }
  console.log(`verified ${slideCount} slides; ${katexCount} KaTeX nodes`);
  console.log(interactionEvidence.join('\n'));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
