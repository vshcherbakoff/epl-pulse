"use client";

import { useEffect, useMemo, useState } from "react";

type ApiState<T> = { loading: boolean; error?: string; data?: T };

function londonTodayYmd(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function fmtKickoff(e: any): string {
  // Often strTime is "15:00:00" or "15:00"; keep HH:MM
  const t = String(e?.strTime ?? "").slice(0, 5);
  const d = e?.dateEvent ? String(e.dateEvent) : "";
  return [d, t].filter(Boolean).join(" ");
}

export default function Dashboard() {
  const today = useMemo(() => londonTodayYmd(), []);
  const [todayState, setTodayState] = useState<ApiState<{ date: string; events: any[] }>>({ loading: true });
  const [upcomingState, setUpcomingState] = useState<ApiState<{ season: string; events: any[] }>>({ loading: true });
  const [tableState, setTableState] = useState<ApiState<{ table: any[] }>>({ loading: true });

  async function loadAll() {
    setTodayState({ loading: true });
    setUpcomingState({ loading: true });
    setTableState({ loading: true });

    try {
      const [tRes, uRes, tabRes] = await Promise.all([
        fetch(`/api/epl/today?date=${encodeURIComponent(today)}`),
        fetch(`/api/epl/upcoming?limit=10`),
        fetch(`/api/epl/table`),
      ]);

      const [tJson, uJson, tabJson] = await Promise.all([tRes.json(), uRes.json(), tabRes.json()]);

      if (!tRes.ok) throw new Error(tJson?.error ?? "Failed to load today");
      if (!uRes.ok) throw new Error(uJson?.error ?? "Failed to load upcoming");
      if (!tabRes.ok) throw new Error(tabJson?.error ?? "Failed to load table");

      setTodayState({ loading: false, data: tJson });
      setUpcomingState({ loading: false, data: uJson });
      setTableState({ loading: false, data: tabJson });
    } catch (e: any) {
      const msg = e?.message ?? "Something went wrong";
      setTodayState({ loading: false, error: msg });
      setUpcomingState({ loading: false, error: msg });
      setTableState({ loading: false, error: msg });
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>Premier League</h1>
          <p style={{ margin: "6px 0 0", opacity: 0.75 }}>London time • Today: {today}</p>
        </div>
        <button
          onClick={loadAll}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.15)",
            background: "white",
            cursor: "pointer",
            color: "black"
          }}
        >
          Refresh
        </button>
      </header>

      <section style={{ marginTop: 18, padding: 14, border: "1px solid rgba(0,0,0,0.12)", borderRadius: 14 }}>
        <h2 style={{ marginTop: 0 }}>Today’s matches</h2>
        {todayState.loading ? (
          <p>Loading…</p>
        ) : todayState.error ? (
          <p style={{ color: "crimson" }}>{todayState.error}</p>
        ) : (todayState.data?.events?.length ?? 0) === 0 ? (
          <p>No Premier League matches today.</p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {todayState.data!.events.map((e: any) => (
              <li key={e.idEvent} style={{ margin: "6px 0" }}>
                <strong>{e.strHomeTeam}</strong> vs <strong>{e.strAwayTeam}</strong>{" "}
                <span style={{ opacity: 0.75 }}>— {fmtKickoff(e)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginTop: 18, padding: 14, border: "1px solid rgba(0,0,0,0.12)", borderRadius: 14 }}>
        <h2 style={{ marginTop: 0 }}>Next upcoming matches</h2>
        {upcomingState.loading ? (
          <p>Loading…</p>
        ) : upcomingState.error ? (
          <p style={{ color: "crimson" }}>{upcomingState.error}</p>
        ) : (
          <>
            <p style={{ marginTop: 0, opacity: 0.75 }}>Season: {upcomingState.data?.season}</p>
            {(upcomingState.data?.events?.length ?? 0) === 0 ? (
              <p>No upcoming matches found.</p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {upcomingState.data!.events.map((e: any) => (
                  <li key={e.idEvent} style={{ margin: "6px 0" }}>
                    <strong>{e.strHomeTeam}</strong> vs <strong>{e.strAwayTeam}</strong>{" "}
                    <span style={{ opacity: 0.75 }}>— {fmtKickoff(e)}</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>

      <section style={{ marginTop: 18, padding: 14, border: "1px solid rgba(0,0,0,0.12)", borderRadius: 14 }}>
        <h2 style={{ marginTop: 0 }}>Table</h2>
        {tableState.loading ? (
          <p>Loading…</p>
        ) : tableState.error ? (
          <p style={{ color: "crimson" }}>{tableState.error}</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(0,0,0,0.12)" }}>
                  <th style={{ padding: "8px 6px" }}>#</th>
                  <th style={{ padding: "8px 6px" }}>Team</th>
                  <th style={{ padding: "8px 6px" }}>P</th>
                  <th style={{ padding: "8px 6px" }}>GD</th>
                  <th style={{ padding: "8px 6px" }}>Pts</th>
                </tr>
              </thead>
              <tbody>
                {(tableState.data as any)?.table?.map((r: any) => (
                  <tr key={r.idTeam} style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                    <td style={{ padding: "8px 6px" }}>{r.intRank}</td>
                    <td style={{ padding: "8px 6px" }}>{r.strTeam}</td>
                    <td style={{ padding: "8px 6px" }}>{r.intPlayed}</td>
                    <td style={{ padding: "8px 6px" }}>{r.intGoalDifference}</td>
                    <td style={{ padding: "8px 6px" }}><strong>{r.intPoints}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer style={{ marginTop: 18, opacity: 0.7, fontSize: 13 }}>
        Data: TheSportsDB (free tier key 123). Cached server-side to stay within limits.
      </footer>
    </main>
  );
}
