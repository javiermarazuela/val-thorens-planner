# Flights to the committee Google Sheet

Every save in the `flights` table is pushed to a Google Sheet by a Supabase
database webhook and a small Apps Script. One way only: Supabase is the source
of truth, and the synced columns get overwritten when someone saves again.

## Setup (once)

1. Create a Google Sheet and keep it private to the committee. It will hold
   names, emails and flights.
2. Extensions -> Apps Script. Paste in `flights-sheet.gs`.
3. Project Settings -> Script Properties -> add `SYNC_KEY` with a long random
   string (a password-manager one is fine).
4. Deploy -> New deployment -> Web app. Execute as **Me**, access **Anyone**
   (Supabase has to reach it; the key protects it). Copy the `/exec` URL.
5. In Supabase, run `supabase/migrations/0005_flights_name.sql` (SQL editor).
6. Supabase -> Integrations -> Database Webhooks -> Create:
   - Table: `public.flights`; events Insert, Update and Delete.
   - Type: HTTP Request, method POST.
   - URL: the `/exec` URL followed by `?key=` and your `SYNC_KEY`.
7. Backfill people who saved before the sync existed. In the SQL editor run:
   `update public.flights set updated_at = now();`
   Each update fires the webhook, so every existing row lands in the sheet.

The script makes a `Flights` tab on first use. Keep committee notes in another
tab; do not type in the synced columns.

## Good to know

- Apps Script can't read request headers, so the secret is in the URL. Keep the
  URL private. If it leaks, change `SYNC_KEY` in the script and in the webhook.
- Webhooks are fire and forget. If Google is down, that save is missed until the
  person saves again or you rerun the backfill. Failed calls show in Supabase
  under `net._http_response`.
- After editing the script, deploy a **new version** of the web app, or the
  old code keeps running.
