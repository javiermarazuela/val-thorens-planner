import { createServerFn } from "@tanstack/react-start";

// Looks a flight up by number and date with AeroDataBox (via RapidAPI). Runs on
// the server only, so AERODATABOX_API_KEY never reaches the browser. Only
// signed-in members can call it, and results are cached (see below).

export type FlightLookupInput = { accessToken: string; number: string; date: string };

export type FlightLookupResult =
  | {
      found: true;
      airline: string;
      number: string;
      from: string;
      to: string;
      depTime: string; // hh:mm local
      arrTime: string; // hh:mm local
      arrDate: string; // yyyy-mm-dd local
      depDate: string; // yyyy-mm-dd local
    }
  | { found: false; reason: "not-found" | "unavailable" };

type Leg = {
  airport?: { iata?: string };
  scheduledTime?: { local?: string };
};
type ApiFlight = {
  number?: string;
  airline?: { name?: string };
  departure?: Leg;
  arrival?: Leg;
};

const flightNumber = /^[A-Z0-9]{2}\s?\d{1,4}[A-Z]?$/;
const isoDate = /^\d{4}-\d{2}-\d{2}$/;

function parseLocal(local: string | undefined): { date: string; time: string } | null {
  // AeroDataBox local times look like "2027-01-09 07:25+01:00".
  const m = local?.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})/);
  return m ? { date: m[1]!, time: m[2]! } : null;
}

// The cache lives in Supabase and is read and written with the signed-in
// member's own token (row level security), so there is no service key here.
// Each flight number + date costs at most one API call for everyone.
const NOT_FOUND_TTL_MS = 24 * 60 * 60 * 1000;
// Stop well short of the free plan so a busy day can't run the quota dry.
const MONTHLY_API_CAP = Number(process.env["AERODATABOX_MONTHLY_CAP"] ?? 80);

type CacheRow = { found: boolean; result: FlightLookupResult | null; fetched_at: string };

function supabaseRest(accessToken: string) {
  const url = process.env["VITE_SUPABASE_URL"];
  const key = process.env["VITE_SUPABASE_ANON_KEY"];
  if (!url || !key || !accessToken) return null;
  const headers = { apikey: key, Authorization: `Bearer ${accessToken}` };
  return { base: `${url}/rest/v1/flight_lookups`, headers };
}

export const lookupFlight = createServerFn({ method: "POST" })
  .validator((data: FlightLookupInput): FlightLookupInput => {
    const number = String(data?.number ?? "")
      .toUpperCase()
      .replace(/\s+/g, "");
    if (!flightNumber.test(number)) throw new Error("Bad flight number");
    if (!isoDate.test(String(data?.date ?? ""))) throw new Error("Bad date");
    return { accessToken: String(data.accessToken ?? ""), number, date: data.date };
  })
  .handler(async ({ data }): Promise<FlightLookupResult> => {
    const apiKey = process.env["AERODATABOX_API_KEY"];
    if (!apiKey) return { found: false, reason: "unavailable" };
    const rest = supabaseRest(data.accessToken);
    if (!rest) return { found: false, reason: "unavailable" };

    // 1. Cache. A failed read also means the token isn't a signed-in member.
    const cacheKey = `${data.number}|${data.date}`;
    const cached = await fetch(
      `${rest.base}?key=eq.${encodeURIComponent(cacheKey)}&select=found,result,fetched_at`,
      { headers: rest.headers },
    );
    if (!cached.ok) return { found: false, reason: "unavailable" };
    const row = ((await cached.json()) as CacheRow[])[0];
    if (row?.found && row.result) return row.result;
    if (row && !row.found && Date.now() - Date.parse(row.fetched_at) < NOT_FOUND_TTL_MS) {
      return { found: false, reason: "not-found" };
    }

    // 2. Monthly guard, counted from the cache rows written this month.
    const monthStart = new Date();
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);
    const counted = await fetch(
      `${rest.base}?fetched_at=gte.${monthStart.toISOString()}&select=key`,
      { headers: { ...rest.headers, Prefer: "count=exact", Range: "0-0" } },
    );
    const total = Number(counted.headers.get("content-range")?.split("/")[1] ?? 0);
    if (total >= MONTHLY_API_CAP) return { found: false, reason: "unavailable" };

    const store = async (result: FlightLookupResult) => {
      await fetch(`${rest.base}?on_conflict=key`, {
        method: "POST",
        headers: {
          ...rest.headers,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify({
          key: cacheKey,
          found: result.found,
          result: result.found ? result : null,
          fetched_at: new Date().toISOString(),
        }),
      }).catch(() => undefined);
    };

    try {
      const res = await fetch(
        `https://aerodatabox.p.rapidapi.com/flights/number/${data.number}/${data.date}?withAircraftImage=false&withLocation=false`,
        {
          headers: {
            "x-rapidapi-key": apiKey,
            "x-rapidapi-host": "aerodatabox.p.rapidapi.com",
          },
        },
      );
      if (res.status === 404 || res.status === 204) {
        const miss: FlightLookupResult = { found: false, reason: "not-found" };
        await store(miss);
        return miss;
      }
      if (!res.ok) return { found: false, reason: "unavailable" };

      const flights = ((await res.json()) as ApiFlight[]) ?? [];
      for (const f of flights) {
        const dep = parseLocal(f.departure?.scheduledTime?.local);
        const arr = parseLocal(f.arrival?.scheduledTime?.local);
        if (!dep || !arr) continue;
        const hit: FlightLookupResult = {
          found: true,
          airline: f.airline?.name ?? "",
          number: (f.number ?? data.number).replace(/\s+/g, ""),
          from: f.departure?.airport?.iata ?? "",
          to: f.arrival?.airport?.iata ?? "",
          depTime: dep.time,
          arrTime: arr.time,
          depDate: dep.date,
          arrDate: arr.date,
        };
        await store(hit);
        return hit;
      }
      const miss: FlightLookupResult = { found: false, reason: "not-found" };
      await store(miss);
      return miss;
    } catch {
      return { found: false, reason: "unavailable" };
    }
  });
