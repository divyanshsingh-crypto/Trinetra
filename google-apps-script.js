function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);

    // ── 1. Log to Google Sheet ─────────────────────────────────────
    sheet.appendRow([
      new Date(),
      data.name || '',
      data.email || '',
      data.phone || '',
      data.destination || '',
      data.message || ''
    ]);

    // ── 2. Extract fields ──────────────────────────────────────────
    const userName = data.name || 'Traveller';
    const userEmail = data.email || '';
    const userPhone = data.phone || 'Not provided';
    const userDestination = data.destination || 'Northeast India';
    const userMessage = data.message || '';

    // ── 3. Confirmation email to the registrant ────────────────────
    const subject = '🛡️ Welcome to TriNetra, ' + userName + '!';

    const body = `
Hey ${userName},

Thank you for registering with TriNetra, your guardian eye across Northeast India.

We received your registration with the following details:

   Destination : ${userDestination}
   Phone       : ${userPhone}
   Message     : "${userMessage}"

Here's what happens next:
   You'll now receive personalised safety alerts for your destination.
   Your travel details are pre-loaded into our SOS system.
   Our team will review your message and respond within 24 hours.

Before you travel, here are a few quick reminders:

  → Always carry a printed copy of your ILP/PAP permit (if applicable).
  → Save our SOS emergency number offline: 112 (national) or 1363 (tourist helpline).
  → Keep local police contact for your destination area saved in your phone.

If you have any urgent queries or safety concerns, reach us directly:

-- TriNetra Safety Team
   Email : divyanshsingh7907@gmail.com
   Phone : +91 99367 12737

Stay safe. Explore boldly.

TriNetra – Three Eyes Watching Over You 
    `;

    GmailApp.sendEmail(userEmail, subject, body);

    // ── 4. Return success ──────────────────────────────────────────
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    // Log error in sheet for debugging
    try {
      const errSheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      errSheet.appendRow([new Date(), 'ERROR', err.toString()]);
    } catch (_) { }

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Optional: Add column headers on the first run.
 * Run this function manually once from the Apps Script editor.
 */
function setupSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.getRange(1, 1, 1, 6).setValues([[
    'Timestamp', 'Full Name', 'Email', 'Phone', 'Destination', 'Message'
  ]]);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#f59e0b');
  Logger.log('Sheet headers set up successfully.');
}
