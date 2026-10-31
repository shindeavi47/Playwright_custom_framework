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
  await actions.setCheckbox('Check Monday', page.getByRole('checkbox', { name: 'Monday' }), true);
  await actions.setCheckbox('Check Friday', page.getByRole('checkbox', { name: 'Friday' }), true);
  await actions.setCheckbox('Uncheck Monday', page.getByRole('checkbox', { name: 'Monday' }), false);
  await actions.assertChecked('Monday remains unchecked', page.getByRole('checkbox', { name: 'Monday' }), false);
  await actions.assertChecked('Friday is checked', page.getByRole('checkbox', { name: 'Friday' }), true);
  await page.waitForTimeout(2000); // Wait for 2 seconds to observe the changes
} catch (error) {
  throw error;
} finally { await browser.close(); }
