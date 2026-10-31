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
  const colors = page.locator('#colors');
  await actions.select('Select multiple colors', colors, ['Red', 'Blue']);
  await actions.assertCount('Two colors remain selected', colors.locator('option:checked'), 2);
  const animals = page.locator('#animals');
  await actions.select('Select multiple animals', animals, ['Dog', 'Cat']);
  await actions.assertCount('Two animals remain selected', animals.locator('option:checked'), 2);
} catch (error) {
  throw error;
} finally { await browser.close(); }
