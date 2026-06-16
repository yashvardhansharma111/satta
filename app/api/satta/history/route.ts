import { NextRequest, NextResponse } from 'next/server';

const API_KEY = 'test_key_2d';
const BASE    = 'https://api.codehap.com/dp/';

type DpHistoryResponse = {
  success: boolean;
  history?: Array<{ result_date: string; number_main: string | null; number_open?: string | null; number_close?: string | null }>;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const gameId  = searchParams.get('id') ?? '';
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

  const months: { m: number; y: number }[] = [];
  let cy = fromYear, cm = fromMonth;
  while (cy < toYear || (cy === toYear && cm <= toMonth)) {
    months.push({ m: cm, y: cy });
    cm++;
    if (cm > 12) { cm = 1; cy++; }
  }

  const results = await Promise.allSettled(
    months.map(async ({ m, y }) => {
      const monthStr = `${y}-${String(m).padStart(2, '0')}`;
      const res = await fetch(
        `${BASE}?key=${API_KEY}&type=history&id=${gameId}&month=${monthStr}`,
        { next: { revalidate: 300 } }
      );
      return res.json() as Promise<DpHistoryResponse>;
    })
  );

  const merged: Record<string, { main: string; open: string | null; close: string | null }> = {};
  for (const result of results) {
    if (result.status !== 'fulfilled') continue;
    const json = result.value;
    if (!json.success || !json.history) continue;
    for (const entry of json.history) {
      if (entry.number_main != null) {
        merged[entry.result_date] = {
          main:  entry.number_main,
          open:  entry.number_open  ?? null,
          close: entry.number_close ?? null,
        };
      }
    }
  }

  return NextResponse.json({ status: 'success', data: merged });
}
