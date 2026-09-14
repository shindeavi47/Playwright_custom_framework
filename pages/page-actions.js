import { addValidationResult } from '../utils/validation-results.js';

export class PageActions {
  constructor(page) {
    this.page = page;
  }

  async validateByRole(scenario, roleType, roleName, elementToCheck, elementValue, timeoutMs = 30000,
  ) {
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
        await this.page.getByRole(roleType, { name: roleName, exact: true }).first().click({ timeout: timeoutMs });
      }

      const actualValue = (await elementToCheck.textContent({ timeout: timeoutMs })).trim();
      result = actualValue === elementValue ? 'PASS' : 'FAIL';
      console.log(
        result === 'PASS'
          ? `Validation passed for scenario "${scenario}".`
          : `Validation failed for scenario "${scenario}". Expected "${elementValue}" for "${elementToCheck}" but found "${actualValue}".`
      );
      return true;
    } catch (error) {
      console.error(`Validation error for scenario "${scenario}":`, error);
      result = 'ERROR';
    } finally {
      await this.writeValidationResult(scenario, result, startedAt, timeoutMs);
    }
  }

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

      const itemTexts = (await elementsToCheck.allTextContents()).map((item) => item.trim());
      console.log(`Items to check for sorting: ${itemTexts.join(', ')}`);
      const isSorted = itemTexts.every((currentItem, index) => {
        if (index === 0) {
          return true;
        }

        const previousItem = itemTexts[index - 1];
        const comparison = previousItem.localeCompare(currentItem);
        return order === 'ascending' ? comparison <= 0 : comparison >= 0;
      });

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

  async writeValidationResult(scenario, result, startedAt, timeoutMs = 30000) {
    const elapsedMs = Date.now() - startedAt;
    const finalResult = elapsedMs >= timeoutMs ? 'TIMEOUT' : result;
    await addValidationResult(scenario, finalResult, elapsedMs);
  }
}
