(() => {
  const tournamentSelect = document.getElementById("tournament-select");
  const refreshBtn = document.getElementById("refresh-btn");
  const statusEl = document.getElementById("status");
  const scheduleEl = document.getElementById("schedule");
  const standingsEl = document.getElementById("standings");

  function setStatus(message, isError = false) {
    statusEl.textContent = message;
    statusEl.classList.toggle("status-error", isError);
  }

  async function init() {
    setStatus("Loading tournaments…");
    try {
      const tournaments = await Leaguepedia.getRecentTournaments();
      populateTournaments(tournaments);
      setStatus("");
      if (tournaments.length > 0) {
        await loadTournamentData(tournamentSelect.value);
      }
    } catch (err) {
      setStatus(`Could not load tournaments: ${err.message}`, true);
    }
  }

  function populateTournaments(tournaments) {
    tournamentSelect.innerHTML = "";
    if (tournaments.length === 0) {
      tournamentSelect.innerHTML = '<option value="">No tournaments found</option>';
      return;
    }
    for (const t of tournaments) {
      const opt = document.createElement("option");
      opt.value = t.OverviewPage;
      opt.textContent = t.Name || t.OverviewPage;
      tournamentSelect.appendChild(opt);
    }
  }

  async function loadTournamentData(overviewPage) {
    if (!overviewPage) return;
    scheduleEl.innerHTML = "";
    standingsEl.innerHTML = "";
    setStatus("Loading matches and standings…");

    const [scheduleResult, standingsResult] = await Promise.allSettled([
      Leaguepedia.getSchedule(overviewPage),
      Leaguepedia.getStandings(overviewPage),
    ]);

    if (scheduleResult.status === "fulfilled") {
      renderSchedule(scheduleResult.value);
    } else {
      scheduleEl.innerHTML = `<p class="empty">Could not load matches: ${escapeHtml(scheduleResult.reason.message)}</p>`;
    }

    if (standingsResult.status === "fulfilled") {
      renderStandings(standingsResult.value);
    } else {
      standingsEl.innerHTML = `<p class="empty">Could not load standings: ${escapeHtml(standingsResult.reason.message)}</p>`;
    }

    setStatus("");
  }

  function renderSchedule(matches) {
    if (matches.length === 0) {
      scheduleEl.innerHTML = '<p class="empty">No matches found for this tournament.</p>';
      return;
    }

    const now = new Date();
    const upcoming = matches.filter((m) => !m.Winner && parseUtc(m.DateTime_UTC) >= now);
    const completed = matches
      .filter((m) => m.Winner || parseUtc(m.DateTime_UTC) < now)
      .reverse();

    const parts = [];
    if (upcoming.length > 0) {
      parts.push('<h3 class="section-label">Upcoming</h3>');
      parts.push(upcoming.map(matchRow).join(""));
    }
    if (completed.length > 0) {
      parts.push('<h3 class="section-label">Completed</h3>');
      parts.push(completed.slice(0, 30).map(matchRow).join(""));
    }
    scheduleEl.innerHTML = parts.join("");
  }

  function matchRow(match) {
    const date = parseUtc(match.DateTime_UTC);
    const dateLabel = isNaN(date) ? "TBD" : date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
    const team1Won = match.Winner === "1";
    const team2Won = match.Winner === "2";
    const scoreLabel = match.Team1Score !== "" && match.Team2Score !== ""
      ? `${match.Team1Score} - ${match.Team2Score}`
      : "vs";

    return `
      <div class="match-row">
        <div class="match-meta">
          <span class="match-date">${escapeHtml(dateLabel)}</span>
          <span class="match-round">${escapeHtml([match.Phase, match.Round].filter(Boolean).join(" – "))}</span>
          ${match.BestOf ? `<span class="match-bo">Bo${escapeHtml(match.BestOf)}</span>` : ""}
        </div>
        <div class="match-teams">
          <span class="team ${team1Won ? "winner" : ""}">${escapeHtml(match.Team1 || "TBD")}</span>
          <span class="score">${escapeHtml(scoreLabel)}</span>
          <span class="team ${team2Won ? "winner" : ""}">${escapeHtml(match.Team2 || "TBD")}</span>
        </div>
      </div>`;
  }

  function renderStandings(rows) {
    if (rows.length === 0) {
      standingsEl.innerHTML = '<p class="empty">No standings available for this tournament.</p>';
      return;
    }

    const body = rows
      .map(
        (r) => `
      <tr>
        <td>${escapeHtml(r.Place || "-")}</td>
        <td>${escapeHtml(r.Team || "-")}</td>
        <td>${escapeHtml(r.WinSeries || "0")}-${escapeHtml(r.LossSeries || "0")}</td>
        <td>${escapeHtml(r.WinGame || "0")}-${escapeHtml(r.LossGame || "0")}</td>
        <td>${escapeHtml(r.Streak || "-")}</td>
      </tr>`
      )
      .join("");

    standingsEl.innerHTML = `
      <table>
        <thead>
          <tr><th>#</th><th>Team</th><th>Series</th><th>Games</th><th>Streak</th></tr>
        </thead>
        <tbody>${body}</tbody>
      </table>`;
  }

  function parseUtc(value) {
    if (!value) return new Date(NaN);
    return new Date(`${value.replace(" ", "T")}Z`);
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c]));
  }

  tournamentSelect.addEventListener("change", () => loadTournamentData(tournamentSelect.value));
  refreshBtn.addEventListener("click", () => loadTournamentData(tournamentSelect.value));

  init();
})();
