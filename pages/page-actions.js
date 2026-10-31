//#region Imports
import { expect } from '@playwright/test';
import { addValidationResult } from '../utils/validation-results.js';
//#endregion

//#region Class setup
export class PageActions {
  constructor(page) {
    this.page = page;
  }

//#endregion
//#region Role-based action and text validation
  async validateByRole(scenario, roleType, roleName, elementToCheck, elementValue, timeoutMs = 30000) {
    let result = 'FAIL';
    const startedAt = Date.now();
    try {
      if (!elementToCheck || typeof elementToCheck.textContent !== 'function') {
        throw new Error('A locator is required for elementToCheck.');
      }
      if ((roleType && !roleName) || (!roleType && roleName)) {
        throw new Error('Both roleType and roleName are required to perform an action.');
      }

      if (roleType && roleName) {
        // Use an ARIA role and accessible name to find a stable action element.
        await this.page.getByRole(roleType, { name: roleName, exact: true }).first().click({ timeout: timeoutMs });
      }

      try {
        const expectedValue = typeof elementValue === 'number' ? elementValue.toString() : elementValue;
        await expect(elementToCheck).toHaveText(expectedValue);
        result = 'PASS';
        console.log(`Validation passed for scenario "${scenario}".`);
        return true;
      } catch (error) {
        result = 'FAIL';
        console.error(`Validation failed for scenario "${scenario}".`, error);
        return false;
      }
    } catch (error) {
      console.error(`Validation error for scenario "${scenario}":`, error);
      result = 'ERROR';
    } finally {
      await this.writeValidationResult(scenario, result, startedAt, timeoutMs);
    }
  }

//#endregion
//#region Text list sorting validation
  async validateListSorted(scenario, elementsToCheck, order = 'ascending', timeoutMs = 30000) {
    let result = 'FAIL';
    const startedAt = Date.now();
    try {
      if (!elementsToCheck || typeof elementsToCheck.allTextContents !== 'function') {
        throw new Error('A locator is required for elementsToCheck.');
      }
      if (!['ascending', 'descending'].includes(order)) {
        throw new Error('Order must be either "ascending" or "descending".');
      }

      // Read all visible text values before sorting or comparing them.
      const itemTexts = (await elementsToCheck.allTextContents()).map((item) => item.trim());
      console.log(`Items to check for sorting: ${itemTexts.join(', ')}`);

      const sortedTexts = [...itemTexts].sort((a, b) => a.localeCompare(b));
      if (order === 'descending') {
        sortedTexts.reverse();
      }
      const isSorted = JSON.stringify(itemTexts) === JSON.stringify(sortedTexts);

      result = isSorted ? 'PASS' : 'FAIL';
      console.log(
        result === 'PASS'
          ? `Validation passed for scenario "${scenario}".`
          : `Validation failed for scenario "${scenario}". Items are not sorted in ${order} order.`
      );
      return result === 'PASS';
    } catch (error) {
      console.error(`Validation error for scenario "${scenario}":`, error);
      result = 'ERROR';
    } finally {
      await this.writeValidationResult(scenario, result, startedAt, timeoutMs);
    }
  }

//#endregion
//#region Numeric list sorting validation
  async validateNumericListSorted(scenario, elementsToCheck, order = 'ascending', timeoutMs = 30000) {
    let result = 'FAIL';
    const startedAt = Date.now();
    try {
      if (!elementsToCheck || typeof elementsToCheck.allTextContents !== 'function') {
        throw new Error('A locator is required for elementsToCheck.');
      }
      if (!['ascending', 'descending'].includes(order)) {
        throw new Error('Order must be either "ascending" or "descending".');
      }

      // Convert displayed text values into numbers before comparing sort order.
      const itemValues = (await elementsToCheck.allTextContents())
        .map((item) => Number.parseFloat(item.replace('$', '').trim()));

      if (itemValues.some((item) => Number.isNaN(item))) {
        throw new Error('All values must be valid numbers.');
      }

      const sortedValues = [...itemValues].sort((a, b) =>
        order === 'ascending' ? a - b : b - a
      );
      const isSorted = JSON.stringify(itemValues) === JSON.stringify(sortedValues);

      result = isSorted ? 'PASS' : 'FAIL';
      console.log(
        result === 'PASS'
          ? `Validation passed for scenario "${scenario}".`
          : `Validation failed for scenario "${scenario}". Items are not sorted in ${order} order.`
      );
      return result === 'PASS';
    } catch (error) {
      console.error(`Validation error for scenario "${scenario}":`, error);
      result = 'ERROR';
    } finally {
      await this.writeValidationResult(scenario, result, startedAt, timeoutMs);
    }
  }

//#endregion
//#region Text input fill action
  async fill(scenario, locator, value, timeoutMs = 30000) {
    const startedAt = Date.now();
    let result = 'FAIL';
    try {
      await locator.fill(value, { timeout: timeoutMs }); // fill replaces the current input value
      await expect(locator).toHaveValue(value);
      result = 'PASS';
      return true;
    } catch (error) {
      console.error(`Validation error for scenario "${scenario}":`, error);
      result = 'ERROR';
      return false;
    } finally {
      await this.writeValidationResult(scenario, result, startedAt, timeoutMs);
    }
  }

//#endregion
//#region Dropdown select action
  async select(scenario, locator, values, timeoutMs = 30000) {
    const startedAt = Date.now();
    let result = 'FAIL';
    try {
      await locator.selectOption(values, { timeout: timeoutMs }); // select one value or an array of values for multi-select controls
      result = 'PASS';
      return true;
    } catch (error) {
      console.error(`Validation error for scenario "${scenario}":`, error);
      result = 'ERROR';
      return false;
    } finally {
      await this.writeValidationResult(scenario, result, startedAt, timeoutMs);
    }
  }

//#endregion
//#region Checkbox checked-state action
  async setCheckbox(scenario, locator, checked = true, timeoutMs = 30000) {
    const startedAt = Date.now();
    let result = 'FAIL';
    try {
      await locator.setChecked(checked, { timeout: timeoutMs }); // check or uncheck a native checkbox
      if (checked) {
        await expect(locator).toBeChecked({ timeout: timeoutMs });
      } else {
        await expect(locator).not.toBeChecked({ timeout: timeoutMs });
      }
      result = 'PASS';
      return true;
    } catch (error) {
      console.error(`Validation error for scenario "${scenario}":`, error);
      result = 'ERROR';
      return false;
    } finally {
      await this.writeValidationResult(scenario, result, startedAt, timeoutMs);
    }
  }

//#endregion
//#region Button or link click action
  async click(scenario, locator, timeoutMs = 30000) {
    const startedAt = Date.now();
    let result = 'FAIL';
    try {
      await locator.click({ timeout: timeoutMs }); // click a link, button, or other clickable element
      result = 'PASS';
      return true;
    } catch (error) {
      console.error(`Validation error for scenario "${scenario}":`, error);
      result = 'ERROR';
      return false;
    } finally {
      await this.writeValidationResult(scenario, result, startedAt, timeoutMs);
    }
  }

//#endregion
//#region Mouse hover action
  async hover(scenario, locator, timeoutMs = 30000) {
    const startedAt = Date.now();
    let result = 'FAIL';
    try {
      await locator.hover({ timeout: timeoutMs }); // move the mouse pointer to reveal hover content
      result = 'PASS';
      return true;
    } catch (error) {
      console.error(`Validation error for scenario "${scenario}":`, error);
      result = 'ERROR';
      return false;
    } finally {
      await this.writeValidationResult(scenario, result, startedAt, timeoutMs);
    }
  }

//#endregion
//#region File upload action
  async uploadFiles(scenario, locator, files, timeoutMs = 30000) {
    const startedAt = Date.now();
    let result = 'FAIL';
    try {
      await locator.setInputFiles(files, { timeout: timeoutMs }); // attach one or multiple files to an input
      result = 'PASS';
      return true;
    } catch (error) {
      console.error(`Validation error for scenario "${scenario}":`, error);
      result = 'ERROR';
      return false;
    } finally {
      await this.writeValidationResult(scenario, result, startedAt, timeoutMs);
    }
  }

//#endregion
//#region Table row lookup action
  async tableRowContains(scenario, tableLocator, rowText, timeoutMs = 30000) {
    const startedAt = Date.now();
    let result = 'FAIL';
    try {
      await expect(tableLocator.getByRole('row').filter({ hasText: rowText }).first()).toBeVisible({ timeout: timeoutMs }); // locate a table row by visible text
      result = 'PASS';
      return true;
    } catch (error) {
      console.error(`Validation error for scenario "${scenario}":`, error);
      result = 'ERROR';
      return false;
    } finally {
      await this.writeValidationResult(scenario, result, startedAt, timeoutMs);
    }
  }

//#endregion
//#region Reusable action wrapper
  async assertTitle(scenario, expectedTitle, timeoutMs = 30000) {
    const startedAt = Date.now();
    let result = 'FAIL';
    try {
      await expect(this.page).toHaveTitle(expectedTitle, { timeout: timeoutMs });
      result = 'PASS';
      return true;
    } catch (error) {
      result = 'ERROR';
      console.error(`Assertion failed for scenario "${scenario}":`, error);
      return false;
    } finally {
      await this.writeValidationResult(scenario, result, startedAt, timeoutMs);
    }
  }

