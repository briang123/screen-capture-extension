import { test, expect, chromium } from '@playwright/test';

test('Minimal Playwright test: open cleanshot.com and check title', async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://cleanshot.com');
  const title = await page.title();
  console.log('Page title:', title);
  expect(title).toContain('CleanShot');
  await context.close();
  await browser.close();
});
