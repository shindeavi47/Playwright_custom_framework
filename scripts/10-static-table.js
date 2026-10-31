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
  const table = page.getByRole('heading', { name: 'Static Web Table' }).locator('xpath=following::table[1]');
  const javaRow = table.getByRole('row').filter({ hasText: 'Learn Java' });
  await actions.tableRowContains('Static table contains Learn Java', table, 'Learn Java');
  await actions.assertText('Static Java table row text', javaRow, /Learn Java.*Mukesh.*Java.*500/s);
} catch (error) {
  throw error;
} finally { await browser.close(); }
