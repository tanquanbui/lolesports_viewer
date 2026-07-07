# lolesports_viewer
This is my personal project where I try to design a better solution for displaying data from leaguepedia

## Running it

No build step or backend required — it's a static site that queries Leaguepedia's
public Cargo API (`https://lol.fandom.com/api.php`) directly from the browser.

```
npx serve .
# or just open index.html directly in a browser
```

Pick a tournament from the dropdown to see its match schedule and standings.

## Notes

The Cargo table/field names (`Tournaments`, `MatchSchedule`, `Standings`) are based on
Leaguepedia's documented schema as of this writing. If a query starts returning empty
results or errors, the schema may have changed — open the browser console to see the
raw API error and adjust `js/leaguepedia.js` accordingly.
