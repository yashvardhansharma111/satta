import { NextResponse } from 'next/server';

const API_KEY = 'test_key_2d';
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

export async function GET() {
  try {
    const res  = await fetch(`${BASE}?key=${API_KEY}&type=markets`, { cache: 'no-store' });
    const json = (await res.json()) as DpMarketsResponse;

    if (!json.success || !json.data) {
      return NextResponse.json({ status: 'error', message: 'API error' }, { status: 502 });
    }

    const data = json.data.map((g) => ({
      id:   String(g.id),
      name: g.game_name,
      time: `${formatTime(g.open_time)} - ${formatTime(g.close_time)}`,
      today_result: g.number_main != null ? {
        number: String(g.number_main).padStart(2, '0'),
        open:   g.number_open  ?? null,
        close:  g.number_close ?? null,
        date:   g.result_date ?? g.updated_at ?? '',
      } : null,
      yesterday_result: null,
    }));

    return NextResponse.json({ status: 'success', data });
  } catch {
    return NextResponse.json({ status: 'error', message: 'Failed to fetch markets' }, { status: 500 });
  }
}
