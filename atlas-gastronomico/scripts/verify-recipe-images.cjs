// Read-only browser smoke test against a production build. No external services.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium, request } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const root = path.resolve(__dirname, '..');
const out = path.resolve(root, '../image-validation');
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';
const photos = JSON.parse(fs.readFileSync(path.join(root, 'src/data/recipe-photos.json')));
const audit = JSON.parse(fs.readFileSync(path.join(root, 'docs/recipe-photo-audit.json')));
fs.mkdirSync(out, { recursive: true });

async function loaded(locator) {
  await locator.scrollIntoViewIfNeeded();
  await locator.evaluate(img => new Promise((resolve, reject) => {
    if (img.complete) return img.naturalWidth ? resolve() : reject(new Error('Broken image: ' + img.src));
    const timer = setTimeout(() => reject(new Error('Image timeout: ' + img.src)), 15000);
    img.addEventListener('load', () => { clearTimeout(timer); resolve(); }, { once: true });
    img.addEventListener('error', () => { clearTimeout(timer); reject(new Error('Image failed: ' + img.src)); }, { once: true });
  }));
}

(async () => {
  const result = { assetRequests: 0, desktop: {}, mobile: {}, arabic: {}, pending: {}, localImageErrors: [] };
  const api = await request.newContext({ baseURL: base });
  const urls = [...new Set(Object.values(photos).flatMap(p => [p.url, p.thumbnailUrl]))];
  for (let i = 0; i < urls.length; i += 12) {
    await Promise.all(urls.slice(i, i + 12).map(async url => {
      const response = await api.get(url);
      assert.equal(response.status(), 200, url);
      assert.match(response.headers()['content-type'], /^image\/webp/, url);
      assert.ok((await response.body()).length > 100, url);
      result.assetRequests++;
      await response.dispose();
    }));
  }
  await api.dispose();
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    await context.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
    const page = await context.newPage();
    page.on('response', response => {
      if (response.url().startsWith(base + '/images/') && response.status() >= 400) result.localImageErrors.push(response.url());
    });
    await page.goto(base + '/es', { waitUntil: 'networkidle' });
    const covers = page.locator('.destination-card');
    assert.equal(await covers.count(), 11);
    const coverImages = covers.locator('img');
    for (let i = 0; i < await coverImages.count(); i++) await loaded(coverImages.nth(i));
    await page.locator('.destination-grid').screenshot({ path: path.join(out, 'country-covers-desktop.png'), animations: 'disabled' });
    result.desktop.countryCovers = await covers.count();
    const france = covers.filter({ has: page.locator('.country-code', { hasText: /^FR$/ }) });
    const francePath = await france.getAttribute('href');
    assert.ok(francePath && francePath.startsWith('/es/'));
    await page.goto(base + francePath, { waitUntil: 'networkidle' });
    const cards = page.locator('.recipe-card');
    assert.equal(await cards.count(), 4);
    for (let i = 0; i < await cards.locator('img').count(); i++) await loaded(cards.locator('img').nth(i));
    await page.screenshot({ path: path.join(out, 'france-recipes-desktop.png'), fullPage: true, animations: 'disabled' });
    result.desktop.franceRecipeCards = await cards.count();
    await page.goto(base + '/es/receta/coq-au-vin', { waitUntil: 'networkidle' });
    const hero = page.locator('figure').first().locator('img');
    await loaded(hero);
    assert.equal(await hero.getAttribute('loading'), 'eager');
    assert.equal(await hero.getAttribute('fetchpriority'), 'high');
    const expected = 'https://worldbitesapp.com' + photos['coq-au-vin'].url;
    assert.equal(await page.locator('meta[property="og:image"]').first().getAttribute('content'), expected);
    const structured = await page.locator('script[type="application/ld+json"]').allTextContents();
    assert.ok(structured.some(text => text.includes(expected)));
    await page.locator('figure').first().screenshot({ path: path.join(out, 'recipe-photo-desktop.png'), animations: 'disabled' });
    result.desktop.recipeHero = 'loaded; eager; metadata matches';
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: 'networkidle' });
    await loaded(page.locator('figure').first().locator('img'));
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Mobile horizontal overflow');
    await page.screenshot({ path: path.join(out, 'recipe-mobile.png'), animations: 'disabled' });
    result.mobile = { width: 390, image: 'loaded', horizontalOverflow: false };
    await page.goto(base + '/ar/receta/coq-au-vin', { waitUntil: 'networkidle' });
    await loaded(page.locator('figure').first().locator('img'));
    assert.ok(await page.locator('[dir="rtl"]').count());
    await page.screenshot({ path: path.join(out, 'recipe-arabic-mobile.png'), animations: 'disabled' });
    result.arabic = { image: 'loaded', direction: 'rtl' };
    if (audit.pending.length) {
      const pending = audit.pending[0];
      await page.goto(base + '/es/receta/' + pending.slug, { waitUntil: 'networkidle' });
      const figure = page.locator('figure').first();
      assert.equal(await figure.locator('img').count(), 0);
      assert.ok((await figure.innerText()).includes('Fotografía del plato pendiente'));
      result.pending = { slug: pending.slug, brokenImageRequest: false, explicitNotice: true };
    }
    assert.equal(result.localImageErrors.length, 0);
    fs.writeFileSync(path.join(out, 'browser-results.json'), JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
    await context.close();
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
