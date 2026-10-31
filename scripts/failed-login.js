//#region Imports
import { chromium } from '../utils/standalone-playwright.js';
import { PageActions } from '../pages/page-actions.js';
import { LoginPage } from '../pages/login-page.js';
import { resetValidationResults } from '../utils/validation-results.js';

//#endregion
//#region Browser setup
const browser = await chromium.launch({
  headless: false,
  args: ['--start-maximized']
});

const context = await browser.newContext({
  viewport: null
});
//#endregion
//#region Navigation and element handling
const page = await context.newPage();
const pageActions = new PageActions(page);
const loginPage = new LoginPage(page);
// Reset the XML report so each script starts with a clean validation result set.
//#region Validation setup
await resetValidationResults();
//#endregion

// Navigate to the practice page; the page DOM is waited for before element actions.
  await page.goto('https://www.saucedemo.com/', { waitUntil: 'networkidle' });
await new Promise((resolve) => setTimeout(resolve, 2000));
await page.pause();

await loginPage.login('locked_out_user', 'secret_sauce');

const errorLocator = page.locator('[data-test="error"]');
await errorLocator.waitFor();
await pageActions.validateByRole('Validates failed login', null, null, errorLocator, 'Epic sadface: Sorry, this user has been locked out.');
const errorMessage = (await errorLocator.textContent()).trim();

if (page.url().includes('/inventory.html') || !errorMessage) {
  throw new Error('Login unexpectedly succeeded.');
}

console.log(`Login failed as expected: ${errorMessage}`);

await browser.close();
