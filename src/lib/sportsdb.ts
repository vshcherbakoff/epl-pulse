export const SPORTSDB_BASE = "https://www.thesportsdb.com/api/v1/json/123";
export const EPL_LEAGUE_ID = "4328";

/**
 * TheSportsDB uses season strings like "2025-2026".
 * Premier League runs Aug–May; for simplicity:
 * - If month >= July (6), use currentYear-currentYear+1
 * - Else use (currentYear-1)-currentYear
 */
export function getEplSeasonString(dateInLondon: Date): string {
  const month = dateInLondon.getMonth(); // 0=Jan
  const year = dateInLondon.getFullYear();
  const startYear = month >= 6 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
}

export async function fetchJson<T>(url: string, revalidateSeconds: number): Promise<T> {
  const res = await fetch(url, { next: { revalidate: revalidateSeconds } });
  if (!res.ok) throw new Error(`Upstream failed: ${res.status}`);
  return res.json() as Promise<T>;
}
