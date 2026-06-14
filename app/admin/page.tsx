'use client';

import { useEffect, useRef, useState } from 'react';

/* ── Types ── */
type CellInput = {
  topDigits:    [string, string, string];
  main:         string;
  bottomDigits: [string, string, string];
  isRed:        boolean;
};

type RowInput = { startDate: string; endDate: string; cells: CellInput[] };
type Game = { id: 'LAXMI_DAY' | 'LAXMI_NIGHT'; label: string; slug: string; defaultTime: string; icon: string };

const GAMES: Game[] = [
  { id: 'LAXMI_DAY',   label: 'Laxmi Day',   slug: 'laxmi-day',   defaultTime: '11:15 AM - 2:15 PM', icon: '☀️' },
  { id: 'LAXMI_NIGHT', label: 'Laxmi Night',  slug: 'laxmi-night', defaultTime: '7:30 PM - 8:30 PM',  icon: '🌙' },
];

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/* ── Helpers ── */
function emptyCell(): CellInput {
  return { topDigits: ['*', '*', '*'], main: '**', bottomDigits: ['*', '*', '*'], isRed: false };
}
function emptyRow(): RowInput {
  return { startDate: '', endDate: '', cells: Array.from({ length: 7 }, emptyCell) };
}
function normalizeDigit(d: string): string {
  const v = d.trim();
  if (v === '' || v === '*') return '*';
  if (/^\d$/.test(v)) return v;
  if (/^\d\d$/.test(v)) return v;
  return v;
}
function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

function parseBulkLine(line: string): RowInput {
  const parts = line.split(',').map(p => p.trim());
  if (parts.length !== 9) throw new Error(`Expected 9 comma-separated values, got ${parts.length}: "${line}"`);
  const [startDate, endDate, ...cellTokens] = parts as [string, string, ...string[]];
  const cells = cellTokens.map((token) => {
    const raw   = token.trim();
    const isRed = raw.toLowerCase().startsWith('r:');
    const t     = isRed ? raw.slice(raw.indexOf(':') + 1).trim() : raw;
    if (!t.includes('-')) {
      const main = normalizeDigit(t);
      return { topDigits: ['*','*','*'] as [string,string,string], main, bottomDigits: ['*','*','*'] as [string,string,string], isRed };
    }
    const p = t.split('-');
    if (p.length !== 3) throw new Error(`Invalid panel token: ${token}`);
    const top    = (p[0] ?? '').trim();
    const main   = (p[1] ?? '').trim();
    const bottom = (p[2] ?? '').trim();
    if ((top.replace(/\*/g,'').length > 0 && top.length !== 3) || (bottom.replace(/\*/g,'').length > 0 && bottom.length !== 3)) {
      throw new Error(`top/bottom must be 3 chars: ${token}`);
    }
    const pad3 = (s: string): [string,string,string] => {
      const x = s.padEnd(3,'*');
      return [normalizeDigit(x[0]!), normalizeDigit(x[1]!), normalizeDigit(x[2]!)];
    };
    return { topDigits: pad3(top), main: normalizeDigit(main), bottomDigits: pad3(bottom), isRed };
  });
  return { startDate, endDate, cells };
}

function parseBulkText(text: string): RowInput[] {
  return text.split(/\r?\n/).map(l => l.trim()).filter(Boolean).map(parseBulkLine);
}

/* ── Toast ── */
type Toast = { id: number; msg: string; type: 'success' | 'error' | 'info' };
let _toastId = 0;

function ToastStack({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '360px' }}>
      {toasts.map(t => (
        <div key={t.id} onClick={() => onDismiss(t.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 16px', borderRadius: '12px', cursor: 'pointer',
            backdropFilter: 'blur(12px)',
            background: t.type === 'success' ? 'rgba(16,185,129,0.15)' : t.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)',
            border: `1px solid ${t.type === 'success' ? 'rgba(16,185,129,0.4)' : t.type === 'error' ? 'rgba(239,68,68,0.4)' : 'rgba(99,102,241,0.4)'}`,
            color: t.type === 'success' ? '#6ee7b7' : t.type === 'error' ? '#fca5a5' : '#a5b4fc',
            fontSize: '13px', fontWeight: 500, boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          }}>
          <span>{t.type === 'success' ? '✓' : t.type === 'error' ? '✗' : 'ℹ'}</span>
          <span style={{ flex: 1 }}>{t.msg}</span>
          <span style={{ opacity: 0.5, fontSize: '11px' }}>×</span>
        </div>
      ))}
    </div>
  );
}

