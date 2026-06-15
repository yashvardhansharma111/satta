import { NextResponse } from 'next/server';

import { connectToMongo } from '@/lib/mongodb';
import { ChartRowModel } from '@/models/ChartRow';
import { GameSettingsModel } from '@/models/GameSettings';

export async function GET() {
  try {
    await connectToMongo();

    const now       = new Date();
    const todayUTC  = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const yesterday = new Date(todayUTC);
    yesterday.setUTCDate(todayUTC.getUTCDate() - 1);

    const [todayRow, yestRow, settings] = await Promise.all([
      ChartRowModel.findOne({ gameId: 'LAXMI_NIGHT', startDate: { $lte: todayUTC }, endDate: { $gte: todayUTC } }).lean(),
      ChartRowModel.findOne({ gameId: 'LAXMI_NIGHT', startDate: { $lte: yesterday }, endDate: { $gte: yesterday } }).lean(),
      GameSettingsModel.findOne({ gameId: 'LAXMI_NIGHT' }).lean(),
    ]);

    const gameTime = settings?.time ?? '7:30 PM - 8:30 PM';

    function dayIndex(d: Date): number {
      const raw = d.getUTCDay();
      return raw === 0 ? 6 : raw - 1;
    }

    function getResult(row: typeof todayRow, date: Date) {
      if (!row) return { number: null, open: null, close: null };
      const cell = row.cells[dayIndex(date)];
      if (!cell) return { number: null, open: null, close: null };
      const v = cell.main.trim();
      if (v === '**' || v === '*' || v === '') return { number: null, open: null, close: null };
      const isDigit = (d: string) => /^\d$/.test(d.trim());
      const topOk = cell.topDigits.every(isDigit);
      const botOk = cell.bottomDigits.every(isDigit);
      return {
        number: v.padStart(2, '0'),
        open:   topOk ? cell.topDigits.join('') : null,
        close:  botOk ? cell.bottomDigits.join('') : null,
      };
    }

    const todayRes = getResult(todayRow,  todayUTC);
    const yestRes  = getResult(yestRow,   yesterday);

    return NextResponse.json({
      status: 'success',
      data: {
        id:   'laxmi-night',
        name: 'LAXMI NIGHT',
        time: gameTime,
        today_result:     { ...todayRes, date: todayUTC.toISOString().slice(0, 10) },
        yesterday_result: { ...yestRes,  date: yesterday.toISOString().slice(0, 10) },
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const stack   = e instanceof Error ? e.stack : undefined;
    console.error('[laxmi-night/latest] ERROR:', message, stack);
    return NextResponse.json({ error: message, stack }, { status: 400 });
  }
}
