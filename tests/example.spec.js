// @ts-check
import { test, expect } from '@playwright/test';

test('opens example.com, prints the title, and closes the browser', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://example.com', { waitUntil: 'domcontentloaded' });

  const title = await page.title();
  expect(title).toBe('Example Domain');
  console.log(`Page title: ${title}`);

  await page.waitForTimeout(5_000);
  await browser.close();
});
