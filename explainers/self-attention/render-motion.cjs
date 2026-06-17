const {chromium} = require('playwright');
const fs = require('fs');
const path = require('path');

const projectDir = path.join(__dirname, 'motion-canvas');
const output = path.join(projectDir, 'output', 'project.mp4');
const evidenceDir = path.join(__dirname, 'evidence', 'video');
fs.mkdirSync(evidenceDir, {recursive: true});

function sizeOf(file) {
  try { return fs.statSync(file).size; } catch { return 0; }
}

async function waitForStableFile(file, timeoutMs = 12 * 60_000) {
  const start = Date.now();
  let last = -1;
  let stableCount = 0;
  while (Date.now() - start < timeoutMs) {
    const size = sizeOf(file);
    if (size > 1_000_000 && size === last) stableCount += 1;
    else stableCount = 0;
    last = size;
    if (stableCount >= 5) return size;
    await new Promise(r => setTimeout(r, 2000));
  }
  throw new Error(`Timed out waiting for stable render file; last size ${last}`);
}

async function main() {
  fs.rmSync(output, {force: true});
  const browser = await chromium.launch({channel: 'chrome', headless: true});
  const page = await browser.newPage({viewport: {width: 1440, height: 900}, deviceScaleFactor: 1});
  const messages = [];
  page.on('console', msg => {
    const item = {type: msg.type(), text: msg.text()};
    messages.push(item);
    if (['error', 'warning'].includes(item.type)) console.log(`[${item.type}] ${item.text}`);
  });
  page.on('pageerror', err => messages.push({type: 'pageerror', text: err.stack || err.message}));
  await page.goto('http://127.0.0.1:9300/', {waitUntil: 'networkidle'});
  await page.screenshot({path: path.join(evidenceDir, 'editor-before-render.png')});
  const bodyText = await page.locator('body').innerText();
  if (/Extra close brace|Missing argument|MathJax.*Error/i.test(bodyText)) {
    throw new Error('Editor body contains possible MathJax/render error text');
  }
  const renderButtons = page.getByRole('button', {name: /^Render$/i});
  const count = await renderButtons.count();
  if (!count) throw new Error('Render button not found');
  await renderButtons.last().click();
  await page.waitForTimeout(2000);
  await page.screenshot({path: path.join(evidenceDir, 'editor-render-started.png')});
  const finalSize = await waitForStableFile(output);
  fs.writeFileSync(path.join(evidenceDir, 'editor-console.json'), JSON.stringify(messages, null, 2));
  await page.screenshot({path: path.join(evidenceDir, 'editor-after-render.png')});
  await browser.close();
  const bad = messages.filter(m => ['error', 'pageerror'].includes(m.type) || /Extra close brace|Missing argument|Cannot read|TypeError|ReferenceError/i.test(m.text));
  if (bad.length) {
    console.error(JSON.stringify(bad, null, 2));
    process.exit(1);
  }
  console.log(`render complete: ${output} (${finalSize} bytes)`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
