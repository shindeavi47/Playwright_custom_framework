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

try {
  // Navigate to the practice page; the page DOM is waited for before element actions.
  await page.goto('https://www.saucedemo.com/', { waitUntil: 'networkidle' });
  await loginPage.login('standard_user', 'secret_sauce');

  await pageActions.validateByRole(
    'Validates successful login',
    null,
    null,
    page.getByText('Products', { exact: true }),
    'Products'
  );
  await new Promise((resolve) => setTimeout(resolve, 2000));
  console.log(`Login successful: ${page.url()}`);
} finally {
  await browser.close();
}
