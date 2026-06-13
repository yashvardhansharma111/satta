'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

/* ── palette ── */
const C = {
  peach:    '#FFCBA4',
  altRow:   '#FFD5A8',
  red:      '#FF0000',
  pink:     '#FF1493',
  navy:     '#00008B',
  indigo:   '#1a237e',   // chart title bar
  yellow:   '#FFD700',   // column headers
  btn:      '#4B3FA0',
  darkRed:  '#8B0000',
  white:    '#FFFFFF',
};

/* ── API types ── */
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

/* ── week row ── */
type WeekRow = {
  weekStart: Date;
  weekEnd:   Date;
  days: (string | null)[];   // index 0=Mon … 6=Sun
};

/* ── helpers ── */
function fmtDate(d: Date): string {
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
}
function fmtJodi(v: string | null | undefined): string {
  if (v === null || v === undefined) return '';
  return String(v).padStart(2, '0');
}
function monthLabel(y: number, m: number): string {
  return new Date(y, m - 1, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
}
function todayYM() {
  const n = new Date();
  return { year: n.getFullYear(), month: n.getMonth() + 1 };
}

/* Group daily data into Mon-Sun week rows */
function groupByWeek(data: Record<string, string | null>): WeekRow[] {
  const map = new Map<string, WeekRow>();

  for (const [dateStr, val] of Object.entries(data)) {
    const d = new Date(dateStr + 'T00:00:00Z');
    // 0=Sun…6=Sat → convert to Mon-based (0=Mon…6=Sun)
    const rawDay  = d.getUTCDay();
    const monIdx  = rawDay === 0 ? 6 : rawDay - 1;

    const monday  = new Date(d);
    monday.setUTCDate(d.getUTCDate() - monIdx);
    const sunday  = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 6);

    const key = monday.toISOString().slice(0, 10);
    if (!map.has(key)) {
      map.set(key, { weekStart: monday, weekEnd: sunday, days: Array(7).fill(null) });
    }
    map.get(key)!.days[monIdx] = val;
  }

  return [...map.values()].sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());
}

