import { chromium } from 'playwright';
import { PageActions } from '../pages/page-actions.js';
import { resetValidationResults } from '../utils/validation-results.js';

const browser = await chromium.launch({
  headless: false,
  args: ['--start-maximized']
});

const page = await browser.newPage();
const pageActions = new PageActions(page);
await resetValidationResults();

try {
  await page.goto('https://www.saucedemo.com/', { waitUntil: 'networkidle' });
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');

  await pageActions.validateByRole(
    'Validates successful login',
    'button',
    'Login',
    page.getByText('Products', { exact: true }),
    'Products'
  );

  console.log(`Login successful: ${page.url()}`);
} finally {
  await browser.close();
}