  async assertUrl(scenario, expectedUrl, timeoutMs = 30000) {
    const startedAt = Date.now();
    let result = 'FAIL';
    try {
      await expect(this.page).toHaveURL(expectedUrl, { timeout: timeoutMs });
      result = 'PASS';
      return true;
    } catch (error) {
      result = 'ERROR';
      console.error(`Assertion failed for scenario "${scenario}":`, error);
      return false;
    } finally {
      await this.writeValidationResult(scenario, result, startedAt, timeoutMs);
    }
  }

  //#region Visible element assertion
  async assertVisible(scenario, locator, timeoutMs = 30000) {
    const startedAt = Date.now();
    let result = 'FAIL';
    try {
      await expect(locator).toBeVisible({ timeout: timeoutMs });
      result = 'PASS';
      return true;
    } catch (error) {
      result = 'ERROR';
      console.error(`Assertion failed for scenario "${scenario}":`, error);
      return false;
    } finally {
      await this.writeValidationResult(scenario, result, startedAt, timeoutMs);
    }
  }

  async assertText(scenario, locator, expectedText, timeoutMs = 30000) {
    const startedAt = Date.now();
    let result = 'FAIL';
    try {
      await expect(locator).toHaveText(expectedText, { timeout: timeoutMs });
      result = 'PASS';
      return true;
    } catch (error) {
      result = 'ERROR';
      console.error(`Assertion failed for scenario "${scenario}":`, error);
      return false;
    } finally {
      await this.writeValidationResult(scenario, result, startedAt, timeoutMs);
    }
  }

