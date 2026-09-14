import { chromium } from 'playwright';
import { PageActions } from '../pages/page-actions.js';
import { resetValidationResults } from '../utils/validation-results.js';

const browser = await chromium.launch({
  headless: false,
  channel: 'chrome',
  args: ['--start-maximized']
});

const page = await browser.newPage();
const pageActions = new PageActions(page);
await resetValidationResults();

try {
  await page.goto('https://www.saucedemo.com/', { waitUntil: 'networkidle' });
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login', exact: true }).click();

  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for the page to load
  await page.locator('[data-test="product-sort-container"]').selectOption('za');
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
