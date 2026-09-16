import { chromium } from 'playwright';
import { PageActions } from '../pages/page-actions.js';
import { resetValidationResults } from '../utils/validation-results.js';

const browser = await chromium.launch({
  headless: false,
  channel: 'chrome',
  args: ['--start-maximized']
});

const context = await browser.newContext({
  viewport: null
});
const page = await context.newPage();
const pageActions = new PageActions(page);
await resetValidationResults();

try {
  await page.goto('https://www.saucedemo.com/', { waitUntil: 'networkidle' });
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login', exact: true }).click();

  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for the page to load

  await page.locator('[data-test="product-sort-container"]').selectOption('lohi');
  await pageActions.validateNumericListSorted('Validates products sorted by price low to high',
    page.locator('[data-test="inventory-item-price"]'),
    'ascending'
  );

  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for sorting to take effect

  console.log('Products sorted using Price (low to high).');
} finally {
  await browser.close();
}