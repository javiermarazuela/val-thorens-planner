/**
 * Publishes this Google Sheet to the chatbot's Supabase tables. Three tabs,
 * each one table:
 *
 *   Knowledge -> chat_knowledge   (what the bot knows)
 *   Rooms     -> member_rooms     (private, matched by email)
 *   Shuttles  -> member_shuttles  (private, matched by email)
 *
 * Nothing goes live while you type. Use the menu "Chatbot -> Publish to site"
 * when you are happy. Publishing makes Supabase match the tab exactly: rows
 * are added or updated, and rows you deleted from the sheet are removed.
 *
 * Needs two Script Properties (Project Settings -> Script Properties):
 *   SUPABASE_URL          https://YOUR-PROJECT.supabase.co
 *   SUPABASE_SERVICE_KEY  the service_role key (Supabase -> Project Settings
 *                         -> API). It stays in Script Properties, never in the
 *                         sheet, and this sheet must stay private to the
 *                         committee. Setup: see README.md in this folder.
 */

// Header text in row 1 -> column name in the table. Row 1 of each tab must
// match these exactly (the template does).
const TABS = {
  Knowledge: {
    table: "chat_knowledge",
    key: "id",
    columns: {
      ID: "id",
      Area: "area",
      Question: "question",
      "Other ways to ask (separate with ;)": "phrasings",
      Answer: "answer",
      "Who sees it (everyone / members)": "visibility",
      "Status (confirmed / tbc / hidden)": "status",
      Link: "link",
    },
    lists: ["phrasings"],
  },
  Rooms: {
    table: "member_rooms",
    key: "email",
    columns: {
      Email: "email",
      Name: "name",
      Residence: "residence",
      Room: "room",
      Note: "note",
    },
    lowercase: ["email"],
  },
  Shuttles: {
    table: "member_shuttles",
    key: "email",
    columns: {
      Email: "email",
      Name: "name",
      "Arrival coach": "arr_coach",
      "Arrival time": "arr_time",
      "Arrival pick-up": "arr_pickup",
      "Departure coach": "dep_coach",
      "Departure time": "dep_time",
      "Departure pick-up": "dep_pickup",
      Note: "note",
    },
    lowercase: ["email"],
  },
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Chatbot")
    .addItem("Publish to site", "publishAll")
    .addItem("Check before publishing", "checkAll")
    .addToUi();
}

function publishAll() {
  const ui = SpreadsheetApp.getUi();
  const problems = [];
  const parsed = {};
  Object.keys(TABS).forEach(function (tab) {
    const out = readTab(tab);
    problems.push.apply(problems, out.problems);
    parsed[tab] = out.rows;
  });
  if (problems.length) {
    ui.alert("Not published. Fix these first:\n\n" + problems.slice(0, 20).join("\n"));
    return;
  }
  const lines = [];
  Object.keys(TABS).forEach(function (tab) {
    const n = push(TABS[tab], parsed[tab]);
    lines.push(tab + ": " + (n ? n + " rows live" : "empty, left as it was"));
  });
  ui.alert("Published.\n\n" + lines.join("\n"));
}

function checkAll() {
  const problems = [];
  const lines = [];
  Object.keys(TABS).forEach(function (tab) {
    const out = readTab(tab);
    problems.push.apply(problems, out.problems);
    lines.push(tab + ": " + out.rows.length + " rows");
  });
  SpreadsheetApp.getUi().alert(
    (problems.length ? "Problems:\n\n" + problems.slice(0, 20).join("\n") : "All good.") +
      "\n\n" +
      lines.join("\n"),
  );
}

