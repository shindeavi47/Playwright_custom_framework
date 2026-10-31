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
  await actions.validateAction('Double-click Copy Text action', async () => {
    await page.getByRole('button', { name: 'Copy Text' }).dblclick(); // Perform a double-click action.
  });
  // Validate the copied value and record PASS/FAIL timing through PageActions.
  await actions.assertValue('Double-click copies Field1 into Field2', page.locator('#field2'), 'Hello World!');
} catch (error) {
  throw error;
} finally { await browser.close(); }
