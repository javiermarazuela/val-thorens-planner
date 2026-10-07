/**
 * Keeps a "Flights" tab in this Google Sheet in step with the Supabase
 * `flights` table. Supabase's database webhook POSTs every insert, update and
 * delete here; this script adds, updates or removes that person's row.
 *
 * One way only: Supabase is the source of truth. Edits to the synced columns
 * are overwritten the next time that person saves. Keep committee notes in
 * another tab. Setup: see README.md in this folder.
 *
 * Needs a Script Property called SYNC_KEY (Project Settings -> Script
 * Properties). The webhook URL ends in ?key=<SYNC_KEY>.
 */

const SHEET_NAME = "Flights";
const HEADERS = [
  "Name",
  "Email",
  "Arrival: how",
  "Arrival date",
  "Arrival flight",
  "Arrival airport",
  "Arrival time",
  "Arrival coach",
  "Departure: how",
  "Departure date",
  "Departure flight",
  "Departure airport",
  "Departure time",
  "Departure coach",
  "Updated",
  "user_id", // last column, hidden: how rows are matched
];
const ID_COL = HEADERS.length;

const HOW = { geneva: "Geneva", other_flight: "Another flight", other: "Another way" };
const COACH = { yes: "Yes", no: "No", unsure: "Not sure" };

function doPost(e) {
  const key = PropertiesService.getScriptProperties().getProperty("SYNC_KEY");
  if (!key || !e || !e.parameter || e.parameter.key !== key) {
    return reply({ ok: false, error: "forbidden" });
  }

  let payload;
  try {
    payload = JSON.parse(e.postData.contents);
  } catch (err) {
    return reply({ ok: false, error: "bad json" });
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sheet = getSheet();
    if (payload.type === "DELETE") {
      removeRow(sheet, payload.old_record && payload.old_record.user_id);
    } else if (payload.record && payload.record.user_id) {
      upsertRow(sheet, payload.record);
    }
    return reply({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

function reply(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight("bold");
    sheet.setFrozenRows(1);
    sheet.hideColumns(ID_COL);
  }
  return sheet;
}

function findRow(sheet, userId) {
  const last = sheet.getLastRow();
  if (last < 2 || !userId) return -1;
  const ids = sheet.getRange(2, ID_COL, last - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (ids[i][0] === userId) return i + 2;
  }
  return -1;
}

function upsertRow(sheet, r) {
  const values = [
    [
      r.name || "",
      r.email || "",
      how(r.arr_mode, r.arr_note),
      r.arr_date || "",
      r.arr_flight || "",
      r.arr_airport || "",
      hhmm(r.arr_time),
      COACH[r.arr_shuttle] || "",
      how(r.dep_mode, r.dep_note),
      r.dep_date || "",
      r.dep_flight || "",
      r.dep_airport || "",
      hhmm(r.dep_time),
      COACH[r.dep_shuttle] || "",
      r.updated_at || "",
      r.user_id,
    ],
  ];
  const row = findRow(sheet, r.user_id);
  const target = row === -1 ? sheet.getLastRow() + 1 : row;
  sheet.getRange(target, 1, 1, HEADERS.length).setValues(values);
}

function removeRow(sheet, userId) {
  const row = findRow(sheet, userId);
  if (row !== -1) sheet.deleteRow(row);
}

function how(mode, note) {
  if (mode === "other") return note ? "Other: " + note : "Other";
  return HOW[mode] || "";
}

// Postgres sends "08:24:00"; the sheet only needs "08:24".
function hhmm(t) {
  return t ? String(t).slice(0, 5) : "";
}
