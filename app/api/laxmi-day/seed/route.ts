import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

import { connectToMongo } from '@/lib/mongodb';
import { ChartRowModel } from '@/models/ChartRow';

type SeedCell = {
  topDigits: [string, string, string];
  main: string;
  bottomDigits: [string, string, string];
  isRed: boolean;
};

type SeedRow = {
  startDate: string;
  endDate: string;
  cells: SeedCell[];
};

function parseISO(value: string): Date {
  const d = new Date(value + 'T00:00:00Z');
  if (Number.isNaN(d.getTime())) throw new Error(`Invalid date: ${value}`);
  return d;
}

export async function POST() {
  try {
    await connectToMongo();

    const dataPath = path.join(process.cwd(), 'data', 'laxmi-day.json');
    const raw      = fs.readFileSync(dataPath, 'utf-8');
    const seed     = JSON.parse(raw) as { gameId: string; rows: SeedRow[] };

    const ops = seed.rows.map((r) => {
      const startDate = parseISO(r.startDate);
      const endDate   = parseISO(r.endDate);
      return {
        updateOne: {
          filter: { gameId: seed.gameId, startDate, endDate },
          update: {
            $set: { gameId: seed.gameId, startDate, endDate, cells: r.cells },
          },
          upsert: true,
        },
      };
    });

    const result = await ChartRowModel.bulkWrite(ops, { ordered: false });

    return NextResponse.json({
      ok:       true,
      total:    seed.rows.length,
      upserted: result.upsertedCount,
      modified: result.modifiedCount,
      matched:  result.matchedCount,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const stack   = e instanceof Error ? e.stack : undefined;
    console.error('[laxmi-day/seed] ERROR:', message, stack);
    return NextResponse.json({ error: message, stack }, { status: 400 });
  }
}
