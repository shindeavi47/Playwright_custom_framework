import { chromium } from 'playwright';
import { PageActions } from '../pages/page-actions.js';

const browser = await chromium.launch({
  headless: false,
  args: ['--start-maximized']
});

const page = await browser.newPage();
const pageActions = new PageActions(page);
await page.goto('https://www.saucedemo.com/', { waitUntil: 'networkidle' });
await new Promise((resolve) => setTimeout(resolve, 5000));

await pageActions.loginPage('standard_user', 'secret_sauce');
await Promise.all([
  page.waitForLoadState('networkidle'),
  pageActions.click('login-button')
]);
await new Promise((resolve) => setTimeout(resolve, 5000));

const title = await page.title();
console.log(`Page title: ${title}`);

await browser.close();
