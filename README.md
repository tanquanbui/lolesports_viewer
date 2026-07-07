# lolesports_viewer
This is my personal project where I try to design a better solution for displaying data from leaguepedia

## Features

- **Live Now** — matches currently in progress, polled every 30s from the same
  public feed lolesports.com itself uses.
- **Schedule** — upcoming and completed matches for a selected tournament, from
  Leaguepedia.
- **Standings** — current standings for a selected tournament, from Leaguepedia.

## Running it

No build step or backend required — it's a static site that queries two public
APIs directly from the browser:

- Leaguepedia's Cargo API (`https://lol.fandom.com/api.php`) for tournaments,
  schedule, and standings.
- The unofficial lolesports.com esports feed (`https://esports-api.lolesports.com`)
  for live match state.

```
npx serve .
# or just open index.html directly in a browser
```

Pick a tournament from the dropdown to see its match schedule and standings.

## Project layout

```
index.html               Page structure
css/style.css             Styling
js/leaguepedia.js         Leaguepedia Cargo API client (tournaments/schedule/standings)
js/lolesports-live.js     lolesports.com live feed client (live-now matches)
js/app.js                 UI wiring and rendering
```

## Notes

The Cargo table/field names (`Tournaments`, `MatchSchedule`, `Standings`) are based on
Leaguepedia's documented schema as of this writing. If a query starts returning empty
results or errors, the schema may have changed — open the browser console to see the
raw API error and adjust `js/leaguepedia.js` accordingly. Same goes for the live feed
in `js/lolesports-live.js` if the "Live Now" panel stops working.
