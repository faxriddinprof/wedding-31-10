// Render the existing CSS envelope into a static, crawler-friendly share card.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const asset = (relative, mime) => `data:${mime};base64,${fs.readFileSync(path.join(root, relative)).toString('base64')}`;

(async () => {
  const template = fs.readFileSync(path.join(root, 'templates/invitation/home.html'), 'utf8');
  let envelope = template.match(/<button id="open-invitation"[\s\S]*?<\/button>/)[0];
  envelope = envelope.replace(/\{% static '([^']+)' %\}/g, (_, file) => asset(`static/${file}`, file.endsWith('.svg') ? 'image/svg+xml' : 'image/jpeg'));
  const icons = fs.readFileSync(path.join(root, 'templates/invitation/icons.html'), 'utf8');
  let css = fs.readFileSync(path.join(root, 'static/invitation/envelope.css'), 'utf8');
  css = css.replace("url('images/garden.jpg')", `url('${asset('static/invitation/images/garden.jpg', 'image/jpeg')}')`);
  const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
    await page.setContent(`<!doctype html><html lang="uz"><head><meta charset="utf-8"><style>
      @font-face{font-family:Cormorant;src:url('${asset('static/invitation/fonts/cormorant-regular.ttf', 'font/ttf')}')}
      @font-face{font-family:Manrope;src:url('${asset('static/invitation/fonts/manrope.ttf', 'font/ttf')}')}
      @font-face{font-family:Amiri;src:url('${asset('static/invitation/fonts/amiri.ttf', 'font/ttf')}')}
      :root{--ink:#3e4837;--gold:#ac8d50;--serif:Cormorant,serif;--sans:Manrope,sans-serif}
      *{box-sizing:border-box}body{margin:0;color:var(--ink);background:radial-gradient(ellipse at 30% 40%,#fffdf6,#eee8da);font-family:var(--sans)}body>svg{position:absolute;width:0;height:0;overflow:hidden}
      ${css}
      .card{width:1200px;height:630px;display:flex;align-items:center;gap:95px;padding:65px 100px;border:18px solid #f7f3e9;position:relative}
      .card:before{content:'';position:absolute;inset:31px;border:1px solid #c6b58980;pointer-events:none}
      .envelope-trigger{width:325px;height:480px;flex-shrink:0;pointer-events:none}
      .envelope-inscription{font-family:var(--sans)}.seal-initials{font-size:35px}
      .copy{flex:1;text-align:center}.bismillah{font:26px/1.5 Amiri,serif;color:#80704c;margin:0 0 13px}.eyebrow{font-size:11px;letter-spacing:3px;color:#8d7852;margin:0 0 22px}
      h1{font:78px/.9 var(--serif);margin:0}h1 span{display:block;font-size:37px;color:var(--gold);margin:8px 0}
      .rule{display:flex;align-items:center;justify-content:center;gap:15px;color:var(--gold);margin:22px auto 16px}.rule:before,.rule:after{content:'';height:1px;background:#c6b58980;width:65px}.rule svg{width:16px;height:16px;fill:currentColor}
      .invite{font:26px var(--serif);margin:0 0 19px}.date{font-size:16px;letter-spacing:1px;margin:0 0 12px}.place{font-size:12px;color:#827b69;margin:0}
    </style></head><body>${icons}<div class="card">${envelope}<div class="copy"><p class="bismillah" lang="ar" dir="rtl">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p><p class="eyebrow">NIKOH TO‘YIGA TAKLIFNOMA</p><h1>Asliddin<span>&</span>Go‘zal</h1><div class="rule"><svg><use href="#icon-star"/></svg></div><p class="invite">Sizni lutf bilan taklif etamiz.</p><p class="date">31-oktyabr 2026 · 18:00</p><p class="place">ODILBEK 555 · Samarqand</p></div></div></body></html>`, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(root, 'static/invitation/images/invitation-preview-v2.jpg'), type: 'jpeg', quality: 92 });
  } finally { await browser.close(); }
})();
