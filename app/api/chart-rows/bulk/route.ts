import { NextResponse } from 'next/server';

import { connectToMongo } from '@/lib/mongodb';
import { ChartRowModel } from '@/models/ChartRow';

type IncomingCell = {
  topDigits: [string | number, string | number, string | number];
  main: string | number;
  bottomDigits: [string | number, string | number, string | number];
  isRed: boolean;
};

type NormalizedCell = {
  topDigits: [string, string, string];
  main: string;
  bottomDigits: [string, string, string];
  isRed: boolean;
};

type IncomingRow = {
  startDate: string;
  endDate: string;
  cells: IncomingCell[];
};

type NormalizedRow = {
  startDate: string;
  endDate: string;
  cells: NormalizedCell[];
};

function parseDate(value: string): Date {
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

function normalizeCell(cell: IncomingCell): NormalizedCell {
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

function validateAndNormalizeRow(row: IncomingRow): NormalizedRow {
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

export async function POST(req: Request) {
  try {
    await connectToMongo();

    const body = (await req.json()) as { rows: IncomingRow[] };
    if (!body?.rows || !Array.isArray(body.rows)) {
      throw new Error('Body must be: { rows: IncomingRow[] }');
    }

    if (body.rows.length === 0) {
      return NextResponse.json({ upserted: 0 });
    }

    console.log(`[chart-rows/bulk] received rows: ${body.rows.length}`);

    const ops = body.rows.map((r, idx) => {
      let normalized: NormalizedRow;
      try {
        normalized = validateAndNormalizeRow(r);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Invalid row';
        throw new Error(`Row ${idx + 1}: ${msg}`);
      }

      const startDate = parseDate(normalized.startDate);
      const endDate = parseDate(normalized.endDate);

      return {
        updateOne: {
          filter: { startDate, endDate },
          update: {
            $set: {
              startDate,
              endDate,
              cells: normalized.cells,
            },
          },
          upsert: true,
        },
      };
    });

    const result = await ChartRowModel.bulkWrite(ops, { ordered: false });

    console.log('[chart-rows/bulk] bulkWrite result', {
      inserted: result.insertedCount,
      upserted: result.upsertedCount,
      modified: result.modifiedCount,
      matched: result.matchedCount,
    });

    return NextResponse.json({
      inserted: result.insertedCount,
      upserted: result.upsertedCount,
      modified: result.modifiedCount,
      matched: result.matchedCount,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';

    try {
      const preview = await req.clone().text();
      console.error('[chart-rows/bulk] error:', message);
      console.error('[chart-rows/bulk] request body preview:', preview.slice(0, 2000));
    } catch {
      console.error('[chart-rows/bulk] error:', message);
    }

    return NextResponse.json(
      {
        error: message,
      },
      { status: 400 }
    );
  }
}
