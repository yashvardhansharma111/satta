'use client';

import { useRef, useMemo } from 'react';

type RowData = {
  dateRange: {
    start: string;
    end: string;
  };
  jodiNumbers: Array<{
    topDigits: [number, number, number];
    main: number;
    bottomDigits: [number, number, number];
    isRed: boolean;
  }>;
};

// Seeded random number generator for deterministic output
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateSampleData(): RowData[] {
  const rows: RowData[] = [];
  const startDate = new Date('2019-03-18');
  let seed = 42; // Start with a fixed seed

  for (let i = 0; i < 10; i++) {
    const weekStart = new Date(startDate);
    weekStart.setDate(weekStart.getDate() + i * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const formatDate = (d: Date) =>
      `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

    const jodiNumbers = Array.from({ length: 7 }, () => {
      const topD = [
        Math.floor(seededRandom(seed++) * 10),
        Math.floor(seededRandom(seed++) * 10),
        Math.floor(seededRandom(seed++) * 10),
      ] as [number, number, number];
      const main = Math.floor(seededRandom(seed++) * 100);
      const bottomD = [
        Math.floor(seededRandom(seed++) * 10),
        Math.floor(seededRandom(seed++) * 10),
        Math.floor(seededRandom(seed++) * 10),
      ] as [number, number, number];
      const isRed = seededRandom(seed++) > 0.6;

      return {
        topDigits: topD,
        main,
        bottomDigits: bottomD,
        isRed,
      };
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
  const data = useMemo(() => generateSampleData(), []);

  const scrollToBottom = () => {
    if (chartRef.current) {
      chartRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-start py-8 px-4">
      {/* Go to Bottom Button */}
      <button
        onClick={scrollToBottom}
        className="mb-8 px-8 py-3 bg-yellow-300 text-red-600 font-bold text-lg rounded-lg shadow-md hover:shadow-lg transition-shadow"
        style={{ fontFamily: '"Old Standard TT", Georgia, serif' }}
      >
        Go to Bottom
      </button>

      {/* Chart Container */}
      <div
        ref={chartRef}
        className="w-full max-w-6xl"
        style={{
          border: '4px solid #7b2cbf',
          backgroundColor: '#f5f5f5',
          boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)',
          padding: '0',
          overflow: 'hidden',
        }}
      >
        {/* Chart Rows */}
        <div>
          {data.map((row, rowIndex) => (
            <div
              key={rowIndex}
              style={{
                display: 'grid',
                gridTemplateColumns: '120px repeat(7, 1fr)',
                borderBottom: rowIndex < data.length - 1 ? '1px solid rgba(0,0,0,0.2)' : 'none',
              }}
            >
              {/* Date Column */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px 6px',
                  fontFamily: '"Times New Roman", serif',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  color: '#000',
                }}
              >
                <div style={{ textAlign: 'center', lineHeight: '1.1' }}>{row.dateRange.start}</div>
                <div style={{ fontSize: '8px', margin: '1px 0' }}>to</div>
                <div style={{ textAlign: 'center', lineHeight: '1.1' }}>{row.dateRange.end}</div>
              </div>

              {/* Jodi Number Blocks */}
              {row.jodiNumbers.map((jodi, jodiIndex) => (
                  <div
                    key={jodiIndex}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px 6px',
                      fontFamily: '"Times New Roman", serif',
                      minWidth: 0,
                    }}
                  >
                  {/* Top tiny digits */}
                  <div
                    style={{
                      fontSize: '8px',
                      fontWeight: 'bold',
                      color: '#000',
                      letterSpacing: '1px',
                      lineHeight: '1',
                      margin: '0',
                      padding: '0',
                      textAlign: 'center',
                      marginBottom: '2px',
                    }}
                  >
                    {jodi.topDigits[0]} {jodi.topDigits[1]} {jodi.topDigits[2]}
                  </div>

                  {/* Main jodi number */}
                  <div
                    style={{
                      fontSize: '38px',
                      fontWeight: 700,
                      fontStyle: 'italic',
                      color: jodi.isRed ? '#c00000' : '#000',
                      lineHeight: '1',
                      textAlign: 'center',
                      letterSpacing: '-0.5px',
                    }}
                  >
                    {String(jodi.main).padStart(2, '0')}
                  </div>

                  {/* Bottom tiny digits */}
                  <div
                    style={{
                      fontSize: '8px',
                      fontWeight: 'bold',
                      color: '#000',
                      letterSpacing: '1px',
                      lineHeight: '1',
                      margin: '0',
                      padding: '0',
                      textAlign: 'center',
                      marginTop: '2px',
                    }}
                  >
                    {jodi.bottomDigits[0]} {jodi.bottomDigits[1]} {jodi.bottomDigits[2]}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom spacing */}
      <div className="mt-12" />
    </div>
  );
}
