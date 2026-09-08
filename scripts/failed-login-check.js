import { chromium } from 'playwright';

const browser = await chromium.launch({
  headless: false,
  args: ['--start-maximized']
});

const page = await browser.newPage();
await page.goto('https://www.saucedemo.com/', { waitUntil: 'networkidle' });
await new Promise((resolve) => setTimeout(resolve, 5000));

await page.locator('#user-name').fill('locked_out_user');
await page.locator('#password').fill('secret_sauce');
await page.locator('#login-button').click();

await page.locator('[data-test="error"]').waitFor();
const errorMessage = (await page.locator('[data-test="error"]').textContent()).trim();

if (page.url().includes('/inventory.html') || !errorMessage) {
  throw new Error('Login unexpectedly succeeded.');
}

console.log(`Login failed as expected: ${errorMessage}`);

await browser.close();
