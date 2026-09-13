const resultsBody = document.querySelector('#results-body');
const reportStatus = document.querySelector('#report-status');

function readValue(validation, tagName) {
  return validation.querySelector(tagName)?.textContent?.trim() ?? '';
}

function resultClass(result) {
  return `result-${result.toLowerCase()}`;
}

function addResultRow(validation) {
  const result = readValue(validation, 'RESUTL');
  const row = document.createElement('tr');
  const scenarioCell = document.createElement('td');
  const resultCell = document.createElement('td');
  const timelapsCell = document.createElement('td');
  const resultLabel = document.createElement('span');

  scenarioCell.textContent = readValue(validation, 'SCENARIO');
  timelapsCell.textContent = readValue(validation, 'TIMELAPS');
  resultLabel.className = `result ${resultClass(result)}`;
  resultLabel.textContent = result;
  resultCell.append(resultLabel);

  row.append(scenarioCell, resultCell, timelapsCell);
  resultsBody.append(row);
}

async function loadValidationResults() {
  const response = await fetch('../reports/validation-results.xml', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Could not load validation results (${response.status}).`);
  }

  const xmlText = await response.text();
  const xml = new DOMParser().parseFromString(xmlText, 'application/xml');
  const parseError = xml.querySelector('parsererror');
  if (parseError) {
    throw new Error('The validation results XML is not valid.');
  }

  const validations = [...xml.querySelectorAll('VALIDATION')];
  validations.forEach(addResultRow);
  reportStatus.textContent = `${validations.length} scenario${validations.length === 1 ? '' : 's'} reported`;
}

loadValidationResults().catch((error) => {
  reportStatus.textContent = error.message;
  reportStatus.classList.add('error');
});
