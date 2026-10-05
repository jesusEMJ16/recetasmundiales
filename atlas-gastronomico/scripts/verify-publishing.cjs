/* Run against `npm run start`; PLAYWRIGHT_PATH can point to an isolated install. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const base = process.env.SITE_BASE_URL || 'http://127.0.0.1:3000';
const reports = path.resolve('../image-validation');
const translatedGuideSlugs = Object.keys(require('../src/data/cooking-guide-translations.json'));

(async () => {
  fs.mkdirSync(reports, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  const tracking = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (/googletagmanager|googlesyndication/.test(request.url())) tracking.push(request.url()); });
  await context.route('https://www.googletagmanager.com/**', route => route.fulfill({ contentType: 'application/javascript', body: '' }));

  try {
    for (const [url, index] of [
      ['/es/recetas/afganistan', false], ['/es/recetas/mexico', true],
      ['/es/recetas/mexico?dieta=vegano', false], ['/es/restaurantes', false],
      ['/es/informacion/privacidad', true], ['/fr/informacion/privacidad', false],
    ]) {
      await page.goto(base + url, { waitUntil: 'domcontentloaded' });
      const robots = await page.locator('meta[name="robots"]').getAttribute('content');
      assert.equal(robots.includes('noindex'), !index, url);
      assert.equal(await page.locator('script[src*="googlesyndication"]').count(), 0, url);
    }
    await page.goto(base + '/es/receta/guacamole');
    await page.getByRole('spinbutton', { name: 'Porciones' }).fill('8');
    const doubled = page.getByRole('checkbox', { name: '6 aguacates maduros', exact: true });
    await doubled.check();
    assert.equal(await doubled.isChecked(), true);
    assert.equal(await page.getByRole('checkbox', { name: '0,5 de cebolla picada', exact: true }).count(), 1);
    assert.equal(await page.getByText('Cómo conseguir un guacamole equilibrado', { exact: true }).count(), 1);
    assert.equal(await page.locator('[aria-label*="estrellas"]').count(), 0);
    const relatedUrls = await page.locator('.recipe-card').evaluateAll(links => links.map(link => link.getAttribute('href')));
    assert(relatedUrls.length > 0);
    assert(!relatedUrls.some(url => /souvlaki|nueva-york|chicago/.test(url)));
    assert.equal(tracking.length, 0, 'Tracking must remain off before the statistics choice');
    await page.screenshot({ path: path.join(reports, 'publishing-desktop.png'), fullPage: true, animations: 'disabled' });

    await page.getByRole('button', { name: 'Aceptar estadísticas', exact: true }).click();
    await page.waitForFunction(() => !!document.querySelector('script[src*="googletagmanager"]'));
    assert(tracking.some(url => url.includes('googletagmanager')));
    await page.getByRole('button', { name: 'Preferencias de privacidad', exact: true }).click();
    await Promise.all([
      page.waitForNavigation(),
      page.getByRole('button', { name: 'Solo lo necesario', exact: true }).click(),
    ]);
    assert.equal(await page.evaluate(() => localStorage.getItem('worldbites-analytics-v1')), 'declined');
    assert.equal(await page.locator('script[src*="googletagmanager"]').count(), 0);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base + '/es/receta/tiramisu');
    assert.equal(await page.getByRole('checkbox', { name: '250 g de mascarpone', exact: true }).count(), 1);
    await page.getByRole('spinbutton', { name: 'Porciones' }).fill('12');
    assert.equal(await page.getByRole('checkbox', { name: '500 g de mascarpone', exact: true }).count(), 1);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Mobile overflow');
    await page.screenshot({ path: path.join(reports, 'publishing-mobile.png'), fullPage: true, animations: 'disabled' });

    await page.goto(base + '/es/receta/picadas-veracruzanas');
    await page.getByRole('heading', { name: 'Técnica y preparación', exact: true }).waitFor();
    assert.equal(await page.locator('.recipe-references a[href="https://laroussecocina.mx/palabra/picada/"]').count(), 1);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Editorial mobile overflow');
    await page.screenshot({ path: path.join(reports, 'editorial-recipe-mobile.png'), fullPage: true, animations: 'disabled' });

    await page.goto(base + '/es/recetas/mexico');
    await page.getByRole('heading', { name: 'Cómo cocinar esta selección', exact: true }).waitFor();
    assert.equal(await page.locator('.country-guide a').count(), 3);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Country guide mobile overflow');
    await page.screenshot({ path: path.join(reports, 'editorial-country-mobile.png'), fullPage: true, animations: 'disabled' });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.screenshot({ path: path.join(reports, 'editorial-country-desktop.png'), fullPage: true, animations: 'disabled' });
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto(base + '/ar/recetas/mexico');
    assert.equal(await page.locator('.country-guide p[lang="en"][dir="ltr"]').count(), 2);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'RTL country overflow');

    await page.goto(base + '/es');
    assert.equal(await page.locator('.atlas-country-name').filter({ hasText: 'Afganistán' }).count(), 0);
    await page.getByRole('checkbox', { name: 'Mostrar también países sin recetas' }).check();
    assert.equal(await page.locator('.atlas-country-name').filter({ hasText: 'Afganistán' }).count(), 1);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Home mobile overflow');

    for (const locale of ['es', 'en', 'zh', 'hi', 'fr', 'ar', 'bn', 'pt', 'ru', 'ur', 'id', 'ja']) {
      await page.goto(base + `/${locale}/receta/guacamole`);
      assert.equal(await page.getByRole('spinbutton').count(), 1, locale);
      assert.equal(await page.locator('footer a[href*="/informacion/"]').count(), 4, locale);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, locale);
      await page.goto(base + `/${locale}/receta/almejas-tatemadas`);
      assert.equal(await page.locator('input[type="checkbox"]').count(), 4, locale);
      assert.equal(await page.locator('.recipe-references a[href="https://laroussecocina.mx/palabra/almejada/"]').count(), 1, locale);
      for (const slug of translatedGuideSlugs) {
        await page.goto(base + `/${locale}/receta/${slug}`);
        const language = locale === 'zh' ? 'zh-CN' : locale;
        const direction = ['ar', 'ur'].includes(locale) ? 'rtl' : 'ltr';
        assert.equal(await page.locator('.cooking-guide [data-guide-fallback]').count(), 0, `${locale}/${slug}: fallback`);
        assert.equal(await page.locator(`.cooking-guide p[lang="${language}"][dir="${direction}"]`).count(), 1, `${locale}/${slug}: language`);
        assert.equal(await page.locator(`.cooking-guide h2[lang="${language}"][dir="${direction}"]`).count(), 1, `${locale}/${slug}: heading`);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${locale}/${slug}: overflow`);
      }
    }
    await page.goto(base + '/fr/receta/lomitos-de-valladolid');
    assert.equal(await page.locator('.cooking-guide [data-guide-fallback]').count(), 1, 'Untranslated guide notice');
    assert.equal(await page.locator('.cooking-guide p[lang="en"][dir="ltr"]').count(), 1, 'Untranslated guide language');
    await page.goto(base + '/ar/receta/ceviche-de-marlin-ahumado');
    await page.locator('.cooking-guide').scrollIntoViewIfNeeded();
    await page.locator('.cooking-guide').screenshot({ path: path.join(reports, 'translated-guide-ar-mobile.png'), animations: 'disabled' });
    await page.goto(base + '/ja/receta/cafe-de-coatepec');
    await page.locator('.cooking-guide').scrollIntoViewIfNeeded();
    await page.locator('.cooking-guide').screenshot({ path: path.join(reports, 'translated-guide-ja-mobile.png'), animations: 'disabled' });
    assert.deepEqual(errors, [], 'Browser runtime errors');
    console.log(JSON.stringify({ passed: true, locales: 12, translatedGuides: translatedGuideSlugs.length, translatedGuideRoutes: translatedGuideSlugs.length * 12, desktop: true, mobile: true, noRuntimeErrors: true, metadata: true, privacy: true, portions: true, recommendations: true }, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
