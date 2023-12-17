import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

import { env } from '~/env.mjs';
import { type FormPayload } from '~/pages/api/form';

const client = new JWT({
  email: env.SHEETS_CLIENT_EMAIL,
  key: env.EMAIL_PRIVATE_KEY.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth: client });

export default async function updateSpreadsheet(payload: FormPayload) {
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: env.TEST_SPREADSHEET_ID,
      range: 'A1:AL1',
      insertDataOption: 'INSERT_ROWS',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [
          getRowData(payload),
        ],
      },
    });
    console.log('Spreadsheet updated');
  } catch(err) {
    console.error('Spreadsheet update failed:', err);
  }
}

// get the row data from the payload
function getRowData(payload: FormPayload): string[] {
  const now = new Date();

  return [
    payload.firstName,  // A: First Name	
    payload.lastName,   // B: Last Name	
    payload.phone,      // C: Phone #	
    payload.email,      // D: Email	
    payload.zip,      // E: Zip Code/Neighborhood	
    now.toLocaleDateString(),  // F: Date	
    now.toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles'}),  // G: Time
    payload.eventName, // H: Event Name
  ]
}
