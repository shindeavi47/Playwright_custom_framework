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
const context = await browser.newContext();
//#endregion
//#region Navigation and element handling
const page = await context.newPage();
try {
  // Navigate to the practice page; the page DOM is waited for before element actions.
  await page.goto('https://testautomationpractice.blogspot.com/');
  const newPagePromise = context.waitForEvent('page');
  await page.getByRole('button', { name: 'New Tab' }).click();
  const newPage = await newPagePromise;
  await newPage.waitForLoadState();
  await actions.assertVisible('New tab page body is visible', newPage.locator('body'));
  await newPage.close();
} catch (error) {
  throw error;
} finally { await browser.close(); }
