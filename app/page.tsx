'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';

/* ── types ── */
type SattaGame = {
  id: string;
  name: string;
  time: string;
  today_result: { number: string | null; date: string } | null;
  yesterday_result: { number: string | null; date: string } | null;
};

type LaxmiLatest = {
  status: string;
  data?: SattaGame;
};


/* ── colour palette ── */
const C = {
  peach:   '#FFCBA4',
  altRow:  '#FFD5A8',
  red:     '#FF0000',
  pink:    '#FF1493',
  navy:    '#00008B',
  purple:  '#CC00CC',
  btn:     '#4B3FA0',
  darkRed: '#8B0000',
  yellow:  '#FFFF00',
  white:   '#FFFFFF',
};

const sec: React.CSSProperties = {
  backgroundColor: C.peach,
  border: `2px solid ${C.red}`,
  margin: '3px 4px',
};

/* ── helpers ── */
function fmtResult(n: string | number | null | undefined): string {
  if (n === null || n === undefined) return '***';
  return String(n).padStart(2, '0');
}

function getResult(game: { today_result?: { number: string | null } | null; yesterday_result?: { number: string | null } | null }): string {
  const today = game.today_result?.number;
  if (today !== null && today !== undefined) return fmtResult(today);
  const yest = game.yesterday_result?.number;
  if (yest !== null && yest !== undefined) return fmtResult(yest);
  return '***';
}

function hasToday(game: { today_result?: { number: string | null } | null }): boolean {
  return game.today_result?.number !== null && game.today_result?.number !== undefined;
}

