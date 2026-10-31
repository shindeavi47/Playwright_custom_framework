//#region Imports
import { chromium } from '../utils/standalone-playwright.js';
import { PageActions } from '../pages/page-actions.js';
import { resetValidationResults } from '../utils/validation-results.js';

//#endregion
//#region Browser setup
const browser = await chromium.launch({
  headless: false,
  channel: 'chrome',
  args: ['--start-maximized']
});

const context = await browser.newContext({
  viewport: null
});
//#endregion
//#region Navigation and element handling
const page = await context.newPage();
const pageActions = new PageActions(page);
// Reset the XML report so each script starts with a clean validation result set.
//#region Validation setup
await resetValidationResults();
//#endregion

try {
  // Navigate to the practice page; the page DOM is waited for before element actions.
  await page.goto('https://www.saucedemo.com/', { waitUntil: 'networkidle' });
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login', exact: true }).click();

  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for the page to load
  await page.locator('[data-test="product-sort-container"]').selectOption('za'); // Select a dropdown value using visible label, value, or index.
  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for sorting to take effect
  await pageActions.validateListSorted(
    'Validates products sorted from Z to A',
    page.locator('[data-test="inventory-item-name"]'),
    'descending'
  );
  console.log('Products sorted using Name (Z to A).');
} finally {
  await browser.close();
}
