import { chromium } from 'playwright';

const screenShotPath = "../reports/screenshots/example_screenshot.png";

const browser = await chromium.launch({
  headless: false,
  args: ['--start-maximized']
});

const context = await browser.newContext({
  viewport: null
});
const page = await context.newPage();
await page.goto('https://example.com', { waitUntil: 'domcontentloaded' });

const title = await page.title();
await page.screenshot({ path: screenShotPath, fullPage: true });
console.log(`Page title: ${title}`);

await browser.close();