/* ── Login Gate ── */
function LoginGate({ onAuth }: { onAuth: () => void }) {
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPwd,  setShowPwd]  = useState(false);

  async function doLogin() {
    if (!password.trim()) return;
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) { sessionStorage.setItem('admin_authed','1'); onAuth(); }
      else { setError('Wrong password. Try again.'); setPassword(''); }
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* Glow orbs */}
      <div style={{ position: 'fixed', top: '20%', left: '15%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '20%', right: '15%', width: 250, height: 250, borderRadius: '50%', background: 'rgba(245,158,11,0.1)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <div style={{
        background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px',
        padding: '40px 36px', width: '100%', maxWidth: '380px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '16px', margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', boxShadow: '0 8px 24px rgba(245,158,11,0.3)',
          }}>🔐</div>
          <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: 700, margin: 0 }}>Admin Portal</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginTop: '6px' }}>DpBoss Management System</p>
        </div>

        {/* Username */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '8px', textTransform: 'uppercase' }}>Username</label>
          <input readOnly value="admin"
            style={{
              width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
              padding: '11px 14px', color: 'rgba(255,255,255,0.3)', fontSize: '14px', outline: 'none',
            }} />
        </div>

        {/* Password */}
        <div style={{ marginBottom: '8px' }}>
          <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '8px', textTransform: 'uppercase' }}>Password</label>
          <div style={{ position: 'relative' }}>
            <input type={showPwd ? 'text' : 'password'} value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') void doLogin(); }}
              placeholder="Enter password" autoFocus
              style={{
                width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px',
                padding: '11px 42px 11px 14px', color: '#fff', fontSize: '14px', outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => { e.target.style.borderColor = 'rgba(245,158,11,0.6)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.15)'; }}
            />
            <button onClick={() => setShowPwd(s => !s)}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '14px', padding: '2px' }}>
              {showPwd ? '🙈' : '👁'}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', fontSize: '13px', marginBottom: '12px', marginTop: '8px' }}>
            {error}
          </div>
        )}

        <button disabled={loading || !password.trim()} onClick={() => void doLogin()}
          style={{
            width: '100%', marginTop: '20px', padding: '13px', borderRadius: '10px', border: 'none',
            background: loading || !password.trim() ? 'rgba(245,158,11,0.3)' : 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: loading || !password.trim() ? 'rgba(0,0,0,0.4)' : '#000',
            fontWeight: 700, fontSize: '15px', cursor: loading || !password.trim() ? 'not-allowed' : 'pointer',
            boxShadow: loading || !password.trim() ? 'none' : '0 4px 20px rgba(245,158,11,0.4)',
            transition: 'all 0.2s',
          }}>
          {loading ? 'Authenticating…' : 'Sign In'}
        </button>
      </div>
    </div>
  );
}

