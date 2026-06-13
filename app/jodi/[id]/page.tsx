'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

/* ── palette ── */
const C = {
  peach:   '#FFCBA4',
  altRow:  '#FFD5A8',
  red:     '#FF0000',
  pink:    '#FF1493',
  navy:    '#00008B',
  indigo:  '#1a237e',
  yellow:  '#FFD700',
  btn:     '#4B3FA0',
  white:   '#FFFFFF',
  black:   '#111111',
};

/* ── types ── */
type MarketResponse = {
  status: string;
  data?: Record<string, Record<string, string | null>>;
  message?: string;
};
type LiveGame = {
  id: string;
  name: string;
  time: string;
  today_result:     { number: string | null; date: string } | null;
  yesterday_result: { number: string | null; date: string } | null;
};
type WeekRow = {
  days: (string | null)[];  // 0=Mon … 6=Sun
};

/* ── helpers ── */
function monthLabel(y: number, m: number): string {
  return new Date(y, m - 1, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
}
function todayYM() {
  const n = new Date();
  return { year: n.getFullYear(), month: n.getMonth() + 1 };
}
function fmtJodi(v: string | null | undefined): string {
  if (v === null || v === undefined) return '';
  return String(v).padStart(2, '0');
}

/* doubles (00,11,22…99) → red; everything else → black */
function isRed(v: string | null | undefined): boolean {
  if (!v) return false;
  const s = String(v).padStart(2, '0');
  return s[0] === s[1];
}

/* group flat date→value map into Mon-Sun week rows (no date labels needed) */
function groupByWeek(data: Record<string, string | null>): WeekRow[] {
  const map = new Map<string, WeekRow>();

  for (const [dateStr, val] of Object.entries(data)) {
    const d      = new Date(dateStr + 'T00:00:00Z');
    const rawDay = d.getUTCDay();                        // 0=Sun…6=Sat
    const monIdx = rawDay === 0 ? 6 : rawDay - 1;       // 0=Mon…6=Sun

    const monday = new Date(d);
    monday.setUTCDate(d.getUTCDate() - monIdx);
    const key = monday.toISOString().slice(0, 10);

    if (!map.has(key)) map.set(key, { days: Array(7).fill(null) });
    map.get(key)!.days[monIdx] = val;
  }

  return [...map.values()];   // already insertion-ordered from sorted entries
}

/* ══════════════════════════════════════════════════════════ */
export default function JodiChartPage() {
  const params = useParams();
  const gameId = ((params?.id as string) ?? '').toUpperCase();

  const [gameName, setGameName] = useState(gameId);
  const [gameTime, setGameTime] = useState('');

  const { year: initYear, month: initMonth } = todayYM();
  const [year,  setYear]  = useState(initYear);
  const [month, setMonth] = useState(initMonth);

  const [weeks,   setWeeks]   = useState<WeekRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  /* resolve game name */
  useEffect(() => {
    fetch('/api/satta/live', { cache: 'no-store' })
      .then((r) => r.json())
      .then((j: { status: string; data?: LiveGame[] }) => {
        const g = j.data?.find((x) => x.id === gameId);
        if (g) { setGameName(g.name); setGameTime(g.time); }
      })
      .catch(() => {});
  }, [gameId]);

  /* fetch monthly chart */
  const fetchChart = useCallback(async (y: number, m: number) => {
    setLoading(true);
    setError('');
    const ctrl  = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10_000);
    try {
      const dateStr = `${String(m).padStart(2, '0')}-${y}`;
      const res  = await fetch(`/api/satta/market?date=${dateStr}&ids=${gameId}`, { cache: 'no-store', signal: ctrl.signal });
      const json = (await res.json()) as MarketResponse;
      if (json.status !== 'success' || !json.data) throw new Error(json.message ?? 'Failed');
      const flat: Record<string, string | null> = {};
      /* sort entries by date so weeks are in order */
      const sorted = Object.entries(json.data).sort(([a], [b]) => a.localeCompare(b));
      for (const [date, vals] of sorted) flat[date] = vals[gameId] ?? null;
      setWeeks(groupByWeek(flat));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load chart');
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => { fetchChart(year, month); }, [fetchChart, year, month]);

  /* month nav */
  const prevMonth = () => {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    const { year: ny, month: nm } = todayYM();
    if (year > ny || (year === ny && month >= nm)) return;
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else setMonth((m) => m + 1);
  };
  const isCurrentMonth = year === initYear && month === initMonth;

  /* shared cell style */
  const dayNames = ['Mo', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  /* ── render ── */
  return (
    <div style={{ backgroundColor: C.peach, minHeight: '100vh', fontFamily: 'Arial, sans-serif', paddingBottom: '20px' }}>

      {/* ── LOGO HEADER ── */}
      <div style={{ backgroundColor: C.white, border: `3px solid ${C.red}`, margin: '4px', padding: '10px', textAlign: 'center' }}>
        <span style={{ fontFamily: 'cursive', color: C.pink, fontSize: '32px', fontWeight: 'bold', fontStyle: 'italic' }}>Dp</span>
        <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#111', letterSpacing: '2px' }}>BOSSSS.BOSTON</span>
      </div>

      {/* ── CHART TITLE BAR ── */}
      <div style={{ backgroundColor: C.indigo, margin: '4px', padding: '12px', textAlign: 'center' }}>
        <div style={{ color: C.white, fontWeight: 'bold', fontSize: '20px', letterSpacing: '1px' }}>
          {gameName} Jodi Chart
        </div>
        {gameTime && (
          <div style={{ color: '#ccc', fontSize: '13px', marginTop: '3px' }}>⏰ {gameTime}</div>
        )}
      </div>

      {/* ── BACK + MONTH NAV ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '6px 8px', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href="/">
            <button style={{ backgroundColor: C.btn, color: C.white, border: 'none', borderRadius: '8px', padding: '7px 14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
              ← Home
            </button>
          </Link>
          <Link href={`/panel/${gameId.toLowerCase()}`}>
            <button style={{ backgroundColor: C.indigo, color: C.white, border: 'none', borderRadius: '8px', padding: '7px 14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
              Panel Chart
            </button>
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={prevMonth} style={{ backgroundColor: C.indigo, color: C.white, border: 'none', borderRadius: '8px', padding: '7px 14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
            ← Prev
          </button>
          <span style={{ fontWeight: 'bold', fontSize: '15px', color: C.navy, fontStyle: 'italic', minWidth: '130px', textAlign: 'center' }}>
            {monthLabel(year, month)}
          </span>
          <button
            onClick={nextMonth}
            disabled={isCurrentMonth}
            style={{ backgroundColor: isCurrentMonth ? '#bbb' : C.indigo, color: C.white, border: 'none', borderRadius: '8px', padding: '7px 14px', fontWeight: 'bold', cursor: isCurrentMonth ? 'default' : 'pointer', fontSize: '14px' }}
          >
            Next →
          </button>
        </div>
      </div>

      {/* ── JODI TABLE ── */}
      <div style={{ margin: '4px', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ border: `2px solid ${C.red}`, padding: '30px', textAlign: 'center', color: C.navy, fontWeight: 'bold', fontSize: '16px' }}>
            Loading chart...
          </div>
        ) : error ? (
          <div style={{ border: `2px solid ${C.red}`, padding: '20px', textAlign: 'center', color: C.red, fontWeight: 'bold' }}>
            {error}
          </div>
        ) : weeks.length === 0 ? (
          <div style={{ border: `2px solid ${C.red}`, padding: '20px', textAlign: 'center', color: C.navy, fontWeight: 'bold' }}>
            No data available for this month.
          </div>
        ) : (
          <table style={{ borderCollapse: 'collapse', margin: '0 auto', border: `2px solid ${C.red}` }}>
            {/* Blue title row */}
            <thead>
              <tr>
                <th
                  colSpan={7}
                  style={{ backgroundColor: C.indigo, color: C.white, fontWeight: 'bold', fontSize: '18px', padding: '10px', textAlign: 'center', letterSpacing: '1px' }}
                >
                  {gameName} Jodi Chart
                </th>
              </tr>
              {/* Yellow day headers */}
              <tr>
                {dayNames.map((d) => (
                  <th
                    key={d}
                    style={{ backgroundColor: C.yellow, color: C.navy, fontWeight: 'bold', fontSize: '15px', padding: '10px 18px', textAlign: 'center', border: `1px solid ${C.red}`, minWidth: '80px' }}
                  >
                    {d}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Data rows */}
            <tbody>
              {weeks.map((week, wi) => (
                <tr key={wi} style={{ backgroundColor: C.peach }}>
                  {week.days.map((result, di) => {
                    const jodi    = fmtJodi(result);
                    const colored = isRed(result);
                    return (
                      <td
                        key={di}
                        style={{
                          border:     `1px solid ${C.red}`,
                          padding:    '10px 6px',
                          textAlign:  'center',
                          minWidth:   '80px',
                          height:     '52px',
                        }}
                      >
                        {jodi && (
                          <span style={{ fontWeight: 'bold', fontSize: '26px', color: colored ? C.red : C.black }}>
                            {jodi}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div style={{ backgroundColor: C.peach, border: `2px solid ${C.red}`, margin: '10px 4px 4px', padding: '12px', textAlign: 'center' }}>
        <div style={{ fontWeight: 'bold', color: C.navy, fontSize: '16px' }}>SattaMatkaDpboss.co</div>
        <div style={{ color: C.navy, fontWeight: 'bold', fontSize: '14px', margin: '4px 0 2px' }}>📞 9425894347</div>
        <div style={{ color: C.navy, fontWeight: 'bold', fontSize: '14px', margin: '2px 0' }}>📞 9604221222</div>
        <div style={{ color: C.navy, fontWeight: 'bold', fontSize: '14px', margin: '2px 0' }}>📞 8446225281</div>
      </div>
    </div>
  );
}
