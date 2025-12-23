import { NextResponse } from "next/server";
import { EPL_LEAGUE_ID, SPORTSDB_BASE, fetchJson } from "@/lib/sportsdb";

export async function GET() {
  try {
    const url = `${SPORTSDB_BASE}/lookuptable.php?l=${EPL_LEAGUE_ID}`;
    const data = await fetchJson<any>(url, 120); // cache 2 min
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Failed" }, { status: 502 });
  }
}
