const { test, expect } = require('@playwright/test');
const { BASE_URL, clearProjectsDB, seedProject } = require('../helpers');

const fixture = require('./iiif-export.fixture.json');

const MANIFEST = { width: 400, height: 300 };

async function stubManifest(page) {
    await page.route('https://iiif.test/**', route => route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MANIFEST)
    }));
}

async function exportManifest(page) {
    await page.locator('.navbar-button').first().click();
    await page.locator('label.btn.btn-success', { hasText: 'IIIF' }).click();

    const href = await page.locator('#downloadAnchorElem')
        .evaluate(async (anchor) => {
            for (let i = 0; i < 100; i++) {
                const value = anchor.getAttribute('href');
                if (value) return value;
                await new Promise(r => setTimeout(r, 100));
            }
            return null;
        });

    expect(href, 'the export never armed the download anchor').toBeTruthy();

    return JSON.parse(decodeURIComponent(String(href).replace(/^data:text\/json;charset=utf-8,/, '')));
}

function exportedAnnotations(manifest) {
    return manifest.items[0].annotations[0].items;
}

test.beforeEach(async ({ page }) => {
    await stubManifest(page);
    await seedProject(page, fixture);
    await page.goto(`${BASE_URL}/#/project/${fixture.id}/view`);
    await expect(page.locator('.navbar-button').first()).toBeVisible({ timeout: 30000 });
});

test.afterEach(async ({ page }) => {
    await clearProjectsDB(page, [fixture.id]);
});

test.describe('IIIF export', () => {

    test.skip(({ browserName }) => browserName !== 'chromium', 'One engine is enough for a pure data assertion.');

    test('an annotation flagged as a cutout stays flagged once exported', async ({ page }) => {
        const annotations = exportedAnnotations(await exportManifest(page));

        expect(annotations).toHaveLength(fixture.annotations.length);
        expect(annotations[1].adno).toEqual({ cutout: true });
    });

    test('an annotation with no cutout carries no adno object at all', async ({ page }) => {
        const annotations = exportedAnnotations(await exportManifest(page));

        expect(annotations[0]).not.toHaveProperty('adno');
    });

    test('the reading angle survives alongside the cutout flag', async ({ page }) => {
        const annotations = exportedAnnotations(await exportManifest(page));

        expect(annotations[1].target.selector.refinedBy)
            .toEqual({ type: 'ImageApiSelector', rotation: '180' });
        expect(annotations[0].target.selector).not.toHaveProperty('refinedBy');
    });

    test('the exported shape is the one a re-import reads back', async ({ page }) => {
        const annotations = exportedAnnotations(await exportManifest(page));

        const cutouts = annotations.filter(anno => anno.adno && anno.adno.cutout);

        expect(cutouts).toHaveLength(1);
        expect(cutouts[0].target.selector.value).toContain('xywh=');
    });
});
