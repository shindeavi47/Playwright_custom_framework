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
const browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
//#endregion
//#region Navigation and element handling
const page = await browser.newPage({ viewport: null });
const actions = new PageActions(page);
try {
  // Navigate to the practice page; the page DOM is waited for before element actions.
  await page.goto('https://testautomationpractice.blogspot.com/', { waitUntil: 'domcontentloaded' });
  await actions.assertTitle('Automation practice page title', /Automation Testing Practice/i);
  await actions.assertVisible('Automation practice page heading', page.getByRole('heading', { name: 'Automation Testing Practice' }));
} catch (error) {
  throw error;
} finally { await browser.close(); }
