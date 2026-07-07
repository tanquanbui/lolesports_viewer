/**
 * Wrapper around the unofficial lolesports.com esports feed — the same API
 * the official lolesports.com site uses for live match state. It fills the
 * gap Leaguepedia has: Leaguepedia's Cargo tables lag behind actual live
 * game state by minutes, this feed reflects "is a match live right now".
 *
 * The x-api-key below is the public key the lolesports.com website itself
 * ships in its client-side JS — not a secret, just required as a header.
 * Reference (community-maintained docs): https://vickz84259.github.io/lolesports-api-docs/
 */
const LolesportsLive = (() => {
  const API_BASE = "https://esports-api.lolesports.com/persisted/gw";
  const API_KEY = "0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z";

  async function get(path, params) {
    const url = new URL(`${API_BASE}/${path}`);
    url.searchParams.set("hl", "en-US");
    for (const [key, value] of Object.entries(params || {})) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, value);
      }
    }

    const response = await fetch(url.toString(), {
      headers: { "x-api-key": API_KEY },
    });
    if (!response.ok) {
      throw new Error(`lolesports live feed error: HTTP ${response.status}`);
    }
    return response.json();
  }

  async function getLiveEvents() {
    const data = await get("getLive");
    const events = data?.data?.schedule?.events || [];
    return events.filter((e) => e.state === "inProgress");
  }

  return { getLiveEvents };
})();
