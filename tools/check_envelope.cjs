const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');

(async () => {
  const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
  const errors = [];
  const base = process.env.BASE_URL || 'http://127.0.0.1:8000';
  fs.mkdirSync('test-results', { recursive: true });
  try {
    for (const [name, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844], ['small', 320, 568], ['landscape', 844, 390]]) {
      const context = await browser.newContext({ viewport: { width, height } });
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      page.on('response', response => { if (response.status() >= 400) errors.push(response.url()); });
      await page.goto(base, { waitUntil: 'networkidle' });
      await page.locator('#welcome-music').uncheck();
      assert(await page.locator('#welcome').evaluate(el => el.open));
      const bounds = await page.locator('#open-invitation').boundingBox();
      assert(bounds.x >= 0 && bounds.x + bounds.width <= width && bounds.y >= 0 && bounds.y + bounds.height <= height, `${name}: envelope fits viewport`);
      assert(await page.locator('#welcome').evaluate(el => el.scrollWidth <= el.clientWidth), `${name}: no horizontal overflow`);
      await page.screenshot({ path: `test-results/envelope-${name}.png` });
      await page.locator('#open-invitation').click();
      assert(await page.locator('#open-invitation').isDisabled(), 'Repeated clicks cannot restart opening');
      await page.waitForTimeout(700);
      assert(await page.locator('#welcome').evaluate(el => el.open), 'Animation does not close immediately');
      assert.notEqual(await page.locator('.envelope-seal').evaluate(el => getComputedStyle(el).filter), 'none', 'Seal illuminates before the flap opens');
      if (name === 'mobile') {
        await page.screenshot({ path: 'test-results/envelope-opening.png' });
        await page.locator('.envelope-bridge').waitFor({ state: 'attached' });
        assert.equal(await page.locator('.envelope-bridge').count(), 1, 'The same card travels into the hero');
        assert.equal(await page.locator('#couple-names').count(), 1, 'Transition clones do not duplicate IDs');
        await page.screenshot({ path: 'test-results/envelope-letter.png' });
      }
      await page.waitForFunction(() => !document.querySelector('#welcome').open, { timeout: 5000 });
      assert.equal(await page.evaluate(() => document.activeElement.id), 'couple-names');
      assert.equal(await page.locator('#couple-names').evaluate(el => getComputedStyle(el).outlineStyle), 'none', 'Names have no focus frame');
      assert(await page.locator('#background-audio').evaluate(el => el.paused));
      assert.equal(await page.evaluate(() => document.body.style.overflow), '');
      assert.equal(await page.locator('.envelope-bridge, .envelope-preview').count(), 0, 'Temporary cards are removed');
      assert(!(await page.locator('body').evaluate(el => el.classList.contains('is-revealing'))), 'Transition classes are cleaned up');
      await page.locator('#replay-invitation').click();
      assert(await page.locator('#welcome').evaluate(el => el.open), 'Replay works');
      assert(!(await page.locator('#open-invitation').isDisabled()));
      await page.keyboard.press('Escape');
      assert(!(await page.locator('#welcome').evaluate(el => el.open)), 'Escape closes intro');
      await page.locator('#replay-invitation').click();
      await page.locator('#welcome-music').check();
      await page.locator('#open-invitation').focus();
      await page.keyboard.press('Enter');
      await page.waitForFunction(() => !document.querySelector('#welcome').open);
      await page.waitForFunction(() => document.querySelector('#background-audio').currentTime > 0);
      await page.locator('#music-toggle').click();
      assert(await page.locator('#background-audio').evaluate(el => el.paused));
      await page.reload({ waitUntil: 'networkidle' });
      assert(!(await page.locator('#welcome').evaluate(el => el.open)), 'Repeat visit preserves session');
      await context.close();
    }
    for (const interruption of ['escape', 'resize', 'motion']) {
      const interrupted = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const tab = await interrupted.newPage();
      await tab.goto(base, { waitUntil: 'networkidle' });
      await tab.keyboard.press('Escape');
      await tab.locator('#replay-invitation').click();
      await tab.locator('#welcome-music').uncheck();
      await tab.locator('#open-invitation').click();
      await tab.locator('.envelope-bridge').waitFor({ state: 'attached' });
      assert.equal(await tab.evaluate(() => window.scrollY), 0, 'Replay returns to the hero before handoff');
      if (interruption === 'escape') await tab.keyboard.press('Escape');
      if (interruption === 'resize') await tab.setViewportSize({ width: 844, height: 390 });
      if (interruption === 'motion') await tab.emulateMedia({ reducedMotion: 'reduce' });
      await tab.waitForFunction(() => !document.querySelector('#welcome').open);
      assert.equal(await tab.locator('.envelope-bridge, .envelope-preview').count(), 0, `${interruption}: transition is cleaned up`);
      assert.equal(await tab.evaluate(() => document.body.style.overflow), '');
      await interrupted.close();
    }
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.locator('#welcome-music').uncheck();
    await page.locator('#open-invitation').click();
    await page.waitForFunction(() => !document.querySelector('#welcome').open, null, { timeout: 700 });
    await context.close();
    assert.deepEqual(errors, []);
    console.log('PASS: animated opening, 4 viewports, replay, keyboard, Escape, focus, audio, returning visitor, reduced motion.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
