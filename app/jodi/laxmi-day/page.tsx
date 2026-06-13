'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

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

type ApiRow = {
  startDate: string;
  endDate:   string;
  cells: Array<{ main: string; isRed: boolean }>;
};

type WeekRow = { days: (string | null)[]; isRed: boolean[] };

function monthLabel(y: number, m: number): string {
  return new Date(y, m - 1, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
}

function todayYM() {
  const n = new Date();
  return { year: n.getFullYear(), month: n.getMonth() + 1 };
}

export default function LaxmiDayJodiPage() {
  const { year: initYear, month: initMonth } = todayYM();
  const [year,  setYear]  = useState(initYear);
  const [month, setMonth] = useState(initMonth);
  const [weeks,   setWeeks]   = useState<WeekRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const fetchChart = useCallback(async (y: number, m: number) => {
    setLoading(true);
    setError('');
    const ctrl  = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10_000);
    try {
      const res  = await fetch(
        `/api/chart-rows?gameId=LAXMI_DAY&year=${y}&month=${m}&sort=asc&limit=10`,
        { cache: 'no-store', signal: ctrl.signal }
      );
      const json = (await res.json()) as { rows?: ApiRow[]; error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Failed');
      const rows: WeekRow[] = (json.rows ?? []).map((r) => ({
        days:  r.cells.map((c) => { const v = c.main.trim(); return (v && v !== '**' && v !== '*') ? v.padStart(2, '0') : null; }),
        isRed: r.cells.map((c) => c.isRed),
      }));
      setWeeks(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load chart');
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchChart(year, month); }, [fetchChart, year, month]);

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

  const dayNames = ['Mo', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div style={{ backgroundColor: C.peach, minHeight: '100vh', fontFamily: 'Arial, sans-serif', paddingBottom: '20px' }}>

      {/* LOGO */}
      <div style={{ backgroundColor: C.white, border: `3px solid ${C.red}`, margin: '4px', padding: '10px', textAlign: 'center' }}>
        <span style={{ fontFamily: 'cursive', color: C.pink, fontSize: '32px', fontWeight: 'bold', fontStyle: 'italic' }}>Dp</span>
        <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#111', letterSpacing: '2px' }}>BOSSSS.BOSTON</span>
      </div>

      {/* TITLE */}
      <div style={{ backgroundColor: C.indigo, margin: '4px', padding: '12px', textAlign: 'center' }}>
        <div style={{ color: C.white, fontWeight: 'bold', fontSize: '20px', letterSpacing: '1px' }}>
          LAXMI DAY Jodi Chart
        </div>
        <div style={{ color: '#ccc', fontSize: '13px', marginTop: '3px' }}>⏰ 12:00 PM - 02:00 PM</div>
      </div>

      {/* NAV */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '6px 8px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href="/">
            <button style={{ backgroundColor: C.btn, color: C.white, border: 'none', borderRadius: '8px', padding: '7px 14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
              ← Home
            </button>
          </Link>
          <Link href="/panel/laxmi-day">
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

      {/* TABLE */}
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
            <thead>
              <tr>
                <th colSpan={7} style={{ backgroundColor: C.indigo, color: C.white, fontWeight: 'bold', fontSize: '18px', padding: '10px', textAlign: 'center', letterSpacing: '1px' }}>
                  LAXMI DAY Jodi Chart
                </th>
              </tr>
              <tr>
                {dayNames.map((d) => (
                  <th key={d} style={{ backgroundColor: C.yellow, color: C.navy, fontWeight: 'bold', fontSize: '15px', padding: '10px 18px', textAlign: 'center', border: `1px solid ${C.red}`, minWidth: '80px' }}>
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, wi) => (
                <tr key={wi} style={{ backgroundColor: C.peach }}>
                  {week.days.map((jodi, di) => (
                    <td key={di} style={{ border: `1px solid ${C.red}`, padding: '10px 6px', textAlign: 'center', minWidth: '80px', height: '52px' }}>
                      {jodi && (
                        <span style={{ fontWeight: 'bold', fontSize: '26px', color: week.isRed[di] ? C.red : C.black }}>
                          {jodi}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* FOOTER */}
      <div style={{ backgroundColor: C.peach, border: `2px solid ${C.red}`, margin: '10px 4px 4px', padding: '12px', textAlign: 'center' }}>
        <div style={{ fontWeight: 'bold', color: C.navy, fontSize: '16px' }}>SattaMatkaDpboss.co</div>
        <div style={{ color: C.navy, fontWeight: 'bold', fontSize: '14px', margin: '4px 0 2px' }}>📞 9425894347</div>
        <div style={{ color: C.navy, fontWeight: 'bold', fontSize: '14px', margin: '2px 0' }}>📞 9604221222</div>
        <div style={{ color: C.navy, fontWeight: 'bold', fontSize: '14px', margin: '2px 0' }}>📞 8446225281</div>
      </div>
    </div>
  );
}
