import { NextResponse } from "next/server";
import { EPL_LEAGUE_ID, SPORTSDB_BASE, fetchJson } from "@/lib/sportsdb";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date"); // YYYY-MM-DD (London)
    if (!date) return NextResponse.json({ error: "Missing ?date=YYYY-MM-DD" }, { status: 400 });

    // eventsday supports optional sport filter "s"
    const url = `${SPORTSDB_BASE}/eventsday.php?d=${encodeURIComponent(date)}&s=Soccer`;
    const data = await fetchJson<any>(url, 60); // cache 1 min

    const events = (data?.events ?? []).filter((e: any) => String(e.idLeague) === EPL_LEAGUE_ID);

    // Sort by timestamp/time if available
    events.sort((a: any, b: any) => String(a.strTimestamp || a.strTime || "").localeCompare(String(b.strTimestamp || b.strTime || "")));

    return NextResponse.json({ date, events });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Failed" }, { status: 502 });
  }
}
