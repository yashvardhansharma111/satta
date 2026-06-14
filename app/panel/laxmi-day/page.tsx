'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const C = {
  peach:  '#FFCBA4',
  altRow: '#FFD5A8',
  red:    '#FF0000',
  pink:   '#FF1493',
  navy:   '#00008B',
  indigo: '#1a237e',
  yellow: '#FFD700',
  btn:    '#4B3FA0',
  white:  '#FFFFFF',
};

type ApiCell = {
  topDigits:    [string, string, string];
  main:         string;
  bottomDigits: [string, string, string];
  isRed:        boolean;
};

type ApiRow = {
  startDate: string;
  endDate:   string;
  cells:     ApiCell[];
};

type WeekRow = {
  startLabel: string;
  endLabel:   string;
  cells:      ApiCell[];
};

function fmtDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z');
  return `${String(d.getUTCDate()).padStart(2, '0')}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${d.getUTCFullYear()}`;
}

export default function LaxmiDayPanelPage() {
  const [weeks,   setWeeks]   = useState<WeekRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    const ctrl  = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15_000);
    fetch('/api/chart-rows?gameId=LAXMI_DAY&sort=asc&limit=2000', { cache: 'no-store', signal: ctrl.signal })
      .then((r) => r.json())
      .then((json: { rows?: ApiRow[]; error?: string }) => {
        if (!json.rows) throw new Error(json.error ?? 'Failed');
        setWeeks(json.rows.map((r) => ({
          startLabel: fmtDate(r.startDate),
          endLabel:   fmtDate(r.endDate),
          cells:      r.cells,
        })));
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => { clearTimeout(timer); setLoading(false); });
    return () => ctrl.abort();
  }, []);

  const thStyle = (minW = 70): React.CSSProperties => ({
    backgroundColor: C.yellow,
    color:           C.navy,
    fontWeight:      'bold',
    fontSize:        '15px',
    padding:         '10px 4px',
    textAlign:       'center',
    border:          `1px solid ${C.red}`,
    minWidth:        `${minW}px`,
  });

  return (
    <div style={{ backgroundColor: C.peach, minHeight: '100vh', fontFamily: 'Arial, sans-serif', paddingBottom: '20px' }}>

      {/* LOGO */}
      <div style={{ backgroundColor: C.white, border: `3px solid ${C.red}`, margin: '4px', padding: '10px', textAlign: 'center' }}>
        <span style={{ fontFamily: 'cursive', color: C.pink, fontSize: '32px', fontWeight: 'bold', fontStyle: 'italic' }}>Dp</span>
        <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#111', letterSpacing: '2px' }}>BOSSSS.BOSTON</span>
      </div>

      {/* NAV */}
      <div style={{ display: 'flex', gap: '8px', margin: '6px 8px' }}>
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

      {/* TABLE */}
      <div style={{ margin: '0 4px 4px', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ border: `2px solid ${C.red}`, padding: '40px', textAlign: 'center', color: C.navy, fontWeight: 'bold', fontSize: '18px' }}>
            Loading chart...
          </div>
        ) : error ? (
          <div style={{ border: `2px solid ${C.red}`, padding: '20px', textAlign: 'center', color: C.red, fontWeight: 'bold' }}>
            {error}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', border: `2px solid ${C.red}`, fontFamily: '"Times New Roman", serif' }}>
            <thead>
              {/* Title row */}
              <tr>
                <th colSpan={8} style={{ backgroundColor: C.indigo, color: C.white, fontWeight: 'bold', fontSize: '20px', padding: '12px 20px', textAlign: 'center', letterSpacing: '1px' }}>
                  SRILAXMI DAY PANEL CHART
                </th>
              </tr>
              {/* Day header row */}
              <tr>
                <th style={thStyle(90)}>Date</th>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                  <th key={d} style={thStyle(90)}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, wi) => (
                <tr key={wi} style={{ backgroundColor: wi % 2 === 0 ? C.peach : C.altRow }}>
                  {/* Date column */}
                  <td style={{ border: `1px solid ${C.red}`, padding: '4px 6px', textAlign: 'center', fontWeight: 'bold', fontSize: '11px', color: C.navy, whiteSpace: 'nowrap', verticalAlign: 'middle', lineHeight: 1.7, minWidth: '90px' }}>
                    <div>{week.startLabel}</div>
                    <div style={{ fontSize: '9px', color: '#666' }}>to</div>
                    <div>{week.endLabel}</div>
                  </td>

                  {/* Day cells */}
                  {week.cells.map((c, di) => {
                    const val       = c.main.trim();
                    const hasResult = val && val !== '**' && val !== '*';
                    const jodi      = hasResult ? val.padStart(2, '0') : null;
                    const showTop    = hasResult && c.topDigits.some((d) => d !== '*' && d !== '**');
                    const showBottom = hasResult && c.bottomDigits.some((d) => d !== '*' && d !== '**');
                    return (
                      <td key={di} style={{ border: `1px solid ${C.red}`, padding: '4px 2px', textAlign: 'center', minWidth: '90px', height: '68px', verticalAlign: 'middle' }}>
                        {jodi ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {/* Top/left digits */}
                            {showTop && (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '11px', fontWeight: 'bold', color: '#000', lineHeight: 1.2, marginRight: '3px' }}>
                                {c.topDigits.map((d, k) => <span key={k}>{d}</span>)}
                              </div>
                            )}
                            {/* Main jodi */}
                            <div style={{ fontWeight: 'bold', fontSize: '24px', fontStyle: 'italic', color: c.isRed ? C.red : C.navy, minWidth: '32px', textAlign: 'center' }}>
                              {jodi}
                            </div>
                            {/* Bottom/right digits */}
                            {showBottom && (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '11px', fontWeight: 'bold', color: '#000', lineHeight: 1.2, marginLeft: '3px' }}>
                                {c.bottomDigits.map((d, k) => <span key={k}>{d}</span>)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontWeight: 'bold', fontSize: '20px', color: C.red }}>**</span>
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
      <div style={{ backgroundColor: C.peach, border: `2px solid ${C.red}`, margin: '10px 4px 4px', padding: '12px', textAlign: 'center' }}>
        <div style={{ fontWeight: 'bold', color: C.navy, fontSize: '16px' }}>SattaMatkaDpboss.co</div>
        <div style={{ color: C.navy, fontWeight: 'bold', fontSize: '14px', margin: '4px 0 2px' }}>📞 9425894347</div>
        <div style={{ color: C.navy, fontWeight: 'bold', fontSize: '14px', margin: '2px 0' }}>📞 9604221222</div>
        <div style={{ color: C.navy, fontWeight: 'bold', fontSize: '14px', margin: '2px 0' }}>📞 8446225281</div>
      </div>
    </div>
  );
}
