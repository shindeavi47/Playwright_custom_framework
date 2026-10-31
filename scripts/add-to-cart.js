//#region Imports
import { chromium } from '../utils/standalone-playwright.js';
import { PageActions } from '../pages/page-actions.js';
import { LoginPage } from '../pages/login-page.js';
import { resetValidationResults } from '../utils/validation-results.js';
//#endregion

//#region Browser and page setup
//#region Browser setup
const browser = await chromium.launch({
  headless: false,
  channel: 'chrome',
  args: ['--start-maximized']
});

const context = await browser.newContext({
  viewport: null
});
//#endregion
//#region Navigation and element handling
const page = await context.newPage();
//#endregion

//#region Page actions and login page instances
const pageActions = new PageActions(page);
const loginPage = new LoginPage(page);
// Reset the XML report so each script starts with a clean validation result set.
//#region Validation setup
await resetValidationResults();
//#endregion
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
  // Navigate to the practice page; the page DOM is waited for before element actions.
  await page.goto('https://www.saucedemo.com/', { waitUntil: 'networkidle' });
  // await page.pause();
  await loginPage.login('standard_user', 'secret_sauce');
  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 1 second to allow any potential alert to appear


  // const okButton = page.getByRole('button', { name: 'OK', exact: true });
  // if (await okButton.count()) {
  //   await okButton.first().click();
  // }

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

  await new Promise(resolve => setTimeout(resolve, 2000));

  await pageActions.validateByRole('Opens the shopping cart',
    null,
    null,
    page.locator('[data-test="title"]'),
    'Your Cart'
  );

  await pageActions.validateByRole('Validates Sauce Labs Backpack in the cart',
    null,
    null,
    page.getByText('Sauce Labs Backpack', { exact: true }),
    'Sauce Labs Backpack'
  );

} finally {
  await browser.close();
}
//#endregion
