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
  page.once('dialog', async dialog => { console.log('Prompt:', dialog.message()); await dialog.accept('Playwright'); }); // Register a one-time handler before the dialog-triggering click.
  await page.getByRole('button', { name: 'Prompt Alert' }).click();
  await actions.assertText('Prompt alert displays entered name', page.locator('#demo'), /Hello Playwright/i);
} catch (error) {
  throw error;
} finally { await browser.close(); }
