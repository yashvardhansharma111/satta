'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const C = {
  peach:  '#FFCBA4',
  red:    '#FF0000',
  pink:   '#FF1493',
  navy:   '#00008B',
  indigo: '#1a237e',
  yellow: '#FFD700',
  btn:    '#4B3FA0',
  white:  '#FFFFFF',
  black:  '#000000',
};

type ApiRow = { startDate: string; endDate: string; cells: Array<{ main: string; isRed: boolean }> };
type WeekRow = { days: (string | null)[]; isRed: boolean[] };

export default function LaxmiNightJodiPage() {
  const [weeks,   setWeeks]   = useState<WeekRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    let alive = true;
    const ctrl  = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15_000);
    fetch('/api/chart-rows?gameId=LAXMI_NIGHT&sort=asc&limit=2000', { cache: 'no-store', signal: ctrl.signal })
      .then((r) => r.json())
      .then((json: { rows?: ApiRow[]; error?: string }) => {
        if (!alive) return;
        if (!json.rows) throw new Error(json.error ?? 'Failed');
        setWeeks(json.rows.map((r) => ({
          days:  r.cells.map((c) => { const v = c.main.trim(); return (v && v !== '**' && v !== '*') ? v.padStart(2, '0') : null; }),
          isRed: r.cells.map((c) => c.isRed),
        })));
      })
      .catch((e) => { if (alive) setError(e instanceof Error ? e.message : 'Failed to load'); })
      .finally(() => { clearTimeout(timer); if (alive) setLoading(false); });
    return () => { alive = false; ctrl.abort(); };
  }, []);

  const dayNames = ['Mo', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div style={{ backgroundColor: C.peach, minHeight: '100vh', fontFamily: 'Arial, sans-serif', paddingBottom: '20px' }}>

      <div style={{ backgroundColor: C.white, border: `3px solid ${C.red}`, margin: '4px', padding: '10px', textAlign: 'center' }}>
        <span style={{ fontFamily: 'cursive', color: C.pink, fontSize: '32px', fontWeight: 'bold', fontStyle: 'italic' }}>Dp</span>
        <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#111', letterSpacing: '2px' }}>BOSSSS.BOSTON</span>
      </div>

      <div style={{ display: 'flex', gap: '8px', margin: '6px 8px' }}>
        <Link href="/"><button style={{ backgroundColor: C.btn, color: C.white, border: 'none', borderRadius: '8px', padding: '7px 14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>← Home</button></Link>
        <Link href="/panel/laxmi-night"><button style={{ backgroundColor: C.indigo, color: C.white, border: 'none', borderRadius: '8px', padding: '7px 14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Panel Chart</button></Link>
      </div>

      <div style={{ margin: '0 4px 4px', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ border: `2px solid ${C.red}`, padding: '40px', textAlign: 'center', color: C.navy, fontWeight: 'bold', fontSize: '18px' }}>Loading chart...</div>
        ) : error ? (
          <div style={{ border: `2px solid ${C.red}`, padding: '20px', textAlign: 'center', color: C.red, fontWeight: 'bold' }}>{error}</div>
        ) : (
          <table style={{ borderCollapse: 'collapse', margin: '0 auto', border: `2px solid ${C.red}` }}>
            <thead>
              <tr>
                <th colSpan={7} style={{ backgroundColor: C.indigo, color: C.white, fontWeight: 'bold', fontSize: '20px', padding: '12px 20px', textAlign: 'center', letterSpacing: '1px' }}>
                  LAXMI NIGHT JODI CHART
                </th>
              </tr>
              <tr>
                {dayNames.map((d) => (
                  <th key={d} style={{ backgroundColor: C.yellow, color: C.navy, fontWeight: 'bold', fontSize: '16px', padding: '10px 0', textAlign: 'center', border: `1px solid ${C.red}`, minWidth: '90px' }}>
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '30px', textAlign: 'center', color: C.navy, fontWeight: 'bold', border: `1px solid ${C.red}` }}>No data available yet.</td></tr>
              ) : weeks.map((week, wi) => (
                <tr key={wi}>
                  {week.days.map((jodi, di) => (
                    <td key={di} style={{ border: `1px solid ${C.red}`, padding: '8px 4px', textAlign: 'center', minWidth: '90px', height: '52px', backgroundColor: C.peach }}>
                      {jodi ? (
                        <span style={{ fontWeight: 'bold', fontSize: '28px', color: week.isRed[di] ? C.red : C.black }}>{jodi}</span>
                      ) : (
                        <span style={{ fontWeight: 'bold', fontSize: '22px', color: C.red }}>**</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ backgroundColor: C.peach, border: `2px solid ${C.red}`, margin: '10px 4px 4px', padding: '12px', textAlign: 'center' }}>
        <div style={{ fontWeight: 'bold', color: C.navy, fontSize: '16px' }}>SattaMatkaDpboss.co</div>
        <div style={{ color: C.navy, fontWeight: 'bold', fontSize: '14px', margin: '4px 0 2px' }}>📞 9425894347</div>
        <div style={{ color: C.navy, fontWeight: 'bold', fontSize: '14px', margin: '2px 0' }}>📞 9604221222</div>
        <div style={{ color: C.navy, fontWeight: 'bold', fontSize: '14px', margin: '2px 0' }}>📞 8446225281</div>
      </div>
    </div>
  );
}
