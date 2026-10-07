/* Run with PLAYWRIGHT_MODULE pointing to an installed Playwright package. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');

(async () => {
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });
  const failures = [];
  const base = process.env.BASE_URL || 'http://127.0.0.1:8000';
  fs.mkdirSync('test-results', { recursive: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => failures.push(error.message));
    page.on('response', response => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'test-results/welcome-desktop.png' });
    assert(await page.locator('#welcome').evaluate(el => el.open), 'Welcome dialog opens');
    await page.locator('#welcome-music').uncheck();
    await page.locator('#open-invitation').click();
    await page.waitForFunction(() => !document.querySelector('#welcome').open);
    assert(await page.locator('#background-audio').evaluate(el => el.paused), 'Silent opening stays silent');
    await page.screenshot({ path: 'test-results/desktop-full.png', fullPage: true });
    await page.screenshot({ path: 'test-results/desktop-hero.png' });
    assert(await page.locator('#days').innerText() !== '—', 'Countdown initialized');
    await page.locator('#music-toggle').click();
    await page.waitForFunction(() => document.querySelector('#background-audio').currentTime > 0.2);
    assert.equal(await page.locator('#music-toggle').getAttribute('aria-pressed'), 'true');
    await page.locator('#music-toggle').click();
    assert(await page.locator('#background-audio').evaluate(el => el.paused), 'Audio can pause');
    assert.equal(await page.locator('#ishtirok, #rsvp-form').count(), 0, 'Removed section is absent');
    await page.reload({ waitUntil: 'networkidle' });
    assert(!(await page.locator('#welcome').evaluate(el => el.open)), 'Welcome does not obstruct repeat visit');
    const calendar = await context.request.get(base + '/wedding.ics');
    assert((await calendar.text()).includes('DTSTART:20261031T130000Z'));
    for (const width of [320, 375, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(base + '/#asosiy', { waitUntil: 'networkidle' });
      const dimensions = await page.evaluate(() => ({ screen: innerWidth, content: document.documentElement.scrollWidth }));
      if (dimensions.content > dimensions.screen) {
        console.log(await page.evaluate(() => [...document.querySelectorAll('main *')].filter(el => el.getBoundingClientRect().right > innerWidth + 1).map(el => ({ tag: el.tagName, class: el.className, right: el.getBoundingClientRect().right, width: el.getBoundingClientRect().width }))));
        await page.screenshot({ path: `test-results/overflow-${width}.png`, fullPage: true });
      }
      assert(dimensions.content <= dimensions.screen, `No horizontal overflow at ${width}px: ${JSON.stringify(dimensions)}`);
      if (width === 390) {
        await page.screenshot({ path: 'test-results/mobile-full.png', fullPage: true });
        await page.screenshot({ path: 'test-results/mobile-hero.png' });
      }
    }
    const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const mobile = await mobileContext.newPage();
    await mobile.goto(base, { waitUntil: 'networkidle' });
    await mobile.screenshot({ path: 'test-results/welcome-mobile.png' });
    await mobile.locator('#open-invitation').click();
    await mobile.waitForFunction(() => !document.querySelector('#welcome').open);
    await mobile.waitForFunction(() => document.querySelector('#background-audio').currentTime > 0.1);
    await mobile.locator('#music-toggle').click();
    assert(await mobile.locator('#background-audio').evaluate(el => el.paused));
    await mobileContext.close();
    const noJS = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const fallback = await noJS.newPage();
    await fallback.goto(base);
    assert(await fallback.locator('#couple-names').isVisible());
    assert(await fallback.locator('#welcome').isHidden());
    await noJS.close();
    assert.deepEqual(failures, [], 'No browser errors or failed resources');
    console.log('PASS: desktop/mobile, 6 viewport widths, music, calendar, reload, no-JS.');
    console.log('Screenshots saved in test-results/.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
