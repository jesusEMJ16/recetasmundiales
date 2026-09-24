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
  const urls = [...new Set(Object.values(photos).flatMap(p => [p.url, p.thumbnailUrl]).filter(url => url.startsWith('/')))];
  for (let i = 0; i < urls.length; i += 12) {
    await Promise.all(urls.slice(i, i + 12).map(async url => {
      const response = await api.get(url);
      assert.equal(response.status(), 200, url);
      assert.match(response.headers()['content-type'], /^image\/(webp|jpeg|svg\+xml)/, url);
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
    assert.equal(await covers.count(), 17);
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
    await page.goto(base + '/es', { waitUntil: 'networkidle' });
    const brazil = page.locator('.destination-card').filter({ has: page.locator('.country-code', { hasText: /^BR$/ }) });
    const brazilPath = await brazil.getAttribute('href');
    assert.ok(brazilPath && brazilPath.startsWith('/es/'));
    await page.goto(base + brazilPath, { waitUntil: 'networkidle' });
    const brazilCards = page.locator('.recipe-card');
    assert.equal(await brazilCards.count(), recipes.filter(r => /^br(?:$|[-:])/.test(r.placeId)).length);
    for (const slug of ['feijoada-brasileira', 'pao-de-queijo-mineiro', 'moqueca-baiana-de-pescado', 'brigadeiro-tradicional-brasileno']) {
      assert.equal(await page.locator(`a.recipe-card[href="/es/receta/${slug}"]`).count(), 1);
    }
    for (let i = 0; i < await brazilCards.locator('img').count(); i++) await loaded(brazilCards.locator('img').nth(i));
    result.desktop.brazilRecipeCards = await brazilCards.count();
    await page.goto(base + '/es', { waitUntil: 'networkidle' });
    const argentina = page.locator('.destination-card').filter({ has: page.locator('.country-code', { hasText: /^AR$/ }) });
    const argentinaPath = await argentina.getAttribute('href');
    assert.ok(argentinaPath && argentinaPath.startsWith('/es/'));
    await page.goto(base + argentinaPath, { waitUntil: 'networkidle' });
    const argentinaCards = page.locator('.recipe-card');
    assert.equal(await argentinaCards.count(), recipes.filter(r => /^ar(?:$|[-:])/.test(r.placeId)).length);
    for (const slug of ['asado-argentino-a-la-parrilla', 'empanadas-saltenas-argentinas', 'locro-criollo-argentino', 'alfajores-de-maicena-argentinos']) {
      assert.equal(await page.locator(`a.recipe-card[href="/es/receta/${slug}"]`).count(), 1);
    }
    for (let i = 0; i < await argentinaCards.locator('img').count(); i++) await loaded(argentinaCards.locator('img').nth(i));
    result.desktop.argentinaRecipeCards = await argentinaCards.count();
    await page.goto(base + '/es', { waitUntil: 'networkidle' });
    const peru = page.locator('.destination-card').filter({ has: page.locator('.country-code', { hasText: /^PE$/ }) });
    const peruPath = await peru.getAttribute('href');
    assert.ok(peruPath && peruPath.startsWith('/es/'));
    await page.goto(base + peruPath, { waitUntil: 'networkidle' });
    const peruCards = page.locator('.recipe-card');
    assert.equal(await peruCards.count(), recipes.filter(r => /^pe(?:$|[-:])/.test(r.placeId)).length);
    for (const slug of ['cebiche-de-pescado-peruano', 'lomo-saltado-peruano', 'aji-de-gallina-peruano', 'papa-a-la-huancaina-peruana']) {
      assert.equal(await page.locator(`a.recipe-card[href="/es/receta/${slug}"]`).count(), 1);
    }
    for (let i = 0; i < await peruCards.locator('img').count(); i++) await loaded(peruCards.locator('img').nth(i));
    result.desktop.peruRecipeCards = await peruCards.count();
    await page.goto(base + '/es', { waitUntil: 'networkidle' });
    const chile = page.locator('.destination-card').filter({ has: page.locator('.country-code', { hasText: /^CL$/ }) });
    const chilePath = await chile.getAttribute('href');
    assert.ok(chilePath && chilePath.startsWith('/es/'));
    await page.goto(base + chilePath, { waitUntil: 'networkidle' });
    const chileCards = page.locator('.recipe-card');
    assert.equal(await chileCards.count(), recipes.filter(r => /^cl(?:$|[-:])/.test(r.placeId)).length);
    for (const slug of ['pastel-de-choclo-chileno', 'empanadas-chilenas-de-pino', 'cazuela-chilena-de-vacuno', 'sopaipillas-chilenas']) {
      assert.equal(await page.locator(`a.recipe-card[href="/es/receta/${slug}"]`).count(), 1);
    }
    for (let i = 0; i < await chileCards.locator('img').count(); i++) await loaded(chileCards.locator('img').nth(i));
    result.desktop.chileRecipeCards = await chileCards.count();
    await page.goto(base + '/es', { waitUntil: 'networkidle' });
    const colombia = page.locator('.destination-card').filter({ has: page.locator('.country-code', { hasText: /^CO$/ }) });
    const colombiaPath = await colombia.getAttribute('href');
    assert.ok(colombiaPath && colombiaPath.startsWith('/es/'));
    await page.goto(base + colombiaPath, { waitUntil: 'networkidle' });
    const colombiaCards = page.locator('.recipe-card');
    assert.equal(await colombiaCards.count(), recipes.filter(r => /^co(?:$|[-:])/.test(r.placeId)).length);
    for (const slug of ['bandeja-paisa-colombiana', 'ajiaco-santafereno-colombiano', 'lechona-tolimense-colombiana', 'arepa-de-huevo-colombiana']) {
      assert.equal(await page.locator(`a.recipe-card[href="/es/receta/${slug}"]`).count(), 1);
    }
    for (let i = 0; i < await colombiaCards.locator('img').count(); i++) await loaded(colombiaCards.locator('img').nth(i));
    result.desktop.colombiaRecipeCards = await colombiaCards.count();
    await page.goto(base + '/es', { waitUntil: 'networkidle' });
    const morocco = page.locator('.destination-card').filter({ has: page.locator('.country-code', { hasText: /^MA$/ }) });
    const moroccoPath = await morocco.getAttribute('href');
    assert.ok(moroccoPath && moroccoPath.startsWith('/es/'));
    await page.goto(base + moroccoPath, { waitUntil: 'networkidle' });
    const moroccoCards = page.locator('.recipe-card');
    assert.equal(await moroccoCards.count(), recipes.filter(r => /^ma(?:$|[-:])/.test(r.placeId)).length);
    for (const slug of ['tajin-marroqui-pollo-limon-aceitunas', 'cuscus-marroqui-siete-verduras', 'harira-marroqui-tradicional']) {
      assert.equal(await page.locator(`a.recipe-card[href="/es/receta/${slug}"]`).count(), 1);
    }
    for (let i = 0; i < await moroccoCards.locator('img').count(); i++) await loaded(moroccoCards.locator('img').nth(i));
    result.desktop.moroccoRecipeCards = await moroccoCards.count();
    // India has no cover yet (photographs pending), so open its listing directly.
    await page.goto(base + '/es/recetas/india', { waitUntil: 'networkidle' });
    const indiaCards = page.locator('.recipe-card');
    assert.equal(await indiaCards.count(), recipes.filter(r => /^in(?:$|[-:])/.test(r.placeId)).length);
    for (const slug of ['pollo-a-la-mantequilla-murgh-makhani', 'chana-masala-panyabi', 'masala-dosa', 'biryani-de-pollo-hyderabadi', 'masala-chai']) {
      assert.equal(await page.locator(`a.recipe-card[href="/es/receta/${slug}"]`).count(), 1);
    }
    result.desktop.indiaRecipeCards = await indiaCards.count();
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
