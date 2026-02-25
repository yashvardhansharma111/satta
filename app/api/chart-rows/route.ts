import { NextResponse } from 'next/server';

import { connectToMongo } from '@/lib/mongodb';
import { ChartRowModel } from '@/models/ChartRow';

type IncomingCell = {
  topDigits: [string | number, string | number, string | number];
  main: string | number;
  bottomDigits: [string | number, string | number, string | number];
  isRed: boolean;
};

type IncomingRow = {
  startDate: string;
  endDate: string;
  cells: IncomingCell[];
};

function parseDate(value: string): Date {
  // Accept ISO or dd/mm/yyyy
  const v = value.trim();

  if (/^\d{4}-\d{2}-\d{2}/.test(v)) {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d;
  }

  const normalized = v.replace(/-/g, '/');
  const m = normalized.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) {
    const dd = Number(m[1]);
    const mm = Number(m[2]);
    const yyyy = Number(m[3]);
    const d = new Date(Date.UTC(yyyy, mm - 1, dd));
    if (!Number.isNaN(d.getTime())) return d;
  }

  throw new Error(`Invalid date format: ${value}`);
}

function normalizeCell(cell: IncomingCell) {
  const toStr = (x: string | number) => String(x).trim();

  const topDigits = [toStr(cell.topDigits[0]), toStr(cell.topDigits[1]), toStr(cell.topDigits[2])] as [
    string,
    string,
    string,
  ];
  const bottomDigits = [
    toStr(cell.bottomDigits[0]),
    toStr(cell.bottomDigits[1]),
    toStr(cell.bottomDigits[2]),
  ] as [string, string, string];
  const main = toStr(cell.main);

  return { topDigits, main, bottomDigits, isRed: Boolean(cell.isRed) };
}

function validateAndNormalizeRow(row: IncomingRow) {
  if (!row.startDate || !row.endDate) throw new Error('startDate and endDate are required');
  if (!Array.isArray(row.cells) || row.cells.length !== 7) {
    throw new Error('cells must be an array of length 7');
  }
  const cells = row.cells.map((cell) => {
    if (!Array.isArray(cell.topDigits) || cell.topDigits.length !== 3) {
      throw new Error('each cell.topDigits must be length 3');
    }
    if (!Array.isArray(cell.bottomDigits) || cell.bottomDigits.length !== 3) {
      throw new Error('each cell.bottomDigits must be length 3');
    }
    if (typeof cell.isRed !== 'boolean') {
      throw new Error('each cell.isRed must be boolean');
    }

    const normalized = normalizeCell(cell);
    if (normalized.main.length === 0) throw new Error('each cell.main must be non-empty');
    return normalized;
  });

  return { ...row, startDate: row.startDate.trim(), endDate: row.endDate.trim(), cells };
}

export async function GET(req: Request) {
  try {
    await connectToMongo();

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get('limit') ?? '200'), 2000);
    const skip = Math.max(Number(searchParams.get('skip') ?? '0'), 0);
    const sort = searchParams.get('sort') === 'asc' ? 1 : -1;

    const rows = await ChartRowModel.find({})
      .sort({ startDate: sort })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({ rows });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToMongo();

    const body = (await req.json()) as IncomingRow;
    const normalized = validateAndNormalizeRow(body);

    const startDate = parseDate(normalized.startDate);
    const endDate = parseDate(normalized.endDate);

    const row = await ChartRowModel.findOneAndUpdate(
      { startDate, endDate },
      {
        $set: {
          startDate,
          endDate,
          cells: normalized.cells,
        },
      },
      { upsert: true, new: true }
    ).lean();

    return NextResponse.json({ row });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
