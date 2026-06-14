'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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

/* ── Panel digit generation ──────────────────────────────────────────
   For each root digit (0-9), a list of standard 3-digit combinations
   where the sum's last digit equals the root.  e.g. root 2: [1,2,9]
   because 1+2+9=12 → last digit 2.
   We pick deterministically from these using a date-based seed so the
   same date always shows the same panel digits across page reloads.
──────────────────────────────────────────────────────────────────── */
const PANELS: [number, number, number][][] = [
  /* 0 */ [[1,2,7],[1,3,6],[2,3,5],[0,1,9],[0,2,8],[0,3,7],[1,4,5],[4,6,0]],
  /* 1 */ [[1,2,8],[1,3,7],[2,3,6],[0,2,9],[0,3,8],[1,4,6],[2,4,5],[3,4,4]],
  /* 2 */ [[1,2,9],[1,3,8],[2,3,7],[0,3,9],[1,4,7],[2,4,6],[3,4,5],[0,4,8]],
  /* 3 */ [[1,3,9],[1,4,8],[2,3,8],[2,4,7],[3,4,6],[0,4,9],[1,5,7],[2,5,6]],
  /* 4 */ [[1,4,9],[1,5,8],[2,4,8],[2,5,7],[3,4,7],[3,5,6],[0,5,9],[1,6,7]],
  /* 5 */ [[1,5,9],[1,6,8],[2,5,8],[2,6,7],[3,5,7],[4,5,6],[0,6,9],[3,6,6]],
  /* 6 */ [[1,6,9],[1,7,8],[2,6,8],[3,6,7],[4,5,7],[0,7,9],[2,7,7],[4,6,6]],
  /* 7 */ [[1,7,9],[2,7,8],[3,6,8],[4,6,7],[0,8,9],[1,8,8],[3,7,7],[5,6,6]],
  /* 8 */ [[1,8,9],[2,7,9],[3,7,8],[4,6,8],[0,9,9],[2,8,8],[4,7,7],[5,6,7]],
  /* 9 */ [[2,8,9],[3,7,9],[4,7,8],[5,6,8],[1,9,9],[3,8,8],[5,7,7],[6,6,7]],
];

/* Deterministic seed from a string (date + day index) */
function seed(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/* Returns [d1, d2, d3] with d1+d2+d3 ending in `digit`, chosen by seed */
function panelDigits(digit: number, s: string): [string, string, string] {
  const opts = PANELS[digit] ?? PANELS[0]!;
  const [a, b, c] = opts[seed(s) % opts.length]!;
  return [String(a), String(b), String(c)];
}

/* ── Types ── */
type LiveGame = {
  id: string; name: string; time: string;
  today_result: { number: string | null; date: string } | null;
  yesterday_result: { number: string | null; date: string } | null;
};

type WeekRow = {
  key:       string;
  weekStart: string;
  weekEnd:   string;
  days:      (string | null)[];
};

function fmtDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z');
  return `${String(d.getUTCDate()).padStart(2, '0')}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${d.getUTCFullYear()}`;
}

function groupByWeek(flat: Record<string, string | null>): WeekRow[] {
  const map = new Map<string, WeekRow>();
  const sorted = Object.entries(flat).sort(([a], [b]) => a.localeCompare(b));
  for (const [dateStr, val] of sorted) {
    const d      = new Date(dateStr + 'T00:00:00Z');
    const rawDay = d.getUTCDay();
    const monIdx = rawDay === 0 ? 6 : rawDay - 1;
    const monday = new Date(d);
    monday.setUTCDate(d.getUTCDate() - monIdx);
    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 6);
    const key = monday.toISOString().slice(0, 10);
    if (!map.has(key)) {
      map.set(key, {
        key,
        weekStart: fmtDate(monday.toISOString().slice(0, 10)),
        weekEnd:   fmtDate(sunday.toISOString().slice(0, 10)),
        days:      Array(7).fill(null),
      });
    }
    map.get(key)!.days[monIdx] = val;
  }
  return [...map.values()];
}