/* ══════════════════════════════════════════════════════════ */
export default function PanelChartPage() {
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

  /* resolve game name once */
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
      for (const [date, vals] of Object.entries(json.data)) {
        flat[date] = vals[gameId] ?? null;
      }
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

  /* cell style */
  const cell: React.CSSProperties = {
    border: `1px solid ${C.red}`,
    padding: '6px 4px',
    textAlign: 'center',
    minWidth: '80px',
  };
  const headerCell: React.CSSProperties = {
    ...cell,
    backgroundColor: C.yellow,
    color: C.navy,
    fontWeight: 'bold',
    fontSize: '15px',
    padding: '10px 6px',
  };

  /* ── render ── */
  return (
    <div style={{ backgroundColor: C.peach, minHeight: '100vh', fontFamily: 'Arial, sans-serif', paddingBottom: '20px' }}>

      {/* ── LOGO HEADER ── */}
      <div style={{ backgroundColor: C.white, border: `3px solid ${C.red}`, margin: '4px', padding: '10px', textAlign: 'center' }}>
        <span style={{ fontFamily: 'cursive', color: C.pink, fontSize: '32px', fontWeight: 'bold', fontStyle: 'italic' }}>Dp</span>
        <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#111', letterSpacing: '2px' }}>BOSSSS.BOSTON</span>
      </div>

      {/* ── CHART TITLE BAR (dark blue like screenshot) ── */}
      <div style={{ backgroundColor: C.indigo, margin: '4px', padding: '12px', textAlign: 'center' }}>
        <div style={{ color: C.white, fontWeight: 'bold', fontSize: '20px', letterSpacing: '1px' }}>
          {gameName} PANEL CHART
        </div>
        {gameTime && (
          <div style={{ color: '#ccc', fontSize: '13px', marginTop: '3px' }}>⏰ {gameTime}</div>
        )}
      </div>

      {/* ── BACK + MONTH NAV ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '4px 8px', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href="/">
            <button style={{ backgroundColor: C.btn, color: C.white, border: 'none', borderRadius: '8px', padding: '7px 14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
              ← Home
            </button>
          </Link>
          <Link href={`/jodi/${gameId.toLowerCase()}`}>
            <button style={{ backgroundColor: C.indigo, color: C.white, border: 'none', borderRadius: '8px', padding: '7px 14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
              Jodi Chart
            </button>
          </Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={prevMonth} style={{ backgroundColor: C.indigo, color: C.white, border: 'none', borderRadius: '8px', padding: '7px 16px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
            ← Prev
          </button>
          <span style={{ fontWeight: 'bold', fontSize: '16px', color: C.navy, fontStyle: 'italic', minWidth: '140px', textAlign: 'center' }}>
            {monthLabel(year, month)}
          </span>
          <button
            onClick={nextMonth}
            disabled={isCurrentMonth}
            style={{ backgroundColor: isCurrentMonth ? '#bbb' : C.indigo, color: C.white, border: 'none', borderRadius: '8px', padding: '7px 16px', fontWeight: 'bold', cursor: isCurrentMonth ? 'default' : 'pointer', fontSize: '14px' }}
          >
            Next →
          </button>
        </div>
        <div style={{ width: '80px' }} />
      </div>

      {/* ── CHART TABLE ── */}
      <div style={{ margin: '4px', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ backgroundColor: C.peach, border: `2px solid ${C.red}`, padding: '30px', textAlign: 'center', color: C.navy, fontWeight: 'bold', fontSize: '16px' }}>
            Loading chart...
          </div>
        ) : error ? (
          <div style={{ backgroundColor: C.peach, border: `2px solid ${C.red}`, padding: '20px', textAlign: 'center', color: C.red, fontWeight: 'bold' }}>
            {error}
          </div>
        ) : weeks.length === 0 ? (
          <div style={{ backgroundColor: C.peach, border: `2px solid ${C.red}`, padding: '20px', textAlign: 'center', color: C.navy, fontWeight: 'bold' }}>
            No data available for this month.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', border: `2px solid ${C.red}` }}>
            <thead>
              <tr>
                <th style={{ ...headerCell, minWidth: '110px' }}>Date</th>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                  <th key={d} style={headerCell}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, wi) => (
                <tr key={wi} style={{ backgroundColor: wi % 2 === 0 ? C.peach : C.altRow }}>

                  {/* Date range cell */}
                  <td style={{ ...cell, fontSize: '12px', fontWeight: 'bold', color: C.navy, whiteSpace: 'nowrap', verticalAlign: 'middle', lineHeight: 1.6 }}>
                    <div>{fmtDate(week.weekStart)}</div>
                    <div style={{ fontSize: '10px', color: '#666' }}>to</div>
                    <div>{fmtDate(week.weekEnd)}</div>
                  </td>

                  {/* Day cells */}
                  {week.days.map((result, di) => {
                    const jodiStr = fmtJodi(result);
                    const hasResult = result !== null && result !== undefined;
                    return (
                      <td key={di} style={{ ...cell, verticalAlign: 'middle', height: '64px' }}>
                        {hasResult && (
                          <div style={{
                            fontWeight: 'bold',
                            fontSize: '28px',
                            fontStyle: 'italic',
                            color: C.navy,
                            lineHeight: 1,
                          }}>
                            {jodiStr}
                          </div>
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
      <div style={{ backgroundColor: C.peach, border: `2px solid ${C.red}`, margin: '8px 4px 4px', padding: '12px', textAlign: 'center' }}>
        <div style={{ fontWeight: 'bold', color: C.navy, fontSize: '16px' }}>SattaMatkaDpboss.co</div>
        <div style={{ color: C.navy, fontWeight: 'bold', fontSize: '14px', margin: '4px 0 2px' }}>📞 9425894347</div>
        <div style={{ color: C.navy, fontWeight: 'bold', fontSize: '14px', margin: '2px 0' }}>📞 9604221222</div>
        <div style={{ color: C.navy, fontWeight: 'bold', fontSize: '14px', margin: '2px 0' }}>📞 8446225281</div>
      </div>
    </div>
  );
}
