//#region Imports
import { chromium } from 'playwright';
import { PageActions } from '../pages/page-actions.js';
import { resetValidationResults } from '../utils/validation-results.js';
//#endregion

//#region Browser and page setup
const browser = await chromium.launch({
  headless: false,
  args: ['--start-maximized']
});

const page = await browser.newPage();
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
  await new Promise((resolve) => setTimeout(resolve, 2000));

  await Promise.all([
    page.waitForLoadState('networkidle'),
    pageActions.loginPage('standard_user', 'secret_sauce')
  ]);
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const okButtonFound = await page.locator('button').evaluateAll(
    (buttons) => buttons.some((button) => button.textContent.trim() === 'OK')
  );
  if (okButtonFound) {
    await page.locator('button').filter({ hasText: 'OK' }).first().click();
  }

  await pageActions.validateAction('Adds Sauce Labs Backpack to the cart', 'add-to-cart-sauce-labs-backpack', [{ element: '#remove-sauce-labs-backpack' }]);

  await pageActions.validateAction('Validates cart badge count', null, [{ element: '.shopping_cart_badge', value: '1' }]);

  await pageActions.validateAction('Opens the shopping cart', 'shopping_cart_container', [{ element: '[data-test="inventory-item"]' }]);

  await pageActions.validateAction('Validates Sauce Labs Backpack in the cart', null, [{ element: '[data-test="inventory-item-name"]', value: 'Sauce Labs Backpack' }]);

  await new Promise((resolve) => setTimeout(resolve, 2000));

  console.log('Item added to cart successfully.');
} finally {
  await browser.close();
}
//#endregion
