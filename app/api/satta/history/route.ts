import { NextRequest, NextResponse } from 'next/server';

const API_KEY = '18pcw7mkx91z';

/* Fetches every month from `from` (MM-YYYY) to today in parallel, merges results */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const gameId  = (searchParams.get('id') ?? '').toUpperCase();
  const fromStr = searchParams.get('from') ?? '01-2023'; // MM-YYYY

  if (!gameId) {
    return NextResponse.json({ status: 'error', message: 'id is required' }, { status: 400 });
  }

  const [fmStr, fyStr] = fromStr.split('-');
  const fromMonth = Math.max(1, Math.min(12, Number(fmStr) || 1));
  const fromYear  = Number(fyStr) || 2023;

  const now     = new Date();
  const toYear  = now.getFullYear();
  const toMonth = now.getMonth() + 1;

  /* Build list of all months in range */
  const months: { m: number; y: number }[] = [];
  let cy = fromYear, cm = fromMonth;
  while (cy < toYear || (cy === toYear && cm <= toMonth)) {
    months.push({ m: cm, y: cy });
    cm++;
    if (cm > 12) { cm = 1; cy++; }
  }

  /* Fetch all months in parallel from external API */
  const results = await Promise.allSettled(
    months.map(async ({ m, y }) => {
      const dateStr = `${String(m).padStart(2, '0')}-${y}`;
      const res = await fetch(
        `https://api.codehap.com/satta/market/?key=${API_KEY}&date=${dateStr}&ids=${gameId}`,
        { next: { revalidate: 300 } }
      );
      return res.json() as Promise<{ status: string; data?: Record<string, Record<string, string | null>> }>;
    })
  );

  /* Merge into a flat { "YYYY-MM-DD": value } map */
  const merged: Record<string, string | null> = {};
  for (const result of results) {
    if (result.status !== 'fulfilled') continue;
    const json = result.value;
    if (json.status !== 'success' || !json.data) continue;
    for (const [date, vals] of Object.entries(json.data)) {
      const v = vals[gameId] ?? null;
      if (v !== null && v !== undefined) merged[date] = v;
    }
  }

  return NextResponse.json({ status: 'success', data: merged });
}