// Reads one tab into row objects, collecting anything that would be rejected.
function readTab(tab) {
  const spec = TABS[tab];
  const sheet = SpreadsheetApp.getActive().getSheetByName(tab);
  const problems = [];
  if (!sheet) return { rows: [], problems: ["Missing tab: " + tab] };

  const values = sheet.getDataRange().getValues();
  const header = values[0].map(String);
  const index = {};
  Object.keys(spec.columns).forEach(function (label) {
    const at = header.indexOf(label);
    if (at === -1) problems.push(tab + ": missing column \"" + label + "\"");
    index[spec.columns[label]] = at;
  });
  if (problems.length) return { rows: [], problems: problems };

  const rows = [];
  const seen = {};
  for (let r = 1; r < values.length; r++) {
    const row = {};
    let empty = true;
    Object.keys(index).forEach(function (col) {
      let v = String(values[r][index[col]]).trim();
      if (v) empty = false;
      if (spec.lowercase && spec.lowercase.indexOf(col) !== -1) v = v.toLowerCase();
      if (spec.lists && spec.lists.indexOf(col) !== -1) {
        row[col] = v
          .split(";")
          .map(function (s) {
            return s.trim();
          })
          .filter(Boolean);
      } else {
        row[col] = v === "" ? null : v;
      }
    });
    if (empty) continue;

    const where = tab + " row " + (r + 1);
    const key = row[spec.key];
    if (!key) {
      problems.push(where + ": " + spec.key + " is empty");
      continue;
    }
    if (seen[key]) problems.push(where + ": duplicate " + spec.key + " \"" + key + "\"");
    seen[key] = true;

    if (tab === "Knowledge") {
      if (!/^[a-z0-9-]+$/.test(key)) problems.push(where + ": ID may only use a-z, 0-9 and -");
      if (!row.area) problems.push(where + ": Area is empty");
      if (!row.question) problems.push(where + ": Question is empty");
      row.visibility = row.visibility || "everyone";
      row.status = row.status || "tbc";
      if (["everyone", "members"].indexOf(row.visibility) === -1)
        problems.push(where + ": Who sees it must be everyone or members");
      if (["confirmed", "tbc", "hidden"].indexOf(row.status) === -1)
        problems.push(where + ": Status must be confirmed, tbc or hidden");
      if (row.status === "confirmed" && !row.answer)
        problems.push(where + ": confirmed but the Answer is empty");
      row.answer = row.answer || "";
      row.sort = r;
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(key)) {
      problems.push(where + ": \"" + key + "\" is not an email");
    }
    row.updated_at = new Date().toISOString();
    rows.push(row);
  }
  return { rows: rows, problems: problems };
}

// Upserts the rows, then deletes anything in Supabase that is no longer in
// the sheet. Returns how many rows are live.
function push(spec, rows) {
  const props = PropertiesService.getScriptProperties();
  const base = props.getProperty("SUPABASE_URL");
  const key = props.getProperty("SUPABASE_SERVICE_KEY");
  if (!base || !key) throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_KEY in Script Properties.");
  const headers = { apikey: key, Authorization: "Bearer " + key };
  const url = base.replace(/\/$/, "") + "/rest/v1/" + spec.table;

  if (rows.length) {
    call(url + "?on_conflict=" + spec.key, {
      method: "post",
      contentType: "application/json",
      headers: Object.assign({ Prefer: "resolution=merge-duplicates,return=minimal" }, headers),
      payload: JSON.stringify(rows),
    });
    const keep = rows
      .map(function (r) {
        return '"' + String(r[spec.key]).replace(/"/g, "") + '"';
      })
      .join(",");
    call(url + "?" + spec.key + "=not.in.(" + encodeURIComponent(keep) + ")", {
      method: "delete",
      headers: headers,
    });
  }
  // An empty tab is almost always a mistake, so it leaves the table alone
  // rather than wiping it.
  return rows.length;
}

function call(url, options) {
  options.muteHttpExceptions = true;
  const res = UrlFetchApp.fetch(url, options);
  if (res.getResponseCode() >= 300) {
    throw new Error("Supabase said " + res.getResponseCode() + ": " + res.getContentText().slice(0, 300));
  }
}