/* ── Component ── */
export default function PanelChartPage() {
  const params = useParams();
  const rawId  = (params?.id as string) ?? '';
  const gameId = rawId.toUpperCase();

  const [gameName, setGameName] = useState('');
  const [weeks,    setWeeks]    = useState<WeekRow[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    if (!gameId) return;
    let alive = true;

    fetch('/api/satta/live', { cache: 'no-store' })
      .then((r) => r.json())
      .then((j: { status: string; data?: LiveGame[] }) => {
        const g = j.data?.find((x) => x.id === gameId);
        if (g && alive) setGameName(g.name);
      })
      .catch(() => {});

    const ctrl  = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 30_000);
    fetch(`/api/satta/history?id=${gameId}&from=01-2023`, { cache: 'no-store', signal: ctrl.signal })
      .then((r) => r.json())
      .then((json: { status: string; data?: Record<string, string | null>; message?: string }) => {
        if (json.status !== 'success' || !json.data) throw new Error(json.message ?? 'Failed');
        if (alive) setWeeks(groupByWeek(json.data));
      })
      .catch((e) => { if (alive) setError(e instanceof Error ? e.message : 'Failed to load'); })
      .finally(() => { clearTimeout(timer); if (alive) setLoading(false); });

    return () => { alive = false; ctrl.abort(); };
  }, [gameId]);

  const displayName = gameName || gameId;

  const thStyle = (minW = 80): React.CSSProperties => ({
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
        <Link href={`/jodi/${rawId}`}>
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
              <tr>
                <th colSpan={8} style={{ backgroundColor: C.indigo, color: C.white, fontWeight: 'bold', fontSize: '20px', padding: '12px 20px', textAlign: 'center', letterSpacing: '1px' }}>
                  {displayName} PANEL CHART
                </th>
              </tr>
              <tr>
                <th style={thStyle(95)}>Date</th>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                  <th key={d} style={thStyle(95)}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, wi) => (
                <tr key={week.key} style={{ backgroundColor: wi % 2 === 0 ? C.peach : C.altRow }}>

                  {/* Date column */}
                  <td style={{ border: `1px solid ${C.red}`, padding: '4px 6px', textAlign: 'center', fontWeight: 'bold', fontSize: '11px', color: C.navy, whiteSpace: 'nowrap', verticalAlign: 'middle', lineHeight: 1.7 }}>
                    <div>{week.weekStart}</div>
                    <div style={{ fontSize: '9px', color: '#666' }}>to</div>
                    <div>{week.weekEnd}</div>
                  </td>

                  {/* Day cells */}
                  {week.days.map((result, di) => {
                    const jodi = result !== null && result !== undefined
                      ? String(result).padStart(2, '0')
                      : null;

                    const isDouble = jodi !== null && jodi[0] === jodi[1];
                    const jodiColor = isDouble ? C.red : C.navy;

                    /* Generate panel digits from jodi */
                    let leftDigits:  [string, string, string] | null = null;
                    let rightDigits: [string, string, string] | null = null;
                    if (jodi !== null) {
                      const d1 = parseInt(jodi[0]!);
                      const d2 = parseInt(jodi[1]!);
                      const s1 = `${week.key}_${di}_L`;
                      const s2 = `${week.key}_${di}_R`;
                      leftDigits  = panelDigits(d1, s1);
                      rightDigits = panelDigits(d2, s2);
                    }

                    /* Red digits only when jodi is a double (same red as jodi) */
                    const digitColor = isDouble ? C.red : '#000';

                    return (
                      <td key={di} style={{ border: `1px solid ${C.red}`, padding: '4px 2px', textAlign: 'center', minWidth: '95px', height: '68px', verticalAlign: 'middle' }}>
                        {jodi !== null && leftDigits && rightDigits ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                            {/* Left 3 digits — stacked */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '11px', fontWeight: 'bold', color: digitColor, lineHeight: 1.25, marginRight: '3px' }}>
                              {leftDigits.map((d, k) => <span key={k}>{d}</span>)}
                            </div>

                            {/* Center jodi */}
                            <div style={{ fontWeight: 'bold', fontSize: '24px', fontStyle: 'italic', color: jodiColor, minWidth: '34px', textAlign: 'center' }}>
                              {jodi}
                            </div>

                            {/* Right 3 digits — stacked */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '11px', fontWeight: 'bold', color: digitColor, lineHeight: 1.25, marginLeft: '3px' }}>
                              {rightDigits.map((d, k) => <span key={k}>{d}</span>)}
                            </div>
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
