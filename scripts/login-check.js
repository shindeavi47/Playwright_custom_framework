import { chromium } from 'playwright';
import { PageActions } from '../pages/page-actions.js';
import { LoginPage } from '../pages/login-page.js';
import { resetValidationResults } from '../utils/validation-results.js';

const browser = await chromium.launch({
  headless: false,
  args: ['--start-maximized']
});

const context = await browser.newContext({
  viewport: null
});
const page = await context.newPage();
const pageActions = new PageActions(page);
const loginPage = new LoginPage(page);
await resetValidationResults();

try {
  await page.goto('https://www.saucedemo.com/', { waitUntil: 'networkidle' });
  await loginPage.login('standard_user', 'secret_sauce');

  await pageActions.validateByRole(
    'Validates successful login',
    null,
    null,
    page.getByText('Products', { exact: true }),
    'Products'
  );
  await new Promise((resolve) => setTimeout(resolve, 2000));
  console.log(`Login successful: ${page.url()}`);
} finally {
  await browser.close();
}
