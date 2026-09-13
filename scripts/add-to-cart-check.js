//#region Imports
import { chromium } from 'playwright';
import { PageActions } from '../pages/page-actions.js';
import { resetValidationResults } from '../utils/validation-results.js';
//#endregion

//#region Browser and page setup
const browser = await chromium.launch({
  headless: false,
  channel: 'chrome',
  args: ['--start-maximized']
});

const context = await browser.newContext();
const page = await context.newPage();
const pageActions = new PageActions(page);
await resetValidationResults();
//#endregion

//#region Dialog handling
page.on('dialog', async (dialog) => {
  if (dialog.type() === 'alert') {
    console.log(`Accepted warning: ${dialog.message()}`);
  }
  await dialog.accept();
});
//#endregion

//#region Add-to-cart validation
try {
  await page.goto('https://www.saucedemo.com/', { waitUntil: 'networkidle' });
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login', exact: true }).click();

  const okButton = page.getByRole('button', { name: 'OK', exact: true });
  if (await okButton.count()) {
    await okButton.first().click();
  }

  await pageActions.validateByRole('Adds Sauce Labs Backpack to the cart',
    'button',
    'Add to cart',
    page.getByRole('button', { name: 'Remove', exact: true }),
    'Remove'
  );

  await pageActions.validateByRole('Validates cart badge count',
    null,
    null,
    page.locator('[data-test="shopping-cart-badge"]'),
    '2'
  );

  await page.locator('[data-test="shopping-cart-link"]').click();

  await pageActions.validateByRole('Opens the shopping cart',
    null,
    null,
    page.locator('[data-test="title"]'),
    'Your Cart'
  );

  await pageActions.validateByRole('Validates Sauce Labs Backpack in the cart',
    null,
    null,
    page.getByText('Sauce Labs Backpack1', { exact: true }),
    'Sauce Labs Backpack'
  );

} finally {
  await browser.close();
}
//#endregion
