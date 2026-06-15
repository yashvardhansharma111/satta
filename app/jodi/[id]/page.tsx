'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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

type LiveGame = {
  id: string; name: string; time: string;
  today_result: { number: string | null; date: string } | null;
  yesterday_result: { number: string | null; date: string } | null;
};

type WeekRow = { key: string; days: (string | null)[] };

function isDouble(v: string | null | undefined): boolean {
  if (!v) return false;
  const s = String(v).padStart(2, '0');
  return s[0] === s[1];
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
    const key = monday.toISOString().slice(0, 10);
    if (!map.has(key)) map.set(key, { key, days: Array(7).fill(null) });
    map.get(key)!.days[monIdx] = val;
  }
  return [...map.values()];
}

export default function JodiChartPage() {
  const params = useParams();
  const gameId = ((params?.id as string) ?? '').toUpperCase();

  const [gameName, setGameName] = useState('');
  const [weeks,    setWeeks]    = useState<WeekRow[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    if (!gameId) return;
    let alive = true;

    /* resolve display name */
    fetch('/api/satta/live', { cache: 'no-store' })
      .then((r) => r.json())
      .then((j: { status: string; data?: LiveGame[] }) => {
        const g = j.data?.find((x) => x.id === gameId);
        if (g && alive) setGameName(g.name);
      })
      .catch(() => {});

    /* load full history */
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

  const dayNames = ['Mo', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const displayName = gameName || gameId;

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
        <Link href={`/panel/${(params?.id as string) ?? ''}`}>
          <button style={{ backgroundColor: C.indigo, color: C.white, border: 'none', borderRadius: '8px', padding: '7px 14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
            Panel Chart
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
          <table style={{ borderCollapse: 'collapse', margin: '0 auto', border: `2px solid ${C.red}` }}>
            <thead>
              <tr>
                <th colSpan={7} style={{ backgroundColor: C.indigo, color: C.white, fontWeight: 'bold', fontSize: '20px', padding: '12px 20px', textAlign: 'center', letterSpacing: '1px' }}>
                  {displayName} JODI CHART
                </th>
              </tr>
              <tr>
                {dayNames.map((d) => (
                  <th key={d} style={{ backgroundColor: C.yellow, color: C.navy, fontWeight: 'bold', fontSize: '16px', padding: '10px 0', textAlign: 'center', border: `1px solid ${C.red}`, minWidth: '90px', width: '90px' }}>
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, wi) => (
                <tr key={week.key ?? wi}>
                  {week.days.map((result, di) => {
                    const jodi = result !== null && result !== undefined ? String(result).padStart(2, '0') : null;
                    return (
                      <td key={di} style={{ border: `1px solid ${C.red}`, padding: '8px 4px', textAlign: 'center', minWidth: '90px', height: '52px', backgroundColor: C.peach }}>
                        {jodi ? (
                          <span style={{ fontWeight: 'bold', fontSize: '28px', color: isDouble(result) ? C.red : C.black }}>
                            {jodi}
                          </span>
                        ) : null}
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
        <div style={{ color: C.navy, fontWeight: 'bold', fontSize: '14px', margin: '2px 0' }}>📞 8446225281</div>
      </div>
    </div>
  );
}
