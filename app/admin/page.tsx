'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type CellInput = {
  topDigits: [string, string, string];
  main: string;
  bottomDigits: [string, string, string];
  isRed: boolean;
};

type RowInput = {
  startDate: string;
  endDate: string;
  cells: CellInput[];
};

function emptyCell(): CellInput {
  return { topDigits: ['0', '0', '0'], main: '00', bottomDigits: ['0', '0', '0'], isRed: false };
}

function emptyRow(): RowInput {
  return {
    startDate: '',
    endDate: '',
    cells: Array.from({ length: 7 }, () => emptyCell()),
  };
}

function normalizeDigit(d: string): string {
  const v = d.trim();
  if (v === '*') return '*';
  if (v === '**') return '**';
  if (/^\d$/.test(v)) return v;
  if (/^\d\d$/.test(v)) return v;
  return v;
}

function parseCellToken(token: string): CellInput {
  const raw = token.trim();
  const isRed = raw.toLowerCase().startsWith('r:') || raw.toLowerCase().startsWith('red:');
  const t = isRed ? raw.split(':').slice(1).join(':').trim() : raw;

  const parts = t.split('-');
  if (parts.length !== 3) {
    throw new Error(`Invalid cell token: ${token}`);
  }

  const top = parts[0].trim();
  const main = parts[1].trim();
  const bottom = parts[2].trim();

  if (top.length !== 3 || bottom.length !== 3) {
    throw new Error(`top/bottom must be 3 chars in token: ${token}`);
  }

  return {
    topDigits: [normalizeDigit(top[0]!), normalizeDigit(top[1]!), normalizeDigit(top[2]!)],
    main: normalizeDigit(main),
    bottomDigits: [normalizeDigit(bottom[0]!), normalizeDigit(bottom[1]!), normalizeDigit(bottom[2]!)],
    isRed,
  };
}

function formatExample(): string {
  return [
    '07/09/2025,13/09/2025,123-45-678,111-85-999,222-47-333,r:444-77-555,666-10-777,888-86-000,999-07-444',
    '14/09/2025,20/09/2025,012-19-987,345-01-678,678-36-543,r:111-88-222,333-79-444,555-41-666,r:777-50-888',
  ].join('\n');
}

function expandedCsvHeader(): string {
  const cols: string[] = ['startDate', 'endDate'];
  for (let i = 1; i <= 7; i++) {
    cols.push(`c${i}_top`, `c${i}_main`, `c${i}_bottom`, `c${i}_red`);
  }
  return cols.join(',');
}

