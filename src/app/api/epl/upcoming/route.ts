import { NextResponse } from "next/server";
import { EPL_LEAGUE_ID, SPORTSDB_BASE, fetchJson } from "@/lib/sportsdb";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit") ?? "10"), 20);

    const url = `${SPORTSDB_BASE}/eventsnextleague.php?id=${EPL_LEAGUE_ID}`;
    const data = await fetchJson<any>(url, 120); // cache 2 min

    const events = (data?.events ?? []).slice(0, limit);

    return NextResponse.json({ events });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Failed" }, { status: 502 });
  }
}
