const { test, expect } = require('@playwright/test');
const { BASE_URL, clearProjectsDB, seedProject } = require('../helpers');

const fixture = require('../orientation/orientation.fixture.json');

const CUTOUT = 3;

function focus(page, index) {
    return page.locator('.anno-card').nth(index).locator('[data-icon="bullseye"]').click();
}

async function openViewer(page) {
    await seedProject(page, fixture);
    await page.goto(`${BASE_URL}/#/project/${fixture.id}/view`);
    await page.waitForSelector('.a9s-annotation', { timeout: 30000 });
    await expect(page.locator('.anno-card')).toHaveCount(fixture.annotations.length);
}

async function openCutout(page) {
    await openViewer(page);
    await focus(page, CUTOUT);
    await expect(page.locator('.cutout-panel')).toBeVisible({ timeout: 10000 });
}

async function box(locator) {
    const found = await locator.boundingBox();
    expect(found, 'element has no box on screen').toBeTruthy();
    return found;
}

function overlaps(a, b) {
    return a.x < b.x + b.width && b.x < a.x + a.width
        && a.y < b.y + b.height && b.y < a.y + a.height;
}

async function dragBar(page, dx, dy) {
    const bar = await box(page.locator('.cutout-bar'));

    await page.mouse.move(bar.x + bar.width / 2, bar.y + bar.height / 2);
    await page.mouse.down();
    await page.mouse.move(bar.x + bar.width / 2 + dx, bar.y + bar.height / 2 + dy, { steps: 12 });
    await page.mouse.up();
}

test.afterEach(async ({ page }) => {
    await clearProjectsDB(page, [fixture.id]);
});

test.describe('The viewer chrome lives inside the fullscreen element', () => {

    test('the toolbar is a descendant of #adno-osd, not a sibling', async ({ page }) => {
        await openViewer(page);

        await expect(page.locator('#adno-osd .osd-buttons-bar')).toHaveCount(1);
    });

    test('the navigator is a descendant of #adno-osd too', async ({ page }) => {
        await openViewer(page);

        await expect(page.locator('#adno-osd .adno-navigator-wrap')).toHaveCount(1);
    });

    test('nothing that must show in fullscreen is left outside #adno-osd', async ({ page }) => {
        await openViewer(page);

        const strays = await page.evaluate(() => {
            const osd = document.getElementById('adno-osd');
            const stage = osd ? osd.parentElement : null;

            if (!stage) return ['#adno-osd has no parent'];

            return [...stage.children]
                .filter(child => child !== osd)
                .map(child => child.className || child.tagName);
        });

        expect(strays).toEqual([]);
    });
});

test.describe('The reading column', () => {

    test('the cutout panel is laid out inside the reading stack', async ({ page }) => {
        await openCutout(page);

        await expect(page.locator('.reading-stack .cutout-panel')).toHaveCount(1);
    });

    test('the stack starts below the toolbar rather than under it', async ({ page }) => {
        await openCutout(page);

        const bar = await box(page.locator('.osd-buttons-bar'));
        const stack = await box(page.locator('.reading-stack'));

        expect(stack.y).toBeGreaterThanOrEqual(bar.y + bar.height - 1);
    });

    test('the cutout stays within the stack it belongs to', async ({ page }) => {
        await openCutout(page);

        const stack = await box(page.locator('.reading-stack'));
        const cutout = await box(page.locator('.cutout-panel'));

        expect(cutout.x).toBeGreaterThanOrEqual(stack.x - 1);
        expect(cutout.y).toBeGreaterThanOrEqual(stack.y - 1);
        expect(cutout.y + cutout.height).toBeLessThanOrEqual(stack.y + stack.height + 1);
    });
});

test.describe('Text and cutout share the column without colliding', () => {

    test.skip(({ browserName }) => browserName !== 'chromium', 'Fullscreen is driven on Chromium only.');

    test('the cutout does not sit on top of the annotation text', async ({ page }) => {
        await openCutout(page);

        await page.locator('#toggle-fullscreen').click();
        await expect(page.locator('#adno-osd-anno-fullscreen')).toBeVisible({ timeout: 10000 });

        const text = await box(page.locator('#adno-osd-anno-fullscreen'));
        const cutout = await box(page.locator('.cutout-panel'));

        expect(overlaps(text, cutout)).toBe(false);
    });

    test('the text keeps the top of the column and the cutout follows below it', async ({ page }) => {
        await openCutout(page);

        await page.locator('#toggle-fullscreen').click();
        await expect(page.locator('#adno-osd-anno-fullscreen')).toBeVisible({ timeout: 10000 });

        const text = await box(page.locator('#adno-osd-anno-fullscreen'));
        const cutout = await box(page.locator('.cutout-panel'));

        expect(cutout.y).toBeGreaterThanOrEqual(text.y);
    });
});

test.describe('The cutout title bar', () => {

    test('it stays compact enough to leave the crop the room', async ({ page }) => {
        await openCutout(page);

        const bar = await box(page.locator('.cutout-bar'));

        expect(bar.height).toBeLessThanOrEqual(32);
    });

    test('a plain click on the title does not tear the panel out of the column', async ({ page }) => {
        await openCutout(page);

        await page.locator('.cutout-title').click();

        await expect(page.locator('.cutout-panel')).not.toHaveClass(/cutout-panel--floating/);
    });

    test('dragging the bar detaches the panel and moves it', async ({ page }) => {
        await openCutout(page);

        const before = await box(page.locator('.cutout-panel'));

        await dragBar(page, 120, 90);

        await expect(page.locator('.cutout-panel')).toHaveClass(/cutout-panel--floating/);

        const after = await box(page.locator('.cutout-panel'));

        expect(Math.abs(after.x - before.x) + Math.abs(after.y - before.y)).toBeGreaterThan(20);
    });

    test('picking a size preset docks the panel back into the column', async ({ page }) => {
        await openCutout(page);

        await dragBar(page, 120, 90);
        await expect(page.locator('.cutout-panel')).toHaveClass(/cutout-panel--floating/);

        await page.locator('.cutout-btn').first().click();

        await expect(page.locator('.cutout-panel')).not.toHaveClass(/cutout-panel--floating/);
    });

    test('minimising takes the panel out of the column so the text reclaims the room', async ({ page }) => {
        await openCutout(page);

        await page.locator('.cutout-btn--minimize').click();

        await expect(page.locator('.cutout-panel')).toHaveClass(/cutout-panel--floating/);
        await expect(page.locator('.cutout-pill')).toBeVisible();
    });
});
