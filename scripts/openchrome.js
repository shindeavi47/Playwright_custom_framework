import { chromium } from 'playwright';

const browser = await chromium.launch({
  headless: false,
  args: ['--start-maximized']
});

const page = await browser.newPage();
await page.goto('https://example.com', { waitUntil: 'domcontentloaded' });

const title = await page.title();
console.log(`Page title: ${title}`);

await browser.close();
