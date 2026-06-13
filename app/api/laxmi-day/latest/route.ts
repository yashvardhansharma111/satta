import { NextResponse } from 'next/server';

import { connectToMongo } from '@/lib/mongodb';
import { ChartRowModel } from '@/models/ChartRow';

/* Returns today's and yesterday's jodi for LAXMI DAY, matching the SattaGame shape used on home page */
export async function GET() {
  try {
    await connectToMongo();

    const now       = new Date();
    const todayUTC  = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const yesterday = new Date(todayUTC);
    yesterday.setUTCDate(todayUTC.getUTCDate() - 1);

    // Find the week row that contains today
    const todayRow = await ChartRowModel.findOne({
      gameId:    'LAXMI_DAY',
      startDate: { $lte: todayUTC },
      endDate:   { $gte: todayUTC },
    }).lean();

    // Find the week row that contains yesterday
    const yestRow = await ChartRowModel.findOne({
      gameId:    'LAXMI_DAY',
      startDate: { $lte: yesterday },
      endDate:   { $gte: yesterday },
    }).lean();

    function dayIndex(d: Date): number {
      // 0=Mon…6=Sun
      const raw = d.getUTCDay(); // 0=Sun…6=Sat
      return raw === 0 ? 6 : raw - 1;
    }

    function getJodi(row: typeof todayRow, date: Date): string | null {
      if (!row) return null;
      const idx  = dayIndex(date);
      const cell = row.cells[idx];
      if (!cell) return null;
      const v = cell.main.trim();
      if (v === '**' || v === '*' || v === '') return null;
      return v.padStart(2, '0');
    }

    const todayJodi  = getJodi(todayRow,  todayUTC);
    const yestJodi   = getJodi(yestRow,   yesterday);
    const todayDate  = todayUTC.toISOString().slice(0, 10);
    const yestDate   = yesterday.toISOString().slice(0, 10);

    return NextResponse.json({
      status: 'success',
      data: {
        id:   'laxmi-day',
        name: 'LAXMI DAY',
        time: '12:00 PM - 02:00 PM',
        today_result:     { number: todayJodi,  date: todayDate },
        yesterday_result: { number: yestJodi,   date: yestDate },
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const stack   = e instanceof Error ? e.stack : undefined;
    console.error('[laxmi-day/latest] ERROR:', message, stack);
    return NextResponse.json({ error: message, stack }, { status: 400 });
  }
}
