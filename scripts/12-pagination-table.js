//#region Imports
import { chromium } from '../utils/standalone-playwright.js';
import { PageActions } from '../pages/page-actions.js';
import { resetValidationResults } from '../utils/validation-results.js';

//#endregion
// Reset the XML report so each script starts with a clean validation result set.
//#region Validation setup
await resetValidationResults();
//#endregion

//#region Browser setup
const browser = await chromium.launch({ headless: false });
//#endregion
//#region Navigation and element handling
const page = await browser.newPage();
const actions = new PageActions(page);
try {
  // Navigate to the practice page; the page DOM is waited for before element actions.
  await page.goto('https://testautomationpractice.blogspot.com/');
  const table = page.getByRole('heading', { name: 'Pagination Web Table' }).locator('xpath=following::table[1]');
  const laptopCheckbox = table.getByRole('row').filter({ hasText: 'Laptop' }).getByRole('checkbox');
  await actions.validateAction('Select Laptop pagination row', () => laptopCheckbox.check()); // Check native checkbox state.
  await actions.assertChecked('Laptop pagination checkbox is selected', laptopCheckbox, true);
  await actions.click('Open pagination page 2', page.getByRole('link', { name: '2', exact: true }));
  await actions.assertVisible('Pagination table remains visible on page 2', table);
} catch (error) {
  throw error;
} finally { await browser.close(); }
