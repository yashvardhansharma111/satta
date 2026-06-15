import { NextResponse } from 'next/server';

const API_KEY = 'test_key_2d';
const BASE    = 'https://api.codehap.com/dp/';

function formatTime(t: string): string {
  const [hStr, mStr] = t.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour   = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

type DpGame = {
  id: number;
  game_name: string;
  open_time: string;
  close_time: string;
  number_main: string | null;
  updated_at?: string;
  result_date?: string;
};

type DpLiveResponse = { success: boolean; data?: DpGame[] };

export async function GET() {
  try {
    const res  = await fetch(`${BASE}?key=${API_KEY}&type=live`, { cache: 'no-store' });
    const json = (await res.json()) as DpLiveResponse;

    if (!json.success || !json.data) {
      return NextResponse.json({ status: 'error', message: 'API error' }, { status: 502 });
    }

    const data = json.data.map((g) => ({
      id:   String(g.id),
      name: g.game_name,
      time: `${formatTime(g.open_time)} - ${formatTime(g.close_time)}`,
      today_result: g.number_main != null
        ? { number: g.number_main, date: g.updated_at ?? g.result_date ?? '' }
        : null,
      yesterday_result: null,
    }));

    return NextResponse.json({ status: 'success', data });
  } catch {
    return NextResponse.json({ status: 'error', message: 'Failed to fetch live data' }, { status: 500 });
  }
}
