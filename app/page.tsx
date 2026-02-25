'use client';

import { useRef, useMemo, useEffect, useState } from 'react';

type RowData = {
  dateRange: {
    start: string;
    end: string;
  };
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

    const formatDate = (d: Date) =>
      `${String(d.getDate()).padStart(2, '0')}/${String(
        d.getMonth() + 1
      ).padStart(2, '0')}/${d.getFullYear()}`;

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

    rows.push({
      dateRange: {
        start: formatDate(weekStart),
        end: formatDate(weekEnd),
      },
      jodiNumbers,
    });
  }

  return rows;
}

export default function SattaMatkaPanalChart() {
  const chartRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<RowData[]>([]);

  const formatDate = useMemo(
    () =>
      (d: Date) =>
        `${String(d.getUTCDate()).padStart(2, '0')}/${String(
          d.getUTCMonth() + 1
        ).padStart(2, '0')}/${d.getUTCFullYear()}`,
    []
  );

  const formatMain = useMemo(
    () =>
      (value: string) => {
        const v = value.trim();
        if (/^\d$/.test(v)) return `0${v}`;
        if (/^\d{2}$/.test(v)) return v;
        return v;
      },
    []
  );

  useEffect(() => {
    let alive = true;

    const fetchRows = async () => {
      try {
        const res = await fetch('/api/chart-rows?limit=2000&sort=desc', {
          cache: 'no-store',
        });
        const json = (await res.json()) as { rows?: ApiRow[]; error?: string };
        if (!res.ok) throw new Error(json.error || 'Failed to load');
        const rows = (json.rows ?? []).map((r) => {
          const start = new Date(r.startDate);
          const end = new Date(r.endDate);

          return {
            dateRange: {
              start: formatDate(start),
              end: formatDate(end),
            },
            jodiNumbers: (r.cells ?? []).slice(0, 7).map((c) => ({
              topDigits: c.topDigits,
              main: c.main,
              bottomDigits: c.bottomDigits,
              isRed: c.isRed,
            })),
          } satisfies RowData;
        });

        if (alive) setData(rows);
      } catch {
        if (alive) setData(generateSampleData() as unknown as RowData[]);
      }
    };

    fetchRows();
    const id = window.setInterval(fetchRows, 5000);

    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [formatDate]);

  const scrollToBottom = () => {
    if (chartRef.current) {
      chartRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  const scrollToTop = () => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div ref={topRef} className="min-h-screen bg-black flex flex-col items-center">
      {/* Red line above header */}
      <div style={{
        width: '100%',
        height: '3px',
        backgroundColor: '#FF0000',
      }}></div>

      {/* Blue Header with title */}
      <div style={{
        width: '100%',
        backgroundColor: '#00008B',
        padding: '12px 0',
        textAlign: 'center',
      }}>
        <h1 style={{
          color: '#FF0000',
          fontSize: '36px',
          fontWeight: 'bold',
          fontStyle: 'italic',
          margin: 0,
          fontFamily: 'serif',
          letterSpacing: '2px',
        }}>
          KBC BOMBAY PENAL CHART
        </h1>
      </div>

      {/* Double red lines */}
      <div style={{
        width: '100%',
        height: '2px',
        backgroundColor: '#FF0000',
      }}></div>
      <div style={{
        width: '100%',
        height: '2px',
        backgroundColor: '#FF0000',
        marginTop: '2px',
      }}></div>

      {/* Blue Subtitle section */}
      <div style={{
        width: '100%',
        backgroundColor: '#00008B',
        padding: '8px 0',
        textAlign: 'center',
      }}>
        <h2 style={{
          color: '#FFFFFF',
          fontSize: '20px',
          fontWeight: 'bold',
          fontStyle: 'italic',
          margin: '0 0 5px 0',
          fontFamily: 'serif',
        }}>
          Kbc Bombay Penal Patti Chart
        </h2>
        <p style={{
          color: '#FFFFFF',
          fontSize: '11px',
          margin: 0,
          fontFamily: 'serif',
        }}>
          kbc bombay penal chart, kbc bombay jodi patti record chart, kbc bombay satta penal chart com, bombay kbc day satta penal with chart, panel chart for kbc bombay matka, kbc bombay satta bazar panel chart
        </p>
      </div>

      {/* Red line below subtitle */}
      <div style={{
        width: '100%',
        height: '3px',
        backgroundColor: '#FF0000',
      }}></div>

      {/* Yellow Info Box */}
      <div style={{
        width: '100%',
        backgroundColor: '#FFFF00',
        padding: '15px 0',
        textAlign: 'center',
      }}>
        <h3 style={{
          color: '#0000FF',
          fontSize: '28px',
          fontWeight: 'bold',
          fontStyle: 'italic',
          margin: '0 0 3px 0',
          fontFamily: 'serif',
        }}>
          KBC BOMBAY
        </h3>
        <p style={{
          color: '#000000',
          fontSize: '24px',
          fontWeight: 'bold',
          margin: '0 0 8px 0',
          fontFamily: 'serif',
        }}>
          466-62-660
        </p>
        <button style={{
          backgroundColor: '#D4AF37',
          border: '2px solid #000000',
          borderRadius: '25px',
          padding: '6px 20px',
          fontSize: '16px',
          fontWeight: 'bold',
          fontStyle: 'italic',
          color: '#8B0000',
          cursor: 'pointer',
          fontFamily: 'serif',
        }}>
          Refresh Result
        </button>
      </div>

      {/* Go to Bottom Button */}
      <div style={{
        width: '100%',
        backgroundColor: '#000000',
        padding: '8px 0',
        textAlign: 'center',
      }}>
        <button
          onClick={scrollToBottom}
          style={{
            backgroundColor: '#FFFF00',
            border: '2px solid #000000',
            borderRadius: '8px',
            padding: '6px 20px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#FF0000',
            cursor: 'pointer',
            fontFamily: 'serif',
          }}
        >
          Go to Bottom
        </button>
      </div>

      {/* Chart Table */}
      <div style={{ paddingTop: '20px', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div
          ref={chartRef}
          style={{
            width: '45%',
            border: '3px solid #7b2cbf',
            backgroundColor: '#e6e6e6',
            maxHeight: '75vh',
            overflowY: 'auto',
          }}
        >
          {data.map((row, rowIndex) => (
            <div
              key={rowIndex}
              style={{
                display: 'grid',
                gridTemplateColumns: '90px repeat(7, 1fr)',
                borderBottom:
                  rowIndex < data.length - 1
                    ? '1px solid rgba(0,0,0,0.35)'
                    : 'none',
              }}
            >
              {/* Date */}
              <div
                style={{
                  padding: '3px',
                  textAlign: 'center',
                  fontFamily: '"Times New Roman", serif',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: '#000',
                }}
              >
                <div>{row.dateRange.start}</div>
                <div style={{ fontSize: '9px' }}>to</div>
                <div>{row.dateRange.end}</div>
              </div>

              {row.jodiNumbers.map((jodi, index) => (
                <div
                  key={index}
                  style={{
                    position: 'relative',
                    height: '60px',
                    fontFamily: '"Times New Roman", serif',
                  }}
                >
                  {/* LEFT DIGITS */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '6px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      lineHeight: '1',
                      color: '#000',
                      opacity: 1,
                    }}
                  >
                    {jodi.topDigits.map((d, i) => (
                      <span key={i}>{d}</span>
                    ))}
                  </div>

                  {/* MAIN NUMBER */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '28px',
                      fontWeight: 700,
                      fontStyle: 'italic',
                      color: jodi.isRed ? '#c00000' : '#000',
                    }}
                  >
                    {formatMain(jodi.main)}
                  </div>

                  {/* RIGHT DIGITS */}
                  <div
                    style={{
                      position: 'absolute',
                      right: '6px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      lineHeight: '1',
                      color: '#000',
                      opacity: 1,
                    }}
                  >
                    {jodi.bottomDigits.map((d, i) => (
                      <span key={i}>{d}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Go to Top Button */}
      <div style={{
        width: '100%',
        backgroundColor: '#000000',
        padding: '8px 0',
        marginTop: '20px',
        textAlign: 'center',
      }}>
        <button
          onClick={scrollToTop}
          style={{
            backgroundColor: '#FFFF00',
            border: '2px solid #000000',
            borderRadius: '8px',
            padding: '6px 20px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#FF0000',
            cursor: 'pointer',
            fontFamily: 'serif',
          }}
        >
          Go to Top
        </button>
      </div>

      {/* Yellow Section */}
      <div style={{
        width: '100%',
        backgroundColor: '#FFFF00',
        border: '3px solid #000000',
        borderBottom: 'none',
        padding: '15px 0',
        textAlign: 'center',
      }}>
        <h3 style={{
          color: '#0000FF',
          fontSize: '28px',
          fontWeight: 'bold',
          fontStyle: 'italic',
          margin: '0 0 3px 0',
          fontFamily: 'serif',
        }}>
          KBC BOMBAY
        </h3>
        <p style={{
          color: '#000000',
          fontSize: '24px',
          fontWeight: 'bold',
          margin: '0 0 8px 0',
          fontFamily: 'serif',
        }}>
          466-62-660
        </p>
        <button style={{
          backgroundColor: '#D4AF37',
          border: '2px solid #000000',
          borderRadius: '25px',
          padding: '6px 20px',
          fontSize: '16px',
          fontWeight: 'bold',
          fontStyle: 'italic',
          color: '#8B0000',
          cursor: 'pointer',
          fontFamily: 'serif',
        }}>
          Refresh Result
        </button>
      </div>

      {/* Pink Section - Online Matka Play */}
      <div style={{
        width: '100%',
        backgroundColor: '#FF1493',
        border: '3px solid #000000',
        borderTop: 'none',
        borderBottom: 'none',
        padding: '15px 0',
        textAlign: 'center',
      }}>
        <p style={{
          color: '#FFFFFF',
          fontSize: '18px',
          fontWeight: 'bold',
          margin: '0 0 5px 0',
          fontFamily: 'serif',
        }}>
          अब सभी मटका बाजार खेलो ऑनलाइन ऐप पर
        </p>
        <p style={{
          color: '#FFFFFF',
          fontSize: '18px',
          fontWeight: 'bold',
          margin: '0 0 10px 0',
          fontFamily: 'serif',
        }}>
          रोज खेलो रोज कमाओ अभी डाउनलोड करो
        </p>
        <button style={{
          backgroundColor: '#FFD700',
          border: '2px solid #000000',
          borderRadius: '25px',
          padding: '10px 25px',
          fontSize: '18px',
          fontWeight: 'bold',
          fontStyle: 'italic',
          color: '#000000',
          cursor: 'pointer',
          fontFamily: 'serif',
          marginBottom: '8px',
        }}>
          Online Matka Play<br/>(Direct)
        </button>
        <p style={{
          color: '#FFFF00',
          fontSize: '16px',
          fontWeight: 'bold',
          fontStyle: 'italic',
          margin: '5px 0 0 0',
          fontFamily: 'serif',
        }}>
          ~ Kalyan Official App ~
        </p>
        <p style={{
          color: '#FFFF00',
          fontSize: '14px',
          fontWeight: 'bold',
          margin: '2px 0 0 0',
          fontFamily: 'serif',
        }}>
          Super Fast deposit and withdrawal
        </p>
      </div>

      {/* White Section - Booking Info */}
      <div style={{
        width: '100%',
        backgroundColor: '#FFFFFF',
        border: '3px solid #FF1493',
        padding: '15px 20px',
        textAlign: 'center',
      }}>
        <h4 style={{
          color: '#FF0000',
          fontSize: '20px',
          fontWeight: 'bold',
          margin: '0 0 10px 0',
          fontFamily: 'serif',
        }}>
          [ फ्री बुकिंग चालू | बुकिंग चालू फ्री ]
        </h4>
        <p style={{
          color: '#000000',
          fontSize: '16px',
          fontWeight: 'bold',
          margin: '0 0 10px 0',
          fontFamily: 'serif',
          fontStyle: 'italic',
        }}>
          कल्याण बाजार बम्बर धमाका अचूक जोड़ी पर कमाओ लाखों 100% फिक्स। जोड़ी। पत्ती सिर्फ एक दिन में पूरा लॉस कवर होगा मनी बैक गारंटी एडवांस चार्ज 2500/- मात्र
        </p>
        <p style={{
          color: '#0000FF',
          fontSize: '18px',
          fontWeight: 'bold',
          margin: '5px 0',
          fontFamily: 'serif',
        }}>
          कॉल : 07726928384
        </p>
        <p style={{
          color: '#0000FF',
          fontSize: '18px',
          fontWeight: 'bold',
          margin: '5px 0',
          fontFamily: 'serif',
        }}>
          कॉल : 07726928384
        </p>
        <hr style={{ border: '1px solid #ccc', margin: '15px 0' }} />
        <p style={{
          color: '#000000',
          fontSize: '16px',
          margin: '10px 0',
          fontFamily: 'serif',
        }}>
          <span style={{ color: '#FF0000', fontWeight: 'bold', fontStyle: 'italic' }}>Note :-</span>{' '}
          <span style={{ fontWeight: 'bold', fontStyle: 'italic' }}>Don't Call For Trail Help</span>
        </p>
      </div>

      {/* Yellow Footer Navigation */}
      <div style={{
        width: '100%',
        backgroundColor: '#FFFF00',
        border: '3px solid #000000',
        borderTop: 'none',
        borderBottom: 'none',
        padding: '10px 0',
        textAlign: 'center',
      }}>
        <p style={{
          color: '#000000',
          fontSize: '14px',
          fontWeight: 'bold',
          margin: 0,
          fontFamily: 'serif',
        }}>
          <span style={{ color: '#FF0000', fontStyle: 'italic' }}>Back</span>
          {' '}|<span style={{ color: '#008000' }}>Home</span>| <span style={{ color: '#FF0000' }}>Matka Guessing</span> |
          <span style={{ color: '#FF8C00' }}>Matka Chart</span> |<span style={{ color: '#0000FF' }}>Matka Play</span> |
          <span style={{ color: '#8B4513' }}>Tara Matka</span> |<span style={{ color: '#0000FF' }}>Indian Matka</span> |
          <span style={{ color: '#FF8C00' }}>Fix Matka</span> |<span style={{ color: '#FF0000' }}>Sitemap</span>
        </p>
      </div>

      {/* Yellow Footer Info */}
      <div style={{
        width: '100%',
        backgroundColor: '#FFFF00',
        border: '3px solid #000000',
        borderTop: 'none',
        padding: '15px 0 20px 0',
        textAlign: 'center',
      }}>
        <h4 style={{
          color: '#FF0000',
          fontSize: '20px',
          fontWeight: 'bold',
          fontStyle: 'italic',
          margin: '0 0 5px 0',
          fontFamily: 'serif',
        }}>
          SattaMatkaDpboss.co
        </h4>
        <p style={{
          color: '#000000',
          fontSize: '14px',
          fontWeight: 'bold',
          margin: '3px 0',
          fontFamily: 'serif',
        }}>
          ALL RIGHTS RESERVED (2012-2024)
        </p>
        <p style={{
          color: '#000000',
          fontSize: '14px',
          fontWeight: 'bold',
          margin: '3px 0',
          fontFamily: 'serif',
        }}>
          SITE OWNER:-
        </p>
        <p style={{
          color: '#000000',
          fontSize: '14px',
          fontWeight: 'bold',
          textDecoration: 'underline',
          margin: '3px 0',
          fontFamily: 'serif',
        }}>
          PRO. BIG BOSS SIR
        </p>
        <p style={{
          color: '#0000FF',
          fontSize: '22px',
          fontWeight: 'bold',
          margin: '8px 0',
          fontFamily: 'serif',
        }}>
          07726928384
        </p>
        <p style={{
          color: '#000000',
          fontSize: '14px',
          fontWeight: 'bold',
          textDecoration: 'underline',
          margin: '5px 0',
          fontFamily: 'serif',
        }}>
          https://sattamatkadpboss.co
        </p>
      </div>
    </div>
  );
}