function expandedCsvExample(): string {
  return [
    expandedCsvHeader(),
    [
      '07/09/2025', '13/09/2025',
      '123', '45', '678', '0',
      '111', '85', '999', '0',
      '222', '47', '333', '0',
      '444', '77', '555', '1',
      '666', '10', '777', '0',
      '888', '86', '000', '0',
      '999', '07', '444', '0',
    ].join(','),
  ].join('\n');
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function parseBulkText(text: string): RowInput[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  const isExpandedHeader = lines[0]?.toLowerCase() === expandedCsvHeader().toLowerCase();
  const effectiveLines = isExpandedHeader ? lines.slice(1) : lines;

  const rows: RowInput[] = [];

  for (const line of effectiveLines) {
    const parts = line.split(',').map((p) => p.trim());
    if (parts.length === 2 + 7) {
      const startDate = parts[0]!;
      const endDate = parts[1]!;
      const cellTokens = parts.slice(2);
      const cells = cellTokens.map((tok) => parseCellToken(tok));
      rows.push({ startDate, endDate, cells });
      continue;
    }

    if (parts.length === 2 + 7 * 4) {
      const startDate = parts[0]!;
      const endDate = parts[1]!;
      const rest = parts.slice(2);

      const cells: CellInput[] = [];
      for (let i = 0; i < 7; i++) {
        const top = rest[i * 4 + 0]?.trim() ?? '';
        const main = rest[i * 4 + 1]?.trim() ?? '';
        const bottom = rest[i * 4 + 2]?.trim() ?? '';
        const redRaw = rest[i * 4 + 3]?.trim() ?? '0';

        if (top.length !== 3 || bottom.length !== 3) {
          throw new Error('In expanded CSV, cX_top and cX_bottom must be 3 characters each');
        }

        const isRed = redRaw === '1' || redRaw.toLowerCase() === 'true' || redRaw.toLowerCase() === 'yes';

        cells.push({
          topDigits: [normalizeDigit(top[0]!), normalizeDigit(top[1]!), normalizeDigit(top[2]!)],
          main: normalizeDigit(main),
          bottomDigits: [
            normalizeDigit(bottom[0]!),
            normalizeDigit(bottom[1]!),
            normalizeDigit(bottom[2]!),
          ],
          isRed,
        });
      }

      rows.push({ startDate, endDate, cells });
      continue;
    }

    throw new Error(
      'Bulk format not recognized. Use compact: startDate,endDate,cell1..cell7 OR expanded CSV with header and c1_top,c1_main,c1_bottom,c1_red..c7_red.'
    );
  }

  return rows;
}

/* ── Login Gate ── */
function LoginGate({ onAuth }: { onAuth: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function doLogin() {
    if (!password.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        sessionStorage.setItem('admin_authed', '1');
        onAuth();
      } else {
        setError('Wrong password. Try again.');
        setPassword('');
      }
    } catch {
      setError('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-8 space-y-5 w-80">
        <h1 className="text-xl font-bold text-center text-yellow-400">Admin Login</h1>

        <label className="space-y-1 block">
          <div className="text-sm text-zinc-400">Username</div>
          <input
            className="w-full rounded bg-black border border-zinc-700 p-2 text-zinc-400 cursor-not-allowed"
            value="admin"
            readOnly
          />
        </label>

        <label className="space-y-1 block">
          <div className="text-sm text-zinc-400">Password</div>
          <input
            type="password"
            className="w-full rounded bg-black border border-zinc-700 p-2 focus:outline-none focus:border-yellow-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') void doLogin(); }}
            placeholder="Enter password"
            autoFocus
          />
        </label>

        {error && <div className="text-red-400 text-sm">{error}</div>}

        <button
          disabled={loading || !password.trim()}
          onClick={() => void doLogin()}
          className="w-full px-4 py-2 rounded bg-yellow-400 text-black font-bold disabled:opacity-50 hover:bg-yellow-300 transition-colors"
        >
          {loading ? 'Logging in…' : 'Login'}
        </button>
      </div>
    </div>
  );
}

/* ── Main Admin Panel ── */
export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [row, setRow] = useState<RowInput>(() => emptyRow());
  const [bulkText, setBulkText] = useState<string>(() => formatExample());
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [gameTime, setGameTime] = useState('12:00 PM - 02:00 PM');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const gameId = 'LAXMI_DAY';

  /* Check session on mount */
  useEffect(() => {
    if (sessionStorage.getItem('admin_authed') === '1') {
      setAuthed(true);
    }
  }, []);

  /* Load current game time from settings */
  useEffect(() => {
    if (!authed) return;
    fetch('/api/laxmi-day/settings')
      .then((r) => r.json())
      .then((d: { time?: string }) => { if (d.time) setGameTime(d.time); })
      .catch(() => {});
  }, [authed]);

  const payloadPreview = useMemo(() => {
    try {
      const rows = parseBulkText(bulkText);
      return JSON.stringify({ rows }, null, 2);
    } catch {
      return '';
    }
  }, [bulkText]);

  async function saveTime() {
    setBusy(true);
    setMessage('');
    try {
      const res = await fetch('/api/laxmi-day/settings', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ time: gameTime }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      setMessage('Game time saved successfully');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Failed to save time');
    } finally {
      setBusy(false);
    }
  }

  async function submitSingle() {
    setBusy(true);
    setMessage('');
    try {
      const res = await fetch('/api/chart-rows', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...row, gameId }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setMessage('Saved');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setBusy(false);
    }
  }

  async function seedLaxmiDay() {
    if (!confirm('This will insert all 180 weeks of historical LAXMI DAY data into MongoDB. Continue?')) return;
    setBusy(true);
    setMessage('Seeding LAXMI DAY data...');
    try {
      const res = await fetch('/api/laxmi-day/seed', { method: 'POST' });
      const data = (await res.json()) as { ok?: boolean; total?: number; upserted?: number; error?: string };
      if (!res.ok) throw new Error(data.error || 'Seed failed');
      setMessage(`Seed complete: ${data.total} rows total, ${data.upserted} inserted/updated`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Seed failed');
    } finally {
      setBusy(false);
    }
  }

  async function onPickCsvFile(file: File | null) {
    if (!file) return;
    setMessage('');
    try {
      const text = await file.text();
      setBulkText(text);
      setMessage(`Loaded file: ${file.name}`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Failed to read file');
    }
  }

  async function submitBulk() {
    setBusy(true);
    setMessage('');
    try {
      const rows = parseBulkText(bulkText);
      const res = await fetch('/api/chart-rows/bulk', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ gameId, rows }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setMessage('Bulk upload complete');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setBusy(false);
    }
  }

  if (!authed) {
    return <LoginGate onAuth={() => setAuthed(true)} />;
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Panel — LAXMI DAY</h1>
          <button
            onClick={() => { sessionStorage.removeItem('admin_authed'); setAuthed(false); }}
            className="px-3 py-1 rounded bg-zinc-700 text-sm font-medium hover:bg-zinc-600"
          >
            Logout
          </button>
        </div>

        {/* Game Settings */}
        <div className="bg-zinc-900 border border-zinc-700 rounded p-4 space-y-3">
          <h2 className="text-lg font-semibold">Game Settings</h2>
          <label className="space-y-1 block">
            <div className="text-sm text-zinc-300">LAXMI DAY Time <span className="text-zinc-500">(displayed on home page below the result)</span></div>
            <input
              className="w-full max-w-sm rounded bg-black border border-zinc-700 p-2 focus:outline-none focus:border-yellow-400"
              value={gameTime}
              onChange={(e) => setGameTime(e.target.value)}
              placeholder="12:00 PM - 02:00 PM"
            />
          </label>
          <button
            disabled={busy}
            onClick={() => void saveTime()}
            className="px-4 py-2 rounded bg-yellow-400 text-black font-bold disabled:opacity-50"
          >
            Save Time
          </button>
        </div>

        {/* Seed historical data */}
        <div className="bg-zinc-900 border border-yellow-500 rounded p-4 space-y-2">
          <h2 className="text-lg font-semibold text-yellow-400">Seed Historical Data</h2>
          <p className="text-sm text-zinc-300">One-time action: inserts all 180 weeks of LAXMI DAY history (Jan 2023 – Jun 2026) into MongoDB.</p>
          <button
            disabled={busy}
            onClick={() => void seedLaxmiDay()}
            className="px-4 py-2 rounded bg-yellow-400 text-black font-bold disabled:opacity-50"
          >
            Seed LAXMI DAY Data (180 weeks)
          </button>
        </div>

        <div className="bg-zinc-900 border border-zinc-700 rounded p-4 space-y-4">
          <h2 className="text-lg font-semibold">Single Row Entry</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="space-y-1">
              <div className="text-sm">Start Date (dd/mm/yyyy or yyyy-mm-dd)</div>
              <input
                className="w-full rounded bg-black border border-zinc-700 p-2"
                value={row.startDate}
                onChange={(e) => setRow((r) => ({ ...r, startDate: e.target.value }))}
                placeholder="07/09/2025"
              />
            </label>
            <label className="space-y-1">
              <div className="text-sm">End Date (dd/mm/yyyy or yyyy-mm-dd)</div>
              <input
                className="w-full rounded bg-black border border-zinc-700 p-2"
                value={row.endDate}
                onChange={(e) => setRow((r) => ({ ...r, endDate: e.target.value }))}
                placeholder="13/09/2025"
              />
            </label>
          </div>

          <div className="space-y-2">
            <div className="text-sm">7 Cells</div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {row.cells.map((c, idx) => (
                <div key={idx} className="border border-zinc-700 rounded p-3 space-y-2">
                  <div className="font-semibold">Cell {idx + 1}</div>
                  <div className="grid grid-cols-3 gap-2">
                    <label className="space-y-1">
                      <div className="text-xs">Top (3 chars)</div>
                      <input
                        className="w-full rounded bg-black border border-zinc-700 p-2"
                        value={c.topDigits.join('')}
                        onChange={(e) => {
                          const v = e.target.value.padEnd(3, '0').slice(0, 3);
                          setRow((r) => {
                            const next = [...r.cells];
                            next[idx] = { ...next[idx]!, topDigits: [v[0]!, v[1]!, v[2]!] };
                            return { ...r, cells: next };
                          });
                        }}
                        placeholder="123"
                      />
                    </label>
                    <label className="space-y-1">
                      <div className="text-xs">Main</div>
                      <input
                        className="w-full rounded bg-black border border-zinc-700 p-2"
                        value={c.main}
                        onChange={(e) => {
                          const v = e.target.value;
                          setRow((r) => {
                            const next = [...r.cells];
                            next[idx] = { ...next[idx]!, main: v };
                            return { ...r, cells: next };
                          });
                        }}
                        placeholder="45 or **"
                      />
                    </label>
                    <label className="space-y-1">
                      <div className="text-xs">Bottom (3 chars)</div>
                      <input
                        className="w-full rounded bg-black border border-zinc-700 p-2"
                        value={c.bottomDigits.join('')}
                        onChange={(e) => {
                          const v = e.target.value.padEnd(3, '0').slice(0, 3);
                          setRow((r) => {
                            const next = [...r.cells];
                            next[idx] = { ...next[idx]!, bottomDigits: [v[0]!, v[1]!, v[2]!] };
                            return { ...r, cells: next };
                          });
                        }}
                        placeholder="678"
                      />
                    </label>
                  </div>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={c.isRed}
                      onChange={(e) => {
                        setRow((r) => {
                          const next = [...r.cells];
                          next[idx] = { ...next[idx]!, isRed: e.target.checked };
                          return { ...r, cells: next };
                        });
                      }}
                    />
                    Red main
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              disabled={busy}
              onClick={() => void submitSingle()}
              className="px-4 py-2 rounded bg-yellow-400 text-black font-bold disabled:opacity-50"
            >
              Save Single Row
            </button>
            <button
              disabled={busy}
              onClick={() => setRow(emptyRow())}
              className="px-4 py-2 rounded bg-zinc-700 text-white font-bold disabled:opacity-50"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-700 rounded p-4 space-y-4">
          <h2 className="text-lg font-semibold">Bulk Upload</h2>
          <div className="text-sm text-zinc-300 space-y-2">
            <div>Paste one line per row (CSV). You can use either format.</div>
            <div className="text-zinc-200 font-semibold">Format A (compact)</div>
            <div className="text-zinc-200">startDate,endDate,cell1,cell2,cell3,cell4,cell5,cell6,cell7</div>
            <div className="text-zinc-200">cell token: 123-45-678 or r:123-45-678 (red)</div>
            <div className="text-zinc-200 font-semibold">Format B (expanded columns)</div>
            <div className="text-zinc-200">Header supported. Each cell uses: top (3 chars), main, bottom (3 chars), red (0/1)</div>
          </div>

          <details className="text-sm">
            <summary className="cursor-pointer text-zinc-200">Show CSV templates</summary>
            <div className="mt-3 space-y-3">
              <div>
                <div className="text-zinc-200 font-semibold">Template A example</div>
                <pre className="mt-2 whitespace-pre-wrap break-words bg-black border border-zinc-700 rounded p-2 text-zinc-200">
                  {formatExample()}
                </pre>
              </div>
              <div>
                <div className="text-zinc-200 font-semibold">Template B example</div>
                <pre className="mt-2 whitespace-pre-wrap break-words bg-black border border-zinc-700 rounded p-2 text-zinc-200">
                  {expandedCsvExample()}
                </pre>
              </div>
            </div>
          </details>

          <textarea
            className="w-full h-48 rounded bg-black border border-zinc-700 p-2 font-mono text-sm"
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
          />

          <div className="flex flex-wrap gap-3">
            <button
              disabled={busy}
              onClick={() => void submitBulk()}
              className="px-4 py-2 rounded bg-yellow-400 text-black font-bold disabled:opacity-50"
            >
              Upload Bulk
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                void onPickCsvFile(f);
                e.target.value = '';
              }}
            />
            <button
              disabled={busy}
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded bg-zinc-700 text-white font-bold disabled:opacity-50"
            >
              Choose CSV File
            </button>
            <button
              disabled={busy}
              onClick={() => downloadTextFile('chart-upload-compact.csv', formatExample())}
              className="px-4 py-2 rounded bg-zinc-700 text-white font-bold disabled:opacity-50"
            >
              Download Compact CSV
            </button>
            <button
              disabled={busy}
              onClick={() => downloadTextFile('chart-upload-expanded.csv', expandedCsvExample())}
              className="px-4 py-2 rounded bg-zinc-700 text-white font-bold disabled:opacity-50"
            >
              Download Expanded CSV
            </button>
            <button
              disabled={busy}
              onClick={() => setBulkText(formatExample())}
              className="px-4 py-2 rounded bg-zinc-700 text-white font-bold disabled:opacity-50"
            >
              Reset Example
            </button>
          </div>

          {payloadPreview ? (
            <details className="text-sm">
              <summary className="cursor-pointer text-zinc-200">Preview JSON payload</summary>
              <pre className="mt-2 whitespace-pre-wrap break-words bg-black border border-zinc-700 rounded p-2 text-zinc-200">
                {payloadPreview}
              </pre>
            </details>
          ) : null}
        </div>

        {message ? <div className="text-sm text-yellow-300 p-3 bg-zinc-900 rounded border border-zinc-700">{message}</div> : null}
      </div>
    </div>
  );
}
