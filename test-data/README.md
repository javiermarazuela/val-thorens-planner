# Test data

200 invented travellers for trying the site and chatbot without real people.
Nothing here is real: names, emails (`@gsb.columbia.test`), flight numbers for
non-recommended flights, and room numbers are all made up. The recommended
flights and coach times are the real ones from `src/lib/trip.ts`.

Regenerate with `node scripts/gen-test-data.mjs`. The seed is fixed, so the
output is identical each time, and it changes only if `trip.ts` flights change.

| File | What it is |
| --- | --- |
| `../src/test-data/people.json` | Everything, used by the `/testdata` page |
| `Rooms.csv` | Same columns as the chatbot sheet's Rooms tab |
| `Shuttles.csv` | Same columns as the chatbot sheet's Shuttles tab |
| `Flights.csv` | A readable summary of how everyone travels |

## Who is in it (200)

| Group | People | How they travel |
| --- | --- | --- |
| recommended | 100 | A recommended NYC flight on 9 Jan, a recommended one back on 16 Jan |
| europe | 40 | Same days, from a European airport |
| americas | 20 | Same days, from elsewhere in the Americas (one connection) |
| early-arrival | 10 | In Geneva on 7 or 8 Jan, recommended flight home |
| late-departure | 10 | Recommended flight there, leave on 17 or 18 Jan |
| lyon | 10 | Fly to Lyon, bus up, and back the same way |
| paris | 10 | Train from Paris to Moutiers and back |

## Coaches

Uses the same rules as the flight form: an arrival coach is the first one at
least 1 hour after landing, and a departure coach is the latest one leaving at
least 5 hours before take-off. Coaches hold 55 and people are split evenly
when a slot needs more than one. Anyone who lands after about 13:15 or flies
before about 10:15 gets no group coach, on purpose, so the chatbot has that
case to handle.

## Rooms

93 rooms: 83 doubles, 6 triples, 4 quads, across Village Montana (74 rooms),
L'Oxalys (11) and Hameau du Kashmir (8, doubles only).
