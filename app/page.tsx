'use client';

import { useRef, useMemo, useEffect, useState } from 'react';

type RowData = {
  dateRange: { start: string; end: string };
  jodiNumbers: Array<{
    topDigits: [string, string, string];
    main: string;
    bottomDigits: [string, string, string];
    isRed: boolean;
  }>;
};

type ApiRow = {
  startDate: string;
  endDate: string;
  cells: Array<{
    topDigits: [string, string, string];
    main: string;
    bottomDigits: [string, string, string];
    isRed: boolean;
  }>;
};

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateSampleData(): RowData[] {
  const rows: RowData[] = [];
  const startDate = new Date('2019-03-18');
  let seed = 42;

  for (let i = 0; i < 10; i++) {
    const weekStart = new Date(startDate);
    weekStart.setDate(weekStart.getDate() + i * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const fmt = (d: Date) =>
      `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

    const jodiNumbers = Array.from({ length: 7 }, () => {
      const topD = [
        String(Math.floor(seededRandom(seed++) * 10)),
        String(Math.floor(seededRandom(seed++) * 10)),
        String(Math.floor(seededRandom(seed++) * 10)),
      ] as [string, string, string];
      const main = String(Math.floor(seededRandom(seed++) * 100)).padStart(2, '0');
      const bottomD = [
        String(Math.floor(seededRandom(seed++) * 10)),
        String(Math.floor(seededRandom(seed++) * 10)),
        String(Math.floor(seededRandom(seed++) * 10)),
      ] as [string, string, string];
      const isRed = seededRandom(seed++) > 0.6;
      return { topDigits: topD, main, bottomDigits: bottomD, isRed };
    });

    rows.push({ dateRange: { start: fmt(weekStart), end: fmt(weekEnd) }, jodiNumbers });
  }
  return rows;
}

const C = {
  peach: '#FFCBA4',
  red: '#FF0000',
  pink: '#FF1493',
  navy: '#00008B',
  purple: '#CC00CC',
  btn: '#4B3FA0',
  darkRed: '#8B0000',
  yellow: '#FFFF00',
  white: '#FFFFFF',
  altRow: '#FFD5A8',
};

const MARKETS = [
  { name: 'KALYAN MORNING', open: '11:40 AM', close: '12:40 PM' },
  { name: 'MILAN MORNING', open: '10:30 AM', close: '11:30 AM' },
  { name: 'SRIDEVI', open: '11:30 AM', close: '12:30 PM' },
  { name: 'MADHUR MORNING', open: '11:30 AM', close: '12:30 PM' },
  { name: 'TIME BAZAR', open: '01:00 PM', close: '02:00 PM' },
  { name: 'MADHUR DAY', open: '01:30 PM', close: '02:30 PM' },
  { name: 'MILAN DAY', open: '01:30 PM', close: '02:30 PM' },
  { name: 'KALYAN', open: '03:45 PM', close: '05:45 PM' },
  { name: 'SRIDEVI NIGHT', open: '07:00 PM', close: '08:00 PM' },
  { name: 'MADHUR NIGHT', open: '08:30 PM', close: '10:30 PM' },
  { name: 'RAJDHANI NIGHT', open: '09:30 PM', close: '11:30 PM' },
  { name: 'MILAN NIGHT', open: '09:00 PM', close: '11:00 PM' },
  { name: 'MAIN BAZAR', open: '09:30 PM', close: '12:05 AM' },
];

export default function SattaMatkaPanalChart() {
  const chartRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<RowData[]>([]);

  const formatDate = useMemo(
    () => (d: Date) =>
      `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`,
    []
  );

  const formatMain = useMemo(
    () => (v: string) => {
      const s = v.trim();
      if (/^\d$/.test(s)) return `0${s}`;
      if (/^\d{2}$/.test(s)) return s;
      return s;
    },
    []
  );

  useEffect(() => {
    let alive = true;
    const fetchRows = async () => {
      try {
        const res = await fetch('/api/chart-rows?limit=2000&sort=desc', { cache: 'no-store' });
        const json = (await res.json()) as { rows?: ApiRow[]; error?: string };
        if (!res.ok) throw new Error(json.error || 'Failed');
        const rows = (json.rows ?? []).map((r) => ({
          dateRange: { start: formatDate(new Date(r.startDate)), end: formatDate(new Date(r.endDate)) },
          jodiNumbers: (r.cells ?? []).slice(0, 7).map((c) => ({
            topDigits: c.topDigits,
            main: c.main,
            bottomDigits: c.bottomDigits,
            isRed: c.isRed,
          })),
        })) satisfies RowData[];
        if (alive) setData(rows);
      } catch {
        if (alive) setData(generateSampleData());
      }
    };
    fetchRows();
    const id = window.setInterval(fetchRows, 5000);
    return () => { alive = false; window.clearInterval(id); };
  }, [formatDate]);

  const latestCell = data[0]?.jodiNumbers[0];
  const liveResult = latestCell
    ? `${latestCell.topDigits.join('')}-${formatMain(latestCell.main)}-${latestCell.bottomDigits.join('')}`
    : '***-**-***';

  const scrollToBottom = () => chartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  const scrollToTop = () => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const sec: React.CSSProperties = {
    backgroundColor: C.peach,
    border: `2px solid ${C.red}`,
    margin: '3px 4px',
  };

  return (
    <div ref={topRef} style={{ backgroundColor: C.peach, minHeight: '100vh', fontFamily: 'Arial, sans-serif', paddingBottom: '50px' }}>

      {/* ── HEADER ── */}
      <div style={{ backgroundColor: C.white, border: `3px solid ${C.red}`, margin: '4px', padding: '12px', textAlign: 'center' }}>
        <span style={{ fontFamily: 'cursive', color: C.pink, fontSize: '42px', fontWeight: 'bold', fontStyle: 'italic' }}>Dp</span>
        <span style={{ fontSize: '30px', fontWeight: 'bold', color: '#111', letterSpacing: '2px' }}>BOSSSS.BOSTON</span>
      </div>

      {/* ── WELCOME ── */}
      <div style={{ ...sec, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 15px' }}>
        <div style={{ width: '80px', height: '60px', backgroundColor: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#555', flexShrink: 0 }}>
          🪔
        </div>
        <div style={{ flex: 1, textAlign: 'right', fontStyle: 'italic', fontSize: '15px', color: '#111' }}>
          !! Welcome to dpboss international !! Satta Matka Fast Result
        </div>
      </div>

      {/* ── DESCRIPTION ── */}
      <div style={{ ...sec, padding: '10px 15px', textAlign: 'center' }}>
        <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '6px' }}>
          Satta Matka Dpboss.net Kalyan Matka Result
        </div>
        <div style={{ fontStyle: 'italic', fontSize: '13px', lineHeight: 1.7 }}>
          Dpboss boston is the No. 1 Matka Sites welcomes you full-heartedly. Here below you can find the perfect guess by the top guesser along with the Fast Matka Result too. Aaj Ka Satta Kalyan Fix Single Jodi free update here you find top Matka Market of India Kalyan Main Milan Rajdhani* *kalyan Matka Tips *fast Matka Result *kalyan Main Rajdhani Matka Chart *Matka Guessing by DPBOSS By App Best Matka Site By DPBOSS 32
        </div>
      </div>

      {/* ── TODAY LUCKY NUMBER ── */}
      <div style={{ ...sec }}>
        <div style={{ backgroundColor: C.pink, padding: '10px', textAlign: 'center', color: C.white, fontWeight: 'bold', fontSize: '22px', fontStyle: 'italic' }}>
          Today Lucky Number
        </div>
        <div style={{ display: 'flex', backgroundColor: C.peach }}>
          <div style={{ flex: 1, padding: '14px', textAlign: 'center', borderRight: `1px solid ${C.red}` }}>
            <div style={{ color: C.navy, fontWeight: 'bold', fontStyle: 'italic', fontSize: '15px' }}>Golden Ank</div>
            <div style={{ color: C.navy, fontWeight: 'bold', fontStyle: 'italic', fontSize: '26px' }}>1-6-0-5</div>
          </div>
          <div style={{ flex: 1, padding: '14px', textAlign: 'center' }}>
            <div style={{ color: C.navy, fontWeight: 'bold', fontStyle: 'italic', fontSize: '15px' }}>Final Ank</div>
            <div style={{ color: C.navy, fontStyle: 'italic', fontSize: '14px', marginTop: '4px' }}>TIME BAZAR - 2</div>
            <div style={{ color: C.navy, fontStyle: 'italic', fontSize: '14px' }}>MILAN DAY - 0</div>
          </div>
        </div>
      </div>

      {/* ── NOTICE 1 ── */}
      <div style={{ ...sec, padding: '10px 15px', textAlign: 'center' }}>
        <div style={{ color: C.pink, fontWeight: 'bold', fontSize: '15px' }}>☆ NOTICE ☆</div>
        <div style={{ fontSize: '13px', marginTop: '5px' }}>
          📱 Number:{' '}
          <span style={{ color: C.pink, fontWeight: 'bold' }}>88781750XX</span>{' '}
          ✖ Not DPBOSS / यह DPBOSS का नंबर नहीं है 🕐 Fake claim alert / झूठा दावा।
        </div>
      </div>

      {/* ── LIVE RESULT BAR ── */}
      <div style={{ backgroundColor: C.pink, padding: '10px', margin: '3px 4px', textAlign: 'center' }}>
        <span style={{ color: C.white, fontWeight: 'bold', fontSize: '22px', fontStyle: 'italic' }}>🌴 LIVE RESULT 🌴</span>
      </div>

      {/* ── MAIN LIVE RESULT ── */}
      <div style={{ ...sec, padding: '14px', textAlign: 'center' }}>
        <div style={{ fontStyle: 'italic', fontSize: '15px', marginBottom: '6px' }}>Sabse Tezz Live Result Yahi Milega</div>
        <div style={{ color: C.navy, fontWeight: 'bold', fontSize: '20px', fontStyle: 'italic' }}>KBC BOMBAY</div>
        <div style={{ color: C.purple, fontWeight: 'bold', fontSize: '22px', fontStyle: 'italic', margin: '4px 0' }}>{liveResult}</div>
        <button
          onClick={scrollToBottom}
          style={{ backgroundColor: C.btn, color: C.white, border: 'none', borderRadius: '8px', padding: '5px 16px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', margin: '6px' }}
        >
          Refresh
        </button>
        <div style={{ fontStyle: 'italic', fontSize: '15px', fontWeight: 'bold', marginTop: '6px' }}>सबसे तेज सबसे सही</div>
      </div>

      {/* ── HINDI PROMO ── */}
      <div style={{ ...sec, padding: '14px', textAlign: 'center' }}>
        <div style={{ fontSize: '14px', lineHeight: 1.9, marginBottom: '10px' }}>
          कल्याण मॉर्निंग,श्रीदेवी मॉर्निंग,टाइम बाज़ार मॉर्निंग,रतन खत्री,मैन बाज़ार डे,मैन फटाफट,बॉम्बे राजश्री डे,नाइट टाइम बाज़ार,बॉम्बे राजश्री स्टारलाइन
        </div>
        <div style={{ fontSize: '14px', lineHeight: 1.9, marginBottom: '14px' }}>
          के ऑफलाइन व्यापार,बुकी लोग खाईवाल कटिंग के लिए मैसेज करो डायरेक्ट ऑफिस
        </div>
        <button style={{ backgroundColor: C.pink, color: C.white, border: 'none', borderRadius: '20px', padding: '10px 26px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}>
          📱 JoinOnWhatsapp
        </button>
      </div>

      {/* ── GUESSING APP ── */}
      <div style={{ backgroundColor: C.darkRed, margin: '3px 4px', padding: '16px', textAlign: 'center' }}>
        <div style={{ color: C.white, fontSize: '15px', fontStyle: 'italic', marginBottom: '4px' }}>🌐 Matka Guessing का असली मंच यहाँ है</div>
        <div style={{ color: C.white, fontSize: '15px', fontStyle: 'italic', marginBottom: '4px' }}>🥇 Guess करो और बनो No.1</div>
        <div style={{ color: C.white, fontSize: '15px', fontStyle: 'italic', marginBottom: '12px' }}>📥 Download DPBoss Forum App Today</div>
        <button style={{ backgroundColor: C.white, color: C.darkRed, border: 'none', borderRadius: '20px', padding: '8px 24px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>
          📥 Download App
        </button>
      </div>

      {/* ── NOTICE 2 ── */}
      <div style={{ margin: '3px 4px', border: `2px solid ${C.red}` }}>
        <div style={{ backgroundColor: C.darkRed, padding: '8px', textAlign: 'center', color: '#FFD700', fontWeight: 'bold', fontSize: '16px' }}>
          ☆ NOTICE ☆
        </div>
        <div style={{ backgroundColor: C.peach, padding: '12px', textAlign: 'center', fontSize: '14px', lineHeight: 1.9 }}>
          <div>अपना बाज़ार dpbossss.boston वेबसाइट में डलवाने</div>
          <div>के लिए आज ही हमें ईमेल करे</div>
          <div style={{ color: '#0000CC', marginTop: '6px', fontWeight: 'bold' }}>Email : support@dpboss.net</div>
          <div style={{ marginTop: '4px' }}>शर्तें लागु</div>
        </div>
      </div>

      {/* ── SEO KEYWORDS ── */}
      <div style={{ ...sec, padding: '10px 15px', textAlign: 'center' }}>
        <div style={{ fontStyle: 'italic', fontSize: '13px', lineHeight: 1.8 }}>
          KALYAN MATKA | MATKA RESULT | KALYAN MATKA TIPS | SATTA MATKA | MATKA.COM | MATKA PANA JODI TODAY | BATTA SATKA | MATKA PATTI JODI NUMBER | MATKA RESULTS | MATKA CHART | MATKA JODI | SATTA COM | FULL RATE GAME | MATKA GAME | MATKA WAPKA | ALL MATKA RESULT LIVE ONLINE | MATKA RESULT | KALYAN MATKA RESULT | DPBOSS MATKA 143 | MAIN MATKA
        </div>
      </div>

      {/* ── WORLD FASTEST BAR ── */}
      <div style={{ backgroundColor: C.pink, padding: '10px', margin: '3px 4px', textAlign: 'center' }}>
        <span style={{ color: C.white, fontWeight: 'bold', fontSize: '18px', fontStyle: 'italic' }}>
          WORLD ME SABSE FAST SATTA MATKA RESULT
        </span>
      </div>

      {/* ── KBC BOMBAY — yellow highlight row ── */}
      <div style={{ display: 'flex', alignItems: 'center', backgroundColor: C.yellow, borderBottom: `1px solid ${C.red}`, borderLeft: `2px solid ${C.red}`, borderRight: `2px solid ${C.red}`, margin: '0 4px', padding: '12px 8px' }}>
        <div style={{ width: '70px' }}>
          <button
            onClick={scrollToBottom}
            style={{ backgroundColor: C.btn, color: C.white, border: 'none', borderRadius: '8px', padding: '5px 12px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Jodi
          </button>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ color: C.navy, fontWeight: 'bold', fontSize: '18px', fontStyle: 'italic' }}>KBC BOMBAY</div>
          <div style={{ color: C.purple, fontWeight: 'bold', fontSize: '16px', fontStyle: 'italic' }}>{liveResult}</div>
        </div>
        <div style={{ width: '70px', textAlign: 'right' }}>
          <button
            onClick={scrollToBottom}
            style={{ backgroundColor: C.btn, color: C.white, border: 'none', borderRadius: '8px', padding: '5px 12px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Panel
          </button>
        </div>
      </div>

      {/* ── OTHER MARKETS ── */}
      {MARKETS.map((mkt, i) => (
        <div
          key={i}
          style={{
            display: 'flex', alignItems: 'center',
            backgroundColor: C.peach,
            borderBottom: `1px solid ${C.red}`,
            borderLeft: `2px solid ${C.red}`,
            borderRight: `2px solid ${C.red}`,
            margin: '0 4px',
            padding: '10px 8px',
          }}
        >
          <div style={{ width: '70px' }}>
            <button style={{ backgroundColor: C.btn, color: C.white, border: 'none', borderRadius: '8px', padding: '5px 12px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>
              Jodi
            </button>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ color: C.navy, fontWeight: 'bold', fontSize: '18px', fontStyle: 'italic' }}>{mkt.name}</div>
            <div style={{ color: C.purple, fontWeight: 'bold', fontSize: '16px', fontStyle: 'italic' }}>***-**-***</div>
            <div style={{ fontSize: '13px', color: '#333', fontStyle: 'italic' }}>{mkt.open}&nbsp;&nbsp;&nbsp;{mkt.close}</div>
          </div>
          <div style={{ width: '70px', textAlign: 'right' }}>
            <button style={{ backgroundColor: C.btn, color: C.white, border: 'none', borderRadius: '8px', padding: '5px 12px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>
              Panel
            </button>
          </div>
        </div>
      ))}

      {/* ── PANEL CHART HEADER ── */}
      <div style={{ backgroundColor: C.pink, padding: '10px', margin: '8px 4px 0 4px', textAlign: 'center' }}>
        <span style={{ color: C.white, fontWeight: 'bold', fontSize: '18px', fontStyle: 'italic' }}>
          KBC BOMBAY PANEL CHART RECORD
        </span>
      </div>

      {/* ── PANEL CHART TABLE ── */}
      <div ref={chartRef} style={{ ...sec, padding: 0, overflowX: 'auto', margin: '0 4px 4px 4px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: '"Times New Roman", serif' }}>
          <tbody>
            {data.map((row, ri) => (
              <tr
                key={ri}
                style={{ borderBottom: `1px solid ${C.red}`, backgroundColor: ri % 2 === 0 ? C.peach : C.altRow }}
              >
                <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 'bold', fontSize: '11px', whiteSpace: 'nowrap', minWidth: '78px', borderRight: `1px solid ${C.red}`, verticalAlign: 'middle' }}>
                  <div>{row.dateRange.start}</div>
                  <div style={{ fontSize: '9px' }}>to</div>
                  <div>{row.dateRange.end}</div>
                </td>
                {row.jodiNumbers.map((jodi, ji) => (
                  <td
                    key={ji}
                    style={{ padding: '4px 2px', textAlign: 'center', borderRight: ji < 6 ? `1px solid ${C.red}` : 'none', minWidth: '58px', height: '54px', verticalAlign: 'middle' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '10px', fontWeight: 'bold', color: '#000', lineHeight: 1 }}>
                        {jodi.topDigits.map((d, k) => <span key={k}>{d}</span>)}
                      </div>
                      <div style={{ fontSize: '22px', fontWeight: 'bold', fontStyle: 'italic', color: jodi.isRed ? C.red : C.navy, minWidth: '28px', textAlign: 'center', margin: '0 2px' }}>
                        {formatMain(jodi.main)}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '10px', fontWeight: 'bold', color: '#000', lineHeight: 1 }}>
                        {jodi.bottomDigits.map((d, k) => <span key={k}>{d}</span>)}
                      </div>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ ...sec, padding: '14px', textAlign: 'center', margin: '4px' }}>
        <div style={{ fontStyle: 'italic', fontSize: '12px', lineHeight: 1.8, marginBottom: '12px', color: '#333' }}>
          KALYAN MATKA | MATKA RESULT | KALYAN MATKA TIPS | SATTA MATKA | MATKA.COM | MATKA PANA JODI TODAY | BATTA SATKA | MATKA PATTI JODI NUMBER | MATKA RESULTS | MATKA CHART | MATKA JODI | SATTA COM | FULL RATE GAME | MATKA GAME | MATKA WAPKA | ALL MATKA RESULT LIVE ONLINE | MATKA RESULT | KALYAN MATKA RESULT | DPBOSS MATKA 143 | MAIN MATKA
        </div>
        <div style={{ fontWeight: 'bold', color: C.navy, fontSize: '18px' }}>SattaMatkaDpboss.co</div>
        <div style={{ fontSize: '13px', marginTop: '4px', color: '#333' }}>ALL RIGHTS RESERVED (2012-2026)</div>
        <div style={{ fontSize: '13px', color: '#333' }}>SITE OWNER: <strong>PRO. BIG BOSS SIR</strong></div>
        <div style={{ color: C.navy, fontWeight: 'bold', fontSize: '18px', margin: '4px 0' }}>📞 9425894347</div>
        <div style={{ color: C.navy, fontWeight: 'bold', fontSize: '18px', margin: '4px 0' }}>📞 9604221222</div>
        <div style={{ color: C.navy, fontWeight: 'bold', fontSize: '18px', margin: '4px 0' }}>📞 8446225281</div>
        <div style={{ color: '#555', fontSize: '12px' }}>https://sattamatkadpboss.co</div>
      </div>

      {/* ── STICKY BOTTOM BAR ── */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000 }}>
        <button
          onClick={scrollToTop}
          style={{ backgroundColor: C.btn, color: C.white, border: 'none', borderRadius: '6px', padding: '6px 16px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
        >
          VIP Zone
        </button>
        <button
          onClick={() => { window.location.reload(); }}
          style={{ backgroundColor: C.navy, color: C.white, border: 'none', borderRadius: '6px', padding: '6px 16px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
        >
          REFRESH
        </button>
      </div>
    </div>
  );
}
