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
};

type ApiCell = {
  topDigits: [string, string, string];
  main: string;
  bottomDigits: [string, string, string];
  isRed: boolean;
};

type ApiRow = {
  startDate: string;
  endDate: string;
  cells: ApiCell[];
};

type WeekRow = {
  startLabel: string;
  endLabel:   string;
  cells: ApiCell[];
};

function fmtDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z');
  return `${String(d.getUTCDate()).padStart(2, '0')}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${d.getUTCFullYear()}`;
}

function monthLabel(y: number, m: number): string {
  return new Date(y, m - 1, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
}

function todayYM() {
  const n = new Date();
  return { year: n.getFullYear(), month: n.getMonth() + 1 };
}

export default function LaxmiDayPanelPage() {
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
      const rows = (json.rows ?? []).map((r) => ({
        startLabel: fmtDate(r.startDate),
        endLabel:   fmtDate(r.endDate),
        cells: r.cells,
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

  const cell: React.CSSProperties = {
    border: `1px solid ${C.red}`,
    padding: '4px 2px',
    textAlign: 'center',
    minWidth: '58px',
  };
  const headerCell: React.CSSProperties = {
    ...cell,
    backgroundColor: C.yellow,
    color: C.navy,
    fontWeight: 'bold',
    fontSize: '14px',
    padding: '10px 4px',
  };

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
          LAXMI DAY PANEL CHART
        </div>
        <div style={{ color: '#ccc', fontSize: '13px', marginTop: '3px' }}>⏰ 12:00 PM - 02:00 PM</div>
      </div>

      {/* NAV */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '4px 8px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href="/">
            <button style={{ backgroundColor: C.btn, color: C.white, border: 'none', borderRadius: '8px', padding: '7px 14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
              ← Home
            </button>
          </Link>
          <Link href="/jodi/laxmi-day">
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

      {/* TABLE */}
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
          <table style={{ width: '100%', borderCollapse: 'collapse', border: `2px solid ${C.red}`, fontFamily: '"Times New Roman", serif' }}>
            <thead>
              <tr>
                <th style={{ ...headerCell, minWidth: '90px' }}>Date</th>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                  <th key={d} style={headerCell}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, wi) => (
                <tr key={wi} style={{ backgroundColor: wi % 2 === 0 ? C.peach : C.altRow }}>
                  <td style={{ ...cell, fontSize: '11px', fontWeight: 'bold', color: C.navy, whiteSpace: 'nowrap', verticalAlign: 'middle', lineHeight: 1.6 }}>
                    <div>{week.startLabel}</div>
                    <div style={{ fontSize: '9px', color: '#666' }}>to</div>
                    <div>{week.endLabel}</div>
                  </td>
                  {week.cells.map((c, di) => {
                    const val = c.main.trim();
                    const hasResult = val && val !== '**' && val !== '*';
                    const jodi = hasResult ? val.padStart(2, '0') : '';
                    const showTop    = hasResult && c.topDigits.some(d => d !== '*');
                    const showBottom = hasResult && c.bottomDigits.some(d => d !== '*');
                    return (
                      <td key={di} style={{ ...cell, verticalAlign: 'middle', height: '64px' }}>
                        {hasResult && (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                            {showTop && (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '10px', fontWeight: 'bold', color: '#000', lineHeight: 1.1 }}>
                                {c.topDigits.map((d, k) => <span key={k}>{d}</span>)}
                              </div>
                            )}
                            <div style={{
                              fontWeight: 'bold',
                              fontSize: showTop ? '20px' : '26px',
                              fontStyle: 'italic',
                              color: c.isRed ? C.red : C.navy,
                              minWidth: '26px',
                              textAlign: 'center',
                            }}>
                              {jodi}
                            </div>
                            {showBottom && (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '10px', fontWeight: 'bold', color: '#000', lineHeight: 1.1 }}>
                                {c.bottomDigits.map((d, k) => <span key={k}>{d}</span>)}
                              </div>
                            )}
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

      {/* FOOTER */}
      <div style={{ backgroundColor: C.peach, border: `2px solid ${C.red}`, margin: '8px 4px 4px', padding: '12px', textAlign: 'center' }}>
        <div style={{ fontWeight: 'bold', color: C.navy, fontSize: '16px' }}>SattaMatkaDpboss.co</div>
        <div style={{ color: C.navy, fontWeight: 'bold', fontSize: '14px', margin: '4px 0 2px' }}>📞 9425894347</div>
        <div style={{ color: C.navy, fontWeight: 'bold', fontSize: '14px', margin: '2px 0' }}>📞 9604221222</div>
        <div style={{ color: C.navy, fontWeight: 'bold', fontSize: '14px', margin: '2px 0' }}>📞 8446225281</div>
      </div>
    </div>
  );
}
