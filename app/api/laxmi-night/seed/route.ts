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

    const dataPath = path.join(process.cwd(), 'data', 'laxmi-night.json');
    const raw      = fs.readFileSync(dataPath, 'utf-8');
    const seed     = JSON.parse(raw) as { gameId: string; rows: SeedRow[] };

    await ChartRowModel.deleteMany({ gameId: seed.gameId });

    const docs = seed.rows.map((r) => ({
      gameId:    seed.gameId,
      startDate: parseISO(r.startDate),
      endDate:   parseISO(r.endDate),
      cells:     r.cells,
    }));

    await ChartRowModel.insertMany(docs, { ordered: false });

    return NextResponse.json({ ok: true, total: docs.length });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const stack   = e instanceof Error ? e.stack : undefined;
    console.error('[laxmi-night/seed] ERROR:', message, stack);
    return NextResponse.json({ error: message, stack }, { status: 400 });
  }
}
