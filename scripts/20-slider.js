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
  const handles = page.locator('.ui-slider-handle');
  await handles.first().dragTo(page.locator('.ui-slider')); // Drag the source element onto the target element.
  await actions.assertVisible('Slider amount value remains visible', page.locator('#amount'));
} catch (error) {
  throw error;
} finally { await browser.close(); }
