import { NextResponse } from "next/server";
import { runFreshnessCron } from "@/lib/freshness-cron";

/**
 * Vercel Cron hits this once a day. Locally:
 *   curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/freshness
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!secret || token !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runFreshnessCron();
  return NextResponse.json({ ok: true, ...result });
}
