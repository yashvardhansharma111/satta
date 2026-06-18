import { NextResponse } from 'next/server';

const API_KEY = 'hl4w92ky5tp';
const BASE    = 'https://api.codehap.com/dp/';

function formatTime(t: string): string {
  const [hStr, mStr] = t.split(':');
  const h      = Number(hStr);
  const m      = Number(mStr);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour   = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

type DpGame = {
  id: number;
  game_name: string;
  open_time: string;
  close_time: string;
  number_open: string | null;
  number_main: string | null;
  number_close: string | null;
  updated_at?: string;
  result_date?: string;
};

type DpMarketsResponse = { success: boolean; data?: DpGame[] };

type HistoryEntry = {
  result_date: string;
  number_main: string | null;
  number_open?: string | null;
  number_close?: string | null;
};

type DpHistoryResponse = { success: boolean; history?: HistoryEntry[] };

type ResultEntry = { number: string; open: string | null; close: string | null; date: string };

export async function GET() {
  try {
    const res  = await fetch(`${BASE}?key=${API_KEY}&type=markets`, { cache: 'no-store' });
    const json = (await res.json()) as DpMarketsResponse;

    if (!json.success || !json.data) {
      return NextResponse.json({ status: 'error', message: 'API error' }, { status: 502 });
    }

    // Today's date in IST (UTC+5:30)
    const istNow   = new Date(Date.now() + 5.5 * 3600 * 1000);
    const todayIST = istNow.toISOString().slice(0, 10);
    const monthIST = todayIST.slice(0, 7); // YYYY-MM

    // Split markets into: have result today vs have no result at all
    const withResult:    DpGame[] = [];
    const withoutResult: DpGame[] = [];
    for (const g of json.data) {
      (g.number_main != null ? withResult : withoutResult).push(g);
    }

    // For markets with no result, fetch history to get yesterday's last known result
    // Cache history for 5 min (it doesn't change within the day)
    const historyMap: Record<string, ResultEntry> = {};
    await Promise.allSettled(
      withoutResult.map(async (g) => {
        try {
          const r = await fetch(
            `${BASE}?key=${API_KEY}&type=history&id=${g.id}&month=${monthIST}`,
            { next: { revalidate: 300 } }
          );
          const h = (await r.json()) as DpHistoryResponse;
          if (!h.success || !h.history?.length) return;
          // Most recent entry with a real result
          const latest = [...h.history]
            .sort((a, b) => b.result_date.localeCompare(a.result_date))
            .find((e) => e.number_main != null);
          if (latest) {
            historyMap[String(g.id)] = {
              number: String(latest.number_main).padStart(2, '0'),
              open:   latest.number_open  ?? null,
              close:  latest.number_close ?? null,
              date:   latest.result_date,
            };
          }
        } catch { /* keep going */ }
      })
    );

    const data = json.data.map((g) => {
      const resultDate = g.result_date ?? '';
      const isToday    = resultDate === todayIST;

      const todayEntry: ResultEntry | null = g.number_main != null ? {
        number: String(g.number_main).padStart(2, '0'),
        open:   g.number_open  ?? null,
        close:  g.number_close ?? null,
        date:   resultDate,
      } : null;

      return {
        id:   String(g.id),
        name: g.game_name,
        time: `${formatTime(g.open_time)} - ${formatTime(g.close_time)}`,
        today_result:     isToday ? todayEntry : null,
        yesterday_result: !isToday
          ? (todayEntry ?? historyMap[String(g.id)] ?? null)
          : (historyMap[String(g.id)] ?? null),
      };
    });

    return NextResponse.json({ status: 'success', data });
  } catch {
    return NextResponse.json({ status: 'error', message: 'Failed to fetch markets' }, { status: 500 });
  }
}