/* ── Cell Editor ── */
function CellEditor({ cell, idx, mode, onChange }: { cell: CellInput; idx: number; mode: 'panel' | 'jodi'; onChange: (c: CellInput) => void }) {
  const dayLabel = DAY_LABELS[idx] ?? `Day ${idx + 1}`;
  const isWeekend = idx === 5 || idx === 6;

  const digitInput = (val: string, onCh: (v: string) => void) => (
    <input value={val} placeholder="*"
      onChange={e => onCh(e.target.value.slice(-1) || '*')}
      style={{
        width: '32px', height: '32px', textAlign: 'center', borderRadius: '6px',
        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
        color: '#fff', fontSize: '14px', fontWeight: 600, outline: 'none',
      }}
      onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.7)'; e.target.style.background = 'rgba(99,102,241,0.1)'; }}
      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.06)'; }}
    />
  );

  return (
    <div style={{
      background: cell.isRed ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${cell.isRed ? 'rgba(239,68,68,0.3)' : isWeekend ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: '12px', padding: '12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{
          fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase',
          color: isWeekend ? '#a5b4fc' : 'rgba(255,255,255,0.5)',
        }}>{dayLabel}</span>
        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
          <input type="checkbox" checked={cell.isRed} onChange={e => onChange({ ...cell, isRed: e.target.checked })}
            style={{ accentColor: '#ef4444', width: '13px', height: '13px' }} />
          <span style={{ fontSize: '10px', color: cell.isRed ? '#f87171' : 'rgba(255,255,255,0.3)', fontWeight: 600 }}>RED</span>
        </label>
      </div>

      {mode === 'panel' ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {([0,1,2] as const).map(k => (
              <div key={k}>{digitInput(cell.topDigits[k], (v) => {
                const next: [string,string,string] = [...cell.topDigits];
                next[k] = v;
                onChange({ ...cell, topDigits: next });
              })}</div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <input value={cell.main} placeholder="**"
              onChange={e => onChange({ ...cell, main: e.target.value.slice(0,2) || '**' })}
              style={{
                width: '44px', height: '44px', textAlign: 'center', borderRadius: '8px',
                background: cell.isRed ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.08)',
                border: `2px solid ${cell.isRed ? 'rgba(239,68,68,0.5)' : 'rgba(245,158,11,0.3)'}`,
                color: cell.isRed ? '#f87171' : '#fbbf24', fontSize: '18px', fontWeight: 700,
                outline: 'none', fontStyle: 'italic',
              }}
              onFocus={e => { e.target.style.borderColor = cell.isRed ? 'rgba(239,68,68,0.8)' : 'rgba(245,158,11,0.8)'; }}
              onBlur={e => { e.target.style.borderColor = cell.isRed ? 'rgba(239,68,68,0.5)' : 'rgba(245,158,11,0.3)'; }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {([0,1,2] as const).map(k => (
              <div key={k}>{digitInput(cell.bottomDigits[k], (v) => {
                const next: [string,string,string] = [...cell.bottomDigits];
                next[k] = v;
                onChange({ ...cell, bottomDigits: next });
              })}</div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <input value={cell.main} placeholder="**"
            onChange={e => onChange({ ...cell, main: e.target.value.slice(0,2) || '**', topDigits: ['*','*','*'], bottomDigits: ['*','*','*'] })}
            style={{
              width: '52px', height: '44px', textAlign: 'center', borderRadius: '8px',
              background: cell.isRed ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.08)',
              border: `2px solid ${cell.isRed ? 'rgba(239,68,68,0.5)' : 'rgba(245,158,11,0.3)'}`,
              color: cell.isRed ? '#f87171' : '#fbbf24', fontSize: '20px', fontWeight: 700,
              outline: 'none', fontStyle: 'italic',
            }}
          />
        </div>
      )}
    </div>
  );
}

/* ── Section Card ── */
function Card({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)',
      border: `1px solid ${accent ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: '16px', padding: '24px',
      boxShadow: accent ? '0 0 0 1px rgba(245,158,11,0.1) inset, 0 8px 32px rgba(0,0,0,0.2)' : '0 8px 32px rgba(0,0,0,0.2)',
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
      <div style={{
        width: 36, height: 36, borderRadius: '10px', background: 'rgba(99,102,241,0.15)',
        border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
      }}>{icon}</div>
      <div>
        <div style={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>{title}</div>
        {subtitle && <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', marginTop: '1px' }}>{subtitle}</div>}
      </div>
    </div>
  );
}

function PrimaryBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button disabled={disabled} onClick={onClick}
      style={{
        padding: '10px 20px', borderRadius: '10px', border: 'none',
        background: disabled ? 'rgba(245,158,11,0.2)' : 'linear-gradient(135deg, #f59e0b, #d97706)',
        color: disabled ? 'rgba(0,0,0,0.4)' : '#000',
        fontWeight: 700, fontSize: '13px', cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : '0 4px 16px rgba(245,158,11,0.35)',
        transition: 'all 0.2s', whiteSpace: 'nowrap',
      }}>
      {children}
    </button>
  );
}

function GhostBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button disabled={disabled} onClick={onClick}
      style={{
        padding: '10px 20px', borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.12)',
        background: 'rgba(255,255,255,0.05)',
        color: disabled ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
        fontWeight: 600, fontSize: '13px', cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s', whiteSpace: 'nowrap',
      }}>
      {children}
    </button>
  );
}

function TextInput({ value, onChange, placeholder, style }: {
  value: string; onChange: (v: string) => void; placeholder?: string; style?: React.CSSProperties;
}) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{
        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '14px', outline: 'none',
        transition: 'border-color 0.2s', ...style,
      }}
      onFocus={e => { e.target.style.borderColor = 'rgba(245,158,11,0.5)'; }}
      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
    />
  );
}

/* ── Main Admin Page ── */
export default function AdminPage() {
  const [authed,       setAuthed]       = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game>(GAMES[0]!);
  const [entryMode,    setEntryMode]    = useState<'panel' | 'jodi'>('panel');
  const [row,          setRow]          = useState<RowInput>(emptyRow);
  const [gameTime,     setGameTime]     = useState('');
  const [bulkText,     setBulkText]     = useState('');
  const [busy,         setBusy]         = useState(false);
  const [toasts,       setToasts]       = useState<Toast[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  function toast(msg: string, type: Toast['type'] = 'info') {
    const id = ++_toastId;
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }

  useEffect(() => { if (sessionStorage.getItem('admin_authed') === '1') setAuthed(true); }, []);

  useEffect(() => {
    if (!authed) return;
    setGameTime('');
    fetch(`/api/${selectedGame.slug}/settings`)
      .then(r => r.json())
      .then((d: { time?: string }) => { if (d.time) setGameTime(d.time); })
      .catch(() => setGameTime(selectedGame.defaultTime));
  }, [authed, selectedGame]);

  const switchGame = (g: Game) => { setSelectedGame(g); setRow(emptyRow()); };

  async function saveTime() {
    setBusy(true);
    try {
      const res = await fetch(`/api/${selectedGame.slug}/settings`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ time: gameTime }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      toast(`${selectedGame.label} time saved`, 'success');
    } catch (e) { toast(e instanceof Error ? e.message : 'Error', 'error'); }
    finally { setBusy(false); }
  }

  async function submitSingle() {
    setBusy(true);
    try {
      const res = await fetch('/api/chart-rows', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...row, gameId: selectedGame.id }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      toast('Row saved successfully ✓', 'success'); setRow(emptyRow());
    } catch (e) { toast(e instanceof Error ? e.message : 'Error', 'error'); }
    finally { setBusy(false); }
  }

  async function submitBulk() {
    setBusy(true);
    try {
      const rows = parseBulkText(bulkText);
      const res  = await fetch('/api/chart-rows/bulk', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ gameId: selectedGame.id, rows }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      toast(`Bulk upload complete — ${rows.length} rows`, 'success');
    } catch (e) { toast(e instanceof Error ? e.message : 'Error', 'error'); }
    finally { setBusy(false); }
  }

  async function seedGame() {
    if (!confirm(`Seed all historical data for ${selectedGame.label}? Existing records will be replaced.`)) return;
    setBusy(true); toast(`Seeding ${selectedGame.label}…`, 'info');
    try {
      const res = await fetch(`/api/${selectedGame.slug}/seed`, { method: 'POST' });
      const data = (await res.json()) as { ok?: boolean; total?: number; error?: string; message?: string };
      if (!res.ok) throw new Error(data.error ?? 'Seed failed');
      toast(data.message ?? `Seed complete — ${data.total ?? 0} rows inserted`, 'success');
    } catch (e) { toast(e instanceof Error ? e.message : 'Seed failed', 'error'); }
    finally { setBusy(false); }
  }

  const examplePanel = `07/01/2025,13/01/2025,125-85-129,236-31-348,r:479-77-156,128-21-236,345-23-679,014-56-789,247-**-***`;
  const exampleJodi  = `07/01/2025,13/01/2025,85,31,77,21,60,56,**`;

  if (!authed) return <LoginGate onAuth={() => setAuthed(true)} />;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a3e 40%, #0d1117 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#fff',
    }}>
      {/* Ambient orbs */}
      <div style={{ position: 'fixed', top: '5%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(99,102,241,0.06)', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '10%', left: '5%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(245,158,11,0.05)', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto', padding: '0 16px 40px' }}>

        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 0 24px',
          borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '28px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: 42, height: 42, borderRadius: '12px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
              boxShadow: '0 4px 16px rgba(245,158,11,0.3)',
            }}>⚡</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.3px' }}>Admin Panel</div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>DpBoss Management</div>
            </div>
          </div>
          <button onClick={() => { sessionStorage.removeItem('admin_authed'); setAuthed(false); }}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(239,68,68,0.08)', color: 'rgba(248,113,113,0.8)',
              fontWeight: 600, fontSize: '13px', cursor: 'pointer',
            }}>
            Sign Out
          </button>
        </div>

        {/* ── Game Tabs ── */}
        <div style={{
          display: 'flex', gap: '8px', marginBottom: '28px',
          background: 'rgba(255,255,255,0.04)', borderRadius: '14px', padding: '6px',
          border: '1px solid rgba(255,255,255,0.06)', width: 'fit-content',
        }}>
          {GAMES.map(g => (
            <button key={g.id} onClick={() => switchGame(g)}
              style={{
                padding: '10px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: '14px', transition: 'all 0.2s',
                background: selectedGame.id === g.id
                  ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                  : 'transparent',
                color: selectedGame.id === g.id ? '#fff' : 'rgba(255,255,255,0.4)',
                boxShadow: selectedGame.id === g.id ? '0 4px 16px rgba(99,102,241,0.4)' : 'none',
              }}>
              {g.icon} {g.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* ── Time Setting ── */}
          <Card>
            <SectionTitle icon="⏰" title="Game Time Setting" subtitle={`Current schedule for ${selectedGame.label}`} />
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <TextInput value={gameTime} onChange={setGameTime}
                placeholder={selectedGame.defaultTime}
                style={{ flex: '1', minWidth: '200px' }} />
              <PrimaryBtn onClick={() => void saveTime()} disabled={busy}>Save Time</PrimaryBtn>
            </div>
          </Card>

          {/* ── Add Weekly Row ── */}
          <Card>
            <SectionTitle icon="📊" title="Add Weekly Row" subtitle="Enter panel or jodi data for a single week" />

            {/* Mode toggle */}
            <div style={{
              display: 'flex', gap: '6px', marginBottom: '20px',
              background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '4px', width: 'fit-content',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              {(['panel', 'jodi'] as const).map(m => (
                <button key={m} onClick={() => setEntryMode(m)}
                  style={{
                    padding: '7px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px',
                    background: entryMode === m ? 'rgba(99,102,241,0.8)' : 'transparent',
                    color: entryMode === m ? '#fff' : 'rgba(255,255,255,0.35)',
                    transition: 'all 0.2s',
                  }}>
                  {m === 'panel' ? '🎰 Panel' : '🎯 Jodi'}
                </button>
              ))}
            </div>

            {/* Date range */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Start Date</div>
                <TextInput value={row.startDate} onChange={v => setRow(r => ({ ...r, startDate: v }))}
                  placeholder="02/06/2025" style={{ width: '100%', boxSizing: 'border-box' }} />
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>End Date</div>
                <TextInput value={row.endDate} onChange={v => setRow(r => ({ ...r, endDate: v }))}
                  placeholder="08/06/2025" style={{ width: '100%', boxSizing: 'border-box' }} />
              </div>
            </div>

            {/* 7 cells */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '10px', marginBottom: '20px' }}>
              {row.cells.map((c, idx) => (
                <CellEditor key={idx} cell={c} idx={idx} mode={entryMode}
                  onChange={updated => setRow(r => { const next = [...r.cells]; next[idx] = updated; return { ...r, cells: next }; })} />
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <PrimaryBtn onClick={() => void submitSingle()} disabled={busy}>Save Row</PrimaryBtn>
              <GhostBtn onClick={() => { setRow(emptyRow()); }} disabled={busy}>Clear</GhostBtn>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', marginLeft: '4px' }}>
                {entryMode === 'panel' ? 'Left 3 digits · jodi · Right 3 digits' : 'Main jodi only per day'}
              </span>
            </div>
          </Card>

          {/* ── Bulk Upload ── */}
          <Card>
            <SectionTitle icon="📁" title="Bulk Upload" subtitle="Paste or upload multiple weeks at once" />

            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '14px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', lineHeight: 1.8 }}>
                <div>Format: <code style={{ color: '#fbbf24', background: 'rgba(245,158,11,0.1)', padding: '1px 6px', borderRadius: '4px' }}>startDate,endDate,day1,...,day7</code></div>
                <div>Panel cell: <code style={{ color: '#a5b4fc', background: 'rgba(99,102,241,0.1)', padding: '1px 6px', borderRadius: '4px' }}>123-45-678</code> · Red: <code style={{ color: '#a5b4fc', background: 'rgba(99,102,241,0.1)', padding: '1px 6px', borderRadius: '4px' }}>r:123-45-678</code></div>
                <div>Jodi cell: <code style={{ color: '#a5b4fc', background: 'rgba(99,102,241,0.1)', padding: '1px 6px', borderRadius: '4px' }}>45</code> · Empty: <code style={{ color: '#a5b4fc', background: 'rgba(99,102,241,0.1)', padding: '1px 6px', borderRadius: '4px' }}>**</code></div>
              </div>
            </div>

            <textarea value={bulkText} onChange={e => setBulkText(e.target.value)}
              placeholder="Paste weekly rows here…"
              style={{
                width: '100%', height: '160px', boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px', padding: '14px', color: '#e2e8f0',
                fontSize: '12px', fontFamily: 'monospace', lineHeight: 1.6,
                outline: 'none', resize: 'vertical', marginBottom: '14px',
              }} />

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <PrimaryBtn onClick={() => void submitBulk()} disabled={busy || !bulkText.trim()}>Upload Bulk</PrimaryBtn>
              <input ref={fileRef} type="file" accept=".csv,.txt,text/csv,text/plain" style={{ display: 'none' }}
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  f.text().then(t => { setBulkText(t); toast(`Loaded: ${f.name}`, 'info'); }).catch(() => {});
                  e.target.value = '';
                }} />
              <GhostBtn onClick={() => fileRef.current?.click()} disabled={busy}>📂 Choose File</GhostBtn>
              <GhostBtn onClick={() => downloadText(`${selectedGame.slug}-panel.csv`, examplePanel)} disabled={busy}>↓ Panel Template</GhostBtn>
              <GhostBtn onClick={() => downloadText(`${selectedGame.slug}-jodi.csv`, exampleJodi)} disabled={busy}>↓ Jodi Template</GhostBtn>
            </div>
          </Card>

          {/* ── Seed Historical Data ── */}
          <Card accent>
            <SectionTitle icon="🗄️" title="Seed Historical Data" subtitle={`Replaces all ${selectedGame.label} records from data/${selectedGame.slug}.json`} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <button disabled={busy} onClick={() => void seedGame()}
                style={{
                  padding: '10px 20px', borderRadius: '10px', border: '1px solid rgba(245,158,11,0.4)',
                  background: 'rgba(245,158,11,0.08)', color: '#fbbf24',
                  fontWeight: 700, fontSize: '13px', cursor: busy ? 'not-allowed' : 'pointer',
                  opacity: busy ? 0.5 : 1, transition: 'all 0.2s',
                }}>
                🚀 Seed {selectedGame.label}
              </button>
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px' }}>
                Warning: deletes existing records before inserting
              </span>
            </div>
          </Card>

        </div>
      </div>

      <ToastStack toasts={toasts} onDismiss={id => setToasts(t => t.filter(x => x.id !== id))} />
    </div>
  );
}
