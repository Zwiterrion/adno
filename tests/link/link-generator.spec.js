const { test, expect } = require('@playwright/test');
const { BASE_URL } = require('../helpers');

async function openLinkPage(page) {
    await page.goto(`${BASE_URL}/#/link`);
    await expect(page.locator('.link-generator')).toBeVisible({ timeout: 30000 });
}

function generatedURL(page) {
    return page.locator('.mockup-code pre').innerText();
}

function params(url) {
    return new URLSearchParams(url.slice(url.indexOf('?') + 1));
}

function orientationSelect(page) {
    return page.locator('.link-generator select').nth(0);
}

function transitionSelect(page) {
    return page.locator('.link-generator select').nth(1);
}

test.describe('The link page', () => {

    test('it scrolls when the settings run past the viewport', async ({ page }) => {
        await openLinkPage(page);

        const scroller = page.locator('.link-generator');

        const overflows = await scroller.evaluate(el => el.scrollHeight > el.clientHeight + 1);
        expect(overflows, 'the settings should be taller than the viewport').toBe(true);

        await scroller.evaluate(el => { el.scrollTop = 400; });

        expect(await scroller.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
    });

    test('the settings are grouped instead of running in one flat list', async ({ page }) => {
        await openLinkPage(page);

        await expect(page.locator('.link-generator section')).toHaveCount(3);
    });

    test('the preview stays put while the settings scroll', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await openLinkPage(page);

        const before = await page.locator('.mockup-code').boundingBox();
        expect(before).toBeTruthy();

        await page.locator('.link-generator').evaluate(el => { el.scrollTop = 400; });

        const after = await page.locator('.mockup-code').boundingBox();
        expect(after).toBeTruthy();

        expect(Math.abs(after.y - before.y)).toBeLessThan(40);
    });
});

test.describe('The generated embed URL', () => {

    test('the separator after /embed is a real question mark', async ({ page }) => {
        await openLinkPage(page);

        expect(await generatedURL(page)).toContain('/#/embed?url=');
    });

    test('it carries the reading orientation settings', async ({ page }) => {
        await openLinkPage(page);

        await orientationSelect(page).selectOption('90');

        const query = params(await generatedURL(page));

        expect(query.get('default_rotation')).toBe('90');
        expect(query.get('rotation_transition')).toBe('turn');
    });

    test('switching the transition to instant reaches the URL', async ({ page }) => {
        await openLinkPage(page);

        await transitionSelect(page).selectOption('instant');

        expect(params(await generatedURL(page)).get('rotation_transition')).toBe('instant');
    });

    test('a default orientation of 0 is left out rather than spelled out', async ({ page }) => {
        await openLinkPage(page);

        expect(params(await generatedURL(page)).has('default_rotation')).toBe(false);
    });

    test('the project URL is the only encoded part', async ({ page }) => {
        await openLinkPage(page);

        const url = await generatedURL(page);

        expect(url).not.toContain('%3Furl');
        expect(params(url).get('url')).toBe('https://static.emf.fr/adno/annotations.json');
    });
});
