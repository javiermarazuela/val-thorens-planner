# Chatbot sheet to Supabase

A Google Sheet with three tabs feeds the chatbot. You edit the sheet, then use
the **Chatbot -> Publish to site** menu. Nothing goes live while you type.

| Tab | Table | What it holds |
| --- | --- | --- |
| Knowledge | `chat_knowledge` | Questions and answers the bot can give |
| Rooms | `member_rooms` | Each person's room, matched by Columbia email. Private |
| Shuttles | `member_shuttles` | Each person's airport coach, matched by email. Private |

Publishing makes Supabase match the tab: rows are added or updated, and rows
you deleted from the sheet are removed. An empty tab is skipped, never wiped.

## Setup (once)

1. In Supabase, run `supabase/migrations/0006_chatbot.sql` (SQL editor).
2. Create a Google Sheet, keep it private to the committee, and import the
   three files in `templates/` as tabs named exactly `Knowledge`, `Rooms` and
   `Shuttles` (File -> Import -> Insert new sheet). Keep row 1 as it is.
3. Extensions -> Apps Script. Paste in `knowledge-sheet.gs`.
4. Project Settings -> Script Properties, add:
   - `SUPABASE_URL`: `https://YOUR-PROJECT.supabase.co`
   - `SUPABASE_SERVICE_KEY`: the `service_role` key (Supabase -> Project
     Settings -> API). It stays in Script Properties, never in the sheet or the
     repo.
5. Reload the sheet. A **Chatbot** menu appears. Run **Check before publishing**
   first, then **Publish to site**. The first run asks Google for permission.

## The Knowledge columns

- **ID**: short and unique, lowercase letters, digits and `-`. It is how a row is
  recognised on the next publish, so don't change it after publishing.
- **Other ways to ask**: other wordings, separated by `;`. The free search uses
  these, so a few good ones save API calls.
- **Answer**: write it the way the bot should say it: short, friendly.
- **Who sees it**: `everyone` (also people not signed in) or `members`. Put
  anything with prices here as `members`.
- **Status**:
  - `confirmed`: the bot says it plainly.
  - `tbc` with an answer: the bot gives it and says it is to be confirmed.
  - `tbc` with an empty answer: the bot says "to be confirmed, message us on
    WhatsApp".
  - `hidden`: the bot never uses it.
- **Link**: optional, a page on the site (`/#around`) or a website.
- **Notes (not published)**: for you only. The script ignores this column.

## Good to know

- The sheet holds the service key's reach, so share it with committee members
  only. If you ever suspect it leaked, rotate the key in Supabase and update the
  Script Property.
- Emails in Rooms and Shuttles are lowercased on publish. Use the Columbia email
  people sign in with; that is how a person is matched to their row.
- After editing the script, save it. No new deployment is needed, because this
  script runs from the menu rather than as a web app.
