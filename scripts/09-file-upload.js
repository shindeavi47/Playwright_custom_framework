//#region Imports
import { chromium } from '../utils/standalone-playwright.js';
import { PageActions } from '../pages/page-actions.js';
import fs from 'node:fs';
import path from 'node:path';
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
  const file = path.resolve('../reports/single-upload.txt');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, 'single file upload test');
  await page.locator('input[type="file"]').first().setInputFiles(file); // Attach a local file to a file input control.
  await page.getByRole('button', { name: 'Upload Single File' }).click();
  console.log('Single file upload submitted');
} catch (error) {
  throw error;
} finally { await browser.close(); }