  async assertValue(scenario, locator, expectedValue, timeoutMs = 30000) {
    const startedAt = Date.now();
    let result = 'FAIL';
    try {
      await expect(locator).toHaveValue(expectedValue, { timeout: timeoutMs });
      result = 'PASS';
      return true;
    } catch (error) {
      result = 'ERROR';
      console.error(`Assertion failed for scenario "${scenario}":`, error);
      return false;
    } finally {
      await this.writeValidationResult(scenario, result, startedAt, timeoutMs);
    }
  }

  async assertChecked(scenario, locator, checked = true, timeoutMs = 30000) {
    const startedAt = Date.now();
    let result = 'FAIL';
    try {
      checked
        ? await expect(locator).toBeChecked({ timeout: timeoutMs })
        : await expect(locator).not.toBeChecked({ timeout: timeoutMs });
      result = 'PASS';
      return true;
    } catch (error) {
      result = 'ERROR';
      console.error(`Assertion failed for scenario "${scenario}":`, error);
      return false;
    } finally {
      await this.writeValidationResult(scenario, result, startedAt, timeoutMs);
    }
  }

  async assertCount(scenario, locator, expectedCount, timeoutMs = 30000) {
    const startedAt = Date.now();
    let result = 'FAIL';
    try {
      await expect(locator).toHaveCount(expectedCount, { timeout: timeoutMs });
      result = 'PASS';
      return true;
    } catch (error) {
      result = 'ERROR';
      console.error(`Assertion failed for scenario "${scenario}":`, error);
      return false;
    } finally {
      await this.writeValidationResult(scenario, result, startedAt, timeoutMs);
    }
  }

  async assertAttribute(scenario, locator, name, valuePattern, timeoutMs = 30000) {
    const startedAt = Date.now();
    let result = 'FAIL';
    try {
      await expect(locator).toHaveAttribute(name, valuePattern, { timeout: timeoutMs });
      result = 'PASS';
      return true;
    } catch (error) {
      result = 'ERROR';
      console.error(`Assertion failed for scenario "${scenario}":`, error);
      return false;
    } finally {
      await this.writeValidationResult(scenario, result, startedAt, timeoutMs);
    }
  }

  //#region Reusable action assertion wrapper
  async validateAction(scenario, action, timeoutMs = 30000) {
    const startedAt = Date.now();
    let result = 'FAIL';
    try {
      await action();
      result = 'PASS';
      return true;
    } catch (error) {
      console.error(`Validation error for scenario "${scenario}":`, error);
      result = 'ERROR';
      return false;
    } finally {
      await this.writeValidationResult(scenario, result, startedAt, timeoutMs);
    }
  }

//#endregion
//#region XML validation result writer
  async writeValidationResult(scenario, result, startedAt, timeoutMs = 30000) {
    const elapsedMs = Date.now() - startedAt;
    const finalResult = elapsedMs >= timeoutMs ? 'TIMEOUT' : result;
    await addValidationResult(scenario, finalResult, elapsedMs);
  }
}
//#endregion
