const SHEET_NAME = 'Sheet1';
const SPREADSHEET_ID = ''; // Optional: add your Sheet ID here if this script is not bound to the Google Sheet.

const HEADERS = [
  'Submitted At',
  'Firm Name',
  'Owner/Partner Name',
  'Year Established',
  'City & State',
  'Full Office Address',
  'Phone Number',
  'WhatsApp Number',
  'Official Email',
  'Google Maps Link',
  'Office Timings',
  'Core Services',
  'Other Specialised Services',
  'Top 3 Most Requested Services',
  'Most Profitable Service',
  'Homepage Highlight Service',
  'Firm Tagline / Slogan',
  'About Firm',
  'Total Years of Experience',
  'Key Industries Served',
  'Key Team Members',
  'Client Testimonials / Reviews',
  'Logo Link',
  'Office/Team Photos Link',
  'Primary Target Client',
  'Primary Goal of Website',
  'Primary Call-to-Action',
  'Unique Selling Proposition',
  'Competitor Websites',
  'Case Studies / Achievements',
  'Certifications / Empanelment',
  'Sample Work Link',
  'Has Domain Name',
  'Domain Name / Preferred Domain',
  'LinkedIn Profile URL',
  'Twitter / X URL',
  'Target City for SEO',
  'Required Pages',
  'Expected Launch Date',
  'Project Priority',
  'Additional Notes',
  'Source Page'
];

const FIELD_ALIASES = {
  'Submitted At': ['timestamp', 'Submitted At'],
  'Firm Name': ['firmName', 'Firm Name'],
  'Owner/Partner Name': ['ownerName', 'Owner/Partner Name'],
  'Year Established': ['yearEstablished', 'Year Established'],
  'City & State': ['cityState', 'City & State'],
  'Full Office Address': ['address', 'Full Office Address'],
  'Phone Number': ['phone', 'Phone Number'],
  'WhatsApp Number': ['whatsapp', 'WhatsApp Number'],
  'Official Email': ['email', 'Official Email'],
  'Google Maps Link': ['googleMap', 'Google Maps Link'],
  'Office Timings': ['officeTimings', 'Office Timings'],
  'Core Services': ['services', 'Core Services'],
  'Other Specialised Services': ['otherServices', 'Other Specialised Services'],
  'Top 3 Most Requested Services': ['topServices', 'Top 3 Most Requested Services'],
  'Most Profitable Service': ['profitableService', 'Most Profitable Service'],
  'Homepage Highlight Service': ['highlightService', 'Homepage Highlight Service'],
  'Firm Tagline / Slogan': ['tagline', 'Firm Tagline / Slogan'],
  'About Firm': ['aboutFirm', 'About Firm'],
  'Total Years of Experience': ['experience', 'Total Years of Experience'],
  'Key Industries Served': ['industries', 'Key Industries Served'],
  'Key Team Members': ['teamMembers', 'Key Team Members'],
  'Client Testimonials / Reviews': ['testimonials', 'Client Testimonials / Reviews'],
  'Logo Link': ['logoLink', 'Logo Link'],
  'Office/Team Photos Link': ['photosLink', 'Office/Team Photos Link'],
  'Primary Target Client': ['targetClient', 'Primary Target Client'],
  'Primary Goal of Website': ['goal', 'Primary Goal of Website'],
  'Primary Call-to-Action': ['primaryCTA', 'Primary Call-to-Action'],
  'Unique Selling Proposition': ['usp', 'Unique Selling Proposition'],
  'Competitor Websites': ['competitors', 'Competitor Websites'],
  'Case Studies / Achievements': ['caseStudies', 'Case Studies / Achievements'],
  'Certifications / Empanelment': ['certifications', 'Certifications / Empanelment'],
  'Sample Work Link': ['sampleWork', 'Sample Work Link'],
  'Has Domain Name': ['hasDomain', 'Has Domain Name'],
  'Domain Name / Preferred Domain': ['domainName', 'Domain Name / Preferred Domain'],
  'LinkedIn Profile URL': ['linkedin', 'LinkedIn Profile URL'],
  'Twitter / X URL': ['twitter', 'Twitter / X URL'],
  'Target City for SEO': ['targetCity', 'Target City for SEO'],
  'Required Pages': ['pages', 'Required Pages'],
  'Expected Launch Date': ['deadline', 'Expected Launch Date'],
  'Project Priority': ['priority', 'Project Priority'],
  'Additional Notes': ['notes', 'Additional Notes'],
  'Source Page': ['sourcePage', 'Source Page']
};

function doGet() {
  return jsonResponse({ result: 'ready' });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const sheet = getSheet();
    ensureHeaders(sheet);

    const payload = getPayload(e);
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const row = headers.map(header => getValue(payload, header));

    sheet.appendRow(row);

    return jsonResponse({
      result: 'success',
      row: sheet.getLastRow()
    });
  } catch (error) {
    return jsonResponse({
      result: 'error',
      error: error.message
    });
  } finally {
    lock.releaseLock();
  }
}

function getSheet() {
  const spreadsheet = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  return sheet;
}

function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0 || sheet.getLastColumn() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    return;
  }

  const existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const missingHeaders = HEADERS.filter(header => !existingHeaders.includes(header));

  if (missingHeaders.length > 0) {
    sheet
      .getRange(1, existingHeaders.length + 1, 1, missingHeaders.length)
      .setValues([missingHeaders]);
  }
}

function getPayload(e) {
  if (e && e.parameter && Object.keys(e.parameter).length > 0) {
    return e.parameter;
  }

  if (e && e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (error) {
      return {};
    }
  }

  return {};
}

function getValue(payload, header) {
  const aliases = FIELD_ALIASES[header] || [header];
  const key = aliases.find(alias => payload[alias] !== undefined && payload[alias] !== '');

  return key ? payload[key] : '';
}

function jsonResponse(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
