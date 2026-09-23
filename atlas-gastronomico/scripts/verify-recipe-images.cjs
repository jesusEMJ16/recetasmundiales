// Read-only browser smoke test against a production build and explicitly reviewed image origins.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium, request } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const root = path.resolve(__dirname, '..');
const out = path.resolve(root, '../image-validation');
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';
const photos = JSON.parse(fs.readFileSync(path.join(root, 'src/data/recipe-photos.json')));
const audit = JSON.parse(fs.readFileSync(path.join(root, 'docs/recipe-photo-audit.json')));
const recipes = JSON.parse(fs.readFileSync(path.join(root, 'src/data/recipes-reviewed.json')));
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
      assert.match(response.headers()['content-type'], /^image\/(webp|jpeg)/, url);
      assert.ok((await response.body()).length > 100, url);
      result.assetRequests++;
      await response.dispose();
    }));
  }
  await api.dispose();
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    const allowedOrigins = new Set([
      new URL(base).origin,
      ...Object.values(photos).flatMap(photo => [photo.url, photo.thumbnailUrl])
        .filter(url => /^https:\/\//.test(url)).map(url => new URL(url).origin),
    ]);
    await context.route('**/*', route => allowedOrigins.has(new URL(route.request().url()).origin) ? route.continue() : route.abort());
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
    assert.equal(await cards.count(), recipes.filter(r => /^fr(?:$|[-:])/.test(r.placeId)).length);
    for (const slug of ['boeuf-bourguignon', 'soupe-a-loignon-gratinee', 'quiche-lorraine', 'tarte-tatin', 'creme-brulee']) {
      assert.equal(await page.locator(`a.recipe-card[href="/es/receta/${slug}"]`).count(), 1);
    }
    for (let i = 0; i < await cards.locator('img').count(); i++) await loaded(cards.locator('img').nth(i));
    await page.screenshot({ path: path.join(out, 'france-recipes-desktop.png'), fullPage: true, animations: 'disabled' });
    result.desktop.franceRecipeCards = await cards.count();
    await page.goto(base + '/es', { waitUntil: 'networkidle' });
    const italy = page.locator('.destination-card').filter({ has: page.locator('.country-code', { hasText: /^IT$/ }) });
    const italyPath = await italy.getAttribute('href');
    assert.ok(italyPath && italyPath.startsWith('/es/'));
    await page.goto(base + italyPath, { waitUntil: 'networkidle' });
    const italyCards = page.locator('.recipe-card');
    assert.equal(await italyCards.count(), recipes.filter(r => /^it(?:$|[-:])/.test(r.placeId)).length);
    for (const slug of ['lasagne-verdi-alla-bolognese', 'trofie-al-pesto-genovese', 'arancini-siciliani-al-ragu', 'orecchiette-con-cime-di-rapa']) {
      assert.equal(await page.locator(`a.recipe-card[href="/es/receta/${slug}"]`).count(), 1);
    }
    for (let i = 0; i < await italyCards.locator('img').count(); i++) await loaded(italyCards.locator('img').nth(i));
    result.desktop.italyRecipeCards = await italyCards.count();
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
    await page.goto(base + '/es/receta/boeuf-bourguignon', { waitUntil: 'networkidle' });
    const newHero = page.locator('figure').first().locator('img');
    await loaded(newHero);
    assert.match(await newHero.getAttribute('alt'), /Boeuf bourguignon: Estofado/);
    assert.equal(await page.locator('meta[property="og:image"]').first().getAttribute('content'), 'https://worldbitesapp.com' + photos['boeuf-bourguignon'].url);
    const newSchemas = await page.locator('script[type="application/ld+json"]').allTextContents();
    const newRecipe = newSchemas.map(JSON.parse).flatMap(schema => schema['@graph'] ?? [schema]).find(entry => entry['@type'] === 'Recipe');
    assert.ok(newRecipe, 'New recipe structured data');
    assert.equal(newRecipe.aggregateRating, undefined);
    assert.equal(newRecipe.datePublished, '2026-09-23');
    assert.equal(await page.locator('link[rel="alternate"][hreflang]').count(), 12);
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
    const original = Object.entries(photos).find(([, photo]) => photo.provider === 'WorldBites');
    assert.ok(original, 'Expected an original illustration');
    await page.goto(base + '/es/receta/' + original[0], { waitUntil: 'networkidle' });
    const originalFigure = page.locator('figure').first();
    const originalImage = originalFigure.locator('img');
    await loaded(originalImage);
    assert.ok((await originalImage.getAttribute('alt')).includes(': '), 'Localized descriptive alt text');
    assert.equal(await originalFigure.locator('figcaption').count(), 0);
    result.desktop.originalIllustration = { slug: original[0], loaded: true, descriptiveAlt: true };
    await page.goto(base + '/es/recetas/mexico', { waitUntil: 'networkidle' });
    await page.locator('.map-region').first().waitFor();
    assert.equal(await page.locator('.atlas-sidebar').count(), 0);
    assert.ok(await page.locator('.map-region-inline').count() > 0);
    assert.equal(await page.locator('.map-pin-inner').count(), 0);
    result.desktop.mexicoMap = { regions: await page.locator('.map-region').count(), labelsInsideMap: true };
    assert.equal(result.localImageErrors.length, 0);
    fs.writeFileSync(path.join(out, 'browser-results.json'), JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
    await context.close();
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
