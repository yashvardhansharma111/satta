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

export async function GET() {
  try {
    const res  = await fetch(`${BASE}?key=${API_KEY}&type=markets`, { cache: 'no-store' });
    const json = (await res.json()) as DpMarketsResponse;

    if (!json.success || !json.data) {
      return NextResponse.json({ status: 'error', message: 'API error' }, { status: 502 });
    }

    // Today's date in IST (UTC+5:30) — game dates use IST
    const istNow = new Date(Date.now() + 5.5 * 3600 * 1000);
    const todayIST = istNow.toISOString().slice(0, 10);

    const data = json.data.map((g) => {
      const resultDate = g.result_date ?? '';
      const isToday    = resultDate === todayIST;

      const entry = g.number_main != null ? {
        number: String(g.number_main).padStart(2, '0'),
        open:   g.number_open  ?? null,
        close:  g.number_close ?? null,
        date:   resultDate,
      } : null;

      return {
        id:   String(g.id),
        name: g.game_name,
        time: `${formatTime(g.open_time)} - ${formatTime(g.close_time)}`,
        today_result:     isToday ? entry : null,
        yesterday_result: !isToday ? entry : null,
      };
    });

    return NextResponse.json({ status: 'success', data });
  } catch {
    return NextResponse.json({ status: 'error', message: 'Failed to fetch markets' }, { status: 500 });
  }
}