/* ── shared button components ── */
function JodiBtn({ gameId }: { gameId: string }) {
  return (
    <Link href={`/jodi/${gameId}`}>
      <button style={{ backgroundColor: C.btn, color: C.white, border: 'none', borderRadius: '8px', padding: '5px 12px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>
        Jodi
      </button>
    </Link>
  );
}

function PanelBtn({ gameId }: { gameId: string }) {
  return (
    <Link href={`/panel/${gameId}`}>
      <button style={{ backgroundColor: C.btn, color: C.white, border: 'none', borderRadius: '8px', padding: '5px 12px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>
        Panel
      </button>
    </Link>
  );
}

/* ══════════════════════════════════════════════════════════════ */
export default function SattaMatkaPanalChart() {
  const topRef   = useRef<HTMLDivElement>(null);

  /* real satta API data */
  const [games, setGames] = useState<SattaGame[]>([]);
  const [gamesLoading, setGamesLoading] = useState(true);

  /* LAXMI DAY + LAXMI NIGHT live results from MongoDB */
  const [laxmiGame,      setLaxmiGame]      = useState<SattaGame | null>(null);
  const [laxmiNightGame, setLaxmiNightGame] = useState<SattaGame | null>(null);


  /* fetch real satta games — polls every 60s */
  useEffect(() => {
    let alive = true;
    const fetch$ = async () => {
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 10000);
      try {
        const res  = await fetch('/api/satta/live', { cache: 'no-store', signal: controller.signal });
        const json = (await res.json()) as { status: string; data?: SattaGame[] };
        if (json.status === 'success' && json.data) {
          if (alive) { setGames(json.data); setGamesLoading(false); }
        }
      } catch { /* keep previous data on timeout */ }
      finally { window.clearTimeout(timer); }
    };
    fetch$();
    const id = window.setInterval(fetch$, 60_000);
    return () => { alive = false; window.clearInterval(id); };
  }, []);

  /* fetch LAXMI DAY latest result — polls every 60s */
  useEffect(() => {
    let alive = true;
    const fetch$ = async () => {
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 8000);
      try {
        const res  = await fetch('/api/laxmi-day/latest', { cache: 'no-store', signal: controller.signal });
        const json = (await res.json()) as LaxmiLatest;
        if (json.status === 'success' && json.data && alive) setLaxmiGame(json.data);
      } catch { /* keep previous on error */ }
      finally { window.clearTimeout(timer); }
    };
    fetch$();
    const id = window.setInterval(fetch$, 60_000);
    return () => { alive = false; window.clearInterval(id); };
  }, []);

  /* fetch LAXMI NIGHT latest result — polls every 60s */
  useEffect(() => {
    let alive = true;
    const fetch$ = async () => {
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 8000);
      try {
        const res  = await fetch('/api/laxmi-night/latest', { cache: 'no-store', signal: controller.signal });
        const json = (await res.json()) as LaxmiLatest;
        if (json.status === 'success' && json.data && alive) setLaxmiNightGame(json.data);
      } catch { /* keep previous on error */ }
      finally { window.clearTimeout(timer); }
    };
    fetch$();
    const id = window.setInterval(fetch$, 60_000);
    return () => { alive = false; window.clearInterval(id); };
  }, []);

  /* pick headline: prefer a game with today's result, else use any game with yesterday */
  const headlineGame = games.find((g) => hasToday(g)) ?? games.find((g) => g.yesterday_result?.number !== null && g.yesterday_result?.number !== undefined);
  const headlineResult = headlineGame ? getResult(headlineGame) : '***';

  const scrollToTop = () => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  /* ── render ── */
  return (
    <div ref={topRef} style={{ backgroundColor: C.peach, minHeight: '100vh', fontFamily: 'Arial, sans-serif', paddingBottom: '52px' }}>

      {/* ── HEADER ── */}
      <div style={{ backgroundColor: C.white, border: `3px solid ${C.red}`, margin: '4px', padding: '12px', textAlign: 'center' }}>
        <span style={{ fontFamily: 'cursive', color: C.pink, fontSize: '42px', fontWeight: 'bold', fontStyle: 'italic' }}>Dp</span>
        <span style={{ fontSize: '30px', fontWeight: 'bold', color: '#111', letterSpacing: '2px' }}>BOSSSS.BOSTON</span>
      </div>

      {/* ── WELCOME ── */}
      <div style={{ ...sec, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 15px' }}>
        <div style={{ width: '72px', height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>🪔</div>
        <div style={{ flex: 1, textAlign: 'right', fontStyle: 'italic', fontSize: '15px' }}>
          !! Welcome to dpboss international !! Satta Matka Fast Result
        </div>
      </div>

      {/* ── DESCRIPTION ── */}
      <div style={{ ...sec, padding: '10px 15px', textAlign: 'center' }}>
        <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '6px' }}>Satta Matka Dpboss.net Kalyan Matka Result</div>
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

      {/* ── NOTICE ── */}
      <div style={{ ...sec, padding: '10px 15px', textAlign: 'center' }}>
        <div style={{ color: C.pink, fontWeight: 'bold', fontSize: '15px' }}>☆ NOTICE ☆</div>
        <div style={{ fontSize: '13px', marginTop: '5px' }}>
          📱 Number: <span style={{ color: C.pink, fontWeight: 'bold' }}>88781750XX</span> ✖ Not DPBOSS / यह DPBOSS का नंबर नहीं है 🕐 Fake claim alert / झूठा दावा।
        </div>
      </div>

      {/* ── LIVE RESULT BAR ── */}
      <div style={{ backgroundColor: C.pink, padding: '10px', margin: '3px 4px', textAlign: 'center' }}>
        <span style={{ color: C.white, fontWeight: 'bold', fontSize: '22px', fontStyle: 'italic' }}>🌴 LIVE RESULT 🌴</span>
      </div>

      {/* ── HEADLINE LIVE RESULT ── */}
      <div style={{ ...sec, padding: '14px', textAlign: 'center' }}>
        <div style={{ fontStyle: 'italic', fontSize: '15px', marginBottom: '6px' }}>Sabse Tezz Live Result Yahi Milega</div>
        {headlineGame ? (
          <>
            <div style={{ color: C.navy, fontWeight: 'bold', fontSize: '20px', fontStyle: 'italic' }}>{headlineGame.name}</div>
            <div style={{ color: C.purple, fontWeight: 'bold', fontSize: '26px', fontStyle: 'italic', margin: '4px 0' }}>{headlineResult}</div>
            <div style={{ fontSize: '13px', color: '#555', fontStyle: 'italic' }}>{headlineGame.time}</div>
          </>
        ) : (
          <div style={{ color: C.navy, fontWeight: 'bold', fontSize: '20px', fontStyle: 'italic' }}>Loading...</div>
        )}
        <button
          onClick={() => window.location.reload()}
          style={{ backgroundColor: C.btn, color: C.white, border: 'none', borderRadius: '8px', padding: '5px 16px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', margin: '8px 4px 0' }}
        >
          Refresh
        </button>
        <div style={{ fontStyle: 'italic', fontSize: '15px', fontWeight: 'bold', marginTop: '10px' }}>सबसे तेज सबसे सही</div>
      </div>

      {/* ── HINDI PROMO ── */}
      <div style={{ ...sec, padding: '14px', textAlign: 'center' }}>
        <div style={{ fontSize: '14px', lineHeight: 1.9, marginBottom: '10px' }}>
          कल्याण मॉर्निंग,श्रीदेवी मॉर्निंग,टाइम बाज़ार मॉर्निंग,रतन खत्री,मैन बाज़ार डे,मैन फटाफट,बॉम्बे राजश्री डे,नाइट टाइम बाज़ार,बॉम्बे राजश्री स्टारलाइन
        </div>
        <div style={{ fontSize: '14px', lineHeight: 1.9, marginBottom: '14px' }}>
          के ऑफलाइन व्यापार,बुकी लोग खाईवाल कटिंग के लिए मैसेज करो डायरेक्ट ऑफिस
        </div>
        <a href="https://wa.me/919425894347" target="_blank" rel="noopener noreferrer">
          <button style={{ backgroundColor: C.pink, color: C.white, border: 'none', borderRadius: '20px', padding: '10px 26px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}>
            📱 JoinOnWhatsapp
          </button>
        </a>
      </div>

      {/* ── NOTICE 2 ── */}
      <div style={{ margin: '3px 4px', border: `2px solid ${C.red}` }}>
        <div style={{ backgroundColor: C.darkRed, padding: '8px', textAlign: 'center', color: '#FFD700', fontWeight: 'bold', fontSize: '16px' }}>☆ NOTICE ☆</div>
        <div style={{ backgroundColor: C.peach, padding: '12px', textAlign: 'center', fontSize: '14px', lineHeight: 1.9 }}>
          <div>अपना बाज़ार dpbossss.boston वेबसाइट में डलवाने</div>
          <div>के लिए आज ही हमें ईमेल करे</div>
          <div style={{ color: '#0000CC', marginTop: '6px', fontWeight: 'bold' }}>Email : laxmimatkabazar@gmail.com</div>
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

      {/* ── MARKET ROWS (LAXMI DAY + API games) ── */}
      <div style={{ margin: '0 4px', border: `2px solid ${C.red}` }}>

        {/* LAXMI DAY row — always shown first */}
        {laxmiGame && (() => {
          const result = getResult(laxmiGame);
          const isHighlight = hasToday(laxmiGame);
          return (
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: isHighlight ? C.yellow : C.peach, borderBottom: `1px solid ${C.red}`, padding: '10px 8px' }}>
              <div style={{ width: '68px', flexShrink: 0 }}>
                <Link href="/jodi/laxmi-day">
                  <button style={{ backgroundColor: C.btn, color: C.white, border: 'none', borderRadius: '8px', padding: '5px 12px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>Jodi</button>
                </Link>
              </div>
              <div style={{ flex: 1, textAlign: 'center', padding: '0 6px' }}>
                <div style={{ color: C.navy, fontWeight: 'bold', fontSize: '17px', fontStyle: 'italic' }}>{laxmiGame.name}</div>
                <div style={{ color: C.purple, fontWeight: 'bold', fontSize: '20px', fontStyle: 'italic' }}>{result}</div>
                <div style={{ fontSize: '12px', color: '#444', fontStyle: 'italic' }}>{laxmiGame.time}</div>
              </div>
              <div style={{ width: '68px', textAlign: 'right', flexShrink: 0 }}>
                <Link href="/panel/laxmi-day">
                  <button style={{ backgroundColor: C.btn, color: C.white, border: 'none', borderRadius: '8px', padding: '5px 12px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>Panel</button>
                </Link>
              </div>
            </div>
          );
        })()}

        {/* LAXMI NIGHT row */}
        {laxmiNightGame && (() => {
          const result = getResult(laxmiNightGame);
          const isHighlight = hasToday(laxmiNightGame);
          return (
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: isHighlight ? C.yellow : C.peach, borderBottom: `1px solid ${C.red}`, padding: '10px 8px' }}>
              <div style={{ width: '68px', flexShrink: 0 }}>
                <Link href="/jodi/laxmi-night">
                  <button style={{ backgroundColor: C.btn, color: C.white, border: 'none', borderRadius: '8px', padding: '5px 12px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>Jodi</button>
                </Link>
              </div>
              <div style={{ flex: 1, textAlign: 'center', padding: '0 6px' }}>
                <div style={{ color: C.navy, fontWeight: 'bold', fontSize: '17px', fontStyle: 'italic' }}>{laxmiNightGame.name}</div>
                <div style={{ color: C.purple, fontWeight: 'bold', fontSize: '20px', fontStyle: 'italic' }}>{result}</div>
                <div style={{ fontSize: '12px', color: '#444', fontStyle: 'italic' }}>{laxmiNightGame.time}</div>
              </div>
              <div style={{ width: '68px', textAlign: 'right', flexShrink: 0 }}>
                <Link href="/panel/laxmi-night">
                  <button style={{ backgroundColor: C.btn, color: C.white, border: 'none', borderRadius: '8px', padding: '5px 12px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>Panel</button>
                </Link>
              </div>
            </div>
          );
        })()}

        {gamesLoading ? (
          <div style={{ backgroundColor: C.peach, padding: '20px', textAlign: 'center', color: C.navy, fontWeight: 'bold', fontSize: '16px' }}>
            Loading live results...
          </div>
        ) : (
          games.map((game, i) => {
            const result = getResult(game);
            const isHighlight = hasToday(game);
            return (
              <div
                key={game.id}
                style={{
                  display: 'flex', alignItems: 'center',
                  backgroundColor: isHighlight ? C.yellow : C.peach,
                  borderBottom: i < games.length - 1 ? `1px solid ${C.red}` : 'none',
                  padding: '10px 8px',
                }}
              >
                <div style={{ width: '68px', flexShrink: 0 }}>
                  <JodiBtn gameId={game.id} />
                </div>
                <div style={{ flex: 1, textAlign: 'center', padding: '0 6px' }}>
                  <div style={{ color: C.navy, fontWeight: 'bold', fontSize: '17px', fontStyle: 'italic' }}>{game.name}</div>
                  <div style={{ color: C.purple, fontWeight: 'bold', fontSize: '20px', fontStyle: 'italic' }}>{result}</div>
                  <div style={{ fontSize: '12px', color: '#444', fontStyle: 'italic' }}>{game.time}</div>
                </div>
                <div style={{ width: '68px', textAlign: 'right', flexShrink: 0 }}>
                  <PanelBtn gameId={game.id} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── FOOTER ── */}
      <div style={{ ...sec, padding: '14px', textAlign: 'center', margin: '4px' }}>
        <div style={{ fontStyle: 'italic', fontSize: '12px', lineHeight: 1.8, marginBottom: '12px', color: '#333' }}>
          KALYAN MATKA | MATKA RESULT | KALYAN MATKA TIPS | SATTA MATKA | MATKA.COM | MATKA PANA JODI TODAY | BATTA SATKA | MATKA PATTI JODI NUMBER | MATKA RESULTS | MATKA CHART | MATKA JODI | SATTA COM | FULL RATE GAME | MATKA GAME | MATKA WAPKA | ALL MATKA RESULT LIVE ONLINE | MATKA RESULT | KALYAN MATKA RESULT | DPBOSS MATKA 143 | MAIN MATKA
        </div>
        <div style={{ fontWeight: 'bold', color: C.navy, fontSize: '18px' }}>SattaMatkaDpboss.co</div>
        <div style={{ fontSize: '13px', marginTop: '4px', color: '#333' }}>ALL RIGHTS RESERVED (2012-2026)</div>
        <div style={{ fontSize: '13px', color: '#333' }}>SITE OWNER: <strong>PRO. BIG BOSS SIR</strong></div>
        <div style={{ color: C.navy, fontWeight: 'bold', fontSize: '17px', margin: '6px 0 2px' }}>📞 9425894347</div>
        <div style={{ color: C.navy, fontWeight: 'bold', fontSize: '17px', margin: '2px 0' }}>📞 9604221222</div>
        <div style={{ color: C.navy, fontWeight: 'bold', fontSize: '17px', margin: '2px 0' }}>📞 8446225281</div>
        <div style={{ color: '#555', fontSize: '12px', marginTop: '6px' }}>https://sattamatkadpboss.co</div>
      </div>

      {/* ── STICKY BOTTOM BAR ── */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000 }}>
        <button onClick={scrollToTop} style={{ backgroundColor: C.btn, color: C.white, border: 'none', borderRadius: '6px', padding: '6px 16px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
          VIP Zone
        </button>
        <a href="https://wa.me/919425894347" target="_blank" rel="noopener noreferrer">
          <button style={{ backgroundColor: '#25D366', color: C.white, border: 'none', borderRadius: '6px', padding: '6px 16px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
            📱 WhatsApp
          </button>
        </a>
        <button onClick={() => window.location.reload()} style={{ backgroundColor: C.navy, color: C.white, border: 'none', borderRadius: '6px', padding: '6px 16px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
          REFRESH
        </button>
      </div>
    </div>
  );
}
