/**
 * Thin wrapper around Leaguepedia's public Cargo API (MediaWiki Cargo extension).
 * Docs: https://lol.fandom.com/wiki/Help:Leaguepedia_API
 */
const Leaguepedia = (() => {
  const API_BASE = "https://lol.fandom.com/api.php";

  async function cargoQuery(params) {
    const url = new URL(API_BASE);
    url.searchParams.set("action", "cargoquery");
    url.searchParams.set("format", "json");
    url.searchParams.set("origin", "*");
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, value);
      }
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Leaguepedia API error: HTTP ${response.status}`);
    }
    const data = await response.json();
    if (data.error) {
      throw new Error(`Leaguepedia API error: ${data.error.info || data.error.code}`);
    }
    return (data.cargoquery || []).map((row) => row.title);
  }

  function getRecentTournaments(limit = 60) {
    return cargoQuery({
      tables: "Tournaments",
      fields: "Name,OverviewPage,League,DateStart,Date,Region",
      where: "IsQualifier=0 AND (DateStart IS NOT NULL OR Date IS NOT NULL)",
      order_by: "COALESCE(DateStart,Date) DESC",
      limit: String(limit),
    });
  }

  function getSchedule(overviewPage, limit = 200) {
    return cargoQuery({
      tables: "MatchSchedule",
      fields:
        "Team1,Team2,Winner,DateTime_UTC,BestOf,Team1Score,Team2Score,Round,Phase,MatchId",
      where: `Tournament="${escapeForCargo(overviewPage)}"`,
      order_by: "DateTime_UTC ASC",
      limit: String(limit),
    });
  }

  function getStandings(overviewPage) {
    return cargoQuery({
      tables: "Standings",
      fields: "Team,Place,WinSeries,LossSeries,WinGame,LossGame,Streak",
      where: `OverviewPage="${escapeForCargo(overviewPage)}"`,
      order_by: "Place ASC",
      limit: "50",
    });
  }

  function escapeForCargo(value) {
    return String(value).replace(/"/g, '\\"');
  }

  return { getRecentTournaments, getSchedule, getStandings };
})();
